import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI, Interview } from '../services/interviewAPI';

const InterviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(3);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const fetchInterview = async () => {
    try {
      if (!id) return;
      const data = await interviewAPI.getById(id);
      setInterview(data);
      if (data.feedback) setFeedback(data.feedback);
      if (data.rating) setRating(data.rating);
    } catch (err) {
      console.error('Failed to fetch interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      if (!id) return;
      await interviewAPI.submitFeedback(id, { feedback, rating });
      setShowFeedbackForm(false);
      fetchInterview();
    } catch (err) {
      console.error('Failed to submit feedback');
    }
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

  const isRecruiter = user?.id === interview.scheduledById;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-700 mb-6">
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Interview Details</h1>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                {interview.type.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                {interview.status}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Position</h3>
              <p className="mt-1 text-lg text-gray-900">{interview.application?.job?.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                {isRecruiter ? 'Candidate' : 'Interviewer'}
              </h3>
              <p className="mt-1 text-lg text-gray-900">
                {isRecruiter
                  ? `${interview.candidate?.firstName} ${interview.candidate?.lastName}`
                  : `${interview.scheduledBy?.firstName} ${interview.scheduledBy?.lastName}`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Time</h3>
                <p className="mt-1 text-gray-900">{formatDateTime(interview.scheduledAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">End Time</h3>
                <p className="mt-1 text-gray-900">{formatDateTime(interview.endTime)}</p>
              </div>
            </div>

            {interview.timeZone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Time Zone</h3>
                <p className="mt-1 text-gray-900">{interview.timeZone}</p>
              </div>
            )}

            {interview.meetingLink && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Meeting Link</h3>
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting
                </a>
              </div>
            )}

            {interview.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1 text-gray-900">{interview.location}</p>
              </div>
            )}

            {interview.instructions && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Instructions</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{interview.instructions}</p>
              </div>
            )}

            {isRecruiter && interview.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Internal Notes</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{interview.notes}</p>
              </div>
            )}

            {isRecruiter && interview.status === 'COMPLETED' && interview.feedback && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-500">Rating: </span>
                  <span className="text-yellow-500">{'★'.repeat(interview.rating || 0)}</span>
                  <span className="text-gray-300">{'★'.repeat(5 - (interview.rating || 0))}</span>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{interview.feedback}</p>
              </div>
            )}

            {isRecruiter &&
              interview.status === 'SCHEDULED' &&
              new Date(interview.endTime) < new Date() &&
              !showFeedbackForm && (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Submit Feedback
                </button>
              )}

            {showFeedbackForm && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Feedback</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Provide detailed feedback about the interview..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitFeedback}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Submit Feedback
                    </button>
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;
