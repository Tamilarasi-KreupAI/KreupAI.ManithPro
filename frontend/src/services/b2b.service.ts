import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: `${API_URL}/b2b`,
  headers: { 'Content-Type': 'application/json' },
});

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
}) => {
  const res = await api.post('/contracts', data);
  return res.data;
};
export const getVendorCandidates = async () => {
  const res = await api.get('/candidates');
  return res.data;
};

export const downloadCandidateResume = async (id: string) => {
  const res = await api.get(`/candidates/${id}/resume`, {
    responseType: 'blob',
  });
  return res.data;
};

export const addCandidate = async (payload: {
  name: string;
  title?: string;
  experienceYears?: number;
  skills: string[];
  rate?: string;
  location?: string;
}) => {
  const res = await api.post('/candidates', payload);
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
  partnerName: string;
  amount: number;
  dueDate: string;
  items: string;
}) => {
  const res = await api.post('/invoices', payload);
  return res.data;
};
