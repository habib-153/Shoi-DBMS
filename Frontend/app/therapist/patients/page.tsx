"use client";

import { useState, useEffect } from "react";
import { Search, Filter, User, Calendar, Phone, Mail, Eye, MessageCircle, FileText, Plus } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  next_appointment: string | null;
  last_session: string | null;
  total_sessions: number;
  status: 'active' | 'inactive';
  notes: string;
  emergency_contact: string;
}

export default function TherapistPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // Mock data for demonstration - replace with actual API call
      const mockPatients: Patient[] = [
        {
          id: 1,
          name: "Sarah Ahmed",
          email: "sarah.ahmed@email.com",
          phone: "+880-1234567890",
          age: 28,
          gender: "Female",
          next_appointment: "2024-01-16T15:00:00Z",
          last_session: "2024-01-10T14:00:00Z",
          total_sessions: 12,
          status: 'active',
          notes: "Anxiety disorder, responds well to CBT techniques",
          emergency_contact: "+880-9876543210"
        },
        {
          id: 2,
          name: "Rafiq Hassan",
          email: "rafiq.hassan@email.com",
          phone: "+880-1987654321",
          age: 35,
          gender: "Male",
          next_appointment: "2024-01-17T10:00:00Z",
          last_session: "2024-01-12T16:00:00Z",
          total_sessions: 8,
          status: 'active',
          notes: "Work-related stress, showing good progress",
          emergency_contact: "+880-5555555555"
        },
        {
          id: 3,
          name: "Fatima Khan",
          email: "fatima.khan@email.com",
          phone: "+880-1555444333",
          age: 42,
          gender: "Female",
          next_appointment: null,
          last_session: "2024-01-08T11:00:00Z",
          total_sessions: 6,
          status: 'inactive',
          notes: "Depression management, taking a break from sessions",
          emergency_contact: "+880-7777777777"
        },
        {
          id: 4,
          name: "Karim Rahman",
          email: "karim.rahman@email.com",
          phone: "+880-1666777888",
          age: 31,
          gender: "Male",
          next_appointment: "2024-01-18T13:00:00Z",
          last_session: "2024-01-14T15:00:00Z",
          total_sessions: 4,
          status: 'active',
          notes: "Relationship counseling, new patient",
          emergency_contact: "+880-8888888888"
        }
      ];

      setPatients(mockPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openPatientModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const closePatientModal = () => {
    setSelectedPatient(null);
    setShowPatientModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600">Manage your patient records and sessions</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99]">
            <Plus className="w-5 h-5" />
            Add New Patient
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-[#2596be]" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                <p className="text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.status === 'active').length}
                </p>
                <p className="text-gray-600">Active Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.next_appointment).length}
                </p>
                <p className="text-gray-600">Upcoming Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {patients.reduce((sum, p) => sum + p.total_sessions, 0)}
                </p>
                <p className="text-gray-600">Total Sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                >
                  <option value="all">All Patients</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#2596be] rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.age} years, {patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(patient.next_appointment)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.total_sessions}</div>
                      <div className="text-sm text-gray-500">
                        Last: {formatDate(patient.last_session)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPatientModal(patient)}
                          className="text-[#2596be] hover:text-[#1d7a99]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Detail Modal */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                  <button
                    onClick={closePatientModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#2596be] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                    <p className="text-gray-600">{selectedPatient.age} years, {selectedPatient.gender}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedPatient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedPatient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Emergency: {selectedPatient.emergency_contact}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Session Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Sessions:</span>
                        <span className="text-sm font-medium">{selectedPatient.total_sessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-medium ${
                          selectedPatient.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {selectedPatient.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Session:</span>
                        <span className="text-sm">{formatDate(selectedPatient.last_session)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Session:</span>
                        <span className="text-sm">{formatDate(selectedPatient.next_appointment)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Clinical Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedPatient.notes}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99]">
                    Schedule Session
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}