export default async function handler(req, res) {
    const { state, district } = req.query;

    const API_KEY = process.env.MANDI_API_KEY;

    const DATA_URL =
        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

    if (!state) {
        return res.status(400).json({ error: "State is required" });
    }

    try {
        const params = new URLSearchParams({
            "api-key": API_KEY,
            format: "json",
            limit: "20",
            "filters[State]": state
        });

        if (district) {
            params.append("filters[District]", district);
        }

        const response = await fetch(`${DATA_URL}?${params}`);

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({ error: text });
        }

        const data = await response.json();

        return res.status(200).json(data);

    } catch (error) {
        console.error("Serverless error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
