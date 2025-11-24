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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h2>
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-medium">
            Return to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = user && (user.id === job.postedById || user.role === 'ADMIN');
  const canApply = user?.role === 'CANDIDATE' && job.status === 'OPEN';

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -z-10 opacity-50" />

          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${job.status === 'OPEN' ? 'bg-green-50 text-green-700 border border-green-100' :
                    job.status === 'CLOSED' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                  {job.status}
                </span>
                <span className="text-slate-400 text-sm">•</span>
                <span className="text-slate-500 text-sm font-medium">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>

              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">{job.title}</h1>
              <Link
                to={`/companies/${encodeURIComponent(job.companyName)}`}
                className="text-xl text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
              >
                {job.companyName}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>

              <div className="flex flex-wrap gap-6 mt-6 text-slate-600">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-lg">📍</span>
                  <span className="font-medium">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-lg">💼</span>
                  <span className="font-medium">{job.type.replace('_', ' ')}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-lg">💰</span>
                    <span className="font-medium">{job.salary}</span>
                  </div>
                )}
                {job._count && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-700">
                    <span className="text-lg">👥</span>
                    <span className="font-medium">{job._count.applications} applicants</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {canApply && (
                <>
                  <button
                    onClick={handleSaveToggle}
                    className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isSaved
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                  >
                    {isSaved ? '★ Saved' : '☆ Save Job'}
                  </button>
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <span>🚀</span> Apply Now
                  </button>
                </>
              )}
              {canEdit && (
                <>
                  <Link
                    to={`/jobs/${id}/edit`}
                    className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 font-medium transition-colors text-center"
                  >
                    Edit Job
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-xl hover:bg-red-100 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-lg">📝</span>
                Job Description
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="bg-green-100 text-green-600 p-2 rounded-lg text-lg">⚡</span>
                  Key Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-600 p-2 rounded-lg text-lg">🎯</span>
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-600">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 p-2 rounded-lg text-lg">🎁</span>
                  Benefits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100 text-slate-700">
                      <span className="text-orange-500">✓</span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Required */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-lg text-sm font-medium hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Overview</h2>
              <div className="space-y-4">
                {job.experience && (
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Experience</p>
                      <p className="text-slate-900 font-semibold">{job.experience}</p>
                    </div>
                  </div>
                )}
                {job.education && (
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Education</p>
                      <p className="text-slate-900 font-semibold">{job.education}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Open Positions</p>
                    <p className="text-slate-900 font-semibold">{job.positions}</p>
                  </div>
                </div>
                {job.deadline && (
                  <div className="flex items-start gap-3">
                    <div className="bg-red-50 p-2 rounded-lg text-red-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Deadline</p>
                      <p className="text-slate-900 font-semibold">{new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-bold mb-4">About Company</h2>
              <div className="space-y-4">
                <Link
                  to={`/companies/${encodeURIComponent(job.companyName)}`}
                  className="text-xl font-bold hover:text-blue-300 transition-colors block"
                >
                  {job.companyName}
                </Link>
                {job.companyDescription && (
                  <p className="text-slate-300 text-sm leading-relaxed">{job.companyDescription}</p>
                )}
                <div className="pt-4 border-t border-slate-700 space-y-2">
                  {job.companyIndustry && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Industry</span>
                      <span className="font-medium">{job.companyIndustry}</span>
                    </div>
                  )}
                  {job.companySize && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Size</span>
                      <span className="font-medium">{job.companySize} employees</span>
                    </div>
                  )}
                </div>
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-2 text-sm font-medium transition-colors mt-4"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100 transform transition-all scale-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Apply for {job.title}</h2>
            <p className="text-slate-500 mb-6">Complete your application below</p>

            <form onSubmit={handleApply} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Resume (Required)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    required
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Accepted formats: PDF, DOC, DOCX</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
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
