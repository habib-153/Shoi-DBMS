"use client";

import { motion } from "framer-motion";
import { Shield, Globe, Lock, Heart, Brain, Users } from "lucide-react";

export default function EnhancedFeatures() {
  const features = [
    {
      icon: <Heart className="w-8 h-8 text-[#2596be]" />,
      title: "Compassionate Care",
      description:
        "Our experienced therapists provide empathetic and understanding support for your mental health journey.",
    },
    {
      icon: <Globe className="w-8 h-8 text-[#2596be]" />,
      title: "Accessible Online",
      description:
        "Connect with qualified professionals from the comfort of your home through our secure platform.",
    },
    {
      icon: <Lock className="w-8 h-8 text-[#2596be]" />,
      title: "Secure & Private",
      description:
        "Your privacy and confidentiality are our top priorities with end-to-end encrypted sessions.",
    },
    {
      icon: <Brain className="w-8 h-8 text-[#2596be]" />,
      title: "Expert Matching",
      description:
        "Get matched with the perfect therapist based on your unique needs and preferences.",
    },
    {
      icon: <Users className="w-8 h-8 text-[#2596be]" />,
      title: "Licensed Professionals",
      description:
        "Access to a diverse network of licensed mental health professionals with specialized expertise.",
    },
    {
      icon: <Shield className="w-8 h-8 text-[#2596be]" />,
      title: "24/7 Support",
      description:
        "Get immediate help when you need it most with our crisis support and emergency services.",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-[#2596be]/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#2596be]/10 text-[#2596be] px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            Why Choose Us
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Trusted Mental Health Support
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Professional, compassionate care designed to help you navigate life's
            challenges with confidence and support.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              whileHover={{
                scale: 1.05,
                y: -10,
              }}
              className="card-modern p-8 text-center group cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#2596be]/20 transition-colors duration-300"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 text-gray-600">
            <Shield className="w-5 h-5 text-[#2596be]" />
            <span className="text-sm font-medium">
              Trusted by thousands of users worldwide
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
