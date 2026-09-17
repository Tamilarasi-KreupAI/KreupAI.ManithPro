import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs, deleteJob, updateJobStatus, getJobStats } from '../services/admin.service';

interface Job {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  type: string;
  status: string;
  salary?: string;
  createdAt: string;
  postedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    applications: number;
    savedBy: number;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface JobStats {
  total: number;
  byStatus: {
    open: number;
    closed: number;
    draft: number;
  };
  byType: Array<{ type: string; count: number }>;
  topCompanies: Array<{ company: string; count: number }>;
  averageApplicationsPerJob: number;
}

const AdminJobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadJobs();
    loadStats();
  }, [pagination.page, statusFilter, typeFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await getAllJobs({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: searchTerm || undefined,
      });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getJobStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    loadJobs();
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to close this job?')) return;

    try {
      await deleteJob(id);
      loadJobs();
      loadStats();
    } catch (error) {
      console.error('Error closing job:', error);
      alert('Failed to close job');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateJobStatus(id, newStatus);
      loadJobs();
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update job status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Job Management</h1>
          <p className="text-slate-500 mt-2">Manage and monitor all job postings across the platform</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Jobs</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Open Jobs</p>
              <p className="text-3xl font-bold text-green-600">{stats.byStatus.open}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Closed Jobs</p>
              <p className="text-3xl font-bold text-red-600">{stats.byStatus.closed}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avg Applications</p>
              <p className="text-3xl font-bold text-blue-600">{stats.averageApplicationsPerJob}</p>
            </div>
          </div>
        )}

        {/* Top Companies */}
        {stats && stats.topCompanies.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🏢</span> Top Hiring Companies
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.topCompanies.map((company, index) => (
                <div key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-100 flex items-center gap-2">
                  <span>{company.company}</span>
                  <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold text-blue-600 shadow-sm">{company.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search by title, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: 'url("data:image/svg+xml,...")' }} // Add custom arrow if needed, or rely on browser default with padding
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
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
                        Job Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Posted By
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</div>
                            <div className="text-sm text-slate-500">{job.location}</div>
                            {job.salary && (
                              <div className="text-xs text-slate-400 mt-0.5">{job.salary}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                          {job.companyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                            {job.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={job.status}
                            onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${job.status === 'OPEN' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                job.status === 'CLOSED' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                  'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              }`}
                          >
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                            <option value="DRAFT">Draft</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{job._count.applications}</span>
                            <span className="text-slate-400 text-xs">/ {job._count.savedBy} saved</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-slate-900">
                              {job.postedBy.firstName} {job.postedBy.lastName}
                            </div>
                            <div className="text-slate-500 text-xs">{job.postedBy.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-800 font-medium hover:underline"
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
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Showing page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
                      <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} total jobs)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default AdminJobManagement;
