"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Youtube, MapPin, Mail, Phone } from "lucide-react";

export default function FuturisticFooter() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <footer className="relative pt-20 pb-8 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a1929] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37, 150, 190, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 150, 190, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-10 md:grid-cols-3 mb-12"
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-lg" />
                <img
                  src="/4F43E8E1-1786-4A37-93AF-2E381EE3B968.png"
                  alt="সই"
                  className="relative w-16 h-16 object-contain"
                />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                সই
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Your trusted companion for mental wellness. Professional, compassionate
              care designed to help you navigate life's challenges.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+8801xxxxxxxxx"
                className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors duration-200">
                  <Phone className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm">+880 1xxxxxxxxx</span>
              </a>

              <a
                href="mailto:info@shoi.com"
                className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors duration-200">
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm">info@shoi.com</span>
              </a>

              <a
                href="#"
                className="flex items-start gap-3 text-slate-300 hover:text-cyan-400 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors duration-200 flex-shrink-0">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-sm">
                  <span>United International University</span>
                  <br />
                  <span>Madani Avenue, Dhaka</span>
                </div>
              </a>
            </div>

            <Link
              href="#"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors duration-200"
            >
              <MapPin className="w-4 h-4" />
              SEE ON MAP
            </Link>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Counselling", href: "/#services" },
                { label: "Test & Games", href: "/#tests" },
                { label: "Blogs", href: "/#blogs" },
                { label: "News & Events", href: "/#events" },
                { label: "Positivity Calendar", href: "/#positivity" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social & Quick Links */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div>
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full" />
                Follow Us
              </h4>
              <div className="flex items-center gap-4">
                {[
                  { icon: <Facebook className="w-5 h-5" />, href: "#", color: "from-blue-500 to-blue-600" },
                  { icon: <Instagram className="w-5 h-5" />, href: "#", color: "from-pink-500 to-purple-600" },
                  { icon: <Linkedin className="w-5 h-5" />, href: "#", color: "from-cyan-500 to-blue-600" },
                  { icon: <Youtube className="w-5 h-5" />, href: "#", color: "from-red-500 to-red-600" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${social.color} rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                    <div className="relative w-12 h-12 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                      {social.icon}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xl font-bold text-white mb-4">Stay Updated</h4>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-white text-sm font-medium transition-all duration-200"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider with gradient */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-8"
        />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>© 2025</span>
            <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              সই
            </span>
            <span>™. All Rights Reserved.</span>
            <span className="text-slate-600">Version 25.7.0</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { label: "About", href: "/about" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Book a Session", href: "/appointments" },
            ].map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="hover:text-cyan-400 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950 to-transparent" />
    </footer>
  );
}
