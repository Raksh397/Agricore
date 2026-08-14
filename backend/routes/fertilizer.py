from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import pickle
from ..utils.fertilizer_info import fertilizer_dic
from ..utils.fertilizer_i18n import fertilizer_i18n
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data/fertilizer.csv")
CLASSIFIER_PATH = os.path.join(BASE_DIR, "models/FertilizerClassifier.pkl")

_classifier = None
if os.path.exists(CLASSIFIER_PATH):
    _classifier = pickle.load(open(CLASSIFIER_PATH, "rb"))


class FertilizerInput(BaseModel):
    crop: str
    nitrogen: int
    phosphorus: int
    potassium: int
    lang: str = "en"
    soil_type: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    moisture: Optional[float] = None


def _suggest_product(data: "FertilizerInput"):
    """Optional: suggest a named fertilizer product using the trained classifier,
    when soil/weather fields are provided and the crop is in its training set."""
    if _classifier is None or not data.soil_type:
        return None
    crop_key = data.crop.strip().replace("Black Gram", "Blackgram").title()
    if crop_key not in _classifier["crops"]:
        return None
    try:
        soil_enc = _classifier["encoders"]["soil_type"].transform([data.soil_type.strip().title()])[0]
        crop_enc = _classifier["encoders"]["crop_type"].transform([crop_key])[0]
        row = [[
            data.temperature if data.temperature is not None else 28,
            data.humidity if data.humidity is not None else 60,
            data.moisture if data.moisture is not None else 40,
            data.nitrogen, data.potassium, data.phosphorus,
            soil_enc, crop_enc,
        ]]
        return _classifier["model"].predict(row)[0]
    except Exception:
        return None

def _normalize_crop(name: str) -> str:
    # "Kidney Beans" -> "kidneybeans", "Pigeon Peas" -> "pigeonpeas"
    return name.lower().replace(" ", "").replace("-", "").strip()

@router.post("/recommend-fertilizer")
def recommend_fertilizer(data: FertilizerInput):
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=500, detail="Fertilizer data not found.")

    try:
        df = pd.read_csv(CSV_PATH)

        # Case/space insensitive match ("Kidney Beans" matches "kidneybeans")
        crop_key = _normalize_crop(data.crop)
        crop_data = df[df['Crop'].str.lower().str.replace(" ", "", regex=False) == crop_key]
        if crop_data.empty:
             raise HTTPException(status_code=404, detail=f"Crop '{data.crop}' not found in database. Please check the spelling.")

        mr = crop_data.iloc[0]
        nr = mr['N']
        pr = mr['P']
        kr = mr['K']

        # Exact dose calculation (kg/ha): deficit x fertilizer nutrient content
        # Urea = 46% N, DAP = 46% P2O5, MOP = 60% K2O
        def dose(deficit, pct):
            return round(max(0, deficit) / pct, 1)
        doses = {
            "urea_kg_ha": dose(nr - data.nitrogen, 0.46),
            "dap_kg_ha": dose(pr - data.phosphorus, 0.46),
            "mop_kg_ha": dose(kr - data.potassium, 0.60),
            "ideal_npk": f"{nr}:{pr}:{kr}",
            "your_npk": f"{data.nitrogen}:{data.phosphorus}:{data.potassium}",
        }

        n_diff = nr - data.nitrogen
        p_diff = pr - data.phosphorus
        k_diff = kr - data.potassium

        abs_diffs = {abs(n_diff): "N", abs(p_diff): "P", abs(k_diff): "K"}
        max_diff = max(abs_diffs.keys())
        nutrient = abs_diffs[max_diff]

        lang = data.lang if data.lang in fertilizer_i18n else "en"
        loc = fertilizer_i18n.get(lang, {})

        # Soil is already close to the ideal NPK for this crop
        if max_diff <= 5:
            if lang != "en" and "balanced" in loc:
                recommendation = loc["balanced"]
                status_label = loc["status"]["Balanced"]
                nutrient_label = loc["nutrient"]["None"]
            else:
                recommendation = (f"Your soil's N, P and K levels are well balanced for {data.crop}. "
                                  "No corrective fertilizer is needed — maintain current practices and "
                                  "re-test the soil each season.")
                status_label = "Balanced"
                nutrient_label = "None"
            return {
                "recommendation": recommendation,
                "doses": doses,
                "analysis": {"nutrient_focus": "None", "status": "Balanced",
                             "status_label": status_label, "nutrient_label": nutrient_label},
                "suggested_product": _suggest_product(data),
            }

        key = ""
        if nutrient == "N":
            key = 'NHigh' if n_diff < 0 else 'Nlow'
        elif nutrient == "P":
            key = 'PHigh' if p_diff < 0 else 'Plow'
        else:
            key = 'KHigh' if k_diff < 0 else 'Klow'

        status = "High" if key.endswith("High") else "Low"

        if lang != "en" and key in loc:
            recommendation = loc[key]
            status_label = loc["status"][status]
            nutrient_label = loc["nutrient"][nutrient]
        else:
            recommendation = fertilizer_dic.get(key, "No recommendation available.")
            status_label = status
            nutrient_label = nutrient

        return {
            "recommendation": recommendation,
            "doses": doses,
            "analysis": {
                "nutrient_focus": nutrient,
                "status": status,
                "status_label": status_label,
                "nutrient_label": nutrient_label
            },
            "suggested_product": _suggest_product(data),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
