from fastapi import APIRouter, HTTPException
import pickle
import numpy as np
from pydantic import BaseModel
import os

router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models/RandomForest.pkl")
model = None

if os.path.exists(MODEL_PATH):
    try:
        model = pickle.load(open(MODEL_PATH, 'rb'))
        print("Crop recommendation model loaded.")
    except Exception as e:
        print(f"Error loading crop model: {e}")
else:
    print(f"Warning: Crop model not found at {MODEL_PATH}")

class CropInput(BaseModel):
    nitrogen: int
    phosphorus: int
    potassium: int
    temperature: float
    humidity: float
    rainfall: float
    ph: float = 6.5 

@router.post("/recommend-crop")
def recommend_crop(data: CropInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Crop model is not loaded.")
    
    try:
        features = np.array([[
            data.nitrogen,
            data.phosphorus,
            data.potassium,
            data.temperature,
            data.humidity,
            data.ph,
            data.rainfall
        ]])

        if features.shape[1] != model.n_features_in_:
            raise HTTPException(
                status_code=500,
                detail=f"Model expects {model.n_features_in_} features, got {features.shape[1]}"
            )

        prediction = model.predict(features)

        if len(prediction) > 0:
            crop = str(prediction[0])
        else:
             crop = "Unknown"

        return {"recommended_crops": [crop]}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
