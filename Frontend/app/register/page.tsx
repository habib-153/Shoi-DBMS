"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("রেজিস্ট্রেশন সফল! লগইন পেজে নিয়ে যাওয়া হচ্ছে...");
      setTimeout(() => router.push("/login"), 1500);
    }, 1200);
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">নিবন্ধন করুন</h2>
            <Input
              name="name"
              placeholder="নাম"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="ইমেইল"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="পাসওয়ার্ড"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-6 py-3 mt-2"
              disabled={loading}
            >
              {loading ? "নিবন্ধন হচ্ছে..." : "নিবন্ধন করুন"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              ইতিমধ্যে একাউন্ট আছে?{' '}
              <a href="/login" className="text-purple-600 hover:underline font-semibold">লগইন করুন</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
