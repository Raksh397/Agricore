"""Symptom-based diagnosis rules covering every disease in the app's knowledge
base, including the crops the image CNN was never trained on.

Each rule maps a disease class key to the observable signs a farmer can report.
Scoring is a weighted match against the answers, so a partial match still
produces a ranked shortlist rather than nothing.

Answer vocabularies (kept small so they translate cleanly and stay pickable):
  part   : leaf | stem | fruit | root | whole
  sign   : spots | powder | rust | wilt | curl | holes | rot | mosaic | growth
  colour : brown | yellow | white | black | orange | purple | green
"""

# key: (parts, signs, colours, weight_hint)
RULES = {
    # --- Apple ---
    "Apple___Apple_scab": (["leaf", "fruit"], ["spots"], ["brown", "black"]),
    "Apple___Black_rot": (["fruit", "leaf"], ["rot", "spots"], ["black", "brown"]),
    "Apple___Cedar_apple_rust": (["leaf", "fruit"], ["rust", "spots"], ["orange", "yellow"]),

    # --- Cherry ---
    "Cherry_(including_sour)___Powdery_mildew": (["leaf"], ["powder"], ["white"]),

    # --- Corn / maize ---
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": (["leaf"], ["spots"], ["brown"]),
    "Corn_(maize)___Common_rust_": (["leaf"], ["rust"], ["orange", "brown"]),
    "Corn_(maize)___Northern_Leaf_Blight": (["leaf"], ["spots"], ["brown"]),

    # --- Grape ---
    "Grape___Black_rot": (["fruit", "leaf"], ["rot", "spots"], ["black", "brown"]),
    "Grape___Esca_(Black_Measles)": (["leaf", "fruit"], ["spots"], ["brown", "black"]),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": (["leaf"], ["spots"], ["brown"]),

    # --- Citrus ---
    "Orange___Haunglongbing_(Citrus_greening)": (["leaf", "fruit"], ["mosaic"], ["yellow", "green"]),

    # --- Peach / pepper ---
    "Peach___Bacterial_spot": (["leaf", "fruit"], ["spots"], ["brown", "black"]),
    "Pepper,_bell___Bacterial_spot": (["leaf", "fruit"], ["spots"], ["brown", "black"]),

    # --- Potato ---
    "Potato___Early_blight": (["leaf"], ["spots"], ["brown"]),
    "Potato___Late_blight": (["leaf", "stem"], ["rot", "spots"], ["brown", "black"]),

    # --- Squash / strawberry ---
    "Squash___Powdery_mildew": (["leaf"], ["powder"], ["white"]),
    "Strawberry___Leaf_scorch": (["leaf"], ["spots"], ["purple", "brown"]),

    # --- Tomato ---
    "Tomato___Bacterial_spot": (["leaf", "fruit"], ["spots"], ["brown", "black"]),
    "Tomato___Early_blight": (["leaf"], ["spots"], ["brown"]),
    "Tomato___Late_blight": (["leaf", "fruit"], ["rot", "spots"], ["brown", "black"]),
    "Tomato___Leaf_Mold": (["leaf"], ["powder", "spots"], ["yellow", "brown"]),
    "Tomato___Septoria_leaf_spot": (["leaf"], ["spots"], ["brown", "yellow"]),
    "Tomato___Spider_mites Two-spotted_spider_mite": (["leaf"], ["spots"], ["yellow", "white"]),
    "Tomato___Target_Spot": (["leaf", "fruit"], ["spots"], ["brown"]),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": (["leaf"], ["curl"], ["yellow"]),
    "Tomato___Tomato_mosaic_virus": (["leaf"], ["mosaic"], ["yellow", "green"]),

    # --- Rice ---
    "Rice___Blast": (["leaf"], ["spots"], ["brown", "white"]),
    "Rice___Bacterial_leaf_blight": (["leaf"], ["wilt", "spots"], ["yellow", "brown"]),
    "Rice___Sheath_blight": (["stem", "leaf"], ["rot", "spots"], ["brown", "green"]),
    "Rice___Brown_spot": (["leaf"], ["spots"], ["brown"]),
    "Rice___False_smut": (["fruit"], ["growth"], ["orange", "green", "black"]),

    # --- Wheat ---
    "Wheat___Yellow_rust": (["leaf"], ["rust"], ["yellow"]),
    "Wheat___Brown_rust": (["leaf"], ["rust"], ["brown", "orange"]),
    "Wheat___Powdery_mildew": (["leaf"], ["powder"], ["white"]),
    "Wheat___Loose_smut": (["fruit"], ["powder", "growth"], ["black"]),

    # --- Cotton ---
    "Cotton___Bollworm": (["fruit"], ["holes"], ["green", "brown"]),
    "Cotton___Leaf_curl_virus": (["leaf"], ["curl"], ["green", "yellow"]),
    "Cotton___Wilt": (["whole", "stem"], ["wilt"], ["yellow", "brown"]),

    # --- Sugarcane ---
    "Sugarcane___Red_rot": (["stem"], ["rot"], ["brown"]),
    "Sugarcane___Smut": (["whole", "stem"], ["growth", "powder"], ["black"]),
    "Sugarcane___Early_shoot_borer": (["stem"], ["holes", "wilt"], ["brown"]),

    # --- Banana ---
    "Banana___Panama_wilt": (["whole", "leaf"], ["wilt"], ["yellow", "brown"]),
    "Banana___Sigatoka_leaf_spot": (["leaf"], ["spots"], ["brown", "yellow"]),
    "Banana___Bunchy_top": (["leaf", "whole"], ["curl", "mosaic"], ["green", "yellow"]),

    # --- Mango ---
    "Mango___Anthracnose": (["leaf", "fruit"], ["spots", "rot"], ["black", "brown"]),
    "Mango___Powdery_mildew": (["leaf", "fruit"], ["powder"], ["white"]),
    "Mango___Hopper": (["leaf", "whole"], ["wilt"], ["black", "green"]),
    "Mango___Malformation": (["whole"], ["growth"], ["green"]),

    # --- Chilli ---
    "Chilli___Anthracnose_fruit_rot": (["fruit"], ["rot", "spots"], ["black", "brown"]),
    "Chilli___Leaf_curl": (["leaf"], ["curl"], ["green", "yellow"]),
    "Chilli___Bacterial_leaf_spot": (["leaf"], ["spots"], ["brown", "black"]),

    # --- Onion ---
    "Onion___Purple_blotch": (["leaf"], ["spots"], ["purple", "brown"]),
    "Onion___Thrips": (["leaf"], ["spots"], ["white", "yellow"]),
    "Onion___Basal_rot": (["root"], ["rot"], ["brown", "white"]),

    # --- Groundnut ---
    "Groundnut___Tikka_leaf_spot": (["leaf"], ["spots"], ["brown", "black"]),
    "Groundnut___Collar_rot": (["stem", "root"], ["rot", "wilt"], ["brown", "black"]),

    # --- Vegetables ---
    "Brinjal___Fruit_and_shoot_borer": (["fruit", "stem"], ["holes", "wilt"], ["brown"]),
    "Okra___Yellow_vein_mosaic": (["leaf"], ["mosaic"], ["yellow", "green"]),
    "Cabbage___Diamondback_moth": (["leaf"], ["holes"], ["green"]),

    # --- Rice (added) ---
    "Rice___Tungro": (["whole", "leaf"], ["mosaic", "curl"], ["yellow", "orange"]),
    "Rice___Leaf_scald": (["leaf"], ["spots"], ["brown", "yellow"]),
    "Rice___Leaffolder": (["leaf"], ["holes", "curl"], ["white", "brown"]),
    "Rice___Insect_damage": (["leaf", "stem"], ["holes"], ["brown", "green"]),

    # --- Cotton (added) ---
    "Cotton___Bacterial_blight": (["leaf", "fruit"], ["spots"], ["brown", "black"]),
    "Cotton___Alternaria_leaf_spot": (["leaf"], ["spots"], ["brown", "purple"]),

    # --- Groundnut (added) ---
    "Groundnut___Rust": (["leaf"], ["rust"], ["orange", "brown"]),
    "Groundnut___Alternaria_leaf_spot": (["leaf"], ["spots"], ["brown"]),
    "Groundnut___Rosette_virus": (["whole", "leaf"], ["mosaic", "curl"], ["yellow", "green"]),

    # --- Onion (added) ---
    "Onion___Iris_yellow_virus": (["leaf", "stem"], ["spots"], ["yellow", "white"]),
    "Onion___Stemphylium_leaf_blight": (["leaf"], ["spots", "wilt"], ["brown", "yellow"]),

    # --- Banana (added) ---
    "Banana___Xanthomonas_wilt": (["whole", "stem"], ["wilt", "rot"], ["yellow"]),

    # --- Mango (added) ---
    "Mango___Bacterial_canker": (["leaf", "fruit"], ["spots", "rot"], ["black", "brown"]),
    "Mango___Die_back": (["stem", "whole"], ["wilt"], ["brown", "black"]),
    "Mango___Gall_midge": (["leaf", "whole"], ["growth"], ["green", "brown"]),
    "Mango___Cutting_weevil": (["leaf"], ["holes"], ["green", "brown"]),
    "Mango___Sooty_mould": (["leaf", "fruit"], ["powder"], ["black"]),

    # --- Okra (added) ---
    "Okra___Alternaria_leaf_spot": (["leaf"], ["spots"], ["brown", "yellow"]),
    "Okra___Cercospora_leaf_spot": (["leaf"], ["powder", "spots"], ["black", "brown"]),
    "Okra___Downy_mildew": (["leaf"], ["powder", "spots"], ["yellow", "white"]),
    "Okra___Phyllosticta_leaf_spot": (["leaf"], ["spots", "holes"], ["brown", "white"]),

    # --- Brinjal (added) ---
    "Brinjal___Phomopsis_blight": (["leaf", "fruit", "stem"], ["spots", "rot"], ["brown", "black"]),
    "Brinjal___Wet_rot": (["fruit"], ["rot", "growth"], ["black", "white"]),
    "Brinjal___Fruit_cracking": (["fruit"], ["holes"], ["green", "purple"]),

    # --- Sugarcane (added) ---
    "Sugarcane___Brown_spot": (["leaf"], ["spots"], ["brown"]),
    "Sugarcane___Brown_rust": (["leaf"], ["rust"], ["brown", "orange"]),
    "Sugarcane___Yellow_leaf": (["leaf"], ["mosaic"], ["yellow"]),
    "Sugarcane___Grassy_shoot": (["whole"], ["growth"], ["white", "yellow"]),
    "Sugarcane___Pokkah_boeng": (["leaf", "whole"], ["curl", "rot"], ["yellow", "brown"]),
    "Sugarcane___Sett_rot": (["root", "stem"], ["rot"], ["brown", "black"]),
    "Sugarcane___Banded_chlorosis": (["leaf"], ["mosaic"], ["white", "yellow"]),
    "Sugarcane___Viral_disease": (["leaf"], ["mosaic"], ["green", "yellow"]),
    "Sugarcane___Dried_leaf": (["leaf"], ["wilt"], ["brown"]),
}

# Optional 4th question, asked only to separate look-alikes. Several diseases
# share crop+part+sign+colour (the four rice leaf-spot diseases are the worst
# case), and no amount of scoring can split them without more information. The
# lesion's shape is what an agronomist actually looks at next.
#   spindle    : pointed/eye-shaped lesion with a pale centre
#   stripe     : long streak running along the leaf/vein
#   concentric : rings inside the spot, like a target
#   patch      : large irregular blotch
#   tiny       : many small pinhead specks
PATTERNS = ["spindle", "stripe", "concentric", "patch", "tiny"]

PATTERN_RULES = {
    "Rice___Blast": ["spindle"],
    "Rice___Brown_spot": ["tiny", "concentric"],
    "Rice___Bacterial_leaf_blight": ["stripe"],
    "Rice___Sheath_blight": ["patch"],
    "Wheat___Yellow_rust": ["stripe"],
    "Wheat___Brown_rust": ["tiny"],
    "Tomato___Early_blight": ["concentric"],
    "Tomato___Bacterial_spot": ["tiny", "patch"],
    "Tomato___Leaf_Mold": ["patch"],
    "Tomato___Septoria_leaf_spot": ["tiny"],
    "Tomato___Late_blight": ["patch"],
    "Tomato___Target_Spot": ["concentric"],
    "Potato___Early_blight": ["concentric"],
    "Potato___Late_blight": ["patch"],
    "Corn_(maize)___Northern_Leaf_Blight": ["spindle"],
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ["stripe"],
    "Groundnut___Tikka_leaf_spot": ["concentric"],
    "Banana___Sigatoka_leaf_spot": ["stripe"],
    "Onion___Purple_blotch": ["patch"],
    "Apple___Apple_scab": ["patch"],
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": ["patch"],
    "Rice___Leaf_scald": ["stripe", "patch"],
    "Cotton___Bacterial_blight": ["tiny", "patch"],
    "Cotton___Alternaria_leaf_spot": ["concentric"],
    "Groundnut___Alternaria_leaf_spot": ["patch"],
    "Okra___Alternaria_leaf_spot": ["concentric"],
    "Okra___Cercospora_leaf_spot": ["patch"],
    "Okra___Phyllosticta_leaf_spot": ["tiny"],
    "Sugarcane___Brown_spot": ["tiny"],
    "Sugarcane___Brown_rust": ["stripe"],
    "Sugarcane___Banded_chlorosis": ["patch"],
    "Sugarcane___Yellow_leaf": ["stripe"],
    "Sugarcane___Viral_disease": ["tiny"],
    "Onion___Iris_yellow_virus": ["spindle"],
    "Onion___Stemphylium_leaf_blight": ["patch"],
    "Brinjal___Phomopsis_blight": ["patch"],
    "Mango___Bacterial_canker": ["tiny"],
}

PARTS = ["leaf", "stem", "fruit", "root", "whole"]
SIGNS = ["spots", "powder", "rust", "wilt", "curl", "holes", "rot", "mosaic", "growth"]
COLOURS = ["brown", "yellow", "white", "black", "orange", "purple", "green"]


def needs_pattern(results):
    """True when the shortlist has look-alikes too close to call, meaning the
    pattern follow-up question is worth asking."""
    if len(results) < 2:
        return False
    return (results[0]["match"] - results[1]["match"]) < 10.0


def diagnose(crop=None, part=None, sign=None, colour=None, pattern=None, top_n=4):
    """Rank diseases against reported symptoms.

    The sign (what the damage looks like) is the strongest discriminator, so it
    carries the most weight; colour and affected part refine the ordering. Crop
    is a hard filter when given, because a rice disease on a mango tree is never
    the right answer.
    """
    scored = []
    for key, (parts, signs, colours) in RULES.items():
        key_crop = key.split("___")[0]
        if crop:
            want = crop.strip().lower().replace(" ", "_")
            if want not in key_crop.lower():
                continue
        score = max_score = 0.0
        if sign:
            max_score += 3.0
            if sign in signs:
                score += 3.0
        if colour:
            max_score += 2.0
            if colour in colours:
                score += 2.0
        if part:
            max_score += 1.0
            if part in parts:
                score += 1.0
        if max_score == 0:
            continue
        base = score / max_score

        # Specificity bonus: a rule that lists one sign and one colour is a much
        # sharper claim than one listing three of each, so when both match the
        # reported symptoms equally the tighter rule should rank first. Without
        # this, broad rules tie with precise ones and the ordering is arbitrary.
        breadth = len(signs) + len(colours) + len(parts)
        specificity = 1.0 / (1.0 + 0.12 * breadth)
        confidence = base * (0.75 + 0.25 * specificity / 0.5)

        # Lesion shape is the tie-breaker between look-alikes, so it moves the
        # score hard in both directions. Diseases with no pattern entry are left
        # untouched rather than penalised — absence of data is not evidence.
        if pattern:
            expected = PATTERN_RULES.get(key)
            if expected:
                confidence *= 1.35 if pattern in expected else 0.45

        if base > 0:
            scored.append((round(min(confidence, 1.0), 4), key))

    scored.sort(reverse=True)
    return [{"class_name": k, "match": round(c * 100, 1)} for c, k in scored[:top_n]]

