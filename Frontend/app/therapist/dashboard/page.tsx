"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, User, DollarSign, TrendingUp, MessageCircle, Settings, Star, Users, FileText, UserPlus, ClipboardList } from "lucide-react";

interface Appointment {
  appointment_id: number;
  user_name: string;
  start_time: string;
  end_time: string;
  status: string;
  user_email: string;
  user_phone: string;
}

interface TherapistStats {
  totalPatients: number;
  todayAppointments: number;
  weeklyRevenue: number;
  averageRating: number;
  completedSessions: number;
}

interface ReferralStats {
  pending: number;
  accepted: number;
  total: number;
}

interface SessionNote {
  note_id: number;
  session_id: number;
  user_name: string;
  summary: string;
  homework: string;
  created_at: string;
  session_date: string;
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
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({ pending: 0, accepted: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchTherapistData();
    }
  }, [isClient]);

  useEffect(() => {
    if (therapist?.therapist_id) {
      fetchDashboardData();
    }
  }, [therapist]);

  const fetchDashboardData = async () => {
    await Promise.all([
      fetchTodayAppointments(),
      fetchStats(),
      fetchSessionNotes(),
      fetchUpcomingAppointments(),
      fetchReferralStats()
    ]);
  };

  const fetchTherapistData = async () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('therapist') || localStorage.getItem('user');
      if (userData) {
        setTherapist(JSON.parse(userData));
      }
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('therapist') || localStorage.getItem('user');
        if (userData) {
          const therapistData = JSON.parse(userData);
          const therapistId = therapistData.therapist_id || therapistData.id || 22; // Fallback for demo
          
          // Use local date instead of UTC
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const today = `${year}-${month}-${day}`;
          
          const response = await fetch(`/api/therapists/${therapistId}/appointments?date=${today}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setAppointments(data.appointments || []);
            }
          }
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
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('therapist') || localStorage.getItem('user');
        if (userData) {
          const therapistData = JSON.parse(userData);
          const therapistId = therapistData.therapist_id || therapistData.id || 22; // Fallback for demo
          // Fetch therapist statistics
          const response = await fetch(`/api/therapists/${therapistId}/stats`);
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSessionNotes = async () => {
    try {
      if (typeof window !== 'undefined' && therapist?.therapist_id) {
        const response = await fetch(`/api/therapists/${therapist.therapist_id}/session-notes`);
        const data = await response.json();
        if (data.success) {
          setSessionNotes(data.sessionNotes?.slice(0, 5) || []);
        }
      }
    } catch (error) {
      console.error('Error fetching session notes:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      if (typeof window !== 'undefined') {
        console.log('=== UPCOMING APPOINTMENTS DEBUG ===');
        console.log('Therapist object:', therapist);
        console.log('Therapist ID:', therapist?.therapist_id);
        
        if (!therapist?.therapist_id) {
          console.error('No therapist_id found!');
          console.log('LocalStorage therapist:', localStorage.getItem('therapist'));
          console.log('LocalStorage user:', localStorage.getItem('user'));
          return;
        }
        
        const url = `/api/therapists/${therapist.therapist_id}/appointments?status=confirmed,pending,scheduled,paid,pending_payment`;
        console.log('Fetching URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Full API response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          console.log('Total appointments returned:', data.appointments?.length || 0);
          
          // Get today's date at start of day
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          console.log('Today (start of day):', today.toISOString());
          
          // Filter for today's and future appointments
          const futureAppointments = (data.appointments || [])
            .filter((apt: Appointment) => {
              const aptTime = new Date(apt.start_time);
              const aptDate = new Date(aptTime);
              aptDate.setHours(0, 0, 0, 0);
              
              // Include if appointment is today or in the future
              const isTodayOrFuture = aptDate >= today;
              console.log(`Appointment ${apt.appointment_id}: ${apt.start_time} - Today or Future: ${isTodayOrFuture}`);
              return isTodayOrFuture;
            })
            .slice(0, 5);
          
          console.log('Filtered upcoming appointments:', futureAppointments.length);
          setUpcomingAppointments(futureAppointments);
        } else {
          console.error('API returned error:', data.error);
        }
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  };

  const fetchReferralStats = async () => {
    try {
      if (typeof window !== 'undefined' && therapist?.therapist_id) {
        // Fetch both sent and received referrals
        const [sentResponse, receivedResponse] = await Promise.all([
          fetch(`/api/therapists/${therapist.therapist_id}/referrals?type=sent`),
          fetch(`/api/therapists/${therapist.therapist_id}/referrals?type=received`)
        ]);
        
        const sentData = await sentResponse.json();
        const receivedData = await receivedResponse.json();
        
        if (sentData.success && receivedData.success) {
          setReferralStats({
            pending: (sentData.stats?.pending || 0) + (receivedData.stats?.pending || 0),
            accepted: (sentData.stats?.accepted || 0) + (receivedData.stats?.accepted || 0),
            total: (sentData.stats?.total || 0) + (receivedData.stats?.total || 0)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-modern">
        {/* Loading skeleton */}
        <div className="glass border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <div className="h-8 w-64 bg-white/10 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-white/10 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-32 bg-white/10 rounded animate-pulse"></div>
                <div className="h-10 w-10 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card-modern border-0 p-6">
                <div className="h-12 w-full bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-modern">
      {/* Header */}
      <div className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, Dr. {therapist?.name || 'Therapist'}!
              </h1>
              <p className="text-muted-foreground">Here's your practice overview for today</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => fetchDashboardData()}
                disabled={loading}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 disabled:opacity-50"
                title="Refresh Dashboard"
              >
                <Clock className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/therapist/profile" className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5">
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalPatients}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Revenue</p>
                <p className="text-2xl font-bold text-foreground">৳{stats.weeklyRevenue?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <Link href="/therapist/referrals" className="card-modern border-0 p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-[#2596be]/10 to-[#2596be]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2596be] font-medium">Pending Referrals</p>
                <p className="text-2xl font-bold text-[#1d7a99]">{referralStats.pending}</p>
                <p className="text-xs text-[#2596be] mt-1">{referralStats.total} total</p>
              </div>
              <UserPlus className="w-8 h-8 text-[#2596be]" />
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/therapist/appointments" className="bg-[#2596be] text-white p-6 rounded-xl hover:bg-[#1d7a99] transition-colors">
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg">Manage Appointments</h3>
            <p className="text-blue-100 text-sm">View and manage your schedule</p>
          </Link>
          
          <Link href="/therapist/patients" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <User className="w-8 h-8 mb-3 text-[#2596be] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Patient Records</h3>
            <p className="text-muted-foreground text-sm">Access patient information</p>
          </Link>
          
          <Link href="/therapist/sessions" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <FileText className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Sessions</h3>
            <p className="text-muted-foreground text-sm">Manage therapy sessions and notes</p>
          </Link>

          <Link href="/therapist/assessments" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group bg-gradient-to-br from-purple-50 to-purple-100">
            <ClipboardList className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Assessments</h3>
            <p className="text-muted-foreground text-sm">Assign and track assessments</p>
          </Link>

          <Link href="/therapist/referrals" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group bg-gradient-to-br from-[#2596be]/10 to-[#2596be]/20">
            <UserPlus className="w-8 h-8 text-[#2596be] mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Referrals</h3>
            <p className="text-muted-foreground text-sm">Patient psychiatric referrals</p>
          </Link>
          
          <Link href="/messages" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <MessageCircle className="h-8 w-8 text-[#2596be] mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Messages</h3>
            <p className="text-muted-foreground text-sm">Chat with patients</p>
          </Link>
        </div>

        {/* Today's Appointments */}
        <div className="card-modern border-0 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Today's Appointments</h2>
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
                <div key={appointment.appointment_id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 backdrop-blur-sm transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2596be]/10 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-[#2596be]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{appointment.user_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">Session</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No appointments scheduled for today</p>
            </div>
          )}
        </div>

        {/* Two Column Layout - Recent Sessions & Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Sessions */}
          <div className="card-modern border-0 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Recent Sessions</h2>
              <Link href="/therapist/sessions" className="text-[#2596be] hover:text-[#1d7a99] font-medium">
                View All
              </Link>
            </div>
            
            {sessionNotes.length > 0 ? (
              <div className="space-y-4">
                {sessionNotes.map((note) => (
                  <div key={note.note_id} className="p-4 border border-white/10 rounded-lg hover:bg-white/5 backdrop-blur-sm transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#2596be]" />
                        <h4 className="font-semibold text-foreground">{note.user_name}</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {note.summary}
                    </p>
                    {note.homework && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Homework:</span> {note.homework.slice(0, 50)}...
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No sessions yet</p>
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="card-modern border-0 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Upcoming Sessions</h2>
              <Link href="/therapist/appointments" className="text-[#2596be] hover:text-[#1d7a99] font-medium">
                View All
              </Link>
            </div>
            
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.appointment_id} className="p-4 border border-white/10 rounded-lg hover:bg-white/5 backdrop-blur-sm transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2596be]/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#2596be]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{appointment.user_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.start_time).toLocaleDateString()} at {formatTime(appointment.start_time)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity & Practice Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Patient Overview & Analytics */}
          <div className="card-modern border-0 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Patient Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#2596be]/5 rounded-lg">
                <span className="text-sm font-medium text-foreground">Total Active Patients</span>
                <span className="text-2xl font-bold text-[#2596be]">{stats.totalPatients}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-500/5 rounded-lg">
                <span className="text-sm font-medium text-foreground">Completed Sessions (All Time)</span>
                <span className="text-2xl font-bold text-green-700">{stats.completedSessions}</span>
              </div>
              <Link 
                href="/therapist/patients" 
                className="block w-full text-center px-4 py-3 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99] transition-colors font-medium"
              >
                View All Patients
              </Link>
            </div>
          </div>

          {/* Practice Tips */}
          <div className="card-modern border-0 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Practice Tips</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#2596be]/10 rounded-lg border border-[#2596be]/20">
                <h4 className="font-semibold text-[#2596be]">Patient Engagement</h4>
                <p className="text-sm text-muted-foreground mt-1">Regular check-ins between sessions improve treatment outcomes</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="font-semibold text-green-700">Session Documentation</h4>
                <p className="text-sm text-muted-foreground mt-1">Keep detailed notes for better continuity of care</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h4 className="font-semibold text-purple-700">Professional Development</h4>
                <p className="text-sm text-muted-foreground mt-1">Stay updated with latest therapeutic techniques</p>
              </div>
            </div>
          </div>

          {/* Quick Resources */}
          <div className="card-modern border-0 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Resources</h3>
            <div className="space-y-3">
              <Link href="/therapist/resources" className="block p-3 hover:bg-white/5 rounded-lg transition-colors">
                <h4 className="font-medium text-foreground">Treatment Resources</h4>
                <p className="text-sm text-muted-foreground">Access therapy tools and worksheets</p>
              </Link>
              <Link href="/therapist/continuing-education" className="block p-3 hover:bg-white/5 rounded-lg transition-colors">
                <h4 className="font-medium text-foreground">Continuing Education</h4>
                <p className="text-sm text-muted-foreground">Professional development courses</p>
              </Link>
              <Link href="/therapist/billing" className="block p-3 hover:bg-white/5 rounded-lg transition-colors">
                <h4 className="font-medium text-foreground">Billing & Payments</h4>
                <p className="text-sm text-muted-foreground">Manage invoices and payments</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Patients Activity */}
        <div className="card-modern border-0 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Recent Patient Activity</h2>
            <Link href="/therapist/patients" className="text-[#2596be] hover:text-[#1d7a99] font-medium">
              View All Patients
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Patients (This Week)</p>
                  <p className="text-xl font-bold text-foreground">
                    {appointments.filter(a => {
                      const appointmentDate = new Date(a.start_time);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return appointmentDate >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Notes Created (This Week)</p>
                  <p className="text-xl font-bold text-foreground">
                    {sessionNotes.filter(n => {
                      const noteDate = new Date(n.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return noteDate >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Messages</p>
                  <p className="text-xl font-bold text-foreground">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}