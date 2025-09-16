import type { Dispatch, SetStateAction } from "react";
import axios from "axios";

export const typeBubble = (
  text: string,
  setCurrentText: Dispatch<SetStateAction<string>>,
  setTyping: Dispatch<SetStateAction<boolean>>,
  cb: () => void
) => {
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
  }, 20);
};

export const showBubblesSequentially = async (
  bubblesArr: string[],
  setBubbles: Dispatch<SetStateAction<{ id: number; text: string }[]>>,
  setCurrentText: Dispatch<SetStateAction<string>>,
  setTyping: Dispatch<SetStateAction<boolean>>
) => {
  setBubbles([]);
  for (let i = 0; i < bubblesArr.length; i++) {
    await new Promise<void>((resolve) => {
      typeBubble(bubblesArr[i], setCurrentText, setTyping, () => {
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

export async function fetchPOIs(lat: number, lng: number) {
  try {
    const response = await axios.post("/api/pois", { lat, lng });
    return response.data.pois;
  } catch (err) {
    console.error("Failed to fetch POIs:", err);
    return [];
  }
}
