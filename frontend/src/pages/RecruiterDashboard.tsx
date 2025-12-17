import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, applicationAPI, userAPI } from '../services/api';
import type { Job, Application } from '../types';

interface Analytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingReview: number;
  shortlisted: number;
  interviewed: number;
  hired: number;
  avgApplicationsPerJob: number;
  topPerformingJobs: Job[];
  recentApplications: Application[];
  applicationsByStatus: Record<string, number>;
}

const RecruiterDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setError(null);
      // Fetch only recruiter's own jobs and their applications
      const [jobsData, applicationsData] = await Promise.all([
        jobAPI.getAll({ postedBy: 'me' }),
        applicationAPI.getAll(),
      ]);

      const jobs = jobsData.jobs;

      // Filter applications to only those for recruiter's jobs
      const jobIds = new Set(jobs.map(j => j.id));
      const applications = applicationsData.applications.filter(
        (app) => jobIds.has(app.jobId)
      );

      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
      // const recentApplications = applications.filter(
      //   (app) => new Date(app.appliedAt) >= cutoffDate
      // );

      // Calculate analytics
      const activeJobs = jobs.filter((j) => j.status === 'OPEN').length;
      const applicationsByStatus = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Top performing jobs (most applications)
      const jobApplicationCounts = jobs.map((job) => ({
        job,
        count: applications.filter((app) => app.jobId === job.id).length,
      }));
      const topPerformingJobs = jobApplicationCounts
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((item) => item.job);

      setAnalytics({
        totalJobs: jobs.length,
        activeJobs,
        totalApplications: applications.length,
        pendingReview: applicationsByStatus['PENDING'] || 0,
        shortlisted: applicationsByStatus['SHORTLISTED'] || 0,
        interviewed: applicationsByStatus['INTERVIEW_SCHEDULED'] || 0,
        hired: applicationsByStatus['ACCEPTED'] || 0,
        avgApplicationsPerJob: jobs.length > 0 ? applications.length / jobs.length : 0,
        topPerformingJobs,
        recentApplications: applications.slice(0, 10),
        applicationsByStatus,
      });
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
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
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ Failed to load analytics</div>
          {error && (
            <div className="text-slate-700 dark:text-gray-300 mb-4 max-w-md mx-auto">
              {error}
            </div>
          )}
          <button
            onClick={() => loadAnalytics()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden pt-20">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 dark:from-blue-950/30 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Recruiter Dashboard</h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">Overview of your hiring pipeline</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent shadow-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Link
              to="/jobs/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 font-medium"
            >
              Post New Job
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Jobs</h3>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-2xl">💼</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalJobs}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
              {analytics.activeJobs} active
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">Applications</h3>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalApplications}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
              Avg {analytics.avgApplicationsPerJob.toFixed(1)} per job
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">Pending Review</h3>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.pendingReview}</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">Needs attention</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">Hired</h3>
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.hired}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Successful placements</p>
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Hiring Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-slate-100 dark:border-gray-600">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{analytics.pendingReview}</p>
              <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Pending Review</p>
            </div>
            <div className="text-center p-6 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-slate-100 dark:border-gray-600">
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{analytics.shortlisted}</p>
              <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Shortlisted</p>
            </div>
            <div className="text-center p-6 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-slate-100 dark:border-gray-600">
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{analytics.interviewed}</p>
              <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Interview Stage</p>
            </div>
            <div className="text-center p-6 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-slate-100 dark:border-gray-600">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{analytics.hired}</p>
              <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Hired</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Jobs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Top Performing Jobs</h2>
            {analytics.topPerformingJobs.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPerformingJobs.map((job, index) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group border border-slate-100 dark:border-gray-600 hover:border-blue-100 dark:hover:border-blue-800"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-600 text-slate-400 dark:text-gray-400 font-bold text-sm shadow-sm border border-slate-100 dark:border-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{job.title}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{job.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {job._count?.applications || 0}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">applicants</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 dark:text-gray-500">No jobs posted yet</p>
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Applications</h2>
              <Link to="/recruiter/applications" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            {analytics.recentApplications.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    to={`/applications/${application.id}`}
                    className="block p-4 bg-slate-50 dark:bg-gray-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-slate-100 dark:border-gray-600 hover:border-blue-100 dark:hover:border-blue-800 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                          {application.candidate?.firstName} {application.candidate?.lastName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{application.job?.title}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(application.status)}`}
                      >
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-gray-500 font-medium">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 dark:text-gray-500">No applications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 dark:shadow-blue-900/40 p-8 text-white">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/jobs/new"
              className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors border border-white/10"
            >
              <span className="text-3xl">➕</span>
              <div>
                <p className="font-bold">Post New Job</p>
                <p className="text-sm text-blue-100 dark:text-blue-200">Create a job listing</p>
              </div>
            </Link>

            <Link
              to="/recruiter/applications"
              className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors border border-white/10"
            >
              <span className="text-3xl">📋</span>
              <div>
                <p className="font-bold">Review Applications</p>
                <p className="text-sm text-blue-100 dark:text-blue-200">{analytics.pendingReview} pending</p>
              </div>
            </Link>

            <Link
              to="/candidates"
              className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors border border-white/10"
            >
              <span className="text-3xl">🔍</span>
              <div>
                <p className="font-bold">Search Candidates</p>
                <p className="text-sm text-blue-100 dark:text-blue-200">Find top talent</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
