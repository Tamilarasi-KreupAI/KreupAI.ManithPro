import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  interviewAPI,
  Interview,
  InterviewScorecardFeedback,
  ScorecardCriterionRating,
} from '../services/interviewAPI';
import InterviewReschedule from '../components/InterviewReschedule';

// Batch25 Standard Scorecard Criteria by interview type
const DEFAULT_CRITERIA_MAP: Record<
  string,
  Array<{ id: string; name: string; description: string; weight: number }>
> = {
  TECHNICAL: [
    { id: 'crit-tech-1', name: 'Problem Solving', description: 'Analytical approach, breaking down complex tasks', weight: 25 },
    { id: 'crit-tech-2', name: 'Code Quality & Structure', description: 'Clean, maintainable, idiomatic implementation', weight: 25 },
    { id: 'crit-tech-3', name: 'System Design & Scalability', description: 'Architecture, trade-offs, and scalability thinking', weight: 20 },
    { id: 'crit-tech-4', name: 'Technical Communication', description: 'Clear technical articulation and reasoning', weight: 15 },
    { id: 'crit-tech-5', name: 'Culture Fit & Collaboration', description: 'Receptiveness to feedback and teamwork mindset', weight: 15 },
  ],
  BEHAVIORAL: [
    { id: 'crit-beh-1', name: 'Leadership & Ownership', description: 'Takes initiative, drives solutions, and owns outcomes', weight: 25 },
    { id: 'crit-beh-2', name: 'Teamwork & Collaboration', description: 'Constructive cross-functional relationship building', weight: 25 },
    { id: 'crit-beh-3', name: 'Adaptability & Resilience', description: 'Navigating ambiguity and learning from challenges', weight: 25 },
    { id: 'crit-beh-4', name: 'Initiative & Drive', description: 'Continuous self-improvement and proactivity', weight: 25 },
  ],
  HR: [
    { id: 'crit-hr-1', name: 'Role & Expectation Alignment', description: 'Understanding of responsibilities and growth potential', weight: 25 },
    { id: 'crit-hr-2', name: 'Communication & Professionalism', description: 'Interpersonal skills and professional conduct', weight: 25 },
    { id: 'crit-hr-3', name: 'Culture & Core Values Fit', description: 'Alignment with organizational principles and norms', weight: 25 },
    { id: 'crit-hr-4', name: 'Logistics & Compensation Fit', description: 'Availability, notice period, and compensation match', weight: 25 },
  ],
  DEFAULT: [
    { id: 'crit-def-1', name: 'Role Competency', description: 'Practical domain knowledge and demonstrated capability', weight: 30 },
    { id: 'crit-def-2', name: 'Problem Solving', description: 'Logical reasoning and analytical thinking', weight: 25 },
    { id: 'crit-def-3', name: 'Communication Skills', description: 'Clarity, listening skills, and responsiveness', weight: 25 },
    { id: 'crit-def-4', name: 'Culture Fit & Collaboration', description: 'Team alignment and mutual respect', weight: 20 },
  ],
};

const RECOMMENDATION_OPTIONS = [
  { value: 'STRONG_HIRE', label: 'Strong Hire', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'HIRE', label: 'Hire', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'LEAN_HIRE', label: 'Lean Hire', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'NO_HIRE', label: 'No Hire', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'STRONG_NO_HIRE', label: 'Strong No Hire', color: 'bg-rose-100 text-rose-800 border-rose-300' },
];

const InterviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  // R-9 Action states
  const [showReschedule, setShowReschedule] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // R-10 Scorecard & Multi-reviewer state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [formRatings, setFormRatings] = useState<Record<string, { rating: number; notes: string }>>({});
  const [formOverallRating, setFormOverallRating] = useState<number>(4);
  const [formRecommendation, setFormRecommendation] = useState<string>('HIRE');
  const [formStrengths, setFormStrengths] = useState<string>('');
  const [formWeaknesses, setFormWeaknesses] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  // Auto-clear messages after 6 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchInterview = async () => {
    try {
      if (!id) return;
      const data = await interviewAPI.getById(id);
      setInterview(data);
    } catch (err: any) {
      console.error('Failed to fetch interview', err);
      setErrorMessage(err.response?.data?.error || 'Failed to fetch interview details.');
    } finally {
      setLoading(false);
    }
  };

  // Parse multi-person feedback scorecards from interview.feedback
  const scorecards: InterviewScorecardFeedback[] = useMemo(() => {
    if (!interview?.feedback) return [];
    try {
      const parsed = JSON.parse(interview.feedback);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.feedbacks)) return parsed.feedbacks;
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch (e) {
      // Legacy plain text feedback representation
      return [
        {
          id: 'legacy-feedback-1',
          evaluatorId: interview.scheduledById,
          evaluatorName: interview.scheduledBy
            ? `${interview.scheduledBy.firstName || ''} ${interview.scheduledBy.lastName || ''}`.trim()
            : 'Lead Recruiter',
          evaluatorEmail: interview.scheduledBy?.email || '',
          evaluatorRole: 'RECRUITER',
          overallScore: interview.rating || 5,
          rating: interview.rating || 5,
          recommendation: (interview.rating || 5) >= 4 ? 'HIRE' : 'LEAN_HIRE',
          ratings: [],
          strengths: [],
          weaknesses: [],
          notes: interview.feedback,
          submittedAt: interview.updatedAt || interview.createdAt,
        },
      ];
    }
    return [];
  }, [interview?.feedback, interview?.rating, interview?.scheduledBy, interview?.scheduledById, interview?.updatedAt, interview?.createdAt]);

  const isCandidate = user?.role === 'CANDIDATE' || user?.id === interview?.candidateId;
  const isScheduler = user?.id === interview?.scheduledById;
  const isAuthorizedReviewer =
    !isCandidate &&
    (user?.role === 'ADMIN' ||
      user?.role === 'RECRUITER' ||
      isScheduler ||
      user?.id === interview?.application?.job?.postedById);

  // Check if current logged-in user already submitted feedback
  const myFeedback = scorecards.find((fb) => fb.evaluatorId === user?.id);

  // Get active criteria list for the current interview type
  const activeCriteriaList = useMemo(() => {
    if (!interview?.type) return DEFAULT_CRITERIA_MAP.DEFAULT;
    return DEFAULT_CRITERIA_MAP[interview.type] || DEFAULT_CRITERIA_MAP.DEFAULT;
  }, [interview?.type]);

  const handleOpenNewFeedback = () => {
    const initialRatings: Record<string, { rating: number; notes: string }> = {};
    activeCriteriaList.forEach((c) => {
      initialRatings[c.id] = { rating: 4, notes: '' };
    });
    setEditingFeedbackId(null);
    setFormRatings(initialRatings);
    setFormOverallRating(4);
    setFormRecommendation('HIRE');
    setFormStrengths('');
    setFormWeaknesses('');
    setFormNotes('');
    setShowFeedbackModal(true);
  };

  const handleOpenEditFeedback = (fb: InterviewScorecardFeedback) => {
    const initialRatings: Record<string, { rating: number; notes: string }> = {};

    activeCriteriaList.forEach((c) => {
      const existing = fb.ratings?.find((r) => r.criteriaId === c.id || r.criteriaName === c.name);
      initialRatings[c.id] = {
        rating: existing ? existing.rating : 4,
        notes: existing?.notes || '',
      };
    });

    if (fb.ratings && fb.ratings.length > 0) {
      fb.ratings.forEach((r) => {
        if (!initialRatings[r.criteriaId]) {
          initialRatings[r.criteriaId] = { rating: r.rating, notes: r.notes || '' };
        }
      });
    }

    setEditingFeedbackId(fb.id);
    setFormRatings(initialRatings);
    setFormOverallRating(fb.rating || fb.overallScore || 4);
    setFormRecommendation(fb.recommendation || 'HIRE');
    setFormStrengths(Array.isArray(fb.strengths) ? fb.strengths.join('\n') : (fb.strengths || ''));
    setFormWeaknesses(Array.isArray(fb.weaknesses) ? fb.weaknesses.join('\n') : (fb.weaknesses || ''));
    setFormNotes(fb.notes || '');
    setShowFeedbackModal(true);
  };

  const handleSaveScorecard = async () => {
    if (!id || !interview) return;
    setFeedbackSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const ratingsPayload: ScorecardCriterionRating[] = Object.entries(formRatings).map(
        ([critId, data]) => {
          const found = activeCriteriaList.find((c) => c.id === critId);
          return {
            criteriaId: critId,
            criteriaName: found ? found.name : critId,
            rating: data.rating,
            notes: data.notes,
          };
        }
      );

      const strengthsArray = formStrengths
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const weaknessesArray = formWeaknesses
        .split('\n')
        .map((w) => w.trim())
        .filter(Boolean);

      const payload = {
        feedbackId: editingFeedbackId || undefined,
        ratings: ratingsPayload,
        overallScore: formOverallRating,
        rating: formOverallRating,
        recommendation: formRecommendation,
        strengths: strengthsArray,
        weaknesses: weaknessesArray,
        notes: formNotes,
        isEdit: Boolean(editingFeedbackId),
      };

      if (editingFeedbackId) {
        await interviewAPI.updateFeedback(id, payload);
        setSuccessMessage('Interview feedback scorecard updated successfully.');
      } else {
        await interviewAPI.submitFeedback(id, payload);
        setSuccessMessage('Interview feedback scorecard submitted successfully.');
      }

      setShowFeedbackModal(false);
      await fetchInterview();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || err.message || 'Failed to submit interview feedback scorecard. Please try again.'
      );
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // R-9 Action Handlers (preservation)
  const handleCancelInterview = async () => {
    if (!interview) return;
    if (!window.confirm('Are you sure you want to cancel this interview? The candidate will be notified.')) return;

    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await interviewAPI.update(interview.id, { status: 'CANCELLED' });
      setSuccessMessage('Interview cancelled successfully. The candidate has been notified.');
      await fetchInterview();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to cancel interview. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!interview) return;
    if (!window.confirm('Mark this interview as No-Show? This indicates the candidate did not attend.')) return;

    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await interviewAPI.update(interview.id, { status: 'NO_SHOW' });
      setSuccessMessage('Interview marked as No-Show. The candidate has been notified.');
      await fetchInterview();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to mark interview as No-Show. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleComplete = () => {
    setShowReschedule(false);
    setSuccessMessage('Interview rescheduled successfully. The candidate has been notified.');
    fetchInterview();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'RESCHEDULED':
        return 'bg-amber-100 text-amber-800';
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    const opt = RECOMMENDATION_OPTIONS.find((r) => r.value === recommendation);
    if (!opt) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
          {recommendation.replace(/_/g, ' ')}
        </span>
      );
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${opt.color}`}>
        {opt.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Interview not found</h2>
          <button onClick={() => navigate('/interviews')} className="mt-4 text-primary-600 hover:text-primary-700">
            ← Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const isRecruiter = isScheduler || user?.role === 'RECRUITER' || user?.role === 'ADMIN';
  const isActiveInterview = interview.status === 'SCHEDULED' || interview.status === 'RESCHEDULED';

  const getCandidateName = (): string => {
    if (interview.candidate?.firstName && interview.candidate?.lastName) {
      return `${interview.candidate.firstName} ${interview.candidate.lastName}`;
    }
    if (interview.application?.candidate?.firstName && interview.application?.candidate?.lastName) {
      return `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`;
    }
    return 'Unknown Candidate';
  };

  const getCandidateEmail = (): string | undefined => {
    return interview.candidate?.email || interview.application?.candidate?.email;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-700 mb-6 font-medium inline-flex items-center gap-1">
          ← Back to Interviews
        </button>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 shadow-sm">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 shadow-sm">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Header */}
          <div className="border-b pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Interview Details</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Round: <span className="font-semibold text-gray-700">{interview.type.replace(/_/g, ' ')}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium">
                  {interview.type.replace(/_/g, ' ')}
                </span>
                <span className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeStyle(interview.status)}`}>
                  {interview.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Position */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Position</h3>
              <p className="mt-1 text-xl font-medium text-gray-900">{interview.application?.job?.title || 'Job Position'}</p>
            </div>

            {/* Candidate / Interviewer info */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isRecruiter ? 'Candidate' : 'Interviewer'}
              </h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {isRecruiter
                  ? getCandidateName()
                  : `${interview.scheduledBy?.firstName || ''} ${interview.scheduledBy?.lastName || ''}`.trim() || 'Recruiter'}
              </p>
              {isRecruiter && getCandidateEmail() && (
                <a
                  href={`mailto:${getCandidateEmail()}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {getCandidateEmail()}
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-5 border border-gray-100">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Start Time</h3>
                <p className="mt-1 text-gray-900 font-medium">{formatDateTime(interview.scheduledAt)}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">End Time</h3>
                <p className="mt-1 text-gray-900 font-medium">{formatDateTime(interview.endTime)}</p>
              </div>
            </div>

            {interview.timeZone && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Time Zone</h3>
                <p className="mt-1 text-gray-900">{interview.timeZone}</p>
              </div>
            )}

            {interview.meetingLink && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Meeting Link</h3>
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting Room
                </a>
              </div>
            )}

            {interview.location && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Location</h3>
                <p className="mt-1 text-gray-900">{interview.location}</p>
              </div>
            )}

            {interview.instructions && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Instructions</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{interview.instructions}</p>
              </div>
            )}

            {isRecruiter && interview.notes && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Internal Notes</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-yellow-50 p-3 rounded-lg border border-yellow-100">{interview.notes}</p>
              </div>
            )}

            {/* Recruiter Actions for Active Interviews (R-9) */}
            {isScheduler && isActiveInterview && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowReschedule(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Reschedule
                  </button>
                  <button
                    onClick={handleCancelInterview}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Interview
                  </button>
                  <button
                    onClick={handleMarkNoShow}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Mark No-Show
                  </button>
                </div>
              </div>
            )}

            {/* R-10: Collaborative Interview Feedback & Scorecards */}
            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">Interview Feedback & Scorecards</h3>
                    {scorecards.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                        {scorecards.length} {scorecards.length === 1 ? 'Review' : 'Reviews'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Multi-reviewer evaluations based on standardized interview criteria
                  </p>
                </div>

                {isAuthorizedReviewer && (
                  <div>
                    {myFeedback ? (
                      <button
                        onClick={() => handleOpenEditFeedback(myFeedback)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit My Feedback
                      </button>
                    ) : (
                      <button
                        onClick={handleOpenNewFeedback}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Submit Scorecard Feedback
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Scorecards List */}
              {scorecards.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-700 font-medium">No feedback submitted yet</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    Authorized interview participants and recruiters can submit a standardized scorecard evaluation for this interview.
                  </p>
                  {isAuthorizedReviewer && (
                    <button
                      onClick={handleOpenNewFeedback}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Submit Feedback Scorecard
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {scorecards.map((fb, idx) => {
                    const canEditThisFeedback = user?.id === fb.evaluatorId || user?.role === 'ADMIN';

                    return (
                      <div
                        key={fb.id || idx}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-5"
                      >
                        {/* Reviewer Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                              {(fb.evaluatorName || 'R').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{fb.evaluatorName || 'Reviewer'}</span>
                                {fb.evaluatorRole && (
                                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                                    {fb.evaluatorRole}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {fb.updatedAt && fb.updatedAt !== fb.submittedAt
                                  ? `Edited on ${new Date(fb.updatedAt).toLocaleDateString()}`
                                  : `Submitted on ${new Date(fb.submittedAt || Date.now()).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {getRecommendationBadge(fb.recommendation || 'HIRE')}

                            {canEditThisFeedback && (
                              <button
                                onClick={() => handleOpenEditFeedback(fb)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rating Row */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-600">Overall Rating:</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${i < (fb.rating || fb.overallScore || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 text-sm font-bold text-gray-800">
                              {(fb.rating || fb.overallScore || 0).toFixed(1)} / 5.0
                            </span>
                          </div>
                        </div>

                        {/* Criteria Breakdown */}
                        {fb.ratings && fb.ratings.length > 0 && (
                          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                              Criteria Breakdown
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {fb.ratings.map((r, rIdx) => (
                                <div key={r.criteriaId || rIdx} className="bg-white p-3 rounded border border-gray-200">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-900">{r.criteriaName}</span>
                                    <span className="text-amber-500 font-semibold text-sm">
                                      {'★'.repeat(r.rating || 0)}
                                      <span className="text-gray-300">{'★'.repeat(5 - (r.rating || 0))}</span>
                                    </span>
                                  </div>
                                  {r.notes && <p className="text-xs text-gray-500 italic">{r.notes}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strengths & Weaknesses */}
                        {((fb.strengths && fb.strengths.length > 0) || (fb.weaknesses && fb.weaknesses.length > 0)) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fb.strengths && fb.strengths.length > 0 && (
                              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Key Strengths
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-emerald-900">
                                  {fb.strengths.map((str, sIdx) => (
                                    <li key={sIdx}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {fb.weaknesses && fb.weaknesses.length > 0 && (
                              <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  Areas for Improvement
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-rose-900">
                                  {fb.weaknesses.map((wk, wIdx) => (
                                    <li key={wIdx}>{wk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Detailed Comments */}
                        {fb.notes && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                              Evaluation Notes & Observations
                            </h4>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                              {fb.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* R-10: Scorecard Submission & Edit Modal */}
      {showFeedbackModal && interview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingFeedbackId ? 'Edit Interview Scorecard' : 'Submit Interview Scorecard'}
                </h3>
                <p className="text-sm text-gray-500">
                  {getCandidateName()} — {interview.type.replace(/_/g, ' ')} Round
                </p>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1">
              {/* Overall Recommendation */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Hiring Recommendation <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {RECOMMENDATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormRecommendation(opt.value)}
                      className={`p-3 rounded-lg border-2 text-center text-sm font-semibold transition-all ${
                        formRecommendation === opt.value
                          ? `${opt.color} border-current ring-2 ring-primary-500 ring-offset-1`
                          : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Rating */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Overall Candidate Score <span className="text-red-500">*</span>
                  </label>
                  <span className="text-sm font-bold text-amber-500">
                    {formOverallRating} / 5
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormOverallRating(val)}
                      className={`flex-1 py-2.5 rounded-lg border font-semibold text-sm transition-all ${
                        formOverallRating >= val
                          ? 'bg-amber-400 text-white border-amber-500'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Batch25 Standard Criteria */}
              <div className="space-y-4 border-t pt-5">
                <div>
                  <h4 className="text-base font-bold text-gray-900">Scorecard Evaluation Criteria</h4>
                  <p className="text-xs text-gray-500">Rate each core competency from 1 to 5</p>
                </div>

                <div className="space-y-4">
                  {activeCriteriaList.map((crit) => {
                    const currentRating = formRatings[crit.id]?.rating || 4;
                    const currentNotes = formRatings[crit.id]?.notes || '';

                    return (
                      <div key={crit.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <span className="font-semibold text-gray-900 text-sm">{crit.name}</span>
                            <p className="text-xs text-gray-500">{crit.description}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() =>
                                  setFormRatings((prev) => ({
                                    ...prev,
                                    [crit.id]: { rating: val, notes: prev[crit.id]?.notes || '' },
                                  }))
                                }
                                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                  currentRating >= val
                                    ? 'bg-amber-400 text-white shadow-sm'
                                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder={`Notes on ${crit.name.toLowerCase()} (optional)...`}
                          value={currentNotes}
                          onChange={(e) =>
                            setFormRatings((prev) => ({
                              ...prev,
                              [crit.id]: { rating: prev[crit.id]?.rating || 4, notes: e.target.value },
                            }))
                          }
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Key Strengths (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formStrengths}
                    onChange={(e) => setFormStrengths(e.target.value)}
                    placeholder="e.g. Strong system design knowledge&#10;Excellent communication skills&#10;Fast problem solver"
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Areas for Improvement (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formWeaknesses}
                    onChange={(e) => setFormWeaknesses(e.target.value)}
                    placeholder="e.g. Limited experience with Kubernetes&#10;Could dive deeper into error handling"
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Detailed Summary Notes */}
              <div className="border-t pt-5">
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Overall Feedback & Summary Notes
                </label>
                <textarea
                  rows={4}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Provide detailed feedback, notable answers, interview discussion points, and recommendation rationale..."
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                disabled={feedbackSubmitting}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveScorecard}
                disabled={feedbackSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {feedbackSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : editingFeedbackId ? (
                  'Update Scorecard'
                ) : (
                  'Submit Scorecard'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* R-9 Reschedule Modal (preservation) */}
      {showReschedule && interview && (
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
            candidateName: getCandidateName(),
            jobTitle: interview.application?.job?.title || '',
          }}
          onReschedule={handleRescheduleComplete}
          onCancel={() => setShowReschedule(false)}
        />
      )}
    </div>
  );
};

export default InterviewDetail;
