"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Brain, Shield, Heart, Users, Calendar, Zap, Star, Award, Clock, Globe, MessageCircle, Video } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Advanced AI algorithms match you with the perfect therapist based on your needs and preferences",
    gradient: "from-[#2596be] to-cyan-500",
  },
  {
    icon: Shield,
    title: "100% Confidential",
    description: "Your privacy is our priority. All sessions and data are encrypted and completely confidential",
    gradient: "from-cyan-500 to-[#2596be]",
  },
  {
    icon: Video,
    title: "Video & Chat Sessions",
    description: "Connect with therapists through secure video calls or text chat from the comfort of your home",
    gradient: "from-[#2596be] to-cyan-400",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book appointments that fit your schedule. Morning, evening, or weekend - we're here for you",
    gradient: "from-cyan-400 to-[#2596be]",
  },
  {
    icon: Users,
    title: "Expert Therapists",
    description: "Connect with licensed, experienced mental health professionals specialized in various areas",
    gradient: "from-[#2596be] to-cyan-500",
  },
  {
    icon: Heart,
    title: "Holistic Approach",
    description: "Track your mood, set goals, and access resources for a comprehensive wellness journey",
    gradient: "from-cyan-500 to-cyan-400",
  },
  {
    icon: Globe,
    title: "Available Worldwide",
    description: "Access mental health support anywhere, anytime with our global network of therapists",
    gradient: "from-cyan-400 to-[#2596be]",
  },
  {
    icon: Award,
    title: "Evidence-Based",
    description: "Therapies based on proven clinical methods and latest psychological research",
    gradient: "from-[#2596be] to-cyan-600",
  },
  {
    icon: Clock,
    title: "24/7 Emergency Support",
    description: "Round-the-clock crisis support for when you need immediate help",
    gradient: "from-cyan-600 to-[#2596be]",
  },
];

export default function UltraEnhancedFeatures() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden bg-gradient-to-b from-white via-cyan-50/20 to-white">
      {/* Clean Background - No laggy animations */}

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          style={{ opacity }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2596be]/20 to-cyan-400/20 text-[#2596be] px-6 py-3 rounded-full text-sm font-bold mb-6 border-2 border-[#2596be]/30"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Zap className="w-5 h-5" />
            </motion.div>
            Why Choose সই
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-6"
          >
            <span className="bg-gradient-to-r from-[#2596be] via-cyan-500 to-[#2596be] bg-clip-text text-transparent">
              Everything you need
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            A comprehensive platform designed to support your mental wellness journey with cutting-edge technology and compassionate care
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative"
              >
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#2596be]/20 to-cyan-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Main Card */}
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-gray-100 group-hover:border-[#2596be]/30 transition-all duration-300 h-full shadow-lg group-hover:shadow-2xl overflow-hidden">
                  {/* Animated Background on Hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />
                  
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Icon Container */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="relative mb-6"
                  >
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Pulsing Ring */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-30`}
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-4 relative z-10"
                  >
                    <span className="group-hover:bg-gradient-to-r group-hover:from-[#2596be] group-hover:to-cyan-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {feature.title}
                    </span>
                  </motion.h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed relative z-10">
                    {feature.description}
                  </p>

                  {/* Hover Arrow */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-6 right-6"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2596be] to-cyan-500 flex items-center justify-center">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Corner Accent */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a
              href="/register"
              className="group relative inline-flex items-center gap-3 px-12 py-6 text-lg font-bold text-white bg-gradient-to-r from-[#2596be] to-cyan-500 rounded-2xl shadow-2xl shadow-[#2596be]/30 hover:shadow-[#2596be]/50 transition-all duration-300 overflow-hidden"
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-[#2596be]"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              
              <span className="relative z-10">Start Your Journey Today</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                <Star className="w-6 h-6 fill-current" />
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
