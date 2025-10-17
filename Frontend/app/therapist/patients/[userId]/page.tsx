"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Activity, Brain, Heart, Moon, AlertTriangle, FileText, TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

interface FamilyMember {
  family_id: number;
  user_id: number;
  name: string;
  relation: string;
  contact: string;
}

interface PatientRecord {
  success: boolean;
  patient: {
    user_id: number;
    name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
  };
  statistics: {
    total_health_logs: number;
    total_symptom_entries: number;
    total_sessions: number;
    avg_mood: number | null;
    avg_anxiety: number | null;
    avg_sleep: number | null;
    unique_symptoms: number;
  };
  health_logs: Array<{
    log_id: number;
    log_date: string;
    mood_score: number;
    sleep_hours: number;
    anxiety_level: number;
    journal_entry: string;
  }>;
  symptoms: {
    all: Array<{
      date_recorded: string;
      severity: string;
      symptom_id: number;
      symptom_name_en: string;
      symptom_name_bn: string;
      description_en: string;
    }>;
    grouped_by_date: { [key: string]: any[] };
    frequency_analysis: Array<{
      symptom_id: number;
      symptom_name_en: string;
      frequency: number;
      avg_severity_score: string;
      last_reported: string;
    }>;
  };
  mood_trends: Array<{
    log_date: string;
    mood_score: number;
    anxiety_level: number;
    sleep_hours: number;
  }>;
  sessions: Array<{
    session_id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    appointment_status: string;
  }>;
  session_notes: Array<{
    note_id: number;
    session_id: number;
    summary: string;
    homework: string;
    therapist_private_notes: string;
    visible_to_user: number;
    created_at: string;
    session_date: string;
  }>;
}

export default function PatientRecordPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'symptoms' | 'sessions' | 'family'>('overview');
  const [therapistId, setTherapistId] = useState<number | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('therapist') || localStorage.getItem('user');
      if (userData) {
        const therapistData = JSON.parse(userData);
        setTherapistId(therapistData.therapist_id || 202);
      } else {
        setTherapistId(202);
      }
    }
  }, []);

  useEffect(() => {
    if (therapistId && params.userId) {
      fetchPatientRecord();
      fetchFamilyMembers();
    }
  }, [therapistId, params.userId]);

  const fetchPatientRecord = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapist/${therapistId}/patients/${params.userId}/records`);
      if (response.ok) {
        const data = await response.json();
        setRecord(data);
      } else {
        console.error('Failed to fetch patient record');
      }
    } catch (error) {
      console.error('Error fetching patient record:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      setLoadingFamily(true);
      const response = await fetch(`/api/users/${params.userId}/family`);
      if (response.ok) {
        const data = await response.json();
        console.log('Family members response:', data); // Debug log
        setFamilyMembers(data.family_members || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch family members:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setLoadingFamily(false);
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAnxietyColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-100';
    if (level <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      'Mild': 'bg-green-100 text-green-800',
      'Moderate': 'bg-yellow-100 text-yellow-800',
      'Severe': 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-600', text: 'Improving' };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-600', text: 'Declining' };
    return { icon: Minus, color: 'text-gray-600', text: 'Stable' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-modern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-foreground">Loading patient record...</p>
        </div>
      </div>
    );
  }

  if (!record || !record.success) {
    return (
      <div className="min-h-screen bg-gradient-modern flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Patient Record</h2>
          <p className="text-muted-foreground mb-4">You may not have access to this patient's information.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-modern p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>

          <Card className="card-modern border-0 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{record.patient.name}</h1>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>📧 {record.patient.email}</p>
                  {record.patient.phone && <p>📱 {record.patient.phone}</p>}
                  {record.patient.date_of_birth && (
                    <p>🎂 {dayjs(record.patient.date_of_birth).format('MMMM D, YYYY')}</p>
                  )}
                  {record.patient.gender && <p>👤 {record.patient.gender}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Patient ID</div>
                <div className="text-2xl font-bold text-foreground">#{record.patient.user_id}</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-foreground">{record.statistics.total_sessions}</div>
                <div className="text-xs text-muted-foreground">Total Sessions</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Heart className="w-6 h-6 mx-auto mb-2 text-pink-600" />
                <div className="text-2xl font-bold text-foreground">{record.statistics.total_health_logs}</div>
                <div className="text-xs text-muted-foreground">Health Logs</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-foreground">{record.statistics.unique_symptoms}</div>
                <div className="text-xs text-muted-foreground">Tracked Symptoms</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Activity className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-foreground">
                  {record.statistics.avg_mood != null ? record.statistics.avg_mood.toFixed(1) : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Avg Mood Score</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setActiveTab('overview')}
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            className={activeTab === 'overview' ? 'bg-[#2596be]' : ''}
          >
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            onClick={() => setActiveTab('health')}
            variant={activeTab === 'health' ? 'default' : 'outline'}
            className={activeTab === 'health' ? 'bg-[#2596be]' : ''}
          >
            <Heart className="w-4 h-4 mr-2" />
            Health Logs ({record.health_logs.length})
          </Button>
          <Button
            onClick={() => setActiveTab('symptoms')}
            variant={activeTab === 'symptoms' ? 'default' : 'outline'}
            className={activeTab === 'symptoms' ? 'bg-[#2596be]' : ''}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Symptoms ({record.symptoms.all.length})
          </Button>
          <Button
            onClick={() => setActiveTab('sessions')}
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            className={activeTab === 'sessions' ? 'bg-[#2596be]' : ''}
          >
            <FileText className="w-4 h-4 mr-2" />
            Sessions ({record.sessions.length})
          </Button>
          <Button
            onClick={() => setActiveTab('family')}
            variant={activeTab === 'family' ? 'default' : 'outline'}
            className={activeTab === 'family' ? 'bg-[#2596be]' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Family ({familyMembers.length})
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Average Stats */}
            <Card className="card-modern border-0 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#2596be]" />
                Average Health Metrics (90 Days)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getMoodColor(record.statistics.avg_mood || 0)}`}>
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Mood Score</div>
                      <div className="font-semibold text-foreground">
                        {record.statistics.avg_mood != null ? record.statistics.avg_mood.toFixed(1) : 'N/A'} / 10
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getAnxietyColor(record.statistics.avg_anxiety || 0)}`}>
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Anxiety Level</div>
                      <div className="font-semibold text-foreground">
                        {record.statistics.avg_anxiety != null ? record.statistics.avg_anxiety.toFixed(1) : 'N/A'} / 10
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Sleep Hours</div>
                      <div className="font-semibold text-foreground">
                        {record.statistics.avg_sleep != null ? record.statistics.avg_sleep.toFixed(1) : 'N/A'} hours
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Most Frequent Symptoms */}
            <Card className="card-modern border-0 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#2596be]" />
                Most Frequent Symptoms
              </h3>
              <div className="space-y-3">
                {record.symptoms.frequency_analysis.slice(0, 5).map((symptom) => (
                  <div key={symptom.symptom_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{symptom.symptom_name_en}</div>
                      <div className="text-xs text-muted-foreground">
                        Reported {symptom.frequency} times • Last: {dayjs(symptom.last_reported).format('MMM D')}
                      </div>
                    </div>
                    <Badge className={getSeverityBadge(
                      parseFloat(symptom.avg_severity_score) <= 1.5 ? 'Mild' :
                      parseFloat(symptom.avg_severity_score) <= 2.5 ? 'Moderate' : 'Severe'
                    )}>
                      Avg: {parseFloat(symptom.avg_severity_score).toFixed(1)}
                    </Badge>
                  </div>
                ))}
                {record.symptoms.frequency_analysis.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No symptoms recorded yet
                  </div>
                )}
              </div>
            </Card>

            {/* Mood Trend Chart */}
            <Card className="card-modern border-0 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2596be]" />
                30-Day Mood & Anxiety Trend
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {record.mood_trends.slice(0, 15).map((trend, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-foreground w-24">
                      {dayjs(trend.log_date).format('MMM DD')}
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className={`text-sm font-semibold px-2 py-1 rounded ${getMoodColor(trend.mood_score)}`}>
                          {trend.mood_score}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm font-semibold px-2 py-1 rounded ${getAnxietyColor(trend.anxiety_level)}`}>
                          {trend.anxiety_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-foreground">{trend.sleep_hours}h</span>
                      </div>
                    </div>
                  </div>
                ))}
                {record.mood_trends.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No mood data available
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Health Logs Tab */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            {record.health_logs.map((log) => (
              <Card key={log.log_id} className="card-modern border-0 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {dayjs(log.log_date).format('MMMM D, YYYY')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Log ID: #{log.log_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getMoodColor(log.mood_score)}>
                      Mood: {log.mood_score}/10
                    </Badge>
                    <Badge className={getAnxietyColor(log.anxiety_level)}>
                      Anxiety: {log.anxiety_level}/10
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Mood</div>
                      <div className="font-semibold text-foreground">{log.mood_score}/10</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Sleep</div>
                      <div className="font-semibold text-foreground">{log.sleep_hours}h</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Anxiety</div>
                      <div className="font-semibold text-foreground">{log.anxiety_level}/10</div>
                    </div>
                  </div>
                </div>

                {log.journal_entry && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-2">Journal Entry</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.journal_entry}</p>
                  </div>
                )}
              </Card>
            ))}
            {record.health_logs.length === 0 && (
              <Card className="card-modern border-0 p-12 text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Health Logs</h3>
                <p className="text-muted-foreground">This patient hasn't logged any health data yet.</p>
              </Card>
            )}
          </div>
        )}

        {/* Symptoms Tab */}
        {activeTab === 'symptoms' && (
          <div className="space-y-4">
            {/* Symptom Summary */}
            {record.symptoms.frequency_analysis.length > 0 && (
              <Card className="card-modern border-0 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#2596be]" />
                  Symptom Frequency Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {record.symptoms.frequency_analysis.map((symptom) => (
                    <div key={symptom.symptom_id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-foreground text-sm">{symptom.symptom_name_en}</div>
                        <Badge variant="outline" className="text-xs">×{symptom.frequency}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Last: {dayjs(symptom.last_reported).format('MMM D')}
                        </div>
                        <Badge className={getSeverityBadge(
                          parseFloat(symptom.avg_severity_score) <= 1.5 ? 'Mild' :
                          parseFloat(symptom.avg_severity_score) <= 2.5 ? 'Moderate' : 'Severe'
                        )} style={{ fontSize: '10px' }}>
                          Avg: {parseFloat(symptom.avg_severity_score).toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Daily Symptom Logs */}
            {Object.keys(record.symptoms.grouped_by_date).length > 0 ? (
              <>
                <h3 className="text-lg font-semibold text-foreground px-2">Daily Symptom Logs</h3>
                {Object.entries(record.symptoms.grouped_by_date)
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                  .map(([date, symptomsArray]) => (
                  <Card key={date} className="card-modern border-0 p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#2596be]" />
                      {dayjs(date).format('MMMM D, YYYY')}
                      <Badge variant="outline" className="ml-2">
                        {(symptomsArray as any[]).length} symptom{(symptomsArray as any[]).length !== 1 ? 's' : ''}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(symptomsArray as any[]).map((symptom: any, idx: number) => (
                        <div key={`${symptom.symptom_id}-${idx}`} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1 mr-3">
                            <div className="font-medium text-foreground mb-1">{symptom.symptom_name_en}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{symptom.description_en}</div>
                          </div>
                          <Badge className={`${getSeverityBadge(symptom.severity)} whitespace-nowrap`}>
                            {symptom.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="card-modern border-0 p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Symptoms Logged</h3>
                <p className="text-muted-foreground">This patient hasn't logged any symptoms yet.</p>
              </Card>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {record.sessions.map((session) => {
              const note = record.session_notes.find(n => n.session_id === session.session_id);
              return (
                <Card key={session.session_id} className="card-modern border-0 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Session #{session.session_id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {dayjs(session.session_date).format('MMMM D, YYYY')}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {session.appointment_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Start Time</div>
                        <div className="text-sm font-medium text-foreground">
                          {dayjs(session.start_time).format('h:mm A')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">End Time</div>
                        <div className="text-sm font-medium text-foreground">
                          {dayjs(session.end_time).format('h:mm A')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {note && (
                    <div className="space-y-3">
                      {note.summary && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-foreground mb-2">📝 Summary</div>
                          <p className="text-sm text-muted-foreground">{note.summary}</p>
                        </div>
                      )}
                      {note.homework && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-foreground mb-2">✅ Homework</div>
                          <p className="text-sm text-muted-foreground">{note.homework}</p>
                        </div>
                      )}
                      {note.therapist_private_notes && (
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <div className="text-sm font-medium text-foreground mb-2">🔒 Private Notes</div>
                          <p className="text-sm text-muted-foreground">{note.therapist_private_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {!note && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No notes recorded for this session
                    </div>
                  )}
                </Card>
              );
            })}
            {record.sessions.length === 0 && (
              <Card className="card-modern border-0 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Sessions</h3>
                <p className="text-muted-foreground">No sessions have been completed with this patient yet.</p>
              </Card>
            )}
          </div>
        )}

        {/* Family Tab */}
        {activeTab === 'family' && (
          <div className="space-y-6">
            <Card className="card-modern border-0 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-[#2596be]" />
                <h3 className="text-xl font-semibold text-foreground">Family & Support Network</h3>
              </div>
              
              {loadingFamily ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be] mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading family information...</p>
                </div>
              ) : familyMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyMembers.map((member) => (
                    <Card key={member.family_id} className="p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-lg">{member.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {member.relation}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Contact:</span>
                          <span>{member.contact}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Family Members Added</h3>
                  <p className="text-muted-foreground">
                    This patient hasn't added any family members or emergency contacts yet.
                  </p>
                </div>
              )}
            </Card>

            {familyMembers.length > 0 && (
              <Card className="card-modern border-0 p-6 bg-blue-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Information Notice</h4>
                    <p className="text-sm text-muted-foreground">
                      This information is provided by the patient for emergency contact purposes and to understand their support network. 
                      It is read-only and can only be modified by the patient.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
