import axios from "axios";

// data.gov.in public API key (sample key published by data.gov.in for testing;
// replace with your own from https://data.gov.in for production use)
const DATA_GOV_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

// Reverse Geocode
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
                params: {
                    lat,
                    lon: lng,
                    format: "json"
                }
            }
        );

        const address = response.data.address;

        const districtRaw =
            address.state_district ||
            address.county ||
            address.city_district ||
            "";

        return {
            state: address.state?.trim(),
            district: districtRaw
                .replace(" District", "")
                .replace(" district", "")
                .trim()
        };

    } catch (error) {
        console.error("Reverse geocode error:", error);
        return null;
    }
};

// Nominatim state names that differ from data.gov.in mandi dataset names
const STATE_NAME_MAP = {
    "kerala": "Keralam",
    "odisha": "Odisha",
    "orissa": "Odisha",
    "pondicherry": "Puducherry",
    "uttaranchal": "Uttarakhand"
};

const normalizeState = (state) => {
    if (!state) return state;
    return STATE_NAME_MAP[state.toLowerCase()] || state;
};

// Fetch latest mandi prices from data.gov.in (proxied through vite as /api/mandi)
export const fetchMandiPrices = async (state, district) => {
    try {
        const response = await axios.get("/api/mandi", {
            params: {
                "api-key": DATA_GOV_API_KEY,
                format: "json",
                limit: 100,
                "filters[state]": normalizeState(state)
            }
        });

        let records = response.data.records || [];

        // Prefer records from the user's district; fall back to whole state
        if (district && records.length > 0) {
            const d = district.toLowerCase();
            const districtRecords = records.filter(r =>
                (r.district || "").toLowerCase().includes(d) ||
                d.includes((r.district || "").toLowerCase())
            );
            if (districtRecords.length > 0) records = districtRecords;
        }

        return records;

    } catch (error) {
        console.error("Frontend mandi error:", error.response?.data || error);
        return [];
    }
};
