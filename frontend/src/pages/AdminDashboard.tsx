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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and monitor your recruitment platform</p>
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity (30 days)</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="font-medium">New Users</p>
                    <p className="text-sm text-gray-600">User registrations</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.recentActivity.newUsers}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💼</span>
                  <div>
                    <p className="font-medium">New Jobs</p>
                    <p className="text-sm text-gray-600">Job postings</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.recentActivity.newJobs}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📄</span>
                  <div>
                    <p className="font-medium">New Applications</p>
                    <p className="text-sm text-gray-600">Job applications</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">{stats.recentActivity.newApplications}</span>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
            {funnel && (
              <div className="space-y-3">
                {funnel.funnel.map((stage, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-gray-600">{stage.count} ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Users</h2>
              <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {activity?.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    user.role === 'RECRUITER' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Jobs</h2>
              <Link to="/admin/jobs" className="text-blue-600 hover:text-blue-700 text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {activity?.recentJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.companyName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                    job.status === 'CLOSED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/users" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">View, edit, and manage all users</p>
            </Link>
            <Link to="/admin/jobs" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">💼</div>
              <h3 className="font-semibold mb-1">Manage Jobs</h3>
              <p className="text-sm text-gray-600">Oversee all job postings</p>
            </Link>
            <Link to="/admin/analytics" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">View Analytics</h3>
              <p className="text-sm text-gray-600">Detailed reports and insights</p>
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
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const content = (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <span className={`text-2xl ${colorClasses[color]} p-2 rounded-lg`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-600">{change}</div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

export default AdminDashboard;
