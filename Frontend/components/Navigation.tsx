"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Heart, Shield, Users, Phone } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "হোম", icon: null },
    { href: "/services", label: "সেবাসমূহ", icon: Heart },
    { href: "/therapists", label: "বিশেষজ্ঞগণ", icon: Users },
    { href: "/privacy", label: "গোপনীয়তা", icon: Shield },
    { href: "/contact", label: "যোগাযোগ", icon: Phone },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">মনোবন্ধন</span>
              <span className="text-xs text-gray-500">
                মানসিক স্বাস্থ্য সেবা
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
            >
              প্রবেশ
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              নিবন্ধন
            </Button>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">মেনু খুলুন</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-700 hover:text-purple-600 px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="border-t pt-4 mt-6 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full text-purple-600 border-purple-600"
                  >
                    প্রবেশ
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                    নিবন্ধন
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
