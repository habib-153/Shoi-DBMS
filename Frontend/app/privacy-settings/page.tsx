"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { 
  Shield, Eye, EyeOff, Lock, Bell, Users, Database, 
  Activity, Ghost, Fingerprint, AlertTriangle, Clock,
  Mail, Smartphone, MessageSquare, UserX, UserCheck,
  Download, Trash2, Key, History, Globe, Settings
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PrivacySettings {
  setting_id?: number;
  user_id?: number;
  // Profile Visibility
  profile_visibility: 'public' | 'private' | 'connections_only';
  show_profile_picture: boolean;
  show_real_name: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_last_active: boolean;
  show_appointment_history: boolean;
  show_session_count: boolean;
  allow_therapist_reviews: boolean;
  // Communication
  allow_messages: boolean;
  allow_referrals: boolean;
  allow_family_connections: boolean;
  // Notifications
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  appointment_reminders: boolean;
  session_notes_alerts: boolean;
  referral_alerts: boolean;
  marketing_emails: boolean;
  // Data & Security
  shield_mode: boolean;
  stealth_icon: string;
  share_data_with_therapist: boolean;
  share_anonymous_data: boolean;
  allow_data_export: boolean;
  two_factor_enabled: boolean;
  login_alerts: boolean;
  session_timeout_minutes: number;
  // Privacy Zones
  incognito_mode: boolean;
  anonymous_browsing: boolean;
  hide_from_search: boolean;
  ghost_mode_until: string | null;
  // Advanced
  block_screenshots: boolean;
  auto_delete_messages_days: number | null;
  require_password_for_notes: boolean;
}

function PrivacySettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<string>('profile');

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

    // Debounce save
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${user.user_id}/privacy-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Settings saved automatically');
      } else {
        showMessage('error', 'Failed to save settings');
      }
    } catch (error) {
      showMessage('error', 'Failed to save settings');
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
    icon: Icon,
    badge 
  }: { 
    label: string; 
    description?: string; 
    value: boolean; 
    onChange: () => void;
    icon?: any;
    badge?: string;
  }) => (
    <div className="flex items-start justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex gap-3 flex-1">
        {Icon && <Icon className="w-5 h-5 text-gray-600 mt-0.5" />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{label}</span>
            {badge && (
              <Badge variant="secondary" className="text-xs">{badge}</Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          value ? 'bg-blue-600' : 'bg-gray-300'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading privacy settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const sections = [
    { id: 'profile', label: 'Profile & Visibility', icon: Eye },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Sharing', icon: Database },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy-zones', label: 'Privacy Zones', icon: Ghost },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Privacy & Security</h1>
            </div>
            <p className="text-gray-600">
              Control your privacy, manage your data, and secure your account
            </p>
            {saving && (
              <Badge variant="secondary" className="mt-2">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                Saving...
              </Badge>
            )}
          </div>

          {/* Success/Error Message */}
          {message && (
            <Card className={`p-4 mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </Card>
          )}

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <Card className="p-2 sticky top-6">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3 space-y-6">
              {/* Profile & Visibility */}
              {activeSection === 'profile' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Eye className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Profile & Visibility</h2>
                  </div>

                  <div className="space-y-1 divide-y">
                    <div className="pb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={settings.profile_visibility}
                        onChange={(e) => updateSetting('profile_visibility', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">🌍 Public - Anyone can view</option>
                        <option value="connections_only">👥 Connections Only</option>
                        <option value="private">🔒 Private - Only you</option>
                      </select>
                    </div>

                    <ToggleSwitch
                      label="Show Profile Picture"
                      description="Display your photo to others"
                      value={settings.show_profile_picture}
                      onChange={() => updateSetting('show_profile_picture', !settings.show_profile_picture)}
                      icon={Eye}
                    />

                    <ToggleSwitch
                      label="Show Real Name"
                      description="Display your full name on your profile"
                      value={settings.show_real_name}
                      onChange={() => updateSetting('show_real_name', !settings.show_real_name)}
                      icon={Users}
                    />

                    <ToggleSwitch
                      label="Show Email Address"
                      description="Make your email visible to therapists"
                      value={settings.show_email}
                      onChange={() => updateSetting('show_email', !settings.show_email)}
                      icon={Mail}
                    />

                    <ToggleSwitch
                      label="Show Phone Number"
                      description="Display phone to your connections"
                      value={settings.show_phone}
                      onChange={() => updateSetting('show_phone', !settings.show_phone)}
                      icon={Smartphone}
                    />

                    <ToggleSwitch
                      label="Show Last Active"
                      description="Let others see when you were last online"
                      value={settings.show_last_active}
                      onChange={() => updateSetting('show_last_active', !settings.show_last_active)}
                      icon={Activity}
                    />

                    <ToggleSwitch
                      label="Show Appointment History"
                      description="Display your appointment count"
                      value={settings.show_appointment_history}
                      onChange={() => updateSetting('show_appointment_history', !settings.show_appointment_history)}
                      icon={History}
                    />

                    <ToggleSwitch
                      label="Show Session Count"
                      description="Display total therapy sessions"
                      value={settings.show_session_count}
                      onChange={() => updateSetting('show_session_count', !settings.show_session_count)}
                      icon={Clock}
                    />

                    <ToggleSwitch
                      label="Allow Therapist Reviews"
                      description="Let others see your therapist ratings"
                      value={settings.allow_therapist_reviews}
                      onChange={() => updateSetting('allow_therapist_reviews', !settings.allow_therapist_reviews)}
                      icon={Users}
                    />
                  </div>
                </Card>
              )}

              {/* Communication */}
              {activeSection === 'communication' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Communication Preferences</h2>
                  </div>

                  <div className="space-y-1 divide-y">
                    <ToggleSwitch
                      label="Allow Messages"
                      description="Receive messages from therapists and connections"
                      value={settings.allow_messages}
                      onChange={() => updateSetting('allow_messages', !settings.allow_messages)}
                      icon={MessageSquare}
                    />

                    <ToggleSwitch
                      label="Allow Referrals"
                      description="Let therapists refer you to specialists"
                      value={settings.allow_referrals}
                      onChange={() => updateSetting('allow_referrals', !settings.allow_referrals)}
                      icon={UserCheck}
                    />

                    <ToggleSwitch
                      label="Allow Family Connections"
                      description="Let family members connect to your account"
                      value={settings.allow_family_connections}
                      onChange={() => updateSetting('allow_family_connections', !settings.allow_family_connections)}
                      icon={Users}
                    />
                  </div>
                </Card>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                  </div>

                  <div className="space-y-1 divide-y">
                    <ToggleSwitch
                      label="Email Notifications"
                      description="Receive notifications via email"
                      value={settings.email_notifications}
                      onChange={() => updateSetting('email_notifications', !settings.email_notifications)}
                      icon={Mail}
                      badge="Recommended"
                    />

                    <ToggleSwitch
                      label="SMS Notifications"
                      description="Get text messages for important updates"
                      value={settings.sms_notifications}
                      onChange={() => updateSetting('sms_notifications', !settings.sms_notifications)}
                      icon={Smartphone}
                    />

                    <ToggleSwitch
                      label="Push Notifications"
                      description="Browser notifications for real-time updates"
                      value={settings.push_notifications}
                      onChange={() => updateSetting('push_notifications', !settings.push_notifications)}
                      icon={Bell}
                    />

                    <ToggleSwitch
                      label="Appointment Reminders"
                      description="Reminders before your appointments"
                      value={settings.appointment_reminders}
                      onChange={() => updateSetting('appointment_reminders', !settings.appointment_reminders)}
                      icon={Clock}
                    />

                    <ToggleSwitch
                      label="Session Notes Alerts"
                      description="Notify when therapist adds session notes"
                      value={settings.session_notes_alerts}
                      onChange={() => updateSetting('session_notes_alerts', !settings.session_notes_alerts)}
                      icon={Bell}
                    />

                    <ToggleSwitch
                      label="Referral Alerts"
                      description="Notifications for new referrals"
                      value={settings.referral_alerts}
                      onChange={() => updateSetting('referral_alerts', !settings.referral_alerts)}
                      icon={Bell}
                    />

                    <ToggleSwitch
                      label="Marketing Emails"
                      description="Promotional content and updates"
                      value={settings.marketing_emails}
                      onChange={() => updateSetting('marketing_emails', !settings.marketing_emails)}
                      icon={Mail}
                    />
                  </div>
                </Card>
              )}

              {/* Data & Sharing */}
              {activeSection === 'data' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Data & Sharing</h2>
                  </div>

                  <div className="space-y-1 divide-y">
                    <ToggleSwitch
                      label="Share Data with Therapist"
                      description="Allow your therapist to access your health data"
                      value={settings.share_data_with_therapist}
                      onChange={() => updateSetting('share_data_with_therapist', !settings.share_data_with_therapist)}
                      icon={Database}
                      badge="Important"
                    />

                    <ToggleSwitch
                      label="Share Anonymous Data"
                      description="Help improve our services with anonymous usage data"
                      value={settings.share_anonymous_data}
                      onChange={() => updateSetting('share_anonymous_data', !settings.share_anonymous_data)}
                      icon={Globe}
                    />

                    <ToggleSwitch
                      label="Allow Data Export"
                      description="Enable downloading your personal data"
                      value={settings.allow_data_export}
                      onChange={() => updateSetting('allow_data_export', !settings.allow_data_export)}
                      icon={Download}
                    />
                  </div>
                </Card>
              )}

              {/* Security */}
              {activeSection === 'security' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                  </div>

                  <div className="space-y-1 divide-y">
                    <ToggleSwitch
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      value={settings.two_factor_enabled}
                      onChange={() => updateSetting('two_factor_enabled', !settings.two_factor_enabled)}
                      icon={Fingerprint}
                      badge="Recommended"
                    />

                    <ToggleSwitch
                      label="Login Alerts"
                      description="Get notified of new login attempts"
                      value={settings.login_alerts}
                      onChange={() => updateSetting('login_alerts', !settings.login_alerts)}
                      icon={AlertTriangle}
                    />

                    <div className="p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.session_timeout_minutes}
                        onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="5"
                        max="1440"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Auto-logout after inactivity
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Privacy Zones */}
              {activeSection === 'privacy-zones' && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Ghost className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Privacy Zones</h2>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Unique Features
                    </Badge>
                  </div>

                  <div className="space-y-1 divide-y bg-white rounded-lg">
                    <ToggleSwitch
                      label="Incognito Mode"
                      description="Browse privately without leaving traces"
                      value={settings.incognito_mode}
                      onChange={() => updateSetting('incognito_mode', !settings.incognito_mode)}
                      icon={EyeOff}
                      badge="Pro"
                    />

                    <ToggleSwitch
                      label="Anonymous Browsing"
                      description="Hide your identity while browsing"
                      value={settings.anonymous_browsing}
                      onChange={() => updateSetting('anonymous_browsing', !settings.anonymous_browsing)}
                      icon={Ghost}
                    />

                    <ToggleSwitch
                      label="Hide from Search"
                      description="Don't appear in user search results"
                      value={settings.hide_from_search}
                      onChange={() => updateSetting('hide_from_search', !settings.hide_from_search)}
                      icon={EyeOff}
                    />

                    <ToggleSwitch
                      label="Shield Mode"
                      description="Maximum privacy protection"
                      value={settings.shield_mode}
                      onChange={() => updateSetting('shield_mode', !settings.shield_mode)}
                      icon={Shield}
                      badge="Ultimate"
                    />
                  </div>
                </Card>
              )}

              {/* Advanced */}
              {activeSection === 'advanced' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-6 h-6 text-gray-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Advanced Settings</h2>
                  </div>

                  <div className="space-y-1 divide-y">
                    <ToggleSwitch
                      label="Block Screenshots"
                      description="Prevent screenshots in sensitive areas"
                      value={settings.block_screenshots}
                      onChange={() => updateSetting('block_screenshots', !settings.block_screenshots)}
                      icon={Lock}
                      badge="Experimental"
                    />

                    <ToggleSwitch
                      label="Require Password for Notes"
                      description="Extra security for viewing session notes"
                      value={settings.require_password_for_notes}
                      onChange={() => updateSetting('require_password_for_notes', !settings.require_password_for_notes)}
                      icon={Key}
                    />

                    <div className="p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Delete Messages After (days)
                      </label>
                      <input
                        type="number"
                        value={settings.auto_delete_messages_days || ''}
                        onChange={(e) => updateSetting('auto_delete_messages_days', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Never (leave empty)"
                        min="1"
                        max="365"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Automatically delete messages after set period
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

export default PrivacySettingsPage;
