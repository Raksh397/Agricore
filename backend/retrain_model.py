import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os

# Define paths
DATA_PATH = "../Data-processed/crop_recommendation.csv"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "RandomForest.pkl")

# Ensure model directory exists
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

print(f"Loading data from {DATA_PATH}...")
try:
    df = pd.read_csv(DATA_PATH)
except FileNotFoundError:
    # Try looking in current directory if running from backend
    DATA_PATH = "../Data-processed/crop_recommendation.csv"
    if not os.path.exists(DATA_PATH):
        # Maybe we are in root
        DATA_PATH = "Data-processed/crop_recommendation.csv"
    
    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
    else:
        print("Error: Could not find dataset.")
        exit(1)

print("Data loaded successfully.")
print(f"Columns: {df.columns.tolist()}")

# Features and Target
# N,P,K,temperature,humidity,ph,rainfall,label
# Note: The original backend code had shuffled the order of ph and rainfall.
# We will stick to the CSV order: N, P, K, Temp, Humidity, pH, Rainfall.
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

print("Training RandomForest Classifier...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=20, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model trained. Accuracy: {accuracy:.4f}")

print(f"Saving model to {MODEL_PATH}...")
pickle.dump(model, open(MODEL_PATH, 'wb'))
print("Model saved successfully.")
