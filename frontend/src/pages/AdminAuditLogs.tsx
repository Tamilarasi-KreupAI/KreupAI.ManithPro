import React, { useState, useEffect } from 'react';
import { getAllAuditLogs, getAuditLogStats, exportAuditLogs } from '../services/admin.service';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [currentPage, actionFilter, entityFilter, dateFrom, dateTo]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 50 };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const [logsData, statsData] = await Promise.all([
        getAllAuditLogs(params),
        getAuditLogStats('30d'),
      ]);

      setLogs(logsData.logs);
      setTotalPages(logsData.pagination.pages);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      await exportAuditLogs(params);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  if (loading && logs.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading audit logs...</div>;
  }

  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Logs (30d)</div>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Top Action</div>
            <div className="text-xl font-bold">{stats.byAction[0]?.action || 'N/A'}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Top Entity</div>
            <div className="text-xl font-bold">{stats.byEntity[0]?.entity || 'N/A'}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Most Active User</div>
            <div className="text-sm font-bold truncate">{stats.mostActiveUsers[0]?.name || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>
          <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Job">Job</option>
            <option value="Application">Application</option>
            <option value="Interview">Interview</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded px-3 py-2" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded px-3 py-2" />
          <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Export CSV
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="font-medium">{log.user.firstName} {log.user.lastName}</div>
                    <div className="text-sm text-gray-500">{log.user.role}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{log.action}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">{log.entity}</td>
                  <td className="px-4 py-4 text-sm">{log.description || '-'}</td>
                  <td className="px-4 py-4 text-sm">{log.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">Page {currentPage} of {totalPages}</div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
