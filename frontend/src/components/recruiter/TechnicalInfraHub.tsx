// Batch 46-49: Technical Infrastructure Hub Component (14.1-14.4)
import React, { useState, useEffect } from 'react';
import {
  APIKey,
  RateLimitRule,
  CacheStats,
  Webhook,
  TestSuite,
  TestRun,
  CodeQualityReport,
  CIPipeline,
  SystemMetrics,
  ErrorLog,
  AuditLogEntry,
  AlertRule,
  AlertIncident,
  Deployment,
  DeploymentEnvironment,
  FeatureFlag,
  ServiceHealth,
  BackupRecord,
  TechnicalDashboard,
} from '../../types';
import infraAPI from '../../services/batch46_49TechnicalInfraAPI';

type TabType = 'dashboard' | 'api' | 'testing' | 'monitoring' | 'devops';

const TechnicalInfraHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard state
  const [dashboard, setDashboard] = useState<TechnicalDashboard | null>(null);

  // API Infrastructure state (Batch 46)
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitRule[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  // Testing & Quality state (Batch 47)
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [qualityReports, setQualityReports] = useState<CodeQualityReport[]>([]);
  const [pipelines, setPipelines] = useState<CIPipeline[]>([]);

  // Monitoring state (Batch 48)
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [incidents, setIncidents] = useState<AlertIncident[]>([]);

  // DevOps state (Batch 49)
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'dashboard':
          const dashRes = await infraAPI.dashboard.getDashboard();
          setDashboard(dashRes.dashboard || null);
          break;

        case 'api':
          const [keysRes, limitsRes, cacheRes, webhooksRes] = await Promise.all([
            infraAPI.apiKeys.getKeys(),
            infraAPI.rateLimits.getRules(),
            infraAPI.cache.getStats(),
            infraAPI.webhooks.getWebhooks(),
          ]);
          setApiKeys(keysRes.apiKeys || []);
          setRateLimits(limitsRes.rules || []);
          setCacheStats(cacheRes.stats || null);
          setWebhooks(webhooksRes.webhooks || []);
          break;

        case 'testing':
          const [suitesRes, runsRes, qualityRes, pipelinesRes] = await Promise.all([
            infraAPI.testSuites.getSuites(),
            infraAPI.testRuns.getRuns(),
            infraAPI.codeQuality.getReports(),
            infraAPI.pipelines.getPipelines(),
          ]);
          setTestSuites(suitesRes.suites || []);
          setTestRuns(runsRes.runs || []);
          setQualityReports(qualityRes.reports || []);
          setPipelines(pipelinesRes.pipelines || []);
          break;

        case 'monitoring':
          const [metricsRes, errorsRes, logsRes, rulesRes, incidentsRes] = await Promise.all([
            infraAPI.metrics.getMetrics(),
            infraAPI.errors.getErrors(),
            infraAPI.auditLogs.getLogs(),
            infraAPI.alerts.getRules(),
            infraAPI.alerts.getIncidents(),
          ]);
          setMetrics(metricsRes.metrics || null);
          setErrors(errorsRes.errors || []);
          setAuditLogs(logsRes.logs || []);
          setAlertRules(rulesRes.rules || []);
          setIncidents(incidentsRes.incidents || []);
          break;

        case 'devops':
          const [deploysRes, envsRes, flagsRes, healthRes, backupsRes] = await Promise.all([
            infraAPI.deployments.getDeployments(),
            infraAPI.environments.getEnvironments(),
            infraAPI.featureFlags.getFlags(),
            infraAPI.serviceHealth.getServices(),
            infraAPI.backups.getBackups(),
          ]);
          setDeployments(deploysRes.deployments || []);
          setEnvironments(envsRes.environments || []);
          setFeatureFlags(flagsRes.flags || []);
          setServiceHealth(healthRes.services || []);
          setBackups(backupsRes.backups || []);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'api' as TabType, label: 'API Infrastructure', icon: '🔌' },
    { id: 'testing' as TabType, label: 'Testing & Quality', icon: '🧪' },
    { id: 'monitoring' as TabType, label: 'Monitoring', icon: '📈' },
    { id: 'devops' as TabType, label: 'DevOps', icon: '🚀' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {dashboard && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-xl">🔑</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">API Keys</div>
                  <div className="text-2xl font-bold">{dashboard.api.activeKeys}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {dashboard.api.totalRequests.toLocaleString()} requests
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-xl">🧪</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Test Pass Rate</div>
                  <div className="text-2xl font-bold">{dashboard.testing.passRate}%</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {dashboard.testing.totalTests} tests, {dashboard.testing.coveragePercent}% coverage
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">CPU Usage</div>
                  <div className="text-2xl font-bold">{dashboard.monitoring.cpuUsage}%</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {dashboard.monitoring.activeAlerts} active alerts
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Deployments</div>
                  <div className="text-2xl font-bold">{dashboard.devops.recentDeployments}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {dashboard.devops.healthyServices} healthy services
              </div>
            </div>
          </div>

          {/* System Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">System Resources</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU</span>
                    <span>{dashboard.monitoring.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dashboard.monitoring.cpuUsage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory</span>
                    <span>{dashboard.monitoring.memoryUsage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${dashboard.monitoring.memoryUsage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Disk</span>
                    <span>{dashboard.monitoring.diskUsage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${dashboard.monitoring.diskUsage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
              <div className="space-y-3">
                {dashboard.recentEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">
                      {event.type === 'deployment' ? '🚀' : event.type === 'alert' ? '🔔' : '✅'}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{event.message}</div>
                      <div className="text-xs text-gray-500">{event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{dashboard.api.avgResponseTime}ms</div>
              <div className="text-sm text-gray-500">Avg Response</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{dashboard.api.errorRate}%</div>
              <div className="text-sm text-gray-500">Error Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{dashboard.testing.totalSuites}</div>
              <div className="text-sm text-gray-500">Test Suites</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{dashboard.monitoring.openErrors}</div>
              <div className="text-sm text-gray-500">Open Errors</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{dashboard.devops.featureFlags}</div>
              <div className="text-sm text-gray-500">Feature Flags</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{dashboard.devops.backupsCompleted}</div>
              <div className="text-sm text-gray-500">Backups</div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAPIInfra = () => (
    <div className="space-y-6">
      {/* API Keys */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">API Keys</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Create Key
          </button>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Prefix</th>
                <th className="pb-3 font-medium">Scopes</th>
                <th className="pb-3 font-medium">Requests</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{key.name}</td>
                  <td className="py-3 font-mono text-sm">{key.keyPrefix}...</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.slice(0, 2).map((scope, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">{scope}</span>
                      ))}
                      {key.scopes.length > 2 && <span className="text-xs text-gray-500">+{key.scopes.length - 2}</span>}
                    </div>
                  </td>
                  <td className="py-3">{key.totalRequests.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-red-600 hover:text-red-800 text-sm">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Limits & Cache */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Rate Limit Rules</h3>
          </div>
          <div className="p-4 space-y-3">
            {rateLimits.map((rule) => (
              <div key={rule.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-gray-500">{rule.ruleType}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  {rule.requestsPerMinute && <span className="mr-3">{rule.requestsPerMinute}/min</span>}
                  {rule.requestsPerHour && <span>{rule.requestsPerHour}/hour</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {cacheStats && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Cache Statistics</h3>
              <button className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200">Clear Cache</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{cacheStats.hitRate}%</div>
                  <div className="text-sm text-gray-500">Hit Rate</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{cacheStats.totalEntries.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Entries</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Used</span>
                  <span>{Math.round(cacheStats.memoryUsed / 1024 / 1024)} MB / {Math.round(cacheStats.memoryLimit / 1024 / 1024)} MB</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(cacheStats.memoryUsed / cacheStats.memoryLimit) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Webhooks */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Webhooks</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Add Webhook</button>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{webhook.name}</div>
                    <div className="text-sm text-gray-500 font-mono">{webhook.url}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${webhook.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {webhook.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {webhook.events.map((event, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded">{event}</span>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {webhook.totalDeliveries} deliveries ({webhook.successCount} success, {webhook.failureCount} failed)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTesting = () => (
    <div className="space-y-6">
      {/* Test Suites */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Test Suites</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testSuites.map((suite) => (
              <div key={suite.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium">{suite.name}</div>
                    <div className="text-sm text-gray-500">{suite.suiteType} - {suite.framework}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${suite.lastStatus === 'passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {suite.lastStatus}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tests</span>
                    <span>{suite.passingTests}/{suite.totalTests} passing</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(suite.passingTests / suite.totalTests) * 100}%` }}></div>
                  </div>
                </div>
                <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Run Tests</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Test Runs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Test Runs</h3>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Run</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Results</th>
                <th className="pb-3 font-medium">Coverage</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {testRuns.map((run) => (
                <tr key={run.id} className="border-b last:border-0">
                  <td className="py-3">
                    <div className="font-medium">{run.id.substring(0, 8)}</div>
                    <div className="text-sm text-gray-500">{run.branch}</div>
                  </td>
                  <td className="py-3">{run.runType}</td>
                  <td className="py-3">
                    <span className="text-green-600">{run.passed}</span>
                    {run.failed > 0 && <span className="text-red-600 ml-2">{run.failed} failed</span>}
                  </td>
                  <td className="py-3">{run.coveragePercent}%</td>
                  <td className="py-3">{run.duration ? `${(run.duration / 1000).toFixed(1)}s` : '-'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${run.status === 'passed' ? 'bg-green-100 text-green-700' : run.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Quality & CI Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Code Quality Reports</h3>
          </div>
          <div className="p-4 space-y-3">
            {qualityReports.map((report) => (
              <div key={report.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium capitalize">{report.reportType}</div>
                    <div className="text-sm text-gray-500">{report.tool}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{report.grade}</div>
                    <div className="text-sm text-gray-500">{report.overallScore}%</div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  {report.criticalIssues > 0 && <span className="px-2 py-1 bg-red-100 text-red-700 rounded">{report.criticalIssues} critical</span>}
                  {report.majorIssues > 0 && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">{report.majorIssues} major</span>}
                  {report.minorIssues > 0 && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">{report.minorIssues} minor</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">CI Pipelines</h3>
          </div>
          <div className="p-4 space-y-3">
            {pipelines.map((pipeline) => (
              <div key={pipeline.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{pipeline.name}</div>
                    <div className="text-sm text-gray-500">{pipeline.provider}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${pipeline.lastStatus === 'passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pipeline.lastStatus}
                  </span>
                </div>
                <div className="mt-2 flex gap-1">
                  {pipeline.stages.map((stage, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{stage}</span>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {pipeline.successRuns}/{pipeline.totalRuns} successful ({Math.round((pipeline.successRuns / pipeline.totalRuns) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      {/* System Metrics */}
      {metrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">System Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{metrics.cpu.current}%</div>
              <div className="text-sm text-gray-500">CPU Usage</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{metrics.memory.current}%</div>
              <div className="text-sm text-gray-500">Memory</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{metrics.disk.current}%</div>
              <div className="text-sm text-gray-500">Disk</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{metrics.requests.perSecond}</div>
              <div className="text-sm text-gray-500">Req/sec</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts & Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Alert Rules</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Add Rule</button>
          </div>
          <div className="p-4 space-y-3">
            {alertRules.map((rule) => (
              <div key={rule.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-gray-500">{rule.metricName} {rule.condition} {rule.threshold}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${rule.lastStatus === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {rule.lastStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Active Incidents</h3>
          </div>
          <div className="p-4">
            {incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <div key={incident.id} className="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{incident.title}</div>
                        <div className="text-sm text-gray-600">Value: {incident.triggerValue} (threshold: {incident.threshold})</div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Acknowledge</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No active incidents</div>
            )}
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Errors</h3>
        </div>
        <div className="p-4 space-y-3">
          {errors.map((err) => (
            <div key={err.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-red-600">{err.message}</div>
                  <div className="text-sm text-gray-500">{err.service} - {err.endpoint}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${err.status === 'open' ? 'bg-red-100 text-red-700' : err.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {err.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{err.occurrences} occurrences</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Audit Logs</h3>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Resource</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="py-3 font-medium capitalize">{log.action}</td>
                  <td className="py-3">{log.resourceType} {log.resourceName && `- ${log.resourceName}`}</td>
                  <td className="py-3">{log.userId || 'System'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDevOps = () => (
    <div className="space-y-6">
      {/* Deployments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Deployments</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">New Deployment</button>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Version</th>
                <th className="pb-3 font-medium">Environment</th>
                <th className="pb-3 font-medium">Branch</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((deploy) => (
                <tr key={deploy.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{deploy.version}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${deploy.environment === 'production' ? 'bg-red-100 text-red-700' : deploy.environment === 'staging' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {deploy.environment}
                    </span>
                  </td>
                  <td className="py-3">{deploy.branch}</td>
                  <td className="py-3">{deploy.duration}s</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${deploy.status === 'success' ? 'bg-green-100 text-green-700' : deploy.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {deploy.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {deploy.canRollback && <button className="text-orange-600 hover:text-orange-800 text-sm">Rollback</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environments & Service Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Environments</h3>
          </div>
          <div className="p-4 space-y-3">
            {environments.map((env) => (
              <div key={env.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{env.displayName}</div>
                    <div className="text-sm text-gray-500">{env.url}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${env.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {env.status}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  {env.isProtected && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded">Protected</span>}
                  {env.requiresApproval && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded">Approval Required</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Service Health</h3>
          </div>
          <div className="p-4 space-y-3">
            {serviceHealth.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${service.status === 'healthy' ? 'bg-green-500' : service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="font-medium">{service.serviceName}</div>
                    <div className="text-sm text-gray-500">{service.serviceType}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{service.responseTime}ms</div>
                  <div className="text-xs text-gray-500">{service.uptime}% uptime</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Feature Flags</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Create Flag</button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureFlags.map((flag) => (
              <div key={flag.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{flag.name}</div>
                    <div className="text-sm text-gray-500 font-mono">{flag.key}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={flag.isEnabled} className="sr-only peer" readOnly />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  {flag.rolloutPercentage}% rollout - {flag.evaluations.toLocaleString()} evaluations
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backups */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Backups</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Create Backup</button>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Size</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{backup.name}</td>
                  <td className="py-3">{backup.backupType}</td>
                  <td className="py-3">{backup.source}</td>
                  <td className="py-3">{backup.sizeBytes ? `${(backup.sizeBytes / 1024 / 1024 / 1024).toFixed(2)} GB` : '-'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${backup.status === 'completed' ? 'bg-green-100 text-green-700' : backup.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {backup.status}
                    </span>
                    {backup.verified && <span className="ml-1 text-green-600">✓</span>}
                  </td>
                  <td className="py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Restore</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Technical Infrastructure</h1>
          <p className="text-gray-500">API management, testing, monitoring, and DevOps</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'api' && renderAPIInfra()}
            {activeTab === 'testing' && renderTesting()}
            {activeTab === 'monitoring' && renderMonitoring()}
            {activeTab === 'devops' && renderDevOps()}
          </>
        )}
      </div>
    </div>
  );
};

export default TechnicalInfraHub;
