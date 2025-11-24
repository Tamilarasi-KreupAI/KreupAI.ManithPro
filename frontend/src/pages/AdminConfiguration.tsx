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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">System Configuration</h1>
          <p className="text-slate-500 mt-2">Manage platform settings and configuration</p>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Database</p>
              <p className="text-3xl font-bold text-slate-900">{stats.database.totalUsers}</p>
              <p className="text-sm text-slate-500 mt-1">{stats.database.activeUsers} active users</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Content</p>
              <p className="text-3xl font-bold text-slate-900">{stats.database.totalJobs}</p>
              <p className="text-sm text-slate-500 mt-1">{stats.database.totalApplications} applications</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Storage</p>
              <p className="text-3xl font-bold text-slate-900">{stats.storage.used.toFixed(2)} MB</p>
              <p className="text-sm text-slate-500 mt-1">{stats.storage.files} files</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">System</p>
              <p className="text-xl font-bold text-slate-900 mb-1">{formatUptime(stats.uptime)}</p>
              <p className="text-sm text-slate-500">
                Mem: {stats.memory.used.toFixed(0)}/{stats.memory.total.toFixed(0)} MB
              </p>
            </div>
          </div>
        )}

        {/* Configuration Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-slate-100">
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
                  className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Site Settings */}
            {activeTab === 'site' && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900">Site Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={config.site.name}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, name: e.target.value } })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Site Description</label>
                    <textarea
                      value={config.site.description}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, description: e.target.value } })}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={config.site.maintenanceMode}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, maintenanceMode: e.target.checked } })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">Maintenance Mode</label>
                      <p className="text-xs text-slate-500">Enable to prevent users from accessing the site</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={config.site.allowRegistration}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, allowRegistration: e.target.checked } })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">Allow User Registration</label>
                      <p className="text-xs text-slate-500">Allow new users to sign up</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSave('site', config.site)}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    {saving ? 'Saving...' : 'Save Site Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Job Settings */}
            {activeTab === 'jobs' && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900">Job Posting Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={config.jobs.requireApproval}
                      onChange={(e) => setConfig({ ...config, jobs: { ...config.jobs, requireApproval: e.target.checked } })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">Require Admin Approval</label>
                      <p className="text-xs text-slate-500">Jobs must be approved by an admin before going live</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Max Jobs Per Recruiter</label>
                    <input
                      type="number"
                      value={config.jobs.maxJobsPerRecruiter}
                      onChange={(e) => setConfig({ ...config, jobs: { ...config.jobs, maxJobsPerRecruiter: parseInt(e.target.value) } })}
                      min="1"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Job Expiration (days)</label>
                    <input
                      type="number"
                      value={config.jobs.jobExpirationDays}
                      onChange={(e) => setConfig({ ...config, jobs: { ...config.jobs, jobExpirationDays: parseInt(e.target.value) } })}
                      min="1"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={config.jobs.featuredJobsEnabled}
                      onChange={(e) => setConfig({ ...config, jobs: { ...config.jobs, featuredJobsEnabled: e.target.checked } })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">Enable Featured Jobs</label>
                      <p className="text-xs text-slate-500">Allow recruiters to pay for featured job listings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSave('jobs', config.jobs)}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    {saving ? 'Saving...' : 'Save Job Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Application Settings */}
            {activeTab === 'applications' && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900">Application Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Max Applications Per Candidate</label>
                    <input
                      type="number"
                      value={config.applications.maxApplicationsPerCandidate}
                      onChange={(e) => setConfig({ ...config, applications: { ...config.applications, maxApplicationsPerCandidate: parseInt(e.target.value) } })}
                      min="1"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={config.applications.allowWithdrawal}
                      onChange={(e) => setConfig({ ...config, applications: { ...config.applications, allowWithdrawal: e.target.checked } })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">Allow Application Withdrawal</label>
                      <p className="text-xs text-slate-500">Candidates can withdraw their applications</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Auto-Reject After (days)</label>
                    <input
                      type="number"
                      value={config.applications.autoRejectAfterDays}
                      onChange={(e) => setConfig({ ...config, applications: { ...config.applications, autoRejectAfterDays: parseInt(e.target.value) } })}
                      min="0"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Set to 0 to disable auto-rejection</p>
                  </div>
                  <button
                    onClick={() => handleSave('applications', config.applications)}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    {saving ? 'Saving...' : 'Save Application Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900">Email Configuration</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={config.email.enabled}
                      onChange={(e) => setConfig({ ...config, email: { ...config.email, enabled: e.target.checked } })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">Enable Email Sending</label>
                      <p className="text-xs text-slate-500">Allow the system to send emails</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">From Name</label>
                    <input
                      type="text"
                      value={config.email.fromName}
                      onChange={(e) => setConfig({ ...config, email: { ...config.email, fromName: e.target.value } })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">From Email Address</label>
                    <input
                      type="email"
                      value={config.email.fromEmail}
                      onChange={(e) => setConfig({ ...config, email: { ...config.email, fromEmail: e.target.value } })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={config.email.notificationsEnabled}
                      onChange={(e) => setConfig({ ...config, email: { ...config.email, notificationsEnabled: e.target.checked } })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">Enable Email Notifications</label>
                      <p className="text-xs text-slate-500">Send notifications for important events</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSave('email', config.email)}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    {saving ? 'Saving...' : 'Save Email Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Upload Settings */}
            {activeTab === 'uploads' && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900">File Upload Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={config.uploads.maxFileSize}
                      onChange={(e) => setConfig({ ...config, uploads: { ...config.uploads, maxFileSize: parseInt(e.target.value) } })}
                      min="1"
                      max="50"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Allowed File Types</label>
                    <input
                      type="text"
                      value={config.uploads.allowedFileTypes.join(', ')}
                      onChange={(e) => setConfig({ ...config, uploads: { ...config.uploads, allowedFileTypes: e.target.value.split(',').map(t => t.trim()) } })}
                      placeholder=".pdf, .doc, .docx"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Comma-separated list of file extensions</p>
                  </div>
                  <button
                    onClick={() => handleSave('uploads', config.uploads)}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    {saving ? 'Saving...' : 'Save Upload Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900">Security Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Password Length</label>
                    <input
                      type="number"
                      value={config.security.passwordMinLength}
                      onChange={(e) => setConfig({ ...config, security: { ...config.security, passwordMinLength: parseInt(e.target.value) } })}
                      min="6"
                      max="20"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={config.security.requireEmailVerification}
                      onChange={(e) => setConfig({ ...config, security: { ...config.security, requireEmailVerification: e.target.checked } })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">Require Email Verification</label>
                      <p className="text-xs text-slate-500">Users must verify email before logging in</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={config.security.sessionTimeout}
                      onChange={(e) => setConfig({ ...config, security: { ...config.security, sessionTimeout: parseInt(e.target.value) } })}
                      min="15"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={config.security.maxLoginAttempts}
                      onChange={(e) => setConfig({ ...config, security: { ...config.security, maxLoginAttempts: parseInt(e.target.value) } })}
                      min="3"
                      max="10"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={() => handleSave('security', config.security)}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    {saving ? 'Saving...' : 'Save Security Settings'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 mt-8">
          <h3 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-6">
            Reset all configuration to default values. This action cannot be undone.
          </p>
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguration;
