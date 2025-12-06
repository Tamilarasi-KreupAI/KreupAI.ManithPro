import React, { useState, useEffect } from 'react';
import { profileVersioningAPI } from '../../services/profileVersioningAPI';
import type { ProfileVersion } from '../../types';

const ProfileVersionHistory: React.FC = () => {
  const [versions, setVersions] = useState<ProfileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ProfileVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[string | null, string | null]>([null, null]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await profileVersioningAPI.getTimeline();
      setVersions(data.timeline);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    try {
      setSaving(true);
      await profileVersioningAPI.createVersion(newVersionLabel || undefined);
      setShowCreateModal(false);
      setNewVersionLabel('');
      loadVersions();
    } catch (error) {
      console.error('Error creating version:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? Your current profile will be backed up first.')) {
      return;
    }

    try {
      await profileVersioningAPI.restoreVersion(versionId);
      loadVersions();
      alert('Profile restored successfully!');
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('Failed to restore version');
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version?')) {
      return;
    }

    try {
      await profileVersioningAPI.deleteVersion(versionId);
      loadVersions();
      if (selectedVersion?.id === versionId) {
        setSelectedVersion(null);
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      alert('Failed to delete version');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'text-green-600 bg-green-50';
      case 'update':
        return 'text-blue-600 bg-blue-50';
      case 'remove':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Profile Version History</h2>
          <p className="text-sm text-gray-500">Track changes and restore previous versions of your profile</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              compareMode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {compareMode ? 'Exit Compare' : 'Compare Versions'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Snapshot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Version Timeline</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedVersion?.id === version.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  } ${compareMode && compareVersions.includes(version.id) ? 'bg-purple-50' : ''}`}
                  onClick={() => {
                    if (compareMode) {
                      if (compareVersions[0] === null) {
                        setCompareVersions([version.id, null]);
                      } else if (compareVersions[1] === null && compareVersions[0] !== version.id) {
                        setCompareVersions([compareVersions[0], version.id]);
                      } else {
                        setCompareVersions([version.id, null]);
                      }
                    } else {
                      setSelectedVersion(version);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        version.isLatest
                          ? 'bg-green-100 text-green-600'
                          : version.isFirst
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className="text-sm font-bold">v{version.versionNumber}</span>
                      </div>
                      {index < versions.length - 1 && (
                        <div className="absolute left-1/2 top-full w-0.5 h-8 bg-gray-200 -translate-x-1/2" />
                      )}
                    </div>

                    {/* Version info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {version.versionLabel || `Version ${version.versionNumber}`}
                        </h4>
                        {version.isLatest && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Current
                          </span>
                        )}
                        {version.isFirst && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            Initial
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{version.changeSummary}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{formatDate(version.createdAt)}</span>
                        <span className="capitalize">by {version.createdBy}</span>
                        {version.changeCount !== undefined && version.changeCount > 0 && (
                          <span className="text-blue-600">{version.changeCount} change(s)</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!compareMode && (
                      <div className="flex items-center gap-2">
                        {!version.isLatest && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreVersion(version.id);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Restore this version"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                        {versions.length > 1 && !version.isFirst && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVersion(version.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete this version"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Compare checkbox */}
                    {compareMode && (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        compareVersions.includes(version.id)
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-gray-300'
                      }`}>
                        {compareVersions.includes(version.id) && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          {selectedVersion ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Version Details</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Version</label>
                  <p className="font-medium text-gray-900">
                    {selectedVersion.versionLabel || `Version ${selectedVersion.versionNumber}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Created</label>
                  <p className="text-gray-900">{formatDate(selectedVersion.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Summary</label>
                  <p className="text-gray-900">{selectedVersion.changeSummary}</p>
                </div>

                {selectedVersion.changes && selectedVersion.changes.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Changes</label>
                    <div className="mt-2 space-y-2">
                      {selectedVersion.changes.map((change, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg ${getChangeTypeColor(change.type)}`}
                        >
                          <span className="font-medium capitalize">{change.field}</span>
                          <span className="text-sm ml-2">
                            {change.type === 'add' ? 'Added' :
                             change.type === 'remove' ? 'Removed' : 'Updated'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedVersion.isLatest && (
                  <button
                    onClick={() => handleRestoreVersion(selectedVersion.id)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Restore This Version
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-500">Select a version to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Version Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Profile Snapshot</h3>
            <p className="text-sm text-gray-500 mb-4">
              Save a snapshot of your current profile. You can restore this version later if needed.
            </p>
            <input
              type="text"
              value={newVersionLabel}
              onChange={(e) => setNewVersionLabel(e.target.value)}
              placeholder="Version label (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVersion}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Create Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileVersionHistory;
