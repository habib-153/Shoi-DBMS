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
  X,
  Star,
  MapPin,
  Languages
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import dayjs from "dayjs";

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

  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPsychiatrist, setSelectedPsychiatrist] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string;
    experience?: number;
    rating?: number;
    fees_min?: number;
    fees_max?: number;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [availableSlots, setAvailableSlots] = useState<{start: string; end: string}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{start: string; end: string} | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

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

  const handleBookAppointment = (psychiatristId: number, psychiatristName: string, psychiatristEmail: string, psychiatristPhone: string, psychiatristExperience?: number, psychiatristRating?: number, psychiatristFeesMin?: number, psychiatristFeesMax?: number) => {
    console.log('handleBookAppointment called with:', {
      psychiatristId,
      psychiatristName,
      psychiatristEmail,
      psychiatristPhone,
      psychiatristExperience,
      psychiatristRating,
      psychiatristFeesMin,
      psychiatristFeesMax
    });
    
    setSelectedPsychiatrist({
      id: psychiatristId,
      name: psychiatristName,
      email: psychiatristEmail,
      phone: psychiatristPhone,
      experience: psychiatristExperience,
      rating: psychiatristRating,
      fees_min: psychiatristFeesMin,
      fees_max: psychiatristFeesMax
    });
    setShowBookingModal(true);
    setSelectedDate(dayjs().add(1, "day").format("YYYY-MM-DD"));
    setSelectedSlot(null);
    
    console.log('Modal should now be visible, showBookingModal:', true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedPsychiatrist(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  // Fetch available slots when date or psychiatrist changes
  useEffect(() => {
    if (!selectedPsychiatrist || !selectedDate) {
      console.log('Skipping slot fetch - missing psychiatrist or date:', { selectedPsychiatrist, selectedDate });
      return;
    }
    
    console.log('Fetching slots for:', {
      therapist_id: selectedPsychiatrist.id,
      date: selectedDate
    });
    
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const url = `/api/slots?therapist_id=${selectedPsychiatrist.id}&date=${selectedDate}`;
        console.log('Fetching from URL:', url);
        
        const res = await fetch(url);
        const data = await res.json();
        
        console.log('Slots API response:', data);
        
        // API returns array directly, not {ok: true, slots: []}
        if (Array.isArray(data)) {
          console.log('Setting available slots:', data);
          setAvailableSlots(data);
        } else {
          console.log('No slots available or invalid response');
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    
    fetchSlots();
  }, [selectedPsychiatrist, selectedDate]);

  const handleConfirmBooking = async (shouldPayNow: boolean = false) => {
    if (!selectedPsychiatrist || !selectedSlot || !user) {
      toast.error("Please select a time slot");
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          therapist_id: selectedPsychiatrist.id,
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
          status: shouldPayNow ? 'pending_payment' : 'scheduled',
        }),
      });

      const data = await res.json();
      
      console.log('Appointment booking response:', data);
      
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      if (shouldPayNow && data.appointment_id) {
        // Create payment intent
        toast.success("Appointment booked! Redirecting to payment...");
        
        const paymentRes = await fetch("/api/payments/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            appointment_id: data.appointment_id, 
            user_id: user.user_id 
          }),
        });

        const paymentData = await paymentRes.json();
        
        if (!paymentRes.ok || !paymentData.ok || !paymentData.payment_id) {
          throw new Error(paymentData.message || 'Failed to initialize payment');
        }

        // Redirect to payment page
        window.location.href = `/pay/${data.appointment_id}?pid=${paymentData.payment_id}`;
      } else {
        toast.success("Appointment booked successfully!");
        handleCloseBookingModal();
      }
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
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
                          onClick={() => {
                            console.log('Book Appointment button clicked!');
                            console.log('Referral data:', referral);
                            handleBookAppointment(
                              referral.referred_to_therapist_id, 
                              referral.psychiatrist_name,
                              referral.psychiatrist_email,
                              referral.psychiatrist_phone,
                              referral.psychiatrist_experience,
                              referral.psychiatrist_rating,
                              referral.psychiatrist_fees_min,
                              referral.psychiatrist_fees_max
                            );
                          }}
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

      {/* Booking Modal */}
      {showBookingModal && selectedPsychiatrist ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between" style={{ zIndex: 10 }}>
              <h3 className="text-2xl font-bold text-gray-900">Book Appointment</h3>
              <button
                onClick={handleCloseBookingModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Psychiatrist Card */}
              <div className="bg-gradient-to-br from-[#2596be]/10 to-[#1d7a99]/10 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#2596be] to-[#1d7a99] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedPsychiatrist.name.charAt(0)}
                    </div>
                  </div>

                  {/* Psychiatrist Info */}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">
                      Dr. {selectedPsychiatrist.name}
                    </h4>
                    <p className="text-[#2596be] font-medium mb-3">
                      Psychiatrist
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedPsychiatrist.rating && (
                        <div className="flex items-center text-gray-600">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{selectedPsychiatrist.rating}</span>
                          <span className="ml-1">Rating</span>
                        </div>
                      )}

                      {selectedPsychiatrist.experience && (
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedPsychiatrist.experience} years exp.
                        </div>
                      )}

                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedPsychiatrist.email}
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedPsychiatrist.phone}
                      </div>
                    </div>

                    {/* Consultation Fee */}
                    {selectedPsychiatrist.fees_min && (
                      <div className="mt-3 pt-3 border-t border-[#2596be]/20">
                        <p className="text-sm text-gray-600">Consultation Fee</p>
                        <p className="text-xl font-bold text-gray-900">
                          ৳{selectedPsychiatrist.fees_min}
                          {selectedPsychiatrist.fees_max && selectedPsychiatrist.fees_max !== selectedPsychiatrist.fees_min && 
                            <span> - ৳{selectedPsychiatrist.fees_max}</span>
                          }
                          <span className="text-sm font-normal text-gray-500 ml-1">/ session</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={dayjs().add(1, "day").format("YYYY-MM-DD")}
                  max={dayjs().add(30, "days").format("YYYY-MM-DD")}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                />
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                
                {slotsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be] mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading available slots...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No available slots for this date</p>
                    <p className="text-sm text-gray-500 mt-1">Please try another date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2">
                    {availableSlots.map((slot, idx) => {
                      const isSelected = selectedSlot?.start === slot.start;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            isSelected
                              ? 'border-[#2596be] bg-[#2596be] text-white shadow-md'
                              : 'border-gray-200 hover:border-[#2596be] hover:bg-[#2596be]/5 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dayjs(slot.start).format("hh:mm A")}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Session Details</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Session duration: 45-60 minutes</li>
                      <li>• You'll receive confirmation via email and SMS</li>
                      <li>• Please arrive 5 minutes before your appointment</li>
                      <li>• Cancellation allowed up to 24 hours before</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex gap-3 mb-3">
                <button
                  onClick={handleCloseBookingModal}
                  disabled={isBooking}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleConfirmBooking(false)}
                  disabled={!selectedSlot || isBooking}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Pay Later
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleConfirmBooking(true)}
                  disabled={!selectedSlot || isBooking}
                  className="px-6 py-3 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
