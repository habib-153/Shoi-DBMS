import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/lib/language-context";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "সই - মানসিক স্বাস্থ্য সেবা | Mental Health Care",
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
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <LanguageProvider>
          <Providers>
            {children}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
