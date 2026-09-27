import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: `${API_URL}/b2b`,
  headers: { 'Content-Type': 'application/json' },
});

export interface B2BPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface B2BPaginatedResponse<T> {
  data: T[];
  pagination: B2BPagination;
}

export interface B2BListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  skill?: string;
}

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ================= DASHBOARD ================= */

export const getClientDashboardStats = async () => {
  const res = await api.get('/stats/client');
  return res.data; // controller already returns array
};

export const getVendorDashboardStats = async () => {
  const res = await api.get('/stats/vendor');
  return res.data;
};

export const getRecentRequirements = async (limit = 5) => {
  const res = await api.get('/requirements/recent', {
    params: { limit },
  });
  return res.data;
};

export const getRecentPlacements = async (limit = 5) => {
  const res = await api.get('/placements/recent', {
    params: { limit },
  });
  return res.data;
};

export const getPendingContracts = async (limit = 5) => {
  const res = await api.get('/contracts/pending', {
    params: { limit },
  });
  return res.data;
};
export const createRequirement = async (data: any) => {
  const res = await api.post('/requirements', data);
  return res.data;
};
export const getAllRequirements = async () => {
  const res = await api.get('/requirements');
  return res.data;
};

export const getRequirementById = async (id: string) => {
  const res = await api.get(`/requirements/${id}`);
  return res.data;
};

export const updateRequirement = async (id: string, data: any) => {
  const res = await api.put(`/requirements/${id}`, data);
  return res.data;
};

export const deleteRequirement = async (id: string) => {
  const res = await api.delete(`/requirements/${id}`);
  return res.data;
};

export const getAllContracts = async () => {
  const res = await api.get('/contracts');
  return res.data;
};
export const viewContract = async (id: string) => {
  const res = await api.get(`/contracts/${id}/view`);
  return res.data;
};

export const downloadContract = async (id: string) => {
  const res = await api.get(`/contracts/${id}/download`, {
    responseType: 'blob',
  });
  return res.data;
};
export const createDraftContract = async (data: {
  partnerName: string;
  role: string;
  vendorId: string;
  terms?: string;
}) => {
  const res = await api.post('/contracts', data);
  return res.data;
};

export const updateContractStatus = async (id: string, status: string) => {
  const res = await api.patch(`/contracts/${id}/status`, { status });
  return res.data;
};
export const getVendorCandidates = async (params?: B2BListParams) => {
  const res = await api.get('/candidates', { params });
  return res.data;
};

export const downloadCandidateResume = async (id: string): Promise<Blob> => {
  const res = await api.get(`/candidates/${id}/resume`, {
    responseType: 'blob',
  });
  return res.data;
};

// WS14-T07: Upload a resume file for a specific vendor candidate
export const uploadCandidateResume = async (candidateId: string, file: File): Promise<{ message: string; resumeUrl: string }> => {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await api.post(`/candidates/${candidateId}/resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// WS14-T07: Bulk upload candidates via CSV
export interface BulkUploadError {
  row: number;
  reason: string;
}

export interface BulkUploadResult {
  message: string;
  summary: {
    total: number;
    created: number;
    failed: number;
  };
  errors: BulkUploadError[];
}

export const bulkUploadCandidates = async (file: File): Promise<BulkUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/candidates/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};


export const addCandidate = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  skills: string[];
  experience?: number;
  resumeUrl?: string;
}) => {
  const res = await api.post('/candidates', payload);
  return res.data;
};

// WS14-T06: Update a vendor's own candidate
export const updateCandidate = async (
  id: string,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: number | null;
    resumeUrl?: string | null;
  }
) => {
  const res = await api.put(`/candidates/${id}`, payload);
  return res.data;
};

// WS14-T06: Delete a vendor's own candidate
export const deleteCandidate = async (id: string) => {
  const res = await api.delete(`/candidates/${id}`);
  return res.data;
};
export const getCandidateProfile = async (id: string) => {
  const res = await api.get(`/candidates/${id}`);
  return res.data;
};
export const getInvoices = async () => {
  const res = await api.get('/invoices');
  return res.data;
};

export const payInvoice = async (id: string) => {
  await api.post(`/invoices/${id}/pay`);
};

export const downloadInvoice = async (id: string) => {
  const res = await api.get(`/invoices/${id}/download`, {
    responseType: 'blob',
  });
  return res.data;
};
export const createInvoice = async (payload: {
  vendorId: string;
  amount: number;
  dueDate: string;
  contractId?: string;
}) => {
  const res = await api.post('/invoices', payload);
  return res.data;
};

export const getVendors = async () => {
  const res = await api.get('/vendors');
  return res.data;
};

/* ================= SUBMISSIONS / PLACEMENTS ================= */

// Vendors can view open requirements from clients
export const getOpenRequirements = async (params?: B2BListParams) => {
  const res = await api.get('/requirements/open', { params });
  return res.data;
};

// Vendor submits a candidate to a requirement
export const submitCandidateToRequirement = async (payload: {
  requirementId: string;
  candidateId: string;
  notes?: string;
}) => {
  const res = await api.post('/submissions', payload);
  return res.data;
};

// Vendor sees their submissions
export const getVendorSubmissions = async (params?: B2BListParams) => {
  const res = await api.get('/submissions/vendor', { params });
  return res.data;
};

// Client sees submissions to their requirements
export const getClientSubmissions = async () => {
  const res = await api.get('/submissions/client');
  return res.data;
};

// Client updates submission status (SHORTLISTED, REJECTED, PLACED)
export const updateSubmissionStatus = async (id: string, status: string, notes?: string) => {
  const res = await api.patch(`/submissions/${id}/status`, { status, notes });
  return res.data;
};

// Vendor withdraws a submitted candidate
export const withdrawSubmission = async (id: string) => {
  const res = await api.patch(`/submissions/${id}/withdraw`);
  return res.data;
};

/* ================= SETTINGS ================= */

export interface B2BSettingsData {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  emailNotifications?: boolean;
  newSubmissionsNotify?: boolean;
  contractUpdatesNotify?: boolean;
  invoiceRemindersNotify?: boolean;
  weeklyDigestNotify?: boolean;
  defaultPaymentTerms?: string;
  preferredContractDuration?: string;
  autoApproveSubmissions?: boolean;
  requireNDA?: boolean;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  minimumRate?: string;
  serviceAreas?: string[];
  specializations?: string[];
  availableForNewProjects?: boolean;
}

export const getB2BSettings = async (): Promise<B2BSettingsData> => {
  const res = await api.get('/settings');
  return res.data;
};

export const updateB2BSettings = async (data: B2BSettingsData) => {
  const res = await api.put('/settings', data);
  return res.data;
};



