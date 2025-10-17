"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Calendar, Clock, User, Star, MessageCircle, FileText, Download, Search } from "lucide-react";

interface Appointment {
  appointment_id: number;
  therapist_name: string;
  start_time: string;
  end_time: string;
  status: string;
  fees_min: number;
  fees_max: number;
  payment_id: number | null;
  payment_status: string | null;
  payment_amount?: number;
  has_session_notes?: number;
  computed_status?: 'completed' | 'upcoming';
}

function AppointmentHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [payingAppointment, setPayingAppointment] = useState<number | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, searchTerm, dateRange]);

  const handlePayNow = async (appointmentId: number) => {
    if (payingAppointment || !user) return;
    
    setPayingAppointment(appointmentId);
    
    try {
      console.log('Creating payment intent for appointment:', appointmentId);
      // Create payment intent for this appointment
      const response = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId,
          user_id: user.user_id || user.therapist_id
        })
      });
      
      const data = await response.json();
      console.log('Payment intent response:', data);
      
      if (response.ok && data.ok) {
        // Redirect to payment page
        window.location.href = `/pay/${appointmentId}?pid=${data.payment_id}`;
      } else {
        console.error('Payment intent failed:', data);
        alert(data.error || 'Failed to create payment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment. Please try again.');
    } finally {
      setPayingAppointment(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, searchTerm, dateRange]);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.user_id || user.therapist_id}/appointments`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched appointments:', data.appointments);
        console.log('Sample appointment:', data.appointments?.[0]);
        
        // Debug payment amounts
        const paidAppointments = (data.appointments || []).filter(apt => 
          apt.payment_status === 'completed' || apt.payment_status === 'paid'
        );
        console.log('Paid appointments:', paidAppointments);
        console.log('Payment amounts:', paidAppointments.map(apt => ({
          id: apt.appointment_id,
          payment_amount: apt.payment_amount,
          fees_max: apt.fees_max,
          fees_min: apt.fees_min
        })));
        
        setAppointments(data.appointments || []);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const filterAppointments = useCallback(() => {
    if (!Array.isArray(appointments)) {
      setFilteredAppointments([]);
      return;
    }
    
    let filtered = [...appointments];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.therapist_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (dateRange !== "all") {
        filtered = filtered.filter(apt => new Date(apt.start_time) >= cutoffDate);
      }
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, searchTerm, dateRange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '📹';
      case 'phone': return '📞';
      case 'in-person': return '🏢';
      case 'chat': return '💬';
      default: return '📅';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment History</h1>
          <p className="text-gray-600">View and manage your past appointments and sessions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search therapist or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
            
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99]">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{(appointments || []).length}</div>
            <div className="text-gray-600 text-sm">Total Sessions</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {(appointments || []).filter(apt => apt.computed_status === 'completed' || apt.has_session_notes === 1).length}
            </div>
            <div className="text-gray-600 text-sm">Completed</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">
              {(appointments || []).filter(apt => apt.computed_status === 'upcoming').length}
            </div>
            <div className="text-gray-600 text-sm">Upcoming</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-[#2596be]">
              ৳{Math.round((appointments || [])
                .filter(apt => apt.payment_status === 'completed' || apt.payment_status === 'paid')
                .reduce((total, apt) => {
                  const amount = Number(apt.payment_amount) || Number(apt.fees_max) || Number(apt.fees_min) || 0;
                  return total + amount;
                }, 0)).toLocaleString('en-US')}
            </div>
            <div className="text-gray-600 text-sm">Total Spent</div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div key={appointment.appointment_id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2596be]/10 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-[#2596be]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.therapist_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.computed_status || appointment.status)}`}>
                          {appointment.has_session_notes === 1 ? 'Completed' : (appointment.computed_status || appointment.status)}
                        </span>
                        {/* Payment Status Badge */}
                        {appointment.payment_status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.payment_status === 'completed' || appointment.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-[#2596be]/10 text-[#2596be]'
                          }`}>
                            {appointment.payment_status === 'completed' || appointment.payment_status === 'paid' 
                              ? 'Paid' 
                              : 'Payment Pending'
                            }
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">Therapy Session</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(appointment.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span className="capitalize">Session</span>
                        </div>
                      </div>
                    </div>
                  </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        ৳{appointment.payment_amount || appointment.fees_max || appointment.fees_min || 0}
                      </div>
                      
                      {/* Payment status and actions */}
                      <div className="flex flex-col items-end gap-2">
                        {/* Show Pay Now button for any appointment with incomplete payment */}
                        {appointment.payment_status !== 'completed' && appointment.payment_status !== 'paid' && (
                          <div className="flex gap-2">
                            {appointment.payment_id ? (
                              <Link 
                                href={`/pay/${appointment.appointment_id}?pid=${appointment.payment_id}`}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                Complete Payment
                              </Link>
                            ) : (
                              <button
                                onClick={() => handlePayNow(appointment.appointment_id)}
                                disabled={payingAppointment === appointment.appointment_id}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {payingAppointment === appointment.appointment_id ? 'Processing...' : 'Pay Now'}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {appointment.status === 'completed' && (
                            <>
                              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50">
                                <FileText className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50">
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          <Link 
                            href={`/appointments/${appointment.appointment_id}`}
                            className="px-3 py-1 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99] text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                </div>
                
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" || dateRange !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You haven't had any appointments yet."}
              </p>
              <Link 
                href="/appointments"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2596be] text-white rounded-xl hover:bg-[#1d7a99] font-semibold"
              >
                <Calendar className="w-5 h-5" />
                Book Your First Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppointmentHistoryWrapper() {
  return (
    <RequireAuth>
      <AppointmentHistory />
    </RequireAuth>
  );
}