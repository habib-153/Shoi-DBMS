"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { 
  NotepadText, 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  FileText,
  Search,
  ChevronRight,
  UserPlus,
  AlertCircle,
  Phone,
  Mail,
  Award,
  BookOpen,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SessionNote {
  note_id: number;
  session_id: number;
  appointment_id: number;
  user_id: number;
  therapist_id: number;
  session_date: string;
  duration_min: number;
  summary?: string;
  homework?: string;
  therapist_name: string;
  therapist_email?: string;
  user_name?: string;
  user_email?: string;
  appointment_status?: string;
  start_time?: string;
  end_time?: string;
  visible_to_user: boolean;
  created_at: string;
}

interface Referral {
  referral_id: number;
  user_id: number;
  referring_therapist_id: number;
  referred_to_therapist_id: number;
  session_id?: number;
  reason: string;
  severity_level: 'severe' | 'critical';
  symptoms?: string;
  current_medication?: string;
  additional_notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  response_notes?: string;
  created_at: string;
  updated_at: string;
  referring_therapist_name: string;
  referring_therapist_email: string;
  psychiatrist_name: string;
  psychiatrist_email: string;
  psychiatrist_phone: string;
  psychiatrist_bio?: string;
  psychiatrist_education?: string;
  psychiatrist_experience?: number;
  psychiatrist_rating?: number;
  psychiatrist_fees_min?: number;
  psychiatrist_fees_max?: number;
  psychiatrist_image?: string;
  session_date?: string;
}

function SessionNotesPage() {
  const { user } = useAuth();
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<SessionNote[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'referrals'>('notes');
  const [processingReferral, setProcessingReferral] = useState<number | null>(null);

  useEffect(() => {
    if (user?.user_id) {
      fetchSessionNotes();
      fetchReferrals();
    }
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [sessionNotes, searchTerm]);

  const fetchSessionNotes = async () => {
    if (!user?.user_id) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/session-notes`);
      if (response.ok) {
        const data = await response.json();
        setSessionNotes(data.sessionNotes || []);
      } else {
        console.error("Failed to fetch session notes");
      }
    } catch (error) {
      console.error("Error fetching session notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    if (!user?.user_id) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/referrals`);
      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
      } else {
        console.error("Failed to fetch referrals");
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const filterNotes = () => {
    let filtered = [...sessionNotes];

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.therapist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.homework?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date, most recent first
    filtered.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

    setFilteredNotes(filtered);
  };

  const handleAcceptReferral = async (referralId: number, psychiatristId: number) => {
    if (!confirm('Accept this referral? You will be able to book an appointment with the psychiatrist.')) {
      return;
    }

    setProcessingReferral(referralId);
    try {
      const response = await fetch(`/api/referrals/${referralId}/patient-response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'accepted',
          user_id: user?.user_id
        }),
      });

      if (response.ok) {
        alert('Referral accepted! You can now book an appointment with the psychiatrist.');
        fetchReferrals(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to accept referral: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error accepting referral:', error);
      alert('Failed to accept referral. Please try again.');
    } finally {
      setProcessingReferral(null);
    }
  };

  const handleRejectReferral = async (referralId: number) => {
    const reason = prompt('Please provide a reason for rejecting this referral (optional):');
    if (reason === null) return; // User cancelled

    setProcessingReferral(referralId);
    try {
      const response = await fetch(`/api/referrals/${referralId}/patient-response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          user_id: user?.user_id,
          patient_notes: reason || 'Patient declined the referral'
        }),
      });

      if (response.ok) {
        alert('Referral rejected.');
        fetchReferrals(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to reject referral: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting referral:', error);
      alert('Failed to reject referral. Please try again.');
    } finally {
      setProcessingReferral(null);
    }
  };

  const handleBookAppointment = (psychiatristId: number, psychiatristName: string) => {
    // Redirect to appointments page with psychiatrist pre-selected
    window.location.href = `/appointments?therapist_id=${psychiatristId}&therapist_name=${encodeURIComponent('Dr. ' + psychiatristName)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Therapy Records</h1>
          <p className="text-gray-600">Review notes and referrals from your therapy sessions</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'notes'
                  ? 'text-[#2596be] border-b-2 border-[#2596be]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <NotepadText className="w-5 h-5" />
              Session Notes ({sessionNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'referrals'
                  ? 'text-[#2596be] border-b-2 border-[#2596be]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              Psychiatrist Referrals ({referrals.length})
            </button>
          </div>
        </div>

        {/* Search */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search session notes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Session Notes List */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {filteredNotes.map((note) => (
              <Card key={note.note_id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <NotepadText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        Session on {new Date(note.session_date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Dr. {note.therapist_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{note.duration_min} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Visible to you
                  </Badge>
                </div>

                {/* Summary */}
                {note.summary && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-800">Session Summary</h4>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{note.summary}</p>
                    </div>
                  </div>
                )}

                {/* Homework */}
                {note.homework && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-[#2596be]" />
                      <h4 className="font-semibold text-gray-800">Homework & Action Items</h4>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-700 leading-relaxed">{note.homework}</p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Session ID: #{note.session_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      Appointment ID: #{note.appointment_id}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

            {/* Empty State */}
            {filteredNotes.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <NotepadText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No session notes found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "Try adjusting your search" 
                    : "Your therapist will share session notes with you after your appointments"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Referrals List */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {referrals.map((referral) => (
              <Card key={referral.referral_id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        referral.status === 'accepted' ? 'bg-green-100' :
                        referral.status === 'pending' ? 'bg-yellow-100' :
                        referral.status === 'rejected' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        <UserPlus className={`w-6 h-6 ${
                          referral.status === 'accepted' ? 'text-green-600' :
                          referral.status === 'pending' ? 'text-yellow-600' :
                          referral.status === 'rejected' ? 'text-red-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          Referred to Psychiatrist
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>By: Dr. {referral.referring_therapist_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        referral.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                        referral.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        referral.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Psychiatrist Info */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-800">Psychiatrist Details</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900">Dr. {referral.psychiatrist_name}</p>
                      {referral.psychiatrist_experience && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {referral.psychiatrist_experience} years of experience
                        </p>
                      )}
                      {referral.psychiatrist_rating && typeof referral.psychiatrist_rating === 'number' && (
                        <p className="text-sm text-gray-600">
                          ⭐ {referral.psychiatrist_rating.toFixed(1)} rating
                        </p>
                      )}
                      {referral.psychiatrist_education && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {referral.psychiatrist_education}
                        </p>
                      )}
                      {referral.psychiatrist_fees_min && referral.psychiatrist_fees_max && (
                        <p className="text-sm text-gray-600">
                          💰 Fees: ${referral.psychiatrist_fees_min} - ${referral.psychiatrist_fees_max} per session
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-300 space-y-1">
                      {referral.psychiatrist_email && (
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          {referral.psychiatrist_email}
                        </p>
                      )}
                      {referral.psychiatrist_phone && (
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          {referral.psychiatrist_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Referral Reason */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={`w-5 h-5 ${
                        referral.severity_level === 'critical' ? 'text-red-600' : 'text-orange-600'
                      }`} />
                      <h4 className="font-semibold text-gray-800">
                        Reason for Referral 
                        <span className={`ml-2 text-sm font-normal ${
                          referral.severity_level === 'critical' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          ({referral.severity_level})
                        </span>
                      </h4>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{referral.reason}</p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(referral.symptoms || referral.current_medication || referral.additional_notes) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {referral.symptoms && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Symptoms</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{referral.symptoms}</p>
                        </div>
                      )}
                      {referral.current_medication && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Current Medication</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{referral.current_medication}</p>
                        </div>
                      )}
                      {referral.additional_notes && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Additional Notes</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{referral.additional_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Response Notes (if accepted/rejected) */}
                  {referral.response_notes && referral.status !== 'pending' && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-800">Psychiatrist's Response</h4>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-700 leading-relaxed">{referral.response_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {referral.status === 'pending' && (
                    <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <p className="font-medium text-gray-800">This referral is waiting for your response</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAcceptReferral(referral.referral_id, referral.referred_to_therapist_id)}
                          disabled={processingReferral === referral.referral_id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {processingReferral === referral.referral_id ? 'Processing...' : 'Accept Referral'}
                        </button>
                        <button
                          onClick={() => handleRejectReferral(referral.referral_id)}
                          disabled={processingReferral === referral.referral_id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          {processingReferral === referral.referral_id ? 'Processing...' : 'Reject Referral'}
                        </button>
                      </div>
                    </div>
                  )}

                  {referral.status === 'accepted' && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="font-medium text-gray-800">You have accepted this referral</p>
                        </div>
                        <button
                          onClick={() => handleBookAppointment(referral.referred_to_therapist_id, referral.psychiatrist_name)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  )}

                  {referral.status === 'rejected' && (
                    <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <X className="w-5 h-5 text-red-600" />
                        <p className="font-medium text-gray-800">You have rejected this referral</p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Referral ID: #{referral.referral_id}</span>
                      {referral.session_date && (
                        <span>Session Date: {new Date(referral.session_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Empty State */}
            {referrals.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No referrals yet</h3>
                <p className="text-gray-500">
                  Your psychologist may refer you to a psychiatrist if specialized care is needed
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionNotesWrapper() {
  return (
    <RequireAuth>
      <SessionNotesPage />
    </RequireAuth>
  );
}
