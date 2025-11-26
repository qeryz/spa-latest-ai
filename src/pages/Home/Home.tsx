import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { showBubblesSequentially } from "../../utils/agentHelpers";

const Intro = lazy(() => import("../../components/Intro"));
const GetStarted = lazy(() => import("../../components/GetStarted"));
const ChatBox = lazy(() => import("../../components/ChatBox"));
import AlienContainer from "../../components/AlienContainer";

import { splitMessageIntoBubbles } from "../../utils/utils";
import { fetchChatResponse } from "../../api/chat";
import ColorfulSpinner from "../../components/Spinner";

function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [bubbles, setBubbles] = useState<{ id: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const initialMessage =
    "Hello, Earthling! I'm Zorg from the planet Xebulon. Let's start off by entering the location you wish to move to.";

  const handleGetStarted = () => {
    setShowIntro(false);
    showBubblesSequentially(
      [initialMessage],
      setBubbles,
      setCurrentText,
      setTyping
    );
  };

  // Handler for when a location is selected from autocomplete
  const handleLocationSelect = async (place: any) => {
    setShowLocationInput(false);
    setBubbles([]);
    setCurrentText("");
    showBubblesSequentially(
      [`Ah, ${place.formatted_address}`, "One second while I ponder..."],
      setBubbles,
      setCurrentText,
      setTyping
    );
    setLoading(true);
    // Get lat/lng from place geometry
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();
    if (lat && lng) {
      const newLocation = {
        lat,
        lng,
        address: place.formatted_address,
      };
      setCurrentLocation(newLocation);
      
      const summaryPrompt = `I am considering moving to ${place.formatted_address}. Please analyze this location for me.`;
      const response = await fetchChatResponse(summaryPrompt, newLocation);
      
      const splitBubbles = splitMessageIntoBubbles(response.result);
      await showBubblesSequentially(
        splitBubbles,
        setBubbles,
        setCurrentText,
        setTyping
      );
    } else {
      showBubblesSequentially(
        ["Could not get location details. Please try again."],
        setBubbles,
        setCurrentText,
        setTyping
      );
    }
    setLoading(false);
  };

  const handleSend = async (msg: string) => {
    setLoading(true);
    setBubbles([]);
    setCurrentText("");
    
    // Pass the message and current location context
    const response = await fetchChatResponse(msg, currentLocation || undefined);
    
    // If the agent switched to a new location, update our state
    if (response.newLocation) {
      setCurrentLocation({
        lat: response.newLocation.lat,
        lng: response.newLocation.lng,
        address: response.newLocation.formatted_address,
      });
    }
    
    const splitBubbles = splitMessageIntoBubbles(response.result);
    await showBubblesSequentially(
      splitBubbles,
      setBubbles,
      setCurrentText,
      setTyping
    );
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
