"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-16 h-10 rounded-full p-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full blur-lg opacity-50 transition-opacity duration-300 ${
        isDark ? "bg-blue-500/30" : "bg-yellow-500/30"
      }`} />

      {/* Toggle slider */}
      <motion.div
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isDark 
            ? "bg-gradient-to-br from-slate-700 to-slate-800" 
            : "bg-gradient-to-br from-yellow-400 to-orange-500"
        }`}
        animate={{
          x: isDark ? 0 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-blue-300" />
        ) : (
          <Sun className="w-4 h-4 text-white" />
        )}
      </motion.div>

      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Moon className={`w-4 h-4 transition-opacity duration-300 ${
          isDark ? "opacity-0" : "opacity-40 text-slate-400"
        }`} />
        <Sun className={`w-4 h-4 transition-opacity duration-300 ${
          !isDark ? "opacity-0" : "opacity-40 text-slate-400"
        }`} />
      </div>
    </motion.button>
  );
}
