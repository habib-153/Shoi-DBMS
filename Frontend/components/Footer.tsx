"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Shield,
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const Footer = () => {
  const quickLinks = [
    { href: "/about", label: "আমাদের সম্পর্কে" },
    { href: "/services", label: "সেবাসমূহ" },
    { href: "/therapists", label: "বিশেষজ্ঞগণ" },
    { href: "/appointment", label: "অ্যাপয়েন্টমেন্ট" },
    { href: "/blog", label: "ব্লগ" },
    { href: "/faq", label: "সচরাচর প্রশ্ন" },
  ];

  const supportLinks = [
    { href: "/emergency", label: "জরুরি সহায়তা" },
    { href: "/privacy", label: "গোপনীয়তা নীতি" },
    { href: "/terms", label: "ব্যবহারের শর্তাবলী" },
    { href: "/security", label: "নিরাপত্তা" },
    { href: "/contact", label: "যোগাযোগ" },
    { href: "/feedback", label: "মতামত" },
  ];

  const mentalHealthResources = [
    { href: "/self-assessment", label: "স্ব-মূল্যায়ন" },
    { href: "/meditation", label: "ধ্যান ও শিথিলায়ন" },
    { href: "/crisis-help", label: "সংকট সহায়তা" },
    { href: "/family-support", label: "পারিবারিক সহায়তা" },
    { href: "/resources", label: "শিক্ষামূলক উপাদান" },
    { href: "/community", label: "সাপোর্ট গ্রুপ" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-6">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">মনোবন্ধন</h3>
                  <p className="text-gray-400 text-sm">মানসিক স্বাস্থ্য সেবা</p>
                </div>
              </Link>

              <p className="text-gray-400 leading-relaxed">
                বাংলাদেশের প্রথম সম্পূর্ণ বাংলা ভাষাভিত্তিক মানসিক স্বাস্থ্য
                প্ল্যাটফর্ম। আমরা আপনার মানসিক সুস্থতার জন্য প্রতিশ্রুতিবদ্ধ।
              </p>

              {/* Emergency Contact */}
              <div className="bg-red-900/30 border border-red-700/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-300">
                    জরুরি হটলাইন
                  </span>
                </div>
                <p className="text-xl font-bold text-white">১৬২৬ৣ</p>
                <p className="text-xs text-red-200">২৪ ঘন্টা উপলব্ধ</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">দ্রুত লিংক</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">সহায়তা</h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mental Health Resources */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">মানসিক স্বাস্থ্য সেবা</h4>
              <ul className="space-y-3">
                {mentalHealthResources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="mt-12 bg-gray-800 rounded-lg p-8">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h3 className="text-2xl font-bold">মানসিক স্বাস্থ্য টিপস পান</h3>
              <p className="text-gray-400">
                সপ্তাহে একবার আপনার ইমেইলে মানসিক স্বাস্থ্য বিষয়ক পরামর্শ ও
                টিপস পেতে সাবস্ক্রাইব করুন।
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="আপনার ইমেইল ঠিকানা"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6">
                  সাবস্ক্রাইব
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contact@monobondhon.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+৮৮০ ১৭১২-৩৪৫৬৭৮</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Copyright & Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <p className="text-gray-400 text-sm">
                  © ২০২৫ মনোবন্ধন। সকল অধিকার সংরক্ষিত।
                  <span className="ml-2 inline-flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    SSL সিকিউর
                  </span>
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>BMDC নিবন্ধিত</span>
                <span>•</span>
                <span>ISO ২৭০০১ সার্টিফাইড</span>
                <span>•</span>
                <span>HIPAA কমপ্লায়েন্ট</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
