"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, User, DollarSign, TrendingUp, MessageCircle, Settings, Star, Users } from "lucide-react";

interface Appointment {
  appointment_id: number;
  user_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  session_type: string;
}

interface TherapistStats {
  totalPatients: number;
  todayAppointments: number;
  weeklyRevenue: number;
  averageRating: number;
  completedSessions: number;
}

export default function TherapistDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<TherapistStats>({
    totalPatients: 0,
    todayAppointments: 0,
    weeklyRevenue: 0,
    averageRating: 0,
    completedSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<any>(null);

  useEffect(() => {
    fetchTherapistData();
    fetchTodayAppointments();
    fetchStats();
  }, []);

  const fetchTherapistData = async () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setTherapist(JSON.parse(userData));
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const therapistData = JSON.parse(userData);
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/appointments?therapist_id=${therapistData.therapist_id}&date=${today}`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments || []);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const therapistData = JSON.parse(userData);
        // Fetch therapist statistics
        const response = await fetch(`/api/therapists/${therapistData.therapist_id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, Dr. {therapist?.name || 'Therapist'}!
              </h1>
              <p className="text-gray-600">Here's your practice overview for today</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/therapist/schedule" className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99]">
                Manage Schedule
              </Link>
              <Link href="/therapist/profile" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#2596be]" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">৳{stats.weeklyRevenue?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{Number(stats.averageRating || 0).toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/therapist/appointments" className="bg-[#2596be] text-white p-6 rounded-xl hover:bg-[#1d7a99] transition-colors">
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg">Manage Appointments</h3>
            <p className="text-blue-100 text-sm">View and manage your schedule</p>
          </Link>
          
          <Link href="/therapist/patients" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <User className="w-8 h-8 mb-3 text-[#2596be]" />
            <h3 className="font-semibold text-lg text-gray-900">Patient Records</h3>
            <p className="text-gray-600 text-sm">Access patient information</p>
          </Link>
          
          <Link href="/messages" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <MessageCircle className="w-8 h-8 mb-3 text-[#2596be]" />
            <h3 className="font-semibold text-lg text-gray-900">Messages</h3>
            <p className="text-gray-600 text-sm">Chat with patients</p>
          </Link>
          
          <Link href="/therapist/reports" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <TrendingUp className="w-8 h-8 mb-3 text-[#2596be]" />
            <h3 className="font-semibold text-lg text-gray-900">Reports & Analytics</h3>
            <p className="text-gray-600 text-sm">View practice insights</p>
          </Link>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
            <Link href="/therapist/appointments" className="text-[#2596be] hover:text-[#1d7a99] font-medium">
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
              {appointments.map((appointment) => (
                <div key={appointment.appointment_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2596be]/10 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-[#2596be]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.user_name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{appointment.session_type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No appointments scheduled for today</p>
            </div>
          )}
        </div>

        {/* Recent Activity & Practice Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Practice Tips */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Practice Tips</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-[#2596be]">Patient Engagement</h4>
                <p className="text-sm text-gray-700 mt-1">Regular check-ins between sessions improve treatment outcomes</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700">Session Documentation</h4>
                <p className="text-sm text-gray-700 mt-1">Keep detailed notes for better continuity of care</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-700">Professional Development</h4>
                <p className="text-sm text-gray-700 mt-1">Stay updated with latest therapeutic techniques</p>
              </div>
            </div>
          </div>

          {/* Quick Resources */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Resources</h3>
            <div className="space-y-3">
              <Link href="/therapist/resources" className="block p-3 hover:bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Treatment Resources</h4>
                <p className="text-sm text-gray-600">Access therapy tools and worksheets</p>
              </Link>
              <Link href="/therapist/continuing-education" className="block p-3 hover:bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Continuing Education</h4>
                <p className="text-sm text-gray-600">Professional development courses</p>
              </Link>
              <Link href="/therapist/billing" className="block p-3 hover:bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Billing & Payments</h4>
                <p className="text-sm text-gray-600">Manage invoices and payments</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}