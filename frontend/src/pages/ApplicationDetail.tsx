import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../services/api';
import ApplicationTimeline from '../components/ApplicationTimeline';
import type { Application } from '../types';
import api from '../services/api';
import { interviewAPI, type Interview } from '../services/interviewAPI';
import InterviewScheduler from '../components/InterviewScheduler';
import InterviewReschedule from '../components/InterviewReschedule';

const ACTIVE_APPLICATION_STATUSES = [
  'PENDING',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
];

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication();
      loadInterview();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      const data = await applicationAPI.getById(id!);
      setApplication(data);
      setNewStatus(data.status);
      setNotes(data.notes || '');
    } catch (error: any) {
      console.error('Failed to load application:', error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadInterview = async () => {
    if (!id) return;

    setLoadingInterviews(true);
    try {
      const data = await interviewAPI.getByApplication(id);
      const list = Array.isArray(data) ? data : [];
      setInterviews(list);
      const active = list.find((i: Interview) => i.status !== 'CANCELLED');
      setInterview(active || null);
    } catch (error) {
      console.error('Failed to load interview:', error);
      setInterviews([]);
      setInterview(null);
    } finally {
      setLoadingInterviews(false);
    }
  };

  const handleCancelInterview = async () => {
    if (!interview) return;
    if (!window.confirm('Cancel this interview? The candidate will be notified.')) return;

    setCancelling(true);
    try {
      await interviewAPI.update(interview.id, { status: 'CANCELLED' });
      await loadInterview();
    } catch (error: any) {
      console.error('Failed to cancel interview:', error);
      alert(error.response?.data?.error || 'Failed to cancel interview');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!application) return;

    try {
      const response = await api.get(`/applications/${application.id}/resume/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${application.candidate.firstName}_${application.candidate.lastName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download resume:', error);
      alert('Failed to download resume');
    }
  };

  const handleStatusUpdate = async () => {
    if (!application) return;

    setUpdating(true);
    try {
      await applicationAPI.updateStatus(application.id, {
        status: newStatus,
        notes,
      });
      alert('Application status updated successfully');
      loadApplication();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  const handleWithdraw = async () => {
    if (!application) return;
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await applicationAPI.withdraw(application.id);
      alert('Application withdrawn successfully');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to withdraw application');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      REVIEWING: 'bg-blue-100 text-blue-800',
      SHORTLISTED: 'bg-green-100 text-green-800',
      INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-800',
      ACCEPTED: 'bg-green-500 text-white',
      REJECTED: 'bg-red-100 text-red-800',
      WITHDRAWN: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toLowerCase();
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8 dark:bg-gray-900 min-h-screen">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading application details...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="w-full px-4 py-8 dark:bg-gray-900 min-h-screen">
        <div className="text-center text-gray-600 dark:text-gray-400">Application not found</div>
      </div>
    );
  }

  const isRecruiter = user && (user.role === 'RECRUITER' || user.role === 'ADMIN');
  const isCandidate = user && application.candidateId === user.id;
  const isApplicationActive = Boolean(
    application && ACTIVE_APPLICATION_STATUSES.includes(application.status)
  );

  return (
    <div className="w-full px-4 py-8 dark:bg-gray-900 overflow-hidden min-h-screen relative pt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Application for {application.job?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Submitted on {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(application.status)}`}>
              {formatStatus(application.status)}
            </span>
          </div>

          {/* Job Info */}
          {application.job && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-lg mb-2 dark:text-white">Job Details</h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Position:</span>
                  <Link
                    to={`/jobs/${application.job.id}`}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    {application.job.title}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Location:</span>
                  <span>{application.job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <span>{application.job.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Application Timeline (for candidates) */}
          {isCandidate && (
            <div className="mb-6">
              <ApplicationTimeline
                currentStatus={application.status}
                appliedAt={application.appliedAt}
                updatedAt={application.updatedAt}
              />
            </div>
          )}

          {/* Candidate Info (for recruiters) */}
          {isRecruiter && application.candidate && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-lg mb-2 dark:text-white">Candidate Information</h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-medium">Name:</span> {application.candidate.firstName}{' '}
                  {application.candidate.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  <a
                    href={`mailto:${application.candidate.email}`}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    {application.candidate.email}
                  </a>
                </div>
                {application.candidate.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {application.candidate.phone}
                  </div>
                )}
                {application.candidate.location && (
                  <div>
                    <span className="font-medium">Location:</span> {application.candidate.location}
                  </div>
                )}
                {application.candidate.experience !== undefined && (
                  <div>
                    <span className="font-medium">Experience:</span> {application.candidate.experience} years
                  </div>
                )}
                {application.candidate.skills && application.candidate.skills.length > 0 && (
                  <div>
                    <span className="font-medium">Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {application.candidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {application.candidate.linkedIn && (
                  <div>
                    <span className="font-medium">LinkedIn:</span>{' '}
                    <a
                      href={application.candidate.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resume */}
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-2 dark:text-white">Resume</h2>
            <button
              onClick={handleDownloadResume}
              className="inline-flex items-center gap-2 bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600"
            >
              📄 Download Resume
            </button>
          </div>

          {/* Application Status History */}
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-4 dark:text-white">
              Application Status History
            </h2>

            {(application as any).statusHistory && (application as any).statusHistory.length > 0 ? (
              <div className="relative border-l-2 border-primary-200 dark:border-primary-700 ml-2 space-y-6">
                {(application as any).statusHistory.map((history: any) => (
                  <div key={history.id} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-gray-900" />

                    <p className="font-medium text-gray-900 dark:text-white">
                      {history.fromStatus
                        ? `${history.fromStatus.replace(/_/g, ' ')} → `
                        : ''}
                      {history.toStatus.replace(/_/g, ' ')}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(history.createdAt).toLocaleString()}
                    </p>

                    {history.changedBy && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Changed by: {history.changedBy.firstName}{' '}
                        {history.changedBy.lastName}
                      </p>
                    )}

                    {history.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
                        {history.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No status history available yet.
              </p>
            )}
          </div>
          {/* Interview Rounds - R-7 */}
<div className="border-t dark:border-gray-700 pt-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold text-lg dark:text-white">
      Interview Rounds
    </h2>

    {isRecruiter && (
      <button
        type="button"
        onClick={() => setShowScheduler(true)}
        disabled={!isApplicationActive}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        + Add Round
      </button>
    )}
  </div>

  {loadingInterviews ? (
    <p className="text-gray-500 dark:text-gray-400">
      Loading interview rounds...
    </p>
  ) : interviews.length === 0 ? (
    <p className="text-gray-500 dark:text-gray-400">
      No interview rounds scheduled yet.
    </p>
  ) : (
    <div className="space-y-3">
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="border dark:border-gray-700 rounded-lg p-4"
        >
          <p className="font-medium dark:text-white">
            {interview.type?.replace(/_/g, ' ') || 'Interview'}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(interview.scheduledAt).toLocaleString()}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Status: {interview.status}
          </p>

          {interview.meetingLink && (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 underline text-sm"
            >
              Join Meeting
            </a>
          )}
        </div>
      ))}
    </div>
  )}
</div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="mb-6">
              <h2 className="font-semibold text-lg mb-2 dark:text-white">Cover Letter</h2>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Recruiter Notes */}
          {isRecruiter && (
            <div className="border-t dark:border-gray-700 pt-6">
              <h2 className="font-semibold text-lg mb-4 dark:text-white">Update Application</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Internal)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="Add internal notes about this application..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                  >
                    {updating ? 'Updating...' : 'Update Application'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScheduler(true)}
                    disabled={!isApplicationActive || !!interview}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                  >
                    Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          )}

          {interview && interview.status !== 'CANCELLED' && (
            <div className="border-t dark:border-gray-700 pt-6 mb-6">
              <h2 className="font-semibold text-lg mb-2 dark:text-white">Scheduled Interview</h2>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium dark:text-white">
                    {interview.type?.replace(/_/g, ' ') || 'Interview'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Status: {interview.status}
                  </p>
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 underline text-sm"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
                {isRecruiter && interview.status === 'SCHEDULED' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReschedule(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelInterview}
                      disabled={cancelling}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Interview'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reschedule Modal */}
          {showReschedule && interview && application.candidate && (
            <InterviewReschedule
              interview={{
                id: interview.id,
                type: interview.type,
                scheduledAt: interview.scheduledAt,
                endTime: interview.endTime,
                timeZone: interview.timeZone,
                meetingLink: interview.meetingLink,
                location: interview.location,
                instructions: interview.instructions,
                candidateId: interview.candidateId,
                candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
                jobTitle: application.job?.title || '',
              }}
              onReschedule={() => {
                setShowReschedule(false);
                loadInterview();
              }}
              onCancel={() => setShowReschedule(false)}
            />
          )}

          {/* Schedule Interview Modal */}
          {showScheduler && application.candidate && (
            <InterviewScheduler
              applicationId={application.id}
              candidateName={`${application.candidate.firstName} ${application.candidate.lastName}`}
              jobTitle={application.job?.title || ''}
              onScheduled={() => {
                setShowScheduler(false);
                loadApplication();
                loadInterview();
              }}
              onCancel={() => setShowScheduler(false)}
            />
          )}

          {/* Candidate Actions */}
          {isCandidate && application.status !== 'WITHDRAWN' && (
            <div className="border-t dark:border-gray-700 pt-6">
              <button
                onClick={handleWithdraw}
                className="bg-red-600 dark:bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
              >
                Withdraw Application
              </button>
            </div>
          )}

          {/* Show Notes to Candidate (if any) */}
          {isCandidate && application.notes && (
            <div className="border-t dark:border-gray-700 pt-6">
              <h2 className="font-semibold text-lg mb-2 dark:text-white">Recruiter Notes</h2>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{application.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
