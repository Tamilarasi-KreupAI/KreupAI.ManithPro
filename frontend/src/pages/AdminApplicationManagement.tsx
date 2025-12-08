import { useEffect, useState } from 'react';
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
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      REVIEWING: 'bg-blue-100 text-blue-700 border-blue-200',
      SHORTLISTED: 'bg-purple-100 text-purple-700 border-purple-200',
      INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      REJECTED: 'bg-red-100 text-red-700 border-red-200',
      ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
      WITHDRAWN: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Application Management</h1>
          <p className="text-slate-500 mt-2">Manage and track all job applications across the platform</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Applications</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Recent (30 days)</p>
              <p className="text-3xl font-bold text-blue-600">{stats.recentApplications}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avg per Job</p>
              <p className="text-3xl font-bold text-green-600">{stats.averageApplicationsPerJob}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">By Status</p>
              <div className="flex flex-wrap gap-2">
                {stats.byStatus.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                    {s.status}: {s.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Jobs */}
        {stats && stats.topJobs.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="font-bold text-slate-900 mb-4">Top Jobs by Applications</h3>
            <div className="flex flex-wrap gap-3">
              {stats.topJobs.map((job) => (
                <div key={job.id} className="px-4 py-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 transition-all hover:bg-blue-100">
                  <div className="font-bold text-sm">{job.title}</div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">{job.companyName} • {job.applicationCount} apps</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by candidate or job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
            <div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium pr-10"
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>
            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Search
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-3 border border-blue-200 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 font-bold transition-colors"
                title="Export to CSV"
              >
                📥
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Job
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Interviews
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-slate-900">
                              {app.candidate.firstName} {app.candidate.lastName}
                            </div>
                            <div className="text-sm text-slate-500">{app.candidate.email}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {app.candidate.location} • {app.candidate.experience || 0} yrs exp
                            </div>
                            {app.candidate.skills && app.candidate.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {app.candidate.skills.slice(0, 3).map((skill, idx) => (
                                  <span key={idx} className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-slate-900">{app.job.title}</div>
                            <div className="text-sm text-slate-500 font-medium">{app.job.companyName}</div>
                            <div className="text-xs text-slate-400 mt-1">{app.job.location}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                              className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusColor(app.status)}`}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="REVIEWING">Reviewing</option>
                              <option value="SHORTLISTED">Shortlisted</option>
                              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                              <option value="REJECTED">Rejected</option>
                              <option value="ACCEPTED">Accepted</option>
                              <option value="WITHDRAWN">Withdrawn</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <span className="font-bold text-slate-900">{app._count.interviews}</span> scheduled
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-bold"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-red-500 hover:text-red-700 font-bold"
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
              <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-slate-100">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">
                      Showing page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
                      <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} total applications)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Application Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">Candidate Information</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2">
                  <p><strong className="text-slate-700">Name:</strong> <span className="text-slate-900">{selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName}</span></p>
                  <p><strong className="text-slate-700">Email:</strong> <span className="text-slate-900">{selectedApplication.candidate.email}</span></p>
                  <p><strong className="text-slate-700">Phone:</strong> <span className="text-slate-900">{selectedApplication.candidate.phone || 'N/A'}</span></p>
                  <p><strong className="text-slate-700">Location:</strong> <span className="text-slate-900">{selectedApplication.candidate.location || 'N/A'}</span></p>
                  <p><strong className="text-slate-700">Experience:</strong> <span className="text-slate-900">{selectedApplication.candidate.experience || 0} years</span></p>
                  {selectedApplication.candidate.skills.length > 0 && (
                    <div className="mt-3">
                      <strong className="text-slate-700 block mb-2">Skills:</strong>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.candidate.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">Job Information</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2">
                  <p><strong className="text-slate-700">Title:</strong> <span className="text-slate-900">{selectedApplication.job.title}</span></p>
                  <p><strong className="text-slate-700">Company:</strong> <span className="text-slate-900">{selectedApplication.job.companyName}</span></p>
                  <p><strong className="text-slate-700">Location:</strong> <span className="text-slate-900">{selectedApplication.job.location}</span></p>
                  <p><strong className="text-slate-700">Type:</strong> <span className="text-slate-900">{selectedApplication.job.type}</span></p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">Application Information</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-700">Status:</strong>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <p><strong className="text-slate-700">Applied:</strong> <span className="text-slate-900">{new Date(selectedApplication.appliedAt).toLocaleString()}</span></p>
                  <p><strong className="text-slate-700">Interviews:</strong> <span className="text-slate-900">{selectedApplication._count.interviews}</span></p>
                  {selectedApplication.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <strong className="text-slate-700 block mb-1">Notes:</strong>
                      <p className="text-slate-600 italic">{selectedApplication.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
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
