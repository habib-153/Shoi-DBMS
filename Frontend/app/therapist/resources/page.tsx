"use client";

import { useState, useEffect } from "react";
import { Book, Plus, Search, Filter, User, Calendar, CheckCircle, X, Edit } from "lucide-react";

interface Resource {
  resource_id: number;
  title: string;
  description: string;
  resource_type: string;
  url: string;
  created_at: string;
  is_active: boolean;
}

interface UserResource {
  user_resource_id: number;
  user_id: number;
  resource_id: number;
  user_name: string;
  resource_title: string;
  resource_type: string;
  assigned_at: string;
  progress_status: string;
  notes: string;
}

interface Patient {
  user_id: number;
  name: string;
  email: string;
}

export default function TherapistResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [userResources, setUserResources] = useState<UserResource[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<any>(null);

  useEffect(() => {
    fetchTherapistData();
    fetchResources();
    fetchUserResources();
    fetchPatients();
  }, []);

  const fetchTherapistData = async () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setTherapist(JSON.parse(userData));
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      if (data.success) {
        setResources(data.resources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchUserResources = async () => {
    try {
      if (!therapist?.therapist_id) return;
      
      const response = await fetch(`/api/user-resources?suggested_by=${therapist.therapist_id}`);
      const data = await response.json();
      if (data.success) {
        setUserResources(data.user_resources);
      }
    } catch (error) {
      console.error('Error fetching user resources:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      if (!therapist?.therapist_id) return;
      
      const response = await fetch(`/api/therapists/${therapist.therapist_id}/patients`);
      const data = await response.json();
      if (data.success && data.patients) {
        // Transform patient data for the dropdown
        const patientList = data.patients.map((patient: any) => ({
          user_id: patient.user_id,
          name: patient.name,
          email: patient.email
        }));
        setPatients(patientList);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignResourceToPatient = async (resourceId: number, userId: number, notes: string = '') => {
    try {
      const response = await fetch('/api/user-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          resource_id: resourceId,
          suggested_by: therapist?.therapist_id,
          notes: notes
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchUserResources();
        setShowAssignModal(false);
        setSelectedResource(null);
      } else {
        alert('Failed to assign resource: ' + data.error);
      }
    } catch (error) {
      console.error('Error assigning resource:', error);
      alert('Error assigning resource');
    }
  };

  const updateResourceProgress = async (userResourceId: number, status: string) => {
    try {
      const response = await fetch(`/api/user-resources/${userResourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress_status: status
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchUserResources();
      }
    } catch (error) {
      console.error('Error updating resource progress:', error);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.resource_type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredUserResources = userResources.filter(ur => {
    if (selectedPatient) {
      return ur.user_id === selectedPatient;
    }
    return true;
  });

  const resourceTypes = ['all', ...Array.from(new Set(resources.map(r => r.resource_type).filter(type => type !== null && type !== undefined)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Management</h1>
          <p className="text-gray-600">Manage and assign therapeutic resources to your patients</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
                <p className="text-sm text-gray-600">Total Resources</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{userResources.length}</p>
                <p className="text-sm text-gray-600">Assigned Resources</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userResources.filter(ur => ur.progress_status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userResources.filter(ur => ur.progress_status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Resources</h2>
              
              {/* Search and Filter */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type && type.charAt ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <div key={resource.resource_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {resource.resource_type}
                          </span>
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              View Resource
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedResource(resource);
                          setShowAssignModal(true);
                        }}
                        className="ml-4 px-3 py-1 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ba4] text-sm"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assigned Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Assigned Resources</h2>
              
              {/* Patient Filter */}
              <select
                value={selectedPatient || ''}
                onChange={(e) => setSelectedPatient(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Patients</option>
                {patients.map(patient => (
                  <option key={patient.user_id} value={patient.user_id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {filteredUserResources.map((userResource) => (
                  <div key={userResource.user_resource_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{userResource.resource_title}</h3>
                        <p className="text-sm text-gray-600">Patient: {userResource.user_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {userResource.resource_type}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            userResource.progress_status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : userResource.progress_status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userResource.progress_status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned: {new Date(userResource.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex gap-2">
                        {userResource.progress_status !== 'completed' && (
                          <button
                            onClick={() => updateResourceProgress(userResource.user_resource_id, 'completed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Mark as completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {userResource.progress_status !== 'in_progress' && userResource.progress_status !== 'completed' && (
                          <button
                            onClick={() => updateResourceProgress(userResource.user_resource_id, 'in_progress')}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Mark as in progress"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {userResource.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        Notes: {userResource.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assign Resource Modal */}
        {showAssignModal && selectedResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Assign Resource</h3>
              <p className="text-gray-600 mb-4">Assign "{selectedResource.title}" to a patient</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Patient
                  </label>
                  <select
                    id="patient-select"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(patient => (
                      <option key={patient.user_id} value={patient.user_id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes-input"
                    rows={3}
                    placeholder="Add any specific instructions or notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const patientSelect = document.getElementById('patient-select') as HTMLSelectElement;
                    const notesInput = document.getElementById('notes-input') as HTMLTextAreaElement;
                    
                    if (patientSelect.value) {
                      assignResourceToPatient(
                        selectedResource.resource_id,
                        parseInt(patientSelect.value),
                        notesInput.value
                      );
                    } else {
                      alert('Please select a patient');
                    }
                  }}
                  className="flex-1 bg-[#2596be] text-white py-2 px-4 rounded-lg hover:bg-[#1e7ba4]"
                >
                  Assign Resource
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedResource(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}