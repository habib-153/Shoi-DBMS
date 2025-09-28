"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

export default function ForSpecialists() {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 bg-[#f4f4f4]">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#2596be] to-[#1f6d89]">
          Why Psychiatrists & Psychologists Choose Our Platform
        </h2>
        <p className="mt-6 text-lg text-gray-800 max-w-4xl mx-auto">
          As a mental health professional, you can now help many people while working from the comfort of your home. Our platform enables you to provide support to those in need, earn a steady income, and manage your work-life balance.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <h3 className="text-2xl font-semibold text-[#2596be]">Work from Home</h3>
          <p className="mt-3 text-gray-700">
            No need to commute or work from an office. You can offer your services from home, setting your own hours and work pace, making this an ideal opportunity for a balanced lifestyle.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <h3 className="text-2xl font-semibold text-[#2596be]">Help More People</h3>
          <p className="mt-3 text-gray-700">
            With our online platform, you can reach clients from all over the country (or globally), helping more people in need, and making a positive impact on their lives.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <h3 className="text-2xl font-semibold text-[#2596be]">Flexible Earning</h3>
          <p className="mt-3 text-gray-700">
            Set your own rates and schedules. With a flexible earning system, you can increase your income while providing the help people need — all from your home office.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-[#2596be]">How It Works for Specialists</h3>
        <p className="mt-6 text-lg text-gray-700 max-w-3xl mx-auto">
          Joining our platform is simple and rewarding. As a specialist, you can offer consultations, manage appointments, and provide therapy sessions from the comfort of your home. Here’s how it works:
        </p>
      </div>

      {/* Steps Section with Dramatic Hover Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="bg-gradient-to-r from-[#2596be] to-[#1a739e] p-8 rounded-xl shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl hover:translate-y-3">
          <h4 className="text-xl font-semibold text-white">1. Sign Up</h4>
          <p className="mt-3 text-white">
            Create your account on our platform with a few details. You can register as a specialist and set up your profile with your credentials and expertise.
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#2596be] to-[#1a739e] p-8 rounded-xl shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl hover:translate-y-3">
          <h4 className="text-xl font-semibold text-white">2. Set Your Availability</h4>
          <p className="mt-3 text-white">
            Choose the hours that work best for you. You’ll be able to adjust your availability to match your schedule and personal preferences.
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#2596be] to-[#1a739e] p-8 rounded-xl shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl hover:translate-y-3">
          <h4 className="text-xl font-semibold text-white">3. Start Booking Clients</h4>
          <p className="mt-3 text-white">
            As clients book sessions, you can review their needs and provide tailored support in a secure, private environment.
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#2596be] to-[#1a739e] p-8 rounded-xl shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl hover:translate-y-3">
          <h4 className="text-xl font-semibold text-white">4. Earn Income</h4>
          <p className="mt-3 text-white">
            Get paid for each session you conduct. Our platform handles payments securely, allowing you to focus on helping others.
          </p>
        </div>
      </div>

      {/* Call-to-Action Button */}
      {/* <div className="text-center mt-16">
        <Link href="/appointment" className="inline-flex items-center gap-2 bg-[#2596be] text-white px-6 py-3 rounded-full hover:bg-[#1a739e] transition-all duration-300">
          <Calendar className="w-5 h-5" /> Book an Appointment
        </Link>
      </div> */}
    </section>
  );
}

