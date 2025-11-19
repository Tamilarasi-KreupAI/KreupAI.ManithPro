import React, { useState, useEffect } from 'react';
import { referenceService, Reference, ReferenceStats } from '../utils/referenceService';
import ReferenceCard from './ReferenceCard';
import RequestReferenceModal from './RequestReferenceModal';

interface ReferencesPanelProps {
  candidateId: string;
  isOwnProfile?: boolean;
}

const ReferencesPanel: React.FC<ReferencesPanelProps> = ({
  candidateId,
  isOwnProfile = false,
}) => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [stats, setStats] = useState<ReferenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'declined'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadReferences();
  }, [candidateId, isOwnProfile]);

  const loadReferences = async () => {
    setLoading(true);
    const [refsData, statsData] = await Promise.all([
      referenceService.getCandidateReferences(candidateId, isOwnProfile),
      referenceService.getReferenceStats(candidateId),
    ]);
    setReferences(refsData);
    setStats(statsData);
    setLoading(false);
  };

  const handleSendReminder = async (referenceId: string) => {
    const result = await referenceService.sendReminder(referenceId);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCancel = async (referenceId: string) => {
    if (!confirm('Are you sure you want to cancel this reference request?')) {
      return;
    }

    const result = await referenceService.cancelReference(referenceId);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      await loadReferences();
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const filteredReferences = references.filter(ref => {
    if (filter === 'all') return true;
    return ref.status === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Professional References
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isOwnProfile ? 'Manage your professional references' : 'View professional endorsements'}
          </p>
        </div>
        {isOwnProfile && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request Reference
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.approved}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Approved</div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Avg Rating</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {isOwnProfile && references.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', 'approved', 'pending', 'declined'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && stats && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {status === 'approved' && stats.approved}
                  {status === 'pending' && stats.pending}
                  {status === 'declined' && stats.declined}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* References List */}
      {filteredReferences.length > 0 ? (
        <div className="space-y-4">
          {filteredReferences.map((reference) => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              isOwn={isOwnProfile}
              onSendReminder={isOwnProfile ? handleSendReminder : undefined}
              onCancel={isOwnProfile ? handleCancel : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {filter === 'all' ? 'No references yet' : `No ${filter} references`}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {isOwnProfile
              ? 'Request professional references to build trust with recruiters'
              : 'This candidate has no public references yet'}
          </p>
          {isOwnProfile && filter === 'all' && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Request Your First Reference
            </button>
          )}
        </div>
      )}

      {/* Request Modal */}
      <RequestReferenceModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={loadReferences}
      />
    </div>
  );
};

export default ReferencesPanel;
