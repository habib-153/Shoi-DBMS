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
  X
} from "lucide-react";

interface FamilyMember {
  family_id: number;
  user_id: number;
  name: string;
  relation: string;
  contact: string;
  can_view_progress: boolean;
}

interface SharedItem {
  share_id: number;
  user_id: number;
  family_id: number;
  item_type: string;
  ref_id: number;
  shared_at: string;
  family_member_name: string;
  relation: string;
  user_name: string;
}

interface PrivacySettings {
  setting_id?: number;
  user_id: number;
  shield_mode: boolean;
  stealth_icon: string | null;
  share_data_with_therapist: boolean;
}

function FamilyPage() {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("family");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Add/Edit form state
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    contact: "",
    can_view_progress: false
  });

  useEffect(() => {
    if (user) {
      fetchFamilyMembers();
      fetchSharedItems();
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

  const fetchSharedItems = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/shared-items?userId=${user.user_id}`);
      if (response.ok) {
        const data = await response.json();
        setSharedItems(data.shared_items || []);
      }
    } catch (error) {
      console.error("Error fetching shared items:", error);
    }
  };

  const fetchPrivacySettings = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/privacy`);
      if (response.ok) {
        const data = await response.json();
        setPrivacySettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/family`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchFamilyMembers();
        setShowAddForm(false);
        setFormData({ name: "", relation: "", contact: "", can_view_progress: false });
      } else {
        alert("Failed to add family member");
      }
    } catch (error) {
      console.error("Error adding family member:", error);
      alert("Error adding family member");
    }
  };

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/privacy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        fetchPrivacySettings();
      } else {
        alert("Failed to update privacy settings");
      }
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      alert("Error updating privacy settings");
    }
  };

  const removeSharedItem = async (shareId: number) => {
    if (!user) return;

    try {
      const response = await fetch("/api/shared-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share_id: shareId, user_id: user.user_id })
      });

      if (response.ok) {
        fetchSharedItems();
      } else {
        alert("Failed to remove shared item");
      }
    } catch (error) {
      console.error("Error removing shared item:", error);
      alert("Error removing shared item");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", relation: "", contact: "", can_view_progress: false });
    setShowAddForm(false);
    setEditingMember(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
            onClick={() => setActiveTab("sharing")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "sharing"
                ? "bg-[#2596be] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Shared Items
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

        {/* Family Members Tab */}
        {activeTab === "family" && (
          <div className="space-y-6">
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

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="can_view_progress"
                      checked={formData.can_view_progress}
                      onChange={(e) => setFormData(prev => ({ ...prev, can_view_progress: e.target.checked }))}
                      className="w-4 h-4 text-[#2596be] border-gray-300 rounded focus:ring-[#2596be]"
                    />
                    <label htmlFor="can_view_progress" className="text-sm text-gray-700">
                      Allow this person to view my progress and shared items
                    </label>
                  </div>

                  <div className="flex gap-3">
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
                            contact: member.contact || "",
                            can_view_progress: member.can_view_progress
                          });
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
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

                  <div className="flex items-center gap-2 text-sm">
                    {member.can_view_progress ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Eye className="w-4 h-4" />
                        Can view progress
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <EyeOff className="w-4 h-4" />
                        Cannot view progress
                      </div>
                    )}
                  </div>
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

        {/* Shared Items Tab */}
        {activeTab === "sharing" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Shared Items</h2>
            
            {sharedItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nothing shared yet</h3>
                <p className="text-gray-500">Shared items will appear here when you share them with family members</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sharedItems.map((item) => (
                  <div key={item.share_id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-[#2596be]/10 rounded-lg">
                            <Share2 className="w-5 h-5 text-[#2596be]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)} #{item.ref_id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Shared with {item.family_member_name} ({item.relation})
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Shared on {new Date(item.shared_at).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => removeSharedItem(item.share_id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Privacy Settings Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Privacy Settings</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-6">
                {/* Shield Mode */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Shield Mode</h3>
                      <p className="text-sm text-gray-600">
                        Hide sensitive information from family members and add extra privacy protection
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings?.shield_mode || false}
                      onChange={(e) => updatePrivacySettings({ shield_mode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2596be]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2596be]"></div>
                  </label>
                </div>

                {/* Data Sharing with Therapist */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Share Data with Therapist</h3>
                      <p className="text-sm text-gray-600">
                        Allow your therapist to access your health logs and assessment results
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings?.share_data_with_therapist !== false}
                      onChange={(e) => updatePrivacySettings({ share_data_with_therapist: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2596be]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2596be]"></div>
                  </label>
                </div>

                {/* Stealth Icon */}
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Settings className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Stealth Icon</h3>
                      <p className="text-sm text-gray-600">
                        Change app icon to something discrete for privacy
                      </p>
                    </div>
                  </div>
                  <select
                    value={privacySettings?.stealth_icon || ""}
                    onChange={(e) => updatePrivacySettings({ stealth_icon: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  >
                    <option value="">Default App Icon</option>
                    <option value="calculator">Calculator</option>
                    <option value="notes">Notes</option>
                    <option value="weather">Weather</option>
                    <option value="calendar">Calendar</option>
                  </select>
                </div>
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