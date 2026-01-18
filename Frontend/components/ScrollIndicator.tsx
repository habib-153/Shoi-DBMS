"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ScrollIndicator() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      onClick={scrollToContent}
    >
      <motion.div
        className="flex flex-col items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors duration-300"
        animate={{ y: [0, 10, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-sm font-medium">Scroll to explore</span>
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-lg" />
          <div className="relative w-8 h-12 border-2 border-slate-700 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </motion.div>
  );
}
