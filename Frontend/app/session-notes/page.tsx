"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { 
  NotepadText, 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  FileText,
  Search,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SessionNote {
  note_id: number;
  session_id: number;
  appointment_id: number;
  user_id: number;
  therapist_id: number;
  session_date: string;
  duration_min: number;
  summary?: string;
  homework?: string;
  therapist_name: string;
  therapist_email?: string;
  user_name?: string;
  user_email?: string;
  appointment_status?: string;
  start_time?: string;
  end_time?: string;
  visible_to_user: boolean;
  created_at: string;
}

function SessionNotesPage() {
  const { user } = useAuth();
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<SessionNote[]>([]);

  useEffect(() => {
    if (user?.user_id) {
      fetchSessionNotes();
    }
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [sessionNotes, searchTerm]);

  const fetchSessionNotes = async () => {
    if (!user?.user_id) return;

    try {
      const response = await fetch(`/api/users/${user.user_id}/session-notes`);
      if (response.ok) {
        const data = await response.json();
        setSessionNotes(data.sessionNotes || []);
      } else {
        console.error("Failed to fetch session notes");
      }
    } catch (error) {
      console.error("Error fetching session notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...sessionNotes];

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.therapist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.homework?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date, most recent first
    filtered.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

    setFilteredNotes(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Session Notes</h1>
          <p className="text-gray-600">Review notes and homework from your therapy sessions</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search session notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Session Notes List */}
        <div className="space-y-6">
          {filteredNotes.map((note) => (
            <Card key={note.note_id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <NotepadText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        Session on {new Date(note.session_date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Dr. {note.therapist_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{note.duration_min} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Visible to you
                  </Badge>
                </div>

                {/* Summary */}
                {note.summary && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-800">Session Summary</h4>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{note.summary}</p>
                    </div>
                  </div>
                )}

                {/* Homework */}
                {note.homework && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-[#2596be]" />
                      <h4 className="font-semibold text-gray-800">Homework & Action Items</h4>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-700 leading-relaxed">{note.homework}</p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Session ID: #{note.session_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      Appointment ID: #{note.appointment_id}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <NotepadText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No session notes found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search" 
                : "Your therapist will share session notes with you after your appointments"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionNotesWrapper() {
  return (
    <RequireAuth>
      <SessionNotesPage />
    </RequireAuth>
  );
}
