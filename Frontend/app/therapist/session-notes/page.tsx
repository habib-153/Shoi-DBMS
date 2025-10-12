"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, FileText, Edit, Save, Plus, Eye, EyeOff } from "lucide-react";

interface AppointmentWithSession {
  appointment_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  therapist_id: number;
  start_time: string;
  end_time: string;
  appointment_status: string;
  appointment_created_at: string;
  session_id: number | null;
  session_date: string | null;
  session_created_at: string | null;
  note_id: number | null;
  note_summary: string | null;
  note_homework: string | null;
  note_private: string | null;
  note_visible: boolean | null;
}

interface SessionNoteForm {
  summary: string;
  homework: string;
  therapist_private_notes: string;
  visible_to_user: boolean;
}

export default function SessionNotesPage() {
  const [appointments, setAppointments] = useState<AppointmentWithSession[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithSession | null>(null);
  const [noteForm, setNoteForm] = useState<SessionNoteForm>({
    summary: '',
    homework: '',
    therapist_private_notes: '',
    visible_to_user: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [therapist, setTherapist] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setTherapist(user);
    }
  }, []);

  useEffect(() => {
    if (therapist?.therapist_id) {
      fetchAppointmentsWithSessions();
    }
  }, [therapist]);

  const fetchAppointmentsWithSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapist/${therapist.therapist_id}/appointments-with-notes`);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEditNote = (appointment: AppointmentWithSession) => {
    setSelectedAppointment(appointment);
    
    // Pre-fill form if note exists
    if (appointment.note_id) {
      setNoteForm({
        summary: appointment.note_summary || '',
        homework: appointment.note_homework || '',
        therapist_private_notes: appointment.note_private || '',
        visible_to_user: appointment.note_visible ?? true
      });
    } else {
      // Reset form for new note
      setNoteForm({
        summary: '',
        homework: '',
        therapist_private_notes: '',
        visible_to_user: true
      });
    }
    
    setShowModal(true);
  };

  const handleSaveNote = async () => {
    if (!selectedAppointment) return;
    
    // Validation
    if (!noteForm.summary.trim()) {
      alert('Please provide at least a session summary');
      return;
    }

    setSaving(true);
    
    try {
      // Step 1: Ensure appointment has a session
      let sessionId = selectedAppointment.session_id;
      
      if (!sessionId) {
        // Create session for this appointment
        const sessionResponse = await fetch(`/api/therapist/${therapist.therapist_id}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointment_id: selectedAppointment.appointment_id
          })
        });
        
        const sessionData = await sessionResponse.json();
        if (!sessionData.success) {
          alert('Failed to create session: ' + sessionData.error);
          return;
        }
        
        sessionId = sessionData.session_id;
      }
      
      // Step 2: Create or update note
      const noteResponse = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noteForm,
          therapist_id: therapist.therapist_id
        })
      });
      
      const noteData = await noteResponse.json();
      
      if (noteData.success) {
        alert(selectedAppointment.note_id ? 'Note updated successfully!' : 'Note created successfully!');
        setShowModal(false);
        fetchAppointmentsWithSessions(); // Refresh list
      } else {
        alert('Failed to save note: ' + noteData.error);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Notes</h1>
          <p className="text-gray-600">Manage session notes for your completed appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                <p className="text-sm text-gray-600">Total Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.note_id).length}
                </p>
                <p className="text-sm text-gray-600">With Notes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => !a.note_id).length}
                </p>
                <p className="text-sm text-gray-600">Pending Notes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No completed appointments found
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.appointment_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.user_name}
                        </h3>
                        {appointment.note_id && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Has Note
                          </span>
                        )}
                        {!appointment.note_id && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            No Note
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </div>
                      </div>

                      {appointment.note_summary && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {appointment.note_summary}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleCreateOrEditNote(appointment)}
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7a9a] transition-colors"
                    >
                      {appointment.note_id ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit Note
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Note
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedAppointment.note_id ? 'Edit Session Note' : 'Add Session Note'}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedAppointment.user_name} - {formatDate(selectedAppointment.appointment_date)}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={noteForm.summary}
                  onChange={(e) => setNoteForm({ ...noteForm, summary: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  placeholder="Describe what was discussed in this session..."
                />
              </div>

              {/* Homework */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Homework/Action Items
                </label>
                <textarea
                  value={noteForm.homework}
                  onChange={(e) => setNoteForm({ ...noteForm, homework: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  placeholder="Tasks or exercises for the patient to complete..."
                />
              </div>

              {/* Private Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Therapist Private Notes
                </label>
                <textarea
                  value={noteForm.therapist_private_notes}
                  onChange={(e) => setNoteForm({ ...noteForm, therapist_private_notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  placeholder="Private notes (not visible to patient)..."
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="visible_to_user"
                  checked={noteForm.visible_to_user}
                  onChange={(e) => setNoteForm({ ...noteForm, visible_to_user: e.target.checked })}
                  className="w-5 h-5 text-[#2596be] rounded focus:ring-[#2596be]"
                />
                <label htmlFor="visible_to_user" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  {noteForm.visible_to_user ? (
                    <><Eye className="w-4 h-4" /> Visible to Patient</>
                  ) : (
                    <><EyeOff className="w-4 h-4" /> Hidden from Patient</>
                  )}
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7a9a] transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
