"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    date_of_birth: "",
    gender: "", // default value
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t('register.error'));
        return;
      }

      toast.success(t('register.success'));
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      toast.error(t('register.tryAgain'));
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      {/* Background Patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-blue-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-4xl bg-white/80 backdrop-blur-sm shadow-xl rounded-xl flex flex-col sm:flex-row overflow-hidden border-0">
        {/* Left: Image/Animation */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-8">
          <img
            src="/login_bg.png"
            alt="Mental Health Illustration"
            className="w-80 h-80 object-contain drop-shadow-xl"
          />
        </div>

        {/* Right: Register Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('register.title')}</h2>
            <Input
              name="name"
              placeholder={t('register.name')}
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              name="email"
              type="email"
              placeholder={t('register.email')}
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder={t('register.password')}
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              name="phone"
              placeholder={t('register.phone')}
              value={form.phone}
              onChange={handleChange}
              required
            />
            <Input
              name="date_of_birth"
              type="date"
              placeholder={t('register.dob')}
              value={form.date_of_birth}
              onChange={handleChange}
              required
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="male">{t('register.male')}</option>
              <option value="female">{t('register.female')}</option>
              <option value="other">{t('register.other')}</option>
            </select>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-6 py-3 mt-2"
              disabled={loading}
            >
              {loading ? t('register.loading') : t('register.button')}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {t('register.haveAccount')}{' '}
              <a href="/login" className="text-purple-600 hover:underline font-semibold">{t('register.login')}</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
