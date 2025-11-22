import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, jobAPI } from '../services/api';
import { interviewAPI } from '../services/interviewAPI';

const EnhancedCandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    interviewing: 0,
    offers: 0,
    profileStrength: 0,
    responseRate: 0,
  });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch applications
      const { applications } = await applicationAPI.getAll();

      // Fetch interviews
      const interviews = await interviewAPI.getUpcoming();

      // Fetch recommended jobs
      const { jobs: allJobs } = await jobAPI.getAll();
      const recommendedJobs = allJobs.slice(0, 3); // Simple recommendation for now

      // Calculate stats
      const pending = applications.filter((a: any) =>
        a.status === 'PENDING' || a.status === 'REVIEWING'
      ).length;
      const interviewing = applications.filter((a: any) =>
        a.status === 'INTERVIEW_SCHEDULED' || a.status === 'SHORTLISTED'
      ).length;
      const offers = applications.filter((a: any) =>
        a.status === 'ACCEPTED'
      ).length;

      // Calculate profile strength
      let strength = 0;
      if (user?.firstName) strength += 10;
      if (user?.lastName) strength += 10;
      if (user?.email) strength += 10;
      if (user?.phone) strength += 10;
      if (user?.bio) strength += 15;
      if (user?.skills && user.skills.length > 0) strength += 15;
      if (user?.experience) strength += 10;
      if (user?.education) strength += 10;
      if (user?.location) strength += 5;
      if (user?.linkedIn) strength += 5;

      setStats({
        totalApplications: applications.length,
        pending,
        interviewing,
        offers,
        profileStrength: strength,
        responseRate: applications.length > 0 ? Math.round((interviewing + offers) / applications.length * 100) : 0,
      });

      // Status distribution
      const statusBreakdown = [
        { name: 'Pending', value: pending, color: '#3B82F6' },
        { name: 'Interviewing', value: interviewing, color: '#8B5CF6' },
        { name: 'Offers', value: offers, color: '#10B981' },
        { name: 'Rejected', value: applications.filter((a: any) => a.status === 'REJECTED').length, color: '#EF4444' },
      ].filter(s => s.value > 0);
      setStatusData(statusBreakdown);

      // Application activity (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const activityTrend = last30Days.map(date => {
        const count = applications.filter((a: any) =>
          a.appliedAt.startsWith(date)
        ).length;
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          applications: count,
        };
      }).filter((_, i) => i % 5 === 0); // Show every 5 days for clarity
      setActivityData(activityTrend);

      // Recent applications
      const recent = applications
        .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5);
      setRecentApplications(recent);

      setUpcomingInterviews(interviews.slice(0, 3));
      setRecommendations(recommendedJobs);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-blue-100 text-blue-800',
      REVIEWING: 'bg-purple-100 text-purple-800',
      SHORTLISTED: 'bg-green-100 text-green-800',
      INTERVIEW_SCHEDULED: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      WITHDRAWN: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="mt-2 text-gray-600">Here's your job search overview</p>
        </div>

        {/* Profile Strength Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Profile Strength</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white bg-opacity-20 rounded-full h-4">
                  <div
                    className="bg-white rounded-full h-4 transition-all duration-500"
                    style={{ width: `${stats.profileStrength}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold">{stats.profileStrength}%</span>
              </div>
              {stats.profileStrength < 100 && (
                <button
                  onClick={() => navigate('/profile')}
                  className="mt-4 bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Complete Your Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalApplications}</p>
              </div>
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.pending}</p>
                <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
              </div>
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.interviewing}</p>
                <p className="text-sm text-gray-500 mt-1">Active opportunities</p>
              </div>
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.offers}</p>
                <p className="text-sm text-gray-500 mt-1">Success rate: {stats.responseRate}%</p>
              </div>
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Application Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Status Breakdown</h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No application data yet</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Activity</h2>
            {activityData.some(d => d.applications > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Start applying to see your activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
              <button
                onClick={() => navigate('/applications')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No applications yet</p>
                  <button
                    onClick={() => navigate('/search')}
                    className="mt-4 text-primary-600 hover:text-primary-700"
                  >
                    Start searching for jobs →
                  </button>
                </div>
              ) : (
                recentApplications.map((application) => (
                  <div
                    key={application.id}
                    onClick={() => navigate(`/applications/${application.id}`)}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{application.job?.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{application.job?.companyName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Interviews</h2>
              <button
                onClick={() => navigate('/interviews')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No upcoming interviews</p>
                </div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() => navigate(`/interviews/${interview.id}`)}
                    className="p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                          <span className="text-xs font-bold text-center">
                            {new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{interview.application?.job?.title}</h3>
                        <p className="text-sm text-gray-600">{interview.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recommended For You</h2>
            <button
              onClick={() => navigate('/recommendations')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{job.companyName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCandidateDashboard;
