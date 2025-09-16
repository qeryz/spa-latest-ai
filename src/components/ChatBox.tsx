import { useEffect, useState, useRef } from "react";
import SendIcon from "../assets/send.svg";
import { motion, AnimatePresence } from "framer-motion";

// @ts-ignore
declare global {
  interface Window {
    google: any;
  }
}

interface ChatBoxProps {
  onSend: (message: string) => Promise<void>;
  loading: boolean;
  showLocationInput?: boolean;
  onLocationSelect?: (place: any) => void;
}

const ChatBox = ({
  onSend,
  loading,
  showLocationInput = false,
  onLocationSelect,
}: ChatBoxProps) => {
  const [input, setInput] = useState("");
  const [dots, setDots] = useState(".");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteServiceRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      setDots(".");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 5 ? prev + "." : "."));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  // Custom AutocompleteService for modern dropdown
  useEffect(() => {
    if (showLocationInput && window.google && window.google.maps) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current =
          new window.google.maps.places.AutocompleteService();
      }
      if (input.length > 0) {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input,
            componentRestrictions: { country: "us" },
            types: ["geocode"],
          },
          (predictions: any[], status: string) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              setSuggestions(predictions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  }, [input, showLocationInput]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: any) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { placeId: suggestion.place_id },
      (results: any, status: string) => {
        if (status === "OK" && results && results[0] && onLocationSelect) {
          onLocationSelect(results[0]);
          setInput("");
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !showLocationInput) {
      await onSend(input);
      setInput("");
    }
  };

  if (showLocationInput) {
    return (
      <div className="relative w-full max-w-md mx-auto mt-6">
        <form className="flex gap-2">
          <motion.input
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            ref={inputRef}
            type="text"
            placeholder="Enter city or address..."
            className="flex-1 bg-slate-100 border-[0.5px] border-gray-300 focus:outline-none rounded-2xl px-9 py-2 text-gray-800 text-sm shadow"
            value={input}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="off"
          />
        </form>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-lg max-h-60 overflow-y-auto animate-fade-in">
            {suggestions.map((s, idx) => (
              <li
                key={s.place_id}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-blue-50 transition"
                onClick={() => handleSuggestionClick(s)}
              >
                <span className="text-blue-500">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
                    />
                  </svg>
                </span>
                <span className="font-medium text-gray-800">
                  {s.structured_formatting.main_text}
                </span>
                <span className="text-xs text-gray-500">
                  {s.structured_formatting.secondary_text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 mt-6 w-full max-w-md mx-auto"
    >
      <motion.input
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.8 }}
        type="text"
        className="flex-1 bg-slate-100 border-[0.5px] border-gray-300 focus:outline-none rounded-2xl px-3 py-2 text-gray-800 text-sm"
        placeholder="Ask the alien anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />
      <AnimatePresence>
        {input.trim() && (
          <motion.button
            key="send-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
            type="submit"
            className={`${
              loading ? "bg-gray-400" : "bg-blue-600"
            } text-white px-4 py-1 rounded-2xl disabled:opacity-50 font-semibold flex items-center min-w-[54px] cursor-pointer`}
            disabled={loading || !input.trim()}
          >
            {loading ? dots : "Send"}
            {!loading && (
              <img
                src={SendIcon}
                alt="Send"
                className="inline-block ml-2 w-4 h-4"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  );
};

export default ChatBox;
