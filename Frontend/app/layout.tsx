import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "মনোবন্ধন - মানসিক স্বাস্থ্য সেবা",
  description:
    "বাংলাদেশের প্রথম সম্পূর্ণ বাংলা ভাষাভিত্তিক মানসিক স্বাস্থ্য প্ল্যাটফর্ম। অভিজ্ঞ বিশেষজ্ঞদের কাছ থেকে গোপনীয় ও পেশাদার পরামর্শ নিন।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="bn">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
  <Toaster />
  {children}
      </body>
    </html>
  );
}
