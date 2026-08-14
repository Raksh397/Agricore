import json
import os
import re
import urllib.error
import urllib.request

from fastapi import APIRouter

router = APIRouter()

# --- AI providers (all optional) -----------------------------------------
# Providers are tried in order and the first one that returns text wins. This
# matters because the free tiers are quota-limited: when Gemini returns 429 for
# the day, the next provider answers instead of the farmer getting a canned KB
# reply. If every provider is missing, out of quota or unreachable, we fall
# through to the offline keyword KB, so the app still works with no internet.
#
# Keys come from the environment only, never from source:
#   GEMINI_API_KEY (or GOOGLE_API_KEY), ANTHROPIC_API_KEY, OPENAI_API_KEY
_HTTP_TIMEOUT = 30


def _load_env_file():
    """Read backend/.env into os.environ so keys survive a server restart.

    Deliberately tiny (no python-dotenv dependency) and non-destructive: a real
    environment variable always wins over the file.
    """
    path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                key, val = key.strip(), val.strip().strip('"').strip("'")
                if key and val and key not in os.environ:
                    os.environ[key] = val
    except OSError:
        pass  # No .env is fine — the app falls back to the offline KB.


_load_env_file()

LANG_NAMES = {
    "en": "English", "hi": "Hindi", "kn": "Kannada",
    "ta": "Tamil", "te": "Telugu", "ml": "Malayalam",
}

SYSTEM_PROMPT = """You are AgriBot, the farming assistant inside Agricore, an app for Indian farmers.

Answer ANY question related to agriculture, however broad or narrow: crop
cultivation and varieties, soil and nutrients, fertilizers and dosages, pests
and diseases with specific chemical/organic controls, irrigation, weeds,
seeds, sowing calendars, harvesting, storage, post-harvest handling,
horticulture, plantation crops, livestock, poultry, dairy, fisheries,
beekeeping, sericulture, farm machinery, agroforestry, organic and natural
farming, soil and water conservation, climate and weather impacts, farm
economics, market prices, MSP and mandis, FPOs, government schemes,
subsidies, crop insurance, farm loans and credit, land records, and
agricultural education or careers.

Rules:
- Give practical, India-specific advice. Prefer concrete numbers: dosage per
  litre or per hectare, spacing, timing, cost in rupees.
- Be direct and short — 3 to 6 sentences, or a short numbered list. Farmers
  read this on a phone.
- Name actual products/chemicals where useful, and always add the safety
  precaution (protective gear, pre-harvest interval).
- If the question is not about agriculture or rural livelihoods at all, say
  briefly that you only cover farming topics and invite a farming question.
- Never invent a scheme, subsidy amount or deadline you are unsure of. Say it
  should be confirmed at the local Raitha Samparka Kendra / agriculture office.
- Plain text only. No markdown headings, asterisks or tables."""


def _system_for(lang):
    """System prompt, with a language instruction appended when needed."""
    system = SYSTEM_PROMPT
    name = LANG_NAMES.get(lang)
    if name and lang != "en":
        system += ("\n\nReply entirely in %s, using %s script. Keep chemical "
                   "and product names in their usual form so they can be found "
                   "in a shop." % (name, name))
    return system


def _norm_history(history):
    """Trim to the last 6 turns and normalise to {role, text} pairs."""
    out = []
    for turn in (history or [])[-6:]:
        role = "assistant" if turn.get("role") in ("assistant", "bot") else "user"
        text = (turn.get("text") or turn.get("content") or "").strip()
        if text:
            out.append({"role": role, "text": text[:2000]})
    return out


def _post_json(url, payload, headers):
    """Minimal JSON POST. Returns the parsed body, or None on any failure."""
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=dict(headers, **{"Content-Type": "application/json"}),
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=_HTTP_TIMEOUT) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        # Quota (429), auth (401), network — all just mean "try the next one".
        return None


# Free-tier quota is granted per model, not per key: one model can return 429
# while another on the same key answers fine. Tried in order, best first.
_GEMINI_MODELS = ("gemini-flash-latest", "gemini-2.0-flash",
                  "gemini-flash-lite-latest", "gemini-2.0-flash-lite")


def _ask_gemini(message, lang, history):
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        return None
    # Gemini uses "model" for the assistant role and takes the system prompt
    # in its own top-level field.
    contents = [{"role": "model" if h["role"] == "assistant" else "user",
                 "parts": [{"text": h["text"]}]} for h in history]
    contents.append({"role": "user", "parts": [{"text": message[:4000]}]})
    payload = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": _system_for(lang)}]},
        # These are thinking models and the reasoning tokens are billed against
        # maxOutputTokens. At 1024 the thinking alone (~1000 tokens) ate the
        # whole budget and the answer came back empty or cut off mid-sentence,
        # which silently dropped every reply to the offline KB. 3072 leaves room
        # for the thinking plus a complete answer.
        "generationConfig": {"maxOutputTokens": 3072},
    }
    for model in _GEMINI_MODELS:
        body = _post_json(
            "https://generativelanguage.googleapis.com/v1beta/models/"
            "%s:generateContent?key=%s" % (model, key),
            payload,
            {},
        )
        if not body:
            continue  # 429/404 on this model — try the next one.
        try:
            cand = body["candidates"][0]
            parts = cand["content"]["parts"]
            text = "".join(p.get("text", "") for p in parts).strip()
        except (KeyError, IndexError, TypeError):
            continue
        # A MAX_TOKENS finish means the answer is truncated mid-sentence. Prefer
        # the next model over handing the farmer a half-written instruction.
        if text and cand.get("finishReason") not in ("MAX_TOKENS", "SAFETY", "RECITATION"):
            return text
    return None


def _ask_claude(message, lang, history):
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return None
    msgs = [{"role": h["role"], "content": h["text"]} for h in history]
    msgs.append({"role": "user", "content": message[:4000]})
    body = _post_json(
        "https://api.anthropic.com/v1/messages",
        {
            "model": "claude-opus-5",
            "max_tokens": 1024,
            "system": _system_for(lang),
            "messages": msgs,
        },
        {
            "x-api-key": os.environ["ANTHROPIC_API_KEY"],
            "anthropic-version": "2023-06-01",
        },
    )
    if not body or body.get("stop_reason") == "refusal":
        return None
    try:
        return "".join(b.get("text", "") for b in body["content"]
                       if b.get("type") == "text").strip() or None
    except (KeyError, TypeError):
        return None


def _ask_openai(message, lang, history):
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        return None
    msgs = [{"role": "system", "content": _system_for(lang)}]
    msgs += [{"role": h["role"], "content": h["text"]} for h in history]
    msgs.append({"role": "user", "content": message[:4000]})
    body = _post_json(
        "https://api.openai.com/v1/chat/completions",
        {"model": "gpt-4o-mini", "max_tokens": 1024, "messages": msgs},
        {"Authorization": "Bearer " + key},
    )
    if not body:
        return None
    try:
        return (body["choices"][0]["message"]["content"] or "").strip() or None
    except (KeyError, IndexError, TypeError):
        return None


# Order matters: Gemini has the most usable free tier, so it goes first.
_PROVIDERS = (("gemini", _ask_gemini), ("claude", _ask_claude), ("openai", _ask_openai))


def _ask_ai(message, lang="en", history=None):
    """Try each provider in turn. Returns (reply, provider_name) or (None, None)."""
    turns = _norm_history(history)
    for name, fn in _PROVIDERS:
        try:
            reply = fn(message, lang, turns)
        except Exception:
            reply = None
        if reply:
            return reply, name
    return None, None


def _any_ai_key():
    return bool(os.environ.get("GEMINI_API_KEY")
                or os.environ.get("GOOGLE_API_KEY")
                or os.environ.get("ANTHROPIC_API_KEY")
                or os.environ.get("OPENAI_API_KEY"))

# Agriculture knowledge base: keywords -> answer (English; frontend translates)
KB = [
    (["apply", "application", "how to apply", "document", "application form", "papers"],
     "How to apply for a scheme or loan: 1) Open Government Schemes in this app, pick the scheme/loan. 2) Tap 'Generate Document' — fill your name, Aadhaar, bank details and it creates a ready application form you can print. 3) Attach: Aadhaar copy, land records (RTC/Pahani), bank passbook copy, passport photo. 4) Submit at your bank branch (for loans/KCC) or Common Service Centre / Raitha Samparka Kendra (for schemes). 5) For PM-KISAN you can also self-register at pmkisan.gov.in. Track status with your Aadhaar number. Ask me about any specific scheme and I will guide you step by step!"),
    (["kcc apply", "kisan credit card apply", "kcc process"],
     "KCC application steps: 1) Generate the form from the Loans tab in this app. 2) Take Aadhaar, land records, 2 photos and bank passbook to your nearest bank. 3) Fill the one-page KCC form (banks must issue within 14 days). 4) Limit is set from your crop and acreage — up to Rs 3 lakh at 7% (effectively 4% if repaid on time). No collateral needed up to Rs 1.6 lakh."),
    (["reminder", "alert", "notify", "remind me"],
     "You can set reminders in the app: open You tab > Reminders. Add a custom reminder or use presets (spraying, fertilizer, irrigation, harvest) with a date and time. The app will notify you and speak the reminder aloud in your language when it is due."),
    (["agricore", "this app", "features", "what can you do", "what can this app"],
     "Agricore is a smart agriculture assistant with: 1. Disease Detection - leaf photo AI diagnosis and treatment. 2. Crop Recommendation - ML suggests best crop from soil NPK, pH, weather. 3. Fertilizer Recommendation. 4. Weather - hourly and 7-day local forecast, spraying conditions. 5. Market - live mandi prices. 6. Community - ask other farmers with photos. 7. Government Schemes and Loans - 14 schemes, 8 loans. 8. Calculators - fertilizer, pesticide, farm profit. 9. Library - crop guides, pests and diseases, tips. 10. Voice assistant in 6 languages. Ask me about any of these!"),
    (["disease detection", "camera", "photo", "scan leaf", "how to detect"],
     "To detect a crop disease: open Disease Prediction (or tap 'Take a picture' on the home page), photograph a single affected leaf in good light, and the AI model will show the disease name, confidence, and treatment. It supports Apple, Corn, Grape, Potato, Tomato, Pepper, Peach, Cherry, Strawberry and more. The result and advice are shown and spoken in your language."),
    (["crop recommendation", "which crop", "what to grow", "best crop"],
     "Crop Recommendation: open the Crop Advisor, enter soil Nitrogen, Phosphorus, Potassium and pH (or scan a soil report photo), weather is auto-filled from your location, and the ML model suggests the most profitable crop for your conditions. It supports 22 crops including rice, maize, cotton, banana, mango and pulses."),
    (["fertilizer recommendation", "fertilizer calculator", "how much fertilizer"],
     "Fertilizer Recommendation: open the Fertilizer Guide, choose your crop and enter soil N, P, K values. The app tells you which nutrient is deficient or excessive and exactly what to apply (e.g. urea, DAP, MOP, compost). The advice is shown and spoken in your language."),
    (["financial", "advisory", "profit", "farming calculator", "cost"],
     "Financial advisory: use the Farming Calculator (Tools section) — choose crop and area to see seed cost, fertilizer cost, total cost, expected yield, revenue and net profit in ₹. Also check the Loans tab in Government Schemes for KCC and other credit options."),
    (["community", "ask farmers", "post question"],
     "Community: tap the Community tab, press 'Ask Community', choose your crop, add a photo and your question. Other farmers can answer, like and share. Use the Translate button on any post to read it in your language."),
    (["loan", "credit", "kcc", "borrow", "money"],
     "Available farm loans:\n1. Kisan Credit Card (KCC) — crop loans up to ₹3 lakh at 7% interest (4% with prompt repayment). Apply at any bank.\n2. Agriculture Term Loan — for tractors, pumps, land development; 9-12% interest, 5-15 year terms.\n3. Agriculture Gold Loan — instant loan against gold, ~7-8.5% interest.\n4. PM-KUSUM — subsidized loan for solar pumps (30% subsidy + 30% loan).\n5. Dairy Entrepreneurship Loan (NABARD) — 25-33% back-ended subsidy.\n6. Agriculture Infrastructure Fund — 3% interest subvention for warehouses, cold storage.\nSee the Loans tab in Government Schemes for full details."),
    (["fertilizer", "npk", "urea", "dap", "nutrient"],
     "Fertilizer basics: N (urea) for leaf growth, P (DAP) for roots/flowering, K (MOP) for fruit quality and disease resistance. Always apply based on a soil test. General dose for cereals: 120:60:40 NPK kg/ha. Use the Fertilizer Calculator in this app for crop-specific advice."),
    (["disease", "fungus", "blight", "spot", "rot", "virus"],
     "For plant diseases: 1) Remove and destroy infected parts. 2) Avoid overhead watering. 3) Ensure spacing for airflow. 4) Use copper fungicide (3g/L) for fungal/bacterial issues, Mancozeb (2.5g/L) for blights. 5) Use the Disease Detection camera in this app to identify the exact disease from a photo."),
    (["pest", "insect", "bug", "caterpillar", "aphid", "borer", "worm"],
     "Pest control: Start with neem oil (5ml/L) — safe and organic. Use yellow sticky traps for whiteflies/aphids, pheromone traps for borers. Chemical option: Imidacloprid 0.5ml/L for sucking pests, Chlorpyrifos 2ml/L for soil pests. Always spray in the evening and wear protective gear."),
    (["irrigation", "water", "drip", "sprinkler"],
     "Irrigation tips: Drip irrigation saves 40-60% water and gives 20-30% higher yields — PMKSY gives up to 55% subsidy on drip/sprinkler systems. Irrigate at critical stages: flowering and grain-filling are most important. Avoid waterlogging — most crops need well-drained soil."),
    (["soil", "ph", "acidic", "alkaline", "health"],
     "Soil health: Test soil every 2-3 years (free via Soil Health Card scheme). Most crops prefer pH 6-7.5. For acidic soil add lime; for alkaline soil add gypsum. Add 5-10 tonnes FYM/compost per hectare yearly to improve organic matter."),
    (["seed", "sowing", "variety", "plant", "germination"],
     "Seed tips: Always use certified seed. Treat seed with Trichoderma or Carbendazim (2g/kg) before sowing to prevent soil-borne diseases. Sow at recommended spacing and depth (generally 2-3x seed diameter). Check the Crops library in this app for crop-specific guidance."),
    (["weather", "rain", "monsoon", "forecast", "temperature"],
     "Check the Weather section in this app for your exact location's current conditions, 24-hour and 7-day forecast. Plan spraying on calm days (wind < 15 km/h, no rain). Avoid sowing before heavy rain forecasts."),
    (["scheme", "subsidy", "government", "pm-kisan", "yojana"],
     "Key schemes: PM-KISAN (₹6,000/year), PMFBY crop insurance, KCC loans, PMKSY irrigation subsidy, Soil Health Card, PM-KUSUM solar subsidy. See the Government Schemes page in this app for all 14 schemes with eligibility and apply links."),
    (["market", "price", "mandi", "sell", "msp"],
     "Check the Market tab for live mandi prices in your region. Sell through e-NAM (enam.gov.in) for better price discovery. MSP 2024-25 examples: Paddy ₹2,300/qt, Wheat ₹2,275/qt, Cotton ₹6,620/qt."),
    (["insurance", "pmfby", "crop insurance", "claim"],
     "PMFBY crop insurance: Premium is only 2% (Kharif), 1.5% (Rabi), 5% (horticulture). Covers drought, flood, pests, diseases, post-harvest losses. Enroll through your bank/CSC before the season cutoff. Report crop loss within 72 hours to claim."),
    (["organic", "natural", "compost", "vermicompost"],
     "Organic farming: Use FYM, vermicompost (5 t/ha), green manure (dhaincha/sunhemp), biofertilizers (Rhizobium, Azotobacter, PSB). Neem oil and Trichoderma for pest/disease control. PKVY scheme gives ₹50,000/ha over 3 years for organic clusters."),
    (["hello", "hi", "namaste", "hey", "help"],
     "Hello! I am AgriBot, your farming assistant. Ask me about: crops, fertilizers, pests & diseases, irrigation, loans, government schemes, market prices, weather, or organic farming. How can I help you today?"),

    # --- Livestock, allied activities ---
    (["cow", "buffalo", "cattle", "dairy", "milk", "livestock"],
     "Dairy: a crossbred cow needs 6-8 kg green fodder + 4-5 kg dry fodder + 1 kg concentrate per 2.5 litres of milk daily, plus clean water at all times. Vaccinate against FMD twice a year and HS/BQ before monsoon. Deworm every 3 months. Keep the shed dry and well ventilated to prevent mastitis — test with a strip cup before each milking. NABARD's Dairy Entrepreneurship scheme gives 25-33% back-ended subsidy on a new unit."),
    (["poultry", "chicken", "hen", "egg", "broiler", "layer"],
     "Poultry: broilers reach 2 kg in 6 weeks on 3.5 kg feed; give 1 sq ft floor space per bird, vaccinate for Ranikhet (day 7) and Gumboro (day 14). Layers give 280-300 eggs a year on 110g feed/day. Backyard breeds like Giriraja and Vanaraja survive on kitchen waste and free range with far less care. Keep litter dry, and never mix new birds with old without 2 weeks quarantine."),
    (["goat", "sheep", "ram", "mutton", "rearing"],
     "Goat/sheep rearing: Osmanabadi, Sirohi and Jamunapari suit dry areas; keep 10-12 does per buck. Deworm every 3 months, vaccinate for PPR yearly and ET/HS before monsoon. A doe kids twice in 2 years, 1-2 kids each time, sale weight 25-30 kg in 9-10 months. Low water need makes this the best drought-year income. NABARD gives subsidised loans for a 10+1 unit."),
    (["fish", "fishery", "aquaculture", "pond", "prawn", "shrimp"],
     "Fish farming: a 1 acre pond stocked with catla, rohu and mrigal (6000/ha, 40:30:30) yields 3-4 tonnes/year. Lime the pond at 250 kg/ha, apply cow dung 5 t/ha, keep water 1.5-2 m deep, feed rice bran + oil cake at 3-5% of body weight. Harvest in 10-12 months. PMMSY gives 40% subsidy (60% for SC/ST/women) on ponds and inputs."),
    (["bee", "honey", "apiary", "pollination"],
     "Beekeeping: 10 Apis cerana boxes give 80-150 kg honey/year and boost nearby crop yields 20-30% through pollination. Place boxes facing east, shaded, near a water source, on stands with ant-guard bowls. Inspect weekly in season, harvest only sealed combs, and never harvest below 5 frames of stores. The National Beekeeping and Honey Mission subsidises boxes and processing units."),
    (["silk", "sericulture", "mulberry", "cocoon", "silkworm"],
     "Sericulture: 1 acre of V-1 mulberry supports 200-250 dfls per crop and 5-6 crops a year, roughly ₹2-3 lakh gross with steady monthly income. Keep the rearing house clean and disinfect with 2% bleaching powder before every batch; chawki (young silkworm) rearing decides the crop. Harvest cocoons on day 5-6 after spinning. The Central Silk Board and state departments subsidise the rearing shed, equipment and mulberry planting."),

    # --- Weeds, machinery, storage, land ---
    (["weed", "grass", "herbicide", "weedicide"],
     "Weed control: the first 30-45 days after sowing are the critical period — losses reach 30-40% if weeds are left. Use pre-emergence Pendimethalin 30% EC at 3.3 l/ha within 3 days of sowing, then one hand weeding at 30 days. For grassy weeds in standing crop use Quizalofop; for broadleaf use 2,4-D (never near cotton or chilli — drift damages them). Mulching and close spacing cut weeding cost a lot."),
    (["machine", "tractor", "harvester", "implement", "equipment", "power tiller"],
     "Farm machinery: SMAM gives 40-50% subsidy (higher for SC/ST, women and small farmers) on tractors, power tillers, rotavators, seed drills, sprayers and harvesters — apply at agrimachinery.nic.in with Aadhaar and land records. If you cannot afford your own, hire from a Custom Hiring Centre or the CHC Farm Machinery app; rates are far cheaper than ownership below 5 acres."),
    (["storage", "warehouse", "godown", "post harvest", "grading", "cold storage"],
     "Storage: dry grain to 12% moisture before storing or it will mould. Clean and fumigate the godown, use neem leaves or aluminium phosphide tablets (1 tablet/tonne, sealed 7 days, handled only by a trained person). Store on wooden pallets, not the floor. Use e-NWR warehouse receipts at a WDRA warehouse to get a pledge loan and sell later at a better price instead of at harvest-time lows."),
    (["land record", "rtc", "pahani", "khata", "7/12", "mutation", "patta"],
     "Land records: get your RTC/Pahani online at the state Bhoomi/Bhulekh portal — most schemes need it. For a mutation after purchase or inheritance, apply at the village Nadakacheri/Tehsil office with the sale deed or succession certificate; it usually takes 30-45 days. Keep the survey number, khata and Aadhaar linked, otherwise PM-KISAN and crop insurance payments get held up."),

    # --- Horticulture, agroforestry, climate ---
    (["horticulture", "vegetable", "fruit", "orchard", "flower", "nursery"],
     "Horticulture: vegetables give 3-4 crops a year and much higher income per acre than cereals, but need assured irrigation and a market plan. MIDH gives 40-50% subsidy on planting material, drip, mulching and polyhouses. Start fruit orchards with certified grafts from a government or NHB-accredited nursery. Intercrop young orchards with vegetables for the first 3 years for cash flow."),
    (["tree", "agroforestry", "timber", "bamboo", "plantation"],
     "Agroforestry: bund planting with teak, melia, silver oak or bamboo gives long-term income without losing much crop area. Bamboo yields from year 4 and gets support under the National Bamboo Mission. Check your state's transit rules before planting timber — some species need felling permission, so prefer exempted species. Trees also cut wind damage and raise the water table."),
    (["climate", "drought", "flood", "heat", "unseasonal", "hailstorm"],
     "Climate risk: for drought, shift to short-duration and drought-tolerant varieties, sow with the first assured rain, and mulch to conserve moisture. For flood-prone land, use raised beds and drainage channels and keep a nursery ready for re-sowing. Take PMFBY crop insurance before the season cutoff and report any loss within 72 hours on the Crop Insurance app — that is the only reliable protection against unseasonal rain and hail."),
    (["fpo", "farmer producer", "cooperative", "group", "collective"],
     "FPOs: a Farmer Producer Organisation of 300+ members can buy inputs wholesale, own machinery and sell in bulk at better rates. Under the 10,000 FPO scheme, the government gives up to ₹18 lakh management support over 3 years plus ₹2,000 per member equity grant and a ₹2 crore credit guarantee. Approach NABARD, SFAC or your nearest Krishi Vigyan Kendra to form one."),
    (["training", "kvk", "krishi vigyan", "course", "learn", "education"],
     "Training: your district Krishi Vigyan Kendra (KVK) runs free short courses on crop production, dairy, beekeeping, mushroom, food processing and machinery — find yours in the Schemes map in this app. The Kisan Call Centre (1800-180-1551, free, in your language) answers questions on any farming topic. Also see the Library section in this app for crop guides."),
]

CROPS_KB = {
    "rice": "Rice: needs 22-32°C, clayey soil holding water, pH 5.5-6.5, 1000-2000mm rain. Transplant 25-30 day seedlings, keep 2-5cm standing water, N in 3 splits. Major diseases: blast, bacterial leaf blight.",
    "wheat": "Wheat: Rabi crop, sow Nov 1-20, 100 kg seed/ha. Needs 14-25°C, loamy soil, pH 6-7.5. First irrigation at 21 days is critical. Watch for rust diseases.",
    "tomato": "Tomato: 20-27°C, well-drained loam, pH 6-7. Transplant at 60x45cm, stake plants, avoid overhead watering (blight risk). Calcium prevents blossom-end rot.",
    "potato": "Potato: cool crop 15-25°C, plant Oct-Nov, certified tubers at 60x20cm. Earth up at 25-30 days. Late blight is the main threat — spray Mancozeb preventively.",
    "cotton": "Cotton: Kharif, deep black soil, 21-30°C. Sow at 90x60cm with monsoon. Bollworm is the main pest — use pheromone traps and Bt varieties.",
    "maize": "Maize: 21-30°C, fertile loam, sow 20 kg/ha at 60x20cm. Never miss irrigation at silking stage. Watch fall armyworm.",
    "banana": "Banana: 26-30°C, rich loam, tissue-culture saplings at 1.8x1.8m. Heavy feeder: 300g N, 100g P, 300g K per plant/year. Harvest in 11-12 months.",
    "mango": "Mango: plant grafts 10x10m, no irrigation during flowering (Dec-Feb). Spray 2% KNO3 to induce flowering. Bag fruits against fruit fly.",
    "onion": "Onion: cool season 13-24°C, transplant 45-day seedlings at 15x10cm. Light frequent irrigation. Stop water when 50% tops fall. Purple blotch is main disease.",
    "sugarcane": "Sugarcane: 26-32°C, plant 3-bud setts Jan-Mar, 90cm furrows. Earth up at 90-120 days. Harvest at 12 months for peak sugar.",
    "groundnut": "Groundnut: Kharif/summer, sandy loam, pH 6-7.5. 100-120 kg seed/ha at 30x10cm, treat seed with Rhizobium. Gypsum 500 kg/ha at pegging is essential for pod filling. Irrigate at flowering and pegging. Watch tikka leaf spot and rust — spray Mancozeb 2.5g/L.",
    "chilli": "Chilli: transplant 40-45 day seedlings at 60x45cm, 25-30°C. Heavy feeder: 100:50:50 NPK kg/ha. Leaf curl (thrips/mites) is the main problem — spray Fipronil or Spiromesifen, rotate chemicals. Harvest green at 60 days, red at 90-100 days.",
    "brinjal": "Brinjal: transplant at 75x60cm, 22-30°C, needs steady moisture. Fruit and shoot borer is the key pest — clip and destroy wilted shoots weekly, use pheromone traps (10/acre) and neem; spray only if damage passes 5%. Harvest every 3-4 days when fruit is glossy.",
    "okra": "Okra (bhindi): sow 8-10 kg seed/ha at 45x30cm, soak seed 12 hours first. 25-35°C. Yellow vein mosaic spread by whitefly is the main threat — grow resistant varieties (Arka Anamika), use yellow sticky traps. Pick every 2-3 days at 5-7cm or it turns fibrous.",
    "cabbage": "Cabbage: cool season 15-22°C, transplant 4-week seedlings at 45x45cm. 120:60:60 NPK kg/ha with 25 t/ha FYM. Diamondback moth is the main pest — use Bt (Dipel) or Spinosad, rotate chemicals, and plant mustard as a trap crop. Harvest at 70-90 days when heads are firm.",
    "soybean": "Soybean: Kharif, 75 kg seed/ha at 45x5cm, treat with Rhizobium + PSB. Needs 600-800mm rain, well-drained soil, pH 6-7.5. Low N need (20 kg/ha) but 60-80 kg P. Watch girdle beetle and yellow mosaic. Harvest at 95-110 days when leaves drop and pods rattle.",
    "pulses": "Pulses (tur, gram, moong, urad): all fix their own nitrogen, so only 20 kg N but 40-60 kg P per ha. Treat seed with Rhizobium. Tur 90-120 days to 180 days by variety; moong is a quick 60-65 day catch crop. Pod borer is the main pest — neem plus pheromone traps, then Emamectin if it crosses threshold.",
    "coconut": "Coconut: plant 7.5x7.5m (175/ha), pit 1x1x1m filled with topsoil, FYM and salt. Annual dose per palm: 500g N, 320g P, 1200g K, 50kg FYM in 2 splits. Irrigate 40 l/palm/day in summer. Root wilt and rhinoceros beetle need attention — fill leaf axils with neem cake.",
    "turmeric": "Turmeric: plant rhizomes Apr-May at 30x20cm, 2500 kg seed rhizome/ha, needs shade tolerance and well-drained loam. Mulch heavily with green leaves. 150:60:120 NPK kg/ha. Harvest at 8-9 months when leaves yellow. Boil, dry to 10% moisture and polish before selling.",
    "coffee": "Coffee: 1000-1500m altitude, 15-25°C, shade trees essential. Arabica needs cooler higher ground, Robusta tolerates lower. Prune after harvest, apply lime if pH is below 5.5. White stem borer is the major Arabica pest — trace and remove affected plants. Harvest only ripe red cherries.",
}

# Loan details (also served to the Schemes page)
LOANS = [
    {"id": "kcc_loan", "title": "Kisan Credit Card (KCC)", "provider": "All Banks / RBI", "interest": "7% (4% with prompt repayment)", "amount": "Up to ₹3 lakh", "benefit": "Short-term crop loans with interest subvention", "eligibility": "All farmers, tenant farmers, sharecroppers, SHGs", "link": "https://www.myscheme.gov.in/schemes/kcc"},
    {"id": "agri_term_loan", "title": "Agriculture Term Loan", "provider": "Commercial & Cooperative Banks", "interest": "9-12%", "amount": "Based on project cost", "benefit": "For tractors, pumpsets, land development, farm machinery (5-15 yr terms)", "eligibility": "Farmers with land records", "link": "https://www.nabard.org"},
    {"id": "gold_loan_agri", "title": "Agriculture Gold Loan", "provider": "Banks & NBFCs", "interest": "7-8.5%", "amount": "Up to 75% of gold value", "benefit": "Instant credit against gold for farm needs", "eligibility": "Any farmer with gold ornaments", "link": "https://www.sbi.co.in"},
    {"id": "kusum_loan", "title": "PM-KUSUM Solar Loan", "provider": "MNRE + Banks", "interest": "30% subsidy + 30% bank loan", "amount": "Based on pump capacity", "benefit": "Farmer pays only ~40% for solar pumps", "eligibility": "Individual farmers, cooperatives, panchayats", "link": "https://pmkusum.mnre.gov.in"},
    {"id": "dairy_loan", "title": "Dairy Entrepreneurship Loan", "provider": "NABARD", "interest": "25-33% back-ended subsidy", "amount": "Up to ₹7 lakh per unit", "benefit": "For dairy units, milking machines, cold storage", "eligibility": "Farmers, SHGs, dairy cooperatives", "link": "https://www.nabard.org"},
    {"id": "aif_loan", "title": "Agriculture Infrastructure Fund", "provider": "Ministry of Agriculture", "interest": "3% interest subvention", "amount": "Up to ₹2 crore", "benefit": "For warehouses, cold storage, processing units", "eligibility": "Farmers, FPOs, agri-entrepreneurs, startups", "link": "https://agriinfra.dac.gov.in"},
    {"id": "shg_loan", "title": "SHG Bank Linkage Loan", "provider": "NABARD / Banks", "interest": "7% (with subvention)", "amount": "Up to ₹20 lakh per SHG", "benefit": "Collateral-free group loans for farm activities", "eligibility": "Self Help Group members", "link": "https://www.nabard.org"},
    {"id": "tractor_loan", "title": "Tractor & Machinery Loan (SMAM)", "provider": "Banks + SMAM subsidy", "interest": "9-11% + 40-50% subsidy", "amount": "Up to 85% of cost", "benefit": "Subsidy on tractors, tillers, harvesters via SMAM scheme", "eligibility": "Small & marginal farmers priority", "link": "https://agrimachinery.nic.in"},
]


@router.get("/loans")
def get_loans():
    return {"loans": LOANS}


@router.get("/chatbot/status")
def chatbot_status():
    """Lets the UI show whether the AI path is live or it is running offline."""
    return {"ai": _any_ai_key()}


def _kb_reply(msg):
    """Offline answer from the keyword tables. Always returns something.

    Crop and topic tables are scored together rather than checking crops first:
    "weed control in maize" is a weed question that happens to name a crop, and
    a crop-first order answers the wrong one. A bare crop name still falls
    through to the crop guide.
    """
    best, score = None, 0
    for keys, ans in KB:
        # Multi-word keys are far more specific than single words, so a phrase
        # hit ("crop recommendation") outweighs an incidental word hit.
        s = sum(2 if " " in k else 1 for k in keys if k in msg)
        if s > score:
            best, score = ans, s
    if best:
        return best
    for crop, ans in CROPS_KB.items():
        if crop in msg:
            return ans
    return ("I can help with: crop cultivation (rice, wheat, tomato...), fertilizers, "
            "pests & diseases, weeds, irrigation, seeds, machinery, storage, dairy, poultry, "
            "fishery, beekeeping, horticulture, farm loans, government schemes, insurance, "
            "market prices and organic farming. Please ask about any of these topics!")


@router.post("/chatbot")
def chat(payload: dict):
    raw = (payload.get("message") or "").strip()
    if not raw:
        return {"reply": "Please type a question about farming, loans, or schemes.",
                "source": "kb"}

    lang = (payload.get("lang") or "en").strip().lower()[:2]
    history = payload.get("history") or []

    # The frontend sends the original wording too. The AI reads that directly;
    # the keyword KB needs the machine-translated English, since its keys are
    # English substrings.
    original = (payload.get("message_raw") or "").strip() or raw

    # AI first — it can answer anything. The KB is the safety net.
    reply, provider = _ask_ai(original, lang, history)
    if reply:
        # Already in the user's language, so the frontend must not re-translate.
        return {"reply": reply, "source": "ai", "provider": provider, "lang": lang}

    return {"reply": _kb_reply(raw.lower()), "source": "kb", "lang": "en"}
