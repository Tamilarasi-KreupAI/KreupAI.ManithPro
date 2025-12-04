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
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const [jobsData, applicationsData, statsData] = await Promise.all([
        jobAPI.getAll(),
        applicationAPI.getAll(),
        userAPI.getDashboardStats(),
      ]);

      const jobs = jobsData.jobs;
      const applications = applicationsData.applications;

      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
      const recentApplications = applications.filter(
        (app) => new Date(app.appliedAt) >= cutoffDate
      );

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
    } catch (error) {
      console.error('Failed to load analytics:', error);
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
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your hiring pipeline</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Link
            to="/jobs/new"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Post New Job
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Jobs</h3>
            <span className="text-3xl">💼</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalJobs}</p>
          <p className="text-sm text-green-600 mt-2">{analytics.activeJobs} active</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Applications</h3>
            <span className="text-3xl">📄</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalApplications}</p>
          <p className="text-sm text-gray-600 mt-2">
            Avg {analytics.avgApplicationsPerJob.toFixed(1)} per job
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Pending Review</h3>
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{analytics.pendingReview}</p>
          <p className="text-sm text-gray-600 mt-2">Needs attention</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Hired</h3>
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{analytics.hired}</p>
          <p className="text-sm text-gray-600 mt-2">Successful placements</p>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Hiring Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{analytics.pendingReview}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{analytics.shortlisted}</p>
            <p className="text-sm text-gray-600 mt-1">Shortlisted</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{analytics.interviewed}</p>
            <p className="text-sm text-gray-600 mt-1">Interview</p>
          </div>
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <p className="text-3xl font-bold text-green-700">{analytics.hired}</p>
            <p className="text-sm text-gray-600 mt-1">Hired</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Jobs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Jobs</h2>
          {analytics.topPerformingJobs.length > 0 ? (
            <div className="space-y-3">
              {analytics.topPerformingJobs.map((job, index) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      {job._count?.applications || 0}
                    </p>
                    <p className="text-xs text-gray-500">applications</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No jobs posted yet</p>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Link to="/applications" className="text-primary-600 hover:text-primary-800 text-sm">
              View All →
            </Link>
          </div>
          {analytics.recentApplications.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentApplications.map((application) => (
                <Link
                  key={application.id}
                  to={`/applications/${application.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {application.candidate?.firstName} {application.candidate?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{application.job?.title}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No applications yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/jobs/new"
            className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">➕</span>
            <div>
              <p className="font-semibold text-gray-900">Post New Job</p>
              <p className="text-sm text-gray-600">Create a job listing</p>
            </div>
          </Link>

          <Link
            to="/applications"
            className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">📋</span>
            <div>
              <p className="font-semibold text-gray-900">Review Applications</p>
              <p className="text-sm text-gray-600">{analytics.pendingReview} pending</p>
            </div>
          </Link>

          <Link
            to="/candidates"
            className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">🔍</span>
            <div>
              <p className="font-semibold text-gray-900">Search Candidates</p>
              <p className="text-sm text-gray-600">Find top talent</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
