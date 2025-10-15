"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, Camera, Shield, Award, Clock, BookOpen, Heart } from "lucide-react";

interface UserProfile {
  user_id?: number;
  therapist_id?: number;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  Hobby?: string;
  profession?: string;
  free_text?: string;
  // Therapist specific fields
  license_no?: string;
  years_experience?: number;
  fees_min?: number;
  fees_max?: number;
  bio?: string;
  languages?: string;
  educational_info?: string;
  Interested_field?: string;
  rating?: number;
  image?: string;
  user_type?: 'user' | 'therapist';
}

export default function Profile() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && authUser) {
      fetchUserProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authUser, authLoading]);

  const fetchUserProfile = async () => {
    try {
      const userId = authUser?.role === 'therapist' ? authUser.therapist_id : authUser?.user_id;
      console.log('Using userId:', userId);
      
      if (!userId) {
        console.error('No user_id or therapist_id found in user data');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/users/${userId}`);
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const profile = await response.json();
        console.log('Profile data:', profile);
        setUser(profile);
        setEditedUser(profile);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch profile:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user! });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user! });
  };

  const handleSave = async () => {
    if (!editedUser) return;
    
    // Validation
    if (!editedUser.name || !editedUser.email) {
      alert('Name and email are required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone validation (if provided)
    if (editedUser.phone && !/^[\+]?[0-9\-\s\(\)]+$/.test(editedUser.phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    // Therapist-specific validation
    if (isTherapist()) {
      if (editedUser.fees_min && editedUser.fees_max && editedUser.fees_min > editedUser.fees_max) {
        alert('Minimum fee cannot be greater than maximum fee');
        return;
      }
    }
    
    setSaving(true);
    try {
      const userId = editedUser.user_id || editedUser.therapist_id;
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        setUser(editedUser);
        setIsEditing(false);
        localStorage.setItem('user', JSON.stringify(editedUser));
        window.dispatchEvent(new Event('userUpdated'));
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update profile: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: typeof value === 'string' && field.includes('fee') ? parseInt(value) || 0 : value
      });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isTherapist = () => {
    return user?.user_type === 'therapist' || user?.therapist_id !== undefined;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!authUser || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Not Available</h2>
            <p className="text-gray-600 mb-6">
              Please log in to view your profile.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/login'}
                className="w-full px-6 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99]"
              >
                Go to Login
              </button>
              <button 
                onClick={() => window.location.href = '/test-login'}
                className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Test with Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-modern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="card-modern border-0 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-[#2596be] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.image ? (
                    <img src={user.image} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-[#2596be] text-white p-2 rounded-full hover:bg-[#1d7a99]">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isTherapist() ? `Dr. ${user.name}` : user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  {isTherapist() 
                    ? `Licensed Therapist • ${user.years_experience || 0} years experience`
                    : `${user.profession || 'User'} • Member since ${formatDate(user.date_of_birth) || 'N/A'}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button 
                  onClick={handleEdit}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {isTherapist() ? 'Professional Information' : 'Personal Information'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{isTherapist() ? `Dr. ${user.name}` : user.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  {isEditing ? (
                    <select
                      value={editedUser?.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{user.gender || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* User-specific fields */}
                {!isTherapist() && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedUser?.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span>{user.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedUser?.date_of_birth ? editedUser.date_of_birth.split('T')[0] : ''}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span>{formatDate(user.date_of_birth) || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.profession || ''}
                          onChange={(e) => handleInputChange('profession', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span>{user.profession || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hobbies</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.Hobby || ''}
                          onChange={(e) => handleInputChange('Hobby', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Heart className="w-5 h-5 text-gray-400" />
                          <span>{user.Hobby || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                      {isEditing ? (
                        <textarea
                          value={editedUser?.free_text || ''}
                          onChange={(e) => handleInputChange('free_text', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                          placeholder="Tell us anything else about yourself..."
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span>{user.free_text || 'No additional information provided'}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Therapist-specific fields */}
                {isTherapist() && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.license_no || ''}
                          onChange={(e) => handleInputChange('license_no', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Shield className="w-5 h-5 text-gray-400" />
                          <span>{user.license_no || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedUser?.years_experience || ''}
                          onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span>{user.years_experience || 0} years</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.languages || ''}
                          onChange={(e) => handleInputChange('languages', e.target.value)}
                          placeholder="e.g., English, Bengali, Hindi"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span>{user.languages || 'Not specified'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interested Field</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.Interested_field || ''}
                          onChange={(e) => handleInputChange('Interested_field', e.target.value)}
                          placeholder="e.g., Cognitive Behavioral Therapy, Family Counseling"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                          <span>{user.Interested_field || 'Not specified'}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee Range (৳)</label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={editedUser?.fees_min || ''}
                            onChange={(e) => handleInputChange('fees_min', parseInt(e.target.value) || 0)}
                            placeholder="Min fee"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                            min="0"
                          />
                          <input
                            type="number"
                            value={editedUser?.fees_max || ''}
                            onChange={(e) => handleInputChange('fees_max', parseInt(e.target.value) || 0)}
                            placeholder="Max fee"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                            min="0"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span>৳{user.fees_min || 0} - ৳{user.fees_max || 0}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                      {isEditing ? (
                        <textarea
                          value={editedUser?.bio || ''}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                          placeholder="Share your expertise, approach to therapy, and what patients can expect..."
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span>{user.bio || 'No bio provided'}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Educational Information</label>
                      {isEditing ? (
                        <textarea
                          value={editedUser?.educational_info || ''}
                          onChange={(e) => handleInputChange('educational_info', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                          placeholder="University degrees, certifications, specializations..."
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span>{user.educational_info || 'No educational information provided'}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {isTherapist() ? 'Professional Summary' : 'Profile Summary'}
              </h3>
              <div className="space-y-4">
                {isTherapist() ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-semibold">{Number(user.rating || 0).toFixed(1)} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-semibold">{user.years_experience || 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee Range</span>
                      <span className="font-semibold">৳{user.fees_min || 0}-{user.fees_max || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">License</span>
                      <span className="font-semibold text-xs">{user.license_no || 'N/A'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="font-semibold text-xs">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-semibold text-xs">{user.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profession</span>
                      <span className="font-semibold text-xs">{user.profession || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hobbies</span>
                      <span className="font-semibold text-xs">{user.Hobby || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {isTherapist() ? (
                  <>
                    <button 
                      onClick={() => router.push('/therapist/schedule')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>Manage Schedule</span>
                    </button>
                    <button 
                      onClick={() => router.push('/therapist/patients')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      <span>View Patients</span>
                    </button>
                    <button 
                      onClick={() => router.push('/therapist/certifications')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Award className="w-5 h-5 text-gray-400" />
                      <span>Certifications</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => router.push('/appointments')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>Book Appointment</span>
                    </button>
                    <button 
                      onClick={() => router.push('/therapists')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      <span>Find Therapists</span>
                    </button>
                    <button 
                      onClick={() => router.push('/privacy-settings')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Shield className="w-5 h-5 text-gray-400" />
                      <span>Privacy Settings</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}