import { useEffect, useState } from 'react';
import {
  sendBroadcastEmail,
  sendBroadcastNotification,
  sendTestEmail,
  getCommunicationHistory,
  getNotificationTemplates,
  getEmailStats,
  getNotificationStats,
} from '../services/admin.service';

interface Template {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
  variables: string[];
}

interface EmailStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  last30Days: {
    sent: number;
    delivered: number;
  };
}

interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  last30Days: number;
}

const AdminCommunication = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    recipientType: 'all' as 'all' | 'role' | 'specific',
    role: 'CANDIDATE',
    subject: '',
    message: '',
  });

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    recipientType: 'all' as 'all' | 'role' | 'specific',
    role: 'CANDIDATE',
    title: '',
    message: '',
    type: 'APPLICATION_STATUS',
    link: '',
  });

  // Test email form state
  const [testEmailForm, setTestEmailForm] = useState({
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    loadTemplates();
    loadStats();
    loadHistory();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getNotificationTemplates();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [emailData, notificationData] = await Promise.all([
        getEmailStats(),
        getNotificationStats(),
      ]);
      setEmailStats(emailData);
      setNotificationStats(notificationData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getCommunicationHistory({ page: 1, limit: 10 });
      setHistory(data.history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSendBroadcastEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.subject || !emailForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    if (!window.confirm(`Send email to ${emailForm.recipientType} users?`)) {
      return;
    }

    try {
      setLoading(true);
      await sendBroadcastEmail({
        recipientType: emailForm.recipientType,
        role: emailForm.recipientType === 'role' ? emailForm.role : undefined,
        subject: emailForm.subject,
        message: emailForm.message,
      });
      alert('Broadcast email sent successfully');
      setEmailForm({ recipientType: 'all', role: 'CANDIDATE', subject: '', message: '' });
      loadHistory();
      loadStats();
    } catch (error) {
      console.error('Error sending broadcast email:', error);
      alert('Failed to send broadcast email');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    if (!window.confirm(`Send notification to ${notificationForm.recipientType} users?`)) {
      return;
    }

    try {
      setLoading(true);
      await sendBroadcastNotification({
        recipientType: notificationForm.recipientType,
        role: notificationForm.recipientType === 'role' ? notificationForm.role : undefined,
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        link: notificationForm.link || undefined,
      });
      alert('Broadcast notification sent successfully');
      setNotificationForm({ recipientType: 'all', role: 'CANDIDATE', title: '', message: '', type: 'APPLICATION_STATUS', link: '' });
      loadHistory();
      loadStats();
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      alert('Failed to send broadcast notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailForm.email || !testEmailForm.subject || !testEmailForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await sendTestEmail(testEmailForm.email, testEmailForm.subject, testEmailForm.message);
      alert('Test email sent successfully');
      setTestEmailForm({ email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: Template) => {
    if (activeTab === 'email') {
      setEmailForm({
        ...emailForm,
        subject: template.title,
        message: template.message,
      });
    } else if (activeTab === 'notification') {
      setNotificationForm({
        ...notificationForm,
        title: template.title,
        message: template.message,
        type: template.type,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 mt-2">Send emails and notifications to users</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {emailStats && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Email Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sent:</span>
                  <span className="font-semibold">{emailStats.totalSent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered:</span>
                  <span className="font-semibold text-green-600">{emailStats.delivered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 30 Days:</span>
                  <span className="font-semibold text-blue-600">{emailStats.last30Days.sent}</span>
                </div>
              </div>
            </div>
          )}

          {notificationStats && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Notification Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{notificationStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Read:</span>
                  <span className="font-semibold text-green-600">{notificationStats.read}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unread:</span>
                  <span className="font-semibold text-yellow-600">{notificationStats.unread}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 30 Days:</span>
                  <span className="font-semibold text-blue-600">{notificationStats.last30Days}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('email')}
                className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left"
              >
                📧 Send Broadcast Email
              </button>
              <button
                onClick={() => setActiveTab('notification')}
                className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-left"
              >
                🔔 Send Notification
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-left"
              >
                🧪 Test Email
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {[
                    { id: 'email', label: 'Broadcast Email', icon: '📧' },
                    { id: 'notification', label: 'Broadcast Notification', icon: '🔔' },
                    { id: 'test', label: 'Test Email', icon: '🧪' },
                    { id: 'history', label: 'History', icon: '📜' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Broadcast Email */}
                {activeTab === 'email' && (
                  <form onSubmit={handleSendBroadcastEmail} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Send Broadcast Email</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                      <select
                        value={emailForm.recipientType}
                        onChange={(e) => setEmailForm({ ...emailForm, recipientType: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Users</option>
                        <option value="role">By Role</option>
                      </select>
                    </div>

                    {emailForm.recipientType === 'role' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                          value={emailForm.role}
                          onChange={(e) => setEmailForm({ ...emailForm, role: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="CANDIDATE">Candidates</option>
                          <option value="RECRUITER">Recruiters</option>
                          <option value="ADMIN">Admins</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <input
                        type="text"
                        value={emailForm.subject}
                        onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        value={emailForm.message}
                        onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                        required
                        rows={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Broadcast Email'}
                    </button>
                  </form>
                )}

                {/* Broadcast Notification */}
                {activeTab === 'notification' && (
                  <form onSubmit={handleSendBroadcastNotification} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Send Broadcast Notification</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                      <select
                        value={notificationForm.recipientType}
                        onChange={(e) => setNotificationForm({ ...notificationForm, recipientType: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Users</option>
                        <option value="role">By Role</option>
                      </select>
                    </div>

                    {notificationForm.recipientType === 'role' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                          value={notificationForm.role}
                          onChange={(e) => setNotificationForm({ ...notificationForm, role: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="CANDIDATE">Candidates</option>
                          <option value="RECRUITER">Recruiters</option>
                          <option value="ADMIN">Admins</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="APPLICATION_STATUS">Application Status</option>
                        <option value="JOB_POSTED">Job Posted</option>
                        <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                        <option value="MESSAGE_RECEIVED">Message Received</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link (optional)</label>
                      <input
                        type="text"
                        value={notificationForm.link}
                        onChange={(e) => setNotificationForm({ ...notificationForm, link: e.target.value })}
                        placeholder="/jobs/123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Broadcast Notification'}
                    </button>
                  </form>
                )}

                {/* Test Email */}
                {activeTab === 'test' && (
                  <form onSubmit={handleSendTestEmail} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Send Test Email</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email *</label>
                      <input
                        type="email"
                        value={testEmailForm.email}
                        onChange={(e) => setTestEmailForm({ ...testEmailForm, email: e.target.value })}
                        required
                        placeholder="test@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <input
                        type="text"
                        value={testEmailForm.subject}
                        onChange={(e) => setTestEmailForm({ ...testEmailForm, subject: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        value={testEmailForm.message}
                        onChange={(e) => setTestEmailForm({ ...testEmailForm, message: e.target.value })}
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Test Email'}
                    </button>
                  </form>
                )}

                {/* History */}
                {activeTab === 'history' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Communication History</h3>
                    <div className="space-y-3">
                      {history.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No communication history yet</p>
                      ) : (
                        history.map((item, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{item.title}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.message}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {item.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.recipients.length} recipients
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Templates Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Templates</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.title}</div>
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.variables.map((variable, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {variable}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunication;
