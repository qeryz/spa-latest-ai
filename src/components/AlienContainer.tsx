import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import { Alien } from "../components/Alien";

type Bubble = {
  id: number;
  text: string;
};

export const AlienContainer = ({
  bubbles,
  typing,
  currentText,
}: {
  bubbles: Bubble[];
  typing: boolean;
  currentText: string;
}) => {
  const bubblesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bubblesRef.current) {
      bubblesRef.current.scrollTop = bubblesRef.current.scrollHeight;
    }
  }, [bubbles, typing]);

  return (
    <motion.div
      className="relative w-full flex justify-center items-center"
      style={{ minHeight: 400 }}
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.8 }}
    >
      <Canvas
        style={{
          height: "100vh",
          width: "100vw",
          maxWidth: 600,
          cursor: "grab",
        }}
        camera={{ position: [0, 2.4, 2.0] }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7]} intensity={1.2} />
        <Alien action={typing ? "talk" : "idle"} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 3}
        />
      </Canvas>
      <div
        ref={bubblesRef}
        className="absolute left-3/5 top-[10%] z-10 flex flex-col items-start bg-transparent"
        style={{
          maxHeight: 320,
          padding: 10,
          overflowY: "auto",
          width: 320,
        }}
      >
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="bg-white/90 rounded-xl px-4 py-2 shadow-lg border border-gray-200 text-black text-base font-medium mb-2"
          >
            {bubble.text}
          </motion.div>
        ))}
        {typing && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 rounded-xl px-4 py-2 shadow-lg border border-gray-200 text-black text-base font-medium mb-2"
          >
            {currentText || <span className="opacity-50">Guru is typing…</span>}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
