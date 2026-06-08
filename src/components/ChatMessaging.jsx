import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Users, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export function ChatMessaging() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations when chat opens
  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/conversations');
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    
    setSending(true);
    try {
      await api.post(`/chat/conversations/${selectedConversation.id}/messages`, null, {
        params: { content: newMessage }
      });
      setNewMessage('');
      await fetchMessages(selectedConversation.id);
      await fetchConversations(); // Update last message in sidebar
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 shadow-lg text-white"
      >
        <MessageCircle className="w-6 h-6" />
        {conversations.filter(c => c.unread_count > 0).length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {conversations.filter(c => c.unread_count > 0).length}
          </span>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden border dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold dark:text-gray-100">Messages</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations Sidebar */}
            <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r dark:border-gray-700 overflow-y-auto`}>
              {loading ? (
                <div className="flex justify-center items-center h-full py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start by connecting with companies</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                      selectedConversation?.id === conv.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-600 text-white">
                          {conv.other_user_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm dark:text-gray-200 truncate">
                          {conv.other_user_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conv.last_message || 'No messages yet'}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Messages Area */}
            {selectedConversation ? (
              <div className={`${selectedConversation ? 'flex' : 'hidden'} flex-1 flex-col w-full md:w-2/3`}>
                {/* Conversation Header */}
                <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden h-8 w-8 p-0"
                  >
                    ←
                  </Button>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-600 text-white">
                      {selectedConversation.other_user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm dark:text-gray-200">
                      {selectedConversation.other_user_name || 'User'}
                    </p>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={msg.id || idx}
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-2 rounded-lg ${
                            msg.sender_id === user?.id
                              ? 'bg-gray-800 text-white rounded-br-none'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-gray-300' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t dark:border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 text-sm dark:bg-gray-700 dark:border-gray-600"
                      disabled={sending}
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-gray-800 hover:bg-gray-700"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}