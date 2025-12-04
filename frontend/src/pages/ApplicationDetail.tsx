import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../services/api';
import ApplicationTimeline from '../components/ApplicationTimeline';
import type { Application } from '../types';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadApplication();
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
      <div className="w-full px-4 py-8">
        <div className="text-center">Loading application details...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">Application not found</div>
      </div>
    );
  }

  const isRecruiter = user && (user.role === 'RECRUITER' || user.role === 'ADMIN');
  const isCandidate = user && application.candidateId === user.id;

  return (
    <div className="w-full px-4 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application for {application.job?.title}
              </h1>
              <p className="text-gray-600">
                Submitted on {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(application.status)}`}>
              {formatStatus(application.status)}
            </span>
          </div>

          {/* Job Info */}
          {application.job && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-lg mb-2">Job Details</h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Position:</span>
                  <Link
                    to={`/jobs/${application.job.id}`}
                    className="text-primary-600 hover:text-primary-800"
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
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-lg mb-2">Candidate Information</h2>
              <div className="space-y-2 text-gray-700">
                <div>
                  <span className="font-medium">Name:</span> {application.candidate.firstName}{' '}
                  {application.candidate.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  <a
                    href={`mailto:${application.candidate.email}`}
                    className="text-primary-600 hover:text-primary-800"
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
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
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
                      className="text-primary-600 hover:text-primary-800"
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
            <h2 className="font-semibold text-lg mb-2">Resume</h2>
            <a
              href={`http://localhost:5000/${application.resume}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              📄 Download Resume
            </a>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="mb-6">
              <h2 className="font-semibold text-lg mb-2">Cover Letter</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Recruiter Notes */}
          {isRecruiter && (
            <div className="border-t pt-6">
              <h2 className="font-semibold text-lg mb-4">Update Application</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Internal)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Add internal notes about this application..."
                  />
                </div>

                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                >
                  {updating ? 'Updating...' : 'Update Application'}
                </button>
              </div>
            </div>
          )}

          {/* Candidate Actions */}
          {isCandidate && application.status !== 'WITHDRAWN' && (
            <div className="border-t pt-6">
              <button
                onClick={handleWithdraw}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Withdraw Application
              </button>
            </div>
          )}

          {/* Show Notes to Candidate (if any) */}
          {isCandidate && application.notes && (
            <div className="border-t pt-6">
              <h2 className="font-semibold text-lg mb-2">Recruiter Notes</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">{application.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
