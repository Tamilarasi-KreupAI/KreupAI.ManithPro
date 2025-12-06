// Batch 29: Compliance Hub Component (8.3.1-8.3.11)
import React, { useState, useEffect } from 'react';
import {
  GDPRConsentRecord,
  CCPARequest,
  EEOCReport,
  DataRetentionPolicy,
  DeletionRequest,
  ConsentPolicy,
  UserConsent,
  DataSubjectRequest,
  ComplianceAuditLog,
  ComplianceMetric,
  ComplianceDashboard,
  BiasAuditReport,
  SOC2Control,
  SOC2Audit,
  SOC2ReadinessScore,
  ComplianceStats
} from '../../types';
import {
  gdprAPI,
  ccpaAPI,
  eeocAPI,
  retentionAPI,
  deletionAPI,
  consentAPI,
  dsarAPI,
  auditAPI,
  dashboardAPI,
  biasAuditAPI,
  soc2API,
  statsAPI
} from '../../services/batch29ComplianceAPI';

type TabType = 'dashboard' | 'gdpr' | 'ccpa' | 'eeoc' | 'retention' | 'deletion' | 'consent' | 'dsar' | 'audit' | 'bias' | 'soc2';

const ComplianceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard state
  const [dashboard, setDashboard] = useState<ComplianceDashboard | null>(null);
  const [stats, setStats] = useState<ComplianceStats | null>(null);

  // GDPR state
  const [gdprRecords, setGdprRecords] = useState<GDPRConsentRecord[]>([]);

  // CCPA state
  const [ccpaRequests, setCcpaRequests] = useState<CCPARequest[]>([]);

  // EEOC state
  const [eeocReports, setEeocReports] = useState<EEOCReport[]>([]);

  // Retention state
  const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicy[]>([]);

  // Deletion state
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);

  // Consent state
  const [consentPolicies, setConsentPolicies] = useState<ConsentPolicy[]>([]);
  const [userConsents, setUserConsents] = useState<UserConsent[]>([]);

  // DSAR state
  const [dsarRequests, setDsarRequests] = useState<DataSubjectRequest[]>([]);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<ComplianceAuditLog[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);

  // Bias Audit state
  const [biasReports, setBiasReports] = useState<BiasAuditReport[]>([]);

  // SOC 2 state
  const [soc2Controls, setSoc2Controls] = useState<SOC2Control[]>([]);
  const [soc2Audits, setSoc2Audits] = useState<SOC2Audit[]>([]);
  const [soc2Readiness, setSoc2Readiness] = useState<SOC2ReadinessScore | null>(null);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'dashboard':
          const [dashboardData, statsData] = await Promise.all([
            dashboardAPI.getDashboard(),
            statsAPI.getStats()
          ]);
          setDashboard(dashboardData);
          setStats(statsData);
          break;
        case 'gdpr':
          const gdprData = await gdprAPI.getRecords();
          setGdprRecords(gdprData);
          break;
        case 'ccpa':
          const ccpaData = await ccpaAPI.getRequests();
          setCcpaRequests(ccpaData);
          break;
        case 'eeoc':
          const eeocData = await eeocAPI.getReports();
          setEeocReports(eeocData);
          break;
        case 'retention':
          const retentionData = await retentionAPI.getPolicies();
          setRetentionPolicies(retentionData);
          break;
        case 'deletion':
          const deletionData = await deletionAPI.getRequests();
          setDeletionRequests(deletionData);
          break;
        case 'consent':
          const [policiesData, consentsData] = await Promise.all([
            consentAPI.getPolicies(),
            consentAPI.getUserConsents()
          ]);
          setConsentPolicies(policiesData);
          setUserConsents(consentsData);
          break;
        case 'dsar':
          const dsarData = await dsarAPI.getRequests();
          setDsarRequests(dsarData);
          break;
        case 'audit':
          const [logsData, metricsData] = await Promise.all([
            auditAPI.getLogs(),
            auditAPI.getMetrics()
          ]);
          setAuditLogs(logsData);
          setMetrics(metricsData);
          break;
        case 'bias':
          const biasData = await biasAuditAPI.getReports();
          setBiasReports(biasData);
          break;
        case 'soc2':
          const [controlsData, auditsData, readinessData] = await Promise.all([
            soc2API.getControls(),
            soc2API.getAudits(),
            soc2API.getReadiness()
          ]);
          setSoc2Controls(controlsData);
          setSoc2Audits(auditsData);
          setSoc2Readiness(readinessData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'gdpr', label: 'GDPR', icon: '🇪🇺' },
    { id: 'ccpa', label: 'CCPA', icon: '🇺🇸' },
    { id: 'eeoc', label: 'EEOC', icon: '⚖️' },
    { id: 'retention', label: 'Retention', icon: '📅' },
    { id: 'deletion', label: 'Deletion', icon: '🗑️' },
    { id: 'consent', label: 'Consent', icon: '✅' },
    { id: 'dsar', label: 'DSAR', icon: '📝' },
    { id: 'audit', label: 'Audit', icon: '📋' },
    { id: 'bias', label: 'Bias Audit', icon: '⚖️' },
    { id: 'soc2', label: 'SOC 2', icon: '🔒' }
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      withdrawn: 'bg-orange-100 text-orange-800',
      implemented: 'bg-green-100 text-green-800',
      not_implemented: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderDashboard = () => {
    if (!dashboard || !stats) return null;
    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Overall Compliance</h3>
            <p className="text-3xl font-bold text-green-600">{dashboard.overallComplianceScore}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600">{dashboard.pendingRequests}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">GDPR Score</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboard.gdprCompliance}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">CCPA Score</h3>
            <p className="text-3xl font-bold text-purple-600">{dashboard.ccpaCompliance}%</p>
          </div>
        </div>

        {/* Request Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Request Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold">{stats.totalDsarRequests}</p>
              <p className="text-sm text-gray-500">Total DSARs</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold">{stats.pendingDsarRequests}</p>
              <p className="text-sm text-gray-500">Pending DSARs</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold">{stats.totalDeletionRequests}</p>
              <p className="text-sm text-gray-500">Deletion Requests</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold">{stats.averageResponseTime}h</p>
              <p className="text-sm text-gray-500">Avg Response Time</p>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-2">
            {dashboard.upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{deadline.type}</p>
                  <p className="text-sm text-gray-500">{deadline.description}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  new Date(deadline.deadline) < new Date() ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formatDate(deadline.deadline)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-2">
            {dashboard.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center p-3 border-b last:border-0">
                <span className={`px-2 py-1 rounded text-xs mr-3 ${getStatusBadge(activity.type)}`}>
                  {activity.type}
                </span>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-400">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGDPR = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">GDPR Consent Records</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Export Records
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lawful Basis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Given At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gdprRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{record.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{record.purpose}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{record.lawfulBasis}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(record.consentGivenAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                  <button className="text-red-600 hover:text-red-800">Withdraw</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCCPA = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">CCPA Requests</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          New Request
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ccpaRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{request.id.slice(0, 8)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.requestType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.consumerEmail}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(request.deadline)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Process</button>
                  <button className="text-green-600 hover:text-green-800">Complete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEEOC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">EEOC Reports</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Generate Report
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eeocReports.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{report.reportType}</h3>
                <p className="text-sm text-gray-500">{report.reportingPeriod}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(report.status)}`}>
                {report.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Employees:</span>
                <span className="font-medium">{report.data.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Applicants:</span>
                <span className="font-medium">{report.data.totalApplicants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Hires:</span>
                <span className="font-medium">{report.data.totalHires}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
              <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
              <button className="text-green-600 hover:text-green-800 text-sm">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRetention = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Data Retention Policies</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add Policy
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {retentionPolicies.map((policy) => (
          <div key={policy.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{policy.name}</h3>
                <p className="text-sm text-gray-500">{policy.dataCategory}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {policy.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{policy.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Retention Period:</span>
                <p className="font-medium">{policy.retentionPeriodDays} days</p>
              </div>
              <div>
                <span className="text-gray-500">Auto Delete:</span>
                <p className="font-medium">{policy.autoDelete ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-gray-500">Legal Basis:</span>
                <p className="font-medium">{policy.legalBasis}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Run:</span>
                <p className="font-medium">{policy.lastRunAt ? formatDate(policy.lastRunAt) : 'Never'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              <button className="text-purple-600 hover:text-purple-800 text-sm">Run Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeletion = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Deletion Requests</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          New Request
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deletionRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{request.id.slice(0, 8)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.deletionType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(request.scheduledAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                  {request.status === 'pending' && (
                    <>
                      <button className="text-green-600 hover:text-green-800 mr-2">Execute</button>
                      <button className="text-red-600 hover:text-red-800">Cancel</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConsent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Consent Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          New Policy
        </button>
      </div>

      {/* Consent Policies */}
      <div>
        <h3 className="text-lg font-medium mb-4">Consent Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consentPolicies.map((policy) => (
            <div key={policy.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold">{policy.name}</h4>
                  <p className="text-sm text-gray-500">v{policy.version}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {policy.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{policy.description}</p>
              <div className="text-sm">
                <span className="text-gray-500">Applicable Regions:</span>
                <p className="font-medium">{policy.applicableRegions.join(', ')}</p>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button className="text-purple-600 hover:text-purple-800 text-sm">New Version</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Consents */}
      <div>
        <h3 className="text-lg font-medium mb-4">User Consents</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Given At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userConsents.map((consent) => (
                <tr key={consent.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{consent.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{consent.policyId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(consent.status)}`}>
                      {consent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(consent.consentGivenAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                    <button className="text-red-600 hover:text-red-800">Withdraw</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDSAR = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Data Subject Access Requests</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          New DSAR
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dsarRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{request.id.slice(0, 8)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.requestType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.subjectEmail}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(request.deadline)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${request.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{request.completionPercentage}%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Process</button>
                  <button className="text-green-600 hover:text-green-800">Complete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Compliance Audit</h2>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Export Logs
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Run Audit
          </button>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div>
        <h3 className="text-lg font-medium mb-4">Compliance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500">{metric.name}</h4>
              <p className="text-2xl font-bold mt-2">
                {metric.value}{metric.unit === 'percentage' ? '%' : metric.unit === 'hours' ? 'h' : ''}
              </p>
              <div className="mt-2 flex items-center">
                <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {metric.changePercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div>
        <h3 className="text-lg font-medium mb-4">Audit Logs</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(log.timestamp)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.performedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${log.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {log.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBiasAudit = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bias Auditing</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Run Audit
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {biasReports.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{report.auditType} Audit</h3>
                <p className="text-sm text-gray-500">{report.scope}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(report.status)}`}>
                {report.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{report.methodology}</p>

            {/* Findings */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Findings</h4>
              <div className="space-y-2">
                {report.findings.slice(0, 2).map((finding, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex justify-between">
                      <span>{finding.category}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        finding.severity === 'high' ? 'bg-red-100 text-red-800' :
                        finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>{finding.severity}</span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">{finding.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Results */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Statistical Tests</h4>
              <div className="grid grid-cols-2 gap-2">
                {report.testResults.slice(0, 2).map((test, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <span className="text-gray-500">{test.testName}:</span>
                    <span className={`ml-2 ${test.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {test.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <button className="text-blue-600 hover:text-blue-800 text-sm">View Full Report</button>
              <button className="text-green-600 hover:text-green-800 text-sm">Download PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSOC2 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">SOC 2 Readiness</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Schedule Audit
        </button>
      </div>

      {/* Readiness Score */}
      {soc2Readiness && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overall Readiness</h3>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600">{soc2Readiness.overallScore}%</div>
              <p className="text-gray-500">Overall Score</p>
            </div>
            <div className="flex-1 grid grid-cols-5 gap-4">
              {Object.entries(soc2Readiness.categoryScores).map(([category, score]) => (
                <div key={category} className="text-center">
                  <div className="text-2xl font-semibold">{score}%</div>
                  <p className="text-xs text-gray-500 capitalize">{category}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Last Assessment: {formatDate(soc2Readiness.lastAssessment)}</span>
              <span>Next Scheduled: {formatDate(soc2Readiness.nextScheduledAssessment)}</span>
            </div>
          </div>
        </div>
      )}

      {/* SOC 2 Controls */}
      <div>
        <h3 className="text-lg font-medium mb-4">Controls</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {soc2Controls.map((control) => (
                <tr key={control.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{control.controlId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{control.category}</td>
                  <td className="px-6 py-4 text-sm">{control.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(control.implementationStatus)}`}>
                      {control.implementationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {control.evidenceLinks.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                    <button className="text-green-600 hover:text-green-800">Add Evidence</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SOC 2 Audits */}
      <div>
        <h3 className="text-lg font-medium mb-4">Audit History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {soc2Audits.map((audit) => (
            <div key={audit.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold">{audit.auditType}</h4>
                  <p className="text-sm text-gray-500">{audit.auditorFirm}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(audit.status)}`}>
                  {audit.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Period:</span>
                  <span>{formatDate(audit.auditPeriodStart)} - {formatDate(audit.auditPeriodEnd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Controls:</span>
                  <span>{audit.controlsAssessed} assessed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Findings:</span>
                  <span>{audit.findingsCount} findings</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between">
                <button className="text-blue-600 hover:text-blue-800 text-sm">View Report</button>
                {audit.reportUrl && (
                  <button className="text-green-600 hover:text-green-800 text-sm">Download</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'gdpr': return renderGDPR();
      case 'ccpa': return renderCCPA();
      case 'eeoc': return renderEEOC();
      case 'retention': return renderRetention();
      case 'deletion': return renderDeletion();
      case 'consent': return renderConsent();
      case 'dsar': return renderDSAR();
      case 'audit': return renderAudit();
      case 'bias': return renderBiasAudit();
      case 'soc2': return renderSOC2();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Compliance Hub</h1>
          <p className="text-gray-500">Manage GDPR, CCPA, EEOC compliance and data protection</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ComplianceHub;
