import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI, Conversation, Message } from '../services/messageAPI';
import MessageBubble from '../components/MessageBubble';
import MessageTemplates from '../components/MessageTemplates';
import CodeSnippetShare from '../components/CodeSnippetShare';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const data = await messageAPI.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const data = await messageAPI.getConversation(userId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messageAPI.send({
        receiverId: selectedConversation.user.id,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedConversation.user.id);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  return (
    <div className="h-screen bg-slate-50 relative overflow-hidden flex">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      {/* Conversations List */}
      <div className="w-1/3 bg-white/80 backdrop-blur-md border-r border-slate-200 overflow-y-auto z-10">
        <div className="p-4 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-slate-800">Messages</h2>
        </div>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center p-8 text-slate-500">No conversations yet</div>
        ) : (
          <div>
            {conversations.map((conv) => (
              <div
                key={conv.user.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedConversation?.user.id === conv.user.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {conv.user.firstName} {conv.user.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{conv.lastMessage.content}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 shadow-sm">
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

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
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

            <div className="p-4 bg-white border-t border-slate-200">
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
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                  aria-label="Send message"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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
