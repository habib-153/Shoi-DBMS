"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, FileText, Edit, Save, Plus, Eye, EyeOff, CheckCircle, X, UserPlus, AlertTriangle } from "lucide-react";

interface SessionWithDetails {
  session_id: number;
  appointment_id: number;
  session_date: string;
  duration_min: number;
  user_id: number;
  user_name: string;
  user_email: string;
  start_time: string;
  end_time: string;
  appointment_status: string;
  appointment_created_at: string;
  has_notes: number;
  note_id: number | null;
  note_summary: string | null;
}

interface SessionNoteForm {
  summary: string;
  homework: string;
  therapist_private_notes: string;
  visible_to_user: boolean;
}

interface ReferralForm {
  referred_to_therapist_id: number | null;
  reason: string;
  severity_level: 'severe' | 'critical';
  symptoms: string;
  current_medication: string;
  additional_notes: string;
}

interface GroupedSessions {
  [userId: number]: {
    user_name: string;
    user_email: string;
    sessions: SessionWithDetails[];
  };
}

export default function TherapistSessionsPage() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({});
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
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
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [expandedPatients, setExpandedPatients] = useState<Set<number>>(new Set());
  const [psychiatrists, setPsychiatrists] = useState<any[]>([]);
  const [psychiatristSearch, setPsychiatristSearch] = useState('');
  const [referralForm, setReferralForm] = useState<ReferralForm>({
    referred_to_therapist_id: null,
    reason: '',
    severity_level: 'severe',
    symptoms: '',
    current_medication: '',
    additional_notes: ''
  });
  const [submittingReferral, setSubmittingReferral] = useState(false);

  // Filtered psychiatrists based on search
  const filteredPsychiatrists = psychiatrists.filter(psych => {
    if (!psychiatristSearch || psychiatristSearch.trim() === '') return true;
    const searchTerm = psychiatristSearch.toLowerCase().trim();
    const name = (psych.name || '').toLowerCase();
    const email = (psych.email || '').toLowerCase();
    return name.includes(searchTerm) || email.includes(searchTerm);
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setTherapist(user);
    }
  }, []);

  useEffect(() => {
    if (therapist?.therapist_id) {
      fetchSessions();
    }
  }, [therapist]);

  useEffect(() => {
    // Group sessions by patient
    const grouped: GroupedSessions = {};
    sessions.forEach(session => {
      if (!grouped[session.user_id]) {
        grouped[session.user_id] = {
          user_name: session.user_name,
          user_email: session.user_email,
          sessions: []
        };
      }
      grouped[session.user_id].sessions.push(session);
    });
    
    // Sort sessions within each patient group
    // Priority: 1. Pending notes first (has_notes === 0), 2. Then by date (latest first)
    Object.keys(grouped).forEach(userId => {
      grouped[Number(userId)].sessions.sort((a, b) => {
        // First sort by note status (pending notes first)
        if (a.has_notes === 0 && b.has_notes > 0) return -1;
        if (a.has_notes > 0 && b.has_notes === 0) return 1;
        
        // Then sort by date (latest first)
        const dateA = new Date(a.start_time || a.session_date).getTime();
        const dateB = new Date(b.start_time || b.session_date).getTime();
        return dateB - dateA; // Descending order (latest first)
      });
    });
    
    setGroupedSessions(grouped);
    
    // Auto-expand all patients initially
    setExpandedPatients(new Set(Object.keys(grouped).map(Number)));
  }, [sessions]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      console.log('Fetching sessions for therapist:', therapist.therapist_id);
      const response = await fetch(`/api/therapist/${therapist.therapist_id}/sessions`);
      const data = await response.json();
      console.log('Sessions fetch response:', data);
      if (data.success) {
        setSessions(data.sessions || []);
        console.log('Sessions updated:', data.sessions?.length, 'sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPsychiatrists = async () => {
    try {
      console.log('=== FETCHING PSYCHIATRISTS ===');
      const response = await fetch('/api/psychiatrists');
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Psychiatrists API response:', data);
      
      if (data.success) {
        console.log('Number of psychiatrists found:', data.psychiatrists?.length || 0);
        console.log('Psychiatrists:', data.psychiatrists);
        setPsychiatrists(data.psychiatrists || []);
      } else {
        console.error('API returned error:', data.error);
        setPsychiatrists([]);
      }
    } catch (error) {
      console.error('Error fetching psychiatrists:', error);
      setPsychiatrists([]);
    }
  };

  const handleAddEditNote = async (session: SessionWithDetails) => {
    setSelectedSession(session);
    
    // Check if session has notes (either note_id exists OR has_notes > 0)
    if (session.note_id || session.has_notes > 0) {
      try {
        console.log('Fetching existing note for session:', session.session_id);
        const response = await fetch(`/api/sessions/${session.session_id}/notes`);
        const data = await response.json();
        console.log('Note fetch response:', data);
        
        if (data.success && data.notes.length > 0) {
          const note = data.notes[0];
          console.log('Loading existing note:', note);
          setNoteForm({
            summary: note.summary || '',
            homework: note.homework || '',
            therapist_private_notes: note.therapist_private_notes || '',
            visible_to_user: note.visible_to_user ?? true
          });
        } else {
          console.log('No notes found, creating new note form');
          setNoteForm({
            summary: '',
            homework: '',
            therapist_private_notes: '',
            visible_to_user: true
          });
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        // If there's an error, still allow creating a new note
        setNoteForm({
          summary: '',
          homework: '',
          therapist_private_notes: '',
          visible_to_user: true
        });
      }
    } else {
      console.log('No existing note, creating new note form');
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
    if (!selectedSession) return;
    
    if (!noteForm.summary.trim()) {
      alert('Please provide at least a session summary');
      return;
    }

    setSaving(true);
    
    try {
      console.log('Saving note for session:', selectedSession.session_id, 'with data:', noteForm);
      
      const response = await fetch(`/api/sessions/${selectedSession.session_id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noteForm,
          therapist_id: therapist.therapist_id
        })
      });
      
      const data = await response.json();
      console.log('Save response:', data);
      
      if (data.success) {
        console.log('Note saved successfully, refreshing sessions...');
        setShowModal(false);
        await fetchSessions(); // Wait for the fetch to complete
        console.log('Sessions refreshed');
      } else {
        alert('Failed to save note: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenReferral = (session: SessionWithDetails) => {
    setSelectedSession(session);
    // Reset referral form
    setReferralForm({
      referred_to_therapist_id: null,
      reason: '',
      severity_level: 'severe',
      symptoms: '',
      current_medication: '',
      additional_notes: ''
    });
    setPsychiatristSearch(''); // Clear search
    fetchPsychiatrists();
    setShowReferralModal(true);
  };

  const handleSubmitReferral = async () => {
    if (!selectedSession) return;
    
    if (!referralForm.reason.trim()) {
      alert('Please provide a reason for the referral');
      return;
    }

    if (!referralForm.referred_to_therapist_id) {
      alert('Please select a psychiatrist to refer to');
      return;
    }

    setSubmittingReferral(true);
    
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedSession.user_id,
          referring_therapist_id: therapist.therapist_id,
          session_id: selectedSession.session_id,
          ...referralForm
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Referral created successfully for ${selectedSession.user_name}`);
        setShowReferralModal(false);
        // Optionally close the main modal too
        // setShowModal(false);
      } else {
        alert('Failed to create referral: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating referral:', error);
      alert('Error creating referral');
    } finally {
      setSubmittingReferral(false);
    }
  };

  const togglePatientExpand = (userId: number) => {
    const newExpanded = new Set(expandedPatients);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedPatients(newExpanded);
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
    return new Date(timeString).toLocaleTimeString('en-US', {
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
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const sessionsWithNotes = sessions.filter(s => s.has_notes > 0).length;
  const sessionsPending = sessions.filter(s => s.has_notes === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessions</h1>
          <p className="text-gray-600">Manage therapy sessions and session notes for your patients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedSessions).length}</p>
                <p className="text-sm text-gray-600">Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sessionsWithNotes}</p>
                <p className="text-sm text-gray-600">With Notes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sessionsPending}</p>
                <p className="text-sm text-gray-600">Pending Notes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg font-medium">No sessions found</p>
              <p className="text-gray-500 text-sm mt-2">Sessions are created when appointments are completed</p>
            </div>
          ) : (
            Object.entries(groupedSessions)
              .sort(([, dataA], [, dataB]) => {
                // Sort patients by pending notes count (more pending notes first)
                const pendingA = dataA.sessions.filter(s => s.has_notes === 0).length;
                const pendingB = dataB.sessions.filter(s => s.has_notes === 0).length;
                
                if (pendingA !== pendingB) {
                  return pendingB - pendingA; // More pending notes first
                }
                
                // If same pending count, sort by latest session date
                const latestA = Math.max(...dataA.sessions.map(s => new Date(s.start_time || s.session_date).getTime()));
                const latestB = Math.max(...dataB.sessions.map(s => new Date(s.start_time || s.session_date).getTime()));
                return latestB - latestA;
              })
              .map(([userId, patientData]) => (
              <div key={userId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div 
                  onClick={() => togglePatientExpand(Number(userId))}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{patientData.user_name}</h3>
                      <p className="text-sm text-gray-600">{patientData.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{patientData.sessions.length} Sessions</p>
                      <p className="text-xs text-gray-600">
                        {patientData.sessions.filter(s => s.has_notes > 0).length} with notes
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReferral(patientData.sessions[0]);
                      }}
                      className="px-3 py-2 bg-[#2596be] text-white text-sm rounded-lg hover:bg-[#1d7a99] transition-colors flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Refer to Psychiatrist
                    </button>
                    <div className={`transform transition-transform ${expandedPatients.has(Number(userId)) ? 'rotate-90' : ''}`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedPatients.has(Number(userId)) && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {patientData.sessions.map((session) => (
                      <div key={session.session_id} className="p-6 border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{formatDate(session.session_date)}</span>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                {formatTime(session.start_time)} - {formatTime(session.end_time)}
                              </div>
                              <span className="text-sm text-gray-600">({session.duration_min} min)</span>
                              {session.has_notes > 0 ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Has Note
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  No Note
                                </span>
                              )}
                            </div>

                            {session.note_summary && (
                              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm font-medium text-gray-700 mb-1">Session Summary:</p>
                                <p className="text-sm text-gray-600">{session.note_summary}</p>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddEditNote(session)}
                            className="ml-4 flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7a9a] transition-colors flex-shrink-0"
                          >
                            {session.has_notes > 0 ? (
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
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSession.has_notes > 0 ? 'Edit Session Note' : 'Add Session Note'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedSession.user_name} - {formatDate(selectedSession.session_date)} ({formatTime(selectedSession.start_time)})
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
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

      {/* Referral Modal */}
      {showReferralModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Refer Patient to Psychiatrist
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedSession.user_name} - Session on {formatDate(selectedSession.session_date)}
                </p>
              </div>
              <button onClick={() => setShowReferralModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Select Psychiatrist */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Psychiatrist <span className="text-red-500">*</span>
                </label>
                
                {/* Search Bar */}
                <input
                  type="text"
                  value={psychiatristSearch}
                  onChange={(e) => setPsychiatristSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                
                {/* Psychiatrist List */}
                <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  {filteredPsychiatrists.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {psychiatristSearch ? 'No psychiatrists match your search.' : 'No psychiatrists available.'}
                    </div>
                  ) : (
                    filteredPsychiatrists.map((psych) => (
                      <button
                        key={psych.therapist_id}
                        type="button"
                        onClick={() => setReferralForm({ ...referralForm, referred_to_therapist_id: psych.therapist_id })}
                        className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          referralForm.referred_to_therapist_id === psych.therapist_id
                            ? 'bg-orange-50 border-l-4 border-l-orange-500'
                            : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{psych.name}</div>
                        <div className="text-sm text-gray-500">{psych.email}</div>
                        {psych.license_no && (
                          <div className="text-xs text-gray-400 mt-1">License: {psych.license_no}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['severe', 'critical'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setReferralForm({ ...referralForm, severity_level: level as any })}
                      className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        referralForm.severity_level === level
                          ? level === 'critical'
                            ? 'border-red-600 bg-red-50 text-red-900'
                            : 'border-orange-600 bg-orange-50 text-orange-900'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Only severe or critical cases can be referred to psychiatrists
                </p>
              </div>

              {/* Reason for Referral */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Psychiatric Referral <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={referralForm.reason}
                  onChange={(e) => setReferralForm({ ...referralForm, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Explain why psychiatric intervention is needed (e.g., severe symptoms, medication evaluation required, risk assessment needed)..."
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observed Symptoms
                </label>
                <textarea
                  value={referralForm.symptoms}
                  onChange={(e) => setReferralForm({ ...referralForm, symptoms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="List specific symptoms observed (e.g., persistent depression, suicidal ideation, severe anxiety, psychotic symptoms)..."
                />
              </div>

              {/* Current Medication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medication
                </label>
                <textarea
                  value={referralForm.current_medication}
                  onChange={(e) => setReferralForm({ ...referralForm, current_medication: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="List any current medications or write 'None'..."
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={referralForm.additional_notes}
                  onChange={(e) => setReferralForm({ ...referralForm, additional_notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any other relevant information for the psychiatrist..."
                />
              </div>

              {/* Information Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This referral will be sent to the selected psychiatrist. 
                  The patient will be notified and can schedule an appointment if the psychiatrist accepts.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setShowReferralModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submittingReferral}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReferral}
                disabled={submittingReferral || !referralForm.reason.trim() || !referralForm.referred_to_therapist_id}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {submittingReferral ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Submit Referral
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
