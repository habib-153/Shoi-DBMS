"use client";

import Link from "next/link";
import { Calendar, Phone, ArrowRight } from "lucide-react";

export default function Banner() {
  return (

    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid items-center gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-5xl md:text-6xl font-['Pacifico'] tracking-tight text-gray-900">সই</h1>
        {/* <p className="mt-2 text-4xl md:text-5xl font-semibold text-gray-900">Friend of your mind</p> */}

        <p className="mt-10 font-['Poppins'] tracking-tight text-xl text-gray-700 max-w-2xl">
          It’s okay not to be okay. It’s okay to ask for help. It’s okay to reach out to someone. It’s okay to be human.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/appointment" className="inline-flex items-center gap-2 bg-[#2596be] text-white px-5 py-3 rounded-xl hover:bg-[#1d7a99]">
            <Calendar className="w-5 h-5" /> Book an Appointment
          </Link>
          <a href="tel:01776632344" className="inline-flex items-center gap-2 border border-[#2596be] text-[#2596be] px-5 py-3 rounded-xl hover:bg-[#2596be]/10">
            <Phone className="w-5 h-5" /> Helpline: 01xxxxxxxxx
          </a>
        </div>

        {/* Teaser cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-gray-50 p-6 border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-semibold text-[#2596be]">For Users</h3>
            <p className="mt-2 text-gray-700">Counselling sessions to navigate challenges & improve well-being.</p>
            <Link href="/for-users" className="inline-flex items-center gap-1 text-[#2596be] font-medium mt-3">
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="rounded-3xl bg-gray-50 p-6 border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-semibold text-[#2596be]">For Specialists</h3>
            <p className="mt-2 text-gray-700">Booking, session management, notes & secure telehealth.</p>
            <Link href="/for-specialists" className="inline-flex items-center gap-1 text-[#2596be] font-medium mt-3">
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-15 md:mt-0>">
        <img src="/fff.png" alt="Mental Health Support" className="w-[490px] rounded-[30px] shadow-xl object-cover" />
      </div>
    </section>
  );
}
