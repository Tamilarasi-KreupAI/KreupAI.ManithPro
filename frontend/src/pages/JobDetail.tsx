import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, savedJobAPI, applicationAPI } from '../services/api';
import type { Job } from '../types';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob();
      if (user?.role === 'CANDIDATE') {
        checkIfSaved();
      }
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const data = await jobAPI.getById(id!);
      setJob(data);
    } catch (error: any) {
      console.error('Failed to load job:', error);
      if (error.response?.status === 404) {
        navigate('/jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const { isSaved } = await savedJobAPI.checkIfSaved(id!);
      setIsSaved(isSaved);
    } catch (error) {
      console.error('Failed to check saved status:', error);
    }
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await savedJobAPI.unsave(id!);
        setIsSaved(false);
      } else {
        await savedJobAPI.save(id!);
        setIsSaved(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update saved status');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
      alert('Please select a resume file');
      return;
    }

    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('jobId', id!);
      formData.append('resume', resume);
      if (coverLetter) {
        formData.append('coverLetter', coverLetter);
      }

      await applicationAPI.create(formData);
      alert('Application submitted successfully!');
      setShowApplyModal(false);
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      await jobAPI.delete(id!);
      alert('Job deleted successfully');
      navigate('/jobs');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Job not found</div>
      </div>
    );
  }

  const canEdit = user && (user.id === job.postedById || user.role === 'ADMIN');
  const canApply = user?.role === 'CANDIDATE' && job.status === 'OPEN';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <Link
              to={`/companies/${encodeURIComponent(job.companyName)}`}
              className="text-2xl text-primary-600 hover:text-primary-800 font-semibold"
            >
              {job.companyName}
            </Link>
          </div>
          <div className="flex gap-2">
            {canApply && (
              <>
                <button
                  onClick={handleSaveToggle}
                  className={`px-4 py-2 rounded-lg border ${
                    isSaved
                      ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isSaved ? '★ Saved' : '☆ Save'}
                </button>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="bg-primary-600 text-white px-8 py-2 rounded-lg hover:bg-primary-700 font-semibold"
                >
                  Apply Now
                </button>
              </>
            )}
            {canEdit && (
              <>
                <Link
                  to={`/jobs/${id}/edit`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💼</span>
            <span>{job.type.replace('_', ' ')}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span>{job.salary}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              job.status === 'OPEN'
                ? 'bg-green-100 text-green-800'
                : job.status === 'CLOSED'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {job.status}
          </span>
          {job._count && (
            <span className="text-gray-600">{job._count.applications} applicants</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Benefits</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills Required */}
          {job.skills && job.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Job Details</h2>
            <div className="space-y-3 text-gray-700">
              {job.experience && (
                <div>
                  <span className="font-semibold">Experience:</span> {job.experience}
                </div>
              )}
              {job.education && (
                <div>
                  <span className="font-semibold">Education:</span> {job.education}
                </div>
              )}
              <div>
                <span className="font-semibold">Positions:</span> {job.positions}
              </div>
              {job.deadline && (
                <div>
                  <span className="font-semibold">Deadline:</span>{' '}
                  {new Date(job.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">About Company</h2>
            <div className="space-y-3">
              <Link
                to={`/companies/${encodeURIComponent(job.companyName)}`}
                className="text-xl text-primary-600 hover:text-primary-800 font-semibold block"
              >
                {job.companyName}
              </Link>
              {job.companyDescription && (
                <p className="text-gray-700">{job.companyDescription}</p>
              )}
              {job.companyIndustry && (
                <div className="text-gray-600">
                  <span className="font-semibold">Industry:</span> {job.companyIndustry}
                </div>
              )}
              {job.companySize && (
                <div className="text-gray-600">
                  <span className="font-semibold">Company Size:</span> {job.companySize} employees
                </div>
              )}
              {job.companyWebsite && (
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 block"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Apply for {job.title}</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume (Required)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                  required
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
