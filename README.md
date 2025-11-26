# AI Relocation Assistant: An Agentic Chatbot for Relocation Advice
### [Live Demo](https://3daichatbot.netlify.app/)
This is a full-stack, AI-powered chatbot designed to help users make informed decisions about new neighborhoods. By leveraging a multi-agent system, it autonomously researches, analyzes, and summarizes real-world data to provide personalized, conversational advice on any U.S. location.

<img width="591" height="450" alt="image" src="https://github.com/user-attachments/assets/7f94141f-e321-4164-b8ca-be95340ef1bc" />

## Key Features
- Autonomous Agentic Flows: The core of the system is an agentic architecture that goes beyond simple API calls. The AI agent can perform a series of actions—like fetching Points of Interest (POIs) and reviews from Google Maps—to complete complex tasks and fulfill user requests.
- Context-Aware Conversation: The chatbot retains multi-turn context, allowing for natural, follow-up questions and a personalized conversational experience.
- Dynamic Data Analysis: It gathers real-world data (Google Maps POIs, user reviews) and summarizes it into concise, actionable advice using OpenAI's GPT models.
- 3D Interface: The conversational interface is presented with a 3D Avatar powered by Three.js, offering an engaging and modern user experience.

## Tech Stack
- Frontend: React, Three.js (for 3D), Framer Motion (for animations), TailwindCSS
- Backend:	Node.js, Express.js
- APIs:	OpenAI API (GPT-4), Google Maps API (Places)
