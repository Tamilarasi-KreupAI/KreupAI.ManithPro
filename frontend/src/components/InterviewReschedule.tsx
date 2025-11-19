import React, { useState } from 'react';
import { interviewAPI } from '../services/api';

interface Interview {
  id: string;
  type: string;
  scheduledAt: string;
  endTime: string;
  timeZone?: string;
  meetingLink?: string;
  location?: string;
  instructions?: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
}

interface InterviewRescheduleProps {
  interview: Interview;
  onReschedule: () => void;
  onCancel: () => void;
}

const InterviewReschedule: React.FC<InterviewRescheduleProps> = ({
  interview,
  onReschedule,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate suggested times (next 7 days, business hours)
  const generateSuggestedTimes = () => {
    const suggestions: { date: string; time: string; label: string }[] = [];
    const now = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Morning slot
      suggestions.push({
        date: dateStr,
        time: '09:00',
        label: `${dayName}, ${monthDay} at 9:00 AM`,
      });

      // Afternoon slot
      suggestions.push({
        date: dateStr,
        time: '14:00',
        label: `${dayName}, ${monthDay} at 2:00 PM`,
      });
    }

    return suggestions.slice(0, 6); // Show first 6 suggestions
  };

  const suggestedTimes = generateSuggestedTimes();

  const handleQuickSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
      const endTime = new Date(scheduledAt);
      endTime.setHours(endTime.getHours() + 1); // Default 1 hour duration

      await interviewAPI.update(interview.id, {
        scheduledAt: scheduledAt.toISOString(),
        endTime: endTime.toISOString(),
        status: 'RESCHEDULED',
      });

      setShowSuccess(true);
      setTimeout(() => {
        onReschedule();
      }, 2000);
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
      alert('Failed to reschedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Interview Rescheduled!</h3>
          <p className="text-gray-600 dark:text-gray-400">
            The candidate has been notified of the new interview time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reschedule Interview</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Interview Details */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current Interview</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Candidate:</span> {interview.candidateName}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Position:</span> {interview.jobTitle}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Type:</span> {interview.type}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Scheduled:</span>{' '}
                {new Date(interview.scheduledAt).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Quick Select Suggestions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Suggested Times</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedTimes.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickSelect(suggestion.date, suggestion.time)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                    selectedDate === suggestion.date && selectedTime === suggestion.time
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{suggestion.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date/Time Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Or Choose Custom Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Reason (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Scheduling conflict, interviewer unavailable..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-medium mb-1">The candidate will be notified automatically</p>
                <p>An email will be sent with the new interview time and meeting details.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewReschedule;
