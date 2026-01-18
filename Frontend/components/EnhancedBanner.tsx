"use client";

import Link from "next/link";
import { Phone, ArrowRight, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function EnhancedBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#2596be]/5">
      {/* Floating elements with original colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-[10%] w-32 h-32 bg-[#2596be]/10 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-[15%] w-24 h-24 bg-[#2596be]/15 rounded-full blur-2xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-[20%] w-16 h-16 bg-[#2596be]/12 rounded-full blur-xl"
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid items-center gap-16 lg:grid-cols-2 relative z-10">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#2596be]/10 text-[#2596be] px-4 py-2 rounded-full text-sm font-medium mb-8 border border-[#2596be]/20"
          >
            <Sparkles className="w-4 h-4" />
            Mental Health Support Platform
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6"
          >
            <span className="text-[#2596be]">সই</span>
            <div className="text-4xl md:text-5xl font-normal text-gray-700 mt-4">
              Your mental wellness
              <span className="block text-[#2596be]">companion</span>
            </div>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl text-gray-600 max-w-xl leading-relaxed mb-10"
          >
            It's okay not to be okay. It's okay to ask for help. Connect with
            qualified therapists and take control of your mental health journey.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link href="/register" className="btn-primary text-lg px-8 py-4 group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a href="tel:01776632344" className="btn-secondary text-lg px-8 py-4 group">
              <Phone className="w-5 h-5" />
              Emergency Help
            </a>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid gap-6 sm:grid-cols-2"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ duration: 0.3 }}
              className="card-modern p-6 group"
            >
              <div className="w-12 h-12 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#2596be]/20 transition-colors duration-300">
                <Heart className="w-6 h-6 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                For Individuals
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Professional counseling and mental health support tailored to your
                needs.
              </p>
              <Link
                href="/for-users"
                className="inline-flex items-center gap-2 text-[#2596be] font-medium group-hover:gap-3 transition-all duration-200"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ duration: 0.3 }}
              className="card-modern p-6 group"
            >
              <div className="w-12 h-12 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#2596be]/20 transition-colors duration-300">
                <Sparkles className="w-6 h-6 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                For Therapists
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Complete practice management platform with secure telehealth
                capabilities.
              </p>
              <Link
                href="/for-specialists"
                className="inline-flex items-center gap-2 text-[#2596be] font-medium group-hover:gap-3 transition-all duration-200"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero Image - Using images from landing page folder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="relative group">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#2596be]/20 to-transparent rounded-3xl blur-3xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <img
              src="/landing page/FFB18686-A6C6-4FA3-A9AA-B6D1F69391F5.png"
              alt="Mental Health Support"
              className="relative w-full max-w-lg rounded-3xl shadow-2xl object-cover group-hover:scale-105 transition-all duration-700"
            />
            {/* Floating badge */}
            <motion.div
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20"
            >
              <span className="text-sm font-medium text-[#2596be]">24/7 Support</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
