"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Calendar, LogIn, ChevronRight } from "lucide-react";

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* <div className="w-full bg-[#2596be] text-white text-center text-sm py-2">
        Our prices have been updated. Please check the latest rates before booking.
      </div> */}

      <nav className="bg-[#2596be]/100 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 bg-[#2596be] text-white sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="সই" className="w-12 h-12" />
            <span className="text-xl font-bold text-[White]">সই</span>
          </Link>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-[15px]">
            {/* <Link href="/#for-you" className="hover:text-[#2596be]">For You</Link>
            <Link href="/#for-specialists" className="hover:text-[#2596be]">For Specialists</Link> */}
            {/* <Link href="/#services" className="hover:text-[#2596be]">Services</Link> */}
            {/* <Link href="/#courses" className="hover:text-[#2596be]">Courses</Link> */}
            <Link href="/#impact" className="hover:text-gray-700">Impact</Link>
            <Link href="/#experts" className="hover:text-gray-700">Meet our Experts</Link>
            <Link href="/#blogs" className="hover:text-gray-700">Blogs</Link>
            <Link href="/#events" className="hover:text-gray-700">News & Events</Link>
            <Link href="/#tests" className="hover:text-gray-700">Tests & Games</Link>
            {/* <details className="group relative">
              <summary className="list-none cursor-pointer hover:text-[#2596be] flex items-center gap-1">
                More <ChevronRight className="w-4 h-4 transition group-open:rotate-90" />
              </summary>
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-56">
                <Link href="/#blogs" className="block px-3 py-2 hover:bg-gray-50">Blogs</Link>
                <Link href="/#events" className="block px-3 py-2 hover:bg-gray-50">News & Events</Link>
                <Link href="/#tests" className="block px-3 py-2 hover:bg-gray-50">Tests & Games</Link>
              </div>
            </details> */}
          </div>

          {/* desktop ctas */}
          <div className="hidden md:flex items-center gap-3">
            {/* <Link href="/appointment" className="inline-flex items-center gap-2 border border-[#2596be] text-[#2596be] px-4 h-10 rounded-xl hover:bg-[#2596be]/10">
              <Calendar className="w-4 h-4" /> Book an Appointment
            </Link> */} 
            <Link href="/login" className="inline-flex items-center gap-2 bg-[#ffffff] text-[Black] px-4 h-10 rounded-xl hover:bg-[#7CC3DC]">
              <LogIn className="w-4 h-4 text-[Black]" /> Log in 
            </Link>

          </div>

          {/* mobile burger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(!open)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </header>
  );
}