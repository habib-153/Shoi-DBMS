"use client";

import { useState, useEffect } from "react";
import { Search, Send, Users, Clock, Star, CheckCircle } from "lucide-react";

interface Message {
  id: number;
  patient_name: string;
  last_message: string;
  timestamp: string;
  unread: boolean;
  patient_id: number;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: number;
  sender: 'therapist' | 'patient';
  content: string;
  timestamp: string;
}

export default function TherapistMessages() {
  const [conversations, setConversations] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      // Mock data for demonstration - replace with actual API call
      const mockConversations: Message[] = [
        {
          id: 1,
          patient_name: "Sarah Ahmed",
          last_message: "Thank you for the session yesterday. I'm feeling much better.",
          timestamp: "2024-01-15T10:30:00Z",
          unread: true,
          patient_id: 1,
          messages: [
            {
              id: 1,
              sender: 'patient',
              content: "Hi Dr. I have been feeling anxious lately. Could we schedule a session?",
              timestamp: "2024-01-15T09:00:00Z"
            },
            {
              id: 2,
              sender: 'therapist',
              content: "Of course! I can see you're going through a difficult time. Let's schedule a session for tomorrow at 3 PM. In the meantime, try some breathing exercises.",
              timestamp: "2024-01-15T09:15:00Z"
            },
            {
              id: 3,
              sender: 'patient',
              content: "Thank you for the session yesterday. I'm feeling much better.",
              timestamp: "2024-01-15T10:30:00Z"
            }
          ]
        },
        {
          id: 2,
          patient_name: "Rafiq Hassan",
          last_message: "Can we reschedule tomorrow's appointment?",
          timestamp: "2024-01-15T08:15:00Z",
          unread: false,
          patient_id: 2,
          messages: [
            {
              id: 4,
              sender: 'patient',
              content: "Can we reschedule tomorrow's appointment?",
              timestamp: "2024-01-15T08:15:00Z"
            },
            {
              id: 5,
              sender: 'therapist',
              content: "Yes, let me check my schedule. How about Thursday at 2 PM?",
              timestamp: "2024-01-15T08:20:00Z"
            }
          ]
        },
        {
          id: 3,
          patient_name: "Fatima Khan",
          last_message: "The meditation techniques are really helping!",
          timestamp: "2024-01-14T16:45:00Z",
          unread: false,
          patient_id: 3,
          messages: [
            {
              id: 6,
              sender: 'patient',
              content: "The meditation techniques are really helping!",
              timestamp: "2024-01-14T16:45:00Z"
            }
          ]
        }
      ];

      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: ChatMessage = {
      id: Date.now(),
      sender: 'therapist',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    // Update local state
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      last_message: newMessage,
      timestamp: new Date().toISOString()
    };

    setSelectedConversation(updatedConversation);
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    ));
    setNewMessage("");

    // Here you would make an API call to save the message
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your patients</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-[#2596be]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{conversation.patient_name}</h3>
                          {conversation.unread && (
                            <div className="w-2 h-2 bg-[#2596be] rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(conversation.timestamp)}</p>
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(conversation.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2596be] rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedConversation.patient_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedConversation.patient_name}</h3>
                          <p className="text-sm text-gray-500">Patient ID: {selectedConversation.patient_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Star className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'therapist' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'therapist'
                              ? 'bg-[#2596be] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'therapist' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                    <p className="text-gray-500">Choose a patient from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}