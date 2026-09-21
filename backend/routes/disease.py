from fastapi import APIRouter, UploadFile, File, HTTPException
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import os
import json
from typing import Optional
from pydantic import BaseModel
from ..utils.disease_info import disease_dic
from ..utils.disease_extra import extra_disease_dic
from ..utils.symptom_rules import (
    RULES, PARTS, SIGNS, COLOURS, PATTERNS, diagnose, needs_pattern,
)

router = APIRouter()

# Confidence gating thresholds for /predict-disease.
#
# Real leaf photos from a phone or the internet never look like the clean, single-
# leaf, plain-background PlantVillage training images, so the model's absolute
# softmax score on them is genuinely lower even when the top class is correct.
# The earlier 0.75/0.15 gate was tuned for training-set images and rejected almost
# every real photo with "not confident enough", which is the bug the user hit.
#
# We now always name the model's best guess (the class it actually predicted) and
# use the thresholds only to *flag* how sure to be, never to withhold the answer:
#   - conf >= CONF_MIN and margin >= MARGIN_MIN  -> confident result
#   - REVIEW_MIN <= conf < CONF_MIN              -> tentative result (still shown)
#   - conf < REVIEW_MIN                          -> too little signal / not a leaf
CONF_MIN = 0.55
MARGIN_MIN = 0.08
REVIEW_MIN = 0.20

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODELS = os.path.join(BASE_DIR, "models")

# The v2 model (devtools/train_disease.py) is a transfer-learned ResNet18 trained
# with realistic augmentation + ImageNet normalization — it is used when present;
# otherwise we fall back to the original from-scratch ResNet9. The two need
# DIFFERENT preprocessing, so the architecture is detected from the weights at load
# time (see below) and the matching transform is selected. Dropping the v2 files
# into backend/models/ and restarting is all that is needed to switch.
_EXPANDED = (os.path.join(_MODELS, "plant_disease_model_v2.pth"),
             os.path.join(_MODELS, "class_indices_v2.json"))
_BASE = (os.path.join(_MODELS, "plant_disease_model.pth"),
         os.path.join(_MODELS, "class_indices.json"))

MODEL_PATH, CLASS_INDICES_PATH = _EXPANDED if all(map(os.path.exists, _EXPANDED)) else _BASE

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


# ResNet9 architecture (matches the weights in plant_disease_model.pth)
def ConvBlock(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
              nn.BatchNorm2d(out_channels),
              nn.ReLU(inplace=True)]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)


class ResNet9(nn.Module):
    def __init__(self, in_channels, num_diseases):
        super().__init__()
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))
        self.conv3 = ConvBlock(128, 256, pool=True)
        self.conv4 = ConvBlock(256, 512, pool=True)
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))
        self.classifier = nn.Sequential(nn.MaxPool2d(4),
                                        nn.Flatten(),
                                        nn.Linear(512, num_diseases))

    def forward(self, xb):
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out


# Global variables
model = None
class_names = []
# Preprocessing is chosen to match whichever model actually loaded (set below).
_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])


def _build_resnet18(num_classes):
    net = models.resnet18(weights=None)
    net.fc = nn.Linear(net.fc.in_features, num_classes)
    return net


# Load Model & Class Indices
if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_INDICES_PATH):
    try:
        with open(CLASS_INDICES_PATH, 'r') as f:
            indices = json.load(f)
            # ordered list: index -> class_name
            class_names = [k for k, v in sorted(indices.items(), key=lambda x: x[1])]

        state = torch.load(MODEL_PATH, map_location="cpu")
        # Detect architecture from the weight keys: the transfer-learned v2 model is
        # a torchvision ResNet18 (has "fc.weight" + "layer1..." keys); the original
        # is our custom ResNet9 (has "conv1..."/"classifier..." keys).
        is_resnet18 = "fc.weight" in state and any(k.startswith("layer1.") for k in state)

        if is_resnet18:
            model = _build_resnet18(len(class_names))
            model.load_state_dict(state)
            # Must match training: 224px + ImageNet normalization.
            _transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
            ])
            arch = "ResNet18 (transfer-learned v2, normalized)"
        else:
            model = ResNet9(3, len(class_names))
            model.load_state_dict(state)
            _transform = transforms.Compose([
                transforms.Resize((256, 256)),
                transforms.ToTensor(),
            ])
            arch = "ResNet9 (base)"

        model.eval()
        print(f"Disease prediction model loaded successfully ({arch}, {len(class_names)} classes).")
    except Exception as e:
        print(f"Error loading model or class indices: {e}")
        model = None
else:
    print(f"Warning: Model or Class Indices not found. Checked: {MODEL_PATH}, {CLASS_INDICES_PATH}")


def transform_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")
    return _transform(image).unsqueeze(0)


@router.get("/disease-library")
def disease_library():
    items = []
    for source, scannable in ((disease_dic, True), (extra_disease_dic, False)):
        for key, desc in source.items():
            parts = key.split("___")
            items.append({
                "crop": parts[0].replace("_", " "),
                "disease": (parts[1] if len(parts) > 1 else "?").replace("_", " "),
                "description": desc,
                "scannable": scannable,
            })
    return {"items": items}


@router.get("/symptom-options")
def symptom_options():
    """Vocabulary for the guided questionnaire, plus the crops it can diagnose."""
    crops = sorted({k.split("___")[0].replace("_", " ") for k in RULES})
    return {"crops": crops, "parts": PARTS, "signs": SIGNS,
            "colours": COLOURS, "patterns": PATTERNS}


class SymptomInput(BaseModel):
    crop: Optional[str] = None
    part: Optional[str] = None
    sign: Optional[str] = None
    colour: Optional[str] = None
    pattern: Optional[str] = None


@router.post("/diagnose-symptoms")
def diagnose_symptoms(data: SymptomInput):
    """Symptom-based diagnosis. Covers every disease in the knowledge base,
    including the crops the image model was never trained on."""
    if not any([data.sign, data.colour, data.part]):
        raise HTTPException(status_code=400,
                            detail="Answer at least one question to get a diagnosis.")

    ranked = diagnose(crop=data.crop, part=data.part, sign=data.sign,
                      colour=data.colour, pattern=data.pattern)
    if not ranked:
        return {"results": [], "ask_pattern": False,
                "message": "No match for those symptoms. Try a different combination."}

    out = []
    for r in ranked:
        key = r["class_name"]
        parts = key.split("___")
        out.append({
            "crop": parts[0].replace("_", " "),
            "disease": (parts[1] if len(parts) > 1 else "?").replace("_", " "),
            "match": r["match"],
            "recommendation": disease_dic.get(key) or extra_disease_dic.get(key),
            "scannable": key in disease_dic,
        })

    # Ask the lesion-shape follow-up only when the top matches are too close to
    # separate — no point burdening the farmer with an extra question otherwise.
    ask = data.pattern is None and needs_pattern(ranked)
    return {"results": out, "ask_pattern": ask, "source": "symptoms"}


@router.post("/predict-disease")
async def predict_disease(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Disease model is not loaded.")

    try:
        content = await file.read()
        try:
            img_tensor = transform_image(content)
        except Exception:
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid image. Please upload a JPG or PNG photo of a plant leaf.")

        with torch.no_grad():
            # Test-time augmentation: average predictions over the original,
            # horizontal flip and vertical flip — improves real-photo accuracy
            views = [img_tensor, torch.flip(img_tensor, dims=[3]), torch.flip(img_tensor, dims=[2])]
            probs = torch.stack([torch.softmax(model(v), dim=1) for v in views]).mean(dim=0)
            confidence, predicted_index = torch.max(probs, dim=1)
            top3_p, top3_i = torch.topk(probs, 3, dim=1)

        predicted_class_name = class_names[predicted_index.item()]

        top3 = []
        for p, i in zip(top3_p[0].tolist(), top3_i[0].tolist()):
            n = class_names[i].split("___")
            top3.append({"crop": n[0].replace("_", " "), "disease": (n[1] if len(n) > 1 else "?").replace("_", " "), "confidence": round(p * 100, 2)})

        # Parse result
        parts = predicted_class_name.split("___")
        crop_name = parts[0]
        disease_name = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"

        description = disease_dic.get(predicted_class_name, "No description available.")

        conf = confidence.item()
        margin = conf - (top3_p[0][1].item() if top3_p.shape[1] > 1 else 0.0)

        # Only refuse when there is barely any signal at all — a photo that is not
        # a leaf, or is too blurry/dark for the model to commit to anything. In
        # that case even the top class sits near chance level.
        if conf < REVIEW_MIN:
            # `uncertain` tells the UI to withhold a disease name — reserved for
            # the genuine "this isn't a readable leaf" case only.
            return {
                "crop": None,
                "disease": None,
                "confidence": round(conf * 100, 2),
                "recommendation": None,
                "top3": top3,
                "uncertain": True,
                "low_confidence": True,
                "message": ("Couldn't read a plant leaf in this image. Retake the photo: fill the "
                            "frame with a single affected leaf, in daylight, with a plain background."),
            }

        # Otherwise always name the model's best guess. A high score with a clear
        # margin is a confident result; a lower score or a near-tied runner-up is
        # still shown (disease named) but flagged low_confidence so the UI can add
        # a "double-check against the other matches" note. We never hide the answer
        # behind "less confidence, no result".
        confident = conf >= CONF_MIN and margin >= MARGIN_MIN

        return {
            "crop": crop_name,
            "disease": disease_name,
            "confidence": round(conf * 100, 2),
            "recommendation": description,
            "top3": top3,
            "uncertain": False,
            "low_confidence": not confident,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
