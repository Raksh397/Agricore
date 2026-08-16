"""Retrain the crop recommendation model from dataset/processed/crop_recommendation.
Features (in the order the API sends): N,P,K,temperature,humidity,ph,rainfall -> crop.
Saves backend/models/RandomForest.pkl (backs up the old one).
"""
import os, pickle, shutil
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "dataset/processed/crop_recommendation/crop_recommendation.csv")
MODEL = os.path.join(BASE, "backend/models/RandomForest.pkl")

FEATURES = ["n", "p", "k", "temperature", "humidity", "ph", "rainfall"]

df = pd.read_csv(DATA)
tr = df[df.split == "train"]; va = df[df.split == "val"]; te = df[df.split == "test"]
Xtr, ytr = tr[FEATURES], tr["crop"]
Xte, yte = te[FEATURES], te["crop"]

clf = RandomForestClassifier(n_estimators=300, max_depth=None, n_jobs=-1, random_state=42)
clf.fit(Xtr, ytr)

acc = accuracy_score(yte, clf.predict(Xte))
print(f"Test accuracy: {acc*100:.2f}%  ({len(te)} test rows, {ytr.nunique()} crops)")
print(classification_report(yte, clf.predict(Xte), zero_division=0)[:600])

if os.path.exists(MODEL):
    shutil.copy(MODEL, MODEL + ".bak")
pickle.dump(clf, open(MODEL, "wb"))
print("Saved ->", MODEL)
