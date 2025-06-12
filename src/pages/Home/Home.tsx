import { lazy, Suspense, useState } from "react";

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

  const handleSend = async (msg: string) => {
    setLoading(true);
    setBubbles([]);
    setCurrentText("");
    const reply = await fetchChatResponse(msg);
    const splitBubbles = splitMessageIntoBubbles(reply);
    await showBubblesSequentially(splitBubbles);
    setLoading(false);
  };

  return (
    <div className="flex-col justify-center items-center px-5 py-5 sm:px-50 sm:py-20 relative min-h-screen">
      <Suspense fallback={<ColorfulSpinner />}>
        {showIntro ? (
          <>
            <Intro />
            <GetStarted handleClick={setShowIntro} />
          </>
        ) : (
          <>
            <ChatBox onSend={handleSend} loading={loading} />
          </>
        )}
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
