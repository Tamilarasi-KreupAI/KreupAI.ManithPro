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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <Link
          to="/jobs"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Browse Jobs
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div
          onClick={() => setFilter('all')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
            filter === 'all' ? 'ring-2 ring-primary-600' : ''
          }`}
        >
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>

        <div
          onClick={() => setFilter('PENDING')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
            filter === 'PENDING' ? 'ring-2 ring-yellow-600' : ''
          }`}
        >
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>

        <div
          onClick={() => setFilter('REVIEWING')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
            filter === 'REVIEWING' ? 'ring-2 ring-blue-600' : ''
          }`}
        >
          <div className="text-3xl mb-2">👀</div>
          <div className="text-2xl font-bold text-blue-600">{statusCounts.REVIEWING}</div>
          <div className="text-sm text-gray-600">Reviewing</div>
        </div>

        <div
          onClick={() => setFilter('SHORTLISTED')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
            filter === 'SHORTLISTED' ? 'ring-2 ring-green-600' : ''
          }`}
        >
          <div className="text-3xl mb-2">✨</div>
          <div className="text-2xl font-bold text-green-600">{statusCounts.SHORTLISTED}</div>
          <div className="text-sm text-gray-600">Shortlisted</div>
        </div>

        <div
          onClick={() => setFilter('INTERVIEW_SCHEDULED')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
            filter === 'INTERVIEW_SCHEDULED' ? 'ring-2 ring-purple-600' : ''
          }`}
        >
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-purple-600">{statusCounts.INTERVIEW_SCHEDULED}</div>
          <div className="text-sm text-gray-600">Interview</div>
        </div>

        <div
          onClick={() => setFilter('ACCEPTED')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
            filter === 'ACCEPTED' ? 'ring-2 ring-green-600' : ''
          }`}
        >
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-600">{statusCounts.ACCEPTED}</div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="date">Most Recent</option>
            <option value="status">Status</option>
            <option value="company">Job Title</option>
          </select>
        </div>

        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            Clear Filter ×
          </button>
        )}
      </div>

      {/* Applications List */}
      {sortedApplications.length > 0 ? (
        <div className="space-y-4">
          {sortedApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getStatusIcon(application.status)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {application.job?.title}
                        </h3>
                        <p className="text-gray-600">
                          {application.job?.location} • {application.job?.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                      <span className="flex items-center gap-1">
                        📅 Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        🔄 Updated {new Date(application.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {formatStatus(application.status)}
                  </span>
                </div>

                {application.coverLetter && (
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm line-clamp-2">{application.coverLetter}</p>
                  </div>
                )}

                {application.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Recruiter Notes:</p>
                    <p className="text-sm text-blue-800">{application.notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    to={`/applications/${application.id}`}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 text-sm"
                  >
                    View Details
                  </Link>
                  {application.job && (
                    <Link
                      to={`/jobs/${application.job.id}`}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 text-sm"
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
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {filter === 'all' ? 'No Applications Yet' : `No ${formatStatus(filter)} Applications`}
          </h2>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? "Start applying to jobs and track your applications here!"
              : "Try changing the filter to see other applications."}
          </p>
          <Link
            to="/jobs"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
};

export default Applications;
