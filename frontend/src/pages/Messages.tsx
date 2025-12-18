import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI, Conversation, Message } from '../services/messageAPI';
import MessageBubble from '../components/MessageBubble';
import MessageTemplates from '../components/MessageTemplates';
import CodeSnippetShare from '../components/CodeSnippetShare';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();

    // Handle starting a new conversation from location state
    if (location.state?.startConversation) {
      const newUser = location.state.startConversation;
      // Check if conversation already exists
      const existingConv = conversations.find(c => c.user.id === newUser.id);
      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Create a temporary conversation
        setSelectedConversation({
          user: newUser,
          lastMessage: {
            id: 'temp',
            content: '',
            status: 'SENT',
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            senderId: user?.id || '',
            receiverId: newUser.id,
          },
          unreadCount: 0,
        });
      }
      // Clear the location state
      window.history.replaceState({}, document.title);
    }

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.user.id, true);
      }
      fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation, location.state]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const data = await messageAPI.getConversations();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string, silent = false) => {
    try {
      const data = await messageAPI.getConversation(userId);
      setMessages(data);
      setError(null);
    } catch (err: any) {
      if (!silent) {
        console.error('Failed to fetch messages:', err);
        setError(err.message || 'Failed to load messages');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const sentMessage = await messageAPI.send({
        receiverId: selectedConversation.user.id,
        content: newMessage.trim(),
      });

      // Optimistically add message to UI
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // Refresh conversations to update last message
      fetchConversations();
      setError(null);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden flex pt-20">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-primary-900/20 -z-10" />

      {/* Conversations List */}
      <div className="w-1/3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-slate-200 dark:border-gray-700 overflow-y-auto z-10">
        <div className="p-4 border-b border-slate-100 dark:border-gray-700 sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
        </div>
        {error && (
          <div className="p-4 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-primary-500"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center p-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-slate-500 dark:text-gray-400">No conversations yet</p>
            <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">Start messaging recruiters or candidates</p>
          </div>
        ) : (
          <div>
            {conversations.map((conv) => (
              <div
                key={conv.user.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-slate-100 dark:border-gray-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${selectedConversation?.user.id === conv.user.id ? 'bg-blue-50 dark:bg-primary-900/30 border-l-4 border-l-blue-600 dark:border-l-primary-500' : 'border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {conv.user.firstName} {conv.user.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 truncate">{conv.lastMessage.content}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-600 dark:bg-primary-600 text-white text-xs rounded-full px-2 py-1 shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedConversation.user.firstName} {selectedConversation.user.lastName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedConversation.user.email}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-gray-900/50">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  id={message.id}
                  content={message.content}
                  senderId={message.senderId}
                  senderName={
                    message.senderId === user?.id
                      ? 'You'
                      : `${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`
                  }
                  timestamp={message.createdAt}
                  status={message.status}
                  isOwn={message.senderId === user?.id}
                  attachments={message.attachments}
                  applicationId={message.applicationId}
                  onReply={(id) => {
                    // Handle reply functionality
                    console.log('Reply to:', id);
                  }}
                  onDelete={async (id) => {
                    // Handle delete functionality
                    console.log('Delete:', id);
                  }}
                />
              ))}
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700">
              <div className="flex gap-2 mb-2">
                <MessageTemplates
                  onSelectTemplate={(content) => setNewMessage(content)}
                  userRole={(user?.role as any) || 'CANDIDATE'}
                />
                <CodeSnippetShare
                  onInsertSnippet={(snippet) => {
                    setNewMessage(prev => prev + (prev ? '\n\n' : '') + snippet);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message... (Shift+Enter for new line)"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed self-end transition-colors"
                  aria-label="Send message"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
