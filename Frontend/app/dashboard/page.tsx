"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, User, Bell, MessageCircle, Settings, Activity } from "lucide-react";

interface Appointment {
  appointment_id: number;
  therapist_name: string;
  specialty_name: string;
  appointment_date: string;
  start_time: string;
  status: string;
  session_type: string;
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
    fetchUpcomingAppointments();
  }, []);

  const fetchUserData = async () => {
    // Get user from localStorage or session
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?status=scheduled');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600">Here's your mental health journey overview</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5" />
              </button>
              <Link href="/profile" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/appointments" className="bg-[#2596be] text-white p-6 rounded-xl hover:bg-[#1d7a99] transition-colors">
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg">Book Appointment</h3>
            <p className="text-blue-100 text-sm">Schedule a new session</p>
          </Link>
          
          <Link href="/appointments/history" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <Clock className="w-8 h-8 mb-3 text-[#2596be]" />
            <h3 className="font-semibold text-lg text-gray-900">Appointment History</h3>
            <p className="text-gray-600 text-sm">View past sessions</p>
          </Link>
          
          <Link href="/messages" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <MessageCircle className="w-8 h-8 mb-3 text-[#2596be]" />
            <h3 className="font-semibold text-lg text-gray-900">Messages</h3>
            <p className="text-gray-600 text-sm">Chat with therapists</p>
          </Link>
          
          <Link href="/tests" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <Activity className="w-8 h-8 mb-3 text-[#2596be]" />
            <h3 className="font-semibold text-lg text-gray-900">Mental Health Tests</h3>
            <p className="text-gray-600 text-sm">Self-assessment tools</p>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link href="/appointments" className="text-[#2596be] hover:text-[#1d7a99] font-medium">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be] mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.slice(0, 3).map((appointment) => (
                <div key={appointment.appointment_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2596be]/10 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-[#2596be]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.therapist_name}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialty_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(appointment.appointment_date)} at {formatTime(appointment.start_time)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{appointment.session_type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No upcoming appointments</p>
              <Link href="/appointments" className="inline-block mt-3 text-[#2596be] hover:text-[#1d7a99] font-medium">
                Book your first appointment
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mental Health Tips */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mental Health Tips</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-[#2596be]">Daily Mindfulness</h4>
                <p className="text-sm text-gray-700 mt-1">Take 5 minutes today for deep breathing exercises</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700">Stay Connected</h4>
                <p className="text-sm text-gray-700 mt-1">Reach out to a friend or family member today</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-700">Self-Care</h4>
                <p className="text-sm text-gray-700 mt-1">Remember to prioritize activities that bring you joy</p>
              </div>
            </div>
          </div>

          {/* Quick Resources */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Resources</h3>
            <div className="space-y-3">
              <Link href="/blogs" className="block p-3 hover:bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Mental Health Blog</h4>
                <p className="text-sm text-gray-600">Latest articles and insights</p>
              </Link>
              <Link href="/tests" className="block p-3 hover:bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Self-Assessment Tools</h4>
                <p className="text-sm text-gray-600">Check your mental health status</p>
              </Link>
              <a href="tel:01776632344" className="block p-3 hover:bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Crisis Helpline</h4>
                <p className="text-sm text-gray-600">24/7 emergency support</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}