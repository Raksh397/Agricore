# Agricore — Smart Farming Assistant

Agricore is a full-stack AI-powered web application built for Indian farmers. It provides crop recommendations, plant disease detection, fertilizer advice, government scheme information, market prices, and a multilingual AI chatbot — all in one place.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chatbot (AgriBot)** | Gemini-powered chatbot that answers any agriculture question. Replies in the farmer's chosen language. Click **Listen** to hear the answer read aloud. |
| 🌿 **Disease Detection** | Upload a leaf photo to detect plant diseases using a ResNet9 deep-learning model. |
| 🌾 **Crop Recommendation** | Enter soil (N, P, K) and weather values to get the best crop to grow via Random Forest. |
| 🧪 **Fertilizer Advice** | Get correct fertilizer guidance based on crop and soil nutrient levels. |
| 📊 **Market Prices** | Live mandi (wholesale market) prices via data.gov.in. |
| 🗺️ **KVK Locator** | Find the nearest Krishi Vigyan Kendra on an interactive map. |
| 📋 **Government Schemes** | Browse and apply for PM-KISAN, PMFBY, KCC, PM-KUSUM and other schemes. |
| 📄 **Document Generator** | Auto-generate filled loan/scheme application letters. |
| 🌦️ **Weather** | 3-day forecast with spray-condition advisory using Open-Meteo. |
| 🌐 **6 Languages** | Full UI translation: English, हिंदी, ಕನ್ನಡ, தமிழ், తెలుగు, മലയാളം. |
| 🔔 **Reminders** | Set crop care reminders with voice alerts. |
| 🧑‍🤝‍🧑 **Community** | Post questions and answers with other farmers. |
| 📚 **Library** | Browse crop info, pest guides, and farming tips. |
| 🧮 **Calculators** | Farm area, pesticide dose, and fertilizer quantity calculators. |
| 📱 **PWA** | Installable as a mobile app, works offline for cached pages. |

---

## 🗂️ Project Structure

```
Agricore/
├── backend/                  # FastAPI + ML backend
│   ├── main.py               # App entry point, CORS, route registration
│   ├── routes/
│   │   ├── chatbot.py        # Gemini AI chatbot with KB fallback
│   │   ├── crop.py           # Crop recommendation (Random Forest)
│   │   ├── disease.py        # Disease detection (ResNet9)
│   │   ├── fertilizer.py     # Fertilizer advice
│   │   ├── community.py      # Community posts & answers
│   │   └── dataset.py        # Data endpoints
│   ├── models/
│   │   ├── RandomForest.pkl  # Crop recommendation model
│   │   └── FertilizerClassifier.pkl
│   ├── utils/
│   │   ├── disease_info.py   # Disease descriptions & treatments
│   │   ├── fertilizer_info.py # Fertilizer recommendations
│   │   └── symptom_rules.py  # Symptom-based diagnosis rules
│   └── .env                  # API keys (gitignored)
│
└── frontend/                 # React + Vite PWA
    ├── src/
    │   ├── pages/            # One file per page/feature
    │   ├── components/       # Header, BottomNav, modals, etc.
    │   ├── utils/
    │   │   ├── agriI18n.js   # Crop/disease name translations
    │   │   ├── translateText.js # MyMemory machine translation
    │   │   └── speech.js     # Text-to-speech with toggle
    │   └── i18n.js           # All UI strings in 6 languages
    └── public/
        ├── logo.svg          # Agricore logo (wheat + sun)
        ├── pwa-192x192.png
        └── pwa-512x512.png
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com/app/apikey)
- A free [Clerk account](https://clerk.com) for authentication

### 1. Clone the repo

```bash
git clone https://github.com/Raksh397/Agricore.git
cd Agricore
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
```

Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_key_here
```

Start the server:
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://127.0.0.1:8000
```

Start the dev server:
```bash
npm run dev
```

Open `http://localhost:5173`.

---

## 🧠 ML Models

| Model | Task | Algorithm |
|---|---|---|
| `RandomForest.pkl` | Crop recommendation | Random Forest (sklearn) |
| `FertilizerClassifier.pkl` | Fertilizer classification | Random Forest (sklearn) |
| ResNet9 (PyTorch) | Plant disease detection | CNN — 38 disease classes |

Input features for crop recommendation: N, P, K, temperature, humidity, pH, rainfall.

---

## 🌐 Language Support

All UI text, crop names, disease names, chatbot replies, and form labels are available in:

- English
- हिंदी (Hindi)
- ಕನ್ನಡ (Kannada)
- தமிழ் (Tamil)
- తెలుగు (Telugu)
- മലയാളം (Malayalam)

---

## 🔑 Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `backend/.env` | Gemini AI chatbot |
| `VITE_CLERK_PUBLISHABLE_KEY` | `frontend/.env` | Clerk authentication |
| `VITE_API_URL` | `frontend/.env` | Backend base URL |

---

## 📦 Tech Stack

**Frontend:** React 18, Vite 5, Tailwind CSS, react-i18next, Framer Motion, Leaflet, Recharts, Clerk, PWA (Workbox)

**Backend:** FastAPI, Uvicorn, PyTorch, scikit-learn, Pillow

---

## 👤 Author

**Raksh397** — [github.com/Raksh397](https://github.com/Raksh397)
