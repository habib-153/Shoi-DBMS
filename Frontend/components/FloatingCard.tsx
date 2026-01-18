"use client";

import { motion } from "framer-motion";
import { ReactNode, useRef } from "react";

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  glowColor?: string;
}

export default function FloatingCard({
  children,
  delay = 0,
  className = "",
  glowColor = "cyan",
}: FloatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getGlowColorClass = () => {
    const colorMap: { [key: string]: string } = {
      cyan: "from-cyan-500/20 to-blue-500/20",
      purple: "from-purple-500/20 to-pink-500/20",
      blue: "from-blue-500/20 to-indigo-500/20",
      green: "from-green-500/20 to-emerald-500/20",
    };
    return colorMap[glowColor] || colorMap.cyan;
  };

  const getBorderColorClass = () => {
    const colorMap: { [key: string]: string } = {
      cyan: "border-cyan-500/30 hover:border-cyan-400/50",
      purple: "border-purple-500/30 hover:border-purple-400/50",
      blue: "border-blue-500/30 hover:border-blue-400/50",
      green: "border-green-500/30 hover:border-green-400/50",
    };
    return colorMap[glowColor] || colorMap.cyan;
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3 },
      }}
      className={`group relative ${className}`}
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getGlowColorClass()} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Card content */}
      <div
        className={`relative backdrop-blur-md bg-gradient-to-br from-slate-800/50 to-slate-900/50 border ${getBorderColorClass()} rounded-2xl p-8 shadow-xl overflow-hidden transition-all duration-300`}
      >
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}
