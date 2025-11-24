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
      const [jobsData, applicationsData, _statsData] = await Promise.all([
        jobAPI.getAll(),
        applicationAPI.getAll(),
        userAPI.getDashboardStats(),
      ]);

      const jobs = jobsData.jobs;
      const applications = applicationsData.applications;

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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your hiring pipeline</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 text-sm font-medium">Total Jobs</h3>
              <div className="p-2 bg-blue-50 rounded-lg">
                <span className="text-2xl">💼</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{analytics.totalJobs}</p>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {analytics.activeJobs} active
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 text-sm font-medium">Applications</h3>
              <div className="p-2 bg-purple-50 rounded-lg">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{analytics.totalApplications}</p>
            <p className="text-sm text-slate-500 mt-2">
              Avg {analytics.avgApplicationsPerJob.toFixed(1)} per job
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 text-sm font-medium">Pending Review</h3>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{analytics.pendingReview}</p>
            <p className="text-sm text-yellow-600 mt-2">Needs attention</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 text-sm font-medium">Hired</h3>
              <div className="p-2 bg-green-50 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{analytics.hired}</p>
            <p className="text-sm text-green-600 mt-2">Successful placements</p>
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Hiring Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-4xl font-bold text-blue-600 mb-2">{analytics.pendingReview}</p>
              <p className="text-sm font-medium text-slate-600">Pending Review</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-4xl font-bold text-indigo-600 mb-2">{analytics.shortlisted}</p>
              <p className="text-sm font-medium text-slate-600">Shortlisted</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-4xl font-bold text-purple-600 mb-2">{analytics.interviewed}</p>
              <p className="text-sm font-medium text-slate-600">Interview Stage</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-4xl font-bold text-green-600 mb-2">{analytics.hired}</p>
              <p className="text-sm font-medium text-slate-600">Hired</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Top Performing Jobs</h2>
            {analytics.topPerformingJobs.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPerformingJobs.map((job, index) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group border border-slate-100 hover:border-blue-100"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-slate-400 font-bold text-sm shadow-sm border border-slate-100 group-hover:text-blue-600">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{job.title}</p>
                        <p className="text-sm text-slate-500">{job.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        {job._count?.applications || 0}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">applicants</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No jobs posted yet</p>
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
              <Link to="/applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            {analytics.recentApplications.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    to={`/applications/${application.id}`}
                    className="block p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors border border-slate-100 hover:border-blue-100 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {application.candidate?.firstName} {application.candidate?.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{application.job?.title}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(application.status)}`}
                      >
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No applications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 p-8 text-white">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/jobs/new"
              className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors border border-white/10"
            >
              <span className="text-3xl">➕</span>
              <div>
                <p className="font-bold">Post New Job</p>
                <p className="text-sm text-blue-100">Create a job listing</p>
              </div>
            </Link>

            <Link
              to="/applications"
              className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors border border-white/10"
            >
              <span className="text-3xl">📋</span>
              <div>
                <p className="font-bold">Review Applications</p>
                <p className="text-sm text-blue-100">{analytics.pendingReview} pending</p>
              </div>
            </Link>

            <Link
              to="/candidates"
              className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors border border-white/10"
            >
              <span className="text-3xl">🔍</span>
              <div>
                <p className="font-bold">Search Candidates</p>
                <p className="text-sm text-blue-100">Find top talent</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
