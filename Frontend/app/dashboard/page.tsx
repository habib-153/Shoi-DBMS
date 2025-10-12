"use client";

import { useEffect, useState } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, User, CreditCard, Check, X, AlertCircle, MessageCircle, Activity, Bell, Settings, RefreshCw, UserRound, FileText, BookOpen, NotepadText, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dayjs from "dayjs";


interface Appointment {
  appointment_id: number;
  therapist_name: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'paid';
  fees_min: number | null;
  fees_max: number | null;
  payment_status?: 'pending' | 'completed' | 'failed';
  payment_id?: number;
}

interface Analytics {
  appointments: {
    total_appointments: number;
    completed_appointments: number;
    upcoming_appointments: number;
    cancelled_appointments: number;
  };
  health_trends: Array<{
    log_date: string;
    mood_score: number;
    sleep_hours: number;
    anxiety_level: number;
  }>;
  symptoms: {
    recent_symptoms: Array<{
      severity: string;
      date_recorded: string;
      symptom_name_en: string;
      symptom_id: number;
    }>;
    unique_symptoms_tracked: number;
    total_tracking_days: number;
  };
  assessments: {
    total_assessments: number;
    unique_assessments?: number;
    last_assessment_date?: string;
  };
  mood_trend: {
    recent_avg: number;
    previous_avg: number;
  };
  upcoming_appointments?: Array<{
    appointment_id: number;
    start_time: string;
    therapist_name: string;
    specialty_name: string;
  }>;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [assignedResources, setAssignedResources] = useState<any[]>([]);
  const [sessionNotes, setSessionNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchAppointments(),
        fetchAnalytics(),
        fetchNotifications(),
        fetchAssignedResources(),
        fetchSessionNotes()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.user_id || user.therapist_id}/appointments`);
      const data = await response.json();
      
      if (response.ok) {
        // Filter only upcoming appointments (future dates with valid statuses)
        const now = new Date();
        const upcoming = (data.appointments || []).filter((apt: Appointment) => {
          const aptDate = new Date(apt.start_time);
          return aptDate > now && ['pending', 'confirmed', 'paid'].includes(apt.status);
        });
        setAppointments(upcoming);
      } else {
        toast.error("Failed to fetch appointments");
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error loading appointments");
      setAppointments([]);
    }
  };

  const fetchAnalytics = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.user_id || user.therapist_id}/analytics`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalytics(data);
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.user_id || user.therapist_id}/notifications`);
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications || []);
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchAssignedResources = async () => {
    if (!user || !user.user_id) return;
    
    try {
      const response = await fetch(`/api/users/${user.user_id}/resources`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAssignedResources(data.resources || []);
      } else {
        console.error("Failed to fetch assigned resources");
      }
    } catch (error) {
      console.error("Error fetching assigned resources:", error);
    }
  };

  const fetchSessionNotes = async () => {
    if (!user || !user.user_id) return;
    
    try {
      const response = await fetch(`/api/users/${user.user_id}/session-notes`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSessionNotes(data.sessionNotes || []);
      } else {
        console.error("Failed to fetch session notes");
      }
    } catch (error) {
      console.error("Error fetching session notes:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <Check className="w-4 h-4" />;
      case 'paid': return <CreditCard className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'completed': return <Check className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-[#2596be] border-t-transparent rounded-full"></div>
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
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-muted-foreground">Here's your mental health journey overview</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchDashboardData}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
                title="Refresh dashboard"
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                ) : (
                  <RefreshCw className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
              <Link href="/profile" className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && (
          <>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/appointments" className="bg-[#2596be] text-white p-6 rounded-xl hover:bg-[#1d7a99] transition-colors shadow-lg">
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg">Book Appointment</h3>
            <p className="text-blue-100 text-sm">Schedule a new session</p>
          </Link>
          
          <Link href="/health-tracker" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <Activity className="w-8 h-8 mb-3 text-[#2596be] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Health Tracker</h3>
            <p className="text-muted-foreground text-sm">Track daily mood & symptoms</p>
          </Link>
          
          <Link href="/assessments" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <MessageCircle className="w-8 h-8 mb-3 text-[#2596be] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Assessments</h3>
            <p className="text-muted-foreground text-sm">Take mental health tests</p>
          </Link>
          
          <Link href="/resources" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <BookOpen className="w-8 h-8 mb-3 text-[#2596be] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Resources</h3>
            <p className="text-muted-foreground text-sm">Books, articles & tools</p>
          </Link>
        </div>

        {/* Additional Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/appointments/history" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <Clock className="w-8 h-8 mb-3 text-[#2596be] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Appointment History</h3>
            <p className="text-muted-foreground text-sm">View past sessions</p>
          </Link>
          
          <Link href="/messages" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <MessageCircle className="w-8 h-8 mb-3 text-[#2596be] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Messages</h3>
            <p className="text-muted-foreground text-sm">Chat with therapists</p>
          </Link>
          
          <Link href="/family" className="card-modern border-0 p-6 hover:shadow-md transition-shadow group">
            <Users className="w-8 h-8 mb-3 text-[#2596be] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg text-foreground">Family & Privacy</h3>
            <p className="text-muted-foreground text-sm">Manage sharing settings</p>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.appointments?.total_appointments || appointments.length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Sessions</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.appointments?.completed_appointments || 0}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.appointments?.upcoming_appointments || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Health Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card-modern border-0 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Health Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recent Mood Trend</span>
                  <div className="flex items-center gap-2">
                    {analytics.mood_trend?.recent_avg && analytics.mood_trend?.previous_avg && (
                      <Badge className={
                        analytics.mood_trend.recent_avg > analytics.mood_trend.previous_avg 
                          ? 'bg-green-100 text-green-800' 
                          : analytics.mood_trend.recent_avg < analytics.mood_trend.previous_avg
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {analytics.mood_trend.recent_avg > analytics.mood_trend.previous_avg 
                          ? '↗ Improving' 
                          : analytics.mood_trend.recent_avg < analytics.mood_trend.previous_avg
                          ? '↘ Declining'
                          : '→ Stable'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Assessments</span>
                  <span className="text-lg font-semibold text-foreground">{analytics.assessments?.total_assessments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recent Symptoms Logged</span>
                  <span className="text-lg font-semibold text-foreground">{analytics.symptoms?.recent_symptoms?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tracking Days</span>
                  <span className="text-lg font-semibold text-foreground">{analytics.symptoms?.total_tracking_days || 0}</span>
                </div>
              </div>
            </div>

            <div className="card-modern border-0 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Health Data</h3>
              <div className="space-y-3">
                {analytics.health_trends?.slice(0, 3).map((trend, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {dayjs(trend.log_date).format('MMM DD')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mood: {trend.mood_score}/10 | Sleep: {trend.sleep_hours}h
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        trend.anxiety_level <= 3 ? 'bg-green-100 text-green-800' :
                        trend.anxiety_level <= 6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        Anxiety: {trend.anxiety_level}/10
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-4">No health data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="card-modern border-0 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Notifications</h3>
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.priority === 'high' ? 'bg-red-500' :
                    notification.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  {notification.action_url && (
                    <Button
                      onClick={() => router.push(notification.action_url!)}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="card-modern border-0 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Upcoming Appointments</h2>
            <Link href="/appointments" className="text-[#2596be] hover:text-[#1d7a99] font-medium">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be] mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading dashboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => fetchDashboardData()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
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
                      <p className="text-sm text-gray-500">
                        {dayjs(appointment.start_time).format('MMM DD, YYYY')} at {dayjs(appointment.start_time).format('h:mm A')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                    {appointment.status === 'pending' && appointment.payment_id && (
                      <Button
                        onClick={() => router.push(`/pay/${appointment.appointment_id}?pid=${appointment.payment_id}`)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Complete Payment
                      </Button>
                    )}
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

        {/* Resources and Session Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Assigned Resources Section */}
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2596be]/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#2596be]" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Assigned Resources</h2>
              </div>
              <Link href="/resources" className="text-[#2596be] hover:text-[#1d7a99] font-medium text-sm">
                View All →
              </Link>
            </div>
            {assignedResources.length > 0 ? (
              <div className="space-y-3">
                {assignedResources.slice(0, 3).map((resource: any) => (
                  <a 
                    key={resource.resource_id}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="block p-4 bg-gradient-to-r from-[#2596be]/5 to-transparent rounded-lg border border-[#2596be]/10 hover:border-[#2596be]/30 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center flex-shrink-0 border border-[#2596be]/20 group-hover:border-[#2596be]/40 transition-colors">
                        <FileText className="w-4 h-4 text-[#2596be]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-foreground text-sm line-clamp-1">{resource.title}</h4>
                          <Badge className="bg-[#2596be]/10 text-[#2596be] text-xs flex-shrink-0">{resource.type}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
                        {resource.therapist_name && (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <UserRound className="w-3 h-3" />
                              {resource.therapist_name}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(resource.assigned_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No resources assigned yet</p>
                <p className="text-xs text-gray-400 mt-1">Your therapist will assign resources to support your journey</p>
                <Link 
                  href="/resources"
                  className="inline-block mt-3 text-[#2596be] hover:text-[#1d7a99] font-medium text-sm"
                >
                  Browse All Resources →
                </Link>
              </div>
            )}
          </div>

          {/* Session Notes Section - Now in Grid */}
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <NotepadText className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Session Notes</h2>
              </div>
              {sessionNotes.length > 0 && (
                <Link href="/session-notes" className="text-green-600 hover:text-green-700 font-medium text-sm">
                  View All →
                </Link>
              )}
            </div>
            {sessionNotes.length > 0 ? (
              <div className="space-y-3">
                {sessionNotes.slice(0, 3).map((note: any) => (
                  <div key={note.note_id} className="p-4 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100 hover:border-green-200 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold text-foreground text-sm">
                            {new Date(note.session_date).toLocaleDateString()}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <UserRound className="w-3 h-3" />
                          Dr. {note.therapist_name}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">{note.duration_min} min</Badge>
                    </div>
                    {note.summary && (
                      <div className="mt-3 p-3 bg-white/80 rounded border border-green-100">
                        <p className="text-xs font-medium text-gray-700 mb-1">Summary</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{note.summary}</p>
                      </div>
                    )}
                    {note.homework && (
                      <div className="mt-2 p-3 bg-green-100/50 rounded-lg border border-green-200">
                        <p className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Homework
                        </p>
                        <p className="text-xs text-green-900 line-clamp-2">{note.homework}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <NotepadText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No session notes available</p>
                <p className="text-xs text-gray-400 mt-1">Your therapist will share session notes after your appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-[#2596be]/5 to-indigo-50 rounded-xl shadow-sm border border-[#2596be]/20 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#2596be] rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Progress Overview</h2>
              <p className="text-sm text-muted-foreground">Track your mental health journey</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-modern border-0 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics?.appointments?.completed_appointments || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card-modern border-0 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <NotepadText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session Notes</p>
                  <p className="text-2xl font-bold text-foreground">{sessionNotes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card-modern border-0 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resources</p>
                  <p className="text-2xl font-bold text-foreground">{assignedResources.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Tips Section */}
        <div className="card-modern border-0 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Daily Wellness Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-700">Mindfulness</h4>
              <p className="text-sm text-gray-700 mt-1">Take 5 minutes today to practice deep breathing</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-700">Gratitude</h4>
              <p className="text-sm text-gray-700 mt-1">Write down three things you're grateful for</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-purple-700">Self-Care</h4>
              <p className="text-sm text-gray-700 mt-1">Remember to prioritize activities that bring you joy</p>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();

  return (
    <RequireAuth
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2596be]/10 via-sky-50 to-indigo-50">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your dashboard.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-[#2596be] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2596be]/90 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </RequireAuth>
  );
}
