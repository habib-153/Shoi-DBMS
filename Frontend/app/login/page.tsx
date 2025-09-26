"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  LogIn,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
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

      toast.success(t("login.success"));
      if (role === "specialist") {
        router.push("/therapists");
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
    <div className="relative min-h-screen bg-gradient-to-br from-[#2596be]/10 via-sky-50 to-indigo-50 flex items-center justify-center px-4">
      <LanguageSwitcher />
      <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          {t("login.title")}
        </h2>
        <p className="text-center text-gray-500 mb-6">{t("login.subtitle")}</p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1">{t("login.email")}</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder={t("login.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1">{t("login.password")}</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type={showPw ? "text" : "password"}
                placeholder={t("login.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-right mt-1">
              <Link
                href="/forgot-password"
                className="text-sm text-[#2596be] hover:underline"
              >
                {t("login.forgotPassword")}
              </Link>
            </div>
          </div>

          {/* Role select */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2596be]"
          >
            <option value="user">{t("login.user")}</option>
            <option value="specialist">{t("login.specialist")}</option>
          </select>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2596be] hover:bg-[#1d7a99] text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? t("login.loading") : t("login.button")}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">Or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Social logins */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full border-[#2596be] text-[#2596be]">
            <Facebook className="w-4 h-4 mr-2" /> Facebook
          </Button>
          <Button variant="outline" className="w-full border-[#2596be] text-[#2596be]">
            <Instagram className="w-4 h-4 mr-2" /> Instagram
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t("login.newUser")}{" "}
          <Link href="/register" className="text-[#2596be] font-semibold hover:underline">
            {t("login.register")}
          </Link>
        </p>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">{t("login.secure")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-700">{t("login.professional")}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
