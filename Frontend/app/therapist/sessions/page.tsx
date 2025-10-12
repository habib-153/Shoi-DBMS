"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, FileText, Star, Edit, Save, X, Plus, MessageCircle, ArrowLeft } from "lucide-react";

interface Session {
  session_id: number;
  appointment_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  status?: string;
  notes: string;
  duration_min: number;
  rating_by_user: number;
  next_actions: string;
  user_id: number;
  user_name: string;
  user_email: string;
  therapist_name: string;
  appointment_status?: string;
}

interface SessionNote {
  note_id: number;
  session_id: number;
  summary: string;
  homework: string;
  therapist_private_notes: string;
  visible_to_user: boolean;
  created_at: string;
  session_date: string;
  user_name: string;
}

interface NewSessionNote {
  summary: string;
  homework: string;
  therapist_private_notes: string;
  visible_to_user: boolean;
}

export default function TherapistSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNote, setNewNote] = useState<NewSessionNote>({
    summary: '',
    homework: '',
    therapist_private_notes: '',
    visible_to_user: true
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<any>(null);

  useEffect(() => {
    fetchTherapistData();
  }, []);

  useEffect(() => {
    if (therapist?.therapist_id) {
      fetchSessions();
    }
  }, [therapist]);

  const fetchTherapistData = async () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setTherapist(JSON.parse(userData));
    }
  };

  const fetchSessions = async () => {
    try {
      // Use the new therapist-specific sessions endpoint
      const response = await fetch(`/api/therapist/${therapist.therapist_id}/sessions`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionNotes = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/notes?userType=therapist`);
      const data = await response.json();
      if (data.success) {
        setSessionNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching session notes:', error);
    }
  };

  const createSessionNote = async () => {
    if (!selectedSession) return;
    if (!therapist?.therapist_id) {
      alert('Therapist information not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${selectedSession.session_id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newNote,
          therapist_id: therapist.therapist_id
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchSessionNotes(selectedSession.session_id);
        setNewNote({
          summary: '',
          homework: '',
          therapist_private_notes: '',
          visible_to_user: true
        });
        setShowNewNoteModal(false);
        // Show success message with session details
        alert(`Note saved successfully!\nPatient: ${data.session_details.user_name}\nSession ID: ${data.session_details.session_id}`);
      } else {
        alert('Failed to create session note: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating session note:', error);
      alert('Error creating session note');
    }
  };

  const updateSessionStatus = async (sessionId: number, status: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const sessionStatus = session.status || session.appointment_status || 'completed';
    const matchesStatus = filterStatus === 'all' || sessionStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setShowNotesModal(true);
    fetchSessionNotes(session.session_id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Management</h1>
          <p className="text-gray-600">Manage your therapy sessions and session notes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === 'scheduled').length}
                </p>
                <p className="text-sm text-gray-600">Scheduled</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.rating_by_user).length > 0 
                    ? (sessions.filter(s => s.rating_by_user).reduce((acc, s) => acc + s.rating_by_user, 0) / 
                       sessions.filter(s => s.rating_by_user).length).toFixed(1)
                    : '0.0'
                  }
                </p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sessions</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Sessions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredSessions.map((session) => (
              <div key={session.session_id} className="p-6 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-medium text-gray-900">{session.user_name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status || session.appointment_status || 'completed')}`}>
                        {(session.status || session.appointment_status || 'completed').replace('_', ' ')}
                      </span>
                      {session.rating_by_user && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{session.rating_by_user}/5</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(session.session_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                      </div>
                      {session.duration_min && (
                        <span>{session.duration_min} minutes</span>
                      )}
                    </div>
                    {session.notes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{session.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {(session.status || session.appointment_status) === 'scheduled' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSessionStatus(session.session_id, 'in_progress');
                          }}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm"
                        >
                          Start
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSessionStatus(session.session_id, 'completed');
                          }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                        >
                          Complete
                        </button>
                      </>
                    )}
                    {(session.status || session.appointment_status) === 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSessionStatus(session.session_id, 'completed');
                        }}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleSessionClick(session)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Notes Modal */}
        {showNotesModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Session Notes</h3>
                  <p className="text-gray-600">
                    {selectedSession.user_name} - {formatDate(selectedSession.session_date)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // If note exists, pre-fill; otherwise, start fresh
                      if (sessionNotes.length > 0) {
                        const note = sessionNotes[0];
                        setNewNote({
                          summary: note.summary || '',
                          homework: note.homework || '',
                          therapist_private_notes: note.therapist_private_notes || '',
                          visible_to_user: note.visible_to_user
                        });
                      } else {
                        setNewNote({
                          summary: '',
                          homework: '',
                          therapist_private_notes: '',
                          visible_to_user: true
                        });
                      }
                      setShowNewNoteModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ba4]"
                  >
                    {sessionNotes.length > 0 ? (
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
                  <button
                    onClick={() => setShowNotesModal(false)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sessionNotes.map((note) => (
                  <div key={note.note_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm text-gray-500">
                        {new Date(note.created_at).toLocaleString()}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          note.visible_to_user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {note.visible_to_user ? 'Visible to Patient' : 'Private'}
                        </span>
                        <button
                          onClick={() => {
                            // Pre-fill the form with existing note data
                            setNewNote({
                              summary: note.summary || '',
                              homework: note.homework || '',
                              therapist_private_notes: note.therapist_private_notes || '',
                              visible_to_user: note.visible_to_user
                            });
                            setShowNewNoteModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Note"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {note.summary && (
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-1">Session Summary</h4>
                        <p className="text-gray-700">{note.summary}</p>
                      </div>
                    )}
                    
                    {note.homework && (
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-1">Homework/Action Items</h4>
                        <p className="text-gray-700">{note.homework}</p>
                      </div>
                    )}
                    
                    {note.therapist_private_notes && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">Private Notes</h4>
                        <p className="text-gray-700">{note.therapist_private_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {sessionNotes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No session notes yet. Add your first note above.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Session Note Modal */}
        {showNewNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {sessionNotes.length > 0 ? 'Edit Session Note' : 'Add Session Note'}
                </h3>
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Summary
                  </label>
                  <textarea
                    value={newNote.summary}
                    onChange={(e) => setNewNote({...newNote, summary: e.target.value})}
                    rows={4}
                    placeholder="Summarize the session, key topics discussed, patient's progress..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Homework/Action Items
                  </label>
                  <textarea
                    value={newNote.homework}
                    onChange={(e) => setNewNote({...newNote, homework: e.target.value})}
                    rows={3}
                    placeholder="Tasks or exercises for the patient to complete before next session..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Private Notes (Therapist Only)
                  </label>
                  <textarea
                    value={newNote.therapist_private_notes}
                    onChange={(e) => setNewNote({...newNote, therapist_private_notes: e.target.value})}
                    rows={3}
                    placeholder="Private observations, clinical notes, treatment planning notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="visible-to-user"
                    checked={newNote.visible_to_user}
                    onChange={(e) => setNewNote({...newNote, visible_to_user: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="visible-to-user" className="ml-2 text-sm text-gray-700">
                    Make summary and homework visible to patient
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={createSessionNote}
                  className="flex-1 bg-[#2596be] text-white py-2 px-4 rounded-lg hover:bg-[#1e7ba4]"
                >
                  Save Note
                </button>
                <button
                  onClick={() => setShowNewNoteModal(false)}
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