"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Search, Phone, Video, MoreVertical, User } from "lucide-react";

interface Conversation {
  id: number;
  therapist_name: string;
  therapist_id: number;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  online: boolean;
}

interface Message {
  id: number;
  sender_type: 'user' | 'therapist';
  message: string;
  timestamp: string;
  read: boolean;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample data - in a real app, this would come from your API
  const sampleConversations: Conversation[] = [
    {
      id: 1,
      therapist_name: "Dr. Sarah Ahmed",
      therapist_id: 1,
      last_message: "How are you feeling about the techniques we discussed?",
      last_message_time: "2025-09-29T10:30:00",
      unread_count: 2,
      online: true
    },
    {
      id: 2,
      therapist_name: "Dr. Mohammad Hassan",
      therapist_id: 2,
      last_message: "Great progress in our last session! Keep practicing the breathing exercises.",
      last_message_time: "2025-09-28T15:45:00",
      unread_count: 0,
      online: false
    },
    {
      id: 3,
      therapist_name: "Dr. Fatima Khan",
      therapist_id: 3,
      last_message: "Thank you for sharing that with me. It shows real courage.",
      last_message_time: "2025-09-27T09:20:00",
      unread_count: 1,
      online: true
    }
  ];

  const sampleMessages: Message[] = [
    {
      id: 1,
      sender_type: 'therapist',
      message: "Hello! How are you feeling today?",
      timestamp: "2025-09-29T09:00:00",
      read: true
    },
    {
      id: 2,
      sender_type: 'user',
      message: "Hi Dr. Ahmed. I'm feeling a bit anxious about work today.",
      timestamp: "2025-09-29T09:05:00",
      read: true
    },
    {
      id: 3,
      sender_type: 'therapist',
      message: "I understand. Let's try the breathing technique we practiced. Take a deep breath in for 4 counts, hold for 4, then exhale for 4.",
      timestamp: "2025-09-29T09:08:00",
      read: true
    },
    {
      id: 4,
      sender_type: 'user',
      message: "Okay, I'm trying it now. It does help a little.",
      timestamp: "2025-09-29T09:12:00",
      read: true
    },
    {
      id: 5,
      sender_type: 'therapist',
      message: "That's wonderful! Remember, it's normal for anxiety to come and go. The important thing is that you have tools to manage it.",
      timestamp: "2025-09-29T09:15:00",
      read: true
    },
    {
      id: 6,
      sender_type: 'therapist',
      message: "How are you feeling about the techniques we discussed?",
      timestamp: "2025-09-29T10:30:00",
      read: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setConversations(sampleConversations);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(sampleMessages);
      scrollToBottom();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    
    const message: Message = {
      id: messages.length + 1,
      sender_type: 'user',
      message: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate API call
    setTimeout(() => {
      setSendingMessage(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
    <div className="h-screen bg-gray-50 flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-[#2596be]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-[#2596be] rounded-full flex items-center justify-center text-white font-semibold">
                    {conversation.therapist_name.charAt(0)}
                  </div>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">{conversation.therapist_name}</h3>
                    <span className="text-xs text-gray-500">{formatTime(conversation.last_message_time)}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{conversation.last_message}</p>
                </div>
                {conversation.unread_count > 0 && (
                  <div className="w-5 h-5 bg-[#2596be] text-white rounded-full flex items-center justify-center text-xs">
                    {conversation.unread_count}
                  </div>
                )}
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
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-[#2596be] rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.therapist_name.charAt(0)}
                  </div>
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedConversation.therapist_name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.online ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
                    message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {message.sender_type === 'therapist' && (
                      <div className="w-8 h-8 bg-[#2596be] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {selectedConversation.therapist_name.charAt(0)}
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        message.sender_type === 'user'
                          ? 'bg-[#2596be] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a therapist from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}