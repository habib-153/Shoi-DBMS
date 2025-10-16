"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { Shield, Eye, MessageSquare, Bell, CheckCircle, AlertCircle } from "lucide-react";

// MINIMAL - Only 5 essential columns
interface PrivacySettings {
  setting_id?: number;
  user_id?: number;
  profile_visibility: 'public' | 'private' | 'connections_only';
  allow_messages: boolean;
  allow_referrals: boolean;
  shield_mode: boolean;
  appointment_reminders: boolean;
  created_at?: string;
  updated_at?: string;
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
      console.log('Fetching privacy settings...');
      const response = await fetch(`/api/users/${user.user_id}/privacy-settings`);
      const data = await response.json();
      console.log('Fetched:', data);

      if (data.success && data.settings) {
        setSettings(data.settings);
      } else {
        showMessage('error', 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!settings || !user?.user_id) return;

    const previousSettings = { ...settings };
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    setSaving(true);
    try {
      console.log('Saving:', key, '=', value);
      const response = await fetch(`/api/users/${user.user_id}/privacy-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      const data = await response.json();
      console.log('Save result:', data);

      if (data.success) {
        showMessage('success', 'Saved!');
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        showMessage('error', 'Failed to save');
        setSettings(previousSettings);
      }
    } catch (error) {
      console.error('Save error:', error);
      showMessage('error', 'Failed to save');
      setSettings(previousSettings);
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
        {Icon && <Icon className="w-5 h-5 text-[#2596be] mt-0.5 flex-shrink-0" />}
        <div className="flex-1">
          <div className="font-medium text-gray-900">{label}</div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={onChange}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:ring-offset-2 disabled:opacity-50 ${
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

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Failed to load settings</p>
          <button 
            onClick={fetchSettings}
            className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-[#2596be]" />
              <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
            </div>
            <p className="text-gray-600">
              Control your privacy with 5 essential settings
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

          {/* Setting 1: Profile Visibility */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Profile Visibility</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Who can view your profile?</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['public', 'connections_only', 'private'] as const).map((visibility) => (
                  <button
                    key={visibility}
                    onClick={() => updateSetting('profile_visibility', visibility)}
                    disabled={saving}
                    className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                      settings.profile_visibility === visibility
                        ? 'border-[#2596be] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium capitalize text-center">
                      {visibility.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      {visibility === 'public' && 'Everyone'}
                      {visibility === 'connections_only' && 'Only connections'}
                      {visibility === 'private' && 'Only you'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Setting 2-3: Communication */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Communication</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Manage how therapists can contact you</p>
            </div>
            <div className="divide-y">
              <ToggleSwitch
                label="Allow Messages"
                description="Let therapists send you direct messages"
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

          {/* Setting 4: Notifications */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Stay updated about your appointments</p>
            </div>
            <div className="p-4">
              <ToggleSwitch
                label="Appointment Reminders"
                description="Get notified before your scheduled appointments"
                value={settings.appointment_reminders}
                onChange={() => updateSetting('appointment_reminders', !settings.appointment_reminders)}
                icon={Bell}
              />
            </div>
          </div>

          {/* Setting 5: Security */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#2596be]" />
                <h2 className="text-xl font-semibold">Security</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Enhanced privacy protection</p>
            </div>
            <div className="p-4">
              <ToggleSwitch
                label="Shield Mode"
                description="Extra privacy for sensitive therapy sessions"
                value={settings.shield_mode}
                onChange={() => updateSetting('shield_mode', !settings.shield_mode)}
                icon={Shield}
              />
            </div>
          </div>

          {/* Saving Indicator */}
          {saving && (
            <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-2 border">
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
