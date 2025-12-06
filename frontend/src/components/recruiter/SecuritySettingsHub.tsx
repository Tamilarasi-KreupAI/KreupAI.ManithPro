import React, { useState, useEffect } from 'react';
import {
  TwoFactorStatus,
  SSOProvider,
  PasswordPolicy,
  UserSession,
  TrustedDevice,
  LoginAttempt,
  APIKey,
  RBACRole,
  Permission,
  ABACPolicy,
  SecurityAuditLog,
  SecurityStats,
} from '../../types';
import {
  twoFactorAPI,
  ssoAPI,
  passwordPolicyAPI,
  sessionsAPI,
  devicesAPI,
  anomalyAPI,
  apiKeysAPI,
  rbacAPI,
  abacAPI,
  auditLogsAPI,
} from '../../services/batch27AuthenticationAccessAPI';

type TabType = 'overview' | '2fa' | 'sso' | 'sessions' | 'devices' | 'api-keys' | 'roles' | 'abac' | 'audit';

const SecuritySettingsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);

  // State for different sections
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([]);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [roles, setRoles] = useState<RBACRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [abacPolicies, setAbacPolicies] = useState<ABACPolicy[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsData = await auditLogsAPI.getStats();
      setStats(statsData);

      switch (activeTab) {
        case '2fa':
          const tfaStatus = await twoFactorAPI.getStatus();
          setTwoFactorStatus(tfaStatus);
          break;
        case 'sso':
          const providers = await ssoAPI.getProviders();
          setSsoProviders(providers);
          break;
        case 'sessions':
          const sessionsData = await sessionsAPI.getActiveSessions();
          setSessions(sessionsData);
          const policy = await passwordPolicyAPI.getPolicy();
          setPasswordPolicy(policy);
          break;
        case 'devices':
          const devicesData = await devicesAPI.getTrustedDevices();
          setDevices(devicesData);
          const attempts = await anomalyAPI.getLoginAttempts({ limit: 10 });
          setLoginAttempts(attempts);
          break;
        case 'api-keys':
          const keys = await apiKeysAPI.getKeys();
          setApiKeys(keys);
          break;
        case 'roles':
          const rolesData = await rbacAPI.getRoles();
          setRoles(rolesData);
          const perms = await rbacAPI.getPermissions();
          setPermissions(perms);
          break;
        case 'abac':
          const policies = await abacAPI.getPolicies();
          setAbacPolicies(policies);
          break;
        case 'audit':
          const { logs } = await auditLogsAPI.getLogs({ limit: 50 });
          setAuditLogs(logs);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '🔒' },
    { id: '2fa', label: 'Two-Factor Auth', icon: '🔐' },
    { id: 'sso', label: 'SSO Providers', icon: '🔗' },
    { id: 'sessions', label: 'Sessions', icon: '📱' },
    { id: 'devices', label: 'Devices & Anomaly', icon: '💻' },
    { id: 'api-keys', label: 'API Keys', icon: '🔑' },
    { id: 'roles', label: 'Roles & Permissions', icon: '👥' },
    { id: 'abac', label: 'ABAC Policies', icon: '📋' },
    { id: 'audit', label: 'Audit Logs', icon: '📊' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Overview</h2>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">{stats.twoFactorAuth.enabledUsers}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Users with 2FA</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">{stats.sessions.active}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600">{stats.apiKeys.active}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active API Keys</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600">{stats.loginAttempts.anomalies24h}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Anomalies (24h)</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('2fa')}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <div className="font-medium text-gray-900 dark:text-white">Configure 2FA</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Enable two-factor authentication</div>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <div className="font-medium text-gray-900 dark:text-white">Manage Sessions</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">View and terminate active sessions</div>
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <div className="font-medium text-gray-900 dark:text-white">API Key Management</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Create and manage API keys</div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Login Attempts (24h)</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.loginAttempts.last24h || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Roles Configured</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.rbac.roles || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Permissions Defined</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats?.rbac.permissions || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600 dark:text-gray-300">High Risk Events (7d)</span>
              <span className={`font-medium ${(stats?.auditLogs.highRiskLast7d || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats?.auditLogs.highRiskLast7d || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const render2FA = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
        {twoFactorStatus?.enabled && (
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
            Enabled
          </span>
        )}
      </div>

      {twoFactorStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Authenticator App (TOTP)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use an authenticator app like Google Authenticator or Authy.
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                twoFactorStatus.methods.totp
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {twoFactorStatus.methods.totp ? 'Configured' : 'Not configured'}
              </div>
              <button className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                {twoFactorStatus.methods.totp ? 'Reconfigure' : 'Set up TOTP'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">SMS Authentication</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive verification codes via text message.
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                twoFactorStatus.methods.sms
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {twoFactorStatus.methods.sms ? 'Configured' : 'Not configured'}
              </div>
              <button className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                {twoFactorStatus.methods.sms ? 'Reconfigure' : 'Set up SMS'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Backup Codes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Emergency codes for when you can't access your device.
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {twoFactorStatus.backupCodes.used} of 10 codes used
              </div>
              <button className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Generate New Codes
              </button>
            </div>
          </div>

          {twoFactorStatus.recovery.email && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recovery Options</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recovery email: {twoFactorStatus.recovery.email}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSSO = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SSO Providers</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Add Provider
        </button>
      </div>

      <div className="space-y-4">
        {ssoProviders.map((provider) => (
          <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  provider.provider === 'google' ? 'bg-red-100 text-red-600' :
                  provider.provider === 'microsoft' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {provider.provider === 'google' ? 'G' :
                   provider.provider === 'microsoft' ? 'M' : 'SSO'}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{provider.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {provider.type} • {provider.allowedDomains?.join(', ') || 'All domains'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  provider.isEnabled
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {provider.isEnabled ? 'Active' : 'Disabled'}
                </span>
                {provider.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm">
                    Default
                  </span>
                )}
                <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Sessions</h2>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Terminate All Others
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {session.deviceType === 'desktop' ? '💻' :
                   session.deviceType === 'mobile' ? '📱' : '🖥️'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {session.deviceName || session.browser}
                    </h3>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.browser} {session.browserVersion} • {session.operatingSystem}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.city}, {session.country} • {session.ipAddress}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last active: {new Date(session.lastActivityAt).toLocaleString()}
                </div>
                {!session.isCurrent && (
                  <button className="mt-2 text-red-600 hover:text-red-700 text-sm">
                    Terminate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {passwordPolicy && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password Policy</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{passwordPolicy.minLength}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Min Length</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{passwordPolicy.maxPasswordAgeDays}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Max Age (days)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{passwordPolicy.maxFailedAttempts}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Max Failed</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{passwordPolicy.lockoutDurationMins}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Lockout (min)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trusted Devices</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <div key={device.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {device.deviceType === 'desktop' ? '💻' :
                   device.deviceType === 'mobile' ? '📱' : '🖥️'}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{device.deviceName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {device.browser} • {device.operatingSystem}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Last used: {new Date(device.lastUsedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  device.trustLevel === 'HIGH'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {device.trustLevel}
                </span>
                <button className="text-red-600 hover:text-red-700 text-sm">Revoke</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-8">Recent Login Attempts</h3>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Risk</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loginAttempts.map((attempt) => (
              <tr key={attempt.id}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{attempt.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    attempt.success
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {attempt.success ? 'Success' : 'Failed'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {attempt.city ? `${attempt.city}, ${attempt.country}` : attempt.ipAddress}
                </td>
                <td className="px-4 py-3">
                  <div className={`flex items-center space-x-2 ${
                    attempt.riskScore > 50 ? 'text-red-600' :
                    attempt.riskScore > 25 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    <span>{attempt.riskScore}</span>
                    {attempt.isAnomaly && (
                      <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-1 rounded">
                        Anomaly
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(attempt.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAPIKeys = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Keys</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Create New Key
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((key) => (
          <div key={key.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{key.name}</h3>
                  <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    {key.keyPrefix}...{key.lastFourChars}
                  </code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{key.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Requests: {key.totalRequests.toLocaleString()}</span>
                  <span>Rate: {key.rateLimit}/hr</span>
                  {key.lastUsedAt && (
                    <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                  )}
                </div>
                {key.scopes && key.scopes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {key.scopes.map((scope) => (
                      <span key={scope} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                        {scope}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  key.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {key.isActive ? 'Active' : 'Revoked'}
                </span>
                {key.isActive && (
                  <button className="text-red-600 hover:text-red-700">Revoke</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Roles & Permissions</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Roles</h3>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{role.displayName}</h4>
                      {role.isSystem && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Level: {role.level} • Users: {role._count?.userRoles || 0}
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Permissions by Category</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            {Object.entries(
              permissions.reduce((acc, perm) => {
                if (!acc[perm.category]) acc[perm.category] = [];
                acc[perm.category].push(perm);
                return acc;
              }, {} as Record<string, Permission[]>)
            ).map(([category, perms]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h4 className="font-medium text-gray-900 dark:text-white capitalize mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {perms.map((perm) => (
                    <span key={perm.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm">
                      {perm.displayName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderABAC = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ABAC Policies</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Create Policy
        </button>
      </div>

      <div className="space-y-4">
        {abacPolicies.map((policy) => (
          <div key={policy.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{policy.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    policy.effect === 'ALLOW'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {policy.effect}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    Priority: {policy.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{policy.description}</p>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Target: {policy.targetResource} • Action: {policy.targetAction || '*'}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  policy.isEnabled
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {policy.isEnabled ? 'Active' : 'Disabled'}
                </span>
                <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Audit Logs</h2>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <option value="">All Events</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="password_change">Password Change</option>
            <option value="2fa_enable">2FA Enable</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <option value="">All Risk Levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Event</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Risk</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm capitalize">
                    {log.eventType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{log.description}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white' :
                    log.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    log.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {log.riskLevel}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{log.ipAddress || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading && activeTab !== 'overview') {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case '2fa': return render2FA();
      case 'sso': return renderSSO();
      case 'sessions': return renderSessions();
      case 'devices': return renderDevices();
      case 'api-keys': return renderAPIKeys();
      case 'roles': return renderRoles();
      case 'abac': return renderABAC();
      case 'audit': return renderAuditLogs();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Access Control</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage authentication, authorization, and security settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default SecuritySettingsHub;
