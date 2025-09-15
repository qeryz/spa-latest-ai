import { motion } from "framer-motion";

const GetStarted = ({
  handleClick,
}: {
  handleClick: (arg0: boolean) => void;
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.4, delay: 2.0 }}
      className="bg-slate-700 text-white px-6 py-2 rounded-xl mt-4 cursor-pointer font-semibold"
      onClick={() => handleClick(false)}
    >
      Get Started
    </motion.button>
  );
};

export default GetStarted;
