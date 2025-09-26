"use client";

import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Heart, Shield, Users, Clock, ArrowRight, Star } from "lucide-react";

const Banner = () => {
  const features = [
    {
      icon: Heart,
      title: "বিশেষজ্ঞ পরামর্শ",
      description:
        "অভিজ্ঞ মনোবিজ্ঞানী ও সাইকিয়াট্রিস্টদের কাছ থেকে সহায়তা নিন",
    },
    {
      icon: Shield,
      title: "সম্পূর্ণ গোপনীয়তা",
      description: "আপনার ব্যক্তিগত তথ্য ও পরামর্শ সম্পূর্ণ নিরাপদ ও গোপনীয়",
    },
    {
      icon: Clock,
      title: "২৪/৭ সহায়তা",
      description: "যেকোনো সময় আমাদের জরুরি হেল্পলাইনে যোগাযোগ করুন",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary-light/20 to-primary/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                ৫০০+ সন্তুষ্ট ব্যবহারকারী
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                মানসিক স্বাস্থ্যের যত্ন
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  আপনার হাতের মুঠোয়
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                বাংলাদেশের প্রথম সম্পূর্ণ বাংলা ভাষাভিত্তিক মানসিক স্বাস্থ্য
                প্ল্যাটফর্ম। অভিজ্ঞ বিশেষজ্ঞদের কাছ থেকে গোপনীয় ও পেশাদার
                পরামর্শ নিন।
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-3 h-auto"
              >
                বিনামূল্যে পরামর্শ শুরু করুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-purple-600 border-purple-600 hover:bg-purple-50 text-lg px-8 py-3 h-auto"
              >
                কীভাবে কাজ করে দেখুন
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">১০০+</div>
                <div className="text-sm text-gray-600">বিশেষজ্ঞ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">৫০০+</div>
                <div className="text-sm text-gray-600">পরামর্শ সেশন</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">৯৮%</div>
                <div className="text-sm text-gray-600">সন্তুষ্ট গ্রাহক</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {/* Emergency Contact Card */}
            <Card className="p-6 bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">জরুরি সহায়তা</h3>
                  <p className="text-red-100">২৪ ঘন্টা হটলাইন সেবা</p>
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-red-600 hover:bg-red-50"
                >
                  ১৬২৬৩
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
