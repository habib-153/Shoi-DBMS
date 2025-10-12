"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-primary/10 p-10 grid gap-10 md:grid-cols-3">
          <div>
            <img src="/4F43E8E1-1786-4A37-93AF-2E381EE3B968.png" alt="সই" className="w-16 mb-4" />
            <p className="text-muted-foreground">+880 1xxxxxxxxx</p>
            <p className="text-muted-foreground">info@shoi.com</p>
            <p className="text-muted-foreground">United International University, Madani Avenue, Dhaka</p>
            <Link href="#" className="text-primary mt-2 inline-block">SEE ON MAP</Link>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
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

        <div className="text-center text-sm text-muted-foreground py-8">
          © 2025 <span className="font-semibold text-primary">সই</span>™. All Rights Reserved. Version 25.7.0 ·{" "}
          <Link href="/about" className="hover:text-foreground">About</Link> ·{" "}
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link> ·{" "}
          <Link href="/appointments" className="hover:text-foreground">Book a session</Link>
        </div>
      </div>
    </footer>
  );
}
