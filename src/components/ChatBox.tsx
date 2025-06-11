import { useEffect, useState } from "react";
import SendIcon from "../assets/send.svg";
import { motion, AnimatePresence } from "framer-motion";

interface ChatBoxProps {
  onSend: (message: string) => Promise<void>;
  loading: boolean;
}

const ChatBox = ({ onSend, loading }: ChatBoxProps) => {
  const [input, setInput] = useState("");
  const [dots, setDots] = useState(".");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await onSend(input);
      setInput("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 mt-6 w-full max-w-md mx-auto"
    >
      <motion.input
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.2 }}
        type="text"
        className="flex-1 bg-slate-100 border-1 border-gray-300 focus:outline-none rounded px-3 py-2 text-gray-800 text-sm"
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
            } text-white px-4 py-1 rounded-2xl disabled:opacity-50 font-semibold flex items-center min-w-[54px]`}
            disabled={loading || !input.trim()}
          >
            {loading ? dots : "Send"}
            {!loading && (
              <img
                src={SendIcon}
                alt="Send"
                className="inline-block ml-2 w-5 h-5"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  );
};

export default ChatBox;
