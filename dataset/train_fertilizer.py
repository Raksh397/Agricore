"""Train a fertilizer-name classifier from dataset/processed/fertilizer_prediction.
Input: temp, humidity, moisture, soil_type, crop_type, N, K, P -> fertilizer_name.
Saves backend/models/FertilizerClassifier.pkl with its encoders.
"""
import os, pickle
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "dataset/processed/fertilizer_prediction/fertilizer_prediction.csv")
OUT = os.path.join(BASE, "backend/models/FertilizerClassifier.pkl")

df = pd.read_csv(DATA)
cat = ["soil_type", "crop_type"]
num = ["temparature", "humidity", "moisture", "nitrogen", "potassium", "phosphorous"]
encoders = {c: LabelEncoder().fit(df[c]) for c in cat}
for c in cat:
    df[c] = encoders[c].transform(df[c])

tr = df[df.split == "train"]; te = df[df.split == "test"]
X = num + cat
clf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
clf.fit(tr[X], tr["fertilizer_name"])
acc = accuracy_score(te["fertilizer_name"], clf.predict(te[X]))
print(f"Test accuracy: {acc*100:.2f}%  ({len(te)} rows, {df['fertilizer_name'].nunique()} fertilizers, {encoders['crop_type'].classes_.size} crops)")

pickle.dump({"model": clf, "encoders": encoders, "features": X, "crops": list(encoders["crop_type"].classes_)}, open(OUT, "wb"))
print("Saved ->", OUT)
