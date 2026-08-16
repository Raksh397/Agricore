# Agricore Dataset Collection

Cleaned, deduplicated, standardized, 80/10/10 splits, CSV+JSON+Parquet.

## crop_recommendation
- Rows: 2200 (train 1760/val 220/test 220)
- Source: Harvestify GitHub + gireesh777 GitHub (2 independent sources, merged & deduped) | License: Open (research/edu)
- N,P,K,temp,humidity,pH,rainfall -> best crop (22 crops)
- Columns: n, p, k, temperature, humidity, ph, rainfall, crop, split

## fertilizer_ideal_npk
- Rows: 22 (train 17/val 2/test 3)
- Source: Harvestify (GitHub) | License: Open (research/edu)
- Ideal N,P,K per crop
- Columns: unnamed: 0, crop, n, p, k, ph, soil_moisture, split

## fertilizer_prediction
- Rows: 880 (train 704/val 88/test 88)
- Source: Kaggle Fertilizer Prediction schema (generated w/ agronomy rules) | License: CC0 (synthetic)
- Soil, crop, NPK, temp, humidity, moisture -> fertilizer product name
- Columns: temparature, humidity, moisture, soil_type, crop_type, nitrogen, potassium, phosphorous, fertilizer_name, split

## disease_treatments
- Rows: 71 (train 56/val 7/test 8)
- Source: PlantVillage taxonomy + ICAR/TNAU crop protection guidance (curated) | License: CC BY-SA
- Disease & pest classes with symptoms, favourable conditions and treatment
- Columns: class_name, crop, disease, treatment_html, cnn_scannable, split

## weather_20yr_india
- Rows: 76710 (train 61368/val 7671/test 7671)
- Source: Open-Meteo ERA5 archive | License: CC BY 4.0
- Daily temp, rainfall, humidity 2004-2024 for 10 agri hubs (20+ yrs)
- Columns: time, temperature_2m_mean, precipitation_sum, relative_humidity_2m_mean, city, split

## crop_yield_india
- Rows: 1620 (train 1296/val 162/test 162)
- Source: ICAR productivity norms (compiled) | License: Public domain facts
- State x crop x year average yield t/ha
- Columns: state, crop, crop_year, yield_t_per_ha, season, split

## cultivation_guides
- Rows: 29 (train 23/val 3/test 3)
- Source: ICAR/state agri university guidance (compiled) | License: Public domain facts
- Per-crop growing requirements
- Columns: crop, temperature, rainfall, soil, ph, season, how_to_grow, split

## farmer_faq_rag
- Rows: 32 (train 25/val 3/test 4)
- Source: Agricore curated KB | License: CC0
- Q&A knowledge for RAG/LLM
- Columns: topic, question_keywords, answer, split

## loans_schemes
- Rows: 8 (train 6/val 1/test 1)
- Source: NABARD/RBI/Govt portals (facts) | License: Public domain facts
- Farm loans with rates & eligibility
- Columns: id, title, provider, interest, amount, benefit, eligibility, link, split

## market_prices
- Rows: 599177 (train 479341/val 59918/test 59918)
- Source: Agmarknet (via iancovert/Agmarknet GitHub mirror) | License: OGDL India
- Rice arrivals & min/max/modal price by state/district/market, 2010-2016
- Columns: state, district, market, variety, group, arrivals_tonnes, min_price, max_price, modal_price_rs_per_quintal, date, year, split

## Image datasets (too large to bundle — download for training)
- PlantVillage: 54,305 leaf images, 38 classes — github.com/spMohanty/PlantVillage-Dataset (CC BY-SA)
- PlantDoc: 2,598 real-field images, 27 classes — github.com/pratikkayal/PlantDoc-Dataset (CC BY 4.0)
- Weather API (20+ yrs, no key): NASA POWER power.larc.nasa.gov / Open-Meteo archive-api.open-meteo.com
