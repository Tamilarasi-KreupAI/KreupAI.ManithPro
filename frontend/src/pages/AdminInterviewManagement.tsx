import React, { useState, useEffect } from 'react';
import {
  getAllInterviews,
  getInterviewStats,
  getUpcomingInterviews,
  updateInterviewStatus,
  deleteInterview,
  bulkUpdateInterviewStatus,
  bulkDeleteInterviews,
  exportInterviews,
} from '../services/admin.service';

interface Interview {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledBy: {
    firstName: string;
    lastName: string;
  };
  application: {
    job: {
      title: string;
    };
  };
}

interface InterviewStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  byType: { type: string; count: number }[];
  averageRating: number;
}

const AdminInterviewManagement: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Edit modal
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editFeedback, setEditFeedback] = useState('');
  const [editRating, setEditRating] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter, typeFilter, searchQuery, dateFrom, dateTo]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (searchQuery) params.search = searchQuery;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const [interviewsData, statsData, upcomingData] = await Promise.all([
        getAllInterviews(params),
        getInterviewStats(),
        getUpcomingInterviews(5),
      ]);

      setInterviews(interviewsData.interviews);
      setTotalPages(interviewsData.pagination.pages);
      setStats(statsData);
      setUpcomingInterviews(upcomingData.interviews);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInterview = (id: string) => {
    setSelectedInterviews(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedInterviews.length === interviews.length) {
      setSelectedInterviews([]);
    } else {
      setSelectedInterviews(interviews.map(i => i.id));
    }
  };

  const handleEditStatus = (interview: Interview) => {
    setEditingInterview(interview);
    setEditStatus(interview.status);
    setEditFeedback(interview.feedback || '');
    setEditRating(interview.rating);
    setShowEditModal(true);
  };

  const handleSaveStatus = async () => {
    if (!editingInterview) return;

    try {
      await updateInterviewStatus(
        editingInterview.id,
        editStatus,
        editFeedback || undefined,
        editRating
      );
      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error('Error updating interview:', error);
      alert('Failed to update interview status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    try {
      await deleteInterview(id);
      loadData();
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview');
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedInterviews.length === 0) {
      alert('Please select interviews first');
      return;
    }

    const status = prompt('Enter new status (SCHEDULED, COMPLETED, CANCELLED, NO_SHOW):');
    if (!status) return;

    try {
      await bulkUpdateInterviewStatus(selectedInterviews, status);
      setSelectedInterviews([]);
      loadData();
    } catch (error) {
      console.error('Error bulk updating:', error);
      alert('Failed to update interviews');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInterviews.length === 0) {
      alert('Please select interviews first');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedInterviews.length} interviews?`)) return;

    try {
      await bulkDeleteInterviews(selectedInterviews);
      setSelectedInterviews([]);
      loadData();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete interviews');
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const csvData = await exportInterviews(params);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interviews_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export interviews');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'NO_SHOW':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'PHONE':
        return 'bg-purple-100 text-purple-700';
      case 'VIDEO':
        return 'bg-indigo-100 text-indigo-700';
      case 'IN_PERSON':
        return 'bg-teal-100 text-teal-700';
      case 'TECHNICAL':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading && interviews.length === 0) {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Interview Management</h1>
        <p className="text-slate-500 mb-8">Schedule, track, and manage all candidate interviews</p>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Interviews</div>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scheduled</div>
              <div className="text-3xl font-bold text-blue-600">{stats.scheduled}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Completed</div>
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cancelled</div>
              <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">No Show</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.noShow}</div>
            </div>
          </div>
        )}

        {/* Upcoming Interviews */}
        {upcomingInterviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Upcoming Interviews (Next 7 Days)</h2>
            <div className="space-y-3">
              {upcomingInterviews.map(interview => (
                <div key={interview.id} className="bg-white p-4 rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-bold text-slate-900">
                      {interview.candidate.firstName} {interview.candidate.lastName} <span className="text-slate-400 font-normal mx-2">•</span> {interview.application.job.title}
                    </div>
                    <div className="text-sm text-slate-500 mt-1 font-medium">
                      {new Date(interview.scheduledAt).toLocaleString()} • {interview.type}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeBadgeClass(interview.type)}`}>
                    {interview.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="">All Types</option>
                  <option value="PHONE">Phone</option>
                  <option value="VIDEO">Video</option>
                  <option value="IN_PERSON">In Person</option>
                  <option value="TECHNICAL">Technical</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search candidate, job..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedInterviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
            <div className="font-bold text-blue-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{selectedInterviews.length}</span>
              interviews selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkUpdateStatus}
                className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 font-bold text-sm transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 font-bold text-sm transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span>📥</span> Export to CSV
          </button>
        </div>

        {/* Interviews Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInterviews.length === interviews.length && interviews.length > 0}
                      onChange={handleSelectAll}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled At</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {interviews.map(interview => (
                  <tr key={interview.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedInterviews.includes(interview.id)}
                        onChange={() => handleSelectInterview(interview.id)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {interview.candidate.firstName} {interview.candidate.lastName}
                      </div>
                      <div className="text-sm text-slate-500">{interview.candidate.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{interview.application.job.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeBadgeClass(interview.type)}`}>
                        {interview.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {new Date(interview.scheduledAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {interview.duration} min
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(interview.status)}`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {interview.rating ? (
                        <div className="flex items-center font-bold text-slate-700">
                          <span className="text-yellow-400 mr-1 text-lg">★</span>
                          <span>{interview.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditStatus(interview)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(interview.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold"
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
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-600 font-medium">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 font-bold text-sm text-slate-600 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 font-bold text-sm text-slate-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Status Modal */}
      {showEditModal && editingInterview && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Update Interview Status</h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <div className="relative">
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>

            {editStatus === 'COMPLETED' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editRating || ''}
                    onChange={(e) => setEditRating(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Feedback</label>
                  <textarea
                    value={editFeedback}
                    onChange={(e) => setEditFeedback(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    placeholder="Enter interview feedback..."
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviewManagement;
