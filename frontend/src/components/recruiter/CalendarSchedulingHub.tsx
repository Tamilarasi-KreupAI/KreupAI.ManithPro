import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarIntegration,
  CalendarEvent,
  CalendarConflict,
  BufferTimeSettings,
  WorkingHours,
  Holiday,
  SchedulingLink,
  SchedulingBooking,
  AvailabilitySlot,
  PanelSession,
  TimezonePreference,
  CalendarProvider,
  DayOfWeek,
  MeetingType,
  PanelSessionStatus,
} from '../../types';
import {
  calendarAPI,
  conflictAPI,
  bufferTimeAPI,
  workingHoursAPI,
  holidayAPI,
  schedulingLinkAPI,
  availabilityAPI,
  panelAPI,
  timezoneAPI,
} from '../../services/batch15CalendarSchedulingAPI';

type TabType = 'calendars' | 'working-hours' | 'holidays' | 'scheduling-links' | 'panel-sessions' | 'timezone';

const CalendarSchedulingHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('calendars');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar Integrations State
  const [calendars, setCalendars] = useState<CalendarIntegration[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [conflicts, setConflicts] = useState<CalendarConflict[]>([]);
  const [connectProvider, setConnectProvider] = useState<CalendarProvider>('GOOGLE');

  // Buffer Time State
  const [bufferSettings, setBufferSettings] = useState<BufferTimeSettings | null>(null);
  const [bufferForm, setBufferForm] = useState({
    defaultBufferBefore: 15,
    defaultBufferAfter: 15,
    enableTravelTime: false,
    maxMeetingsPerDay: 8,
  });

  // Working Hours State
  const [workingHoursList, setWorkingHoursList] = useState<WorkingHours[]>([]);
  const [workingHoursForm, setWorkingHoursForm] = useState({
    dayOfWeek: 'MONDAY' as DayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
    isWorkingDay: true,
    breaks: [] as { start: string; end: string }[],
  });

  // Holidays State
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    isRecurring: false,
    scope: 'PERSONAL' as 'PERSONAL' | 'COMPANY' | 'REGIONAL',
    region: '',
  });

  // Scheduling Links State
  const [schedulingLinks, setSchedulingLinks] = useState<SchedulingLink[]>([]);
  const [bookings, setBookings] = useState<SchedulingBooking[]>([]);
  const [linkForm, setLinkForm] = useState({
    title: '',
    description: '',
    duration: 30,
    meetingType: 'INTERVIEW' as MeetingType,
    bufferBefore: 10,
    bufferAfter: 10,
    maxBookingsPerDay: 5,
    advanceBookingDays: 14,
    minimumNotice: 24,
    allowReschedule: true,
    allowCancel: true,
  });

  // Panel Sessions State
  const [panelSessions, setPanelSessions] = useState<PanelSession[]>([]);
  const [panelForm, setPanelForm] = useState({
    title: '',
    description: '',
    duration: 60,
    panelMemberIds: '',
    deadline: '',
  });

  // Timezone State
  const [timezonePrefs, setTimezonePrefs] = useState<TimezonePreference | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadCalendars();
    loadWorkingHours();
    loadHolidays();
    loadSchedulingLinks();
    loadPanelSessions();
    loadTimezonePrefs();
    loadBufferSettings();
  }, []);

  const loadCalendars = async () => {
    try {
      const data = await calendarAPI.getIntegrations();
      setCalendars(data);
    } catch (err) {
      console.error('Failed to load calendars', err);
    }
  };

  const loadWorkingHours = async () => {
    try {
      const data = await workingHoursAPI.get();
      setWorkingHoursList(data);
    } catch (err) {
      console.error('Failed to load working hours', err);
    }
  };

  const loadHolidays = async () => {
    try {
      const data = await holidayAPI.getAll();
      setHolidays(data);
    } catch (err) {
      console.error('Failed to load holidays', err);
    }
  };

  const loadSchedulingLinks = async () => {
    try {
      const data = await schedulingLinkAPI.getAll();
      setSchedulingLinks(data);
      const bookingsData = await schedulingLinkAPI.getBookings();
      setBookings(bookingsData);
    } catch (err) {
      console.error('Failed to load scheduling links', err);
    }
  };

  const loadPanelSessions = async () => {
    try {
      const data = await panelAPI.getSessions();
      setPanelSessions(data);
    } catch (err) {
      console.error('Failed to load panel sessions', err);
    }
  };

  const loadTimezonePrefs = async () => {
    try {
      const data = await timezoneAPI.getPreferences();
      setTimezonePrefs(data);
      if (data?.timezone) {
        setSelectedTimezone(data.timezone);
      }
    } catch (err) {
      console.error('Failed to load timezone preferences', err);
    }
  };

  const loadBufferSettings = async () => {
    try {
      const data = await bufferTimeAPI.getSettings();
      setBufferSettings(data);
      if (data) {
        setBufferForm({
          defaultBufferBefore: data.defaultBufferBefore,
          defaultBufferAfter: data.defaultBufferAfter,
          enableTravelTime: data.enableTravelTime,
          maxMeetingsPerDay: data.maxMeetingsPerDay || 8,
        });
      }
    } catch (err) {
      console.error('Failed to load buffer settings', err);
    }
  };

  const handleConnectCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await calendarAPI.connect(connectProvider);
      setCalendars([...calendars, result]);
    } catch (err: any) {
      setError(err.message || 'Failed to connect calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectCalendar = async (id: string) => {
    setLoading(true);
    try {
      await calendarAPI.disconnect(id);
      setCalendars(calendars.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCalendar = async (id: string) => {
    setLoading(true);
    try {
      await calendarAPI.sync(id);
      await loadCalendars();
    } catch (err: any) {
      setError(err.message || 'Failed to sync calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectConflicts = async () => {
    setLoading(true);
    try {
      const result = await conflictAPI.detect({
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setConflicts(result);
    } catch (err: any) {
      setError(err.message || 'Failed to detect conflicts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBufferSettings = async () => {
    setLoading(true);
    try {
      const result = await bufferTimeAPI.updateSettings(bufferForm);
      setBufferSettings(result);
    } catch (err: any) {
      setError(err.message || 'Failed to save buffer settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkingHours = async () => {
    setLoading(true);
    try {
      const result = await workingHoursAPI.create(workingHoursForm);
      setWorkingHoursList([...workingHoursList, result]);
    } catch (err: any) {
      setError(err.message || 'Failed to create working hours');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!holidayForm.name || !holidayForm.date) return;
    setLoading(true);
    try {
      const result = await holidayAPI.add({
        ...holidayForm,
        date: new Date(holidayForm.date),
      });
      setHolidays([...holidays, result]);
      setHolidayForm({ name: '', date: '', isRecurring: false, scope: 'PERSONAL', region: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleImportHolidays = async (region: string) => {
    setLoading(true);
    try {
      const imported = await holidayAPI.importForRegion(region, new Date().getFullYear());
      setHolidays([...holidays, ...imported]);
    } catch (err: any) {
      setError(err.message || 'Failed to import holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedulingLink = async () => {
    if (!linkForm.title) return;
    setLoading(true);
    try {
      const result = await schedulingLinkAPI.create(linkForm);
      setSchedulingLinks([...schedulingLinks, result]);
      setLinkForm({
        title: '',
        description: '',
        duration: 30,
        meetingType: 'INTERVIEW',
        bufferBefore: 10,
        bufferAfter: 10,
        maxBookingsPerDay: 5,
        advanceBookingDays: 14,
        minimumNotice: 24,
        allowReschedule: true,
        allowCancel: true,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create scheduling link');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePanelSession = async () => {
    if (!panelForm.title) return;
    setLoading(true);
    try {
      const result = await panelAPI.createSession({
        ...panelForm,
        panelMemberIds: panelForm.panelMemberIds.split(',').map(s => s.trim()).filter(Boolean),
        deadline: panelForm.deadline ? new Date(panelForm.deadline) : undefined,
      });
      setPanelSessions([...panelSessions, result]);
      setPanelForm({ title: '', description: '', duration: 60, panelMemberIds: '', deadline: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create panel session');
    } finally {
      setLoading(false);
    }
  };

  const handleFindOptimalTime = async (sessionId: string) => {
    setLoading(true);
    try {
      const result = await panelAPI.findOptimalTime(sessionId);
      alert(`Optimal time found: ${new Date(result.suggestedTime).toLocaleString()}\nAvailability: ${result.availableCount}/${result.totalPanelists}`);
    } catch (err: any) {
      setError(err.message || 'Failed to find optimal time');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectTimezone = async () => {
    setLoading(true);
    try {
      const result = await timezoneAPI.detect();
      setDetectedTimezone(result.timezone);
      setSelectedTimezone(result.timezone);
    } catch (err: any) {
      setError(err.message || 'Failed to detect timezone');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTimezone = async () => {
    setLoading(true);
    try {
      const result = await timezoneAPI.updatePreferences({
        timezone: selectedTimezone,
        autoDetect: true,
        use24HourFormat: false,
        showMultipleTimezones: true,
      });
      setTimezonePrefs(result);
    } catch (err: any) {
      setError(err.message || 'Failed to update timezone');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: CalendarProvider): string => {
    switch (provider) {
      case 'GOOGLE': return '📅';
      case 'OUTLOOK': return '📧';
      case 'APPLE': return '🍎';
      case 'ICAL': return '📆';
      case 'CALDAV': return '🔗';
      default: return '📅';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CONNECTED':
      case 'CONFIRMED':
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
      case 'SYNCING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'ERROR':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const tabs = [
    { id: 'calendars' as TabType, label: 'Calendars', icon: '📅' },
    { id: 'working-hours' as TabType, label: 'Working Hours', icon: '⏰' },
    { id: 'holidays' as TabType, label: 'Holidays', icon: '🎉' },
    { id: 'scheduling-links' as TabType, label: 'Scheduling Links', icon: '🔗' },
    { id: 'panel-sessions' as TabType, label: 'Panel Interviews', icon: '👥' },
    { id: 'timezone' as TabType, label: 'Timezone', icon: '🌍' },
  ];

  const renderCalendarsTab = () => (
    <div className="space-y-6">
      {/* Connect Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connect Calendar
        </h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Calendar Provider
            </label>
            <select
              value={connectProvider}
              onChange={(e) => setConnectProvider(e.target.value as CalendarProvider)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="GOOGLE">Google Calendar</option>
              <option value="OUTLOOK">Microsoft Outlook</option>
              <option value="APPLE">Apple Calendar</option>
              <option value="ICAL">iCal Feed</option>
              <option value="CALDAV">CalDAV</option>
            </select>
          </div>
          <button
            onClick={handleConnectCalendar}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Connected Calendars */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Connected Calendars ({calendars.length})
          </h3>
          <button
            onClick={handleDetectConflicts}
            disabled={loading}
            className="px-4 py-2 text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-lg hover:bg-orange-200"
          >
            Detect Conflicts
          </button>
        </div>

        {calendars.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No calendars connected. Connect a calendar to start syncing events.
          </p>
        ) : (
          <div className="space-y-3">
            {calendars.map((cal) => (
              <div
                key={cal.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getProviderIcon(cal.provider)}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {cal.calendarName || cal.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {cal.provider} • Last synced: {cal.lastSyncAt ? new Date(cal.lastSyncAt).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(cal.syncStatus)}`}>
                    {cal.syncStatus}
                  </span>
                  <button
                    onClick={() => handleSyncCalendar(cal.id)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Sync
                  </button>
                  <button
                    onClick={() => handleDisconnectCalendar(cal.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-red-200 dark:border-red-700">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
            Scheduling Conflicts ({conflicts.length})
          </h3>
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    conflict.severity === 'HIGH' ? 'bg-red-200 text-red-800' :
                    conflict.severity === 'MEDIUM' ? 'bg-orange-200 text-orange-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {conflict.severity}
                  </span>
                  <span className="text-sm text-gray-500">{conflict.conflictType}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{conflict.description}</p>
                {conflict.suggestedResolution && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Suggestion: {conflict.suggestedResolution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buffer Time Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Buffer Time Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buffer Before Meetings (min)
            </label>
            <input
              type="number"
              value={bufferForm.defaultBufferBefore}
              onChange={(e) => setBufferForm({ ...bufferForm, defaultBufferBefore: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buffer After Meetings (min)
            </label>
            <input
              type="number"
              value={bufferForm.defaultBufferAfter}
              onChange={(e) => setBufferForm({ ...bufferForm, defaultBufferAfter: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Meetings Per Day
            </label>
            <input
              type="number"
              value={bufferForm.maxMeetingsPerDay}
              onChange={(e) => setBufferForm({ ...bufferForm, maxMeetingsPerDay: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bufferForm.enableTravelTime}
                onChange={(e) => setBufferForm({ ...bufferForm, enableTravelTime: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable Travel Time</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleSaveBufferSettings}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderWorkingHoursTab = () => (
    <div className="space-y-6">
      {/* Add Working Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configure Working Hours
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Day of Week
            </label>
            <select
              value={workingHoursForm.dayOfWeek}
              onChange={(e) => setWorkingHoursForm({ ...workingHoursForm, dayOfWeek: e.target.value as DayOfWeek })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={workingHoursForm.startTime}
              onChange={(e) => setWorkingHoursForm({ ...workingHoursForm, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={workingHoursForm.endTime}
              onChange={(e) => setWorkingHoursForm({ ...workingHoursForm, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreateWorkingHours}
              disabled={loading}
              className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Working Hours List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Schedule
        </h3>
        {workingHoursList.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No working hours configured. Add your availability above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
              const dayHours = workingHoursList.filter(wh => wh.dayOfWeek === day);
              return (
                <div
                  key={day}
                  className={`p-4 rounded-lg ${
                    dayHours.length > 0 && dayHours[0].isWorkingDay
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-2">{day}</div>
                  {dayHours.length > 0 ? (
                    dayHours.map((wh, idx) => (
                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        {wh.isWorkingDay ? (
                          <span className="text-green-600 dark:text-green-400">
                            {wh.startTime} - {wh.endTime}
                          </span>
                        ) : (
                          <span className="text-gray-500">Not working</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">Not configured</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderHolidaysTab = () => (
    <div className="space-y-6">
      {/* Add Holiday */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Holiday
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Holiday Name *
            </label>
            <input
              type="text"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              placeholder="e.g., Christmas"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={holidayForm.date}
              onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scope
            </label>
            <select
              value={holidayForm.scope}
              onChange={(e) => setHolidayForm({ ...holidayForm, scope: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="PERSONAL">Personal</option>
              <option value="COMPANY">Company</option>
              <option value="REGIONAL">Regional</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddHoliday}
              disabled={loading || !holidayForm.name || !holidayForm.date}
              className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Holiday
            </button>
          </div>
        </div>
      </div>

      {/* Import Regional Holidays */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Import Regional Holidays
        </h3>
        <div className="flex flex-wrap gap-2">
          {['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IN', 'JP'].map((region) => (
            <button
              key={region}
              onClick={() => handleImportHolidays(region)}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {region} Holidays
            </button>
          ))}
        </div>
      </div>

      {/* Holidays List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Holidays ({holidays.length})
        </h3>
        {holidays.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No holidays added. Add holidays manually or import from a region.
          </p>
        ) : (
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{holiday.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(holiday.date).toLocaleDateString()}
                    {holiday.isRecurring && ' (Recurring)'}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  holiday.scope === 'PERSONAL' ? 'bg-blue-100 text-blue-800' :
                  holiday.scope === 'COMPANY' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {holiday.scope}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSchedulingLinksTab = () => (
    <div className="space-y-6">
      {/* Create Scheduling Link */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Scheduling Link
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link Title *
            </label>
            <input
              type="text"
              value={linkForm.title}
              onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
              placeholder="e.g., 30 Min Interview"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meeting Type
            </label>
            <select
              value={linkForm.meetingType}
              onChange={(e) => setLinkForm({ ...linkForm, meetingType: e.target.value as MeetingType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="INTERVIEW">Interview</option>
              <option value="SCREENING">Screening Call</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="ONE_ON_ONE">1:1 Meeting</option>
              <option value="TEAM_MEETING">Team Meeting</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={linkForm.duration}
              onChange={(e) => setLinkForm({ ...linkForm, duration: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Advance Booking (days)
            </label>
            <input
              type="number"
              value={linkForm.advanceBookingDays}
              onChange={(e) => setLinkForm({ ...linkForm, advanceBookingDays: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Notice (hours)
            </label>
            <input
              type="number"
              value={linkForm.minimumNotice}
              onChange={(e) => setLinkForm({ ...linkForm, minimumNotice: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Bookings/Day
            </label>
            <input
              type="number"
              value={linkForm.maxBookingsPerDay}
              onChange={(e) => setLinkForm({ ...linkForm, maxBookingsPerDay: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={linkForm.description}
              onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
              placeholder="Brief description for candidates..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleCreateSchedulingLink}
          disabled={loading || !linkForm.title}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Create Link
        </button>
      </div>

      {/* Scheduling Links List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Scheduling Links ({schedulingLinks.length})
        </h3>
        {schedulingLinks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No scheduling links created. Create one to let candidates book interviews.
          </p>
        ) : (
          <div className="space-y-4">
            {schedulingLinks.map((link) => (
              <div
                key={link.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">{link.title}</div>
                  <span className={`px-2 py-1 text-xs rounded ${link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {link.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {link.duration} min • {link.meetingType} • Max {link.maxBookingsPerDay}/day
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded text-sm text-indigo-600 dark:text-indigo-400">
                    {window.location.origin}/schedule/{link.slug}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/schedule/${link.slug}`)}
                    className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded hover:bg-indigo-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Bookings ({bookings.length})
        </h3>
        {bookings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No bookings yet. Share your scheduling links to receive bookings.
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {booking.inviteeName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(booking.startTime).toLocaleString()} • {booking.inviteeEmail}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPanelSessionsTab = () => (
    <div className="space-y-6">
      {/* Create Panel Session */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Panel Interview Session
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Title *
            </label>
            <input
              type="text"
              value={panelForm.title}
              onChange={(e) => setPanelForm({ ...panelForm, title: e.target.value })}
              placeholder="e.g., Technical Panel - Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={panelForm.duration}
              onChange={(e) => setPanelForm({ ...panelForm, duration: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Panel Member IDs (comma-separated)
            </label>
            <input
              type="text"
              value={panelForm.panelMemberIds}
              onChange={(e) => setPanelForm({ ...panelForm, panelMemberIds: e.target.value })}
              placeholder="user-id-1, user-id-2, user-id-3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Response Deadline
            </label>
            <input
              type="datetime-local"
              value={panelForm.deadline}
              onChange={(e) => setPanelForm({ ...panelForm, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={panelForm.description}
              onChange={(e) => setPanelForm({ ...panelForm, description: e.target.value })}
              placeholder="Details about the panel interview..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleCreatePanelSession}
          disabled={loading || !panelForm.title}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Create Panel Session
        </button>
      </div>

      {/* Panel Sessions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Panel Sessions ({panelSessions.length})
        </h3>
        {panelSessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No panel sessions created. Create one to coordinate panel interviews.
          </p>
        ) : (
          <div className="space-y-4">
            {panelSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{session.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {session.duration} min • {session.panelMembers?.length || 0} panelists
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                {session.panelMembers && session.panelMembers.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Panelists:</div>
                    <div className="flex flex-wrap gap-2">
                      {session.panelMembers.map((member) => (
                        <span
                          key={member.id}
                          className={`px-2 py-1 text-xs rounded ${
                            member.hasResponded
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {member.userId.slice(0, 8)}... {member.hasResponded ? '(Responded)' : '(Pending)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {session.scheduledTime && (
                  <div className="text-sm text-green-600 dark:text-green-400 mb-3">
                    Scheduled: {new Date(session.scheduledTime).toLocaleString()}
                  </div>
                )}

                <div className="flex gap-2">
                  {session.status === 'COLLECTING_AVAILABILITY' && (
                    <button
                      onClick={() => handleFindOptimalTime(session.id)}
                      disabled={loading}
                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Find Optimal Time
                    </button>
                  )}
                  <button
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTimezoneTab = () => (
    <div className="space-y-6">
      {/* Timezone Detection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Timezone Settings
        </h3>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Current Timezone</div>
              <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                {timezonePrefs?.timezone || selectedTimezone}
              </div>
              {detectedTimezone && detectedTimezone !== selectedTimezone && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Detected: {detectedTimezone}
                </div>
              )}
            </div>
            <button
              onClick={handleDetectTimezone}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Auto-Detect
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timezone
            </label>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <optgroup label="Americas">
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Toronto">Toronto</option>
                <option value="America/Vancouver">Vancouver</option>
                <option value="America/Sao_Paulo">Sao Paulo</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Europe/Berlin">Berlin (CET)</option>
                <option value="Europe/Amsterdam">Amsterdam (CET)</option>
                <option value="Europe/Moscow">Moscow (MSK)</option>
              </optgroup>
              <optgroup label="Asia">
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
                <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Kolkata">India (IST)</option>
              </optgroup>
              <optgroup label="Pacific">
                <option value="Australia/Sydney">Sydney (AEST)</option>
                <option value="Australia/Melbourne">Melbourne (AEST)</option>
                <option value="Pacific/Auckland">Auckland (NZST)</option>
              </optgroup>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleUpdateTimezone}
              disabled={loading}
              className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Save Timezone
            </button>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      {timezonePrefs && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Display Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Auto-Detect Timezone</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically detect and suggest timezone based on location
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                timezonePrefs.autoDetect ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {timezonePrefs.autoDetect ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">24-Hour Format</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Display times in 24-hour format instead of AM/PM
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                timezonePrefs.use24HourFormat ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {timezonePrefs.use24HourFormat ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Show Multiple Timezones</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Display candidate's timezone alongside your own
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                timezonePrefs.showMultipleTimezones ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {timezonePrefs.showMultipleTimezones ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current Time Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          World Clock
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { tz: 'America/New_York', label: 'New York' },
            { tz: 'Europe/London', label: 'London' },
            { tz: 'Asia/Tokyo', label: 'Tokyo' },
            { tz: 'Australia/Sydney', label: 'Sydney' },
          ].map(({ tz, label }) => (
            <div key={tz} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {new Date().toLocaleTimeString('en-US', {
                  timeZone: tz,
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendar & Scheduling Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage calendars, working hours, scheduling links, and panel interviews
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
        {activeTab === 'calendars' && renderCalendarsTab()}
        {activeTab === 'working-hours' && renderWorkingHoursTab()}
        {activeTab === 'holidays' && renderHolidaysTab()}
        {activeTab === 'scheduling-links' && renderSchedulingLinksTab()}
        {activeTab === 'panel-sessions' && renderPanelSessionsTab()}
        {activeTab === 'timezone' && renderTimezoneTab()}
      </div>
    </div>
  );
};

export default CalendarSchedulingHub;
