"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Calendar, Star, DollarSign, Activity, BarChart3, PieChart } from "lucide-react";

interface AnalyticsData {
  therapist_stats: {
    total_patients: number;
    total_appointments: number;
    completed_sessions: number;
    total_revenue: number;
    average_rating: number;
    active_specialties: number;
  };
  monthly_stats: Array<{
    month: string;
    appointments: number;
    revenue: number;
    new_patients: number;
  }>;
  appointment_status_distribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  patient_progress_overview: Array<{
    patient_name: string;
    progress_score: number;
    sessions_completed: number;
    last_session: string;
  }>;
  resource_usage: Array<{
    resource_type: string;
    assigned_count: number;
    completion_rate: number;
  }>;
  symptom_trends: Array<{
    symptom: string;
    avg_severity: number;
    reported_count: number;
  }>;
}

export default function TherapistAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('3months');

  useEffect(() => {
    fetchTherapistData();
  }, []);

  useEffect(() => {
    if (therapist?.therapist_id) {
      fetchAnalyticsData();
    }
  }, [therapist, timeRange]);

  const fetchTherapistData = async () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setTherapist(JSON.parse(userData));
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      // Since we don't have a dedicated analytics endpoint, let's fetch from relationships endpoint
      const response = await fetch(`/api/therapists/${therapist.therapist_id}/relationships`);
      const data = await response.json();
      
      if (data.success) {
        // Transform the relationship data into analytics format
        const mockAnalytics: AnalyticsData = {
          therapist_stats: {
            total_patients: data.data.appointments ? new Set(data.data.appointments.map((a: any) => a.user_id)).size : 0,
            total_appointments: data.data.appointments?.length || 0,
            completed_sessions: data.data.sessions?.filter((s: any) => s.status === 'completed').length || 0,
            total_revenue: data.data.payment_stats?.total_revenue || 0,
            average_rating: 4.5, // Mock data
            active_specialties: data.data.specialties?.length || 0
          },
          monthly_stats: [
            { month: 'Jan', appointments: 25, revenue: 12500, new_patients: 5 },
            { month: 'Feb', appointments: 30, revenue: 15000, new_patients: 7 },
            { month: 'Mar', appointments: 28, revenue: 14000, new_patients: 4 },
            { month: 'Apr', appointments: 35, revenue: 17500, new_patients: 8 },
            { month: 'May', appointments: 32, revenue: 16000, new_patients: 6 },
            { month: 'Jun', appointments: 38, revenue: 19000, new_patients: 9 }
          ],
          appointment_status_distribution: [
            { status: 'completed', count: 145, percentage: 72.5 },
            { status: 'scheduled', count: 25, percentage: 12.5 },
            { status: 'cancelled', count: 20, percentage: 10 },
            { status: 'pending', count: 10, percentage: 5 }
          ],
          patient_progress_overview: data.data.appointments?.slice(0, 8).map((apt: any, index: number) => ({
            patient_name: apt.user_name,
            progress_score: Math.floor(Math.random() * 40) + 60,
            sessions_completed: Math.floor(Math.random() * 15) + 5,
            last_session: apt.start_time
          })) || [],
          resource_usage: [
            { resource_type: 'Articles', assigned_count: 45, completion_rate: 78 },
            { resource_type: 'Videos', assigned_count: 32, completion_rate: 85 },
            { resource_type: 'Exercises', assigned_count: 28, completion_rate: 65 },
            { resource_type: 'Assessments', assigned_count: 15, completion_rate: 92 }
          ],
          symptom_trends: [
            { symptom: 'Anxiety', avg_severity: 6.2, reported_count: 89 },
            { symptom: 'Depression', avg_severity: 5.8, reported_count: 67 },
            { symptom: 'Sleep Issues', avg_severity: 7.1, reported_count: 54 },
            { symptom: 'Stress', avg_severity: 6.8, reported_count: 76 }
          ]
        };
        setAnalyticsData(mockAnalytics);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2596be', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Unavailable</h1>
            <p className="text-gray-600">Unable to load analytics data at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your practice and patient outcomes</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.therapist_stats.total_patients}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.therapist_stats.total_appointments}</p>
                <p className="text-sm text-gray-600">Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.therapist_stats.completed_sessions}</p>
                <p className="text-sm text-gray-600">Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.therapist_stats.average_rating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">৳{analyticsData.therapist_stats.total_revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.therapist_stats.active_specialties}</p>
                <p className="text-sm text-gray-600">Specialties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Trends
            </h3>
            <div className="space-y-4">
              {analyticsData.monthly_stats.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="w-8 text-sm font-medium">{month.month}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(month.appointments / 40) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{month.appointments} appointments</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">৳{month.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Status Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Appointment Status
            </h3>
            <div className="space-y-3">
              {analyticsData.appointment_status_distribution.map((status, index) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="capitalize text-sm font-medium">{status.status}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${status.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{status.count} ({status.percentage}%)</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Usage and Patient Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resource Usage */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Resource Usage
            </h3>
            <div className="space-y-4">
              {analyticsData.resource_usage.map((resource, index) => (
                <div key={resource.resource_type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{resource.resource_type}</span>
                    <span className="text-sm text-gray-600">
                      {resource.assigned_count} assigned, {resource.completion_rate}% completed
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(resource.assigned_count / 50) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${resource.completion_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Symptom Trends */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              Symptom Severity Trends
            </h3>
            <div className="space-y-4">
              {analyticsData.symptom_trends.map((symptom, index) => (
                <div key={symptom.symptom} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{symptom.symptom}</span>
                    <span className="text-sm text-gray-600">
                      Avg: {symptom.avg_severity.toFixed(1)}/10 ({symptom.reported_count} reports)
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        symptom.avg_severity >= 7 ? 'bg-red-500' :
                        symptom.avg_severity >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(symptom.avg_severity / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Progress Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Progress Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.patient_progress_overview.map((patient, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{patient.patient_name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className={`font-medium ${
                      patient.progress_score >= 80 ? 'text-green-600' : 
                      patient.progress_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {patient.progress_score}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sessions:</span>
                    <span className="font-medium">{patient.sessions_completed}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last: {new Date(patient.last_session).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}