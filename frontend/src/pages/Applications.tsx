import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import type { Application } from '../types';

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const data = await applicationAPI.getAll(params);
      setApplications(data.applications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
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
      <div className="w-full px-4 py-8">
        <div className="text-center">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden py-8">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
          <Link
            to="/jobs"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            Browse Jobs
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div
            onClick={() => setFilter('all')}
            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${filter === 'all' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-blue-300'
              }`}
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-slate-900">{statusCounts.all}</div>
            <div className="text-sm text-slate-500">Total</div>
          </div>

          <div
            onClick={() => setFilter('PENDING')}
            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${filter === 'PENDING' ? 'ring-2 ring-yellow-500 border-yellow-500' : 'border-slate-200 hover:border-yellow-300'
              }`}
          >
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING}</div>
            <div className="text-sm text-slate-500">Pending</div>
          </div>

          <div
            onClick={() => setFilter('REVIEWING')}
            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${filter === 'REVIEWING' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-blue-300'
              }`}
          >
            <div className="text-3xl mb-2">👀</div>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.REVIEWING}</div>
            <div className="text-sm text-slate-500">Reviewing</div>
          </div>

          <div
            onClick={() => setFilter('SHORTLISTED')}
            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${filter === 'SHORTLISTED' ? 'ring-2 ring-green-500 border-green-500' : 'border-slate-200 hover:border-green-300'
              }`}
          >
            <div className="text-3xl mb-2">✨</div>
            <div className="text-2xl font-bold text-green-600">{statusCounts.SHORTLISTED}</div>
            <div className="text-sm text-slate-500">Shortlisted</div>
          </div>

          <div
            onClick={() => setFilter('INTERVIEW_SCHEDULED')}
            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${filter === 'INTERVIEW_SCHEDULED' ? 'ring-2 ring-purple-500 border-purple-500' : 'border-slate-200 hover:border-purple-300'
              }`}
          >
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-purple-600">{statusCounts.INTERVIEW_SCHEDULED}</div>
            <div className="text-sm text-slate-500">Interview</div>
          </div>

          <div
            onClick={() => setFilter('ACCEPTED')}
            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${filter === 'ACCEPTED' ? 'ring-2 ring-green-600 border-green-600' : 'border-slate-200 hover:border-green-400'
              }`}
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">{statusCounts.ACCEPTED}</div>
            <div className="text-sm text-slate-500">Accepted</div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="date">Most Recent</option>
              <option value="status">Status</option>
              <option value="company">Job Title</option>
            </select>
          </div>

          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Clear Filter <span>×</span>
            </button>
          )}
        </div>

        {/* Applications List */}
        {sortedApplications.length > 0 ? (
          <div className="space-y-4">
            {sortedApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-2xl border border-slate-100">
                          {getStatusIcon(application.status)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {application.job?.title}
                          </h3>
                          <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                            <span>{application.job?.location}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{application.job?.type.replace('_', ' ')}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(
                        application.status
                      ).replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-').replace(' ', ' border-opacity-20 border-')}`}
                    >
                      {formatStatus(application.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Last updated {new Date(application.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mb-6 bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Cover Letter Preview</h4>
                      <p className="text-slate-600 text-sm line-clamp-2 italic">"{application.coverLetter}"</p>
                    </div>
                  )}

                  {application.notes && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                        <p className="text-sm font-bold text-blue-900">Recruiter Feedback</p>
                      </div>
                      <p className="text-sm text-blue-800 pl-6">{application.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-50">
                    <Link
                      to={`/applications/${application.id}`}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 hover:border-slate-300 text-sm font-medium text-center transition-all"
                    >
                      View Details
                    </Link>
                    {application.job && (
                      <Link
                        to={`/jobs/${application.job.id}`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium text-center shadow-sm hover:shadow transition-all"
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {filter === 'all' ? 'No Applications Yet' : `No ${formatStatus(filter)} Applications`}
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              {filter === 'all'
                ? "Start applying to jobs and track your applications here! Your career journey begins with a single click."
                : "Try changing the filter to see other applications."}
            </p>
            <Link
              to="/jobs"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 font-medium"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
