'use client'

import { Button } from "./ui/button"
import { Card } from "./ui/card"
import Link from "next/link"
import { ArrowRight, PhoneCall } from "lucide-react"

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2596be]/10 via-sky-50 to-indigo-50">
      {/* Header */}
      <header className="container mx-auto p-4">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-[#2596be]">
              সই
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/impact" className="hover:text-[#2596be]">Impact</Link>
              <Link href="/experts" className="hover:text-[#2596be]">Meet our Experts</Link>
              <Link href="/blog" className="hover:text-[#2596be]">Blog</Link>
              <Link href="/news" className="hover:text-[#2596be]">News & Events</Link>
              <Link href="/tests" className="hover:text-[#2596be]">Tests & Games</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#2596be]">Log in</Button>
            </Link>
            <button className="md:hidden">
              <span className="sr-only">Open menu</span>
              {/* Add your menu icon here */}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your mental health is a priority. Take care of yourself first.
          </h1>
          <p className="text-lg mb-6">
            It&apos;s okay not to be okay. It&apos;s okay to ask for help. It&apos;s okay to reach out to someone. It&apos;s okay to be human.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/book">
              <Button className="bg-[#2596be] hover:bg-[#1d7a99]">
                Book an Appointment
              </Button>
            </Link>
            <Link href="tel:01xxxxxxxx">
              <Button variant="outline" className="flex items-center gap-2">
                <PhoneCall size={16} />
                Helpline: 01xxxxxxxx
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Users */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">For Users</h2>
            <p className="mb-4">Counselling sessions to navigate challenges & improve well-being.</p>
            <Link href="/users" className="flex items-center text-[#2596be] hover:underline">
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Card>

          {/* For Specialists */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">For Specialists</h2>
            <p className="mb-4">Booking, session management, notes & secure telehealth.</p>
            <Link href="/specialists" className="flex items-center text-[#2596be] hover:underline">
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Mental Health Support</h3>
              <div className="space-y-2">
                <p>+880 1xxxxxxxx</p>
                <p>info@shoi.com</p>
                <p>United International University, Madani Avenue, Dhaka</p>
                <Link href="/map" className="text-[#2596be] hover:underline">
                  SEE ON MAP
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <div className="space-y-2">
                <Link href="/counselling" className="block hover:text-[#2596be]">Counselling</Link>
                <Link href="/tests" className="block hover:text-[#2596be]">Test & Games</Link>
                <Link href="/blog" className="block hover:text-[#2596be]">Blog</Link>
                <Link href="/news" className="block hover:text-[#2596be]">News & Events</Link>
                <Link href="/calendar" className="block hover:text-[#2596be]">Positivity Calendar</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}