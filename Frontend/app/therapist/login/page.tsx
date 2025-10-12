"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
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

      // Use auth context to handle login
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
    <div className="relative min-h-screen bg-gradient-to-br from-[#2596be]/10 via-sky-50 to-indigo-50 flex items-center justify-center px-4">
      <LanguageSwitcher />
      <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <h1 className="text-3xl font-extrabold text-center mb-1">সই</h1>
        <p className="text-center text-gray-500 mb-6">
          Login To Your Account
          {role === "therapist" && (
            <span className="block text-[#2596be] text-sm font-medium">Therapist Portal</span>
          )}
          {role === "user" && (
            <span className="block text-[#2596be] text-sm font-medium">Patient Portal</span>
          )}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm mb-2">Login as</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  role === "user"
                    ? "bg-[#2596be] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole("therapist")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  role === "therapist"
                    ? "bg-[#2596be] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Therapist
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">E-mail</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-gray-400 z-10" />
              <input
                type="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-gray-400 z-10" />
              <input
                type={showPw ? "text" : "password"}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                placeholder="Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 text-gray-500 hover:text-gray-700 z-10"
                aria-label="Toggle password"
              >
                {showPw ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="text-right mt-1">
              <Link
                href="/forgot-password"
                className="text-sm text-[#2596be] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2596be] hover:bg-[#1d7a99] text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">Or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Social logins (visual) */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full border-[#2596be] text-[#2596be]"
          >
            <Facebook className="w-4 h-4 mr-2" /> Facebook
          </Button>
          <Button
            variant="outline"
            className="w-full border-[#2596be] text-[#2596be]"
          >
            <Instagram className="w-4 h-4 mr-2" /> Instagram
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          New User?{" "}
          <Link
            href="/register"
            className="text-[#2596be] font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
