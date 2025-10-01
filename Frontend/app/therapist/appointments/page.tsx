"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Video, MessageCircle, CheckCircle, X, Filter } from "lucide-react";

interface Appointment {
  appointment_id: number;
  user_name: string;
  user_email: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  session_type: string;
  notes?: string;
}

export default function TherapistAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const therapist = JSON.parse(userData);
        const response = await fetch(`/api/appointments?therapist_id=${therapist.therapist_id}&include_past=true`);
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

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today":
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });
        break;
      case "upcoming":
        filtered = filtered.filter(apt => new Date(apt.appointment_date) >= today);
        break;
      case "past":
        filtered = filtered.filter(apt => new Date(apt.appointment_date) < today);
        break;
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.start_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.start_time}`);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredAppointments(filtered);
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setAppointments(prev => 
          prev.map(apt => 
            apt.appointment_id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        );
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageCircle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your patient appointments and sessions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>

            <div className="ml-auto text-sm text-gray-600">
              {filteredAppointments.length} appointment(s) found
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
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
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.user_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{appointment.user_email}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(appointment.appointment_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getSessionIcon(appointment.session_type)}
                          <span className="capitalize">{appointment.session_type}</span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.appointment_id, 'completed')}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.appointment_id, 'cancelled')}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    )}
                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50">
                      <MessageCircle className="w-4 h-4" />
                    </button>
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
              <p className="text-gray-600">
                {statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You don't have any appointments yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}