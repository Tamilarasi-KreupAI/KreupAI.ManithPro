import { useEffect, useState } from 'react';
import {
  getSystemHealth,
  getErrorLogs,
  getErrorStats,
  getDatabaseMetrics,
  getPerformanceMetrics,
  getCacheMetrics,
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
  const [refreshInterval] = useState(30);

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
    let interval: any;

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
        const params: any = {
          page: errorPage,
          limit: 20,
          level: errorLevel !== 'all' ? errorLevel : undefined,
          resolved: errorResolved !== 'all' ? errorResolved === 'true' : undefined,
        };
        const errors = await getErrorLogs(params);
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
      healthy: 'text-green-700 bg-green-100 border-green-200',
      degraded: 'text-yellow-700 bg-yellow-100 border-yellow-200',
      down: 'text-red-700 bg-red-100 border-red-200',
      unknown: 'text-slate-700 bg-slate-100 border-slate-200',
    };
    return colors[status.toLowerCase()] || colors.unknown;
  };

  const getErrorLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      INFO: 'bg-blue-100 text-blue-800 border-blue-200',
      WARNING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ERROR: 'bg-red-100 text-red-800 border-red-200',
      CRITICAL: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${colors[level] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Monitoring</h1>
            <p className="text-slate-500 mt-2">Monitor system health, performance, and errors</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <span className="text-sm font-bold text-slate-700">Auto-refresh ({refreshInterval}s)</span>
            </label>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* System Health Status Bar */}
        {systemHealth && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <span className="text-5xl">{getHealthIcon(systemHealth.status)}</span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">System Status</h2>
                  <div className="mt-2">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getStatusColor(systemHealth.status)}`}>
                      {systemHealth.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Uptime</p>
                <p className="text-2xl font-bold text-slate-900">{formatUptime(systemHealth.uptime)}</p>
                <p className="text-xs text-slate-400 mt-1">v{systemHealth.version} • {systemHealth.environment}</p>
              </div>
            </div>

            {/* Services Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(systemHealth.services || {}).map(([service, status]) => (
                <div key={service} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700 capitalize">{service}</span>
                    <span className="text-lg">{getHealthIcon(status)}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="border-b border-slate-100">
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
                  className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id
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

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Performance Metrics */}
                {performanceMetrics && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg Response Time</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{performanceMetrics.avgResponseTime}ms</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Requests/Minute</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{performanceMetrics.requestsPerMinute}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">CPU Usage</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{performanceMetrics.cpuUsage}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Database & Cache */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {databaseMetrics && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Database Health</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-sm font-medium text-slate-600">Connections</span>
                          <span className="font-bold text-slate-900">{databaseMetrics.connectionCount}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-sm font-medium text-slate-600">Active Queries</span>
                          <span className="font-bold text-slate-900">{databaseMetrics.activeQueries}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-sm font-medium text-slate-600">Avg Query Time</span>
                          <span className="font-bold text-slate-900">{databaseMetrics.avgQueryTime}ms</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {cacheMetrics && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Cache Performance</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-sm font-medium text-slate-600">Hit Rate</span>
                          <span className="font-bold text-green-600">{cacheMetrics.hitRate}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-sm font-medium text-slate-600">Total Keys</span>
                          <span className="font-bold text-slate-900">{cacheMetrics.totalKeys}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-sm font-medium text-slate-600">Memory Used</span>
                          <span className="font-bold text-slate-900">{cacheMetrics.memoryUsed} MB</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && performanceMetrics && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-slate-900">Detailed Performance Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Response Time</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{performanceMetrics.avgResponseTime}ms</p>
                      </div>
                      <span className="text-4xl">⚡</span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-xs font-bold uppercase tracking-wider">CPU Usage</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{performanceMetrics.cpuUsage}%</p>
                      </div>
                      <span className="text-4xl">💻</span>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-xs font-bold uppercase tracking-wider">Memory Usage</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{performanceMetrics.memoryUsage}%</p>
                      </div>
                      <span className="text-4xl">🧠</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-xs font-bold uppercase tracking-wider">Disk Usage</p>
                        <p className="text-3xl font-bold text-yellow-900 mt-2">{performanceMetrics.diskUsage}%</p>
                      </div>
                      <span className="text-4xl">💾</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider">Network In</p>
                        <p className="text-3xl font-bold text-indigo-900 mt-2">{performanceMetrics.networkIn} MB/s</p>
                      </div>
                      <span className="text-4xl">📥</span>
                    </div>
                  </div>

                  <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-600 text-xs font-bold uppercase tracking-wider">Network Out</p>
                        <p className="text-3xl font-bold text-pink-900 mt-2">{performanceMetrics.networkOut} MB/s</p>
                      </div>
                      <span className="text-4xl">📤</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Error Logs</h3>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <select
                        value={errorLevel}
                        onChange={(e) => setErrorLevel(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Levels</option>
                        <option value="INFO">Info</option>
                        <option value="WARNING">Warning</option>
                        <option value="ERROR">Error</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                    <div className="relative">
                      <select
                        value={errorResolved}
                        onChange={(e) => setErrorResolved(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="false">Unresolved</option>
                        <option value="true">Resolved</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                  </div>
                </div>

                {/* Error Stats */}
                {errorStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Errors</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{errorStats.total}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                      <p className="text-red-600 text-xs font-bold uppercase tracking-wider">Unresolved</p>
                      <p className="text-3xl font-bold text-red-700 mt-2">{errorStats.unresolvedCount}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                      <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Resolved</p>
                      <p className="text-3xl font-bold text-green-700 mt-2">{errorStats.resolvedCount}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                      <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Resolution Rate</p>
                      <p className="text-3xl font-bold text-blue-700 mt-2">
                        {errorStats.total > 0 ? Math.round((errorStats.resolvedCount / errorStats.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Logs Table */}
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Level</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Endpoint</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status Code</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {errorLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                              <p className="text-lg font-medium">No error logs found</p>
                              <p className="text-sm">Your system is running smoothly! 🎉</p>
                            </td>
                          </tr>
                        ) : (
                          errorLogs.map((error) => (
                            <tr key={error.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">{getErrorLevelBadge(error.level)}</td>
                              <td className="px-6 py-4">
                                <div className="max-w-md">
                                  <p className="text-sm font-bold text-slate-900 truncate" title={error.message}>{error.message}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                                  {error.method} {error.endpoint || '-'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-600">{error.statusCode || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {formatDate(error.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {error.resolved ? (
                                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">
                                    Resolved
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
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
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setErrorPage(Math.max(1, errorPage - 1))}
                    disabled={errorPage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-600">Page {errorPage}</span>
                  <button
                    onClick={() => setErrorPage(errorPage + 1)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Database Tab */}
            {activeTab === 'database' && databaseMetrics && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-slate-900">Database Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Size</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{databaseMetrics.totalSize} MB</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tables</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{databaseMetrics.tableCount}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Connections</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{databaseMetrics.connectionCount}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Queries</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{databaseMetrics.activeQueries}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Slow Queries</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{databaseMetrics.slowQueries}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg Query Time</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{databaseMetrics.avgQueryTime}ms</p>
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
