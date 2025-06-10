const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
