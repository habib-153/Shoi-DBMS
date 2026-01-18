'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, UserRound, FileText, BookOpen, Plus, NotepadText, Calendar } from 'lucide-react';

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [availableTherapists, setAvailableTherapists] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // New states for enhanced functionality
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showSessionNotesModal, setShowSessionNotesModal] = useState(false);
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [sessionNotes, setSessionNotes] = useState<any[]>([]);
  const [newSessionNote, setNewSessionNote] = useState({
    summary: '',
    homework: '',
    therapist_private_notes: '',
    visible_to_user: true
  });
  const [patientSessions, setPatientSessions] = useState<any[]>([]);
  const [showPatientSessionsModal, setShowPatientSessionsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  // Ref for auto-scrolling messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [resourceLoading, setResourceLoading] = useState(false);

  useEffect(() => {
    const userId = user?.role === 'therapist' ? user.therapist_id : user?.user_id;
    if (!authLoading && user && (user.role === 'user' || user.role === 'therapist') && userId) {
      fetchConversations(userId);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll when a new conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Add a small delay to ensure messages are loaded
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedConversation]);

  const fetchConversations = async (userId: any) => {
    setLoading(true);
    
    try {
      if (user?.role === 'therapist') {
        // For therapists: get paid patients
        const paidPatientsResponse = await fetch(`/api/therapists/${userId}/paid-patients`);
        const paidPatientsData = await paidPatientsResponse.json();
        
        if (paidPatientsData.success) {
          setAvailableTherapists(paidPatientsData.patients || []);
          
          if (paidPatientsData.patients.length > 0) {
            // Then get conversations with those patients
            const response = await fetch(`/api/messages?user_type=therapist&user_id=${userId}`);
            const data = await response.json();
            setConversations(data.conversations || []);
          } else {
            setConversations([]);
          }
        } else {
          setAvailableTherapists([]);
          setConversations([]);
        }
      } else {
        // For users: get paid therapists (existing logic)
        const paidTherapistsResponse = await fetch(`/api/users/${userId}/paid-therapists`);
        const paidTherapistsData = await paidTherapistsResponse.json();
        
        if (paidTherapistsData.success) {
          setAvailableTherapists(paidTherapistsData.therapists || []);
          
          if (paidTherapistsData.therapists.length > 0) {
            // Then get conversations with those therapists
            const response = await fetch(`/api/messages?user_type=user&user_id=${userId}`);
            const data = await response.json();
            setConversations(data.conversations || []);
          } else {
            setConversations([]);
          }
        } else {
          setAvailableTherapists([]);
          setConversations([]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      setAvailableTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversation: any) => {
    setLoadingMessages(true);
    try {
      const userType = user?.role === 'therapist' ? 'therapist' : 'user';
      const userId = user?.role === 'therapist' ? user.therapist_id : user?.user_id;
      const response = await fetch(
        `/api/messages?user_type=${userType}&user_id=${userId}&conversation_with=${conversation.contact_id}&with_type=${conversation.contact_type}`
      );
      const data = await response.json();
      setMessages(data.messages || []);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const userId = user?.role === 'therapist' ? user.therapist_id : user?.user_id;
    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_type: user?.role === 'therapist' ? 'therapist' : 'user',
          sender_id: userId,
          receiver_type: (selectedConversation as any).contact_type,
          receiver_id: (selectedConversation as any).contact_id,
          message_text: newMessage,
          message_type: 'text'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        
        // Scroll to bottom after sending message
        setTimeout(scrollToBottom, 50);
        
        // If this was a new conversation, refresh conversations list
        if (!conversations.find(c => c.contact_id === selectedConversation.contact_id)) {
          fetchConversations(userId);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Enhanced functionality functions
  const fetchAvailableResources = async () => {
    try {
      setResourceLoading(true);
      console.log('Fetching resources...');
      const response = await fetch('/api/resources');
      const data = await response.json();
      console.log('Resources response:', data);
      
      if (data.success && data.resources) {
        setAvailableResources(data.resources);
        console.log('Set available resources:', data.resources);
      } else {
        console.error('No resources found or API error:', data);
        setAvailableResources([]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setAvailableResources([]);
    } finally {
      setResourceLoading(false);
    }
  };

    const assignResourceToUser = async (resourceId: number, userId: number, resource?: any) => {
    try {
      console.log('=== Starting Resource Assignment ===');
      console.log('Resource ID:', resourceId);
      console.log('User ID:', userId);
      console.log('Therapist ID:', user?.therapist_id);
      console.log('Resource object:', resource);
      
      if (!user?.therapist_id) {
        alert('Error: No therapist ID found. Please log in as a therapist.');
        return;
      }
      
      // Use safe IDs - fallback to 1 if invalid
      const safeUserId = parseInt(userId.toString()) || 1;
      const safeResourceId = parseInt(resourceId.toString()) || 1;
      const safeTherapistId = user.therapist_id || 1;
      
      // Based on the actual user_resources table structure:
      // user_id, resource_id, assigned_at, suggested_by (no notes or progress_status columns)
      const assignmentData = {
        userId: safeUserId,
        resourceId: safeResourceId,
        suggestedBy: safeTherapistId
      };
      
      console.log('Assignment data being sent:', assignmentData);
      
      const response = await fetch('/api/assign-resource-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        
        // Try to parse as JSON to get more details
        try {
          const errorJson = JSON.parse(errorText);
          alert(`❌ Assignment failed: ${errorJson.error || errorText}`);
        } catch {
          alert(`❌ HTTP Error ${response.status}: ${errorText}`);
        }
        return;
      }

      const data = await response.json();
      console.log('Resource assignment response:', data);
      
      if (data.success) {
        alert('✅ Resource assigned successfully!');
        
        // Send a message to the user about the assigned resource
        const resourceToUse = resource || selectedResource;
        if (resourceToUse && selectedConversation) {
          console.log('Sending notification message...');
          try {
            await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sender_type: 'therapist',
                sender_id: user.therapist_id,
                receiver_type: 'user',
                receiver_id: userId,
                message_text: `📚 I've assigned a new resource for you: "${resourceToUse.title}"`,
                message_type: 'resource_assignment'
              })
            });
            
            // Refresh messages
            await fetchMessages(selectedConversation);
            console.log('Message sent and refreshed');
          } catch (msgError) {
            console.error('Failed to send message:', msgError);
            // Don't fail the assignment if message fails
          }
        }
        
        // Close modal and reset
        setShowResourceModal(false);
        setSelectedResource(null);
      } else {
        console.error('Assignment failed:', data);
        alert(`❌ Assignment failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error assigning resource:', error);
      alert(`❌ Failed to assign resource: ${error}`);
    }
  };

  const fetchPatientSessions = async (userId: number) => {
    try {
      const therapistId = user?.therapist_id;
      if (!therapistId) {
        console.error('No therapist ID found');
        return;
      }

      // Fetch appointments for THIS therapist and this user
      const response = await fetch(`/api/therapists/${therapistId}/appointments?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.appointments) {
        // For each appointment, get its sessions
        const sessionsPromises = data.appointments.map(async (appointment: any) => {
          const sessionResponse = await fetch(`/api/appointments/${appointment.appointment_id}/sessions`);
          const sessionData = await sessionResponse.json();
          
          if (sessionData.success && sessionData.sessions) {
            return sessionData.sessions.map((session: any) => ({
              ...session,
              appointment,
              user_name: appointment.user_name
            }));
          }
          return [];
        });

        const allSessions = await Promise.all(sessionsPromises);
        const flatSessions = allSessions.flat();
        console.log('Loaded sessions for current therapist:', flatSessions);
        setPatientSessions(flatSessions);
      } else {
        console.error('Failed to fetch patient sessions:', data.error);
        setPatientSessions([]);
      }
    } catch (error) {
      console.error('Error fetching patient sessions:', error);
      setPatientSessions([]);
    }
  };

  const fetchSessionNotes = async (userId: number) => {
    try {
      // Get appointments for this user-therapist pair
      const therapistId = user?.role === 'therapist' ? user.therapist_id : null;
      const response = await fetch(`/api/therapists/${therapistId}/appointments?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.appointments.length > 0) {
        // Get sessions and notes for these appointments
        const sessionNotesPromises = data.appointments.map(async (appointment: any) => {
          const sessionResponse = await fetch(`/api/appointments/${appointment.appointment_id}/sessions`);
          const sessionData = await sessionResponse.json();
          
          if (sessionData.success && sessionData.sessions.length > 0) {
            const notesPromises = sessionData.sessions.map(async (session: any) => {
              const notesResponse = await fetch(`/api/sessions/${session.session_id}/notes?userType=therapist`);
              const notesData = await notesResponse.json();
              return {
                session,
                notes: notesData.success ? notesData.notes : []
              };
            });
            return Promise.all(notesPromises);
          }
          return [];
        });
        
        const allSessionNotes = await Promise.all(sessionNotesPromises);
        setSessionNotes(allSessionNotes.flat());
      }
    } catch (error) {
      console.error('Error fetching session notes:', error);
    }
  };

  const createSessionNote = async (sessionId: number): Promise<boolean> => {
    try {
      // Add therapist_id validation for therapist users
      const noteData = user?.role === 'therapist' 
        ? { ...newSessionNote, therapist_id: user.therapist_id }
        : newSessionNote;

      const response = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
      });

      const data = await response.json();
      if (data.success) {
        setShowSessionNotesModal(false);
        // Log success with session details
        console.log('Session note saved:', data.session_details);
        return true;
      } else {
        console.error('Session note creation failed:', data.error);
        alert('Failed to create note: ' + data.error);
        return false;
      }
    } catch (error) {
      console.error('Error creating session note:', error);
      return false;
    }
  };

  const startNewConversation = (contact: any) => {
    const newConversation = {
      contact_type: user?.role === 'therapist' ? 'user' : 'therapist',
      contact_id: user?.role === 'therapist' ? contact.user_id : contact.therapist_id,
      contact_name: user?.role === 'therapist' ? contact.user_name : contact.therapist_name,
      contact_image: contact.image,
      last_message_time: null,
      unread_count: 0
    };
    setSelectedConversation(newConversation);
    setMessages([]);
    setShowNewConversation(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  // If no current user, show login prompt
  const userId = user?.role === 'therapist' ? user.therapist_id : user?.user_id;
  if (!user || (user.role !== 'user' && user.role !== 'therapist') || !userId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Please log in</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to view your messages</p>
          <Button asChild className="btn-primary">
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#2596be]/10 text-[#2596be] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#2596be]/20">
            <MessageCircle className="w-4 h-4" />
            {user?.role === 'therapist' ? 'Patient Communication' : 'Therapist Communication'}
          </div>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-[#2596be]/10 rounded-2xl flex items-center justify-center border border-[#2596be]/20 shadow-lg shadow-[#2596be]/5">
              <MessageCircle className="w-8 h-8 text-[#2596be]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
              <p className="text-xl text-gray-600">
                {user?.role === 'therapist' ? 'Connect with your patients securely' : 'Stay connected with your mental health professionals'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
          <Card className="lg:col-span-1 card-modern border-0 shadow-xl shadow-[#2596be]/5 hover:shadow-[#2596be]/10 transition-all duration-300">
            <CardHeader className="bg-[#2596be]/5 border-b border-[#2596be]/10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#2596be]/10 rounded-xl flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-[#2596be]" />
                  </div>
                  <span className="text-gray-900">Conversations</span>
                </div>
                {availableTherapists.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowNewConversation(!showNewConversation)}
                    className="border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be] hover:text-white hover:border-[#2596be] transition-all duration-300 shadow-sm"
                  >
                    New Chat
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {showNewConversation ? (
                  <div className="p-4">
                    <h3 className="font-medium mb-3">Start conversation with:</h3>
                    {availableTherapists.map((contact) => (
                      <div
                        key={user?.role === 'therapist' ? contact.user_id : contact.therapist_id}
                        onClick={() => startNewConversation(contact)}
                        className="flex items-center gap-3 p-3 hover:bg-[#2596be]/5 cursor-pointer rounded-lg transition-all duration-300 group hover:scale-[1.02]"
                      >
                        <div className="w-10 h-10 bg-[#2596be]/10 rounded-full flex items-center justify-center border border-[#2596be]/20 shadow-sm">
                          <UserRound className="h-5 w-5 text-[#2596be]" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {user?.role === 'therapist' ? contact.user_name : contact.therapist_name}
                          </p>
                          <p className="text-sm text-gray-500">{contact.paid_appointments} paid session(s)</p>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowNewConversation(false)}
                      className="mt-3 w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    {conversations.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {availableTherapists.length === 0 ? (
                          <div>
                            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="font-medium">
                              {user?.role === 'therapist' ? 'No patients available' : 'No therapists available'}
                            </p>
                            <p className="text-sm mt-1">
                              {user?.role === 'therapist' 
                                ? 'You\'ll be able to message patients after they book and pay for appointments.'
                                : 'Book and pay for an appointment to start messaging with therapists.'
                              }
                            </p>
                          </div>
                        ) : (
                          <div>
                            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="font-medium">No conversations yet</p>
                            <p className="text-sm mt-1">
                              Click "New Chat" to start messaging with your {user?.role === 'therapist' ? 'patients' : 'therapists'}.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      conversations.map((conversation) => (
                    <div
                      key={`${conversation.contact_type}-${conversation.contact_id}`}
                      className={`p-4 border-b border-[#2596be]/10 cursor-pointer hover:bg-[#2596be]/5 transition-all duration-300 group hover:scale-[1.02] ${
                        selectedConversation?.contact_id === conversation.contact_id 
                          ? 'bg-[#2596be]/10 border-l-4 border-l-[#2596be] shadow-sm'
                          : ''
                      }`}
                      onClick={() => fetchMessages(conversation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2596be] rounded-full flex items-center justify-center shadow-md shadow-[#2596be]/20 group-hover:shadow-lg group-hover:shadow-[#2596be]/30 transition-all duration-300">
                            <UserRound className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-[#2596be] transition-colors duration-300">
                              {conversation.contact_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {user?.role === 'therapist' ? 'Patient' : 'Therapist'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_time)}
                          </p>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 card-modern border-0 shadow-xl shadow-[#2596be]/5 hover:shadow-[#2596be]/10 transition-all duration-300">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b border-[#2596be]/10 bg-gradient-to-r from-[#2596be]/5 to-transparent">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2596be] to-[#1d7a99] rounded-full flex items-center justify-center shadow-lg shadow-[#2596be]/20">
                      <UserRound className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedConversation.contact_name}</p>
                      <p className="text-sm text-gray-600 font-normal">
                        {user?.role === 'therapist' ? 'Patient' : 'Therapist'}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[550px]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-700">No messages yet</p>
                        <p className="text-sm text-gray-500">Start the conversation below</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const userId = user?.role === 'therapist' ? user.therapist_id : user?.user_id;
                        const isMyMessage = (message as any).sender_type === user?.role && (message as any).sender_id === userId;
                        return (
                      <div
                        key={message.message_id}
                        className={`flex ${
                          isMyMessage
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                            isMyMessage
                              ? 'bg-[#2596be] text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{(message as any).message_text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMyMessage
                                ? 'text-white/80'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTime((message as any).created_at)}
                          </p>
                        </div>
                      </div>
                        );
                      })
                    )}
                    {/* Invisible div for auto-scrolling to bottom */}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Therapist Action Buttons */}
                  {user?.role === 'therapist' && selectedConversation && (
                    <div className="border-t border-[#2596be]/10 p-3 bg-[#2596be]/5">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => {
                            fetchAvailableResources();
                            setShowResourceModal(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10"
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Assign Resource
                        </Button>
                        <Button
                          onClick={() => {
                            const userId = selectedConversation?.user_id || selectedConversation?.contact_id;
                            if (userId) {
                              fetchSessionNotes(userId);
                              setShowSessionNotesModal(true);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10"
                        >
                          <NotepadText className="h-4 w-4 mr-1" />
                          Session Notes
                        </Button>
                        <Button
                          onClick={() => {
                            const userId = selectedConversation?.user_id || selectedConversation?.contact_id;
                            if (userId) {
                              fetchPatientSessions(userId);
                              setShowPatientSessionsModal(true);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          View Sessions
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[#2596be]/10 p-4 bg-[#2596be]/5">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          disabled={sending}
                          className="input-modern border-[#2596be]/20 focus:border-[#2596be] focus:ring-[#2596be]/20 shadow-sm"
                        />
                      </div>
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="bg-[#2596be] hover:bg-[#1d7a99] text-white shadow-lg shadow-[#2596be]/20 hover:shadow-[#2596be]/30 transition-all duration-300 px-4"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#2596be]/20">
                    <MessageCircle className="h-10 w-10 text-[#2596be]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Connect</h3>
                  <p className="text-gray-600">Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Resource Assignment Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="card-modern max-w-2xl w-full max-h-[80vh] overflow-y-auto scale-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2596be]/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-[#2596be]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Assign Resource</h2>
              </div>
              <button 
                onClick={() => setShowResourceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {resourceLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading resources...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableResources.map((resource, index) => (
                    <div 
                      key={resource.resource_id} 
                      className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        selectedResource?.resource_id === resource.resource_id 
                          ? 'bg-[#2596be]/5 border-[#2596be]/30 shadow-sm' 
                          : 'border-gray-200/60 hover:bg-gray-50/50 hover:border-gray-300/60'
                      }`}
                      onClick={() => {
                        console.log('Selecting resource:', resource);
                        setSelectedResource(resource);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selectedResource?.resource_id === resource.resource_id 
                            ? 'bg-[#2596be]/10' 
                            : 'bg-gray-100'
                        }`}>
                          <FileText className={`h-6 w-6 ${
                            selectedResource?.resource_id === resource.resource_id 
                              ? 'text-[#2596be]' 
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs font-medium ${
                                  selectedResource?.resource_id === resource.resource_id 
                                    ? 'border-[#2596be]/30 text-[#2596be] bg-[#2596be]/5' 
                                    : 'border-gray-300 text-gray-600'
                                }`}
                              >
                                {resource.type}
                              </Badge>
                              {resource.author_or_source && (
                                <span className="text-xs text-gray-500">
                                  by {resource.author_or_source}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const userId = selectedConversation?.user_id || selectedConversation?.contact_id;
                                if (userId) {
                                  console.log('Assigning resource directly:', resource.resource_id, 'to user:', userId);
                                  assignResourceToUser(resource.resource_id, userId, resource);
                                } else {
                                  alert('No user selected');
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#2596be] hover:bg-[#1d7a99] text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              <BookOpen className="h-3 w-3" />
                              Assign
                            </button>
                          </div>
                        </div>
                        {selectedResource?.resource_id === resource.resource_id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-[#2596be] flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedResource && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200/50">
                  <Button 
                    onClick={() => {
                      const userId = selectedConversation?.user_id || selectedConversation?.contact_id;
                      if (userId && selectedResource) {
                        assignResourceToUser(selectedResource.resource_id, userId, selectedResource);
                      }
                    }}
                    className="btn-primary flex-1"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assign to Patient
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedResource(null);
                      setShowResourceModal(false);
                    }}
                    variant="outline"
                    className="btn-secondary"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              {availableResources.length === 0 && !resourceLoading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Available</h3>
                  <p className="text-gray-600">There are no resources available to assign at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Session Notes Modal */}
      {showSessionNotesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="card-modern max-w-4xl w-full max-h-[80vh] overflow-y-auto scale-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2596be]/10 rounded-xl flex items-center justify-center">
                  <NotepadText className="h-5 w-5 text-[#2596be]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Session Notes</h2>
              </div>
              <button 
                onClick={() => setShowSessionNotesModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {/* Create New Session Note */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-foreground mb-4">Create New Session Note</h3>
                
                {/* Session Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Session <span className="text-red-500">*</span>
                  </label>
                  {patientSessions.length > 0 ? (
                    <select
                      value={selectedSession?.session_id || ''}
                      onChange={(e) => {
                        const session = patientSessions.find(s => s.session_id === parseInt(e.target.value));
                        setSelectedSession(session);
                      }}
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-foreground focus:border-[#2596be] focus:outline-none"
                    >
                      <option value="">-- Select a session --</option>
                      {patientSessions.map((session) => (
                        <option key={session.session_id} value={session.session_id}>
                          Session on {new Date(session.session_date || session.appointment?.start_time).toLocaleDateString()} 
                          {session.duration_min && ` (${session.duration_min} min)`}
                          {session.status && ` - ${session.status}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No sessions found with this patient. You need to complete a session first.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Session Summary
                    </label>
                    <textarea
                      value={newSessionNote.summary}
                      onChange={(e) => setNewSessionNote(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Brief summary of the session..."
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:border-[#2596be] focus:outline-none resize-none"
                      rows={3}
                      disabled={!selectedSession}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Homework/Action Items
                    </label>
                    <textarea
                      value={newSessionNote.homework}
                      onChange={(e) => setNewSessionNote(prev => ({ ...prev, homework: e.target.value }))}
                      placeholder="Tasks or exercises for the patient..."
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:border-[#2596be] focus:outline-none resize-none"
                      rows={2}
                      disabled={!selectedSession}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Private Notes (Therapist Only)
                    </label>
                    <textarea
                      value={newSessionNote.therapist_private_notes}
                      onChange={(e) => setNewSessionNote(prev => ({ ...prev, therapist_private_notes: e.target.value }))}
                      placeholder="Private observations and notes..."
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:border-[#2596be] focus:outline-none resize-none"
                      rows={2}
                      disabled={!selectedSession}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="visible_to_user"
                      checked={newSessionNote.visible_to_user}
                      onChange={(e) => setNewSessionNote(prev => ({ ...prev, visible_to_user: e.target.checked }))}
                      className="rounded border-white/20 text-[#2596be] focus:ring-[#2596be]"
                      disabled={!selectedSession}
                    />
                    <label htmlFor="visible_to_user" className="text-sm text-foreground">
                      Make summary and homework visible to patient
                    </label>
                  </div>
                  <Button 
                    onClick={async () => {
                      try {
                        if (!selectedSession) {
                          alert('Please select a session first');
                          return;
                        }

                        const userId = selectedConversation?.user_id || selectedConversation?.contact_id;
                        if (!userId || !user?.therapist_id) {
                          alert('Missing user or therapist information');
                          return;
                        }

                        console.log('Creating session note for session:', selectedSession.session_id);
                        
                        // Use the selected session ID
                        const noteCreated = await createSessionNote(selectedSession.session_id);
                        
                        if (noteCreated) {
                          alert('Session note created successfully!');
                          
                          // Reset form
                          setNewSessionNote({
                            summary: '',
                            homework: '',
                            therapist_private_notes: '',
                            visible_to_user: true
                          });
                          setSelectedSession(null);
                          
                          // Send message to patient
                          await fetch('/api/messages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              sender_type: 'therapist',
                                sender_id: user.therapist_id,
                                receiver_type: 'user',
                                receiver_id: parseInt(userId.toString()),
                                message_text: `📝 Session notes added: "${newSessionNote.summary.substring(0, 50)}${newSessionNote.summary.length > 50 ? '...' : ''}"`,
                                message_type: 'session_note'
                              })
                            });
                            
                            // Clear the form
                            setNewSessionNote({
                              summary: '',
                              homework: '',
                              therapist_private_notes: '',
                              visible_to_user: true
                            });
                            
                            // Refresh messages
                            if (selectedConversation) {
                              await fetchMessages(selectedConversation);
                            }
                          } else {
                            alert('Failed to create session note');
                          }
                      } catch (error) {
                        console.error('Error creating session note:', error);
                        alert('Failed to create session note: ' + error);
                      }
                    }}
                    disabled={!selectedSession || !newSessionNote.summary.trim()}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Save Session Note
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowSessionNotesModal(false);
                      setShowResourceModal(true);
                      fetchAvailableResources();
                    }}
                    variant="outline"
                    className="ml-3"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assign Resource to Patient
                  </Button>
                </div>
              </div>

              {/* Existing Session Notes */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Previous Session Notes</h3>
                {sessionNotes.length > 0 ? (
                  <div className="space-y-4">
                    {sessionNotes.map((item, index) => (
                      <div key={index} className="border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-foreground">
                              Session {item.session?.session_date ? new Date(item.session.session_date).toLocaleDateString() : 'Date Unknown'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Duration: {item.session?.duration_min || 'N/A'} minutes
                            </p>
                          </div>
                          {item.session?.rating_by_user && (
                            <Badge variant="outline" className="text-xs">
                              Rating: {item.session.rating_by_user}/5
                            </Badge>
                          )}
                        </div>
                        {item.notes.map((note: any) => (
                          <div key={note.note_id} className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                            {note.summary && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-foreground">Summary: </span>
                                <span className="text-sm text-muted-foreground">{note.summary}</span>
                              </div>
                            )}
                            {note.homework && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-foreground">Homework: </span>
                                <span className="text-sm text-muted-foreground">{note.homework}</span>
                              </div>
                            )}
                            {note.therapist_private_notes && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-red-400">Private Notes: </span>
                                <span className="text-sm text-muted-foreground">{note.therapist_private_notes}</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {new Date(note.created_at).toLocaleString()}
                              {note.visible_to_user ? ' • Visible to patient' : ' • Private'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <NotepadText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No session notes found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Sessions Modal */}
      {showPatientSessionsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern max-w-5xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-foreground">
                Sessions with {selectedConversation?.name || 'Patient'}
              </h2>
              <button 
                onClick={() => setShowPatientSessionsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {patientSessions.length > 0 ? (
                <div className="space-y-6">
                  {patientSessions.map((session) => (
                    <div key={session.session_id} className="border border-white/10 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Session on {new Date(session.session_date).toLocaleDateString()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Duration: {session.duration_min} minutes
                          </p>
                          {session.appointment_date && (
                            <p className="text-sm text-muted-foreground">
                              Appointment: {new Date(session.appointment_date).toLocaleDateString()} 
                              {session.start_time && ` at ${session.start_time}`}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {session.rating_by_user && (
                            <Badge variant="outline" className="text-xs">
                              User Rating: {session.rating_by_user}/5
                            </Badge>
                          )}
                          {session.rating_by_therapist && (
                            <Badge variant="outline" className="text-xs">
                              Therapist Rating: {session.rating_by_therapist}/5
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Session Notes */}
                      {session.notes && session.notes.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-foreground mb-3">Session Notes:</h4>
                          <div className="space-y-3">
                            {session.notes.map((note: any) => (
                              <div key={note.note_id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                {note.summary && (
                                  <div className="mb-2">
                                    <span className="text-sm font-medium text-foreground">Summary: </span>
                                    <span className="text-sm text-muted-foreground">{note.summary}</span>
                                  </div>
                                )}
                                {note.homework && (
                                  <div className="mb-2">
                                    <span className="text-sm font-medium text-foreground">Homework: </span>
                                    <span className="text-sm text-muted-foreground">{note.homework}</span>
                                  </div>
                                )}
                                {note.therapist_private_notes && (
                                  <div className="mb-2">
                                    <span className="text-sm font-medium text-red-400">Private Notes: </span>
                                    <span className="text-sm text-muted-foreground">{note.therapist_private_notes}</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                                  <p className="text-xs text-muted-foreground">
                                    Created: {new Date(note.created_at).toLocaleString()}
                                  </p>
                                  <Badge variant={note.visible_to_user ? "default" : "secondary"} className="text-xs">
                                    {note.visible_to_user ? 'Visible to Patient' : 'Private'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Session Details */}
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {session.session_type && (
                          <div>
                            <span className="font-medium text-foreground">Type: </span>
                            <span className="text-muted-foreground">{session.session_type}</span>
                          </div>
                        )}
                        {session.appointment_status && (
                          <div>
                            <span className="font-medium text-foreground">Status: </span>
                            <span className="text-muted-foreground">{session.appointment_status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No sessions found with this patient</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
