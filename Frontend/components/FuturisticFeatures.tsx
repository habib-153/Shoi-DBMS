"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Globe, Lock, Sparkles, Heart, Brain, Users, Zap } from "lucide-react";
import FloatingCard from "./FloatingCard";
import { useRef } from "react";

export default function FuturisticFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Compassionate Care",
      description:
        "Our experienced therapists provide empathetic and understanding support for your mental health journey.",
      color: "cyan",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Accessible Online",
      description:
        "Connect with qualified professionals from the comfort of your home through our secure platform.",
      color: "purple",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Secure & Private",
      description:
        "Your privacy and confidentiality are our top priorities with end-to-end encrypted sessions.",
      color: "blue",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Matching",
      description:
        "Advanced algorithms to match you with the perfect therapist based on your unique needs and preferences.",
      color: "green",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Therapists",
      description:
        "Access to a diverse network of licensed mental health professionals with specialized expertise.",
      color: "cyan",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Support",
      description:
        "Get immediate help when you need it most with our 24/7 crisis support and emergency services.",
      color: "purple",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a1929]"
    >
      {/* Animated background elements */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37, 150, 190, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 150, 190, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-500/30" />
            <Sparkles className="w-4 h-4 relative z-10 text-cyan-400 animate-pulse" />
            <span className="relative z-10 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
              Why Choose Us
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
              Trusted Mental Health
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Support Platform
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Professional, compassionate care designed to help you navigate life's
            challenges with confidence and support.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FloatingCard
              key={index}
              delay={index * 0.1}
              glowColor={feature.color}
            >
              <div className="flex flex-col h-full">
                {/* Icon */}
                <div
                  className={`w-16 h-16 mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                    feature.color === "cyan"
                      ? "from-cyan-500/20 to-blue-500/20 text-cyan-400"
                      : feature.color === "purple"
                      ? "from-purple-500/20 to-pink-500/20 text-purple-400"
                      : feature.color === "blue"
                      ? "from-blue-500/20 to-indigo-500/20 text-blue-400"
                      : "from-green-500/20 to-emerald-500/20 text-green-400"
                  } group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 leading-relaxed flex-grow">
                  {feature.description}
                </p>

                {/* Decorative line */}
                <motion.div
                  className="mt-6 h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
                />
              </div>
            </FloatingCard>
          ))}
        </div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 text-slate-400">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-medium">
              Trusted by thousands of users worldwide
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}
