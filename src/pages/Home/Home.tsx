import { useState } from "react";

import { Intro } from "../../components/Intro";

import { ChatBox } from "../../components/ChatBox";
import { splitMessageIntoBubbles } from "../../components/utils";
import { AlienContainer } from "../../components/AlienContainer";
import { GetStarted } from "../../components/GetStarted";

async function fetchChatResponse(message: string): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    if (response.ok && data.result) {
      return data.result;
    } else {
      return "Sorry, I couldn't process that request.";
    }
  } catch (error) {
    return "An error occurred while fetching the response.";
  }
}

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
    <div className="flex-col justify-center items-center px-50 py-20 relative min-h-screen">
      {showIntro && (
        <>
          <Intro />
          <GetStarted handleClick={setShowIntro} />
        </>
      )}
      {!showIntro && (
        <>
          <ChatBox onSend={handleSend} loading={loading} />
          <AlienContainer
            bubbles={bubbles}
            typing={typing}
            currentText={currentText}
          />
        </>
      )}
    </div>
  );
}

export default Home;
