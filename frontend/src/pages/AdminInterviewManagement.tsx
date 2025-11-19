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
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'PHONE':
        return 'bg-purple-100 text-purple-800';
      case 'VIDEO':
        return 'bg-indigo-100 text-indigo-800';
      case 'IN_PERSON':
        return 'bg-teal-100 text-teal-800';
      case 'TECHNICAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && interviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading interviews...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Interview Management</h1>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Interviews</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <div className="text-sm text-blue-600">Scheduled</div>
            <div className="text-2xl font-bold text-blue-700">{stats.scheduled}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-sm text-green-600">Completed</div>
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <div className="text-sm text-red-600">Cancelled</div>
            <div className="text-2xl font-bold text-red-700">{stats.cancelled}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <div className="text-sm text-yellow-600">No Show</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.noShow}</div>
          </div>
        </div>
      )}

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">Upcoming Interviews (Next 7 Days)</h2>
          <div className="space-y-2">
            {upcomingInterviews.map(interview => (
              <div key={interview.id} className="bg-white p-3 rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {interview.candidate.firstName} {interview.candidate.lastName} - {interview.application.job.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(interview.scheduledAt).toLocaleString()} • {interview.type}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeClass(interview.type)}`}>
                  {interview.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="PHONE">Phone</option>
              <option value="VIDEO">Video</option>
              <option value="IN_PERSON">In Person</option>
              <option value="TECHNICAL">Technical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search candidate, job..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedInterviews.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 flex justify-between items-center">
          <div className="font-medium">{selectedInterviews.length} interviews selected</div>
          <div className="space-x-2">
            <button
              onClick={handleBulkUpdateStatus}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Status
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export to CSV
        </button>
      </div>

      {/* Interviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedInterviews.length === interviews.length && interviews.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interviews.map(interview => (
                <tr key={interview.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedInterviews.includes(interview.id)}
                      onChange={() => handleSelectInterview(interview.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {interview.candidate.firstName} {interview.candidate.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{interview.candidate.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">{interview.application.job.title}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeClass(interview.type)}`}>
                      {interview.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {interview.duration} min
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(interview.status)}`}>
                      {interview.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {interview.rating ? (
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{interview.rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditStatus(interview)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(interview.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
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
          <div className="bg-white px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
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

      {/* Edit Status Modal */}
      {showEditModal && editingInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Interview Status</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>

            {editStatus === 'COMPLETED' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editRating || ''}
                    onChange={(e) => setEditRating(parseInt(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Feedback</label>
                  <textarea
                    value={editFeedback}
                    onChange={(e) => setEditFeedback(e.target.value)}
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter interview feedback..."
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
