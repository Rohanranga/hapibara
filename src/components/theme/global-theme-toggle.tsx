"use client";

import { ModeToggle } from "@/components/theme/mode-toggle";
import { motion } from "framer-motion";

const GlobalThemeToggle = () => {
  return (
    <motion.div
      className="fixed bottom-20 right-6 z-50 md:bottom-6"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: 1 // Delay to appear after page loads
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ModeToggle />
    </motion.div>
  );
};

export default GlobalThemeToggle;
