import React, { useEffect, useState } from 'react';
import {
  getOpenRequirements,
  getVendorCandidates,
  submitCandidateToRequirement,
  getVendorSubmissions,
  getClientSubmissions,
  updateSubmissionStatus,
} from '../../services/b2b.service';
import { useAuth } from '../../context/AuthContext';

interface Requirement {
  id: string;
  title: string;
  clientName: string;
  skills: string[];
  headcount: number;
  status: string;
  createdAt: string;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  status: string;
}

interface Submission {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  requirementTitle: string;
  clientName: string;
  vendorName: string;
  status: string;
  notes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

const Submissions: React.FC = () => {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const isVendor = user?.role === 'VENDOR';

  // Tab state
  const [activeTab, setActiveTab] = useState<'browse' | 'submissions'>(isClient ? 'submissions' : 'browse');

  // Data
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Loading / Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submit modal
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [submitForm, setSubmitForm] = useState({ candidateId: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  // Review modal (for clients)
  const [showReview, setShowReview] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'browse' && isVendor) {
        const [reqs, cands] = await Promise.all([getOpenRequirements(), getVendorCandidates()]);
        setRequirements(reqs);
        setCandidates(cands.filter((c: Candidate) => c.status === 'AVAILABLE'));
      } else if (activeTab === 'submissions') {
        const subs = isClient ? await getClientSubmissions() : await getVendorSubmissions();
        setSubmissions(subs);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (req: Requirement) => {
    setSelectedRequirement(req);
    setSubmitForm({ candidateId: '', notes: '' });
    setShowSubmit(true);
  };

  const handleSubmitCandidate = async () => {
    if (!submitForm.candidateId || !selectedRequirement) {
      alert('Please select a candidate');
      return;
    }

    try {
      setSubmitting(true);
      await submitCandidateToRequirement({
        requirementId: selectedRequirement.id,
        candidateId: submitForm.candidateId,
        notes: submitForm.notes || undefined,
      });
      setShowSubmit(false);
      setSelectedRequirement(null);
      setActiveTab('submissions');
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to submit candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = (sub: Submission) => {
    setSelectedSubmission(sub);
    setReviewNotes(sub.notes || '');
    setShowReview(true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedSubmission) return;

    try {
      setSubmitting(true);
      await updateSubmissionStatus(selectedSubmission.id, status, reviewNotes || undefined);
      setShowReview(false);
      setSelectedSubmission(null);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-800',
      SHORTLISTED: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      PLACED: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isClient ? 'Candidate Submissions' : 'Placements'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isClient
            ? 'Review candidate submissions from vendors for your requirements.'
            : 'Browse open requirements and submit your candidates.'}
        </p>
      </div>

      {/* Tabs (Vendor only - clients only see submissions) */}
      {isVendor && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Browse Requirements
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submissions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Submissions
            </button>
          </nav>
        </div>
      )}

      {/* Browse Requirements Tab (Vendor) */}
      {activeTab === 'browse' && isVendor && (
        <div className="space-y-4">
          {requirements.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
              No open requirements available at the moment.
            </div>
          ) : (
            <div className="grid gap-4">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {req.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Client: {req.clientName}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      {req.headcount} position{req.headcount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {req.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Posted: {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleOpenSubmitModal(req)}
                      className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                    >
                      Submit Candidate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Requirement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {isClient ? 'Vendor' : 'Client'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Submitted
                </th>
                {isClient && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={isClient ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    No submissions found
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {sub.candidateName}
                      </div>
                      <div className="text-sm text-gray-500">{sub.candidateEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {sub.requirementTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {isClient ? sub.vendorName : sub.clientName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    {isClient && (
                      <td className="px-6 py-4 text-right">
                        {sub.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleOpenReview(sub)}
                            className="text-primary-600 hover:underline text-sm"
                          >
                            Review
                          </button>
                        )}
                        {sub.status === 'SHORTLISTED' && (
                          <button
                            onClick={() => handleOpenReview(sub)}
                            className="text-green-600 hover:underline text-sm"
                          >
                            Confirm Placement
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit Candidate Modal (Vendor) */}
      {showSubmit && selectedRequirement && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-2">Submit Candidate</h2>
            <p className="text-sm text-gray-500 mb-4">
              Submitting to: <strong>{selectedRequirement.title}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Candidate *
                </label>
                <select
                  value={submitForm.candidateId}
                  onChange={(e) => setSubmitForm({ ...submitForm, candidateId: e.target.value })}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="">Choose a candidate...</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} - {c.skills.slice(0, 3).join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={submitForm.notes}
                  onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })}
                  placeholder="Any additional information about this candidate..."
                  className="w-full rounded border px-3 py-2 h-24"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSubmit(false);
                  setSelectedRequirement(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                disabled={submitting || !submitForm.candidateId}
                onClick={handleSubmitCandidate}
                className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (Client) */}
      {showReview && selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-2">Review Submission</h2>

            <div className="space-y-2 text-sm mb-4">
              <p>
                <strong>Candidate:</strong> {selectedSubmission.candidateName}
              </p>
              <p>
                <strong>Email:</strong> {selectedSubmission.candidateEmail}
              </p>
              <p>
                <strong>Requirement:</strong> {selectedSubmission.requirementTitle}
              </p>
              <p>
                <strong>Vendor:</strong> {selectedSubmission.vendorName}
              </p>
              <p>
                <strong>Current Status:</strong>{' '}
                <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add review notes..."
                className="w-full rounded border px-3 py-2 h-24"
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => {
                  setShowReview(false);
                  setSelectedSubmission(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              {selectedSubmission.status === 'SUBMITTED' && (
                <>
                  <button
                    disabled={submitting}
                    onClick={() => handleUpdateStatus('REJECTED')}
                    className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleUpdateStatus('SHORTLISTED')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded disabled:opacity-50"
                  >
                    Shortlist
                  </button>
                </>
              )}

              {selectedSubmission.status === 'SHORTLISTED' && (
                <>
                  <button
                    disabled={submitting}
                    onClick={() => handleUpdateStatus('REJECTED')}
                    className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleUpdateStatus('PLACED')}
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                  >
                    Confirm Placement
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
