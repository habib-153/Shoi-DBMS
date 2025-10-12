"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Calendar, Mail, Eye, MessageCircle, FileText, Plus, Brain, AlertCircle, Heart, Activity } from "lucide-react";

interface Patient {
  user_id: number;
  name: string;
  email: string;
  total_appointments: number;
  last_appointment: string | null;
  assessment_count: number;
  avg_mood: number | null;
}

export default function TherapistPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
      fetchPatients();
    }
  }, [therapist]);

  const fetchTherapistData = async () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('therapist') || localStorage.getItem('user');
      if (userData) {
        const therapistData = JSON.parse(userData);
        setTherapist(therapistData);
      } else {
        setTherapist({ therapist_id: 202, name: 'Demo Therapist' });
      }
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapists/${therapist.therapist_id}/patients`);
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
      } else {
        setError(data.error || 'Failed to fetch patients');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && patient.total_appointments > 0) ||
                         (statusFilter === 'inactive' && patient.total_appointments === 0);
    
    return matchesSearch && matchesStatus;
  });

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-modern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-modern flex items-center justify-center">
        <div className="text-center card-modern p-8 max-w-md mx-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Error Loading Patients</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary px-6 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-modern">
      <div className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Patient Management</h1>
              <p className="text-muted-foreground">Manage your patients and track their progress</p>
            </div>
            <button className="btn-primary px-4 py-2 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Patient
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern border-0 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern pl-10 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-modern"
            >
              <option value="all">All Patients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">{patients.length}</p>
              </div>
              <User className="w-8 h-8 text-[#2596be]" />
            </div>
          </div>
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Patients</p>
                <p className="text-2xl font-bold text-foreground">
                  {patients.filter(p => p.total_appointments > 0).length}
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="card-modern border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  {patients.filter(p => {
                    if (!p.last_appointment) return false;
                    const lastAppt = new Date(p.last_appointment);
                    const thisMonth = new Date();
                    return lastAppt.getMonth() === thisMonth.getMonth() && 
                           lastAppt.getFullYear() === thisMonth.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card-modern border-0 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Patients</h2>
            {filteredPatients.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {filteredPatients.length} of {patients.length} patients
              </span>
            )}
          </div>

          {filteredPatients.length > 0 ? (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div 
                  key={patient.user_id} 
                  className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2596be]/10 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-[#2596be]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {patient.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="text-center">
                          <p className="text-foreground font-semibold">{patient.total_appointments}</p>
                          <p>Sessions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-foreground font-semibold">{patient.assessment_count}</p>
                          <p>Assessments</p>
                        </div>
                        <div className="text-center">
                          <p className="text-foreground font-semibold">
                            {formatDate(patient.last_appointment)}
                          </p>
                          <p>Last Visit</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4 gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/therapist/patients/${patient.user_id}`);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-[#2596be]/10 text-[#2596be] rounded-md hover:bg-[#2596be]/20 transition-colors"
                    >
                      <Activity className="w-3 h-3" />
                      Full Records
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 text-xs bg-green-500/10 text-green-600 rounded-md hover:bg-green-500/20 transition-colors">
                      <MessageCircle className="w-3 h-3" />
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'You haven\'t added any patients yet'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button className="btn-primary px-6 py-2 flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Add Your First Patient
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
