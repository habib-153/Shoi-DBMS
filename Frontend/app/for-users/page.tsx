"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

export default function ForUsers() {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 bg-[#f4f4f4]"> {/* Changed background to solid color */}
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#2596be] to-[#1f6d89]">
          Why Choose Our Mental Health Services
        </h2>
        <p className="mt-6 text-lg text-gray-800 max-w-4xl mx-auto">
          It's okay not to be okay. Our platform offers you a safe, affordable, and confidential way to access professional mental health support. Here's why our services are the perfect fit for your needs.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <h3 className="text-2xl font-semibold text-[#2596be]">Affordable Services</h3>
          <p className="mt-3 text-gray-700">
            Access mental health professionals at a fraction of the cost of traditional therapy. We offer affordable pricing plans, including free demo sessions to ensure you’re comfortable.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <h3 className="text-2xl font-semibold text-[#2596be]">Anonymity and Confidentiality</h3>
          <p className="mt-3 text-gray-700">
            Consult with experts in complete privacy. Choose to remain anonymous or provide your real name — we guarantee the confidentiality of your information.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <h3 className="text-2xl font-semibold text-[#2596be]">Free Demo Session</h3>
          <p className="mt-3 text-gray-700">
            Take a free demo session to understand how our platform works and how our specialists can help. No commitment, no cost — just support.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-[#2596be]">How It Works</h3>
        <p className="mt-6 text-lg text-gray-700 max-w-3xl mx-auto">
          Getting started with our platform is easy and straightforward. Follow these simple steps to access the mental health support you deserve.
        </p>
      </div>

      {/* Steps Section with Dramatic Hover Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="bg-gradient-to-r from-[#2596be] to-[#1a739e] p-8 rounded-xl shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl hover:translate-y-3">
          <h4 className="text-xl font-semibold text-white">1. Sign Up</h4>
          <p className="mt-3 text-white">
            Create your account with just a few details. You can choose to register anonymously or use your real name.
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#2596be] to-[#1a739e] p-8 rounded-xl shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl hover:translate-y-3">
          <h4 className="text-xl font-semibold text-white">2. Browse Specialists</h4>
          <p className="mt-3 text-white">
            Browse through a list of qualified mental health specialists based on their expertise and availability.
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#2596be] to-[#1a739e] p-8 rounded-xl shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl hover:translate-y-3">
          <h4 className="text-xl font-semibold text-white">3. Free Demo Session</h4>
          <p className="mt-3 text-white">
            Book a free demo session to talk to a professional, ask questions, and see if the service fits your needs.
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#2596be] to-[#1a739e] p-8 rounded-xl shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl hover:translate-y-3">
          <h4 className="text-xl font-semibold text-white">4. Start Paid Sessions</h4>
          <p className="mt-3 text-white">
            If you're satisfied with the demo, proceed with paid sessions for continuous support and guidance.
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
