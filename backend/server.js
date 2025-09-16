const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allow CORS for localhost:5173 and any deployed FE
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.ALLOWED_ORIGIN, // Optionally set a deployed FE origin in .env
    ],
    credentials: true,
  })
);

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: process.env.SYSTEM_PROMPT },
        {
          role: "user",
          content: message + " (Please answer in under 100 words.)",
        },
      ],
    });
    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from OpenAI." });
  }
});

// Fetch POIs from Google Places API
app.post("/api/pois", async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng)
    return res.status(400).json({ error: "lat and lng required" });
  try {
    const types = [
      "restaurant",
      "school",
      "hospital",
      "cafe",
      "grocery_or_supermarket",
      "park",
      "library",
      "pharmacy",
      "bank",
      "gym",
    ];
    let allResults = [];
    for (const type of types) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      console.log(`Requesting: ${url}`);
      const resp = await axios.get(url);
      if (resp.data.status !== "OK") {
        console.warn(
          `Google Places API status for type '${type}':`,
          resp.data.status,
          resp.data.error_message || ""
        );
      }
      console.log(`Type: ${type}, Results: ${resp.data.results?.length || 0}`);
      const results = (resp.data.results || []).slice(0, 3).map((place) => ({
        type,
        name: place.name,
        rating: place.rating,
        reviews: place.user_ratings_total,
        address: place.vicinity,
      }));
      allResults = allResults.concat(results);
    }
    res.json({ pois: allResults });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch POIs from Google Places." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
