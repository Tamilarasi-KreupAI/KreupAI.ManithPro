import React, { useState } from 'react';
import { COMMON_REMINDER_TIMES, ReminderConfig, ReminderTime, reminderService } from '../utils/reminderService';

interface ReminderSettingsProps {
  eventId: string;
  eventType: ReminderConfig['eventType'];
  eventTitle: string;
  eventTime: Date;
  recipientId: string;
  onSave?: (config: ReminderConfig) => void;
}

const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  eventId,
  eventType,
  eventTitle,
  eventTime,
  recipientId,
  onSave,
}) => {
  const [selectedReminders, setSelectedReminders] = useState<ReminderTime[]>([
    COMMON_REMINDER_TIMES[3], // 1 day before
    COMMON_REMINDER_TIMES[5], // 1 hour before
  ]);

  const [selectedChannels, setSelectedChannels] = useState<('EMAIL' | 'PUSH' | 'IN_APP')[]>([
    'IN_APP',
    'PUSH',
  ]);

  const [isActive, setIsActive] = useState(true);

  const toggleReminder = (reminder: ReminderTime) => {
    setSelectedReminders(prev => {
      const exists = prev.find(r => r.offset === reminder.offset);
      if (exists) {
        return prev.filter(r => r.offset !== reminder.offset);
      } else {
        return [...prev, reminder].sort((a, b) => b.offset - a.offset);
      }
    });
  };

  const toggleChannel = (channel: 'EMAIL' | 'PUSH' | 'IN_APP') => {
    setSelectedChannels(prev => {
      if (prev.includes(channel)) {
        return prev.filter(c => c !== channel);
      } else {
        return [...prev, channel];
      }
    });
  };

  const handleSave = () => {
    const config: ReminderConfig = {
      eventId,
      eventType,
      eventTitle,
      eventTime,
      reminderTimes: selectedReminders,
      recipientId,
      notificationChannels: selectedChannels,
      isActive,
    };

    // Schedule the reminder
    reminderService.scheduleReminder(config);

    if (onSave) {
      onSave(config);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'PUSH':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case 'IN_APP':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reminder Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Get notified before your {eventType.toLowerCase()}
        </p>
      </div>

      {/* Active Toggle */}
      <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Enable Reminders</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Turn on/off all reminders for this event</p>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`w-14 h-7 rounded-full transition-colors relative ${
            isActive ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          aria-label="Toggle reminders"
        >
          <div
            className={`w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform ${
              isActive ? 'translate-x-7' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {isActive && (
        <>
          {/* Reminder Times */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Remind Me</h4>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_REMINDER_TIMES.map(reminder => {
                const isSelected = selectedReminders.some(r => r.offset === reminder.offset);
                return (
                  <button
                    key={reminder.offset}
                    onClick={() => toggleReminder(reminder)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    {reminder.label}
                  </button>
                );
              })}
            </div>
            {selectedReminders.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Select at least one reminder time
              </p>
            )}
          </div>

          {/* Notification Channels */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Notify Via</h4>
            <div className="space-y-2">
              {(['EMAIL', 'PUSH', 'IN_APP'] as const).map(channel => {
                const isSelected = selectedChannels.includes(channel);
                return (
                  <button
                    key={channel}
                    onClick={() => toggleChannel(channel)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className={`${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                      {getChannelIcon(channel)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                        {channel === 'EMAIL' && 'Email Notification'}
                        {channel === 'PUSH' && 'Push Notification'}
                        {channel === 'IN_APP' && 'In-App Notification'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {channel === 'EMAIL' && 'Receive email reminders'}
                        {channel === 'PUSH' && 'Get browser notifications'}
                        {channel === 'IN_APP' && 'Show in notification center'}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedChannels.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Select at least one notification channel
              </p>
            )}
          </div>

          {/* Preview */}
          {selectedReminders.length > 0 && selectedChannels.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm">Reminder Schedule</h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                {selectedReminders.map(reminder => (
                  <li key={reminder.offset} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {reminder.label} via {selectedChannels.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!isActive || selectedReminders.length === 0 || selectedChannels.length === 0}
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save Reminder Settings
      </button>
    </div>
  );
};

export default ReminderSettings;
