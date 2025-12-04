import { useEffect, useState } from 'react';
import {
  getSystemHealth,
  getErrorLogs,
  getErrorStats,
  getDatabaseMetrics,
  getPerformanceMetrics,
  getCacheMetrics,
  getEngagementMetrics,
} from '../services/admin.service';

interface SystemHealth {
  status: string;
  uptime: number;
  version: string;
  environment: string;
  timestamp: string;
  services: {
    database: string;
    cache: string;
    storage: string;
    email: string;
  };
}

interface ErrorLog {
  id: string;
  level: string;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
  resolved: boolean;
  createdAt: string;
}

interface ErrorStats {
  total: number;
  byLevel: Array<{ level: string; count: number }>;
  byEndpoint: Array<{ endpoint: string; count: number }>;
  resolvedCount: number;
  unresolvedCount: number;
}

interface DatabaseMetrics {
  totalSize: number;
  tableCount: number;
  connectionCount: number;
  activeQueries: number;
  slowQueries: number;
  avgQueryTime: number;
}

interface PerformanceMetrics {
  avgResponseTime: number;
  requestsPerMinute: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
}

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalKeys: number;
  memoryUsed: number;
  evictions: number;
}

const AdminMonitoring = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);

  // Filters
  const [errorLevel, setErrorLevel] = useState('all');
  const [errorResolved, setErrorResolved] = useState('all');
  const [errorPage, setErrorPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [activeTab, errorLevel, errorResolved, errorPage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh) {
      interval = setInterval(() => {
        loadData();
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Always load system health for overview
      const health = await getSystemHealth();
      setSystemHealth(health);

      if (activeTab === 'overview' || activeTab === 'performance') {
        const perf = await getPerformanceMetrics('1h');
        setPerformanceMetrics(perf);

        const db = await getDatabaseMetrics();
        setDatabaseMetrics(db);

        const cache = await getCacheMetrics();
        setCacheMetrics(cache);
      }

      if (activeTab === 'errors') {
        const errors = await getErrorLogs({
          page: errorPage,
          limit: 20,
          level: errorLevel !== 'all' ? errorLevel : undefined,
          resolved: errorResolved !== 'all' ? errorResolved === 'true' : undefined,
        });
        setErrorLogs(errors.logs || errors);

        const stats = await getErrorStats('24h');
        setErrorStats(stats);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      healthy: 'text-green-600 bg-green-100',
      degraded: 'text-yellow-600 bg-yellow-100',
      down: 'text-red-600 bg-red-100',
      unknown: 'text-gray-600 bg-gray-100',
    };
    return colors[status.toLowerCase()] || colors.unknown;
  };

  const getErrorLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      INFO: 'bg-blue-100 text-blue-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      CRITICAL: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[level] || 'bg-gray-100 text-gray-800'}`}>
        {level}
      </span>
    );
  };

  const getHealthIcon = (status: string) => {
    const icons: Record<string, string> = {
      healthy: '✅',
      degraded: '⚠️',
      down: '❌',
      unknown: '❓',
    };
    return icons[status.toLowerCase()] || icons.unknown;
  };

  if (loading && activeTab === 'overview') {
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600 mt-2">Monitor system health, performance, and errors</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Auto-refresh ({refreshInterval}s)</span>
            </label>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* System Health Status Bar */}
        {systemHealth && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{getHealthIcon(systemHealth.status)}</span>
                <div>
                  <h2 className="text-xl font-semibold">System Status</h2>
                  <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${getStatusColor(systemHealth.status)}`}>
                    {systemHealth.status.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-lg font-semibold">{formatUptime(systemHealth.uptime)}</p>
                <p className="text-xs text-gray-500">v{systemHealth.version} - {systemHealth.environment}</p>
              </div>
            </div>

            {/* Services Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {Object.entries(systemHealth.services || {}).map(([service, status]) => (
                <div key={service} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{service}</span>
                    <span className="text-lg">{getHealthIcon(status)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'performance', label: 'Performance', icon: '⚡' },
                { id: 'errors', label: 'Error Logs', icon: '🚨' },
                { id: 'database', label: 'Database', icon: '💾' },
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

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                {performanceMetrics && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Avg Response Time</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{performanceMetrics.avgResponseTime}ms</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Requests/Minute</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{performanceMetrics.requestsPerMinute}</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <p className="text-gray-600 text-sm">CPU Usage</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{performanceMetrics.cpuUsage}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Database & Cache */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {databaseMetrics && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Database</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Connections</span>
                          <span className="font-medium">{databaseMetrics.connectionCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active Queries</span>
                          <span className="font-medium">{databaseMetrics.activeQueries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Query Time</span>
                          <span className="font-medium">{databaseMetrics.avgQueryTime}ms</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {cacheMetrics && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Cache</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hit Rate</span>
                          <span className="font-medium">{cacheMetrics.hitRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Keys</span>
                          <span className="font-medium">{cacheMetrics.totalKeys}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Memory Used</span>
                          <span className="font-medium">{cacheMetrics.memoryUsed} MB</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && performanceMetrics && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Detailed Performance Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Response Time</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{performanceMetrics.avgResponseTime}ms</p>
                      </div>
                      <span className="text-3xl">⚡</span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">CPU Usage</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{performanceMetrics.cpuUsage}%</p>
                      </div>
                      <span className="text-3xl">💻</span>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Memory Usage</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{performanceMetrics.memoryUsage}%</p>
                      </div>
                      <span className="text-3xl">🧠</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-sm font-medium">Disk Usage</p>
                        <p className="text-3xl font-bold text-yellow-900 mt-2">{performanceMetrics.diskUsage}%</p>
                      </div>
                      <span className="text-3xl">💾</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-600 text-sm font-medium">Network In</p>
                        <p className="text-3xl font-bold text-indigo-900 mt-2">{performanceMetrics.networkIn} MB/s</p>
                      </div>
                      <span className="text-3xl">📥</span>
                    </div>
                  </div>

                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-600 text-sm font-medium">Network Out</p>
                        <p className="text-3xl font-bold text-pink-900 mt-2">{performanceMetrics.networkOut} MB/s</p>
                      </div>
                      <span className="text-3xl">📤</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Error Logs</h3>
                  <div className="flex space-x-3">
                    <select
                      value={errorLevel}
                      onChange={(e) => setErrorLevel(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">All Levels</option>
                      <option value="INFO">Info</option>
                      <option value="WARNING">Warning</option>
                      <option value="ERROR">Error</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <select
                      value={errorResolved}
                      onChange={(e) => setErrorResolved(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="false">Unresolved</option>
                      <option value="true">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Error Stats */}
                {errorStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                      <p className="text-gray-600 text-sm">Total Errors</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{errorStats.total}</p>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <p className="text-gray-600 text-sm">Unresolved</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">{errorStats.unresolvedCount}</p>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <p className="text-gray-600 text-sm">Resolved</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{errorStats.resolvedCount}</p>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <p className="text-gray-600 text-sm">Resolution Rate</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {errorStats.total > 0 ? Math.round((errorStats.resolvedCount / errorStats.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Logs Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {errorLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No error logs found. Your system is running smoothly!
                          </td>
                        </tr>
                      ) : (
                        errorLogs.map((error) => (
                          <tr key={error.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{getErrorLevelBadge(error.level)}</td>
                            <td className="px-6 py-4">
                              <div className="max-w-md">
                                <p className="text-sm font-medium text-gray-900 truncate">{error.message}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs font-mono text-gray-600">
                                {error.method} {error.endpoint || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{error.statusCode || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(error.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {error.resolved ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Resolved
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Open
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setErrorPage(Math.max(1, errorPage - 1))}
                    disabled={errorPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {errorPage}</span>
                  <button
                    onClick={() => setErrorPage(errorPage + 1)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Database Tab */}
            {activeTab === 'database' && databaseMetrics && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Database Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <p className="text-gray-600 text-sm">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{databaseMetrics.totalSize} MB</p>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <p className="text-gray-600 text-sm">Tables</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{databaseMetrics.tableCount}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <p className="text-gray-600 text-sm">Active Connections</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{databaseMetrics.connectionCount}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <p className="text-gray-600 text-sm">Active Queries</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{databaseMetrics.activeQueries}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <p className="text-gray-600 text-sm">Slow Queries</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{databaseMetrics.slowQueries}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <p className="text-gray-600 text-sm">Avg Query Time</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{databaseMetrics.avgQueryTime}ms</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMonitoring;
