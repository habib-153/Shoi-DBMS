"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { 
  Shield, Eye, Lock, Bell, Database, MessageSquare, 
  Save, CheckCircle, AlertCircle
} from "lucide-react";

// Simplified interface with only essential columns
interface PrivacySettings {
  setting_id?: number;
  user_id?: number;
  // Profile Visibility
  profile_visibility: 'public' | 'private' | 'connections_only';
  show_profile_picture: boolean;
  show_email: boolean;
  show_phone: boolean;
  // Communication
  allow_messages: boolean;
  allow_referrals: boolean;
  // Notifications
  email_notifications: boolean;
  appointment_reminders: boolean;
  session_notes_alerts: boolean;
  // Data & Security
  shield_mode: boolean;
  stealth_icon: string;
  share_data_with_therapist: boolean;
}

function PrivacySettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user?.user_id) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user?.user_id) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/privacy-settings`);
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      showMessage('error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!settings || !user?.user_id) return;

    const updated = { ...settings, [key]: value };
    setSettings(updated);

    // Auto-save
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${user.user_id}/privacy-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Settings saved');
      } else {
        showMessage('error', 'Failed to save');
      }
    } catch (error) {
      showMessage('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const ToggleSwitch = ({ 
    label, 
    description, 
    value, 
    onChange, 
    icon: Icon
  }: { 
    label: string; 
    description?: string; 
    value: boolean; 
    onChange: () => void;
    icon?: any;
  }) => (
    <div className="flex items-start justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex gap-3 flex-1">
        {Icon && <Icon className="w-5 h-5 text-[#2596be] mt-0.5" />}
        <div className="flex-1">
          <div className="font-medium text-gray-900">{label}</div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:ring-offset-2 ${
          value ? 'bg-[#2596be]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading privacy settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-[#2596be]" />
              <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
            </div>
            <p className="text-gray-600">
              Manage your privacy and control what information you share
            </p>
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

          {/* Profile Visibility Section */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Profile Visibility</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Control who can see your profile information</p>
            </div>
            <div className="p-6 space-y-2">
              {/* Profile Visibility Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who can view your profile?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(['public', 'connections_only', 'private'] as const).map((visibility) => (
                    <button
                      key={visibility}
                      onClick={() => updateSetting('profile_visibility', visibility)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.profile_visibility === visibility
                          ? 'border-[#2596be] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium capitalize">
                        {visibility.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {visibility === 'public' && 'Anyone can view'}
                        {visibility === 'connections_only' && 'Only your connections'}
                        {visibility === 'private' && 'Only you'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <ToggleSwitch
                label="Show Profile Picture"
                description="Allow others to see your profile picture"
                value={settings.show_profile_picture}
                onChange={() => updateSetting('show_profile_picture', !settings.show_profile_picture)}
                icon={Eye}
              />
              <ToggleSwitch
                label="Show Email"
                description="Display your email address on your profile"
                value={settings.show_email}
                onChange={() => updateSetting('show_email', !settings.show_email)}
                icon={Eye}
              />
              <ToggleSwitch
                label="Show Phone"
                description="Display your phone number on your profile"
                value={settings.show_phone}
                onChange={() => updateSetting('show_phone', !settings.show_phone)}
                icon={Eye}
              />
            </div>
          </div>

          {/* Communication Section */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Communication</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Manage how others can contact you</p>
            </div>
            <div className="p-6 space-y-2">
              <ToggleSwitch
                label="Allow Messages"
                description="Let other users send you direct messages"
                value={settings.allow_messages}
                onChange={() => updateSetting('allow_messages', !settings.allow_messages)}
                icon={MessageSquare}
              />
              <ToggleSwitch
                label="Allow Referrals"
                description="Allow therapists to refer you to other specialists"
                value={settings.allow_referrals}
                onChange={() => updateSetting('allow_referrals', !settings.allow_referrals)}
                icon={MessageSquare}
              />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Choose what notifications you want to receive</p>
            </div>
            <div className="p-6 space-y-2">
              <ToggleSwitch
                label="Email Notifications"
                description="Receive general updates via email"
                value={settings.email_notifications}
                onChange={() => updateSetting('email_notifications', !settings.email_notifications)}
                icon={Bell}
              />
              <ToggleSwitch
                label="Appointment Reminders"
                description="Get reminded about upcoming appointments"
                value={settings.appointment_reminders}
                onChange={() => updateSetting('appointment_reminders', !settings.appointment_reminders)}
                icon={Bell}
              />
              <ToggleSwitch
                label="Session Notes Alerts"
                description="Get notified when therapist adds session notes"
                value={settings.session_notes_alerts}
                onChange={() => updateSetting('session_notes_alerts', !settings.session_notes_alerts)}
                icon={Bell}
              />
            </div>
          </div>

          {/* Data & Security Section */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Data & Security</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Control your data sharing and security preferences</p>
            </div>
            <div className="p-6 space-y-2">
              <ToggleSwitch
                label="Shield Mode"
                description="Enhanced privacy protection for sensitive sessions"
                value={settings.shield_mode}
                onChange={() => updateSetting('shield_mode', !settings.shield_mode)}
                icon={Shield}
              />
              <ToggleSwitch
                label="Share Data with Therapist"
                description="Allow your therapist to access your session history"
                value={settings.share_data_with_therapist}
                onChange={() => updateSetting('share_data_with_therapist', !settings.share_data_with_therapist)}
                icon={Lock}
              />
            </div>
          </div>

          {/* Saving Indicator */}
          {saving && (
            <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2596be]"></div>
              <span className="text-sm text-gray-600">Saving...</span>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

export default PrivacySettingsPage;
