import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ReminderSchedule,
  NotificationChannel,
  ReminderNotification,
  ConfirmationRequest,
  PrepMaterial,
  NotificationPreference,
  NotificationStats,
  NotificationChannelType,
  PrepMaterialType,
} from '../../types';
import {
  reminderScheduleAPI,
  notificationChannelAPI,
  reminderAPI,
  confirmationAPI,
  prepMaterialAPI,
  notificationPrefsAPI,
  notificationUtilAPI,
} from '../../services/batch16RemindersNotificationsAPI';

type TabType = 'schedules' | 'channels' | 'reminders' | 'confirmations' | 'prep-materials' | 'preferences';

const RemindersNotificationsHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('schedules');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [schedules, setSchedules] = useState<ReminderSchedule[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [reminders, setReminders] = useState<ReminderNotification[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRequest[]>([]);
  const [prepMaterials, setPrepMaterials] = useState<PrepMaterial[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);

  // Form States
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    description: '',
    reminderTimes: '1440,60,15',
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    pushEnabled: true,
    isDefault: false,
  });

  const [channelForm, setChannelForm] = useState({
    channelType: 'EMAIL' as NotificationChannelType,
    emailAddress: '',
    phoneNumber: '',
    phoneCountryCode: '+1',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const [prepForm, setPrepForm] = useState({
    title: '',
    description: '',
    materialType: 'DOCUMENT' as PrepMaterialType,
    content: '',
    externalUrl: '',
    category: 'COMPANY_INFO',
    tags: '',
    sendAutomatically: true,
    hoursBefore: 24,
  });

  // Load data on mount
  useEffect(() => {
    loadSchedules();
    loadChannels();
    loadReminders();
    loadConfirmations();
    loadPrepMaterials();
    loadPreferences();
    loadStats();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await reminderScheduleAPI.getAll();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to load schedules', err);
    }
  };

  const loadChannels = async () => {
    try {
      const data = await notificationChannelAPI.getAll();
      setChannels(data);
    } catch (err) {
      console.error('Failed to load channels', err);
    }
  };

  const loadReminders = async () => {
    try {
      const data = await reminderAPI.getUpcoming();
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders', err);
    }
  };

  const loadConfirmations = async () => {
    try {
      const data = await confirmationAPI.getAll();
      setConfirmations(data);
    } catch (err) {
      console.error('Failed to load confirmations', err);
    }
  };

  const loadPrepMaterials = async () => {
    try {
      const data = await prepMaterialAPI.getAll();
      setPrepMaterials(data);
    } catch (err) {
      console.error('Failed to load prep materials', err);
    }
  };

  const loadPreferences = async () => {
    try {
      const data = await notificationPrefsAPI.get();
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load preferences', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await notificationUtilAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const handleCreateSchedule = async () => {
    if (!scheduleForm.name) return;
    setLoading(true);
    setError(null);
    try {
      const result = await reminderScheduleAPI.create({
        ...scheduleForm,
        reminderTimes: scheduleForm.reminderTimes.split(',').map(t => parseInt(t.trim())),
      });
      setSchedules([...schedules, result]);
      setScheduleForm({
        name: '',
        description: '',
        reminderTimes: '1440,60,15',
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: false,
        pushEnabled: true,
        isDefault: false,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    setLoading(true);
    try {
      await reminderScheduleAPI.delete(id);
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleUpsertChannel = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationChannelAPI.upsert(channelForm);
      const existingIdx = channels.findIndex(c => c.channelType === result.channelType);
      if (existingIdx >= 0) {
        channels[existingIdx] = result;
        setChannels([...channels]);
      } else {
        setChannels([...channels, result]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update channel');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async (channelType: string) => {
    setLoading(true);
    try {
      await notificationChannelAPI.sendVerificationCode(channelType);
      alert(`Verification code sent to your ${channelType.toLowerCase()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReminder = async (id: string) => {
    setLoading(true);
    try {
      await reminderAPI.cancel(id);
      setReminders(reminders.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
    } catch (err: any) {
      setError(err.message || 'Failed to cancel reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async (id: string) => {
    setLoading(true);
    try {
      await confirmationAPI.resend(id);
      alert('Confirmation request resent');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrepMaterial = async () => {
    if (!prepForm.title) return;
    setLoading(true);
    setError(null);
    try {
      const result = await prepMaterialAPI.create({
        ...prepForm,
        tags: prepForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setPrepMaterials([...prepMaterials, result]);
      setPrepForm({
        title: '',
        description: '',
        materialType: 'DOCUMENT',
        content: '',
        externalUrl: '',
        category: 'COMPANY_INFO',
        tags: '',
        sendAutomatically: true,
        hoursBefore: 24,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create prep material');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrepMaterial = async (id: string) => {
    setLoading(true);
    try {
      await prepMaterialAPI.delete(id);
      setPrepMaterials(prepMaterials.filter(m => m.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete prep material');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreference>) => {
    setLoading(true);
    try {
      const result = await notificationPrefsAPI.update(updates);
      setPreferences(result);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async (channel: string) => {
    setLoading(true);
    try {
      await notificationUtilAPI.sendTest(channel, 'INTERVIEW_REMINDER');
      alert(`Test notification sent via ${channel}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send test');
    } finally {
      setLoading(false);
    }
  };

  const formatMinutesToReadable = (minutes: number): string => {
    if (minutes >= 1440) return `${Math.floor(minutes / 1440)}d`;
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'SENT':
      case 'CONFIRMED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'DELIVERED':
      case 'VIEWED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'FAILED':
      case 'DECLINED':
      case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (type: NotificationChannelType): string => {
    switch (type) {
      case 'EMAIL': return '📧';
      case 'SMS': return '📱';
      case 'WHATSAPP': return '💬';
      case 'PUSH': return '🔔';
      case 'IN_APP': return '📲';
      default: return '📢';
    }
  };

  const tabs = [
    { id: 'schedules' as TabType, label: 'Reminder Schedules', icon: '⏰' },
    { id: 'channels' as TabType, label: 'Channels', icon: '📡' },
    { id: 'reminders' as TabType, label: 'Upcoming Reminders', icon: '🔔' },
    { id: 'confirmations' as TabType, label: 'Confirmations', icon: '✅' },
    { id: 'prep-materials' as TabType, label: 'Prep Materials', icon: '📚' },
    { id: 'preferences' as TabType, label: 'Preferences', icon: '⚙️' },
  ];

  const renderSchedulesTab = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-indigo-600">{stats.total.sent}</div>
            <div className="text-sm text-gray-500">Sent</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">{stats.total.delivered}</div>
            <div className="text-sm text-gray-500">Delivered</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">{stats.deliveryRate}%</div>
            <div className="text-sm text-gray-500">Delivery Rate</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600">{stats.openRate}%</div>
            <div className="text-sm text-gray-500">Open Rate</div>
          </div>
        </div>
      )}

      {/* Create Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Reminder Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Schedule Name *
            </label>
            <input
              type="text"
              value={scheduleForm.name}
              onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
              placeholder="e.g., Standard Interview Reminder"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reminder Times (minutes before, comma-separated)
            </label>
            <input
              type="text"
              value={scheduleForm.reminderTimes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, reminderTimes: e.target.value })}
              placeholder="1440,60,15"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Example: 1440 = 24h, 60 = 1h, 15 = 15min</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={scheduleForm.description}
              onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
              placeholder="Optional description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleForm.emailEnabled}
                onChange={(e) => setScheduleForm({ ...scheduleForm, emailEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleForm.smsEnabled}
                onChange={(e) => setScheduleForm({ ...scheduleForm, smsEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleForm.whatsappEnabled}
                onChange={(e) => setScheduleForm({ ...scheduleForm, whatsappEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">WhatsApp</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleForm.pushEnabled}
                onChange={(e) => setScheduleForm({ ...scheduleForm, pushEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Push</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleForm.isDefault}
                onChange={(e) => setScheduleForm({ ...scheduleForm, isDefault: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Set as Default</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleCreateSchedule}
          disabled={loading || !scheduleForm.name}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Create Schedule
        </button>
      </div>

      {/* Existing Schedules */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Reminder Schedules ({schedules.length})
        </h3>
        {schedules.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No reminder schedules configured. Create one above.
          </p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{schedule.name}</span>
                    {schedule.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded">Default</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Reminders: {(schedule.reminderTimes as number[]).map(formatMinutesToReadable).join(', ')} before
                  </div>
                  <div className="flex gap-2 mt-2">
                    {schedule.emailEnabled && <span className="text-xs">📧 Email</span>}
                    {schedule.smsEnabled && <span className="text-xs">📱 SMS</span>}
                    {schedule.whatsappEnabled && <span className="text-xs">💬 WhatsApp</span>}
                    {schedule.pushEnabled && <span className="text-xs">🔔 Push</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {schedule.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderChannelsTab = () => (
    <div className="space-y-6">
      {/* Configure Channel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configure Notification Channel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Channel Type
            </label>
            <select
              value={channelForm.channelType}
              onChange={(e) => setChannelForm({ ...channelForm, channelType: e.target.value as NotificationChannelType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PUSH">Push Notifications</option>
            </select>
          </div>

          {channelForm.channelType === 'EMAIL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={channelForm.emailAddress}
                onChange={(e) => setChannelForm({ ...channelForm, emailAddress: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {(channelForm.channelType === 'SMS' || channelForm.channelType === 'WHATSAPP') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country Code
                </label>
                <select
                  value={channelForm.phoneCountryCode}
                  onChange={(e) => setChannelForm({ ...channelForm, phoneCountryCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="+1">+1 (US/Canada)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (India)</option>
                  <option value="+61">+61 (Australia)</option>
                  <option value="+49">+49 (Germany)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={channelForm.phoneNumber}
                  onChange={(e) => setChannelForm({ ...channelForm, phoneNumber: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channelForm.quietHoursEnabled}
                onChange={(e) => setChannelForm({ ...channelForm, quietHoursEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable Quiet Hours</span>
            </label>
          </div>

          {channelForm.quietHoursEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  value={channelForm.quietHoursStart}
                  onChange={(e) => setChannelForm({ ...channelForm, quietHoursStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  value={channelForm.quietHoursEnd}
                  onChange={(e) => setChannelForm({ ...channelForm, quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleUpsertChannel}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Save Channel
          </button>
          <button
            onClick={() => handleSendTestNotification(channelForm.channelType)}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Send Test
          </button>
        </div>
      </div>

      {/* Active Channels */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Channels ({channels.length})
        </h3>
        {channels.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No channels configured. Add a channel above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getChannelIcon(channel.channelType)}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{channel.channelType}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${channel.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {channel.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {channel.channelType === 'EMAIL' && channel.emailAddress}
                  {(channel.channelType === 'SMS' || channel.channelType === 'WHATSAPP') &&
                    `${channel.phoneCountryCode} ${channel.phoneNumber}`}
                  {channel.channelType === 'PUSH' && `Platform: ${channel.pushPlatform || 'WEB'}`}
                </div>
                {channel.channelType !== 'PUSH' && (
                  <div className="mt-2">
                    {channel.emailVerified || channel.phoneVerified || channel.whatsappVerified ? (
                      <span className="text-xs text-green-600">Verified</span>
                    ) : (
                      <button
                        onClick={() => handleSendVerification(channel.channelType)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        Verify Now
                      </button>
                    )}
                  </div>
                )}
                {channel.quietHoursEnabled && (
                  <div className="mt-2 text-xs text-gray-500">
                    Quiet: {channel.quietHoursStart} - {channel.quietHoursEnd}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderRemindersTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming Reminders ({reminders.filter(r => r.status === 'PENDING').length})
        </h3>
        {reminders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No upcoming reminders scheduled.
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getChannelIcon(reminder.channel)}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reminder.reminderType.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(reminder.status)}`}>
                      {reminder.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Scheduled: {new Date(reminder.scheduledFor).toLocaleString()}
                  </div>
                  {reminder.subject && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {reminder.subject}
                    </div>
                  )}
                </div>
                {reminder.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelReminder(reminder.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderConfirmationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmation Requests ({confirmations.length})
        </h3>
        {confirmations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No confirmation requests.
          </p>
        ) : (
          <div className="space-y-4">
            {confirmations.map((conf) => (
              <div
                key={conf.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {conf.requestType} Request
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(conf.status)}`}>
                      {conf.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Expires: {new Date(conf.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                {conf.message && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{conf.message}</p>
                )}
                <div className="text-xs text-gray-500 mb-2">
                  Sent {conf.notificationsSent}x via {conf.channelsUsed.join(', ')}
                </div>
                {conf.status === 'PENDING' && (
                  <button
                    onClick={() => handleResendConfirmation(conf.id)}
                    disabled={loading}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Resend Request
                  </button>
                )}
                {conf.status === 'CONFIRMED' && conf.respondedAt && (
                  <div className="text-sm text-green-600">
                    Confirmed on {new Date(conf.respondedAt).toLocaleString()}
                  </div>
                )}
                {conf.status === 'DECLINED' && (
                  <div className="text-sm text-red-600">
                    Declined: {conf.declineReason || 'No reason provided'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPrepMaterialsTab = () => (
    <div className="space-y-6">
      {/* Create Prep Material */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Prep Material
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={prepForm.title}
              onChange={(e) => setPrepForm({ ...prepForm, title: e.target.value })}
              placeholder="e.g., Company Overview"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={prepForm.materialType}
              onChange={(e) => setPrepForm({ ...prepForm, materialType: e.target.value as PrepMaterialType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="DOCUMENT">Document</option>
              <option value="VIDEO">Video</option>
              <option value="LINK">Link</option>
              <option value="CHECKLIST">Checklist</option>
              <option value="GUIDE">Guide</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={prepForm.category}
              onChange={(e) => setPrepForm({ ...prepForm, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="COMPANY_INFO">Company Info</option>
              <option value="ROLE_INFO">Role Info</option>
              <option value="INTERVIEW_TIPS">Interview Tips</option>
              <option value="TECHNICAL_PREP">Technical Prep</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hours Before Interview
            </label>
            <input
              type="number"
              value={prepForm.hoursBefore}
              onChange={(e) => setPrepForm({ ...prepForm, hoursBefore: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={prepForm.description}
              onChange={(e) => setPrepForm({ ...prepForm, description: e.target.value })}
              placeholder="Brief description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          {(prepForm.materialType === 'LINK' || prepForm.materialType === 'VIDEO') && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                External URL
              </label>
              <input
                type="url"
                value={prepForm.externalUrl}
                onChange={(e) => setPrepForm({ ...prepForm, externalUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
          {(prepForm.materialType === 'DOCUMENT' || prepForm.materialType === 'GUIDE' || prepForm.materialType === 'CHECKLIST') && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                value={prepForm.content}
                onChange={(e) => setPrepForm({ ...prepForm, content: e.target.value })}
                placeholder="Enter content..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={prepForm.tags}
              onChange={(e) => setPrepForm({ ...prepForm, tags: e.target.value })}
              placeholder="culture, tips, technical"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prepForm.sendAutomatically}
                onChange={(e) => setPrepForm({ ...prepForm, sendAutomatically: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Send Automatically</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleCreatePrepMaterial}
          disabled={loading || !prepForm.title}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Create Material
        </button>
      </div>

      {/* Existing Materials */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Prep Materials ({prepMaterials.length})
        </h3>
        {prepMaterials.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No prep materials created. Add one above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prepMaterials.map((material) => (
              <div
                key={material.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{material.title}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${material.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {material.materialType}
                  </span>
                </div>
                {material.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{material.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Category: {material.category}</span>
                  <span>Views: {material.viewCount}</span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {material.sendAutomatically ? `Auto-send ${material.hoursBefore}h before` : 'Manual send'}
                  </span>
                  <button
                    onClick={() => handleDeletePrepMaterial(material.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {preferences && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Notification Preferences
          </h3>

          {/* Global Toggle */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Notifications Enabled</div>
                <div className="text-sm text-gray-500">Master toggle for all notifications</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notificationsEnabled}
                onChange={(e) => handleUpdatePreferences({ notificationsEnabled: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded"
              />
            </label>
          </div>

          {/* Channel Preferences */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Channel Preferences</h4>
            <div className="space-y-3">
              {[
                { key: 'emailEnabled', label: 'Email Notifications', icon: '📧' },
                { key: 'smsEnabled', label: 'SMS Notifications', icon: '📱' },
                { key: 'whatsappEnabled', label: 'WhatsApp Notifications', icon: '💬' },
                { key: 'pushEnabled', label: 'Push Notifications', icon: '🔔' },
                { key: 'inAppEnabled', label: 'In-App Notifications', icon: '📲' },
              ].map(({ key, label, icon }) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(preferences as any)[key]}
                    onChange={(e) => handleUpdatePreferences({ [key]: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Notification Types */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notification Types</h4>
            <div className="space-y-3">
              {[
                { key: 'interviewReminders', label: 'Interview Reminders' },
                { key: 'applicationUpdates', label: 'Application Updates' },
                { key: 'messageAlerts', label: 'Message Alerts' },
                { key: 'jobAlerts', label: 'Job Alerts' },
                { key: 'systemAnnouncements', label: 'System Announcements' },
                { key: 'confirmationRequests', label: 'Confirmation Requests' },
                { key: 'prepMaterialDelivery', label: 'Prep Material Delivery' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  <input
                    type="checkbox"
                    checked={(preferences as any)[key]}
                    onChange={(e) => handleUpdatePreferences({ [key]: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Digest Mode */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Digest Mode</h4>
            <select
              value={preferences.digestMode}
              onChange={(e) => handleUpdatePreferences({ digestMode: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="INSTANT">Instant (Send immediately)</option>
              <option value="HOURLY">Hourly Digest</option>
              <option value="DAILY">Daily Digest</option>
              <option value="WEEKLY">Weekly Digest</option>
            </select>
          </div>

          {/* Quiet Hours */}
          <div className="mb-6">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quietHoursEnabled}
                onChange={(e) => handleUpdatePreferences({ quietHoursEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="font-medium text-gray-900 dark:text-white">Enable Quiet Hours</span>
            </label>
            {preferences.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Start</label>
                  <input
                    type="time"
                    value={preferences.quietHoursStart || '22:00'}
                    onChange={(e) => handleUpdatePreferences({ quietHoursStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">End</label>
                  <input
                    type="time"
                    value={preferences.quietHoursEnd || '08:00'}
                    onChange={(e) => handleUpdatePreferences({ quietHoursEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reminders & Notifications Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage reminder schedules, notification channels, confirmations, and prep materials
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-700 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'schedules' && renderSchedulesTab()}
        {activeTab === 'channels' && renderChannelsTab()}
        {activeTab === 'reminders' && renderRemindersTab()}
        {activeTab === 'confirmations' && renderConfirmationsTab()}
        {activeTab === 'prep-materials' && renderPrepMaterialsTab()}
        {activeTab === 'preferences' && renderPreferencesTab()}
      </div>
    </div>
  );
};

export default RemindersNotificationsHub;
