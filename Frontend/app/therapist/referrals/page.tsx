"use client";

import { useState, useEffect } from "react";
import { 
  UserPlus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  FileText,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Referral {
  referral_id: number;
  user_id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  referring_therapist_id: number;
  referring_therapist_name: string;
  referring_specialization: string;
  referred_to_therapist_id: number | null;
  referred_to_therapist_name: string | null;
  referred_to_specialization: string | null;
  session_id: number | null;
  session_date: string | null;
  reason: string;
  severity_level: 'moderate' | 'severe' | 'critical';
  symptoms: string | null;
  current_medication: string | null;
  additional_notes: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  response_notes: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  completed_at: string | null;
}

interface ReferralStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
  cancelled: number;
  by_severity: {
    moderate: number;
    severe: number;
    critical: number;
  };
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [viewType, setViewType] = useState<'sent' | 'received'>('sent');
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<any>(null);
  const [expandedReferral, setExpandedReferral] = useState<number | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [processingReferral, setProcessingReferral] = useState<number | null>(null);
  const [isPsychiatrist, setIsPsychiatrist] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setTherapist(user);
      
      // Check if therapist is a psychiatrist (specialty_id = 2)
      checkIfPsychiatrist(user.therapist_id);
    }
  }, []);

  const checkIfPsychiatrist = async (therapistId: number) => {
    try {
      const response = await fetch(`/api/therapist/${therapistId}/specialties`);
      const data = await response.json();
      
      // Check if any specialty has specialty_id = 2 (Psychiatrist)
      const hasPsychiatry = data.specialties?.some((s: any) => s.specialty_id === 2);
      setIsPsychiatrist(hasPsychiatry);
    } catch (error) {
      console.error('Error checking specialties:', error);
    }
  };

  useEffect(() => {
    if (therapist?.therapist_id) {
      fetchReferrals();
    }
  }, [therapist, viewType]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapists/${therapist.therapist_id}/referrals?type=${viewType}`);
      const data = await response.json();
      
      if (data.success) {
        setReferrals(data.referrals || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReferral = async (referralId: number) => {
    if (!confirm('Are you sure you want to accept this referral?')) return;

    setProcessingReferral(referralId);
    
    try {
      const response = await fetch(`/api/referrals/${referralId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          referred_to_therapist_id: therapist.therapist_id,
          therapist_id: therapist.therapist_id,
          response_notes: responseNotes || 'Referral accepted. I will contact the patient shortly.'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Referral accepted successfully!');
        setResponseNotes('');
        setExpandedReferral(null);
        fetchReferrals();
      } else {
        alert('Failed to accept referral: ' + data.error);
      }
    } catch (error) {
      console.error('Error accepting referral:', error);
      alert('Error accepting referral');
    } finally {
      setProcessingReferral(null);
    }
  };

  const handleRejectReferral = async (referralId: number) => {
    const reason = prompt('Please provide a reason for rejecting this referral:');
    if (!reason) return;

    setProcessingReferral(referralId);
    
    try {
      const response = await fetch(`/api/referrals/${referralId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          therapist_id: therapist.therapist_id,
          response_notes: reason
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Referral rejected');
        fetchReferrals();
      } else {
        alert('Failed to reject referral: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting referral:', error);
      alert('Error rejecting referral');
    } finally {
      setProcessingReferral(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'severe':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view referrals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Referrals</h1>
          <p className="text-gray-600">
            Manage referrals between psychologists and psychiatrists
          </p>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setViewType('sent')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              viewType === 'sent'
                ? 'bg-[#2596be] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Referrals Sent ({stats?.total || 0})
          </button>
          {isPsychiatrist && (
            <button
              onClick={() => setViewType('received')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                viewType === 'received'
                  ? 'bg-[#2596be] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Referrals Received ({stats?.pending || 0} pending)
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.by_severity.critical}</p>
            </div>
          </div>
        )}

        {/* Referrals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading referrals...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {viewType === 'sent' ? 'Sent' : 'Received'} Referrals
            </h3>
            <p className="text-gray-600">
              {viewType === 'sent'
                ? 'You haven\'t sent any referrals yet'
                : 'You haven\'t received any referrals yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral.referral_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Main Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {referral.patient_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(referral.severity_level)}`}>
                          {referral.severity_level.charAt(0).toUpperCase() + referral.severity_level.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(referral.created_at)}
                        </span>
                        {viewType === 'received' && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Referred by: {referral.referring_therapist_name}
                          </span>
                        )}
                        {viewType === 'sent' && referral.referred_to_therapist_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Referred to: {referral.referred_to_therapist_name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setExpandedReferral(expandedReferral === referral.referral_id ? null : referral.referral_id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedReferral === referral.referral_id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Reason Preview */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason for Referral:</p>
                    <p className="text-sm text-gray-600">
                      {referral.reason.length > 150 && expandedReferral !== referral.referral_id
                        ? referral.reason.substring(0, 150) + '...'
                        : referral.reason}
                    </p>
                  </div>

                  {/* Expanded Details */}
                  {expandedReferral === referral.referral_id && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      {/* Patient Contact */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Patient Contact:</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {referral.patient_email}
                          </span>
                          {referral.patient_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {referral.patient_phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Symptoms */}
                      {referral.symptoms && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                          <p className="text-sm text-gray-600">{referral.symptoms}</p>
                        </div>
                      )}

                      {/* Current Medication */}
                      {referral.current_medication && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Current Medication:</p>
                          <p className="text-sm text-gray-600">{referral.current_medication}</p>
                        </div>
                      )}

                      {/* Additional Notes */}
                      {referral.additional_notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
                          <p className="text-sm text-gray-600">{referral.additional_notes}</p>
                        </div>
                      )}

                      {/* Response Notes */}
                      {referral.response_notes && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Response:</p>
                          <p className="text-sm text-blue-800">{referral.response_notes}</p>
                        </div>
                      )}

                      {/* Actions for Received Pending Referrals */}
                      {viewType === 'received' && referral.status === 'pending' && (
                        <div className="pt-4 border-t border-gray-200">
                          <textarea
                            value={responseNotes}
                            onChange={(e) => setResponseNotes(e.target.value)}
                            placeholder="Add a response message (optional)..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-sm"
                            rows={2}
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptReferral(referral.referral_id)}
                              disabled={processingReferral === referral.referral_id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Accept Referral
                            </button>
                            <button
                              onClick={() => handleRejectReferral(referral.referral_id)}
                              disabled={processingReferral === referral.referral_id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
