# AI Relocation Assistant: Agentic Chatbot with Dynamic Tool Use
### [Live Demo](https://3daichatbot.netlify.app/)

An intelligent, full-stack chatbot that helps users research neighborhoods using **OpenAI Function Calling** and **dynamic tool orchestration**. Unlike traditional chatbots that rely on static data, this agent autonomously decides what information to fetch, when to fetch it, and how to synthesize it into actionable advice.

<img width="591" height="450" alt="image" src="https://github.com/user-attachments/assets/7f94141f-e321-4164-b8ca-be95340ef1bc" />

## What Makes This "Agentic"?

This isn't just a chatbot—it's an **autonomous agent** that:
- **Plans its own actions**: Decides which tools to call based on user intent
- **Handles context switching**: Automatically tracks location changes across multi-turn conversations
- **Executes multi-step workflows**: Geocodes locations → Searches for POIs → Synthesizes data → Responds naturally
- **Adapts to data limitations**: Falls back to general knowledge when APIs don't provide relevant data (e.g., crime statistics)

### Example Flow
```
User: "Tell me about Berkeley, CA"
Agent: [geocodes Berkeley] → [searches restaurants, schools, parks] → [synthesizes into narrative]

User: "What about Oakland?"
Agent: [detects new location] → [geocodes Oakland] → [updates context] → [searches Oakland data]

User: "How's the crime there?"
Agent: [recognizes Google Maps lacks crime data] → [uses general knowledge] → [provides honest assessment]
```

## Technical Architecture

### Backend: Agentic Loop with Tool Orchestration
The backend implements the **ReAct pattern** (Reasoning + Acting):
1. **Receives user message** with current location context
2. **Calls OpenAI** with available tools (`geocode_location`, `search_places`)
3. **Executes tool calls** by querying Google Maps APIs
4. **Loops until completion**: Continues calling OpenAI with tool results until the agent produces a final response
5. **Detects context changes**: Scans conversation history for location switches and notifies frontend

**Key Implementation Details:**
- OpenAI Function Calling (GPT-3.5-turbo) for tool selection
- Stateless backend with conversation history managed per request
- Dynamic location context tracking across turns
- Google Maps Geocoding API + Places API integration

### Frontend: Reactive State Management
- **Auto-updates location context** when agent switches cities
- **Streaming-style UI** with sequential message bubbles
- **3D Avatar** (Three.js) with synchronized animations
- **Responsive design** with Framer Motion transitions

## Tech Stack
| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Three.js, Framer Motion, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **AI/APIs** | OpenAI API (Function Calling & Summarizing), Google Maps API (Geocoding, Places) |
| **Deployment** | Netlify (Frontend), Render (Backend) |

## Key Features

### 1. **Autonomous Tool Use**
The agent decides when and how to use tools without hardcoded logic:
- Geocodes new locations only when needed
- Searches for relevant POIs based on user questions
- Makes multiple parallel API calls for efficiency

### 2. **Context-Aware Conversations**
- Maintains location context across multi-turn dialogues
- Automatically updates context when user switches cities
- Assumes follow-up questions refer to current location unless stated otherwise

### 3. **Intelligent Data Synthesis**
- Converts raw API data into natural, narrative summaries
- Avoids listing raw ratings/addresses unless explicitly asked
- Provides honest assessments using general knowledge when APIs fall short

### 4. **Engaging 3D Interface**
- Interactive 3D avatar with synchronized talking animations
- Smooth message transitions with Framer Motion
- Mobile-responsive design

## What I Learned

- **Agentic AI patterns**: Implementing ReAct-style loops with OpenAI Function Calling
- **State synchronization**: Keeping frontend and backend location context in sync
- **API orchestration**: Coordinating multiple Google Maps API calls efficiently
- **Prompt engineering**: Crafting system prompts that enforce natural, user-friendly responses
- **3D web graphics**: Integrating Three.js with React for performant 3D rendering

## Future Enhancements

- [ ] Add crime statistics API for accurate safety data
- [ ] Implement conversation memory with vector database
- [ ] Add comparison mode (e.g., "Compare Berkeley vs Oakland")
- [ ] Support international locations beyond the U.S.
- [ ] Add voice input/output for hands-free interaction

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- OpenAI API Key
- Google Maps API Key (with Geocoding and Places API enabled)

### Installation

1. Clone the repository
```bash
git clone https://github.com/qeryz/spa-latest-ai.git
cd spa-latest-ai
```

2. Install dependencies
```bash
npm install
cd backend && npm install
```

3. Set up environment variables

Create `.env` in the root directory:
```env
VITE_API_URL=http://localhost:3001
```

Create `.env` in the `backend` directory:
```env
OPEN_AI_API_KEY=your_openai_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
PORT=3001
```

4. Run the application
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

---

## License

This project is licensed under the MIT License.

---

⭐️ If you found this project interesting, please consider giving it a star!

