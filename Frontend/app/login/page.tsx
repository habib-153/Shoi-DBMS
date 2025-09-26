"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Login() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default role

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t('login.error'));
        return;
      }

      toast.success(t('login.success'));
      
      // Route based on user type
      if (role === "specialist") {
        router.push("/therapists");
      } else {
        router.push("/");  // or "/dashboard" if you have a user dashboard
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('login.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15 flex items-center justify-center">
      {/* Background Patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary-light/20 to-primary/20 rounded-full blur-3xl"></div>

      <LanguageSwitcher />
      <Card className="relative w-full max-w-md p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {t('login.title')}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder={t('login.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder={t('login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="user">{t('login.user')}</option>
            <option value="specialist">{t('login.specialist')}</option>
          </select>

          <Button
            type="submit"
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary/90 hover:to-primary-dark/90 text-white text-lg px-6 py-3 flex items-center justify-center gap-2 mt-4"
            disabled={loading}
          >
            {loading ? t('login.loading') : t('login.button')}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          নতুন ব্যবহারকারী?{" "}
          <span
            className="text-primary font-semibold cursor-pointer hover:underline"
            onClick={() => router.push("/register")}
          >
            রেজিস্টার করুন
          </span>
        </div>

        {/* Optional: Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">{t('login.secure')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-700">পেশাদার পরামর্শ</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
