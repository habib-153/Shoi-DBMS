"use client";

import { useLanguage } from "@/lib/language-context";
import { useEffect, useState } from "react";

export function SiteBranding() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to Bengali for server-side rendering
  const description = mounted 
    ? language === 'bn' 
      ? 'মানসিক স্বাস্থ্য সেবা'
      : 'Mental Health Care'
    : 'মানসিক স্বাস্থ্য সেবা';
  
  return (
    <div className="flex flex-col">
      <span className="text-xl font-bold text-gray-900">সই</span>
      <span className="text-xs text-gray-500">
        {description}
      </span>
    </div>
  );
}