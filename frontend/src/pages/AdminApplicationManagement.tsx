import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllApplications,
  getApplicationStats,
  updateApplicationStatus,
  deleteApplication,
  exportApplications,
} from '../services/admin.service';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  notes?: string;
  resume: string;
  job: {
    id: string;
    title: string;
    companyName: string;
    location: string;
    type: string;
    status: string;
  };
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    skills: string[];
    experience?: number;
  };
  _count: {
    interviews: number;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApplicationStats {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  recentApplications: number;
  averageApplicationsPerJob: number;
  topJobs: Array<{ id: string; title: string; companyName: string; applicationCount: number }>;
}

const AdminApplicationManagement = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [pagination.page, statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getAllApplications({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getApplicationStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    loadApplications();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateApplicationStatus(id, newStatus);
      loadApplications();
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      await deleteApplication(id);
      loadApplications();
      loadStats();
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportApplications({
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      // Convert to CSV and download
      const csv = convertToCSV(data.data);
      downloadCSV(csv, 'applications.csv');
    } catch (error) {
      console.error('Error exporting applications:', error);
      alert('Failed to export applications');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      REVIEWING: 'bg-blue-100 text-blue-700',
      SHORTLISTED: 'bg-purple-100 text-purple-700',
      INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
      REJECTED: 'bg-red-100 text-red-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      WITHDRAWN: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600 mt-2">Manage all job applications across the platform</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Applications</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Recent (30 days)</p>
              <p className="text-2xl font-bold text-blue-600">{stats.recentApplications}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Avg per Job</p>
              <p className="text-2xl font-bold text-green-600">{stats.averageApplicationsPerJob}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">By Status</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {stats.byStatus.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {s.status}: {s.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Jobs */}
        {stats && stats.topJobs.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold mb-3">Top Jobs by Applications</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topJobs.map((job) => (
                <div key={job.id} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <div className="font-medium">{job.title}</div>
                  <div className="text-xs text-blue-600">{job.companyName} • {job.applicationCount} apps</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by candidate or job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWING">Reviewing</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="REJECTED">Rejected</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                title="Export to CSV"
              >
                📥
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interviews
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {app.candidate.firstName} {app.candidate.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{app.candidate.email}</div>
                            <div className="text-xs text-gray-400">
                              {app.candidate.location} • {app.candidate.experience || 0} yrs exp
                            </div>
                            {app.candidate.skills && app.candidate.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {app.candidate.skills.slice(0, 3).map((skill, idx) => (
                                  <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{app.job.title}</div>
                            <div className="text-sm text-gray-500">{app.job.companyName}</div>
                            <div className="text-xs text-gray-400">{app.job.location}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(app.status)}`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWING">Reviewing</option>
                            <option value="SHORTLISTED">Shortlisted</option>
                            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="WITHDRAWN">Withdrawn</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="font-medium">{app._count.interviews}</span> scheduled
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                      <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} total applications)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Candidate Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p><strong>Name:</strong> {selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName}</p>
                  <p><strong>Email:</strong> {selectedApplication.candidate.email}</p>
                  <p><strong>Phone:</strong> {selectedApplication.candidate.phone || 'N/A'}</p>
                  <p><strong>Location:</strong> {selectedApplication.candidate.location || 'N/A'}</p>
                  <p><strong>Experience:</strong> {selectedApplication.candidate.experience || 0} years</p>
                  {selectedApplication.candidate.skills.length > 0 && (
                    <div className="mt-2">
                      <strong>Skills:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApplication.candidate.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Job Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p><strong>Title:</strong> {selectedApplication.job.title}</p>
                  <p><strong>Company:</strong> {selectedApplication.job.companyName}</p>
                  <p><strong>Location:</strong> {selectedApplication.job.location}</p>
                  <p><strong>Type:</strong> {selectedApplication.job.type}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Application Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${getStatusColor(selectedApplication.status)}`}>{selectedApplication.status}</span></p>
                  <p><strong>Applied:</strong> {new Date(selectedApplication.appliedAt).toLocaleString()}</p>
                  <p><strong>Interviews:</strong> {selectedApplication._count.interviews}</p>
                  {selectedApplication.notes && (
                    <p><strong>Notes:</strong> {selectedApplication.notes}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationManagement;
