"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default role

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("সব ফিল্ড পূরণ করুন!");
      return;
    }

    // Dummy login logic for demo
    if (role === "user") {
      router.push("/user/dashboard");
    } else if (role === "specialist") {
      router.push("/specialist/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      {/* Background Patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-blue-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl"></div>

      <Card className="relative w-full max-w-md p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          মানসিক স্বাস্থ্য লগইন
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="ইমেইল"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="পাসওয়ার্ড"
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
            <option value="user">ব্যবহারকারী</option>
            <option value="specialist">বিশেষজ্ঞ</option>
          </select>

          <Button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-6 py-3 flex items-center justify-center gap-2 mt-4"
          >
            লগইন করুন
            <ArrowRight className="w-5 h-5" />
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          নতুন ব্যবহারকারী?{" "}
          <span
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
            onClick={() => router.push("/register")}
          >
            রেজিস্টার করুন
          </span>
        </div>

        {/* Optional: Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">গোপনীয় & নিরাপদ</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">পেশাদার পরামর্শ</span>
          </div>
        </div>
      </Card>
    </div>
  );
}