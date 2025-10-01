"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, LogIn, Calendar, User, Settings, LogOut, MessageCircle } from "lucide-react";

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const roleData = localStorage.getItem('userRole');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        setUserRole(roleData || 'user');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Listen for storage changes (when user logs in from another tab or page)
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      const roleData = localStorage.getItem('userRole');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
          setUserRole(roleData || 'user');
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        setUser(null);
        setUserRole('user');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom login event
    window.addEventListener('userLoggedIn', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
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
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
    setUserRole('user');
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50">
      {/* <div className="w-full bg-[#2596be] text-white text-center text-sm py-2">
        Our prices have been updated. Please check the latest rates before booking.
      </div> */}

      <nav className="bg-[#2596be]/100 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 bg-[#2596be] text-white sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="সই" className="w-12 h-12" />
            <span className="text-xl font-bold text-[White]">সই</span>
          </Link>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-[15px]">
            {/* <Link href="/#for-you" className="hover:text-[#2596be]">For You</Link>
            <Link href="/#for-specialists" className="hover:text-[#2596be]">For Specialists</Link> */}
            {/* <Link href="/#services" className="hover:text-[#2596be]">Services</Link> */}
            {/* <Link href="/#courses" className="hover:text-[#2596be]">Courses</Link> */}
            <Link href="/#impact" className="hover:text-gray-700">Impact</Link>
            <Link href="/#experts" className="hover:text-gray-700">Meet our Experts</Link>
            <Link href="/#blogs" className="hover:text-gray-700">Blogs</Link>
            <Link href="/#events" className="hover:text-gray-700">News & Events</Link>
            <Link href="/#tests" className="hover:text-gray-700">Tests & Games</Link>
            {/* <details className="group relative">
              <summary className="list-none cursor-pointer hover:text-[#2596be] flex items-center gap-1">
                More <ChevronRight className="w-4 h-4 transition group-open:rotate-90" />
              </summary>
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-56">
                <Link href="/#blogs" className="block px-3 py-2 hover:bg-gray-50">Blogs</Link>
                <Link href="/#events" className="block px-3 py-2 hover:bg-gray-50">News & Events</Link>
                <Link href="/#tests" className="block px-3 py-2 hover:bg-gray-50">Tests & Games</Link>
              </div>
            </details> */}
          </div>

          {/* desktop ctas */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/appointments" className="inline-flex items-center gap-2 border border-white text-white px-4 h-10 rounded-xl hover:bg-white/10">
              <Calendar className="w-4 h-4" /> Book an Appointment
            </Link>
            
            {user ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="inline-flex items-center gap-2 bg-white text-[#2596be] px-4 h-10 rounded-xl hover:bg-gray-100"
                >
                  <div className="w-6 h-6 bg-[#2596be] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{user.name}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                    {userRole === 'therapist' ? (
                      // Therapist Menu
                      <>
                        <Link 
                          href="/therapist/dashboard" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Dashboard
                          </div>
                        </Link>
                        <Link 
                          href="/therapist/appointments" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Appointments
                          </div>
                        </Link>
                        <Link 
                          href="/therapist/patients" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Patients
                          </div>
                        </Link>
                        <Link 
                          href="/messages" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Messages
                          </div>
                        </Link>
                        <Link 
                          href="/therapist/profile" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Profile
                          </div>
                        </Link>
                      </>
                    ) : (
                      // User Menu
                      <>
                        <Link 
                          href="/dashboard" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Dashboard
                          </div>
                        </Link>
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Profile
                          </div>
                        </Link>
                        <Link 
                          href="/messages" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Messages
                          </div>
                        </Link>
                        <Link 
                          href="/appointments/history" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Appointment History
                          </div>
                        </Link>
                      </>
                    )}
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="inline-flex items-center gap-2 bg-[#ffffff] text-[Black] px-4 h-10 rounded-xl hover:bg-[#7CC3DC]">
                <LogIn className="w-4 h-4 text-[Black]" /> Log in 
              </Link>
            )}

          </div>

          {/* mobile burger */}
          <button aria-label="menu" className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(!open)}>
            <Menu className="w-6 h-6" />
          </button>

        </div>
      </nav>
    </header>
  );
}
