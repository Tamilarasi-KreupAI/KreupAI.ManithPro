import React, { useEffect, useRef, useState } from 'react';
import {
  getVendorCandidates,
  addCandidate,
  updateCandidate,
  deleteCandidate,
  downloadCandidateResume,
  uploadCandidateResume,
  bulkUploadCandidates,
  getCandidateProfile,
  BulkUploadResult,
} from '../../services/b2b.service';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  experience: number | null;
  skills: string[];
  status: 'AVAILABLE' | 'INTERVIEWING' | 'PLACED';
  resumeUrl?: string;
}

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  experience: '',
  skills: '',
};

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  INTERVIEWING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PLACED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

const CandidateSupply: React.FC = () => {
  // ─── List state ─────────────────────────────────────────────
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // ─── Toast notifications ─────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastCounter = 0;

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // ─── Profile modal ───────────────────────────────────────────
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ─── Add modal ───────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addError, setAddError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Edit modal ──────────────────────────────────────────────
  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<Candidate | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ─── Delete confirm modal ────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── WS14-T07: Resume upload state ──────────────────────────
  const [resumeUploadTarget, setResumeUploadTarget] = useState<Candidate | null>(null);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // ─── WS14-T07: Downloading state ────────────────────────────
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ─── WS14-T07: Bulk upload state ────────────────────────────
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkUploadResult | null>(null);
  const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // ─── Load ────────────────────────────────────────────────────
  // WS14-T09: Pagination & Search & Filter state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  useEffect(() => {
    loadCandidates();
  }, [page, search, statusFilter, skillFilter]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setPageError(null);
      const res = await getVendorCandidates({
        page,
        pageSize: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        skill: skillFilter || undefined,
      });
      if (res && Array.isArray(res.data)) {
        setCandidates(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else if (Array.isArray(res)) {
        setCandidates(res);
      }
    } catch (err: any) {
      setPageError(err?.response?.data?.error || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  // ─── View profile ────────────────────────────────────────────
  const handleViewProfile = async (id: string) => {
    try {
      setProfileLoading(true);
      const data = await getCandidateProfile(id);
      setSelectedCandidate(data);
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── WS14-T07: Resume download ───────────────────────────────
  const handleDownload = async (c: Candidate) => {
    if (!c.resumeUrl) {
      showToast('No resume uploaded for this candidate', 'info');
      return;
    }
    try {
      setDownloadingId(c.id);
      const blob = await downloadCandidateResume(c.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Derive extension from resumeUrl
      const ext = c.resumeUrl.split('.').pop() || 'pdf';
      a.download = `${c.firstName}-${c.lastName}-resume.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to download resume';
      showToast(msg, 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // ─── WS14-T07: Resume upload modal ──────────────────────────
  const openResumeUpload = (c: Candidate) => {
    setResumeUploadTarget(c);
    setResumeFile(null);
    setResumeUploadError(null);
    setShowResumeUpload(true);
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setResumeFile(f);
    setResumeUploadError(null);
  };

  const handleResumeUpload = async () => {
    if (!resumeUploadTarget || !resumeFile) {
      setResumeUploadError('Please select a PDF, DOC, or DOCX file');
      return;
    }
    try {
      setResumeUploading(true);
      setResumeUploadError(null);
      await uploadCandidateResume(resumeUploadTarget.id, resumeFile);
      setShowResumeUpload(false);
      showToast(`Resume uploaded for ${resumeUploadTarget.firstName} ${resumeUploadTarget.lastName}`, 'success');
      loadCandidates();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to upload resume';
      setResumeUploadError(msg);
    } finally {
      setResumeUploading(false);
    }
  };

  // ─── WS14-T07: Bulk upload ───────────────────────────────────
  const openBulkUpload = () => {
    setBulkFile(null);
    setBulkResult(null);
    setBulkUploadError(null);
    setShowBulkUpload(true);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setBulkFile(f);
    setBulkResult(null);
    setBulkUploadError(null);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setBulkUploadError('Please select a CSV file');
      return;
    }
    try {
      setBulkUploading(true);
      setBulkUploadError(null);
      const result = await bulkUploadCandidates(bulkFile);
      setBulkResult(result);
      if (result.summary.created > 0) {
        loadCandidates();
        showToast(`${result.summary.created} candidate(s) imported successfully`, 'success');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Bulk upload failed';
      setBulkUploadError(msg);
    } finally {
      setBulkUploading(false);
    }
  };

  // ─── Add candidate ───────────────────────────────────────────
  const openAdd = () => {
    setAddForm(emptyForm);
    setAddError(null);
    setShowAdd(true);
  };

  const handleAddCandidate = async () => {
    setAddError(null);
    if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim()) {
      setAddError('First name, last name, and email are required');
      return;
    }
    try {
      setSubmitting(true);
      await addCandidate({
        firstName: addForm.firstName.trim(),
        lastName: addForm.lastName.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim() || undefined,
        experience: addForm.experience ? Number(addForm.experience) : undefined,
        skills: addForm.skills ? addForm.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      setShowAdd(false);
      showToast('Candidate added successfully', 'success');
      loadCandidates();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to add candidate';
      setAddError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Edit candidate ──────────────────────────────────────────
  const openEdit = (c: Candidate) => {
    setEditTarget(c);
    setEditForm({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone || '',
      experience: c.experience !== null ? String(c.experience) : '',
      skills: (c.skills || []).join(', '),
    });
    setEditError(null);
    setShowEdit(true);
  };

  const handleEditCandidate = async () => {
    if (!editTarget) return;
    setEditError(null);
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      setEditError('First name, last name, and email are required');
      return;
    }
    try {
      setEditSubmitting(true);
      await updateCandidate(editTarget.id, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        experience: editForm.experience !== '' ? Number(editForm.experience) : null,
        skills: editForm.skills ? editForm.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      setShowEdit(false);
      showToast('Candidate updated successfully', 'success');
      loadCandidates();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to update candidate';
      setEditError(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── Delete candidate ────────────────────────────────────────
  const openDelete = (c: Candidate) => {
    setDeleteTarget(c);
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleDeleteCandidate = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      setDeleting(true);
      await deleteCandidate(deleteTarget.id);
      setShowDeleteConfirm(false);
      showToast(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted`, 'success');
      loadCandidates();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to delete candidate';
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Shared form field renderer ──────────────────────────────
  const FormField = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required,
  }: {
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );

  // ─── Loading / error states ──────────────────────────────────
  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );

  if (pageError)
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-400">
        {pageError}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* ── Toast container ── */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
              t.type === 'success'
                ? 'bg-green-600 text-white'
                : t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Talent Pool</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your available consultants and track their status.
          </p>
        </div>
        <div className="flex gap-2">
          {/* WS14-T07: Bulk upload button */}
          <button
            id="bulk-upload-btn"
            onClick={openBulkUpload}
            className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600"
          >
            ↑ Bulk Import CSV
          </button>
          <button
            id="add-candidate-btn"
            onClick={openAdd}
            className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 text-sm font-medium transition-colors"
          >
            + Add Candidate
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search candidates by name or email..."
          className="flex-1 rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="sm:w-48 rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="INTERVIEWING">Interviewing</option>
          <option value="PLACED">Placed</option>
        </select>
        <input
          value={skillFilter}
          onChange={(e) => {
            setSkillFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by skill..."
          className="sm:w-48 rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* ── Candidate Grid ── */}
      {candidates.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>No candidates yet. Add your first candidate!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {c.firstName} {c.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{c.email}</p>
                  </div>
                  <span className={`ml-2 flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-800'}`}>
                    {c.status}
                  </span>
                </div>

                <div className="mt-4 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <div>Experience: {c.experience !== null ? `${c.experience} yr${c.experience !== 1 ? 's' : ''}` : 'N/A'}</div>
                  {c.phone && <div>Phone: {c.phone}</div>}
                </div>

                {/* WS14-T07: Resume indicator */}
                <div className="mt-2 text-xs">
                  {c.resumeUrl ? (
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Resume uploaded
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">No resume</span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(c.skills || []).slice(0, 4).map((skill) => (
                    <span key={skill} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                  {c.skills.length > 4 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">+{c.skills.length - 4} more</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex flex-wrap justify-between items-center gap-2 rounded-b-lg">
                <button
                  onClick={() => handleViewProfile(c.id)}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View Profile
                </button>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    aria-label={`Edit ${c.firstName} ${c.lastName}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDelete(c)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                    aria-label={`Delete ${c.firstName} ${c.lastName}`}
                  >
                    Delete
                  </button>
                  {/* WS14-T07: Resume Upload */}
                  <button
                    onClick={() => openResumeUpload(c)}
                    className="text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium"
                    aria-label={`Upload resume for ${c.firstName} ${c.lastName}`}
                  >
                    {c.resumeUrl ? 'Replace CV' : 'Upload CV'}
                  </button>
                  {/* WS14-T07: Resume Download */}
                  {c.resumeUrl && (
                    <button
                      onClick={() => handleDownload(c)}
                      disabled={downloadingId === c.id}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:underline disabled:opacity-50"
                      aria-label={`Download resume for ${c.firstName} ${c.lastName}`}
                    >
                      {downloadingId === c.id ? '…' : 'Download CV'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} candidates)
          </span>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevious}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              Previous
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── View Profile Modal ── */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Candidate Profile</h2>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {profileLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">First Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCandidate.firstName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCandidate.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCandidate.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedCandidate.experience !== null ? `${selectedCandidate.experience} years` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[selectedCandidate.status] || ''}`}>
                        {selectedCandidate.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills?.length > 0 ? selectedCandidate.skills.map((skill: string) => (
                        <span key={skill} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {skill}
                        </span>
                      )) : <span className="text-gray-400">—</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resume</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedCandidate.resumeUrl ? 'Resume on file' : 'No resume uploaded'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-5 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Candidate Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Candidate</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {addError && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {addError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="First Name" required value={addForm.firstName} onChange={(v) => setAddForm({ ...addForm, firstName: v })} placeholder="Jane" />
                <FormField label="Last Name" required value={addForm.lastName} onChange={(v) => setAddForm({ ...addForm, lastName: v })} placeholder="Doe" />
              </div>
              <FormField label="Email" type="email" required value={addForm.email} onChange={(v) => setAddForm({ ...addForm, email: v })} placeholder="jane@example.com" />
              <FormField label="Phone" value={addForm.phone} onChange={(v) => setAddForm({ ...addForm, phone: v })} placeholder="+1 555 000 0000" />
              <FormField label="Experience (years)" type="number" value={addForm.experience} onChange={(v) => setAddForm({ ...addForm, experience: v })} placeholder="5" />
              <FormField label="Skills (comma separated)" value={addForm.skills} onChange={(v) => setAddForm({ ...addForm, skills: v })} placeholder="React, TypeScript, Node.js" />
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleAddCandidate}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Adding…' : 'Add Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Candidate Modal ── */}
      {showEdit && editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Edit Candidate
              </h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {editError && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {editError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="First Name" required value={editForm.firstName} onChange={(v) => setEditForm({ ...editForm, firstName: v })} />
                <FormField label="Last Name" required value={editForm.lastName} onChange={(v) => setEditForm({ ...editForm, lastName: v })} />
              </div>
              <FormField label="Email" type="email" required value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} />
              <FormField label="Phone" value={editForm.phone} onChange={(v) => setEditForm({ ...editForm, phone: v })} placeholder="+1 555 000 0000" />
              <FormField label="Experience (years)" type="number" value={editForm.experience} onChange={(v) => setEditForm({ ...editForm, experience: v })} />
              <FormField label="Skills (comma separated)" value={editForm.skills} onChange={(v) => setEditForm({ ...editForm, skills: v })} />
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button
                disabled={editSubmitting}
                onClick={handleEditCandidate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {editSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Delete Candidate</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{deleteTarget.firstName} {deleteTarget.lastName}</span>?
              </p>

              {deleteError && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-4">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={deleting}
                  onClick={handleDeleteCandidate}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WS14-T07: Resume Upload Modal ── */}
      {showResumeUpload && resumeUploadTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Upload Resume — {resumeUploadTarget.firstName} {resumeUploadTarget.lastName}
              </h2>
              <button
                onClick={() => setShowResumeUpload(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close resume upload"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {resumeUploadError && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {resumeUploadError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resume File <span className="text-red-500">*</span>
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => resumeInputRef.current?.click()}
                >
                  {resumeFile ? (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <svg className="mx-auto h-8 w-8 text-green-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <p className="font-medium">{resumeFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <svg className="mx-auto h-10 w-10 opacity-40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p>Click to select a file</p>
                      <p className="text-xs mt-1">PDF, DOC, or DOCX — max 5 MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleResumeFileChange}
                  id="resume-file-input"
                />
              </div>

              {resumeUploadTarget.resumeUrl && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠ An existing resume is on file. Uploading a new one will replace it.
                </p>
              )}
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setShowResumeUpload(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={resumeUploading || !resumeFile}
                onClick={handleResumeUpload}
                className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {resumeUploading ? 'Uploading…' : 'Upload Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WS14-T07: Bulk Upload Modal ── */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Import Candidates</h2>
              <button
                onClick={() => setShowBulkUpload(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close bulk upload"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {bulkUploadError && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {bulkUploadError}
                </div>
              )}

              {!bulkResult ? (
                <>
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">CSV Format</p>
                    <p className="text-xs font-mono">firstName,lastName,email,phone,experience,skills</p>
                    <p className="text-xs mt-1">Required: firstName, lastName, email. Skills are comma-separated within the cell (use quotes if needed).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CSV File <span className="text-red-500">*</span>
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                      onClick={() => bulkInputRef.current?.click()}
                    >
                      {bulkFile ? (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <svg className="mx-auto h-8 w-8 text-green-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <p className="font-medium">{bulkFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{(bulkFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <svg className="mx-auto h-10 w-10 opacity-40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p>Click to select a CSV file</p>
                          <p className="text-xs mt-1">Max 5 MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={bulkInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={handleBulkFileChange}
                      id="bulk-file-input"
                    />
                  </div>
                </>
              ) : (
                /* ── Bulk Result Summary ── */
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{bulkResult.summary.total}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Rows</p>
                    </div>
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">{bulkResult.summary.created}</p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1">Created</p>
                    </div>
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                      <p className="text-2xl font-bold text-red-700 dark:text-red-400">{bulkResult.summary.failed}</p>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-1">Failed</p>
                    </div>
                  </div>

                  {bulkResult.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Row-level errors:</p>
                      <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">Row</th>
                              <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkResult.errors.map((e, i) => (
                              <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono">{e.row}</td>
                                <td className="px-3 py-2 text-red-600 dark:text-red-400">{e.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkUpload(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {bulkResult ? 'Close' : 'Cancel'}
              </button>
              {!bulkResult && (
                <button
                  disabled={bulkUploading || !bulkFile}
                  onClick={handleBulkUpload}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {bulkUploading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Importing…
                    </span>
                  ) : 'Import Candidates'}
                </button>
              )}
              {bulkResult && (
                <button
                  onClick={() => { setBulkResult(null); setBulkFile(null); setBulkUploadError(null); }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors"
                >
                  Upload Another
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSupply;
