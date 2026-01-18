"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AnimatedCard, FadeIn, SlideIn } from "@/components/animated/AnimatedComponents";
import { motion } from "framer-motion";

import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  LogIn,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("user");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || t("login.error"));
        return;
      }

      login({ ...data.user, role: data.role });
      toast.success(t("login.success"));
      
      if (data.role === "therapist") {
        router.push("/therapist/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t("login.tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4 overflow-hidden">
      <LanguageSwitcher />
      
      <AnimatedCard className="w-full max-w-md relative z-10">
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-[#2596be]/20 shadow-2xl rounded-3xl">
          {/* Logo */}
          <SlideIn direction="down" delay={0.1}>
            <div className="flex justify-center mb-6">
              <motion.img 
                src="/4F43E8E1-1786-4A37-93AF-2E381EE3B968.png" 
                alt="সই Logo" 
                className="h-20 w-auto"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </SlideIn>
        
          <FadeIn delay={0.2}>
            <h1 className="text-3xl font-bold text-center mb-1 text-[#2596be]">সই</h1>
            <p className="text-center text-muted-foreground mb-6">
              Login To Your Account
              {role === "therapist" && (
                <span className="block text-[#2596be] text-sm font-medium mt-1">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Therapist Portal
                </span>
              )}
            </p>
          </FadeIn>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selection */}
            <FadeIn delay={0.3}>
              <div>
                <label className="block text-sm mb-2 font-medium text-gray-700">Login as</label>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setRole("user")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      role === "user"
                        ? "bg-[#2596be] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Patient
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setRole("therapist")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      role === "therapist"
                        ? "bg-[#2596be] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Therapist
                  </motion.button>
                </div>
              </div>
            </FadeIn>

            {/* Email Input */}
            <SlideIn direction="left" delay={0.4}>
              <div className="relative">
                <label htmlFor="email" className="block text-sm mb-2 font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-modern pl-10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
            </SlideIn>

            {/* Password Input */}
            <SlideIn direction="right" delay={0.5}>
              <div className="relative">
                <label htmlFor="password" className="block text-sm mb-2 font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2596be] transition-colors"
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </SlideIn>

            {/* Submit Button */}
            <FadeIn delay={0.6}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  className="w-full btn-primary py-6 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Login
                    </>
                  )}
                </Button>
              </motion.div>
            </FadeIn>
          </form>

          {/* Divider */}
          <FadeIn delay={0.7}>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </FadeIn>

          {/* Social Login */}
          <FadeIn delay={0.8}>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Facebook</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Instagram className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-medium">Instagram</span>
              </motion.button>
            </div>
          </FadeIn>

          {/* Register Link */}
          <FadeIn delay={0.9}>
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#2596be] font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </FadeIn>
        </Card>
      </AnimatedCard>
    </div>
  );
}
