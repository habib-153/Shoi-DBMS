'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, UserRound } from 'lucide-react';

export default function TherapistMessagesPage() {
  // Just hardcode therapist ID 202 - no authentication bullshit
  const therapistId = 202;
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    
    try {
      // First get paid patients
      const paidPatientsResponse = await fetch(`/api/therapists/${therapistId}/paid-patients`);
      const paidPatientsData = await paidPatientsResponse.json();
      
      if (paidPatientsData.success) {
        setAvailablePatients(paidPatientsData.patients || []);
        
        if (paidPatientsData.patients.length > 0) {
          // Then get conversations with those patients
          const response = await fetch(`/api/messages?user_type=therapist&user_id=${therapistId}`);
          const data = await response.json();
          setConversations(data.conversations || []);
        } else {
          // No paid patients found
          setConversations([]);
        }
      } else {
        setAvailablePatients([]);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      setAvailablePatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversation: any) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(
        `/api/messages?user_type=therapist&user_id=${therapistId}&conversation_with=${conversation.contact_id}&with_type=${conversation.contact_type}`
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

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_type: 'therapist',
          sender_id: therapistId,
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
        
        // If this was a new conversation, refresh conversations list
        if (!conversations.find(c => c.contact_id === selectedConversation.contact_id)) {
          fetchConversations();
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

  const startNewConversation = (patient: any) => {
    const newConversation = {
      contact_type: 'user',
      contact_id: patient.user_id,
      contact_name: patient.user_name,
      contact_image: patient.image,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // NO AUTHENTICATION CHECKS - JUST SHOW THE MESSAGES

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Chat with your patients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversations
                </div>
                {availablePatients.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowNewConversation(!showNewConversation)}
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
                    {availablePatients.map((patient) => (
                      <div
                        key={patient.user_id}
                        onClick={() => startNewConversation(patient)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserRound className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.user_name}</p>
                          <p className="text-sm text-gray-500">{patient.paid_appointments} paid session(s)</p>
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
                        {availablePatients.length === 0 ? (
                          <div>
                            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="font-medium">No patients available</p>
                            <p className="text-sm mt-1">You'll be able to message patients after they book and pay for appointments.</p>
                          </div>
                        ) : (
                          <div>
                            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="font-medium">No conversations yet</p>
                            <p className="text-sm mt-1">Click "New Chat" to start messaging with your patients.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      conversations.map((conversation) => (
                    <div
                      key={`${conversation.contact_type}-${conversation.contact_id}`}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.contact_id === conversation.contact_id 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : ''
                      }`}
                      onClick={() => fetchMessages(conversation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserRound className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {conversation.contact_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Patient
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

          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <UserRound className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedConversation.contact_name}</p>
                      <p className="text-sm text-gray-500 font-normal">
                        Patient
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[550px]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation below</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                      <div
                        key={message.message_id}
                        className={`flex ${
                          (message as any).sender_type === 'therapist' && (message as any).sender_id === therapistId
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            (message as any).sender_type === 'therapist' && (message as any).sender_id === therapistId
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{(message as any).message_text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              (message as any).sender_type === 'therapist' && (message as any).sender_id === therapistId
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTime((message as any).created_at)}
                          </p>
                        </div>
                      </div>
                      ))
                    )}
                  </div>

                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={sending}
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
