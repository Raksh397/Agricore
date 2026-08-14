import os
import sys

# Allow running this file directly as a script from either the backend folder
# or from the repository root using python backend/main.py.
if __package__ is None or __package__ == "":
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from backend.routes import disease, crop, fertilizer, community, chatbot, dataset

app = FastAPI(title="Agricore API", description="Smart farming assistance API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(disease.router, tags=["Disease Prediction"])
app.include_router(crop.router, tags=["Crop Recommendation"])
app.include_router(fertilizer.router, tags=["Fertilizer Recommendation"])
app.include_router(community.router, tags=["Community"])
app.include_router(chatbot.router, tags=["Chatbot"])
app.include_router(dataset.router, tags=["Datasets"])

app.mount("/uploads", StaticFiles(directory=community.UPLOAD_DIR), name="uploads")

@app.get("/")
def home():
    return {"message": "Agricore Backend is running", "status": "active"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
