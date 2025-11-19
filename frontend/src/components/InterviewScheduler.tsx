import React, { useState } from 'react';
import { interviewAPI, CreateInterviewData } from '../services/interviewAPI';

interface InterviewSchedulerProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onScheduled: () => void;
  onCancel: () => void;
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  applicationId,
  candidateName,
  jobTitle,
  onScheduled,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateInterviewData>({
    applicationId,
    type: 'PHONE_SCREEN',
    scheduledAt: '',
    endTime: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    meetingLink: '',
    location: '',
    instructions: '',
    notes: '',
  });

  const interviewTypes = [
    { value: 'PHONE_SCREEN', label: 'Phone Screen' },
    { value: 'TECHNICAL', label: 'Technical Interview' },
    { value: 'HR', label: 'HR Interview' },
    { value: 'FINAL', label: 'Final Round' },
    { value: 'PEER', label: 'Peer Interview' },
    { value: 'CULTURAL_FIT', label: 'Cultural Fit' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.scheduledAt || !formData.endTime) {
      setError('Please provide start and end time');
      return;
    }

    const startTime = new Date(formData.scheduledAt);
    const endTime = new Date(formData.endTime);

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    if (startTime < new Date()) {
      setError('Interview time must be in the future');
      return;
    }

    if (!formData.meetingLink && !formData.location) {
      setError('Please provide either a meeting link or physical location');
      return;
    }

    try {
      setLoading(true);
      await interviewAPI.create(formData);
      onScheduled();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Schedule Interview</h2>
              <p className="text-gray-600 mt-1">
                {candidateName} - {jobTitle}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                {interviewTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Time Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <input
                type="text"
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., America/New_York"
              />
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link
              </label>
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://zoom.us/j/..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Zoom, Google Meet, or other video conferencing link
              </p>
            </div>

            {/* Physical Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Office address or room number"
              />
            </div>

            {/* Instructions for Candidate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions for Candidate
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="What the candidate should prepare, topics to be covered, etc."
              />
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Notes (Not visible to candidate)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Internal notes for your team"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;
