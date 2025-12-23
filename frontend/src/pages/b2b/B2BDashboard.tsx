import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getClientDashboardStats,
  getVendorDashboardStats,
  getRecentRequirements,
  getRecentPlacements,
  getPendingContracts,
  DashboardStat,
  RecentItem,
  PendingContract,
} from '../../services/b2b.service';

const B2BDashboard: React.FC = () => {
  const { user } = useAuth();
  const isVendor = user?.role === 'VENDOR';

  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [pendingContracts, setPendingContracts] = useState<PendingContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [isVendor]);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [statsData, recentData, contractsData] = await Promise.all([
        isVendor ? getVendorDashboardStats() : getClientDashboardStats(),
        isVendor ? getRecentPlacements(3) : getRecentRequirements(3),
        getPendingContracts(2),
      ]);

      setStats(statsData);
      setRecentItems(recentData);
      setPendingContracts(contractsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('open')) {
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    }
    if (statusLower.includes('draft')) {
      return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
    if (
      statusLower.includes('pending') ||
      statusLower.includes('waiting') ||
      statusLower.includes('submitted')
    ) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    }
    if (statusLower.includes('negotiation')) {
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    }
    if (statusLower.includes('closed') || statusLower.includes('rejected')) {
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mx-auto"></div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-2xl p-10 max-w-lg w-full shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-2xl mb-6">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
            Failed to Load Dashboard
          </h3>
          <p className="text-red-600 dark:text-red-400 text-center mb-8 px-4">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {isVendor ? 'Vendor Dashboard' : 'Client Dashboard'}
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400 mt-2">
                Manage your {isVendor ? 'consultants and placements' : 'requirements and contracts'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center px-5 py-3 border border-slate-300 dark:border-slate-600 text-sm font-semibold rounded-xl shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`-ml-1 mr-2.5 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* Primary Action Button */}
              {!isVendor ? (
                <Link
                  to="/b2b/requirements/new"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40"
                >
                  <svg
                    className="-ml-1 mr-2.5 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Post Requirement
                </Link>
              ) : (
                <Link
                  to="/b2b/supply/upload"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40"
                >
                  <svg
                    className="-ml-1 mr-2.5 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Upload Profiles
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.length > 0 ? (
            stats.map((item) => (
              <div
                key={item.name}
                className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border border-slate-200 dark:border-slate-700 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <svg
                        className="h-7 w-7 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={item.icon}
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate mb-2">
                        {item.name}
                      </dt>
                      <dd className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {item.value}
                      </dd>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3.5 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm">
                    <span className={`font-semibold ${getChangeTypeColor(item.changeType)}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <svg
                className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
                No statistics available
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity & Pending Contracts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Requirements / Placements */}
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10">
              <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                {isVendor ? 'Recent Placements' : 'Recent Requirements'}
              </h3>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <li
                    key={item.id}
                    className="px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors pr-4">
                        {item.title}
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          {isVendor ? `Placed: ${item.count}` : `Required: ${item.count}`}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {item.applicants} {isVendor ? 'Submitted' : 'Proposals'}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-6 py-16 text-center">
                  <svg
                    className="mx-auto h-14 w-14 text-slate-400 dark:text-slate-500 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">
                    No {isVendor ? 'placements' : 'requirements'} found
                  </p>
                  {!isVendor && (
                    <Link
                      to="/b2b/requirements/new"
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                    >
                      Post your first requirement
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  )}
                </li>
              )}
            </ul>
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 rounded-b-2xl border-t border-slate-200 dark:border-slate-700">
              <Link
                to="/b2b/requirements"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 group"
              >
                View all {isVendor ? 'placements' : 'requirements'}
                <svg
                  className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Pending Contracts */}
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10">
              <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <svg
                    className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                Pending Contracts
              </h3>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {pendingContracts.length > 0 ? (
                pendingContracts.map((contract) => (
                  <li
                    key={contract.id}
                    className="px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">
                        {contract.partner}
                      </div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(contract.date)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {contract.role}
                      </div>
                      <span
                        className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border whitespace-nowrap ${getStatusColor(contract.status)}`}
                      >
                        {contract.status}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-6 py-16 text-center">
                  <svg
                    className="mx-auto h-14 w-14 text-slate-400 dark:text-slate-500 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    No pending contracts
                  </p>
                </li>
              )}
            </ul>
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 rounded-b-2xl border-t border-slate-200 dark:border-slate-700">
              <Link
                to="/b2b/contracts"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 group"
              >
                View all contracts
                <svg
                  className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;
