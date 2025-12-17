import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI, savedJobAPI } from '../services/api';
import type { Application, SavedJob } from '../types';

const Applications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    loadData();
  }, [filter, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'applications') {
        const params: any = {};
        if (filter !== 'all') {
          params.status = filter;
        }
        const data = await applicationAPI.getAll(params);
        setApplications(data.applications);
      } else {
        const data = await savedJobAPI.getAll();
        setSavedJobs(data.savedJobs);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await savedJobAPI.unsave(jobId);
      setSavedJobs(savedJobs.filter(sj => sj.jobId !== jobId));
    } catch (error) {
      console.error('Failed to unsave job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      REVIEWING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      SHORTLISTED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
      INTERVIEW_SCHEDULED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      ACCEPTED: 'bg-green-500 dark:bg-green-600 text-white border-green-600 dark:border-green-700',
      REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
      WITHDRAWN: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toLowerCase();
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      PENDING: '⏳',
      REVIEWING: '👀',
      SHORTLISTED: '✨',
      INTERVIEW_SCHEDULED: '📅',
      ACCEPTED: '✅',
      REJECTED: '❌',
      WITHDRAWN: '🚫',
    };
    return icons[status] || '📄';
  };

  // Sort applications
  const sortedApplications = [...applications].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    } else if (sortBy === 'company') {
      return (a.job?.title || '').localeCompare(b.job?.title || '');
    }
    return 0;
  });

  // Group applications by status
  const groupedByStatus = applications.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = [];
    }
    acc[app.status].push(app);
    return acc;
  }, {} as Record<string, Application[]>);

  const statusCounts = {
    all: applications.length,
    PENDING: groupedByStatus['PENDING']?.length || 0,
    REVIEWING: groupedByStatus['REVIEWING']?.length || 0,
    SHORTLISTED: groupedByStatus['SHORTLISTED']?.length || 0,
    INTERVIEW_SCHEDULED: groupedByStatus['INTERVIEW_SCHEDULED']?.length || 0,
    ACCEPTED: groupedByStatus['ACCEPTED']?.length || 0,
    REJECTED: groupedByStatus['REJECTED']?.length || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden pt-20 pb-8">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 dark:from-blue-950/30 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Activity</h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">Track your applications and saved jobs</p>
          </div>
          <Link
            to="/jobs"
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 font-medium"
          >
            Browse Jobs
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 mb-8 overflow-hidden">
          <div className="border-b border-slate-100 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => { setActiveTab('applications'); setFilter('all'); }}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-bold transition-colors ${
                  activeTab === 'applications'
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📄</span> My Applications ({applications.length})
                </div>
              </button>
              <button
                onClick={() => { setActiveTab('saved'); setFilter('all'); }}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-bold transition-colors ${
                  activeTab === 'saved'
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>❤️</span> Saved Jobs ({savedJobs.length})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Statistics Cards - Only show for applications tab */}
        {activeTab === 'applications' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div
            onClick={() => setFilter('all')}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filter === 'all' ? 'ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400' : 'border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{statusCounts.all}</div>
            <div className="text-sm text-slate-500 dark:text-gray-400">Total</div>
          </div>

          <div
            onClick={() => setFilter('PENDING')}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filter === 'PENDING' ? 'ring-2 ring-yellow-500 dark:ring-yellow-400 border-yellow-500 dark:border-yellow-400' : 'border-slate-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600'
            }`}
          >
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts.PENDING}</div>
            <div className="text-sm text-slate-500 dark:text-gray-400">Pending</div>
          </div>

          <div
            onClick={() => setFilter('REVIEWING')}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filter === 'REVIEWING' ? 'ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400' : 'border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="text-3xl mb-2">👀</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statusCounts.REVIEWING}</div>
            <div className="text-sm text-slate-500 dark:text-gray-400">Reviewing</div>
          </div>

          <div
            onClick={() => setFilter('SHORTLISTED')}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filter === 'SHORTLISTED' ? 'ring-2 ring-green-500 dark:ring-green-400 border-green-500 dark:border-green-400' : 'border-slate-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
            }`}
          >
            <div className="text-3xl mb-2">✨</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts.SHORTLISTED}</div>
            <div className="text-sm text-slate-500 dark:text-gray-400">Shortlisted</div>
          </div>

          <div
            onClick={() => setFilter('INTERVIEW_SCHEDULED')}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filter === 'INTERVIEW_SCHEDULED' ? 'ring-2 ring-purple-500 dark:ring-purple-400 border-purple-500 dark:border-purple-400' : 'border-slate-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
            }`}
          >
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statusCounts.INTERVIEW_SCHEDULED}</div>
            <div className="text-sm text-slate-500 dark:text-gray-400">Interview</div>
          </div>

          <div
            onClick={() => setFilter('ACCEPTED')}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filter === 'ACCEPTED' ? 'ring-2 ring-green-600 dark:ring-green-400 border-green-600 dark:border-green-400' : 'border-slate-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600'
            }`}
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts.ACCEPTED}</div>
            <div className="text-sm text-slate-500 dark:text-gray-400">Accepted</div>
          </div>
        </div>
        )}

        {/* Filters and Sort */}
        {activeTab === 'applications' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            >
              <option value="date">Most Recent</option>
              <option value="status">Status</option>
              <option value="company">Job Title</option>
            </select>
          </div>

          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              Clear Filter <span>×</span>
            </button>
          )}
        </div>
        )}

        {/* Applications List */}
        {activeTab === 'applications' && (
        <>
        {sortedApplications.length > 0 ? (
          <div className="space-y-4">
            {sortedApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-gray-700 flex items-center justify-center text-2xl border border-slate-100 dark:border-gray-600">
                          {getStatusIcon(application.status)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {application.job?.title}
                          </h3>
                          <p className="text-slate-500 dark:text-gray-400 flex items-center gap-2 text-sm mt-1">
                            <span>{application.job?.location}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600"></span>
                            <span>{application.job?.type.replace('_', ' ')}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(application.status)}`}
                    >
                      {formatStatus(application.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Last updated {new Date(application.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mb-6 bg-slate-50 dark:bg-gray-700/50 rounded-lg p-4 border border-slate-100 dark:border-gray-600">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase mb-2">Cover Letter Preview</h4>
                      <p className="text-slate-600 dark:text-gray-400 text-sm line-clamp-2 italic">"{application.coverLetter}"</p>
                    </div>
                  )}

                  {application.notes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-300">Recruiter Feedback</p>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-400 pl-6">{application.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-50 dark:border-gray-700">
                    <Link
                      to={`/applications/${application.id}`}
                      className="flex-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-600 hover:border-slate-300 dark:hover:border-gray-500 text-sm font-medium text-center transition-all"
                    >
                      View Details
                    </Link>
                    {application.job && (
                      <Link
                        to={`/jobs/${application.job.id}`}
                        className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium text-center shadow-sm hover:shadow transition-all"
                      >
                        View Job
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              {filter === 'all' ? 'No Applications Yet' : `No ${formatStatus(filter)} Applications`}
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {filter === 'all'
                ? "Start applying to jobs and track your applications here! Your career journey begins with a single click."
                : "Try changing the filter to see other applications."}
            </p>
            <Link
              to="/jobs"
              className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 font-medium"
            >
              Browse Jobs
            </Link>
          </div>
        )}
        </>
        )}

        {/* Saved Jobs List */}
        {activeTab === 'saved' && (
        <>
        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map((savedJob) => (
              <div
                key={savedJob.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-800 transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link to={`/jobs/${savedJob.jobId}`}>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                          {savedJob.job?.title}
                        </h3>
                      </Link>
                      <p className="text-slate-600 dark:text-gray-400 text-sm mb-3">{savedJob.job?.companyName}</p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="px-3 py-1 bg-slate-50 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg border border-slate-200 dark:border-gray-600">
                          📍 {savedJob.job?.location}
                        </span>
                        <span className="px-3 py-1 bg-slate-50 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg border border-slate-200 dark:border-gray-600">
                          💼 {savedJob.job?.type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnsaveJob(savedJob.jobId)}
                      className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-sm text-slate-500 dark:text-gray-400 mb-4">
                    Saved {new Date(savedJob.savedAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/jobs/${savedJob.jobId}`}
                      className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium text-center transition-all"
                    >
                      View Job
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Saved Jobs Yet</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Save jobs you're interested in to easily access them later and apply when you're ready!
            </p>
            <Link
              to="/jobs"
              className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 font-medium"
            >
              Browse Jobs
            </Link>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default Applications;
