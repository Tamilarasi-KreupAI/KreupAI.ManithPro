import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jobAPI, applicationAPI, userAPI } from '../services/api';
import { interviewAPI } from '../services/interviewAPI';

const EnhancedRecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0,
    interviewScheduled: 0,
    shortlisted: 0,
    hired: 0,
    avgTimeToHire: 0,
    responseRate: 0,
  });
  const [applicationTrend, setApplicationTrend] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch jobs, applications, interviews, and recruiter dashboard stats in parallel
      const [jobsData, applicationsData, interviewsData, dashboardStats] = await Promise.all([
        jobAPI.getAll(),
        applicationAPI.getAll(),
        interviewAPI.getUpcoming().catch((err) => {
          console.error('Failed to fetch upcoming interviews:', err);
          return [];
        }),
        userAPI.getDashboardStats().catch((err) => {
          console.error('Failed to fetch recruiter dashboard stats:', err);
          return null;
        }),
      ]);

      const jobs = jobsData?.jobs || [];
      const applications = applicationsData?.applications || [];
      const interviews = Array.isArray(interviewsData) ? interviewsData : [];
      const activeJobs = jobs.filter((j: any) => j.status === 'OPEN');

      // Calculate stats
      const pendingReview = applications.filter((a: any) => a.status === 'PENDING' || a.status === 'REVIEWING').length;
      const interviewScheduled = applications.filter((a: any) => a.status === 'INTERVIEW_SCHEDULED').length;
      const shortlisted = applications.filter((a: any) => a.status === 'SHORTLISTED').length;
      const hired = applications.filter((a: any) => a.status === 'ACCEPTED').length;

      // Time-to-Hire: use backend stats KPI or calculate from valid application dates
      let avgTimeToHire = dashboardStats?.avgTimeToHire ?? dashboardStats?.timeToHire;
      if (avgTimeToHire === undefined) {
        const hiredApps = applications.filter((a: any) => a.status === 'ACCEPTED');
        let totalDays = 0;
        let validHires = 0;
        for (const app of hiredApps) {
          if (app.appliedAt && app.updatedAt) {
            const start = new Date(app.appliedAt).getTime();
            const end = new Date(app.updatedAt).getTime();
            if (!isNaN(start) && !isNaN(end) && end >= start) {
              totalDays += Math.floor((end - start) / (1000 * 60 * 60 * 24));
              validHires++;
            }
          }
        }
        avgTimeToHire = validHires > 0 ? Math.round(totalDays / validHires) : 0;
      }

      // Response Rate: use backend stats KPI or calculate from application progression
      let responseRate = dashboardStats?.responseRate;
      if (responseRate === undefined) {
        const total = applications.length;
        const responded = applications.filter((a: any) =>
          ['REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'].includes(a.status)
        ).length;
        responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
      }

      setStats({
        totalJobs: dashboardStats?.totalJobs ?? jobs.length,
        activeJobs: dashboardStats?.openJobs ?? activeJobs.length,
        totalApplications: dashboardStats?.totalApplications ?? applications.length,
        pendingReview: dashboardStats?.pendingApplications ?? pendingReview,
        interviewScheduled,
        shortlisted,
        hired,
        avgTimeToHire,
        responseRate,
      });

      // Calculate application trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const trendData = last7Days.map(date => {
        const count = applications.filter((a: any) =>
          a.appliedAt.startsWith(date)
        ).length;
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          applications: count,
        };
      });
      setApplicationTrend(trendData);

      // Status distribution
      const statusData = [
        { name: 'Pending', value: applications.filter((a: any) => a.status === 'PENDING').length, color: '#3B82F6' },
        { name: 'Reviewing', value: applications.filter((a: any) => a.status === 'REVIEWING').length, color: '#8B5CF6' },
        { name: 'Shortlisted', value: shortlisted, color: '#10B981' },
        { name: 'Interview', value: interviewScheduled, color: '#F59E0B' },
        { name: 'Hired', value: hired, color: '#059669' },
        { name: 'Rejected', value: applications.filter((a: any) => a.status === 'REJECTED').length, color: '#EF4444' },
      ].filter(s => s.value > 0);
      setStatusDistribution(statusData);

      // Top performing jobs
      const jobApplicationCount = jobs.map((job: any) => ({
        ...job,
        applicationCount: applications.filter((a: any) => a.jobId === job.id).length,
      }));
      const topPerforming = jobApplicationCount
        .sort((a: any, b: any) => b.applicationCount - a.applicationCount)
        .slice(0, 5);
      setTopJobs(topPerforming);

      setUpcomingInterviews(interviews.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm text-green-600 ml-1">{trend}</span>
            </div>
          )}
        </div>
        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Recruitment Analytics</h1>
          <p className="mt-2 text-gray-600">Real-time insights into your hiring pipeline</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            subtitle={`${stats.activeJobs} active`}
            color="text-blue-600"
            icon={
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            subtitle="All time"
            color="text-indigo-600"
            icon={
              <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingReview}
            subtitle="Needs attention"
            color="text-orange-600"
            icon={
              <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Hired"
            value={stats.hired}
            subtitle="Successful placements"
            trend="+8 this month"
            color="text-green-600"
            icon={
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Time-to-Hire (days)"
            value={stats.avgTimeToHire > 0 ? `${stats.avgTimeToHire} days` : '0 days'}
            subtitle="Avg. days to hire"
            color="text-purple-600"
            icon={
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Response Rate (%)"
            value={`${stats.responseRate}%`}
            subtitle="Applications actioned"
            color="text-teal-600"
            icon={
              <svg className="h-8 w-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Application Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={applicationTrend}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} fill="url(#colorApplications)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performing Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Top Performing Jobs</h2>
              <button
                onClick={() => navigate('/jobs')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {topJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                      }`}>
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{job.applicationCount}</p>
                    <p className="text-xs text-gray-500">applications</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Interviews</h2>
              <button
                onClick={() => navigate('/interview-calendar')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View Calendar
              </button>
            </div>
            <div className="space-y-4">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No upcoming interviews</p>
                </div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/interviews/${interview.id}`)}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-600">
                          {new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {interview.candidate?.firstName} {interview.candidate?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{interview.application?.job?.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      {interview.type.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/jobs/new')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-6 text-left transition-all"
            >
              <svg className="h-8 w-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h3 className="font-semibold text-lg">Post New Job</h3>
              <p className="text-sm opacity-90 mt-1">Create a new job listing</p>
            </button>
            <button
              onClick={() => navigate('/recruiter/applications')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-6 text-left transition-all"
            >
              <svg className="h-8 w-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="font-semibold text-lg">Review Applications</h3>
              <p className="text-sm opacity-90 mt-1">{stats.pendingReview} pending review</p>
            </button>
            <button
              onClick={() => navigate('/candidates')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-6 text-left transition-all"
            >
              <svg className="h-8 w-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-semibold text-lg">Search Candidates</h3>
              <p className="text-sm opacity-90 mt-1">Find the perfect match</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRecruiterDashboard;
