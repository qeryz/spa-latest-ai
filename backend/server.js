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
      process.env.ALLOWED_ORIGIN,
    ],
    credentials: true,
  })
);

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});


// Helper function to geocode a location
async function geocode(address) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const resp = await axios.get(url);
    if (resp.data.status === "OK" && resp.data.results.length > 0) {
      const location = resp.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: resp.data.results[0].formatted_address,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
}

// Helper function to search places
async function searchPlaces(query, lat, lng) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&location=${lat},${lng}&radius=5000&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const resp = await axios.get(url);
    if (resp.data.status === "OK") {
      return resp.data.results.slice(0, 5).map((place) => ({
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
      }));
    }
    return [];
  } catch (error) {
    console.error("Place search error:", error.message);
    return [];
  }
}

const tools = [
  {
    type: "function",
    function: {
      name: "geocode_location",
      description:
        "Get the latitude and longitude for a given city or address. Use this when the user switches context to a new location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. 'San Francisco, CA'",
          },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_places",
      description:
        "Search for specific places or points of interest near a location. Use this to find restaurants, gyms, schools, etc.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query, e.g. 'Italian restaurants' or 'Gyms'",
          },
          lat: {
            type: "number",
            description: "Latitude of the center point",
          },
          lng: {
            type: "number",
            description: "Longitude of the center point",
          },
        },
        required: ["query", "lat", "lng"],
      },
    },
  },
];

app.post("/api/chat", async (req, res) => {
  const { message, currentLocation } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });

  // Initial messages array
  let messages = [
    {
      role: "system",
      content: `You are a helpful relocation assistant named Zorg. 
      Current user location context: ${
        currentLocation
          ? `${currentLocation.address} (${currentLocation.lat}, ${currentLocation.lng})`
          : "None"
      }.
      
      CRITICAL: If the user asks a follow-up question (like "would you recommend moving here?" or "how is the crime?"), 
      ALWAYS assume they are referring to the current location context (${currentLocation ? currentLocation.address : "the last location discussed"}) 
      unless they explicitly mention a different city or location.
      
      If the user asks about a new location, use the geocode_location tool to get its coordinates.
      If the user asks for specific recommendations (restaurants, crime, schools, etc.), use the search_places tool with the current location.
      
      SPECIAL NOTE ON CRIME QUESTIONS: 
      Google Maps does not provide crime statistics. If the user asks about crime or safety, you may use your general knowledge 
      about the area's crime rates and safety reputation. Be honest and factual. If you know a city has higher crime rates 
      (e.g., Oakland, CA has historically higher crime than surrounding areas), mention this clearly but tactfully.
      
      IMPORTANT: When providing a summary or answering questions:
      1. Do NOT use bullet points or lists. Write in full, natural paragraphs.
      2. Do NOT mention specific ratings or review counts unless explicitly asked.
      3. Do NOT use special characters like asterisks (**bold**) or markdown formatting. Keep it plain text.
      4. Synthesize the information into a helpful, narrative summary.
      5. If the user asks about something that is not traditionally provided by Google Maps API (i.e. crime, weather, etc.) use your general knowledge about the area.
      5. Mention the general "vibe" of the area based on the types of places found.
      6. Do NOT mention latitude and longitude.
      7. Keep the total response under 200 words.`,
    },
    { role: "user", content: message },
  ];

  try {
    // First call to OpenAI to see if it wants to use tools
    let response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
    });

    let responseMessage = response.choices[0].message;

    // Loop to handle tool calls
    while (responseMessage.tool_calls) {
      messages.push(responseMessage); // Add the assistant's request to history
      const toolCalls = responseMessage.tool_calls;

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let functionResponse;

        if (functionName === "geocode_location") {
          console.log(`Tool Call: geocode_location(${functionArgs.location})`);
          functionResponse = await geocode(functionArgs.location);
        } else if (functionName === "search_places") {
          console.log(
            `Tool Call: search_places(${functionArgs.query}, ${functionArgs.lat}, ${functionArgs.lng})`
          );
          functionResponse = await searchPlaces(
            functionArgs.query,
            functionArgs.lat,
            functionArgs.lng
          );
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse),
        });
      }

      // Call OpenAI again with the tool outputs
      response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        tools: tools,
        tool_choice: "auto",
      });
      responseMessage = response.choices[0].message;
    }

    // Check if the agent geocoded a new location during the conversation
    let newLocation = null;
    for (const msg of messages) {
      if (msg.role === "tool" && msg.name === "geocode_location") {
        try {
          const locationData = JSON.parse(msg.content);
          if (locationData && locationData.lat && locationData.lng) {
            newLocation = locationData;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    res.json({ 
      result: responseMessage.content,
      newLocation: newLocation // Include new location if the agent switched context
    });
  } catch (err) {
    console.error("Chat Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from OpenAI." });
  }
});

// Fetch POIs from Google Places API (Legacy/Initial Load)
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
      // console.log(`Type: ${type}, Results: ${resp.data.results?.length || 0}`);
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

