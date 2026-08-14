from fastapi import APIRouter, UploadFile, File, HTTPException
import torch
import torch.nn as nn
from torchvision import transforms
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

# Confidence gating thresholds for /predict-disease. A prediction is only reported
# as an actual disease when the top probability clears CONF_MIN *and* leads the
# second-best class by at least MARGIN_MIN.
CONF_MIN = 0.75
MARGIN_MIN = 0.15

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODELS = os.path.join(BASE_DIR, "models")

# The expanded model (91 classes, trained by devtools/train_expanded.ipynb) is used
# when it has been dropped in; otherwise we fall back to the original 38-class one.
# Both are the same ResNet9, and the head is sized from the class list at load time,
# so swapping the two files is all that is needed to switch.
_EXPANDED = (os.path.join(_MODELS, "plant_disease_model_v2.pth"),
             os.path.join(_MODELS, "class_indices_v2.json"))
_BASE = (os.path.join(_MODELS, "plant_disease_model.pth"),
         os.path.join(_MODELS, "class_indices.json"))

MODEL_PATH, CLASS_INDICES_PATH = _EXPANDED if all(map(os.path.exists, _EXPANDED)) else _BASE


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

# Load Model & Class Indices
if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_INDICES_PATH):
    try:
        with open(CLASS_INDICES_PATH, 'r') as f:
            indices = json.load(f)
            # ordered list: index -> class_name
            class_names = [k for k, v in sorted(indices.items(), key=lambda x: x[1])]

        model = ResNet9(3, len(class_names))
        model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
        model.eval()
        print("Disease prediction model loaded successfully (ResNet9 / PyTorch).")
    except Exception as e:
        print(f"Error loading model or class indices: {e}")
        model = None
else:
    print(f"Warning: Model or Class Indices not found. Checked: {MODEL_PATH}, {CLASS_INDICES_PATH}")

# Same preprocessing the model was trained with
_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])


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

        # Confidence gating: only name a disease when the model is genuinely sure.
        # Two conditions must both hold — a high absolute probability AND a clear
        # margin over the runner-up class. A confident-looking softmax score with a
        # near-tied second guess means the model is really undecided between two
        # look-alike diseases, so we say "not sure" instead of guessing wrong.
        conf = confidence.item()
        margin = conf - (top3_p[0][1].item() if top3_p.shape[1] > 1 else 0.0)
        sure = conf >= CONF_MIN and margin >= MARGIN_MIN

        if not sure:
            return {
                "crop": crop_name if conf >= 0.35 else None,
                "disease": None,
                "confidence": round(conf * 100, 2),
                "recommendation": None,
                "top3": top3,
                "uncertain": True,
                "low_confidence": True,
                "message": ("Not confident enough to name a disease. Retake the photo: fill the "
                            "frame with a single affected leaf, in daylight, with a plain background."),
            }

        return {
            "crop": crop_name,
            "disease": disease_name,
            "confidence": round(conf * 100, 2),
            "recommendation": description,
            "top3": top3,
            "uncertain": False,
            "low_confidence": False,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
