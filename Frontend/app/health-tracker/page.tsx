"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { 
  Heart, 
  Moon, 
  Brain, 
  FileText, 
  Calendar,
  TrendingUp,
  Plus,
  Save,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  CheckCircle2,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HealthLog {
  log_id: number;
  user_id: number;
  mood_score: number;
  sleep_hours: number;
  anxiety_level: number;
  journal_entry: string;
  log_date: string;
}

interface Symptom {
  symptom_id: number;
  symptom_name_bn: string;
  symptom_name_en: string;
  description_bn: string;
  description_en: string;
}

interface UserSymptom {
  user_id: number;
  symptom_id: number;
  severity: string;
  date_recorded: string;
  symptom_name_en: string;
  symptom_name_bn: string;
}

interface SelectedSymptom {
  symptom_id: number;
  severity: string;
}

function HealthTrackerPage() {
  const { user } = useAuth();
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [userSymptoms, setUserSymptoms] = useState<UserSymptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("today");

  // Today's log form
  const [todayLog, setTodayLog] = useState({
    mood_score: 5,
    sleep_hours: 8,
    anxiety_level: 3,
    journal_entry: ""
  });

  // Symptom tracking
  const [selectedSymptoms, setSelectedSymptoms] = useState<{[key: number]: string}>({});

  useEffect(() => {
    if (user) {
      fetchHealthLogs();
      fetchSymptoms(); 
      fetchUserSymptoms();
      fetchTodayLog();
    }
  }, [user]);

  const fetchHealthLogs = async () => {
    if (!user) return;

    const userId = user.user_id || (user as any).id;
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}/health-logs?limit=30`);
      if (response.ok) {
        const data = await response.json();
        setHealthLogs(data.health_logs || []);
      }
    } catch (error) {
      console.error("Error fetching health logs:", error);
    }
  };

  const fetchSymptoms = async () => {
    try {
      const response = await fetch("/api/symptoms");
      if (response.ok) {
        const data = await response.json();
        setSymptoms(data.symptoms || []);
      }
    } catch (error) {
      console.error("Error fetching symptoms:", error);
    }
  };

  const fetchUserSymptoms = async () => {
    if (!user) return;

    const userId = user.user_id || (user as any).id;
    if (!userId) return;

    try {
      // Use local date to avoid timezone issues
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      console.log('Fetching symptoms for userId:', userId, 'date:', today);
      
      // Use the correct API endpoint with date range
      const response = await fetch(`/api/user-symptoms?userId=${userId}&startDate=${today}&endDate=${today}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched symptoms:', data);
        setUserSymptoms(data.symptoms || []);
        
        // Set selected symptoms for today
        const todaySymptoms: {[key: number]: string} = {};
        (data.symptoms || []).forEach((symptom: UserSymptom) => {
          todaySymptoms[symptom.symptom_id] = symptom.severity;
        });
        setSelectedSymptoms(todaySymptoms);
        console.log('Selected symptoms set:', todaySymptoms);
      } else {
        console.error('Failed to fetch symptoms, status:', response.status);
      }
    } catch (error) {
      console.error("Error fetching user symptoms:", error);
    }
  };

  const fetchTodayLog = async () => {
    if (!user) return;

    const userId = user.user_id || (user as any).id;
    if (!userId) return;

    try {
      // Use local date to avoid timezone issues
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      const response = await fetch(`/api/users/${userId}/health-logs?startDate=${today}&endDate=${today}`);
      if (response.ok) {
        const data = await response.json();
        if (data.health_logs && data.health_logs.length > 0) {
          const log = data.health_logs[0];
          setTodayLog({
            mood_score: log.mood_score || 5,
            sleep_hours: parseFloat(log.sleep_hours) || 8,
            anxiety_level: log.anxiety_level || 3,
            journal_entry: log.journal_entry || ""
          });
        }
      }
    } catch (error) {
      console.error("Error fetching today's log:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTodayLog = async () => {
    if (!user) {
      alert("❌ User not logged in");
      return;
    }

    const userId = user.user_id || (user as any).id;
    if (!userId) {
      console.error("User object:", user);
      alert("❌ User ID not found. Please log in again.");
      return;
    }

    console.log("Saving health log for user:", userId, "Data:", todayLog);

    try {
      const response = await fetch(`/api/users/${userId}/health-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todayLog)
      });

      const data = await response.json();
      console.log("Response:", data);
      
      if (response.ok) {
        fetchHealthLogs(); // Refresh logs
        alert(`✅ ${data.message || 'Health log saved successfully!'}`);
      } else {
        console.error("Failed to save health log:", data);
        alert(`❌ Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving health log:", error);
      alert("❌ Network error. Please check your connection.");
    }
  };

  const saveSymptoms = async () => {
    if (saving) {
      console.warn('Already saving, please wait...');
      return;
    }

    if (!user) {
      alert("❌ User not logged in");
      console.error("Save symptoms failed: No user");
      return;
    }

    const userId = user.user_id || (user as any).id;
    if (!userId) {
      alert("❌ User ID not found. Please log in again.");
      console.error("Save symptoms failed: No userId");
      return;
    }

    try {
      setSaving(true);
      
      // Convert selectedSymptoms object to array format
      const symptomsArray = Object.entries(selectedSymptoms).map(([symptom_id, severity]) => ({
        symptom_id: parseInt(symptom_id),
        severity
      }));

      if (symptomsArray.length === 0) {
        alert("Please select at least one symptom");
        console.warn("Save symptoms failed: No symptoms selected");
        setSaving(false);
        return;
      }

      // Use local date to avoid timezone issues
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateToSave = `${year}-${month}-${day}`;
      
      const payload = {
        user_id: userId,
        symptoms: symptomsArray,
        date_recorded: dateToSave
      };
      
      console.log('=== SAVING SYMPTOMS ===');
      console.log('User ID:', userId);
      console.log('Date (Local):', dateToSave);
      console.log('Current Time:', new Date().toString());
      console.log('Symptoms:', symptomsArray);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`/api/user-symptoms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('=== SAVE RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response:', data);

      if (response.ok && data.success) {
        console.log('✅ Save successful, refreshing symptoms...');
        alert(`✅ ${data.count} symptoms logged successfully for ${data.date}!`);
        // Refresh symptoms to show the saved data
        await fetchUserSymptoms();
        console.log('✅ Symptoms refreshed');
      } else {
        console.error('❌ Save failed:', data.error);
        alert(`❌ Failed to save symptoms: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("❌ Exception saving symptoms:", error);
      alert("❌ Error saving symptoms. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleSymptomToggle = (symptomId: number) => {
    setSelectedSymptoms(prev => {
      const newSelected = { ...prev };
      if (newSelected[symptomId]) {
        // Already selected, remove it
        delete newSelected[symptomId];
      } else {
        // Not selected, add with default severity
        newSelected[symptomId] = "Moderate";
      }
      return newSelected;
    });
  };

  const handleSeverityChange = (symptomId: number, severity: string) => {
    setSelectedSymptoms(prev => ({
      ...prev,
      [symptomId]: severity
    }));
  };

  const getMoodEmoji = (score: number) => {
    if (score <= 3) return <Frown className="w-6 h-6 text-red-500" />;
    if (score <= 7) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Smile className="w-6 h-6 text-green-500" />;
  };

  const getAnxietyColor = (level: number) => {
    if (level <= 3) return "text-green-600";
    if (level <= 7) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading health tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Health Tracker</h1>
          <p className="text-gray-600">Monitor your daily mood, sleep, and symptoms</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "today"
                ? "bg-[#2596be] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Today's Log
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "history"
                ? "bg-[#2596be] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("symptoms")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "symptoms"
                ? "bg-[#2596be] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Symptoms
          </button>
        </div>

        {/* Today's Log Tab */}
        {activeTab === "today" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood & Sleep */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Daily Metrics
              </h3>

              <div className="space-y-6">
                {/* Mood Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood Score (1-10)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={todayLog.mood_score}
                      onChange={(e) => setTodayLog(prev => ({ ...prev, mood_score: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      {getMoodEmoji(todayLog.mood_score)}
                      <span className="font-semibold text-lg">{todayLog.mood_score}</span>
                    </div>
                  </div>
                </div>

                {/* Sleep Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Hours
                  </label>
                  <div className="flex items-center gap-4">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={todayLog.sleep_hours}
                      onChange={(e) => setTodayLog(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">hours</span>
                  </div>
                </div>

                {/* Anxiety Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anxiety Level (1-10)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={todayLog.anxiety_level}
                      onChange={(e) => setTodayLog(prev => ({ ...prev, anxiety_level: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <Brain className={`w-5 h-5 ${getAnxietyColor(todayLog.anxiety_level)}`} />
                      <span className={`font-semibold text-lg ${getAnxietyColor(todayLog.anxiety_level)}`}>
                        {todayLog.anxiety_level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Journal Entry */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                Journal Entry
              </h3>

              <textarea
                placeholder="How are you feeling today? What's on your mind?"
                value={todayLog.journal_entry}
                onChange={(e) => setTodayLog(prev => ({ ...prev, journal_entry: e.target.value }))}
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent resize-none"
              />

              <button
                onClick={saveTodayLog}
                className="mt-4 w-full bg-[#2596be] text-white px-6 py-3 rounded-lg hover:bg-[#1d7a99] transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                Save Today's Log
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Health Log History
            </h3>

            {healthLogs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No logs yet</h4>
                <p className="text-gray-500">Start tracking your daily health metrics!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {healthLogs.map((log) => (
                  <div key={log.log_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">
                        {new Date(log.log_date).toLocaleDateString()}
                      </h4>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {getMoodEmoji(log.mood_score)}
                          <span>Mood: {log.mood_score}/10</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Moon className="w-4 h-4 text-indigo-500" />
                          <span>Sleep: {log.sleep_hours}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Brain className={`w-4 h-4 ${getAnxietyColor(log.anxiety_level)}`} />
                          <span>Anxiety: {log.anxiety_level}/10</span>
                        </div>
                      </div>
                    </div>
                    {log.journal_entry && (
                      <p className="text-gray-600 text-sm">{log.journal_entry}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Symptoms Tab */}
        {activeTab === "symptoms" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Symptom Tracking
              </h3>
              <div className="flex gap-2">
                <Button 
                  onClick={saveSymptoms}
                  className="bg-[#2596be] hover:bg-[#1e7a9a]"
                  disabled={Object.keys(selectedSymptoms).length === 0 || saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save {Object.keys(selectedSymptoms).length} Symptom(s)
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              Click on symptoms to select them, then choose their severity level.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {symptoms.map((symptom) => (
                <Card 
                  key={symptom.symptom_id} 
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedSymptoms[symptom.symptom_id]
                      ? "border-[#2596be] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSymptomToggle(symptom.symptom_id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 flex-1">
                      {symptom.symptom_name_en || symptom.symptom_name_bn}
                    </h4>
                    {selectedSymptoms[symptom.symptom_id] && (
                      <CheckCircle2 className="w-5 h-5 text-[#2596be] flex-shrink-0" />
                    )}
                  </div>

                  {(symptom.description_en || symptom.description_bn) && (
                    <p className="text-xs text-gray-600 mb-3">
                      {symptom.description_en || symptom.description_bn}
                    </p>
                  )}
                  
                  {selectedSymptoms[symptom.symptom_id] && (
                    <div 
                      className="flex gap-2 mt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {["Mild", "Moderate", "Severe"].map((severity) => (
                        <button
                          key={severity}
                          onClick={() => handleSeverityChange(symptom.symptom_id, severity)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedSymptoms[symptom.symptom_id] === severity
                              ? severity === "Mild" ? "bg-green-500 text-white shadow-md"
                                : severity === "Moderate" ? "bg-yellow-500 text-white shadow-md"
                                : "bg-red-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {severity}
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {symptoms.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No symptoms available</h4>
                <p className="text-gray-500">Symptoms will be added by your healthcare provider</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HealthTrackerWrapper() {
  return (
    <RequireAuth>
      <HealthTrackerPage />
    </RequireAuth>
  );
}