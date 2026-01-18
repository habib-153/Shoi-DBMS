"use client";

import Link from "next/link";
import { Phone, ArrowRight, Sparkles, Heart, Shield, Users, Brain, Zap, Star, CheckCircle2, Calendar } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function UltraEnhancedBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const images = [
    "/fff.png",
    "/landing page/52CD0FD9-2638-4461-B3C3-F112EB401DD0.png",
    "/landing page/8FC770F2-49BA-4D21-917B-D884E143D4E9.png",
    "/landing page/BD8EEEE5-024D-45D6-9920-887C8A846CDD.png",
    "/landing page/C9961603-DC53-4693-A797-CC56D6CA79AD.png",
  ];

  // Animation variants for smoother transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* HERO SECTION - Main Banner */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">{/* Clean Background - No laggy animations */}

        {/* Main Content */}
        <motion.div 
          style={{ y: y1, opacity }} 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid items-center gap-16 lg:grid-cols-2 relative z-10 py-20"
        >
          {/* Left Content */}
          <div>
            {/* Animated Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-[#2596be]/20 text-[#2596be] px-6 py-3 rounded-full text-sm font-bold mb-8 border-2 border-[#2596be]/30 shadow-lg"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              AI-Powered Mental Health Platform
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants}>
              <h1 className="text-7xl md:text-8xl font-black tracking-tight mb-6">
                <motion.span 
                  className="text-[#2596be] inline-block"
                >
                  সই
                </motion.span>
              </h1>
              <div className="text-4xl md:text-5xl font-bold text-gray-800 mt-4 space-y-2">
                <motion.div variants={itemVariants}>
                  Your mental wellness
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="text-[#2596be] flex items-center gap-3"
                >
                  companion
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-10 h-10 fill-current" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-xl leading-relaxed mb-10 mt-6"
            >
              It's okay not to be okay. It's okay to ask for help. Connect with
              qualified therapists and take control of your mental health journey.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(37, 150, 190, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[#2596be] rounded-2xl" />
                  <div className="absolute inset-0 bg-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-3 text-white font-bold text-lg px-10 py-5 rounded-2xl">
                    Get Started Free
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>

              <a href="tel:01776632344">
                <motion.div
                  whileHover={{ scale: 1.05, borderColor: "#2596be" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
                  className="flex items-center justify-center gap-3 border-2 border-[#2596be]/50 text-[#2596be] font-bold text-lg px-10 py-5 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-[#2596be]/5 transition-all duration-300 shadow-lg"
                >
                  <Phone className="w-6 h-6" />
                  24/7 Emergency Help
                </motion.div>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6"
            >
              {[
                { number: "10K+", label: "Happy Clients", icon: Users },
                { number: "500+", label: "Expert Therapists", icon: Shield },
                { number: "98%", label: "Success Rate", icon: Star },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.05 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                  className="text-center p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-[#2596be]/20 shadow-lg cursor-pointer"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                    className="flex justify-center mb-2"
                  >
                    <stat.icon className="w-8 h-8 text-[#2596be]" />
                  </motion.div>
                  <div className="text-3xl font-black text-[#2596be] mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right - Image Gallery with ALL 5 images */}
          <motion.div
            variants={itemVariants}
            style={{ y: y2 }}
            className="relative"
          >
            {/* Main Image - Center */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring" as const, stiffness: 300 }}
              className="relative z-10"
            >
              <img
                src={images[0]}
                alt="Mental Health Support"
                className="relative w-full rounded-3xl shadow-2xl border-4 border-white"
              />
              {/* Floating Badge */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 right-6 bg-[#2596be] px-6 py-3 rounded-full shadow-xl border-2 border-white"
              >
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  24/7 Available
                </span>
              </motion.div>
            </motion.div>

            {/* Floating Image 1 - Top Left */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -left-8 w-32 h-32 z-20"
            >
              <img
                src={images[1]}
                alt="Therapy Session"
                className="w-full h-full object-cover rounded-2xl shadow-xl border-4 border-white"
              />
            </motion.div>

            {/* Floating Image 2 - Top Right */}
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-12 w-40 h-40 z-20"
            >
              <img
                src={images[2]}
                alt="Support"
                className="w-full h-full object-cover rounded-2xl shadow-xl border-4 border-white"
              />
            </motion.div>

            {/* Floating Image 3 - Bottom Left */}
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 w-36 h-36 z-20"
            >
              <img
                src={images[3]}
                alt="Wellness"
                className="w-full h-full object-cover rounded-2xl shadow-xl border-4 border-white"
              />
            </motion.div>

            {/* Floating Image 4 - Bottom Right */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-8 w-28 h-28 z-20"
            >
              <img
                src={images[4]}
                alt="Care"
                className="w-full h-full object-cover rounded-2xl shadow-xl border-4 border-white"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-sm font-medium text-[#2596be]">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-[#2596be] rounded-full flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-[#2596be] rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
