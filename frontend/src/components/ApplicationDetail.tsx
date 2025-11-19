import React, { useState, useEffect } from 'react';
import { applicationService, Application, ApplicationStatus } from '../utils/applicationService';

interface ApplicationDetailProps {
  applicationId: string;
  onClose?: () => void;
  onUpdate?: () => void;
}

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ applicationId, onClose, onUpdate }) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'notes' | 'reviews'>('overview');
  const [newNote, setNewNote] = useState('');
  const [notePrivate, setNotePrivate] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplication(applicationId);
      setApplication(data);
    } catch (error) {
      console.error('Failed to load application:', error);
    }
    setLoading(false);
  };

  const handleStatusChange = async () => {
    if (!selectedStatus || !application) return;
    try {
      await applicationService.updateApplicationStatus(application.id, selectedStatus, statusNote);
      setShowStatusChange(false);
      setSelectedStatus(null);
      setStatusNote('');
      await loadApplication();
      onUpdate?.();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !application) return;
    try {
      await applicationService.addNote(application.id, newNote, notePrivate);
      setNewNote('');
      setNotePrivate(false);
      await loadApplication();
    } catch (error) {
      alert('Failed to add note');
    }
  };

  const handleRating = async (rating: number) => {
    if (!application) return;
    try {
      await applicationService.rateApplication(application.id, rating);
      await loadApplication();
    } catch (error) {
      alert('Failed to rate application');
    }
  };

  const handleToggleBookmark = async () => {
    if (!application) return;
    try {
      await applicationService.toggleBookmark(application.id);
      await loadApplication();
      onUpdate?.();
    } catch (error) {
      alert('Failed to toggle bookmark');
    }
  };

  const renderStarRating = (currentRating?: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleRating(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <svg
              className={`w-6 h-6 ${star <= (currentRating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Application not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-3xl flex-shrink-0">
              {application.candidateName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {application.candidateName}
                </h1>
                <button
                  onClick={handleToggleBookmark}
                  className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  <svg className={`w-6 h-6 ${application.isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                Applied for: <strong>{application.jobTitle}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{application.candidateEmail}</span>
                </div>
                {application.candidatePhone && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{application.candidatePhone}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rating:</span>
                {renderStarRating(application.rating, true)}
              </div>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${applicationService.getStatusColor(application.status)}`}>
              {applicationService.getStatusLabel(application.status)}
            </span>
            {application.matchScore && (
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Match Score: </span>
                <strong className="text-primary-600 dark:text-primary-400">{application.matchScore}%</strong>
              </div>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Applied: {new Date(application.appliedDate).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStatusChange(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Change Status
            </button>
            {application.resumeUrl && (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Resume
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Change Application Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Status
                </label>
                <div className="space-y-2">
                  {applicationService.getNextStatuses(application.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`w-full px-4 py-2 rounded-lg border-2 transition-colors text-left ${
                        selectedStatus === status
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${applicationService.getStatusColor(status)}`}>
                        {applicationService.getStatusLabel(status)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note about this status change..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowStatusChange(false);
                    setSelectedStatus(null);
                    setStatusNote('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={!selectedStatus}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6">
          {['overview', 'timeline', 'notes', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-1 font-medium transition-colors relative capitalize ${
                activeTab === tab
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Application Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Source</p>
                <p className="font-semibold text-gray-900 dark:text-white">{application.source}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Applied Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(application.appliedDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(application.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {application.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Documents
            </h3>
            <div className="space-y-3">
              {application.resumeUrl && (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">Resume.pdf</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {application.coverLetterUrl && (
                <a
                  href={application.coverLetterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">Cover Letter.pdf</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {application.portfolioUrl && (
                <a
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">Portfolio</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Application Timeline
          </h3>
          {application.timeline.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No timeline events yet
            </p>
          ) : (
            <div className="space-y-4">
              {application.timeline.map((event) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      {event.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.performedBy} • {new Date(event.performedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Add Note */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Add Note
            </h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              placeholder="Write a note about this candidate..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white mb-3"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notePrivate}
                  onChange={(e) => setNotePrivate(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Private note</span>
              </label>
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Previous Notes ({application.notes.length})
            </h3>
            {application.notes.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                No notes yet
              </p>
            ) : (
              <div className="space-y-4">
                {application.notes.map((note) => (
                  <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {note.authorName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {note.isPrivate && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs rounded">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Reviews ({application.reviews.length})
          </h3>
          {application.reviews.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No reviews yet
            </p>
          ) : (
            <div className="space-y-6">
              {application.reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{review.reviewerName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {applicationService.getStatusLabel(review.stage)} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      review.recommendation === 'STRONG_YES' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                      review.recommendation === 'YES' ? 'bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-300' :
                      review.recommendation === 'MAYBE' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                      review.recommendation === 'NO' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                      'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}>
                      {review.recommendation.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {Object.entries(review.ratings).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <div className="flex items-center gap-1">
                          {renderStarRating(value, false)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {review.strengths.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Strengths:</p>
                      <div className="flex flex-wrap gap-2">
                        {review.strengths.map((strength, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {review.weaknesses.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Areas for Improvement:</p>
                      <div className="flex flex-wrap gap-2">
                        {review.weaknesses.map((weakness, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm rounded">
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {review.comments && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Comments:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{review.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
