"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

export default function ForUsers() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-semibold text-gray-900">Why Use Our Services</h2>
      <p className="mt-8 text-xl text-gray-700">
        It’s okay not to be okay. At our platform, we offer you professional mental health support that can help you navigate challenges and improve your well-being. Here's how we help:
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-3xl shadow-lg">
          <h3 className="text-2xl font-semibold text-[#2596be]">Counselling Sessions</h3>
          <p className="mt-2 text-gray-700">
            Our professional therapists offer individual counselling sessions to help you understand your challenges and guide you towards emotional well-being.
          </p>
        </div>
        {/* More cards with similar content */}
      </div>

      <div className="mt-12">
        <Link href="/appointment" className="inline-flex items-center gap-2 bg-[#2596be] text-white px-5 py-3 rounded-xl hover:bg-[#1d7a99]">
          <Calendar className="w-5 h-5" /> Book an Appointment
        </Link>
      </div>
    </section>
  );
}
