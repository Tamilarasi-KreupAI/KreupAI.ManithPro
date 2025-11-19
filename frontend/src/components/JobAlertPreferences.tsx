import React, { useState, useEffect } from 'react';
import { matchingService } from '../utils/matchingService';

interface JobAlertPreference {
  id: string;
  name: string;
  isActive: boolean;
  criteria: {
    jobTitles: string[];
    locations: string[];
    remoteOnly: boolean;
    minSalary?: number;
    maxSalary?: number;
    currency: string;
    employmentTypes: ('FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP')[];
    experienceLevels: ('ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE')[];
    skills?: string[];
    industries?: string[];
    companySize?: ('STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE')[];
  };
  notifications: {
    frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
    channels: ('EMAIL' | 'PUSH' | 'IN_APP')[];
    minMatchScore: number;
    maxResultsPerNotification: number;
  };
  createdAt: string;
  lastNotified?: string;
  totalMatches: number;
}

const JobAlertPreferences: React.FC = () => {
  const [alerts, setAlerts] = useState<JobAlertPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlertPreference | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<JobAlertPreference>>({
    name: '',
    isActive: true,
    criteria: {
      jobTitles: [],
      locations: [],
      remoteOnly: false,
      currency: 'USD',
      employmentTypes: ['FULL_TIME'],
      experienceLevels: [],
      skills: [],
      industries: [],
      companySize: [],
    },
    notifications: {
      frequency: 'DAILY',
      channels: ['EMAIL', 'IN_APP'],
      minMatchScore: 60,
      maxResultsPerNotification: 10,
    },
  });

  const [tempInput, setTempInput] = useState({
    jobTitle: '',
    location: '',
    skill: '',
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await matchingService.getJobAlertPreferences();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load job alerts:', error);
    }
    setLoading(false);
  };

  const handleSaveAlert = async () => {
    try {
      if (editingAlert) {
        await matchingService.updateJobAlertPreference(editingAlert.id, formData);
      } else {
        await matchingService.createJobAlertPreference(formData);
      }
      await loadAlerts();
      resetForm();
    } catch (error) {
      alert('Failed to save job alert. Please try again.');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job alert?')) return;
    try {
      await matchingService.deleteJobAlertPreference(id);
      await loadAlerts();
    } catch (error) {
      alert('Failed to delete job alert. Please try again.');
    }
  };

  const handleToggleAlert = async (id: string, isActive: boolean) => {
    try {
      await matchingService.updateJobAlertPreference(id, { isActive });
      await loadAlerts();
    } catch (error) {
      alert('Failed to update job alert. Please try again.');
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingAlert(null);
    setFormData({
      name: '',
      isActive: true,
      criteria: {
        jobTitles: [],
        locations: [],
        remoteOnly: false,
        currency: 'USD',
        employmentTypes: ['FULL_TIME'],
        experienceLevels: [],
        skills: [],
        industries: [],
        companySize: [],
      },
      notifications: {
        frequency: 'DAILY',
        channels: ['EMAIL', 'IN_APP'],
        minMatchScore: 60,
        maxResultsPerNotification: 10,
      },
    });
    setTempInput({ jobTitle: '', location: '', skill: '' });
  };

  const handleEditAlert = (alert: JobAlertPreference) => {
    setEditingAlert(alert);
    setFormData(alert);
    setShowCreateForm(true);
  };

  const addArrayItem = (field: 'jobTitles' | 'locations' | 'skills', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria!,
        [field]: [...(prev.criteria![field] || []), value.trim()],
      },
    }));
  };

  const removeArrayItem = (field: 'jobTitles' | 'locations' | 'skills', index: number) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria!,
        [field]: (prev.criteria![field] || []).filter((_, i) => i !== index),
      },
    }));
  };

  const toggleArrayValue = <T extends string>(field: string, value: T) => {
    setFormData(prev => {
      const currentValues = (prev.criteria as any)?.[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: T) => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        criteria: {
          ...prev.criteria!,
          [field]: newValues,
        },
      };
    });
  };

  const toggleNotificationChannel = (channel: 'EMAIL' | 'PUSH' | 'IN_APP') => {
    setFormData(prev => {
      const currentChannels = prev.notifications?.channels || [];
      const newChannels = currentChannels.includes(channel)
        ? currentChannels.filter(c => c !== channel)
        : [...currentChannels, channel];
      return {
        ...prev,
        notifications: {
          ...prev.notifications!,
          channels: newChannels,
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Job Alert Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Get notified when jobs matching your criteria are posted
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Alert
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-primary-200 dark:border-primary-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingAlert ? 'Edit Job Alert' : 'Create New Job Alert'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Alert Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Senior React Developer Jobs"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Job Titles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Titles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempInput.jobTitle}
                  onChange={(e) => setTempInput({ ...tempInput, jobTitle: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('jobTitles', tempInput.jobTitle);
                      setTempInput({ ...tempInput, jobTitle: '' });
                    }
                  }}
                  placeholder="e.g., Software Engineer"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={() => {
                    addArrayItem('jobTitles', tempInput.jobTitle);
                    setTempInput({ ...tempInput, jobTitle: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.criteria?.jobTitles?.map((title, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                  >
                    {title}
                    <button
                      onClick={() => removeArrayItem('jobTitles', index)}
                      className="hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Locations
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempInput.location}
                  onChange={(e) => setTempInput({ ...tempInput, location: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('locations', tempInput.location);
                      setTempInput({ ...tempInput, location: '' });
                    }
                  }}
                  placeholder="e.g., New York, NY"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={() => {
                    addArrayItem('locations', tempInput.location);
                    setTempInput({ ...tempInput, location: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.criteria?.locations?.map((location, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {location}
                    <button
                      onClick={() => removeArrayItem('locations', index)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.criteria?.remoteOnly}
                  onChange={(e) => setFormData({
                    ...formData,
                    criteria: { ...formData.criteria!, remoteOnly: e.target.checked },
                  })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Remote only</span>
              </label>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Salary
                </label>
                <input
                  type="number"
                  value={formData.criteria?.minSalary || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    criteria: { ...formData.criteria!, minSalary: Number(e.target.value) },
                  })}
                  placeholder="50000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Salary
                </label>
                <input
                  type="number"
                  value={formData.criteria?.maxSalary || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    criteria: { ...formData.criteria!, maxSalary: Number(e.target.value) },
                  })}
                  placeholder="150000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employment Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleArrayValue('employmentTypes', type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.criteria?.employmentTypes?.includes(type)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level
              </label>
              <div className="flex flex-wrap gap-2">
                {(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleArrayValue('experienceLevels', level)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.criteria?.experienceLevels?.includes(level)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.notifications?.frequency}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications!,
                        frequency: e.target.value as 'INSTANT' | 'DAILY' | 'WEEKLY',
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="INSTANT">Instant</option>
                    <option value="DAILY">Daily Digest</option>
                    <option value="WEEKLY">Weekly Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Match Score: {formData.notifications?.minMatchScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.notifications?.minMatchScore}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications!,
                        minMatchScore: Number(e.target.value),
                      },
                    })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Channels
                </label>
                <div className="flex gap-4">
                  {(['EMAIL', 'PUSH', 'IN_APP'] as const).map((channel) => (
                    <label key={channel} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.channels?.includes(channel)}
                        onChange={() => toggleNotificationChannel(channel)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{channel.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAlert}
                disabled={!formData.name?.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingAlert ? 'Update Alert' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 && !showCreateForm ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No job alerts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first alert to get notified about relevant job opportunities
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${
                alert.isActive
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-300 dark:border-gray-600 opacity-60'
              } p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {alert.name}
                    </h3>
                    {alert.isActive ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                        Paused
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{alert.totalMatches} matches found</span>
                    {alert.lastNotified && (
                      <>
                        <span>•</span>
                        <span>Last notified {alert.lastNotified}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{alert.notifications.frequency.toLowerCase()} notifications</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alert.isActive}
                      onChange={(e) => handleToggleAlert(alert.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                  <button
                    onClick={() => handleEditAlert(alert)}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Alert Criteria Summary */}
              <div className="space-y-2">
                {alert.criteria.jobTitles.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-24">Titles:</span>
                    <div className="flex flex-wrap gap-1">
                      {alert.criteria.jobTitles.slice(0, 3).map((title, idx) => (
                        <span key={idx} className="text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded">
                          {title}
                        </span>
                      ))}
                      {alert.criteria.jobTitles.length > 3 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          +{alert.criteria.jobTitles.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {alert.criteria.locations.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-24">Locations:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {alert.criteria.locations.join(', ')}
                    </span>
                  </div>
                )}
                {(alert.criteria.minSalary || alert.criteria.maxSalary) && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-24">Salary:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {alert.criteria.minSalary ? `$${alert.criteria.minSalary.toLocaleString()}` : 'Any'} - {alert.criteria.maxSalary ? `$${alert.criteria.maxSalary.toLocaleString()}` : 'Any'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobAlertPreferences;
