"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, Camera, Award, Clock } from "lucide-react";

interface TherapistProfile {
  therapist_id: number;
  name: string;
  email: string;
  license_no: string;
  years_experience: number;
  gender: string;
  fees_min: number;
  fees_max: number;
  bio: string;
  languages: string;
  rating: number;
  educational_info: string;
  image?: string;
}

export default function TherapistProfile() {
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTherapist, setEditedTherapist] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTherapistProfile();
  }, []);

  const fetchTherapistProfile = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userInfo = JSON.parse(userData);
        const response = await fetch(`/api/users/${userInfo.therapist_id}`);
        if (response.ok) {
          const profile = await response.json();
          setTherapist(profile);
          setEditedTherapist(profile);
        } else {
          console.error('Failed to fetch profile:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedTherapist({ ...therapist! });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTherapist({ ...therapist! });
  };

  const handleSave = async () => {
    if (!editedTherapist) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${editedTherapist.therapist_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTherapist),
      });

      if (response.ok) {
        setTherapist(editedTherapist);
        setIsEditing(false);
        localStorage.setItem('user', JSON.stringify(editedTherapist));
        window.dispatchEvent(new Event('userUpdated'));
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update profile: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof TherapistProfile, value: string | number) => {
    if (editedTherapist) {
      setEditedTherapist({
        ...editedTherapist,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-[#2596be] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {therapist.image ? (
                    <img src={therapist.image} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    therapist.name?.charAt(0).toUpperCase() || 'T'
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-[#2596be] text-white p-2 rounded-full hover:bg-[#1d7a99]">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dr. {therapist.name}</h1>
                <p className="text-gray-600">{therapist.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-[#2596be]" />
                    <span className="text-sm text-gray-600">License: {therapist.license_no}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#2596be]" />
                    <span className="text-sm text-gray-600">{therapist.years_experience} years experience</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button 
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99]"
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
          {/* Professional Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTherapist?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>Dr. {therapist.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedTherapist?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{therapist.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTherapist?.license_no || ''}
                      onChange={(e) => handleInputChange('license_no', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Award className="w-5 h-5 text-gray-400" />
                      <span>{therapist.license_no}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedTherapist?.years_experience || ''}
                      onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>{therapist.years_experience} years</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  {isEditing ? (
                    <select
                      value={editedTherapist?.gender || ''}
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
                      <span>{therapist.gender || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTherapist?.languages || ''}
                      onChange={(e) => handleInputChange('languages', e.target.value)}
                      placeholder="e.g., English, Bengali, Hindi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span>{therapist.languages || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee Range</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={editedTherapist?.fees_min || ''}
                        onChange={(e) => handleInputChange('fees_min', parseInt(e.target.value))}
                        placeholder="Min fee"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={editedTherapist?.fees_max || ''}
                        onChange={(e) => handleInputChange('fees_max', parseInt(e.target.value))}
                        placeholder="Max fee"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span>৳{therapist.fees_min} - ৳{therapist.fees_max}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedTherapist?.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span>{therapist.bio || 'No bio provided'}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Educational Information</label>
                  {isEditing ? (
                    <textarea
                      value={editedTherapist?.educational_info || ''}
                      onChange={(e) => handleInputChange('educational_info', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span>{therapist.educational_info || 'No educational information provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-semibold">{Number(therapist.rating || 0).toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold">{therapist.years_experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-semibold">৳{therapist.fees_min}-{therapist.fees_max}</span>
                </div>
              </div>
            </div>

            {/* Professional Tools */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Tools</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>Schedule Management</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span>Patient Records</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span>Certifications</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}