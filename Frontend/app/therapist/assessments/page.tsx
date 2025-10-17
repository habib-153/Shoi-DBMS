"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { 
  ClipboardList, 
  Plus,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Search,
  Filter,
  X,
  Send,
  Edit,
  Trash2
} from "lucide-react";

interface Assessment {
  assessment_id: number;
  name: string;
  assessment_type: string;
  guidance_text: string;
  is_default: number;
  created_by_therapist_id: number | null;
  creator_name: string;
  question_count: number;
  created_at?: string;
}

interface Patient {
  user_id: number;
  name: string;
  email: string;
  total_appointments?: number;
}

interface AssignedAssessment {
  assignment_id: number;
  assessment_name: string;
  assessment_type: string;
  patient_name: string;
  patient_id: number;
  assigned_at: string;
  due_date: string | null;
  status: 'pending' | 'completed';
  completed_at: string | null;
  score: number | null;
}

function TherapistAssessmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'assigned'>('library');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assignedAssessments, setAssignedAssessments] = useState<AssignedAssessment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  useEffect(() => {
    console.log('User in assessments page:', user);
    const therapistId = user?.therapist_id || user?.user_id;
    console.log('Therapist ID:', therapistId);
    if (therapistId) {
      fetchAssessments();
      fetchAssignedAssessments();
      fetchPatients();
    } else {
      console.log('No therapist ID, not fetching assessments');
      setLoading(false);
    }
  }, [user?.therapist_id, user?.user_id]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const therapistId = user?.therapist_id || user?.user_id;
      const res = await fetch(`/api/assessment-types?therapist_id=${therapistId}&include_questions=false`);
      const data = await res.json();
      
      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedAssessments = async () => {
    try {
      const therapistId = user?.therapist_id || user?.user_id;
      const res = await fetch(`/api/therapist/${therapistId}/assigned-assessments`);
      const data = await res.json();
      
      if (data.success) {
        setAssignedAssessments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assigned assessments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const therapistId = user?.therapist_id || user?.user_id;
      const res = await fetch(`/api/therapist/${therapistId}/patients`);
      const data = await res.json();
      
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const openAssignModal = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowAssignModal(true);
    setSelectedPatient(null);
    setDueDate('');
    setAssignmentNotes('');
  };

  const handleDeleteAssessment = async (assessmentId: number, isDefault: number) => {
    if (isDefault === 1) {
      alert('Cannot delete default assessments');
      return;
    }

    if (!confirm('Are you sure you want to delete this assessment? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/assessment-types/${assessmentId}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        alert('Assessment deleted successfully');
        fetchAssessments(); // Refresh the list
      } else {
        alert(data.error || 'Failed to delete assessment');
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Failed to delete assessment');
    }
  };

  const handleAssignAssessment = async () => {
    if (!selectedAssessment || !selectedPatient) return;

    try {
      const therapistId = user?.therapist_id || user?.user_id;
      const res = await fetch(`/api/users/${selectedPatient}/assigned-assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: selectedAssessment.assessment_id,
          therapist_id: therapistId,
          due_date: dueDate || null,
          notes: assignmentNotes || null
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Assessment assigned successfully!');
        setShowAssignModal(false);
        fetchAssignedAssessments();
      } else {
        alert(data.error || 'Failed to assign assessment');
      }
    } catch (error) {
      console.error('Error assigning assessment:', error);
      alert('Failed to assign assessment');
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.assessment_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || assessment.assessment_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const assessmentTypes = ['all', ...Array.from(new Set(assessments.map(a => a.assessment_type)))];

  const stats = {
    totalAssessments: assessments.length,
    defaultAssessments: assessments.filter(a => a.is_default === 1).length,
    customAssessments: assessments.filter(a => a.is_default === 0).length,
    totalAssigned: assignedAssessments.length,
    pendingAssigned: assignedAssessments.filter(a => a.status === 'pending').length,
    completedAssigned: assignedAssessments.filter(a => a.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessment Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage templates and track patient progress</p>
            </div>
            <Link href="/therapist/assessments/create">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
                <Plus className="w-4 h-4" />
                Create Custom
              </button>
            </Link>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Total Library</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalAssessments}</p>
              </div>
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Assigned</p>
                <p className="text-xl font-bold text-purple-600">{stats.totalAssigned}</p>
              </div>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Pending</p>
                <p className="text-xl font-bold text-orange-600">{stats.pendingAssigned}</p>
              </div>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Completed</p>
                <p className="text-xl font-bold text-green-600">{stats.completedAssigned}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Compact Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'library'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <FileText className="inline w-4 h-4 mr-1.5" />
            Assessment Library
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'assigned'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Users className="inline w-4 h-4 mr-1.5" />
            Assigned Assessments
          </button>
        </div>

        {/* Library Tab */}
        {activeTab === 'library' && (
          <>
            {/* Compact Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search assessments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[140px]"
                >
                  {assessmentTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Compact Assessment Grid */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading assessments...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssessments.map((assessment) => (
                  <div
                    key={assessment.assessment_id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                          {assessment.name}
                        </h3>
                        <div className="flex gap-1.5">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                            {assessment.assessment_type}
                          </span>
                          {assessment.is_default === 1 && (
                            <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-md">
                              System
                            </span>
                          )}
                        </div>
                      </div>
                      <ClipboardList className="w-5 h-5 text-gray-400" />
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {assessment.guidance_text}
                    </p>

                    <div className="flex items-center text-xs text-gray-500 mb-3 border-t border-gray-100 pt-2">
                      <span className="font-medium">{assessment.question_count} questions</span>
                      <span className="mx-2">•</span>
                      <span>by {assessment.creator_name}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openAssignModal(assessment)}
                        className="flex-1 bg-blue-600 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Assign
                      </button>

                      {assessment.is_default === 0 && (
                        <>
                          <button
                            onClick={() => window.location.href = `/therapist/assessments/edit/${assessment.assessment_id}`}
                            className="bg-gray-100 text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssessment(assessment.assessment_id, assessment.is_default)}
                            className="bg-red-50 text-red-600 py-1.5 px-3 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Assigned Tab */}
        {activeTab === 'assigned' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No assessments assigned yet. Start by assigning from the library.
                      </td>
                    </tr>
                  ) : (
                    assignedAssessments.map((assignment) => (
                      <tr key={assignment.assignment_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.patient_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{assignment.assessment_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {assignment.assessment_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.assigned_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {assignment.status === 'completed' ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              <Clock className="w-4 h-4 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {assignment.score !== null ? assignment.score : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {assignment.status === 'completed' && (
                            <button
                              onClick={() => window.location.href = `/therapist/patients/${assignment.patient_id}/assessments`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && selectedAssessment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Assign Assessment</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-800">{selectedAssessment.name}</h3>
                <p className="text-sm text-gray-600">{selectedAssessment.question_count} questions</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Patient *
                  </label>
                  <select
                    value={selectedPatient || ''}
                    onChange={(e) => setSelectedPatient(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.user_id} value={patient.user_id}>
                        {patient.name || patient.email}
                      </option>
                    ))}
                  </select>
                  {patients.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No patients found. Patients appear after they have appointments or sessions with you.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Add any instructions or notes for the patient..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignAssessment}
                  disabled={!selectedPatient}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TherapistAssessmentsPage;
