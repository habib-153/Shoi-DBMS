"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Menu, LogIn, Calendar, User, Settings, LogOut, MessageCircle, BookOpen, NotepadText, ArrowLeft } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Show back button on all pages except home, login, and register
  const showBackButton = pathname && pathname !== '/' && pathname !== '/login' && pathname !== '/register';

  const handleBack = () => {
    // Use window.history to go back
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, go to home
      router.push('/');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-[#2596be]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/4F43E8E1-1786-4A37-93AF-2E381EE3B968.png" 
                  alt="সই" 
                  className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-white/90 transition-colors duration-300">
                সই
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/#impact" className="nav-link group">
                Impact
              </Link>
              <Link href="/about" className="nav-link group">
                About
              </Link>
              <Link href="/experts" className="nav-link group">
                Experts
              </Link>
              <Link href="/for-specialists" className="nav-link group">
                For Specialists
              </Link>
              <Link href="/blogs" className="nav-link group">
                Blogs
              </Link>
              <Link href="/resources" className="nav-link group">
                Resources
              </Link>

              {/* Book Appointment Button */}
              <Link
                href="/appointments"
                className="inline-flex items-center gap-2 bg-white text-[#2596be] rounded-xl px-5 py-2.5 hover:bg-white/90 transition-all duration-300 group font-semibold text-sm shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* Notification Bell */}
                  {user && (user.therapist_id || user.user_id) && (
                    <NotificationBell 
                      userType={user.role === 'therapist' ? 'therapist' : 'user'}
                      userId={(user.role === 'therapist' ? user.therapist_id : user.user_id) || 0}
                    />
                  )}
                  
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 group"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden lg:block text-sm font-medium">
                        {user?.name || 'Profile'}
                      </span>
                    </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-[#2596be]/10 to-transparent">
                        <p className="text-sm font-medium text-gray-800">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          
                        </p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2596be]/10 hover:text-[#2596be] transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        
                        <Link
                          href={user?.role === 'therapist' ? '/therapist/dashboard' : '/dashboard'}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2596be]/10 hover:text-[#2596be] transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Dashboard
                        </Link>

                        <Link
                          href="/messages"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2596be]/10 hover:text-[#2596be] transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Messages
                        </Link>

                        {user?.role === 'therapist' && (
                          <Link
                            href="/therapist/assessments"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2596be]/10 hover:text-[#2596be] transition-all duration-200"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <NotepadText className="w-4 h-4" />
                            Assessments
                          </Link>
                        )}

                        {user?.role !== 'therapist' && (
                          <>
                            <Link
                              href="/my-resources"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2596be]/10 hover:text-[#2596be] transition-all duration-200"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <BookOpen className="w-4 h-4" />
                              My Resources
                            </Link>

                            <Link
                              href="/session-notes"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2596be]/10 hover:text-[#2596be] transition-all duration-200"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <NotepadText className="w-4 h-4" />
                              Session Notes
                            </Link>
                          </>
                        )}
                        
                        <hr className="my-2 border-gray-200/50" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 group"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 bg-white text-[#2596be] rounded-xl px-4 py-2 hover:bg-white/90 transition-all duration-300 group font-medium text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-white hover:bg-white/10 focus:outline-none transition-colors duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="md:hidden bg-[#2596be]/98 backdrop-blur-md border-t border-white/10">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <Link href="/#impact" className="block px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                Impact
              </Link>
              <Link href="/about" className="block px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                About
              </Link>
              <Link href="/experts" className="block px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                Experts
              </Link>
              <Link href="/for-specialists" className="block px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                For Specialists
              </Link>
              <Link href="/blogs" className="block px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                Blogs
              </Link>
              <Link href="/resources" className="block px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                Resources
              </Link>

              {/* Book Appointment Button for Mobile */}
              <Link href="/appointments" className="flex items-center gap-2 bg-white text-[#2596be] rounded-lg px-3 py-2.5 hover:bg-white/90 transition-all duration-300 font-semibold text-sm shadow-lg mt-3">
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>
              
              {isAuthenticated ? (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-white/90">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-white/70 capitalize">
                      

                    </p>
                  </div>
                  
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                    <Settings className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link href="/messages" className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                    <MessageCircle className="w-4 h-4" />
                    Messages
                  </Link>

                  {user?.role === 'therapist' && (
                    <Link href="/therapist/assessments" className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                      <NotepadText className="w-4 h-4" />
                      Assessments
                    </Link>
                  )}

                  {user?.role !== 'therapist' && (
                    <>
                      <Link href="/my-resources" className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                        <BookOpen className="w-4 h-4" />
                        My Resources
                      </Link>

                      <Link href="/session-notes" className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                        <NotepadText className="w-4 h-4" />
                        Session Notes
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-3 px-3 py-2 bg-white text-[#2596be] rounded-lg hover:bg-white/90 transition-colors duration-200 font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
