"use client";

import Link from "next/link";
import { Phone, ArrowRight, Sparkles, Heart, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function EnhancedBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 1,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a1929]">
      {/* Animated background */}
      <FuturisticBackground />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid items-center gap-16 lg:grid-cols-2 relative z-10 py-20">
        {/* Left content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-white"
        >
          {/* Animated badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-500/30" />
              <Sparkles className="w-4 h-4 relative z-10 text-cyan-400 animate-pulse" />
              <span className="relative z-10 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                AI-Powered Mental Health Support
              </span>
            </div>
          </motion.div>

          {/* Main heading with gradient text */}
          <motion.h1 variants={itemVariants} className="mb-6">
            <span className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent block mb-4">
              সই
            </span>
            <div className="text-3xl md:text-4xl lg:text-5xl font-light text-slate-200 mt-4">
              Your mental wellness
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-semibold">
                companion
              </span>
            </div>
          </motion.h1>

          {/* Description with glow effect */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-300 max-w-xl leading-relaxed mb-10"
          >
            It's okay not to be okay. It's okay to ask for help. Connect with
            qualified therapists and take control of your mental health journey.
          </motion.p>

          {/* CTA Buttons with neon glow */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link href="/register" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-300 group-hover:scale-105">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>

            <a href="tel:01776632344" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2 bg-slate-800/50 backdrop-blur-sm border-2 border-purple-500/50 hover:border-purple-400 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-300 group-hover:scale-105">
                <Phone className="w-5 h-5" />
                Emergency Help
              </div>
            </a>
          </motion.div>

          {/* Feature cards with glassmorphism */}
          <motion.div
            variants={containerVariants}
            className="grid gap-6 sm:grid-cols-2"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative p-6 rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  For Individuals
                </h3>
                <p className="text-slate-400 mb-4 text-sm">
                  Professional counseling and mental health support tailored to
                  your needs.
                </p>
                <Link
                  href="/for-users"
                  className="inline-flex items-center gap-2 text-cyan-400 font-medium text-sm group-hover:gap-3 transition-all duration-200"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative p-6 rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  For Therapists
                </h3>
                <p className="text-slate-400 mb-4 text-sm">
                  Complete practice management platform with secure telehealth
                  capabilities.
                </p>
                <Link
                  href="/for-specialists"
                  className="inline-flex items-center gap-2 text-purple-400 font-medium text-sm group-hover:gap-3 transition-all duration-200"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right side - Hero Image with 3D effect */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center perspective-1000"
        >
          <motion.div
            className="relative group"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              rotateY: mousePosition.x * 0.5,
              rotateX: -mousePosition.y * 0.5,
            }}
          >
            {/* Neon glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse" />

            {/* Holographic border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 p-[2px]">
              <div className="w-full h-full bg-slate-900 rounded-3xl" />
            </div>

            {/* Main image */}
            <img
              src="/landing page/FFB18686-A6C6-4FA3-A9AA-B6D1F69391F5.png"
              alt="Mental Health Support"
              className="relative w-full max-w-lg rounded-3xl object-cover shadow-2xl group-hover:scale-[1.02] transition-all duration-700 z-10"
            />

            {/* Floating badge with glassmorphism */}
            <motion.div
              className="absolute top-6 right-6 backdrop-blur-md bg-white/10 px-4 py-2 rounded-full shadow-lg border border-white/20 z-20"
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                24/7 Support
              </span>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-4 -left-4 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-0" />
    </section>
  );
}
