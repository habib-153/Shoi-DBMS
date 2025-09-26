"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#2596be]/10 p-10 grid gap-10 md:grid-cols-3">
          <div>
            <img src="/logo-mb.png" alt="সই" className="w-16 mb-4" />
            <p className="text-gray-700">+880 1xxxxxxxxx</p>
            <p className="text-gray-700">info@shoi.com</p>
            <p className="text-gray-700">United International University, Madani Avenue, Dhaka</p>
            <Link href="#" className="text-[#2596be] mt-2 inline-block">SEE ON MAP</Link>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-gray-700">
              <li><Link href="/#services">Counselling</Link></li>
              {/* <li><Link href="/#courses">Courses</Link></li> */}
              <li><Link href="/#tests">Test & Games</Link></li>
              <li><Link href="/#blogs">Blogs</Link></li>
              <li><Link href="/#events">News & Events</Link></li>
              <li><Link href="/#positivity">Positivity Calendar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <div className="flex items-center gap-5 text-2xl">
              <a href="#">📘</a>
              <a href="#">📸</a>
              <a href="#">🔗</a>
              <a href="#">▶️</a>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 py-8">
          © 2025 <span className="font-semibold text-[#2596be]">সই</span>™. All Rights Reserved. Version 25.7.0 ·{" "}
          <Link href="/about" className="hover:text-gray-700">About</Link> ·{" "}
          <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link> ·{" "}
          <Link href="/appointment" className="hover:text-gray-700">Book a session</Link>
        </div>
      </div>
    </footer>
  );
}
