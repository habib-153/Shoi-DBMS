"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

export default function ForSpecialists() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-semibold text-gray-900">Why Become a Specialist with Us</h2>

      <p className="mt-8 text-xl text-gray-700">
        As a specialist, you'll have the opportunity to make a real impact on your patients' lives. Here’s why you should join us:
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-3xl shadow-lg">
          <h3 className="text-2xl font-semibold text-[#2596be]">Telehealth Capabilities</h3>
          <p className="mt-2 text-gray-700">
            Conduct remote consultations with patients from the comfort of your home. Our platform allows you to consult securely online.
          </p>
        </div>
        {/* More cards with similar content */}
      </div>

      <div className="mt-12">
        <Link href="/specialist-signup" className="inline-flex items-center gap-2 bg-[#2596be] text-white px-5 py-3 rounded-xl hover:bg-[#1d7a99]">
          <Calendar className="w-5 h-5" /> Sign Up as a Specialist
        </Link>
      </div>
    </section>
  );
}
