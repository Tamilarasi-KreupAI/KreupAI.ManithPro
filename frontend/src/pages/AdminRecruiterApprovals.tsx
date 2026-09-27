import React, { useState, useEffect } from 'react';
import {
  getPendingRecruiters,
  getRecruiterApprovalStats,
  approveRecruiter,
  rejectRecruiter,
  getPendingClientVendor,
  approveClientVendor,
  rejectClientVendor,
} from '../services/admin.service';
import toast from 'react-hot-toast';

interface PendingRecruiter {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  location: string | null;
  companyName: string;
  companyWebsite: string | null;
  companyEmail: string;
  approvalStatus: string;
  approvalRequestedAt: string;
  createdAt: string;
}
interface PendingClientVendor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  location: string | null;
  companyName: string;
  companyWebsite: string | null;
  companyEmail: string;
  role: 'CLIENT' | 'VENDOR';
  approvalStatus: string;
  approvalRequestedAt: string;
  createdAt: string;
}

interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const AdminRecruiterApprovals: React.FC = () => {
  const [recruiters, setRecruiters] = useState<PendingRecruiter[]>([]);
const [clientVendors, setClientVendors] = useState<PendingClientVendor[]>([]);
const [activeTab, setActiveTab] = useState<'RECRUITER' | 'CLIENT' | 'VENDOR'>('RECRUITER');
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<PendingRecruiter | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recruitersData, statsData, clientVendorData] = await Promise.all([
        getPendingRecruiters({ page, limit: 10 }),
        getRecruiterApprovalStats(),
getPendingClientVendor({ page, limit: 10 }),
      ]);
      setRecruiters(recruitersData.recruiters);
      setTotalPages(recruitersData.pagination.totalPages);
      setStats(statsData);
      setClientVendors(clientVendorData.users);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recruiter: PendingRecruiter) => {
    if (!window.confirm(`Are you sure you want to approve ${recruiter.firstName} ${recruiter.lastName} from ${recruiter.companyName}?`)) {
      return;
    }

    setProcessingId(recruiter.id);
    try {
      await approveRecruiter(recruiter.id);
      toast.success(`${recruiter.firstName} ${recruiter.lastName} has been approved as a recruiter`);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve recruiter');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (recruiter: PendingRecruiter) => {
    setSelectedRecruiter(recruiter);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRecruiter) return;

    setProcessingId(selectedRecruiter.id);
    try {
      await rejectRecruiter(selectedRecruiter.id, rejectionReason);
      toast.success(`${selectedRecruiter.firstName} ${selectedRecruiter.lastName}'s application has been rejected`);
      setRejectModalOpen(false);
      setSelectedRecruiter(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject recruiter');
    } finally {
      setProcessingId(null);
    }
  };
    const handleApproveClientVendor = async (user: PendingClientVendor) => {
    if (
      !window.confirm(
        `Are you sure you want to approve ${user.firstName} ${user.lastName} from ${user.companyName} as a ${user.role.toLowerCase()}?`
      )
    ) {
      return;
    }

    setProcessingId(user.id);

    try {
      await approveClientVendor(user.id);

      toast.success(
        `${user.firstName} ${user.lastName} has been approved as a ${user.role.toLowerCase()}`
      );

      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          `Failed to approve ${user.role.toLowerCase()}`
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClientVendor = async (
    user: PendingClientVendor
  ) => {
    const reason = window.prompt(
      `Enter rejection reason for ${user.firstName} ${user.lastName}:`
    );

    if (reason === null) {
      return;
    }

    setProcessingId(user.id);

    try {
      await rejectClientVendor(user.id, reason);

      toast.success(
        `${user.firstName} ${user.lastName}'s application has been rejected`
      );

      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          `Failed to reject ${user.role.toLowerCase()}`
      );
    } finally {
      setProcessingId(null);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && recruiters.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
<div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-gray-700">
  {(['RECRUITER', 'CLIENT', 'VENDOR'] as const).map((tab) => (
    <button
      key={tab}
      type="button"
      onClick={() => {
        setActiveTab(tab);
        setPage(1);
      }}
      className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
        activeTab === tab
          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      {tab === 'RECRUITER'
        ? 'Recruiter'
        : tab === 'CLIENT'
        ? 'Client'
        : 'Vendor'}
    </button>
  ))}
</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Recruiter Approvals</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">
            Review and approve pending recruiter registration requests
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.rejected}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Recruiters</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals List */}
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700">
  <div className="p-6 border-b border-slate-100 dark:border-gray-700">
    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
      Pending Approvals
    </h2>
  </div>

  {activeTab === 'RECRUITER' ? (
    recruiters.length === 0 ? (
      <div className="p-12 text-center">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
          All caught up!
        </h3>
        <p className="text-slate-500 dark:text-gray-400">
          No pending recruiter approvals at this time.
        </p>
      </div>
    ) : (
      <div className="divide-y divide-slate-100 dark:divide-gray-700">
        {recruiters.map((recruiter) => (
          <div
            key={recruiter.id}
            className="p-6 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {recruiter.firstName[0]}
                      {recruiter.lastName[0]}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {recruiter.firstName} {recruiter.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      {recruiter.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  <div className="text-sm">
                    <span className="text-slate-700 dark:text-gray-300 font-medium">
                      Company: {recruiter.companyName}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-slate-600 dark:text-gray-400">
                      {recruiter.companyEmail}
                    </span>
                  </div>

                  {recruiter.companyWebsite && (
                    <div className="text-sm">
                      <a
                        href={recruiter.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {recruiter.companyWebsite}
                      </a>
                    </div>
                  )}

                  {recruiter.phone && (
                    <div className="text-sm text-slate-600 dark:text-gray-400">
                      Phone: {recruiter.phone}
                    </div>
                  )}

                  {recruiter.location && (
                    <div className="text-sm text-slate-600 dark:text-gray-400">
                      Location: {recruiter.location}
                    </div>
                  )}

                  <div className="text-sm text-slate-600 dark:text-gray-400">
                    Applied: {formatDate(recruiter.approvalRequestedAt || recruiter.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApprove(recruiter)}
                  disabled={processingId === recruiter.id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl disabled:opacity-50"
                >
                  Approve
                </button>

                <button
                  onClick={() => openRejectModal(recruiter)}
                  disabled={processingId === recruiter.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl disabled:opacity-50"
                >
                  Reject
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    )
  ) : (
    (() => {
      const filteredUsers = clientVendors.filter(
        (user) => user.role === activeTab
      );

      return filteredUsers.length === 0 ? (
        <div className="p-12 text-center">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
            All caught up!
          </h3>

          <p className="text-slate-500 dark:text-gray-400">
            No pending {activeTab.toLowerCase()} approvals at this time.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-gray-700">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-6 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">

                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">

                    <div className="text-sm">
                      <span className="text-slate-700 dark:text-gray-300 font-medium">
                        Company: {user.companyName}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 dark:text-gray-400">
                      Company Email: {user.companyEmail}
                    </div>

                    {user.companyWebsite && (
                      <div className="text-sm">
                        <a
                          href={user.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {user.companyWebsite}
                        </a>
                      </div>
                    )}

                    {user.phone && (
                      <div className="text-sm text-slate-600 dark:text-gray-400">
                        Phone: {user.phone}
                      </div>
                    )}

                    {user.location && (
                      <div className="text-sm text-slate-600 dark:text-gray-400">
                        Location: {user.location}
                      </div>
                    )}

                    <div className="text-sm text-slate-600 dark:text-gray-400">
                      Applied: {formatDate(user.approvalRequestedAt || user.createdAt)}
                    </div>

                  </div>
                </div>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() => handleApproveClientVendor(user)}
                    disabled={processingId === user.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleRejectClientVendor(user)}
                    disabled={processingId === user.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl disabled:opacity-50"
                  >
                    Reject
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>
      );
    })()
  )}

  {/* Pagination */}
  {totalPages > 1 && activeTab === 'RECRUITER' && (
    <div className="p-4 border-t border-slate-100 dark:border-gray-700 flex justify-center gap-2">
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-3 py-1 rounded-lg border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        Previous
      </button>

      <span className="px-3 py-1 text-slate-600 dark:text-gray-400">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="px-3 py-1 rounded-lg border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )}
</div>
</div>
      {/* Rejection Modal */}
      {rejectModalOpen && selectedRecruiter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Reject Recruiter Application
            </h3>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              Are you sure you want to reject {selectedRecruiter.firstName} {selectedRecruiter.lastName}'s application from {selectedRecruiter.companyName}?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedRecruiter.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {processingId === selectedRecruiter.id ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecruiterApprovals;
