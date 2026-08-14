"""Extended disease & pest knowledge for major Indian crops.

The CNN model only classifies the 38 PlantVillage classes in disease_info.py.
This file adds reference/library entries for the crops Indian farmers actually
grow (rice, wheat, cotton, sugarcane, banana, mango, chilli, onion, ...) so the
Library and Chatbot can answer for them even though the camera model cannot
classify them yet.
"""

extra_disease_dic = {
    # ---------------- RICE ----------------
    "Rice___Blast": """<b>Crop</b>: Rice <br/><b>Disease</b>: Rice Blast (Pyricularia oryzae)<br/><br/>
    <b>Symptoms</b>: Diamond/spindle-shaped lesions with grey centres and brown margins on leaves. Neck blast blackens the panicle base causing whiteheads and empty grain.<br/><br/>
    <b>Favourable conditions</b>: 25-28°C, high humidity above 90%, excess nitrogen, prolonged leaf wetness.<br/><br/>
    <b>Management</b>:<br/>1. Grow resistant varieties (IR64, Tetep-derived lines).<br/>2. Avoid excess nitrogen; apply N in 3 splits.<br/>3. Spray Tricyclazole 75WP @ 0.6 g/L at boot leaf and again at heading.<br/>4. Carbendazim 50WP @ 1 g/L as an alternative.<br/>5. Treat seed with Carbendazim 2 g/kg before sowing.""",

    "Rice___Bacterial_leaf_blight": """<b>Crop</b>: Rice <br/><b>Disease</b>: Bacterial Leaf Blight (Xanthomonas oryzae)<br/><br/>
    <b>Symptoms</b>: Water-soaked yellow stripes from leaf tips and margins that turn straw-white; leaves dry from the tip downwards. In seedlings (kresek) whole plants wilt.<br/><br/>
    <b>Favourable conditions</b>: Heavy rain, flooding, wind damage, high nitrogen.<br/><br/>
    <b>Management</b>:<br/>1. Use resistant varieties carrying Xa21.<br/>2. Drain the field; avoid deep standing water.<br/>3. Stop nitrogen top dressing during an outbreak.<br/>4. Spray Streptocycline 300 ppm + Copper oxychloride 3 g/L.<br/>5. Avoid clipping seedling tips at transplanting.""",

    "Rice___Sheath_blight": """<b>Crop</b>: Rice <br/><b>Disease</b>: Sheath Blight (Rhizoctonia solani)<br/><br/>
    <b>Symptoms</b>: Oval greenish-grey water-soaked lesions on the sheath near the water line, later becoming straw coloured with brown borders; spreads upward, grains fail to fill.<br/><br/>
    <b>Management</b>:<br/>1. Avoid dense planting; keep proper spacing for airflow.<br/>2. Balanced NPK; avoid excess nitrogen.<br/>3. Spray Hexaconazole 5EC @ 2 ml/L or Validamycin 3L @ 2 ml/L.<br/>4. Apply Trichoderma viride to soil at 2.5 kg/ha with FYM.<br/>5. Remove infected stubble after harvest.""",

    "Rice___Brown_spot": """<b>Crop</b>: Rice <br/><b>Disease</b>: Brown Spot (Bipolaris oryzae)<br/><br/>
    <b>Symptoms</b>: Small circular to oval brown spots with grey centres and yellow halos on leaves; dark spots on grains reducing quality.<br/><br/>
    <b>Note</b>: Strongly linked to poor soil fertility, especially potassium and silicon deficiency.<br/><br/>
    <b>Management</b>:<br/>1. Correct soil nutrition — apply potash and silicon.<br/>2. Seed treatment with Carbendazim 2 g/kg or hot water (54°C, 10 min).<br/>3. Spray Mancozeb 2.5 g/L or Propiconazole 1 ml/L.<br/>4. Ensure adequate irrigation; drought stress worsens it.""",

    "Rice___False_smut": """<b>Crop</b>: Rice <br/><b>Disease</b>: False Smut (Ustilaginoidea virens)<br/><br/>
    <b>Symptoms</b>: Individual grains replaced by velvety yellow-orange balls that turn greenish-black. Reduces yield and grain quality.<br/><br/>
    <b>Management</b>:<br/>1. Spray Propiconazole 1 ml/L at booting stage (before panicle emergence).<br/>2. Avoid excess nitrogen late in the season.<br/>3. Use clean, certified seed.<br/>4. Collect and destroy smut balls; deep plough after harvest.""",

    # ---------------- WHEAT ----------------
    "Wheat___Yellow_rust": """<b>Crop</b>: Wheat <br/><b>Disease</b>: Yellow / Stripe Rust (Puccinia striiformis)<br/><br/>
    <b>Symptoms</b>: Bright yellow-orange pustules arranged in narrow stripes between leaf veins. Severe attack dries leaves and shrivels grain.<br/><br/>
    <b>Favourable conditions</b>: Cool 10-15°C with dew — common in North Indian plains and hills.<br/><br/>
    <b>Management</b>:<br/>1. Grow resistant varieties (HD 3086, PBW 725, DBW 187).<br/>2. Timely sowing; avoid very late sowing.<br/>3. Spray Propiconazole 25EC @ 1 ml/L at first appearance; repeat in 15 days.<br/>4. Tebuconazole 2 ml/L is an alternative.<br/>5. Monitor fields from January onward.""",

    "Wheat___Brown_rust": """<b>Crop</b>: Wheat <br/><b>Disease</b>: Brown / Leaf Rust (Puccinia triticina)<br/><br/>
    <b>Symptoms</b>: Round to oval orange-brown pustules scattered randomly on the upper leaf surface (not in stripes).<br/><br/>
    <b>Management</b>:<br/>1. Resistant varieties and timely sowing.<br/>2. Spray Propiconazole 1 ml/L or Mancozeb 2.5 g/L.<br/>3. Remove volunteer wheat plants that carry the fungus between seasons.""",

    "Wheat___Powdery_mildew": """<b>Crop</b>: Wheat <br/><b>Disease</b>: Powdery Mildew (Blumeria graminis)<br/><br/>
    <b>Symptoms</b>: White powdery fluffy growth on leaves and sheaths, later turning grey with small black dots.<br/><br/>
    <b>Management</b>:<br/>1. Avoid excess nitrogen and very dense crop.<br/>2. Spray wettable Sulphur 2 g/L or Propiconazole 1 ml/L.<br/>3. Ensure good field ventilation.""",

    "Wheat___Loose_smut": """<b>Crop</b>: Wheat <br/><b>Disease</b>: Loose Smut (Ustilago tritici)<br/><br/>
    <b>Symptoms</b>: Entire earhead converted into a black powdery mass of spores; only the bare rachis remains after spores blow away.<br/><br/>
    <b>Management</b>: This is seed-borne — control starts with seed.<br/>1. Use certified disease-free seed.<br/>2. Seed treatment with Carboxin 2 g/kg or Tebuconazole 1 g/kg.<br/>3. Solar heat treatment: soak seed 4 hours, dry in hot sun.<br/>4. Rogue out and burn infected earheads before spores spread.""",

    # ---------------- COTTON ----------------
    "Cotton___Bollworm": """<b>Crop</b>: Cotton <br/><b>Pest</b>: Bollworm complex (American, Pink, Spotted)<br/><br/>
    <b>Symptoms</b>: Round bore holes in squares and bolls, shed flowers, damaged lint. Pink bollworm causes rosette flowers and internal seed damage.<br/><br/>
    <b>Management</b>:<br/>1. Install pheromone traps @ 5/ha; monitor weekly.<br/>2. Grow Bt cotton, but maintain a refuge of non-Bt.<br/>3. Release Trichogramma chilonis @ 1.5 lakh/ha.<br/>4. Neem seed kernel extract 5% at early stage.<br/>5. Chemical: Emamectin benzoate 0.4 g/L or Spinosad 0.3 ml/L only when ETL is crossed.<br/>6. Destroy crop residue; avoid extending the crop beyond season.""",

    "Cotton___Leaf_curl_virus": """<b>Crop</b>: Cotton <br/><b>Disease</b>: Cotton Leaf Curl Virus (CLCuV, whitefly transmitted)<br/><br/>
    <b>Symptoms</b>: Upward or downward curling of leaves, thickened dark veins, enations (leaf-like outgrowths) on the underside, stunted plants with few bolls.<br/><br/>
    <b>Management</b>:<br/>1. Grow tolerant varieties.<br/>2. Control the whitefly vector — yellow sticky traps, Diafenthiuron 1 g/L or Flonicamid 0.3 g/L.<br/>3. Rogue out infected plants early.<br/>4. Avoid growing okra/other hosts near cotton.<br/>5. Early sowing escapes peak whitefly.""",

    "Cotton___Wilt": """<b>Crop</b>: Cotton <br/><b>Disease</b>: Fusarium / Verticillium Wilt<br/><br/>
    <b>Symptoms</b>: Yellowing and drooping of lower leaves progressing upward, brown vascular discolouration inside the stem when cut, plant death in patches.<br/><br/>
    <b>Management</b>:<br/>1. Grow resistant varieties.<br/>2. Long crop rotation with cereals (3-4 years).<br/>3. Soil application of Trichoderma viride 2.5 kg/ha with FYM.<br/>4. Balanced potash improves tolerance.<br/>5. Avoid waterlogging.""",

    # ---------------- SUGARCANE ----------------
    "Sugarcane___Red_rot": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Red Rot (Colletotrichum falcatum)<br/><br/>
    <b>Symptoms</b>: Drying of the 3rd-4th leaf from top, split cane shows reddened internal tissue with white crossbars, sour alcoholic smell.<br/><br/>
    <b>Management</b>:<br/>1. Use resistant varieties; this is the primary control.<br/>2. Set treatment in Carbendazim 0.1% for 10 minutes before planting.<br/>3. Moist hot air treatment of setts (54°C, 4 hours).<br/>4. Rogue out and burn affected clumps with roots.<br/>5. Crop rotation with rice; avoid ratooning infected fields.""",

    "Sugarcane___Smut": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Whip Smut (Sporisorium scitamineum)<br/><br/>
    <b>Symptoms</b>: A long black whip-like structure emerging from the growing point; plants become thin, grassy, with poor sugar recovery.<br/><br/>
    <b>Management</b>:<br/>1. Plant resistant varieties and healthy setts from disease-free fields.<br/>2. Sett treatment with Carbendazim 0.1% or Propiconazole 0.1%.<br/>3. Cover the whip with a polythene bag before removing to stop spore spread; then destroy.<br/>4. Avoid ratooning affected crop.""",

    "Sugarcane___Early_shoot_borer": """<b>Crop</b>: Sugarcane <br/><b>Pest</b>: Early Shoot Borer (Chilo infuscatellus)<br/><br/>
    <b>Symptoms</b>: Dead heart in young shoots that pulls out easily with a rotten smell; bore holes near ground level. Attacks up to 4 months.<br/><br/>
    <b>Management</b>:<br/>1. Early planting and light earthing up.<br/>2. Trash mulching reduces egg laying significantly.<br/>3. Release Trichogramma chilonis @ 50,000/ha at 15-day intervals.<br/>4. Remove and destroy dead hearts.<br/>5. Chlorantraniliprole 0.4 ml/L soil drench if severe.""",

    # ---------------- BANANA ----------------
    "Banana___Panama_wilt": """<b>Crop</b>: Banana <br/><b>Disease</b>: Panama Wilt / Fusarium Wilt (Fusarium oxysporum f.sp. cubense)<br/><br/>
    <b>Symptoms</b>: Yellowing of older leaves from margins inward, leaves collapse around the pseudostem forming a 'skirt', longitudinal splitting of the pseudostem base, reddish-brown vascular strands inside.<br/><br/>
    <b>Management</b>:<br/>1. Use tissue-culture, disease-free suckers.<br/>2. Grow tolerant varieties where TR4 is present.<br/>3. Soil application of Trichoderma viride 50 g/plant with FYM every 3 months.<br/>4. Carbendazim 2 g/L drench around the base.<br/>5. Improve drainage; avoid moving soil from infected plots.<br/>6. Destroy affected plants completely; do not replant banana immediately.""",

    "Banana___Sigatoka_leaf_spot": """<b>Crop</b>: Banana <br/><b>Disease</b>: Sigatoka Leaf Spot (Mycosphaerella spp.)<br/><br/>
    <b>Symptoms</b>: Small yellow streaks that enlarge into elongated brown spots with grey centres and yellow halos; heavy infection dries the whole canopy and fruits ripen prematurely.<br/><br/>
    <b>Management</b>:<br/>1. Remove and destroy affected leaves regularly.<br/>2. Maintain proper spacing and drainage.<br/>3. Spray Propiconazole 1 ml/L or Mancozeb 2.5 g/L with sticker, at 3-4 week intervals.<br/>4. Alternate fungicide groups to avoid resistance.<br/>5. Avoid overhead irrigation.""",

    "Banana___Bunchy_top": """<b>Crop</b>: Banana <br/><b>Disease</b>: Bunchy Top Virus (aphid transmitted)<br/><br/>
    <b>Symptoms</b>: Severely stunted plant with narrow, upright, bunched leaves at the top; dark green 'Morse code' streaks on the midrib and petiole. Infected plants rarely bear fruit.<br/><br/>
    <b>Management</b>:<br/>1. Use only certified virus-free tissue-culture planting material.<br/>2. Uproot and destroy infected plants immediately including the corm.<br/>3. Control banana aphid (Pentalonia nigronervosa) with Imidacloprid 0.3 ml/L before removing plants.<br/>4. Do not take suckers from infected gardens.""",

    # ---------------- MANGO ----------------
    "Mango___Anthracnose": """<b>Crop</b>: Mango <br/><b>Disease</b>: Anthracnose (Colletotrichum gloeosporioides)<br/><br/>
    <b>Symptoms</b>: Black irregular spots on leaves, blossom blight causing flower drop, and sunken dark lesions on fruit that expand during ripening and storage.<br/><br/>
    <b>Management</b>:<br/>1. Prune to open the canopy; remove dead twigs and mummified fruits.<br/>2. Spray Carbendazim 1 g/L at flowering and again at fruit set.<br/>3. Copper oxychloride 3 g/L after harvest pruning.<br/>4. Post-harvest hot water dip (52°C for 5 min) reduces storage rot.""",

    "Mango___Powdery_mildew": """<b>Crop</b>: Mango <br/><b>Disease</b>: Powdery Mildew (Oidium mangiferae)<br/><br/>
    <b>Symptoms</b>: White powdery coating on flower panicles, young fruit and leaves; heavy flower drop and poor fruit set. Major cause of yield loss in a dry, cool flowering season.<br/><br/>
    <b>Management</b>:<br/>1. Spray wettable Sulphur 2 g/L at panicle emergence.<br/>2. Follow with Hexaconazole 1 ml/L or Dinocap 1 ml/L 15 days later.<br/>3. Do not spray sulphur when temperature is above 35°C.<br/>4. Three sprays: panicle emergence, full bloom, pea-sized fruit.""",

    "Mango___Hopper": """<b>Crop</b>: Mango <br/><b>Pest</b>: Mango Hopper (Idioscopus spp.)<br/><br/>
    <b>Symptoms</b>: Wedge-shaped insects on panicles; nymphs and adults suck sap causing flower drop. Honeydew leads to sooty mould blackening leaves.<br/><br/>
    <b>Management</b>:<br/>1. Prune for an open canopy; avoid overcrowded orchards.<br/>2. Spray Imidacloprid 0.3 ml/L at panicle emergence.<br/>3. Second spray with Thiamethoxam 0.3 g/L after 15 days if needed.<br/>4. Wash off sooty mould with dilute starch solution.""",

    "Mango___Malformation": """<b>Crop</b>: Mango <br/><b>Disorder</b>: Mango Malformation (Fusarium mangiferae)<br/><br/>
    <b>Symptoms</b>: Vegetative malformation gives bunchy shoots with tiny leaves; floral malformation gives compact, highly branched panicles that set no fruit.<br/><br/>
    <b>Management</b>:<br/>1. Prune out malformed panicles and shoots 15-20 cm below the affected part; burn them.<br/>2. Spray NAA 200 ppm in October to reduce floral malformation.<br/>3. Carbendazim 1 g/L spray after pruning.<br/>4. Use healthy grafts from disease-free mother trees.""",

    # ---------------- CHILLI ----------------
    "Chilli___Anthracnose_fruit_rot": """<b>Crop</b>: Chilli <br/><b>Disease</b>: Anthracnose / Die-back (Colletotrichum capsici)<br/><br/>
    <b>Symptoms</b>: Sunken circular black spots with concentric rings on ripe fruits; twig die-back from the tip downwards; heavy fruit drop.<br/><br/>
    <b>Management</b>:<br/>1. Use disease-free certified seed; treat with Carbendazim 2 g/kg.<br/>2. Remove and destroy infected fruits and twigs.<br/>3. Spray Carbendazim 1 g/L or Mancozeb 2.5 g/L at 10-day intervals from fruit set.<br/>4. Avoid overhead irrigation and harvest ripe fruit promptly.""",

    "Chilli___Leaf_curl": """<b>Crop</b>: Chilli <br/><b>Disease</b>: Chilli Leaf Curl (virus complex + thrips/mites)<br/><br/>
    <b>Symptoms</b>: Upward curling and crinkling of leaves, shortened internodes, bushy stunted plants, very few small fruits. Often called 'murda' disease.<br/><br/>
    <b>Management</b>:<br/>1. Control thrips and mites — the actual damage agents.<br/>2. Spray Fipronil 2 ml/L for thrips; Spiromesifen 1 ml/L or Dicofol 5 ml/L for mites.<br/>3. Blue and yellow sticky traps.<br/>4. Rogue out severely affected plants.<br/>5. Raise nursery under insect-proof net; use barrier crops like maize.""",

    "Chilli___Bacterial_leaf_spot": """<b>Crop</b>: Chilli <br/><b>Disease</b>: Bacterial Leaf Spot (Xanthomonas campestris)<br/><br/>
    <b>Symptoms</b>: Small water-soaked spots that become brown with yellow halos; severe defoliation; raised scabby spots on fruits.<br/><br/>
    <b>Management</b>:<br/>1. Seed treatment with Streptocycline 100 ppm for 30 minutes.<br/>2. Spray Copper oxychloride 3 g/L + Streptocycline 100 ppm.<br/>3. Avoid working in the field when foliage is wet.<br/>4. Crop rotation of 2 years with non-solanaceous crops.""",

    # ---------------- ONION ----------------
    "Onion___Purple_blotch": """<b>Crop</b>: Onion <br/><b>Disease</b>: Purple Blotch (Alternaria porri)<br/><br/>
    <b>Symptoms</b>: Small white sunken spots on leaves that enlarge into purple-brown zonate lesions with yellow margins; leaves break at the lesion, bulbs stay small.<br/><br/>
    <b>Management</b>:<br/>1. Spray Mancozeb 2.5 g/L or Difenoconazole 0.5 ml/L with a sticker (onion leaves are waxy).<br/>2. Start sprays 30 days after transplanting, repeat every 10-15 days.<br/>3. Avoid excess irrigation and improve drainage.<br/>4. Crop rotation of 2-3 years; destroy infected debris.""",

    "Onion___Thrips": """<b>Crop</b>: Onion <br/><b>Pest</b>: Onion Thrips (Thrips tabaci)<br/><br/>
    <b>Symptoms</b>: Silvery-white streaks and blotches on leaves, curled and distorted leaf tips, severely reduced bulb size. Worst in hot dry weather.<br/><br/>
    <b>Management</b>:<br/>1. Blue sticky traps @ 15/ha to monitor.<br/>2. Spray Fipronil 2 ml/L or Spinosad 0.3 ml/L with a wetting agent.<br/>3. Alternate insecticide groups; thrips develop resistance fast.<br/>4. Maize or wheat as a barrier crop around the field.<br/>5. Adequate irrigation reduces thrips build-up.""",

    "Onion___Basal_rot": """<b>Crop</b>: Onion <br/><b>Disease</b>: Basal Rot (Fusarium oxysporum f.sp. cepae)<br/><br/>
    <b>Symptoms</b>: Yellowing and dieback of leaf tips, white fungal growth on the basal plate, roots rot and bulbs come away easily; rot continues in storage.<br/><br/>
    <b>Management</b>:<br/>1. Long crop rotation (4 years) away from onion and garlic.<br/>2. Soil application of Trichoderma viride 2.5 kg/ha with FYM.<br/>3. Seedling root dip in Carbendazim 1 g/L before transplanting.<br/>4. Improve drainage; avoid mechanical injury at harvest.<br/>5. Cure bulbs properly before storage.""",

    # ---------------- GROUNDNUT ----------------
    "Groundnut___Tikka_leaf_spot": """<b>Crop</b>: Groundnut <br/><b>Disease</b>: Tikka / Cercospora Leaf Spot<br/><br/>
    <b>Symptoms</b>: Circular dark brown spots with yellow halos on leaflets; early leaf spot has a lighter centre, late leaf spot is nearly black. Severe defoliation reduces pod yield sharply.<br/><br/>
    <b>Management</b>:<br/>1. Spray Chlorothalonil 2 g/L or Mancozeb 2.5 g/L at 30 and 45 days after sowing.<br/>2. Tebuconazole 1 ml/L for severe cases.<br/>3. Crop rotation with cereals; deep ploughing to bury debris.<br/>4. Resistant varieties where available.""",

    "Groundnut___Collar_rot": """<b>Crop</b>: Groundnut <br/><b>Disease</b>: Collar Rot (Aspergillus niger)<br/><br/>
    <b>Symptoms</b>: Seedling death soon after emergence; the collar region shows a black powdery fungal mass and shreds easily.<br/><br/>
    <b>Management</b>:<br/>1. Seed treatment with Carbendazim 2 g/kg or Trichoderma 10 g/kg — most important step.<br/>2. Avoid sowing in very hot, dry soil.<br/>3. Ensure good soil moisture at sowing.<br/>4. Add FYM to improve soil biology.""",

    # ---------------- SOME COMMON VEGETABLES ----------------
    "Brinjal___Fruit_and_shoot_borer": """<b>Crop</b>: Brinjal <br/><b>Pest</b>: Fruit and Shoot Borer (Leucinodes orbonalis)<br/><br/>
    <b>Symptoms</b>: Wilting and drooping of young shoots with bore holes; larvae tunnel inside fruits making them unmarketable. The single biggest brinjal pest.<br/><br/>
    <b>Management</b>:<br/>1. Clip and destroy infested shoots weekly — very effective.<br/>2. Pheromone traps @ 12/ha.<br/>3. Release Trichogramma chilonis @ 50,000/ha.<br/>4. Neem seed kernel extract 5%.<br/>5. Chemical: Emamectin benzoate 0.4 g/L or Chlorantraniliprole 0.3 ml/L, observing the waiting period before harvest.""",

    "Okra___Yellow_vein_mosaic": """<b>Crop</b>: Okra (Bhindi) <br/><b>Disease</b>: Yellow Vein Mosaic Virus (whitefly transmitted)<br/><br/>
    <b>Symptoms</b>: Bright yellow network of veins on leaves, later the whole leaf turns yellow; fruits become small, pale yellow and unmarketable.<br/><br/>
    <b>Management</b>:<br/>1. Grow resistant varieties (Arka Anamika, Parbhani Kranti).<br/>2. Control whitefly: Diafenthiuron 1 g/L or Imidacloprid 0.3 ml/L.<br/>3. Yellow sticky traps @ 12/ha.<br/>4. Rogue out infected plants early.<br/>5. Avoid growing near cotton or other whitefly hosts.""",

    "Cabbage___Diamondback_moth": """<b>Crop</b>: Cabbage / Cauliflower <br/><b>Pest</b>: Diamondback Moth (Plutella xylostella)<br/><br/>
    <b>Symptoms</b>: Small green larvae scrape leaf tissue leaving papery windows, then irregular holes; heads are damaged and contaminated with frass.<br/><br/>
    <b>Management</b>:<br/>1. Grow mustard as a trap crop (2 rows for every 25 rows of cabbage).<br/>2. Spray Bacillus thuringiensis 1 g/L — safe and effective.<br/>3. Release Diadegma semiclausum parasitoid.<br/>4. Spinosad 0.3 ml/L; rotate chemistry, this pest resists insecticides quickly.<br/>5. Avoid continuous cole crop cultivation.""",

    "Rice___Tungro": """<b>Crop</b>: Rice <br/><b>Disease</b>: Rice Tungro Virus (RTBV+RTSV, spread by green leafhopper)<br/><br/>
    <b>Symptoms</b>: Stunted plants with orange-yellow discolouration starting at leaf tips; reduced tillering, few and partly filled grains. Appears in patches where leafhoppers land.<br/><br/>
    <b>Management</b>:<br/>1. Grow tungro-resistant varieties (CO 51, IR 64, Pusa Basmati 1728).<br/>2. Control the green leafhopper vector: Imidacloprid 0.3 ml/L or Thiamethoxam 0.2 g/L.<br/>3. Rogue out infected hills as soon as symptoms show.<br/>4. Synchronise planting across the village to break the vector cycle.<br/>5. Avoid staggered or late planting next to an infected crop.""",

    "Rice___Leaf_scald": """<b>Crop</b>: Rice <br/><b>Disease</b>: Leaf Scald (Microdochium oryzae)<br/><br/>
    <b>Symptoms</b>: Lesions start at leaf tips or edges as zigzag bands of light brown and straw colour with darker margins; the leaf looks scalded and dries from the tip.<br/><br/>
    <b>Management</b>:<br/>1. Use clean certified seed and treat with Carbendazim 2 g/kg.<br/>2. Avoid excess nitrogen, which softens tissue and worsens spread.<br/>3. Spray Propiconazole 1 ml/L at first appearance.<br/>4. Burn or bury infected stubble after harvest.<br/>5. Keep good drainage; prolonged leaf wetness drives infection.""",

    "Rice___Leaffolder": """<b>Crop</b>: Rice <br/><b>Pest</b>: Rice Leaffolder (Cnaphalocrocis medinalis)<br/><br/>
    <b>Symptoms</b>: Larvae fold a leaf lengthwise and scrape the green tissue inside, leaving white papery streaks. Heavy attack gives the field a scorched white appearance.<br/><br/>
    <b>Management</b>:<br/>1. Conserve natural enemies; avoid blanket early-season sprays.<br/>2. Clip leaf tips at transplanting to remove egg masses.<br/>3. Spray Chlorantraniliprole 0.3 ml/L or Cartap hydrochloride 2 g/L at threshold.<br/>4. Avoid excess nitrogen and very dense planting.<br/>5. Drain the field briefly to expose larvae.""",

    "Rice___Insect_damage": """<b>Crop</b>: Rice <br/><b>Pest</b>: General insect / pest damage<br/><br/>
    <b>Symptoms</b>: Chewed edges, holes, scraping or boring damage without a single clear disease pattern. Several pests may be present together.<br/><br/>
    <b>Management</b>:<br/>1. Identify the pest before spraying - check for larvae, hoppers or borers at the base.<br/>2. Use light traps and pheromone traps to confirm which pest dominates.<br/>3. Spray only if damage crosses the economic threshold.<br/>4. Conserve spiders and parasitoids; they suppress most rice pests.<br/>5. Consult the local KVK with a photo if the pest is unclear.""",

    "Cotton___Bacterial_blight": """<b>Crop</b>: Cotton <br/><b>Disease</b>: Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)<br/><br/>
    <b>Symptoms</b>: Small water-soaked angular spots bounded by leaf veins, turning brown-black; may extend along veins and cause boll rot with black sunken lesions.<br/><br/>
    <b>Management</b>:<br/>1. Use acid-delinted certified seed; treat with Streptocycline 1 g + Carbendazim 2 g per kg seed.<br/>2. Spray Copper oxychloride 3 g/L + Streptocycline 0.1 g/L at first symptoms.<br/>3. Remove and burn infected crop residue.<br/>4. Avoid overhead irrigation and working the field when foliage is wet.<br/>5. Grow resistant varieties where available.""",

    "Cotton___Alternaria_leaf_spot": """<b>Crop</b>: Cotton <br/><b>Disease</b>: Alternaria Leaf Spot (Alternaria macrospora)<br/><br/>
    <b>Symptoms</b>: Small brown round to irregular spots with concentric rings and a purple margin; spots merge and cause premature leaf shedding.<br/><br/>
    <b>Management</b>:<br/>1. Spray Mancozeb 2.5 g/L or Difenoconazole 0.5 ml/L at first spotting.<br/>2. Repeat after 12-15 days if wet weather continues.<br/>3. Correct potassium deficiency - weak plants are far more susceptible.<br/>4. Remove fallen infected leaves from the field.<br/>5. Avoid moisture stress followed by heavy irrigation.""",

    "Groundnut___Rust": """<b>Crop</b>: Groundnut <br/><b>Disease</b>: Groundnut Rust (Puccinia arachidis)<br/><br/>
    <b>Symptoms</b>: Orange-brown powdery pustules on the underside of leaflets that rupture to release rusty spores; severe attack dries the whole canopy.<br/><br/>
    <b>Management</b>:<br/>1. Spray Hexaconazole 2 ml/L or Propiconazole 1 ml/L at first pustules.<br/>2. Repeat at 15-day intervals in humid weather.<br/>3. Grow resistant varieties (ICGV 86590, GPBD 4).<br/>4. Destroy volunteer groundnut plants that carry the fungus between seasons.<br/>5. Avoid late sowing, which meets peak humidity.""",

    "Groundnut___Alternaria_leaf_spot": """<b>Crop</b>: Groundnut <br/><b>Disease</b>: Alternaria Leaf Blight (Alternaria spp.)<br/><br/>
    <b>Symptoms</b>: Irregular brown blotches with wavy margins, often starting at the leaflet tip and edge, causing blight and defoliation.<br/><br/>
    <b>Management</b>:<br/>1. Spray Mancozeb 2.5 g/L at first symptoms, repeat after 15 days.<br/>2. Rotate with cereals to break the disease cycle.<br/>3. Use certified disease-free seed.<br/>4. Avoid a dense canopy - keep recommended spacing for airflow.<br/>5. Remove and destroy infected crop debris.""",

    "Groundnut___Rosette_virus": """<b>Crop</b>: Groundnut <br/><b>Disease</b>: Groundnut Rosette Virus (spread by aphids)<br/><br/>
    <b>Symptoms</b>: Severe stunting with bunched, small, mottled yellow-green leaves giving a rosette appearance; affected plants set almost no pods.<br/><br/>
    <b>Management</b>:<br/>1. Sow early and at recommended dense spacing - this markedly reduces aphid landing.<br/>2. Control aphid vectors: Imidacloprid 0.3 ml/L or Dimethoate 2 ml/L.<br/>3. Rogue out rosetted plants as soon as they appear.<br/>4. Grow resistant varieties where available (ICGV-SM lines).<br/>5. Remove volunteer groundnut plants between seasons.""",

    "Onion___Iris_yellow_virus": """<b>Crop</b>: Onion <br/><b>Disease</b>: Iris Yellow Spot Virus (spread by thrips)<br/><br/>
    <b>Symptoms</b>: Straw-coloured to yellow diamond or spindle-shaped lesions on the leaf and seed stalk, often with a green centre; stalks lodge and bulbs stay small.<br/><br/>
    <b>Management</b>:<br/>1. Control thrips rigorously - they are the only vector: Fipronil 1.5 ml/L or Spinosad 0.3 ml/L.<br/>2. Avoid planting next to older infected onion or garlic fields.<br/>3. Remove crop debris and volunteer onions.<br/>4. Use blue sticky traps to monitor thrips numbers.<br/>5. Keep plants well watered; stressed crops show worse symptoms.""",

    "Onion___Stemphylium_leaf_blight": """<b>Crop</b>: Onion <br/><b>Disease</b>: Stemphylium Leaf Blight / Colletotrichum Blight<br/><br/>
    <b>Symptoms</b>: Small yellow-orange spots that enlarge into elongated tan to dark brown lesions, usually starting from thrips injury; leaves collapse from the tip.<br/><br/>
    <b>Management</b>:<br/>1. Spray Mancozeb 2.5 g/L or Tebuconazole 1 ml/L at first lesions.<br/>2. Control thrips first - their feeding wounds let the fungus in.<br/>3. Avoid prolonged leaf wetness; irrigate early in the day.<br/>4. Rotate away from onion and garlic for 2-3 seasons.<br/>5. Destroy infected residue after harvest.""",

    "Banana___Xanthomonas_wilt": """<b>Crop</b>: Banana <br/><b>Disease</b>: Banana Xanthomonas Wilt (Xanthomonas campestris pv. musacearum)<br/><br/>
    <b>Symptoms</b>: Progressive yellowing and wilting of leaves, uneven premature ripening of fruit, and yellow bacterial ooze from a cut pseudostem. Highly destructive.<br/><br/>
    <b>Management</b>:<br/>1. Immediately cut and bury or burn the whole infected mat - do not leave debris.<br/>2. Disinfect every cutting tool with fire or bleach between plants.<br/>3. Remove male buds with a forked stick to stop insect spread.<br/>4. Do not move suckers or planting material out of infected areas.<br/>5. Use only clean tissue-cultured planting material.""",

    "Mango___Bacterial_canker": """<b>Crop</b>: Mango <br/><b>Disease</b>: Bacterial Canker / Black Spot (Xanthomonas campestris pv. mangiferae)<br/><br/>
    <b>Symptoms</b>: Water-soaked spots on leaves that become raised black angular lesions; cankers crack on twigs and fruit, oozing gum and causing fruit drop.<br/><br/>
    <b>Management</b>:<br/>1. Spray Streptocycline 0.1 g/L + Copper oxychloride 3 g/L; repeat at 10-day intervals.<br/>2. Prune out and burn cankered twigs during the dry season.<br/>3. Protect fruit from wind injury - wounds are the entry point.<br/>4. Avoid overhead irrigation in the orchard.<br/>5. Disinfect pruning tools between trees.""",

    "Mango___Die_back": """<b>Crop</b>: Mango <br/><b>Disease</b>: Mango Die-back (Lasiodiplodia theobromae)<br/><br/>
    <b>Symptoms</b>: Twigs die from the tip downward with dark discoloured bark; leaves brown, curl and hang on. A dark streak shows in the wood when cut.<br/><br/>
    <b>Management</b>:<br/>1. Prune 8-10 cm below the affected portion and burn the prunings.<br/>2. Paste the cut end with Copper oxychloride or Bordeaux paste.<br/>3. Spray Carbendazim 1 g/L after pruning.<br/>4. Avoid water stress and sunscald; both predispose trees.<br/>5. Keep the orchard free of dead wood.""",

    "Mango___Gall_midge": """<b>Crop</b>: Mango <br/><b>Pest</b>: Mango Gall Midge (Procontarinia spp.)<br/><br/>
    <b>Symptoms</b>: Small wart-like galls on leaves, leaf stalks and flower panicles; heavy infestation distorts leaves and dries the panicle before fruit set.<br/><br/>
    <b>Management</b>:<br/>1. Plough the basin to expose pupating larvae in the soil.<br/>2. Spray Dimethoate 2 ml/L at bud burst and again at panicle emergence.<br/>3. Collect and destroy fallen galled leaves and panicles.<br/>4. Avoid a dense canopy - prune for light and airflow.<br/>5. Monitor at flowering, when damage matters most.""",

    "Mango___Cutting_weevil": """<b>Crop</b>: Mango <br/><b>Pest</b>: Mango Leaf Cutting Weevil (Deporaus marginatus)<br/><br/>
    <b>Symptoms</b>: Adults cut across tender leaves so the tips fall off, leaving neatly severed leaves; nurseries and young flushes suffer most.<br/><br/>
    <b>Management</b>:<br/>1. Collect and destroy fallen cut leaves that carry the eggs.<br/>2. Spray Quinalphos 2 ml/L or Lambda-cyhalothrin 1 ml/L on new flush.<br/>3. Protect nursery plants especially during flushing.<br/>4. Avoid staggered flushing where possible.<br/>5. Repeat spray if fresh cutting continues after 10 days.""",

    "Mango___Sooty_mould": """<b>Crop</b>: Mango <br/><b>Pest</b>: Sooty Mould (Capnodium spp., growing on insect honeydew)<br/><br/>
    <b>Symptoms</b>: Black powdery fungal coating on leaf surfaces and fruit. The fungus does not invade the plant - it grows on honeydew from hoppers, scales and mealybugs.<br/><br/>
    <b>Management</b>:<br/>1. Control the honeydew-producing insect first - the mould disappears without it.<br/>2. Spray Imidacloprid 0.3 ml/L for hoppers and scales.<br/>3. Wash the coating off with a starch spray (1 kg maida in 10 L water) which flakes away on drying.<br/>4. Prune to open the canopy to sunlight.<br/>5. Manage ants, which farm honeydew insects.""",

    "Okra___Alternaria_leaf_spot": """<b>Crop</b>: Okra <br/><b>Disease</b>: Alternaria Leaf Spot (Alternaria spp.)<br/><br/>
    <b>Symptoms</b>: Brown circular spots with concentric rings and a yellow halo, enlarging and merging until the leaf dries and drops.<br/><br/>
    <b>Management</b>:<br/>1. Spray Mancozeb 2.5 g/L or Difenoconazole 0.5 ml/L at first spots.<br/>2. Repeat after 10-12 days in humid weather.<br/>3. Remove infected lower leaves to slow spread.<br/>4. Rotate crops; avoid okra after okra.<br/>5. Keep spacing wide enough for the canopy to dry.""",

    "Okra___Cercospora_leaf_spot": """<b>Crop</b>: Okra <br/><b>Disease</b>: Cercospora Leaf Spot (Cercospora abelmoschi)<br/><br/>
    <b>Symptoms</b>: Irregular sooty grey-black patches, mostly on the lower leaf surface; severe attack causes heavy defoliation.<br/><br/>
    <b>Management</b>:<br/>1. Spray Carbendazim 1 g/L or Mancozeb 2.5 g/L.<br/>2. Destroy infected leaf debris after harvest.<br/>3. Avoid overhead irrigation late in the day.<br/>4. Maintain recommended spacing for airflow.<br/>5. Rotate with a non-malvaceous crop.""",

    "Okra___Downy_mildew": """<b>Crop</b>: Okra <br/><b>Disease</b>: Downy Mildew (Pseudoperonospora spp.)<br/><br/>
    <b>Symptoms</b>: Pale yellow angular patches on the upper leaf surface bounded by veins, with a greyish downy growth underneath in humid weather.<br/><br/>
    <b>Management</b>:<br/>1. Spray Metalaxyl + Mancozeb 2 g/L at first symptoms.<br/>2. Improve drainage and avoid waterlogging.<br/>3. Increase spacing to reduce humidity in the canopy.<br/>4. Remove and destroy affected leaves.<br/>5. Irrigate in the morning so foliage dries by evening.""",

    "Okra___Phyllosticta_leaf_spot": """<b>Crop</b>: Okra <br/><b>Disease</b>: Phyllosticta Leaf Spot (Phyllosticta hibisci)<br/><br/>
    <b>Symptoms</b>: Small circular spots with pale grey centres and dark brown margins; centres may fall out giving a shot-hole look.<br/><br/>
    <b>Management</b>:<br/>1. Spray Mancozeb 2.5 g/L or Copper oxychloride 3 g/L.<br/>2. Collect and burn infected leaves.<br/>3. Use disease-free seed from a healthy crop.<br/>4. Avoid dense planting.<br/>5. Rotate away from okra for one season.""",

    "Brinjal___Phomopsis_blight": """<b>Crop</b>: Brinjal <br/><b>Disease</b>: Phomopsis Blight and Fruit Rot (Phomopsis vexans)<br/><br/>
    <b>Symptoms</b>: Grey-brown spots with dark margins on leaves, stem cankers near the collar, and soft sunken rotting patches on fruit with black dots.<br/><br/>
    <b>Management</b>:<br/>1. Use certified seed; treat with Thiram 3 g/kg or Carbendazim 2 g/kg.<br/>2. Spray Mancozeb 2.5 g/L or Carbendazim 1 g/L at first symptoms.<br/>3. Remove and destroy infected fruit and plant debris.<br/>4. Rotate with a non-solanaceous crop for 2 years.<br/>5. Avoid overhead irrigation.""",

    "Brinjal___Wet_rot": """<b>Crop</b>: Brinjal <br/><b>Disease</b>: Wet Rot / Choanephora Fruit Rot<br/><br/>
    <b>Symptoms</b>: Rapid soft watery rot of fruit and flowers, covered with a whiskery grey-black fungal growth in humid weather.<br/><br/>
    <b>Management</b>:<br/>1. Pick and destroy rotting fruit immediately - do not leave it in the field.<br/>2. Spray Mancozeb 2.5 g/L; repeat in continued wet weather.<br/>3. Improve drainage and avoid waterlogging.<br/>4. Stake plants so fruit does not touch wet soil.<br/>5. Harvest promptly; over-mature fruit rots first.""",

    "Brinjal___Fruit_cracking": """<b>Crop</b>: Brinjal <br/><b>Disease</b>: Fruit Cracking / Creaking (physiological disorder)<br/><br/>
    <b>Symptoms</b>: Fruit splits lengthwise or in a ring. This is not an infection - it follows irregular watering, boron deficiency or a sudden growth spurt after drought.<br/><br/>
    <b>Management</b>:<br/>1. Irrigate evenly; avoid long dry spells followed by heavy watering.<br/>2. Apply Borax 10 kg/ha at land preparation if boron is deficient.<br/>3. Mulch to keep soil moisture steady.<br/>4. Harvest at the right maturity rather than leaving fruit on the plant.<br/>5. Avoid excess nitrogen, which causes rapid soft growth.""",

    "Sugarcane___Brown_spot": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Brown Spot (Cercospora longipes)<br/><br/>
    <b>Symptoms</b>: Small reddish-brown spots with a narrow yellow halo, elongating along the leaf; heavy spotting reduces green area and cane weight.<br/><br/>
    <b>Management</b>:<br/>1. Spray Mancozeb 2.5 g/L or Propiconazole 1 ml/L if spread is rapid.<br/>2. Detrash lower affected leaves and remove them from the field.<br/>3. Avoid excess nitrogen.<br/>4. Grow tolerant varieties.<br/>5. Ensure good drainage to reduce humidity around the canopy.""",

    "Sugarcane___Brown_rust": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Brown Rust (Puccinia melanocephala)<br/><br/>
    <b>Symptoms</b>: Elongated orange-brown pustules mainly on the lower leaf surface that rupture and shed rusty spores; leaves dry early in severe cases.<br/><br/>
    <b>Management</b>:<br/>1. Spray Propiconazole 1 ml/L or Mancozeb 2.5 g/L at first pustules.<br/>2. Grow rust-resistant varieties - the most reliable control.<br/>3. Avoid excess nitrogen and dense planting.<br/>4. Detrash to improve air movement.<br/>5. Repeat spray after 15 days if humid weather continues.""",

    "Sugarcane___Yellow_leaf": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Yellow Leaf Disease (Sugarcane Yellow Leaf Virus, aphid-borne)<br/><br/>
    <b>Symptoms</b>: Intense yellowing of the midrib on the underside of top leaves, later spreading to the blade; growth is stunted with shortened internodes.<br/><br/>
    <b>Management</b>:<br/>1. Plant only virus-free tissue-cultured or heat-treated setts.<br/>2. Control aphid vectors: Imidacloprid 0.3 ml/L.<br/>3. Rogue out clearly affected clumps in seed nurseries.<br/>4. Do not take seed cane from an affected field.<br/>5. Grow tolerant varieties where available.""",

    "Sugarcane___Grassy_shoot": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Grassy Shoot Disease (phytoplasma, spread by leafhoppers and setts)<br/><br/>
    <b>Symptoms</b>: Profuse thin tillers with narrow pale white-yellow leaves giving a grass-like clump; canes are thin or absent.<br/><br/>
    <b>Management</b>:<br/>1. Treat setts with moist hot air (54 C for 4 hours) or hot water (50 C for 2 hours).<br/>2. Use only healthy seed cane from a disease-free nursery.<br/>3. Rogue out grassy clumps as soon as they appear.<br/>4. Control leafhopper vectors.<br/>5. Do not ratoon a badly affected crop.""",

    "Sugarcane___Pokkah_boeng": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Pokkah Boeng (Fusarium moniliforme)<br/><br/>
    <b>Symptoms</b>: Top leaves become chlorotic, twisted and crinkled at the base forming a tangled top rot; severe cases show ladder-like knife cuts in the stalk.<br/><br/>
    <b>Management</b>:<br/>1. Spray Carbendazim 1 g/L or Copper oxychloride 3 g/L on the crown.<br/>2. Most attacks recover on their own once the weather turns dry.<br/>3. Avoid excess nitrogen during rapid growth.<br/>4. Improve drainage in low-lying patches.<br/>5. Grow tolerant varieties where outbreaks repeat.""",

    "Sugarcane___Sett_rot": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Sett Rot / Pineapple Disease (Ceratocystis paradoxa)<br/><br/>
    <b>Symptoms</b>: Cut setts rot in the soil, turning reddish then black, with a distinct pineapple smell; germination fails and gaps appear in the row.<br/><br/>
    <b>Management</b>:<br/>1. Treat setts with Carbendazim 1 g/L for 10 minutes before planting.<br/>2. Plant in well-drained soil; avoid waterlogging after planting.<br/>3. Use fresh mature setts and plant promptly after cutting.<br/>4. Avoid deep planting in cold wet soil.<br/>5. Do not use damaged or dried setts.""",

    "Sugarcane___Banded_chlorosis": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Banded Chlorosis (physiological / cold injury)<br/><br/>
    <b>Symptoms</b>: Transverse white to yellow bands across the leaf blade. This is not a pathogen - it follows cold nights, sudden temperature change or micronutrient imbalance.<br/><br/>
    <b>Management</b>:<br/>1. No fungicide is needed; the crop outgrows it as temperature stabilises.<br/>2. Correct micronutrient deficiency with a foliar spray of zinc sulphate 0.5% if bands persist.<br/>3. Maintain balanced nutrition and adequate soil moisture.<br/>4. Avoid planting sensitive varieties in frost-prone low patches.<br/>5. Confirm with the local KVK before spending on any spray.""",

    "Sugarcane___Viral_disease": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Viral disease complex (mosaic / streak)<br/><br/>
    <b>Symptoms</b>: Mottled light and dark green patches or stripes on young leaves, sometimes with stunting. Spread by aphids and by infected setts.<br/><br/>
    <b>Management</b>:<br/>1. Plant only virus-free seed cane from a certified nursery.<br/>2. Rogue out affected clumps early in seed plots.<br/>3. Control aphid vectors with Imidacloprid 0.3 ml/L.<br/>4. Do not ratoon heavily affected fields.<br/>5. Grow resistant varieties where available.""",

    "Sugarcane___Dried_leaf": """<b>Crop</b>: Sugarcane <br/><b>Disease</b>: Dried / senescent leaf (not a disease)<br/><br/>
    <b>Symptoms</b>: Fully dried brown lower leaves. Normal ageing of the lower canopy, or the end stage of drought or another stress rather than an active infection.<br/><br/>
    <b>Management</b>:<br/>1. Detrash dried lower leaves - this improves airflow and reduces pest shelter.<br/>2. Check soil moisture; persistent early drying usually means water stress.<br/>3. Inspect the green upper canopy for the real problem if drying is rapid.<br/>4. Use the trash as mulch between rows to conserve moisture.<br/>5. No spray is required for normal senescence.""",
}
