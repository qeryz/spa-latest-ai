import { motion } from "framer-motion";

const ColorfulSpinner = () => (
  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 rounded-full border-4 border-t-4 border-t-blue-500 border-b-pink-500 border-l-yellow-400 border-r-green-400"
      style={{
        borderTopColor: "#3b82f6",
        borderBottomColor: "#ec4899",
        borderLeftColor: "#facc15",
        borderRightColor: "#22c55e",
        borderStyle: "solid",
        borderWidth: "4px",
        borderRadius: "50%",
      }}
    />
  </div>
);

export default ColorfulSpinner;
