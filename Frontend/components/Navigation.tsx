"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Calendar, LogIn, ChevronRight } from "lucide-react";


const quotes = [
  "It's okay not to be okay. Reach out when you need help.",
  "Mental health is just as important as physical health. Take care of yourself.",
  "You are stronger than you think. Keep going.",
  "Healing takes time, and asking for help is a courageous step.",
  "Self-care is not selfish; it’s a necessity.",
  "It’s okay to have bad days. It’s okay to ask for help. You are not alone.",
  "Your mental health is a priority. Take care of yourself first.",
  "Start where you are. Use what you have. Do what you can."
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState("");

  // Set a random quote on component mount and auto-change every 10 seconds
  useEffect(() => {
    const updateQuote = () => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
    };

    updateQuote(); // Get an initial quote
    const intervalId = setInterval(updateQuote, 10000); // Change quote every 10 seconds

    return () => clearInterval(intervalId); // Cleanup the interval on unmount
  }, []);

  return (
    <>
      {/* Quote Section with Dynamic Scrolling Effect */}
      <div className="bg-[WHITE]] text-[black] text-center py-0.2">
        <p className="text-sm italic animate-marquee">{quote}</p>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50">
        <nav className="bg-[#2596be]/100 backdrop-blur border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 bg-[#2596be] text-white sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            {/* logo */}
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="সই" className="w-12 h-12" />
              <span className="text-xl font-bold text-[White]">সই</span>
            </Link>

            {/* desktop nav */}
            <div className="hidden md:flex items-center gap-8 text-[15px]">
              <Link href="/#impact" className="hover:text-gray-700">Impact</Link>
              <Link href="/#experts" className="hover:text-gray-700">Meet our Experts</Link>
              <Link href="/#blogs" className="hover:text-gray-700">Blogs</Link>
              <Link href="/#events" className="hover:text-gray-700">News & Events</Link>
              <Link href="/#tests" className="hover:text-gray-700">Tests & Games</Link>
            </div>

            {/* desktop ctas */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 bg-[#ffffff] text-[Black] px-4 h-10 rounded-xl hover:bg-[#7CC3DC] ">
                <LogIn className="w-4 h-4 text-[Black] " /> Log in 
              </Link>
            </div>

            {/* mobile burger */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(!open)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>
    </>

  );
}
