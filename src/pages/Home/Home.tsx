import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

const Intro = lazy(() => import("../../components/Intro"));
const GetStarted = lazy(() => import("../../components/GetStarted"));
const ChatBox = lazy(() => import("../../components/ChatBox"));
import AlienContainer from "../../components/AlienContainer";

import { splitMessageIntoBubbles } from "../../utils/utils";
import { fetchChatResponse } from "../../api/chat";
import ColorfulSpinner from "../../components/Spinner";

// Replace fetchPOIs with a real backend call
async function fetchPOIs(lat: number, lng: number) {
  try {
    const response = await axios.post("/api/pois", { lat, lng });
    return response.data.pois;
  } catch (err) {
    console.error("Failed to fetch POIs:", err);
    return [];
  }
}

function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [bubbles, setBubbles] = useState<{ id: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const [poiData, setPoiData] = useState<any[]>([]);

  const initialMessage =
    "Hello, Earthling! I'm Zog from the planet Xebulon. Let's start off by entering the location you wish to move to.";

  const handleGetStarted = () => {
    setShowIntro(false);
    showBubblesSequentially([initialMessage]);
  };

  // Helper: Typing animation for a single bubble
  const typeBubble = (text: string, cb: () => void) => {
    setCurrentText("");
    let i = 0;
    setTyping(true);
    const interval = setInterval(() => {
      setCurrentText(text.slice(0, i + 1));
      i++;
      if (i === text.length) {
        clearInterval(interval);
        setTyping(false);
        cb();
      }
    }, 20); // Typing speed (ms per character)
  };

  // Show bubbles one by one with typing animation
  const showBubblesSequentially = async (bubblesArr: string[]) => {
    setBubbles([]);
    for (let i = 0; i < bubblesArr.length; i++) {
      await new Promise<void>((resolve) => {
        typeBubble(bubblesArr[i], () => {
          setBubbles((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), text: bubblesArr[i] },
          ]);
          setCurrentText("");
          setTimeout(resolve, 500);
        });
      });
    }
  };

  // Handler for when a location is selected from autocomplete
  const handleLocationSelect = async (place: any) => {
    setSelectedPlace(place);
    setLocationSelected(true);
    setShowLocationInput(false);
    setBubbles([]);
    setCurrentText("");
    showBubblesSequentially([
      `You selected: ${place.formatted_address}`,
      "Analyzing the area... (fetching points of interest)",
    ]);
    setLoading(true);
    // Get lat/lng from place geometry
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();
    if (lat && lng) {
      const pois = await fetchPOIs(lat, lng);
      setPoiData(pois); // Store POIs for future questions
      // Send POIs to GPT for summary
      const summaryPrompt = `Here is data about points of interest near ${
        place.formatted_address
      }:\n${JSON.stringify(
        pois,
        null,
        2
      )}\n\nPlease provide a brief, well-rounded summary of why or why not this is a good place to move to, using the data above.`;
      const reply = await fetchChatResponse(summaryPrompt);
      const splitBubbles = splitMessageIntoBubbles(reply);
      await showBubblesSequentially(splitBubbles);
    } else {
      showBubblesSequentially([
        "Could not get location details. Please try again.",
      ]);
    }
    setLoading(false);
  };

  const handleSend = async (msg: string) => {
    setLoading(true);
    setBubbles([]);
    setCurrentText("");
    // Always include POI data in the prompt if available
    const prompt = poiData.length
      ? `User question: ${msg}\n\nHere is data about points of interest near the user's chosen location:\n${JSON.stringify(
          poiData,
          null,
          2
        )}\n\nUse the data above to answer the user's question as specifically as possible.`
      : msg;
    const reply = await fetchChatResponse(prompt);
    const splitBubbles = splitMessageIntoBubbles(reply);
    await showBubblesSequentially(splitBubbles);
    setLoading(false);
  };

  return (
    <div className="flex-col justify-center items-center px-5 py-5 sm:px-50 sm:py-20 relative min-h-screen">
      <Suspense fallback={<ColorfulSpinner />}>
        <AnimatePresence mode="wait">
          {showIntro ? (
            <>
              <motion.div
                key="intro"
                exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              >
                <Intro />
              </motion.div>
              <motion.div
                key="spacer"
                exit={{ opacity: 0, x: -10, filter: "blur(8px)" }}
              >
                <motion.img
                  src="/strands.svg"
                  alt="Banner"
                  className="absolute top-15 left-0 w-full h-full object-cover rounded-lg"
                  initial={{
                    clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
                    filter: "blur(20px)",
                  }}
                  animate={{
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                    filter: "blur(0px)",
                  }}
                  transition={{ duration: 1.4, delay: 1.5 }}
                />
              </motion.div>
              <motion.div
                key="getstarted"
                exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              >
                <GetStarted handleClick={handleGetStarted} />
              </motion.div>
            </>
          ) : (
            <motion.div
              key="chatbox"
              exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            >
              <ChatBox
                onSend={handleSend}
                loading={loading}
                showLocationInput={showLocationInput}
                onLocationSelect={handleLocationSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
      {/* AlienContainer is rendered outside Suspense to prevent
      losing WebGL context and subsequent crashing */}
      {!showIntro && (
        <AlienContainer
          bubbles={bubbles}
          typing={typing}
          currentText={currentText}
        />
      )}
    </div>
  );
}

export default Home;
