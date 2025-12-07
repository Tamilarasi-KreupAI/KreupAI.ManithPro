// Batch 28: Data Protection Hub Component (8.2.1-8.2.8)
import React, { useState, useEffect } from 'react';
import {
  encryptionKeysAPI,
  tlsAPI,
  piiDetectionAPI,
  anonymizationAPI,
  secureFilesAPI,
  dataResidencyAPI,
  backupAPI,
  keyLifecycleAPI,
  dataProtectionAuditAPI,
} from '../../services/batch28DataProtectionAPI';
import type {
  EncryptionKey,
  KeyRotationSchedule,
  TLSConfig,
  PIIDetectionConfig,
  AnonymizationRule,
  AnonymizationJob,
  SecureFile,
  DataResidencyConfig,
  RegionInfo,
  BackupConfig,
  Backup,
  RestoreJob,
  KeyLifecycleEvent,
  DataProtectionAuditLog,
  DataProtectionStats,
  DataProtectionDashboard,
} from '../../types';

type TabType =
  | 'overview'
  | 'encryption'
  | 'tls'
  | 'pii'
  | 'anonymization'
  | 'files'
  | 'residency'
  | 'backup'
  | 'audit';

const DataProtectionHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [dashboard, setDashboard] = useState<DataProtectionDashboard | null>(null);
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [rotationSchedules, setRotationSchedules] = useState<KeyRotationSchedule[]>([]);
  const [tlsConfig, setTlsConfig] = useState<TLSConfig | null>(null);
  const [piiConfigs, setPiiConfigs] = useState<PIIDetectionConfig[]>([]);
  const [anonymizationRules, setAnonymizationRules] = useState<AnonymizationRule[]>([]);
  const [anonymizationJobs, setAnonymizationJobs] = useState<AnonymizationJob[]>([]);
  const [secureFiles, setSecureFiles] = useState<SecureFile[]>([]);
  const [residencyConfigs, setResidencyConfigs] = useState<DataResidencyConfig[]>([]);
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  const [backupConfigs, setBackupConfigs] = useState<BackupConfig[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [restoreJobs, setRestoreJobs] = useState<RestoreJob[]>([]);
  const [lifecycleEvents, setLifecycleEvents] = useState<KeyLifecycleEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<DataProtectionAuditLog[]>([]);

  // Modal states
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showPIIModal, setShowPIIModal] = useState(false);
  const [showAnonymizationModal, setShowAnonymizationModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showResidencyModal, setShowResidencyModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'overview':
          const [dashboardData, statsData] = await Promise.all([
            dataProtectionAuditAPI.getDashboard(),
            dataProtectionAuditAPI.getStats(),
          ]);
          setDashboard(dashboardData);
          break;

        case 'encryption':
          const [keys, schedules, events] = await Promise.all([
            encryptionKeysAPI.getKeys(),
            encryptionKeysAPI.getRotationSchedules(),
            keyLifecycleAPI.getEvents(),
          ]);
          setEncryptionKeys(keys);
          setRotationSchedules(schedules);
          setLifecycleEvents(events);
          break;

        case 'tls':
          const tls = await tlsAPI.getConfig();
          setTlsConfig(tls);
          break;

        case 'pii':
          const pii = await piiDetectionAPI.getConfigs();
          setPiiConfigs(pii);
          break;

        case 'anonymization':
          const [rules, jobs] = await Promise.all([
            anonymizationAPI.getRules(),
            anonymizationAPI.getJobs(),
          ]);
          setAnonymizationRules(rules);
          setAnonymizationJobs(jobs);
          break;

        case 'files':
          const files = await secureFilesAPI.getFiles();
          setSecureFiles(files);
          break;

        case 'residency':
          const [residency, regionList] = await Promise.all([
            dataResidencyAPI.getConfigs(),
            dataResidencyAPI.getRegions(),
          ]);
          setResidencyConfigs(residency);
          setRegions(regionList);
          break;

        case 'backup':
          const [configs, backupList, restores] = await Promise.all([
            backupAPI.getConfigs(),
            backupAPI.getBackups(),
            backupAPI.getRestoreJobs(),
          ]);
          setBackupConfigs(configs);
          setBackups(backupList);
          setRestoreJobs(restores);
          break;

        case 'audit':
          const logs = await dataProtectionAuditAPI.getLogs();
          setAuditLogs(logs);
          break;
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async (keyId: string) => {
    try {
      await encryptionKeysAPI.rotateKey(keyId);
      await loadData();
    } catch (err) {
      setError('Failed to rotate key');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this key? This action cannot be undone.')) {
      return;
    }
    try {
      await encryptionKeysAPI.revokeKey(keyId, 'Manual revocation');
      await loadData();
    } catch (err) {
      setError('Failed to revoke key');
    }
  };

  const handleRenewCertificate = async () => {
    try {
      await tlsAPI.renewCertificate();
      await loadData();
    } catch (err) {
      setError('Failed to renew certificate');
    }
  };

  const handleTriggerBackup = async (configId: string) => {
    try {
      await backupAPI.triggerBackup(configId);
      await loadData();
    } catch (err) {
      setError('Failed to trigger backup');
    }
  };

  const handleVerifyBackup = async (backupId: string) => {
    try {
      const result = await backupAPI.verifyBackup(backupId);
      alert(`Backup verification: ${result.verified ? 'Passed' : 'Failed'}`);
      await loadData();
    } catch (err) {
      setError('Failed to verify backup');
    }
  };

  const handleRunComplianceCheck = async () => {
    try {
      const result = await dataProtectionAuditAPI.runComplianceCheck();
      alert(`Compliance check ${result.passed ? 'passed' : 'failed'}`);
      await loadData();
    } catch (err) {
      setError('Failed to run compliance check');
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'encryption', label: 'Encryption Keys', icon: '🔐' },
    { id: 'tls', label: 'TLS/SSL', icon: '🔒' },
    { id: 'pii', label: 'PII Detection', icon: '👁️' },
    { id: 'anonymization', label: 'Anonymization', icon: '🎭' },
    { id: 'files', label: 'Secure Files', icon: '📁' },
    { id: 'residency', label: 'Data Residency', icon: '🌍' },
    { id: 'backup', label: 'Backup & Recovery', icon: '💾' },
    { id: 'audit', label: 'Audit Logs', icon: '📋' },
  ];

  const getKeyStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING_ROTATION: 'bg-yellow-100 text-yellow-800',
      ROTATING: 'bg-blue-100 text-blue-800',
      RETIRED: 'bg-gray-100 text-gray-800',
      REVOKED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getBackupStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CORRUPTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOverview = () => {
    if (!dashboard) return null;

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Encryption Keys</p>
                <p className="text-2xl font-bold">{dashboard.stats.encryption.activeKeys}</p>
              </div>
              <div className="text-3xl">🔐</div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-yellow-600">
                {dashboard.stats.encryption.pendingRotation} pending rotation
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">PII Detections (24h)</p>
                <p className="text-2xl font-bold">{dashboard.stats.piiDetection.detectionsLast24h}</p>
              </div>
              <div className="text-3xl">👁️</div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600">
                {dashboard.stats.piiDetection.maskedLast24h} auto-masked
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Secure Files</p>
                <p className="text-2xl font-bold">{dashboard.stats.secureStorage.totalFiles.toLocaleString()}</p>
              </div>
              <div className="text-3xl">📁</div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-blue-600">
                {dashboard.stats.secureStorage.totalSizeGB.toFixed(1)} GB total
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Backups (7d)</p>
                <p className="text-2xl font-bold">{dashboard.stats.backup.backupsLast7d}</p>
              </div>
              <div className="text-3xl">💾</div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600">
                {dashboard.stats.backup.verifiedBackups} verified
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Compliance Score</p>
                <p className="text-2xl font-bold">{dashboard.stats.compliance.passRate}%</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="mt-2 text-sm">
              <span className={dashboard.stats.compliance.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}>
                {dashboard.stats.compliance.criticalIssues} critical issues
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Anonymization Jobs</p>
                <p className="text-2xl font-bold">{dashboard.stats.anonymization.jobsLast7d}</p>
              </div>
              <div className="text-3xl">🎭</div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-blue-600">
                {dashboard.stats.anonymization.recordsAnonymized.toLocaleString()} records
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {dashboard.alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
            <div className="space-y-3">
              {dashboard.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg flex items-center justify-between ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-50 border-l-4 border-red-500'
                      : alert.severity === 'HIGH'
                      ? 'bg-orange-50 border-l-4 border-orange-500'
                      : alert.severity === 'MEDIUM'
                      ? 'bg-yellow-50 border-l-4 border-yellow-500'
                      : 'bg-blue-50 border-l-4 border-blue-500'
                  }`}
                >
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-500">{formatDate(alert.createdAt)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : alert.severity === 'HIGH'
                        ? 'bg-orange-100 text-orange-800'
                        : alert.severity === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Compliance Status</h3>
            <button
              onClick={handleRunComplianceCheck}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Run Check
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboard.complianceStatus.map((status) => (
              <div
                key={status.framework}
                className={`p-4 rounded-lg ${
                  status.status === 'COMPLIANT'
                    ? 'bg-green-50'
                    : status.status === 'PARTIAL'
                    ? 'bg-yellow-50'
                    : 'bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{status.framework}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      status.status === 'COMPLIANT'
                        ? 'bg-green-100 text-green-800'
                        : status.status === 'PARTIAL'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {status.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Last check: {formatDate(status.lastCheck)}
                </p>
                {status.issues > 0 && (
                  <p className="text-sm text-red-600 mt-1">{status.issues} issues found</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Key Rotations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Key Rotations</h3>
          <div className="space-y-3">
            {dashboard.keyRotationSchedule.map((item) => (
              <div key={item.keyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.keyName}</p>
                  <p className="text-sm text-gray-500">Next: {formatDate(item.nextRotation)}</p>
                </div>
                <span className="text-sm font-medium text-blue-600">{item.daysUntil} days</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEncryptionKeys = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Encryption Keys</h3>
        <button
          onClick={() => setShowKeyModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Key
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {encryptionKeys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{key.name}</div>
                    <div className="text-sm text-gray-500">{key.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{key.keyType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{key.purpose}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getKeyStatusBadge(key.status)}`}>
                    {key.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{key.storageType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">v{key.version}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {key.status === 'ACTIVE' && (
                    <>
                      <button
                        onClick={() => handleRotateKey(key.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Rotate
                      </button>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Lifecycle Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Key Events</h3>
        <div className="space-y-3">
          {lifecycleEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{event.keyName}</p>
                <p className="text-sm text-gray-500">
                  {event.eventType} - {event.reason || 'No reason provided'}
                </p>
              </div>
              <span className="text-sm text-gray-500">{formatDate(event.performedAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTLSConfig = () => {
    if (!tlsConfig) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">TLS/SSL Configuration</h3>
          <button
            onClick={handleRenewCertificate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Renew Certificate
          </button>
        </div>

        {/* Certificate Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Certificate Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{tlsConfig.certificateInfo.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issuer</p>
              <p className="font-medium">{tlsConfig.certificateInfo.issuer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid From</p>
              <p className="font-medium">{formatDate(tlsConfig.certificateInfo.validFrom)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid To</p>
              <p className="font-medium">{formatDate(tlsConfig.certificateInfo.validTo)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  tlsConfig.certificateInfo.status === 'VALID'
                    ? 'bg-green-100 text-green-800'
                    : tlsConfig.certificateInfo.status === 'EXPIRING_SOON'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {tlsConfig.certificateInfo.status} ({tlsConfig.certificateInfo.daysUntilExpiry} days)
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Serial Number</p>
              <p className="font-mono text-sm">{tlsConfig.certificateInfo.serialNumber}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Subject Alternative Names</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {tlsConfig.certificateInfo.san.map((name) => (
                <span key={name} className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* TLS Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">TLS Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Minimum Version</p>
              <p className="font-medium">{tlsConfig.minVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Maximum Version</p>
              <p className="font-medium">{tlsConfig.maxVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">OCSP Stapling</p>
              <p className="font-medium">{tlsConfig.ocspStapling ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Session Timeout</p>
              <p className="font-medium">{tlsConfig.sessionTimeout} seconds</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Cipher Suites</p>
            <div className="space-y-1">
              {tlsConfig.cipherSuites.map((cipher, idx) => (
                <div key={idx} className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {cipher}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HSTS Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">HSTS Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">HSTS Enabled</p>
              <p className="font-medium">{tlsConfig.hsts.enabled ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Age</p>
              <p className="font-medium">{tlsConfig.hsts.maxAge} seconds</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Include Subdomains</p>
              <p className="font-medium">{tlsConfig.hsts.includeSubdomains ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preload</p>
              <p className="font-medium">{tlsConfig.hsts.preload ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPIIDetection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PII Detection & Masking</h3>
        <button
          onClick={() => setShowPIIModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {piiConfigs.map((config) => (
          <div key={config.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">{config.name}</h4>
                <p className="text-sm text-gray-500">{config.description}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {config.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">PII Types</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.piiTypes.map((type) => (
                    <span key={type} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Masking Strategy</p>
                <p className="font-medium">{config.maskingStrategy}</p>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className={config.autoMask ? 'text-green-600' : 'text-gray-400'}>
                  {config.autoMask ? '✓' : '○'} Auto-mask
                </span>
                <span className={config.alertOnDetection ? 'text-green-600' : 'text-gray-400'}>
                  {config.alertOnDetection ? '✓' : '○'} Alerts
                </span>
                <span className={config.logDetections ? 'text-green-600' : 'text-gray-400'}>
                  {config.logDetections ? '✓' : '○'} Logging
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnonymization = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Anonymization</h3>
        <button
          onClick={() => setShowAnonymizationModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Rule
        </button>
      </div>

      {/* Rules */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {anonymizationRules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-gray-500">{rule.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {rule.targetTable}.{rule.targetField}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{rule.method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{rule.priority}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Jobs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Recent Jobs</h4>
        <div className="space-y-3">
          {anonymizationJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{job.name}</p>
                <p className="text-sm text-gray-500">
                  {job.processedRecords?.toLocaleString()} / {job.totalRecords?.toLocaleString()} records
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    job.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'RUNNING'
                      ? 'bg-blue-100 text-blue-800'
                      : job.status === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {job.status}
                </span>
                <p className="text-sm text-gray-500 mt-1">{job.progress}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecureFiles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Secure File Storage</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Upload File
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Encryption</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scan Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {secureFiles.map((file) => (
              <tr key={file.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{file.originalName}</div>
                    <div className="text-sm text-gray-500">{file.mimeType}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatBytes(file.size)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{file.encryptionMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{file.storageLocation}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      file.virusScanStatus === 'CLEAN'
                        ? 'bg-green-100 text-green-800'
                        : file.virusScanStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {file.virusScanStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(file.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Download</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDataResidency = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Residency</h3>
        <button
          onClick={() => setShowResidencyModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Policy
        </button>
      </div>

      {/* Regions Map */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Available Regions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {regions.map((region) => (
            <div
              key={region.id}
              className={`p-4 rounded-lg border ${
                region.isAvailable ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{region.name}</span>
                <span className="text-2xl">{region.countryCode === 'US' ? '🇺🇸' : region.countryCode === 'IE' ? '🇮🇪' : region.countryCode === 'DE' ? '🇩🇪' : '🌍'}</span>
              </div>
              <p className="text-sm text-gray-500">{region.country}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {region.complianceFrameworks.map((fw) => (
                  <span key={fw} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                    {fw}
                  </span>
                ))}
              </div>
              {region.latency && (
                <p className="text-sm text-gray-500 mt-2">~{region.latency}ms latency</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Policies */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary Region</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cross-border</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {residencyConfigs.map((config) => (
              <tr key={config.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-gray-500">{config.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{config.primaryRegion}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {config.complianceFrameworks.map((fw) => (
                      <span key={fw} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        {fw}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {config.crossBorderTransfer.allowed ? 'Allowed' : 'Restricted'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {config.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBackupRecovery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Backup & Recovery</h3>
        <button
          onClick={() => setShowBackupModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Config
        </button>
      </div>

      {/* Backup Configs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Backup Configurations</h4>
        <div className="space-y-4">
          {backupConfigs.map((config) => (
            <div key={config.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium">{config.name}</h5>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleTriggerBackup(config.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Run Now
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{config.backupType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Schedule</p>
                  <p className="font-medium">{config.schedule.enabled ? config.schedule.cronExpression : 'Manual'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Storage</p>
                  <p className="font-medium">{config.storage.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {config.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Backups */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="font-semibold">Recent Backups</h4>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Config</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {backups.map((backup) => (
              <tr key={backup.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{backup.configName}</div>
                  <div className="text-sm text-gray-500">{formatDate(backup.startedAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{backup.backupType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {backup.compressedSizeBytes
                    ? `${formatBytes(backup.compressedSizeBytes)} (${formatBytes(backup.sizeBytes)})`
                    : formatBytes(backup.sizeBytes)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {backup.recordsIncluded.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getBackupStatusBadge(backup.status)}`}>
                    {backup.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {backup.verificationStatus ? (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        backup.verificationStatus === 'VERIFIED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {backup.verificationStatus}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {backup.status === 'COMPLETED' && (
                    <>
                      <button
                        onClick={() => handleVerifyBackup(backup.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Verify
                      </button>
                      <button className="text-green-600 hover:text-green-800">Restore</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Restore Jobs */}
      {restoreJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Restore Jobs</h4>
          <div className="space-y-3">
            {restoreJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Restore from backup {job.backupId}</p>
                  <p className="text-sm text-gray-500">
                    {job.tablesRestored} tables, {job.recordsRestored?.toLocaleString()} records
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      job.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : job.status === 'FAILED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{job.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Protection Audit Logs</h3>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Export Logs
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-sm text-gray-500">{log.eventType}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {log.resourceType} ({log.resourceId})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {log.userEmail || log.userId || 'System'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'encryption':
        return renderEncryptionKeys();
      case 'tls':
        return renderTLSConfig();
      case 'pii':
        return renderPIIDetection();
      case 'anonymization':
        return renderAnonymization();
      case 'files':
        return renderSecureFiles();
      case 'residency':
        return renderDataResidency();
      case 'backup':
        return renderBackupRecovery();
      case 'audit':
        return renderAuditLogs();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Protection</h1>
          <p className="text-gray-600 mt-2">
            Manage encryption, PII detection, anonymization, and data compliance
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

export default DataProtectionHub;
