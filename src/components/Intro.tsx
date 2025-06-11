import { motion } from "framer-motion";

const Intro = () => {
  return (
    <>
      <motion.h1
        className="text-[48px] font-semibold text-titleMain mb-5"
        initial={{ opacity: 0, y: -10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.4 }}
      >
        Meet Your Agent from Another Galaxy
      </motion.h1>
      <motion.div
        className="text-textMain text-[18px]"
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.4, delay: 0.3 }}
      >
        <p>
          A highly intelligent extra-terrestrial being with a vast knowledge of
          the universe who has traveled across galaxies to share wisdom and
          insights with those seeking enlightenment. This guru possesses a
          unique perspective
        </p>
      </motion.div>
    </>
  );
};

export default Intro;
