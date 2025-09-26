"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

import { User, Stethoscope, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // rishi branch functionality → single form object
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    date_of_birth: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || t("register.error"));
        return;
      }

      toast.success(t("register.success"));
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      toast.error(t("register.tryAgain"));
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#2596be]/10 via-sky-50 to-indigo-50 flex items-center justify-center px-4">
      <Card className="relative w-full max-w-5xl p-6 sm:p-8 bg-white/90 backdrop-blur-sm shadow-xl border-0">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2596be]">
            সই — {t("register.title")}
          </h2>
          <a
            href="/login"
            className="text-sm text-[#2596be] hover:underline"
          >
            {t("register.haveAccount")}
          </a>
        </div>

        {/* role tabs (kept from design, static for now) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Tab
            active
            onClick={() => {}}
            icon={<User className="w-4 h-4" />}
            label="User / Patient"
          />
          <Tab
            active={false}
            onClick={() => {}}
            icon={<Stethoscope className="w-4 h-4" />}
            label="Specialist"
          />
        </div>

        {/* form → functionality from rishi, layout from main */}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
          {/* LEFT Illustration */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#2596be]/10 to-sky-100 grid place-items-center p-6">
              <img
                src="/login.ico"
                className="w-80 h-80 object-contain drop-shadow"
                alt="illustration"
              />
            </div>
          </div>

          {/* RIGHT Form */}
          <div className="space-y-4">
            <Input
              name="name"
              placeholder={t("register.name")}
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              name="email"
              type="email"
              placeholder={t("register.email")}
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder={t("register.password")}
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              name="phone"
              placeholder={t("register.phone")}
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              name="date_of_birth"
              type="date"
              placeholder={t("register.dob")}
              value={form.date_of_birth}
              onChange={handleChange}
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2596be]"
            >
              <option value="">{t("register.gender")}</option>
              <option value="male">{t("register.male")}</option>
              <option value="female">{t("register.female")}</option>
              <option value="other">{t("register.other")}</option>
            </select>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2596be] hover:bg-[#1d7a99] text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              {loading ? t("register.loading") : t("register.button")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ---------- small UI helpers ---------- */
function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 flex items-center justify-center gap-2 transition
      ${
        active
          ? "bg-[#2596be] text-white border-[#2596be]"
          : "border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon} {label}
    </button>
  );
}
