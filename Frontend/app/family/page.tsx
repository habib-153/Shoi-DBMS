"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { 
  Users, 
  Plus, 
  Share2, 
  Eye, 
  EyeOff,
  Phone,
  Heart,
  Shield,
  Settings,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Bell,
  MessageSquare
} from "lucide-react";

interface FamilyMember {
  family_id: number;
  user_id: number;
  name: string;
  relation: string;
  contact: string;
}



interface PrivacySettingsNew {
  setting_id?: number;
  user_id?: number;
  profile_visibility: 'public' | 'private' | 'connections_only';
  allow_messages: boolean;
  appointment_reminders: boolean;
  created_at?: string;
  updated_at?: string;
}

function FamilyPage() {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsNew | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("family");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Add/Edit form state
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    contact: ""
  });

  useEffect(() => {
    if (user) {
      fetchFamilyMembers();
      fetchPrivacySettings();
    }
  }, [user]);

  const fetchFamilyMembers = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/family`);
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.family_members || []);
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivacySettings = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/privacy-settings`);
      const data = await response.json();
      
      if (data.success && data.settings) {
        // Convert MySQL TINYINT (0/1) to boolean
        const settings = {
          ...data.settings,
          allow_messages: Boolean(data.settings.allow_messages),
          appointment_reminders: Boolean(data.settings.appointment_reminders)
        };
        setPrivacySettings(settings);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    }
  };

  const updatePrivacySetting = async (key: keyof PrivacySettingsNew, value: any) => {
    if (!privacySettings || !user) return;

    const previousSettings = { ...privacySettings };
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);

    setSaving(true);
    try {
      // Convert boolean to number for MySQL TINYINT
      const dataToSend = {
        ...updated,
        allow_messages: updated.allow_messages ? 1 : 0,
        appointment_reminders: updated.appointment_reminders ? 1 : 0
      };

      const response = await fetch(`/api/users/${user.user_id}/privacy-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Privacy settings updated!');
        if (data.settings) {
          // Convert MySQL TINYINT back to boolean
          const settings = {
            ...data.settings,
            allow_messages: Boolean(data.settings.allow_messages),
            appointment_reminders: Boolean(data.settings.appointment_reminders)
          };
          setPrivacySettings(settings);
        }
      } else {
        showMessage('error', 'Failed to save settings');
        setPrivacySettings(previousSettings);
      }
    } catch (error) {
      console.error('Save error:', error);
      showMessage('error', 'Failed to save settings');
      setPrivacySettings(previousSettings);
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Determine if we're editing or adding
      const isEditing = editingMember !== null;
      const method = isEditing ? "PUT" : "POST";
      const bodyData = isEditing 
        ? { ...formData, family_id: editingMember.family_id }
        : formData;

      const response = await fetch(`/api/users/${user.user_id}/family`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        fetchFamilyMembers();
        setShowAddForm(false);
        setEditingMember(null);
        setFormData({ name: "", relation: "", contact: "" });
        showMessage('success', isEditing ? 'Family member updated successfully!' : 'Family member added successfully!');
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || (isEditing ? 'Failed to update family member' : 'Failed to add family member'));
      }
    } catch (error) {
      console.error("Error with family member:", error);
      showMessage('error', 'Error processing family member');
    }
  };



  const handleDeleteMember = async (familyId: number, memberName: string) => {
    if (!user) return;
    
    if (!confirm(`Are you sure you want to remove ${memberName} from your family members?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.user_id}/family?family_id=${familyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFamilyMembers();
        showMessage('success', 'Family member removed successfully!');
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || 'Failed to remove family member');
      }
    } catch (error) {
      console.error("Error removing family member:", error);
      showMessage('error', 'Error removing family member');
    }
  };

  const resetForm = () => {
    setFormData({ name: "", relation: "", contact: "" });
    setShowAddForm(false);
    setEditingMember(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Family & Privacy</h1>
          <p className="text-gray-600">Manage your family connections and privacy settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("family")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "family"
                ? "bg-[#2596be] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Family Members
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "privacy"
                ? "bg-[#2596be] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Privacy Settings
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Family Members Tab */}
        {activeTab === "family" && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Therapist Access</p>
                <p className="text-xs">Your therapist can view your family members through Patient Records for comprehensive care. This helps them understand your support system better.</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Family Members</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-[#2596be] text-white px-4 py-2 rounded-lg hover:bg-[#1d7a99] transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Family Member
              </button>
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingMember) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingMember ? "Edit Family Member" : "Add New Family Member"}
                </h3>

                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        placeholder="Enter name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation *
                      </label>
                      <select
                        required
                        value={formData.relation}
                        onChange={(e) => setFormData(prev => ({ ...prev, relation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      >
                        <option value="">Select relation</option>
                        <option value="Parent">Parent</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information
                    </label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      placeholder="Phone number or email"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="bg-[#2596be] text-white px-6 py-2 rounded-lg hover:bg-[#1d7a99] transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingMember ? "Update" : "Add"} Member
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Family Members List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyMembers.map((member) => (
                <div key={member.family_id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-[#2596be]/10 rounded-lg">
                      <Users className="w-6 h-6 text-[#2596be]" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setFormData({
                            name: member.name,
                            relation: member.relation,
                            contact: member.contact || ""
                          });
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.family_id, member.name)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{member.relation}</p>

                  {member.contact && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Phone className="w-4 h-4" />
                      {member.contact}
                    </div>
                  )}

                </div>
              ))}
            </div>

            {familyMembers.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No family members added</h3>
                <p className="text-gray-500 mb-6">Add family members to share your progress with them</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add First Family Member
                </button>
              </div>
            )}
          </div>
        )}

        {/* Privacy Settings Tab */}
        {activeTab === "privacy" && privacySettings && (
          <div className="space-y-6">
            {/* Profile Visibility */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Profile Visibility</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Who can view your profile?</p>
              
              <div className="space-y-2">
                <label className="flex items-center p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: privacySettings.profile_visibility === 'public' ? '#2596be' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={privacySettings.profile_visibility === 'public'}
                    onChange={(e) => updatePrivacySetting('profile_visibility', e.target.value)}
                    className="w-4 h-4 text-[#2596be] focus:ring-[#2596be]"
                  />
                  <div className="ml-3">
                    <p className="font-medium">Public</p>
                    <p className="text-sm text-gray-600">Anyone can view your profile</p>
                  </div>
                </label>

                <label className="flex items-center p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: privacySettings.profile_visibility === 'connections_only' ? '#2596be' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="visibility"
                    value="connections_only"
                    checked={privacySettings.profile_visibility === 'connections_only'}
                    onChange={(e) => updatePrivacySetting('profile_visibility', e.target.value)}
                    className="w-4 h-4 text-[#2596be] focus:ring-[#2596be]"
                  />
                  <div className="ml-3">
                    <p className="font-medium">Connections Only</p>
                    <p className="text-sm text-gray-600">Only your therapist and family can view</p>
                  </div>
                </label>

                <label className="flex items-center p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: privacySettings.profile_visibility === 'private' ? '#2596be' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={privacySettings.profile_visibility === 'private'}
                    onChange={(e) => updatePrivacySetting('profile_visibility', e.target.value)}
                    className="w-4 h-4 text-[#2596be] focus:ring-[#2596be]"
                  />
                  <div className="ml-3">
                    <p className="font-medium">Private</p>
                    <p className="text-sm text-gray-600">Only you can view your profile</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Toggle Settings */}
            <div className="bg-white rounded-xl shadow-sm border divide-y">
              {/* Messages */}
              <div className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-3 flex-1">
                  <MessageSquare className="w-5 h-5 text-[#2596be] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Allow Messages</div>
                    <p className="text-sm text-gray-600 mt-1">Therapists can send you messages</p>
                  </div>
                </div>
                <button
                  onClick={() => updatePrivacySetting('allow_messages', !privacySettings.allow_messages)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:ring-offset-2 disabled:opacity-50 ${
                    privacySettings.allow_messages ? 'bg-[#2596be]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.allow_messages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Appointment Reminders */}
              <div className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-3 flex-1">
                  <Bell className="w-5 h-5 text-[#2596be] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Appointment Reminders</div>
                    <p className="text-sm text-gray-600 mt-1">Receive notifications for upcoming sessions</p>
                  </div>
                </div>
                <button
                  onClick={() => updatePrivacySetting('appointment_reminders', !privacySettings.appointment_reminders)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:ring-offset-2 disabled:opacity-50 ${
                    privacySettings.appointment_reminders ? 'bg-[#2596be]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.appointment_reminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">About Privacy Settings</p>
                <p className="text-xs">Your privacy matters. These settings control how your information is shared and who can interact with you. Therapists can view family members through patient records for comprehensive care.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FamilyWrapper() {
  return (
    <RequireAuth>
      <FamilyPage />
    </RequireAuth>
  );
}