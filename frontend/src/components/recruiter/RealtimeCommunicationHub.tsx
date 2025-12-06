import React, { useState, useEffect, useRef } from 'react';
import {
  presenceAPI,
  notificationsAPI,
  conversationsAPI,
  messagesAPI,
  templatesAPI,
  scheduledMessagesAPI,
  emailFallbackAPI,
  communicationStatsAPI,
} from '../../services/batch26RealtimeCommunicationAPI';
import type {
  UserPresence,
  RealtimeNotification,
  Conversation,
  Message,
  MessageTemplate,
  ScheduledMessage,
  EmailFallbackConfig,
  CommunicationStats,
} from '../../types';

type TabType = 'overview' | 'conversations' | 'messages' | 'notifications' | 'templates' | 'scheduled' | 'settings';

const RealtimeCommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [emailConfig, setEmailConfig] = useState<EmailFallbackConfig | null>(null);
  const [presence, setPresence] = useState<UserPresence | null>(null);

  // Message input
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'overview':
          const [statsData, presenceData] = await Promise.all([
            communicationStatsAPI.getStats(),
            presenceAPI.get('user-1'),
          ]);
          setStats(statsData);
          setPresence(presenceData);
          break;
        case 'conversations':
          const convs = await conversationsAPI.getAll();
          setConversations(convs);
          break;
        case 'notifications':
          const { notifications: notifs, unreadCount: unread } = await notificationsAPI.getAll();
          setNotifications(notifs);
          setUnreadCount(unread);
          break;
        case 'templates':
          const tmpls = await templatesAPI.getAll();
          setTemplates(tmpls);
          break;
        case 'scheduled':
          const scheduled = await scheduledMessagesAPI.getAll();
          setScheduledMessages(scheduled);
          break;
        case 'settings':
          const config = await emailFallbackAPI.getConfig();
          setEmailConfig(config);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await messagesAPI.getByConversation(conversationId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await messagesAPI.send({
        conversationId: selectedConversation.id,
        content: newMessage,
      });
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleUpdatePresence = async (status: string) => {
    try {
      const updated = await presenceAPI.update({ status: status as any });
      setPresence(updated);
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  };

  const tabs: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'conversations', label: 'Conversations', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: unreadCount },
    { id: 'templates', label: 'Templates', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'scheduled', label: 'Scheduled', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const getPresenceColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-500';
      case 'AWAY': return 'bg-yellow-500';
      case 'BUSY': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Communication Overview</h3>
        {presence && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
            <select
              value={presence.status}
              onChange={(e) => handleUpdatePresence(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="ONLINE">Online</option>
              <option value="AWAY">Away</option>
              <option value="BUSY">Busy</option>
              <option value="OFFLINE">Offline</option>
            </select>
            <span className={`w-3 h-3 rounded-full ${getPresenceColor(presence.status)}`} />
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Conversations</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Unread Messages</div>
            <div className="text-2xl font-bold text-red-600">{stats.unreadMessages}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Messages Sent</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalMessagesSent}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Scheduled</div>
            <div className="text-2xl font-bold text-purple-600">{stats.pendingScheduled}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Templates</div>
            <div className="text-2xl font-bold text-green-600">{stats.availableTemplates}</div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('conversations')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">New Conversation</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Start a new chat</div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">Use Template</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Quick response</div>
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">Schedule Message</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Send later</div>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">View Notifications</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderConversations = () => (
    <div className="flex h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            New Conversation
          </button>
        </div>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => handleSelectConversation(conv)}
            className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              selectedConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                  {conv.type === 'GROUP' ? conv.name?.charAt(0) : conv.participants?.[1]?.userName?.charAt(0) || 'U'}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {conv.type === 'GROUP' ? conv.name : conv.participants?.[1]?.userName || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {conv.type === 'GROUP' ? `${conv.participants?.length} members` : 'Direct message'}
                  </div>
                </div>
              </div>
              {conv.participants?.[0]?.unreadCount ? (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {conv.participants[0].unreadCount}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="font-medium text-gray-900 dark:text-white">
                {selectedConversation.type === 'GROUP'
                  ? selectedConversation.name
                  : selectedConversation.participants?.[1]?.userName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedConversation.messageCount} messages
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === 'user-1' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === 'user-1'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {msg.senderId !== 'user-1' && (
                      <div className="text-xs font-medium mb-1 opacity-75">{msg.senderName}</div>
                    )}
                    <div>{msg.content}</div>
                    <div className={`text-xs mt-1 ${msg.senderId === 'user-1' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.editedAt && ' (edited)'}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
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

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button
          onClick={() => notificationsAPI.markAllRead()}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => !notification.isRead && handleMarkNotificationRead(notification.id)}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer ${
              !notification.isRead ? 'border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.type === 'MESSAGE' ? 'bg-blue-100 text-blue-600' :
                  notification.type === 'APPLICATION' ? 'bg-green-100 text-green-600' :
                  notification.type === 'INTERVIEW' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {notification.type === 'MESSAGE' ? 'M' :
                   notification.type === 'APPLICATION' ? 'A' :
                   notification.type === 'INTERVIEW' ? 'I' : 'N'}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">{notification.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{notification.body}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                notification.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                notification.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {notification.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Templates</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Template
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                {template.shortcut && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                    {template.shortcut}
                  </span>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                template.category === 'GREETING' ? 'bg-green-100 text-green-800' :
                template.category === 'FOLLOWUP' ? 'bg-blue-100 text-blue-800' :
                template.category === 'REJECTION' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {template.category}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {template.content}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Used {template.usageCount} times</span>
              {template.isShared && <span className="text-blue-600">Shared</span>}
            </div>

            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Use
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScheduled = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled Messages</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Schedule New
        </button>
      </div>

      <div className="space-y-4">
        {scheduledMessages.map((scheduled) => (
          <div key={scheduled.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Scheduled for: {new Date(scheduled.scheduledFor).toLocaleString()}
                </div>
                <p className="mt-2 text-gray-900 dark:text-white">{scheduled.content}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                scheduled.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                scheduled.status === 'SENT' ? 'bg-green-100 text-green-800' :
                scheduled.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {scheduled.status}
              </span>
            </div>

            {scheduled.status === 'PENDING' && (
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm text-red-600 hover:text-red-800">
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {scheduledMessages.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No scheduled messages. Schedule one to send later!
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Communication Settings</h3>

      {emailConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Email Fallback</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Receive emails when you're offline and miss messages.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Enable Email Fallback</div>
                <div className="text-sm text-gray-500">Get emails when offline</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={emailConfig.enabled} className="sr-only peer" readOnly />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Offline threshold (minutes)
              </label>
              <input
                type="number"
                value={emailConfig.offlineMinutes}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                readOnly
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Digest Mode</div>
                <div className="text-sm text-gray-500">Bundle messages into digest emails</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={emailConfig.digestMode} className="sr-only peer" readOnly />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max emails per day
              </label>
              <input
                type="number"
                value={emailConfig.maxEmailsPerDay}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                readOnly
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Presence Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Auto Away</div>
              <div className="text-sm text-gray-500">Automatically set status to away when idle</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={presence?.autoAway} className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Show Presence</div>
              <div className="text-sm text-gray-500">Let others see your online status</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={presence?.showPresence} className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={loadData} className="mt-2 text-sm text-red-600 hover:text-red-700">
            Try again
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'conversations': return renderConversations();
      case 'notifications': return renderNotifications();
      case 'templates': return renderTemplates();
      case 'scheduled': return renderScheduled();
      case 'settings': return renderSettings();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Real-Time Communication</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Instant messaging, notifications, and team communication
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-1 overflow-x-auto pb-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default RealtimeCommunicationHub;
