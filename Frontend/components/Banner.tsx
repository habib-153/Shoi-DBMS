"use client";

import Link from "next/link";
import { Phone, ArrowRight, Sparkles, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function Banner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#2596be]/5">
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-32 h-32 bg-[#2596be]/5 rounded-full animate-float blur-3xl"></div>
        <div className="absolute top-1/3 right-[15%] w-24 h-24 bg-[#2596be]/10 rounded-full animate-float-delayed blur-2xl"></div>
        <div className="absolute bottom-1/4 left-[20%] w-16 h-16 bg-[#2596be]/8 rounded-full animate-float-slow blur-xl"></div>
        <div className="absolute top-1/2 right-[25%] w-12 h-12 bg-[#2596be]/15 rounded-full animate-pulse blur-lg"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid items-center gap-16 lg:grid-cols-2 relative z-10">
        {/* Content */}
        <div className={`transform transition-all duration-1200 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#2596be]/10 text-[#2596be] px-4 py-2 rounded-full text-sm font-medium mb-8 border border-[#2596be]/20">
            <Sparkles className="w-4 h-4" />
            Mental Health Support Platform
          </div>

          {/* Main heading */}
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            <span className="text-[#2596be]">সই</span>
            <div className="text-4xl md:text-5xl font-normal text-gray-700 mt-4">
              Your mental wellness
              <span className="block text-[#2596be]">companion</span>
            </div>
          </h1>
          
          {/* Description */}
          <p className={`text-xl text-gray-600 max-w-xl leading-relaxed mb-10 transform transition-all duration-1200 delay-300 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            It's okay not to be okay. It's okay to ask for help. Connect with qualified therapists and take control of your mental health journey.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 mb-12 transform transition-all duration-1200 delay-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Link href="/register" className="btn-primary text-lg px-8 py-4 group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a href="tel:01776632344" className="btn-secondary text-lg px-8 py-4 group">
              <Phone className="w-5 h-5" /> 
              Emergency Help
            </a>
          </div>

          {/* Feature cards */}
          <div className={`grid gap-6 sm:grid-cols-2 transform transition-all duration-1200 delay-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="card-modern p-6 group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#2596be]/20 transition-colors duration-300">
                <Heart className="w-6 h-6 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Individuals</h3>
              <p className="text-gray-600 mb-4">Professional counseling and mental health support tailored to your needs.</p>
              <Link href="/for-users" className="inline-flex items-center gap-2 text-[#2596be] font-medium group-hover:gap-3 transition-all duration-200">
                Learn More 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
            
            <div className="card-modern p-6 group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#2596be]/20 transition-colors duration-300">
                <Sparkles className="w-6 h-6 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Therapists</h3>
              <p className="text-gray-600 mb-4">Complete practice management platform with secure telehealth capabilities.</p>
              <Link href="/for-specialists" className="inline-flex items-center gap-2 text-[#2596be] font-medium group-hover:gap-3 transition-all duration-200">
                Learn More 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className={`flex justify-center transform transition-all duration-1200 delay-400 ease-out ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-16 opacity-0 scale-95'}`}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2596be]/20 to-transparent rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
            <img 
              src="/fff.png" 
              alt="Mental Health Support" 
              className="relative w-full max-w-lg rounded-3xl shadow-2xl object-cover group-hover:scale-105 transition-all duration-700 hover:shadow-[#2596be]/20" 
            />
            {/* Floating badge */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20">
              <span className="text-sm font-medium text-[#2596be]">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
