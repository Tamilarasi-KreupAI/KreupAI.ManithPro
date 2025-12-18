import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI, Conversation, Message } from '../services/messageAPI';
import MessageBubble from '../components/MessageBubble';
import MessageTemplates from '../components/MessageTemplates';
import CodeSnippetShare from '../components/CodeSnippetShare';

interface EligibleCandidate {
  id: string;
  status: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    skills: string[];
    location?: string;
  };
  job: {
    id: string;
    title: string;
    companyName: string;
  };
}

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
  const [eligibleCandidates, setEligibleCandidates] = useState<EligibleCandidate[]>([]);
  const [showEligibleCandidates, setShowEligibleCandidates] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      fetchConversations();
      if (user?.role === 'RECRUITER') {
        fetchEligibleCandidates();
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle incoming candidate from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.candidate && state?.applicationId) {
      // Auto-start conversation with the candidate
      const conversation: Conversation = {
        user: state.candidate,
        lastMessage: { content: '', createdAt: new Date().toISOString() } as Message,
        unreadCount: 0,
      };
      setSelectedConversation(conversation);
      setSelectedApplicationId(state.applicationId);
      setShowEligibleCandidates(false);
      fetchMessages(state.candidate.id);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    } else if (state?.startConversation) {
      const newUser = state.startConversation;
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
  }, [location, conversations, user]);

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

  const fetchEligibleCandidates = async () => {
    try {
      const data = await messageAPI.getEligibleCandidates();
      setEligibleCandidates(data.eligibleCandidates || []);
    } catch (err: any) {
      console.error('Failed to fetch eligible candidates:', err);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const data = await messageAPI.getConversation(userId);
      setMessages(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError(err.message || 'Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const messageData: any = {
        receiverId: selectedConversation.user.id,
        content: newMessage.trim(),
      };

      // Include applicationId if messaging an eligible candidate
      if (selectedApplicationId) {
        messageData.applicationId = selectedApplicationId;
      }

      const sentMessage = await messageAPI.send(messageData);

      // Optimistically add message to UI
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // Refresh conversations to update last message
      fetchConversations();
      setSelectedApplicationId(null);
      setError(null);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const startConversationWithCandidate = (candidate: EligibleCandidate) => {
    setSelectedConversation({
      user: candidate.candidate,
      lastMessage: { content: '', createdAt: new Date().toISOString() } as Message,
      unreadCount: 0,
    });
    setSelectedApplicationId(candidate.id);
    setShowEligibleCandidates(false);
    // Fetch existing messages if any
    fetchMessages(candidate.candidate.id);
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden flex pt-20">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-primary-900/20 -z-10" />

      {/* Conversations List */}
      <div className="w-1/3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-slate-200 dark:border-gray-700 overflow-y-auto z-10">
        <div className="p-4 border-b border-slate-100 dark:border-gray-700 sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
          {user?.role === 'RECRUITER' && eligibleCandidates.length > 0 && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowEligibleCandidates(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !showEligibleCandidates
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setShowEligibleCandidates(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showEligibleCandidates
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                }`}
              >
                Eligible ({eligibleCandidates.length})
              </button>
            </div>
          )}
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
        ) : showEligibleCandidates && user?.role === 'RECRUITER' ? (
          <div>
            {eligibleCandidates.length === 0 ? (
              <div className="text-center p-8 text-slate-500 dark:text-gray-400">
                <div className="text-4xl mb-3">💼</div>
                <p className="font-medium">No eligible candidates yet</p>
                <p className="text-sm mt-2">Candidates who are shortlisted or scheduled for interview will appear here</p>
              </div>
            ) : (
              eligibleCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {candidate.candidate.firstName} {candidate.candidate.lastName}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{candidate.job.companyName}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{candidate.job.title}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      candidate.status === 'SHORTLISTED'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {candidate.status === 'SHORTLISTED' ? 'Shortlisted' : 'Interview'}
                    </span>
                  </div>
                  {candidate.candidate.location && (
                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">{candidate.candidate.location}</p>
                  )}
                  {candidate.candidate.skills && candidate.candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.candidate.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {candidate.candidate.skills.length > 3 && (
                        <span className="text-xs text-slate-500 dark:text-gray-400">+{candidate.candidate.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => startConversationWithCandidate(candidate)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Message Candidate
                  </button>
                </div>
              ))
            )}
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
                className={`p-4 border-b border-slate-100 dark:border-gray-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700 transition-all ${selectedConversation?.user.id === conv.user.id ? 'bg-blue-50 dark:bg-primary-900/30 border-l-4 border-l-blue-600 dark:border-l-primary-500 shadow-sm' : 'border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md">
                    {conv.user.firstName?.[0]?.toUpperCase() || '?'}
                    {conv.user.lastName?.[0]?.toUpperCase() || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {conv.user.firstName} {conv.user.lastName}
                      </h3>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-xs text-slate-400 dark:text-gray-500 ml-2 flex-shrink-0">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-slate-500 dark:text-gray-400 truncate flex-1">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 dark:bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 font-medium shadow-sm flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
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
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {selectedConversation.user.firstName?.[0]?.toUpperCase() || '?'}
                  {selectedConversation.user.lastName?.[0]?.toUpperCase() || ''}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {selectedConversation.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-gray-900/50 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-gray-500">
                  <div className="text-6xl mb-4">💭</div>
                  <p className="font-medium text-lg">No messages yet</p>
                  <p className="text-sm mt-2">Start the conversation by sending a message below</p>
                </div>
              ) : (
                messages.map((message) => (
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
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 shadow-lg">
              <div className="flex gap-2 mb-3">
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
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    rows={3}
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500">
                    {newMessage.length > 0 && `${newMessage.length} chars`}
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 transition-all transform active:scale-95 shadow-lg hover:shadow-xl"
                  aria-label="Send message"
                  title="Send message (Enter)"
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">Shift+Enter</kbd> for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-slate-50/50 dark:bg-gray-900/50">
            <div className="text-center max-w-md px-6">
              <div className="text-8xl mb-6 animate-bounce">💬</div>
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Welcome to Messages
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select a conversation from the sidebar to start chatting, or check out the eligible candidates to begin a new conversation.
              </p>
              <div className="flex flex-col gap-3 text-left bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Real-time messaging</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instant communication with candidates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Smart eligibility</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Only message shortlisted or scheduled candidates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Email notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatic email alerts for new messages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
