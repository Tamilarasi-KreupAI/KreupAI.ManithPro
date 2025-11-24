import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getSystemActivity, getConversionFunnel } from '../services/admin.service';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
    totalInterviews: number;
    activeJobs: number;
    pendingApplications: number;
    scheduledInterviews: number;
  };
  recentActivity: {
    newUsers: number;
    newJobs: number;
    newApplications: number;
  };
}

interface Activity {
  recentUsers: any[];
  recentJobs: any[];
  recentApplications: any[];
  recentInterviews: any[];
}

interface ConversionFunnel {
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number | string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData, funnelData] = await Promise.all([
        getDashboardStats(),
        getSystemActivity(10),
        getConversionFunnel(),
      ]);
      setStats(statsData);
      setActivity(activityData);
      setFunnel(funnelData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center text-red-600 bg-red-50 px-6 py-4 rounded-xl border border-red-100">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage and monitor your recruitment platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.overview.totalUsers}
            change={`+${stats.recentActivity.newUsers} this month`}
            icon="👥"
            color="blue"
            link="/admin/users"
          />
          <StatCard
            title="Total Jobs"
            value={stats.overview.totalJobs}
            change={`${stats.overview.activeJobs} active`}
            icon="💼"
            color="green"
            link="/admin/jobs"
          />
          <StatCard
            title="Applications"
            value={stats.overview.totalApplications}
            change={`${stats.overview.pendingApplications} pending`}
            icon="📄"
            color="purple"
          />
          <StatCard
            title="Interviews"
            value={stats.overview.totalInterviews}
            change={`${stats.overview.scheduledInterviews} scheduled`}
            icon="🎯"
            color="orange"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity (30 days)</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 transition-transform hover:scale-[1.02]">
                <div className="flex items-center">
                  <span className="text-2xl mr-4 bg-white p-2 rounded-lg shadow-sm">👥</span>
                  <div>
                    <p className="font-semibold text-slate-900">New Users</p>
                    <p className="text-sm text-slate-500">User registrations</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.recentActivity.newUsers}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100 transition-transform hover:scale-[1.02]">
                <div className="flex items-center">
                  <span className="text-2xl mr-4 bg-white p-2 rounded-lg shadow-sm">💼</span>
                  <div>
                    <p className="font-semibold text-slate-900">New Jobs</p>
                    <p className="text-sm text-slate-500">Job postings</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.recentActivity.newJobs}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 transition-transform hover:scale-[1.02]">
                <div className="flex items-center">
                  <span className="text-2xl mr-4 bg-white p-2 rounded-lg shadow-sm">📄</span>
                  <div>
                    <p className="font-semibold text-slate-900">New Applications</p>
                    <p className="text-sm text-slate-500">Job applications</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">{stats.recentActivity.newApplications}</span>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Conversion Funnel</h2>
            {funnel && (
              <div className="space-y-6">
                {funnel.funnel.map((stage, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{stage.stage}</span>
                      <span className="text-slate-500 font-medium">{stage.count} ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users & Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Users</h2>
              <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {activity?.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-100' :
                      user.role === 'RECRUITER' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-green-50 text-green-700 border-green-100'
                    }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Jobs</h2>
              <Link to="/admin/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {activity?.recentJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.companyName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${job.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-100' :
                      job.status === 'CLOSED' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                    }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/admin/users" className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 group">
              <div className="text-3xl mb-3 bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">👥</div>
              <h3 className="font-bold mb-1">Manage Users</h3>
              <p className="text-sm text-slate-300">View, edit, and manage all users</p>
            </Link>
            <Link to="/admin/jobs" className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 group">
              <div className="text-3xl mb-3 bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">💼</div>
              <h3 className="font-bold mb-1">Manage Jobs</h3>
              <p className="text-sm text-slate-300">Oversee all job postings</p>
            </Link>
            <Link to="/admin/analytics" className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 group">
              <div className="text-3xl mb-3 bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">📊</div>
              <h3 className="font-bold mb-1">View Analytics</h3>
              <p className="text-sm text-slate-300">Detailed reports and insights</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component
interface StatCardProps {
  title: string;
  value: number;
  change: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  link?: string;
}

const StatCard = ({ title, value, change, icon, color, link }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all hover:-translate-y-0.5 group h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <span className={`text-2xl ${colorClasses[color]} p-3 rounded-xl border shadow-sm group-hover:scale-110 transition-transform`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-2">{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded-lg border border-slate-100">{change}</div>
    </div>
  );

  return link ? <Link to={link} className="block h-full">{content}</Link> : <div className="h-full">{content}</div>;
};

export default AdminDashboard;
