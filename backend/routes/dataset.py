"""Serves the built dataset collection to the frontend so the UI shows real data
instead of hardcoded lists."""
import os
import pandas as pd
from fastapi import APIRouter, HTTPException

router = APIRouter()

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED = os.path.join(BASE, "dataset", "processed")

_cache = {}


def _load(rel_path):
    if rel_path in _cache:
        return _cache[rel_path]
    full = os.path.join(PROCESSED, rel_path)
    if not os.path.exists(full):
        raise HTTPException(status_code=404, detail=f"Dataset not found: {rel_path}")
    df = pd.read_csv(full)
    _cache[rel_path] = df
    return df


def _records(df):
    """Rows as JSON-safe dicts. NaN/inf are not valid JSON, so replace them
    with None (pandas re-coerces None to NaN in float columns, hence object)."""
    import numpy as np
    clean = df.replace([np.inf, -np.inf], np.nan).astype(object)
    return clean.where(pd.notnull(clean), None).to_dict(orient="records")


@router.get("/dataset/cultivation-guides")
def cultivation_guides():
    """Per-crop growing requirements — powers the Library crops + tips tabs."""
    df = _load("cultivation_guides/cultivation_guides.csv")
    return {"count": len(df), "items": _records(df.drop(columns=["split"], errors="ignore"))}


@router.get("/dataset/crop-yield")
def crop_yield(crop: str = None, state: str = None):
    """State x crop x year average yield (t/ha)."""
    df = _load("crop_yield_india/crop_yield_india.csv")
    if crop:
        df = df[df["crop"].str.lower() == crop.lower()]
    if state:
        df = df[df["state"].str.lower() == state.lower()]
    return {"count": len(df), "items": _records(df.drop(columns=["split"], errors="ignore").head(500))}


@router.get("/dataset/soil-lab")
def soil_lab():
    """Real soil fertility lab measurements (pH, EC, OC, NPK, micronutrients)."""
    df = _load("fertilizer_ideal_npk/soil_fertility_lab_data.csv")
    return {"count": len(df), "items": _records(df.head(200))}


@router.get("/dataset/ideal-npk")
def ideal_npk():
    """Ideal N, P, K and pH per crop."""
    df = _load("fertilizer_ideal_npk/fertilizer_ideal_npk.csv")
    df = df.drop(columns=[c for c in ["split", "unnamed: 0"] if c in df.columns], errors="ignore")
    return {"count": len(df), "items": _records(df)}


@router.get("/dataset/fertilizer-products")
def fertilizer_products():
    """Real fertilizer advisor data — product, dose per acre, instructions, brands."""
    df = _load("fertilizer_prediction/fertilizer_real_advisor_data.csv")
    return {"count": len(df), "items": _records(df)}


@router.get("/dataset/rainfall")
def rainfall(subdivision: str = None):
    """IMD subdivision-wise monthly & annual rainfall, 1901-2015."""
    df = _load("weather_20yr_india/rainfall_india_1901_2015.csv")
    if subdivision:
        df = df[df["subdivision"].str.lower().str.contains(subdivision.lower(), na=False)]
    return {"count": len(df), "items": _records(df.tail(300))}


@router.get("/dataset/market-prices")
def market_prices(state: str = None, limit: int = 200):
    """Historical Agmarknet mandi prices (rice, 2010-2016)."""
    df = _load("market_prices/market_prices.csv")
    if state:
        df = df[df["state"].str.lower().str.contains(state.lower(), na=False)]
    df = df.sort_values("year", ascending=False)
    return {"count": len(df), "items": _records(df.drop(columns=["split"], errors="ignore").head(limit))}


@router.get("/dataset/summary")
def summary():
    """What datasets exist, their row counts and sources — for a Data page."""
    import json
    meta_path = os.path.join(PROCESSED, "metadata.json")
    if not os.path.exists(meta_path):
        return {"datasets": []}
    return {"datasets": json.load(open(meta_path, encoding="utf-8"))}
