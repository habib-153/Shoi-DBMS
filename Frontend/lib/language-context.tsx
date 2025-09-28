"use client";

import { createContext, useContext, useState } from 'react';

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Initialize with Bengali as the default language for SSR
const defaultLanguage: Language = 'bn';

const translations = {
  bn: {
    // Site Info
    'site.name': 'সই',
    'site.description': 'মানসিক স্বাস্থ্য সেবা',
    
    // Navigation
    'nav.home': 'হোম',
    'nav.services': 'সেবাসমূহ',
    'nav.therapists': 'বিশেষজ্ঞগণ',
    'nav.privacy': 'গোপনীয়তা',
    'nav.contact': 'যোগাযোগ',
    'nav.bookAppointment': 'অ্যাপয়েন্টমেন্ট বুক করুন',
    'nav.login': 'প্রবেশ',
    'nav.register': 'নিবন্ধন',

    // Home Page
    'home.title': 'মানসিক স্বাস্থ্যের যত্ন',
    'home.subtitle': 'আপনার হাতের মুঠোয়',
    'home.description': 'বাংলাদেশের প্রথম সম্পূর্ণ বাংলা ভাষাভিত্তিক মানসিক স্বাস্থ্য প্ল্যাটফর্ম। অভিজ্ঞ বিশেষজ্ঞদের কাছ থেকে গোপনীয় ও পেশাদার পরামর্শ নিন।',
    'home.startFree': 'বিনামূল্যে পরামর্শ শুরু করুন',
    'home.howItWorks': 'কীভাবে কাজ করে দেখুন',
    'home.experts': 'বিশেষজ্ঞ',
    'home.sessions': 'পরামর্শ সেশন',
    'home.satisfaction': 'সন্তুষ্ট গ্রাহক',
    
    // Therapist Page
    'therapist.title': 'আমাদের বিশেষজ্ঞগণ',
    'therapist.add': 'নতুন বিশেষজ্ঞ যোগ করুন',
    'therapist.specialties': 'বিশেষজ্ঞতা',
    'therapist.experience': 'অভিজ্ঞতা',
    'therapist.qualification': 'যোগ্যতা',
    'therapist.appointmentFee': 'পরামর্শ ফি',
    'therapist.available': 'উপলব্ধ',
    'therapist.book': 'অ্যাপয়েন্টমেন্ট বুক করুন',
    'therapist.loadMore': 'আরো দেখুন',
    // Login Page
    'login.title': 'মানসিক স্বাস্থ্য লগইন',
    'login.email': 'ইমেইল',
    'login.password': 'পাসওয়ার্ড',
    'login.button': 'লগইন করুন',
    'login.loading': 'লগইন হচ্ছে...',
    'login.newUser': 'নতুন ব্যবহারকারী?',
    'login.register': 'রেজিস্টার করুন',
    'login.user': 'ব্যবহারকারী',
    'login.specialist': 'বিশেষজ্ঞ',
    'login.secure': 'গোপনীয় & নিরাপদ',
    'login.professional': 'পেশাদার পরামর্শ',
    'login.error': 'লগইন ব্যর্থ হয়েছে',
    'login.success': 'লগইন সফল হয়েছে!',
    'login.tryAgain': 'লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন',

    // Register Page
    'register.title': 'নিবন্ধন করুন',
    'register.name': 'নাম',
    'register.email': 'ইমেইল',
    'register.password': 'পাসওয়ার্ড',
    'register.phone': 'ফোন নাম্বার',
    'register.dob': 'জন্ম তারিখ',
    'register.gender': 'লিঙ্গ',
    'register.male': 'পুরুষ',
    'register.female': 'মহিলা',
    'register.other': 'অন্যান্য',
    'register.button': 'নিবন্ধন করুন',
    'register.loading': 'নিবন্ধন হচ্ছে...',
    'register.haveAccount': 'ইতিমধ্যে একাউন্ট আছে?',
    'register.login': 'লগইন করুন',
    'register.error': 'রেজিস্ট্রেশন ব্যর্থ হয়েছে',
    'register.success': 'রেজিস্ট্রেশন সফল! লগইন পেজে নিয়ে যাওয়া হচ্ছে...',
    'register.tryAgain': 'একটি সমস্যা হয়েছে, আবার চেষ্টা করুন',

    // Common
    'languageName': 'English',
    'switchLanguage': 'Switch to English',
  },
  en: {
    // Site Info
    'site.name': 'সই',
    'site.description': 'Mental Health Care',
    
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.therapists': 'Therapists',
    'nav.privacy': 'Privacy',
    'nav.contact': 'Contact',
    'nav.bookAppointment': 'Book Appointment',
    'nav.login': 'Login',
    'nav.register': 'Register',

    // Home Page
    'home.title': 'Mental Health Care',
    'home.subtitle': 'At Your Fingertips',
    'home.description': "Bangladesh's first complete Bangla language-based mental health platform. Get confidential and professional advice from experienced specialists.",
    'home.startFree': 'Start Free Consultation',
    'home.howItWorks': 'See How It Works',
    'home.experts': 'Experts',
    'home.sessions': 'Counseling Sessions',
    'home.satisfaction': 'Client Satisfaction',
    
    // Therapist Page
    'therapist.title': 'Our Specialists',
    'therapist.add': 'Add New Specialist',
    'therapist.specialties': 'Specialties',
    'therapist.experience': 'Experience',
    'therapist.qualification': 'Qualification',
    'therapist.appointmentFee': 'Consultation Fee',
    'therapist.available': 'Available',
    'therapist.book': 'Book Appointment',
    'therapist.loadMore': 'Load More',
    // Login Page
    'login.title': 'Mental Health Login',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.button': 'Login',
    'login.loading': 'Logging in...',
    'login.newUser': 'New User?',
    'login.register': 'Register',
    'login.user': 'User',
    'login.specialist': 'Specialist',
    'login.secure': 'Secure & Private',
    'login.professional': 'Professional Care',
    'login.error': 'Login failed',
    'login.success': 'Login successful!',
    'login.tryAgain': 'Login failed, please try again',

    // Register Page
    'register.title': 'Register',
    'register.name': 'Name',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.phone': 'Phone Number',
    'register.dob': 'Date of Birth',
    'register.gender': 'Gender',
    'register.male': 'Male',
    'register.female': 'Female',
    'register.other': 'Other',
    'register.button': 'Register',
    'register.loading': 'Registering...',
    'register.haveAccount': 'Already have an account?',
    'register.login': 'Login',
    'register.error': 'Registration failed',
    'register.success': 'Registration successful! Redirecting to login...',
    'register.tryAgain': 'Something went wrong, please try again',

    // Common
    'languageName': 'বাংলা',
    'switchLanguage': 'বাংলায় দেখুন',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key) => translations[defaultLanguage][key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string) => {
    if (!translations[language] || !translations[language][key]) {
      console.warn(`Missing translation: ${key}`);
      return key;
    }
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}