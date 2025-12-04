import { useEffect, useState } from 'react';
import {
  getSystemConfig,
  getSystemStats,
  updateSiteConfig,
  updateJobsConfig,
  updateApplicationsConfig,
  updateEmailConfig,
  updateUploadsConfig,
  updateSecurityConfig,
  resetConfig,
} from '../services/admin.service';

interface SystemConfig {
  site: {
    name: string;
    description: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  jobs: {
    requireApproval: boolean;
    maxJobsPerRecruiter: number;
    jobExpirationDays: number;
    featuredJobsEnabled: boolean;
  };
  applications: {
    maxApplicationsPerCandidate: number;
    allowWithdrawal: boolean;
    autoRejectAfterDays: number;
  };
  email: {
    enabled: boolean;
    fromName: string;
    fromEmail: string;
    notificationsEnabled: boolean;
  };
  uploads: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  security: {
    passwordMinLength: number;
    requireEmailVerification: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
}

interface SystemStats {
  database: {
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
    totalInterviews: number;
    activeUsers: number;
  };
  storage: {
    used: number;
    files: number;
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
}

const AdminConfiguration = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activeTab, setActiveTab] = useState('site');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getSystemConfig();
      setConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getSystemStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSave = async (section: string, data: any) => {
    try {
      setSaving(true);

      switch (section) {
        case 'site':
          await updateSiteConfig(data);
          break;
        case 'jobs':
          await updateJobsConfig(data);
          break;
        case 'applications':
          await updateApplicationsConfig(data);
          break;
        case 'email':
          await updateEmailConfig(data);
          break;
        case 'uploads':
          await updateUploadsConfig(data);
          break;
        case 'security':
          await updateSecurityConfig(data);
          break;
      }

      await loadConfig();
      alert('Configuration updated successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all configuration to defaults? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await resetConfig();
      await loadConfig();
      alert('Configuration reset to defaults');
    } catch (error) {
      console.error('Error resetting config:', error);
      alert('Failed to reset configuration');
    } finally {
      setSaving(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600 mt-2">Manage platform settings and configuration</p>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Database</p>
                <p className="text-lg font-semibold">{stats.database.totalUsers} Users</p>
                <p className="text-sm text-gray-500">{stats.database.activeUsers} active</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Content</p>
                <p className="text-lg font-semibold">{stats.database.totalJobs} Jobs</p>
                <p className="text-sm text-gray-500">{stats.database.totalApplications} applications</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Storage</p>
                <p className="text-lg font-semibold">{stats.storage.used.toFixed(2)} MB</p>
                <p className="text-sm text-gray-500">{stats.storage.files} files</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">System</p>
                <p className="text-lg font-semibold">Uptime: {formatUptime(stats.uptime)}</p>
                <p className="text-sm text-gray-500">
                  Memory: {stats.memory.used.toFixed(0)}/{stats.memory.total.toFixed(0)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Tabs */}
        <div className="bg-white rounded-lg shadow">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'site', label: 'Site Settings', icon: '🌐' },
                { id: 'jobs', label: 'Job Settings', icon: '💼' },
                { id: 'applications', label: 'Applications', icon: '📄' },
                { id: 'email', label: 'Email', icon: '📧' },
                { id: 'uploads', label: 'Uploads', icon: '📁' },
                { id: 'security', label: 'Security', icon: '🔒' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Site Settings */}
            {activeTab === 'site' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Site Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={config.site.name}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, name: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                    <textarea
                      value={config.site.description}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, description: e.target.value } })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.site.maintenanceMode}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, maintenanceMode: e.target.checked } })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Maintenance Mode</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.site.allowRegistration}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, allowRegistration: e.target.checked } })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Allow User Registration</label>
                  </div>
                  <button
                    onClick={() => handleSave('site', config.site)}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Site Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Job Settings */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Job Posting Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.jobs.requireApproval}
                      onChange={(e) => setConfig({ ...config, jobs: { ...config.jobs, requireApproval: e.target.checked } })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Require Admin Approval for Job Postings</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Jobs Per Recruiter</label>
                    <input
                      type="number"
                      value={config.jobs.maxJobsPerRecruiter}
                      onChange={(e) => setConfig({ ...config, jobs: { ...config.jobs, maxJobsPerRecruiter: parseInt(e.target.value) } })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Expiration (days)</label>
                    <input
                      type="number"
                      value={config.jobs.jobExpirationDays}
                      onChange={(e) => setConfig({ ...config, jobs: { ...config.jobs, jobExpirationDays: parseInt(e.target.value) } })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.jobs.featuredJobsEnabled}
                      onChange={(e) => setConfig({ ...config, jobs: { ...config.jobs, featuredJobsEnabled: e.target.checked } })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Enable Featured Jobs</label>
                  </div>
                  <button
                    onClick={() => handleSave('jobs', config.jobs)}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Job Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Application Settings */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Application Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Applications Per Candidate</label>
                    <input
                      type="number"
                      value={config.applications.maxApplicationsPerCandidate}
                      onChange={(e) => setConfig({ ...config, applications: { ...config.applications, maxApplicationsPerCandidate: parseInt(e.target.value) } })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.applications.allowWithdrawal}
                      onChange={(e) => setConfig({ ...config, applications: { ...config.applications, allowWithdrawal: e.target.checked } })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Allow Application Withdrawal</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Reject After (days)</label>
                    <input
                      type="number"
                      value={config.applications.autoRejectAfterDays}
                      onChange={(e) => setConfig({ ...config, applications: { ...config.applications, autoRejectAfterDays: parseInt(e.target.value) } })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Set to 0 to disable auto-rejection</p>
                  </div>
                  <button
                    onClick={() => handleSave('applications', config.applications)}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Application Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Email Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.email.enabled}
                      onChange={(e) => setConfig({ ...config, email: { ...config.email, enabled: e.target.checked } })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Enable Email Sending</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                    <input
                      type="text"
                      value={config.email.fromName}
                      onChange={(e) => setConfig({ ...config, email: { ...config.email, fromName: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Email Address</label>
                    <input
                      type="email"
                      value={config.email.fromEmail}
                      onChange={(e) => setConfig({ ...config, email: { ...config.email, fromEmail: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.email.notificationsEnabled}
                      onChange={(e) => setConfig({ ...config, email: { ...config.email, notificationsEnabled: e.target.checked } })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Enable Email Notifications</label>
                  </div>
                  <button
                    onClick={() => handleSave('email', config.email)}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Email Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Upload Settings */}
            {activeTab === 'uploads' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">File Upload Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={config.uploads.maxFileSize}
                      onChange={(e) => setConfig({ ...config, uploads: { ...config.uploads, maxFileSize: parseInt(e.target.value) } })}
                      min="1"
                      max="50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                    <input
                      type="text"
                      value={config.uploads.allowedFileTypes.join(', ')}
                      onChange={(e) => setConfig({ ...config, uploads: { ...config.uploads, allowedFileTypes: e.target.value.split(',').map(t => t.trim()) } })}
                      placeholder=".pdf, .doc, .docx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Comma-separated list of file extensions</p>
                  </div>
                  <button
                    onClick={() => handleSave('uploads', config.uploads)}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Upload Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                    <input
                      type="number"
                      value={config.security.passwordMinLength}
                      onChange={(e) => setConfig({ ...config, security: { ...config.security, passwordMinLength: parseInt(e.target.value) } })}
                      min="6"
                      max="20"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.security.requireEmailVerification}
                      onChange={(e) => setConfig({ ...config, security: { ...config.security, requireEmailVerification: e.target.checked } })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Require Email Verification</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={config.security.sessionTimeout}
                      onChange={(e) => setConfig({ ...config, security: { ...config.security, sessionTimeout: parseInt(e.target.value) } })}
                      min="15"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={config.security.maxLoginAttempts}
                      onChange={(e) => setConfig({ ...config, security: { ...config.security, maxLoginAttempts: parseInt(e.target.value) } })}
                      min="3"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => handleSave('security', config.security)}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Security Settings'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Reset all configuration to default values. This action cannot be undone.
          </p>
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguration;
