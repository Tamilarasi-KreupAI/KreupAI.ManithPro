import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EnhancedRecruiterDashboard from '../EnhancedRecruiterDashboard';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => null,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const mockJobAPI = {
  getAll: vi.fn(),
};

const mockApplicationAPI = {
  getAll: vi.fn(),
};

const mockUserAPI = {
  getDashboardStats: vi.fn(),
};

const mockInterviewAPI = {
  getUpcoming: vi.fn(),
};

vi.mock('../../services/api', () => ({
  jobAPI: {
    getAll: () => mockJobAPI.getAll(),
  },
  applicationAPI: {
    getAll: () => mockApplicationAPI.getAll(),
  },
  userAPI: {
    getDashboardStats: () => mockUserAPI.getDashboardStats(),
  },
}));

vi.mock('../../services/interviewAPI', () => ({
  interviewAPI: {
    getUpcoming: () => mockInterviewAPI.getUpcoming(),
  },
}));

describe('R-14: EnhancedRecruiterDashboard KPI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJobAPI.getAll.mockResolvedValue({ jobs: [] });
    mockApplicationAPI.getAll.mockResolvedValue({ applications: [] });
    mockInterviewAPI.getUpcoming.mockResolvedValue([]);
  });

  it('displays actual Time-to-Hire and Response Rate from userAPI.getDashboardStats', async () => {
    mockJobAPI.getAll.mockResolvedValue({
      jobs: [{ id: 'job-1', title: 'Full Stack Engineer', status: 'OPEN', location: 'Remote' }],
    });
    mockApplicationAPI.getAll.mockResolvedValue({
      applications: [
        { id: 'app-1', jobId: 'job-1', status: 'ACCEPTED', appliedAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-15T00:00:00Z' },
      ],
    });
    mockUserAPI.getDashboardStats.mockResolvedValue({
      totalJobs: 1,
      openJobs: 1,
      totalApplications: 1,
      pendingApplications: 0,
      recentApplications: [],
      avgTimeToHire: 14,
      timeToHire: 14,
      responseRate: 100,
    });

    render(<EnhancedRecruiterDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    // Check existing cards are preserved
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
    expect(screen.getByText('Hired')).toBeInTheDocument();

    // Check Time-to-Hire card
    expect(screen.getByText('Time-to-Hire (days)')).toBeInTheDocument();
    expect(screen.getByText('14 days')).toBeInTheDocument();

    // Check Response Rate card
    expect(screen.getByText('Response Rate (%)')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('displays 0 days and 0% safely when there are no hires and no responses', async () => {
    mockUserAPI.getDashboardStats.mockResolvedValue({
      totalJobs: 0,
      openJobs: 0,
      totalApplications: 0,
      pendingApplications: 0,
      recentApplications: [],
      avgTimeToHire: 0,
      timeToHire: 0,
      responseRate: 0,
    });

    render(<EnhancedRecruiterDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Time-to-Hire (days)')).toBeInTheDocument();
    expect(screen.getByText('0 days')).toBeInTheDocument();

    expect(screen.getByText('Response Rate (%)')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('falls back gracefully to application calculations if getDashboardStats fails', async () => {
    mockApplicationAPI.getAll.mockResolvedValue({
      applications: [
        { id: 'app-1', jobId: 'job-1', status: 'ACCEPTED', appliedAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-09T00:00:00Z' }, // 8 days
        { id: 'app-2', jobId: 'job-1', status: 'PENDING', appliedAt: '2026-10-10T00:00:00Z', updatedAt: '2026-10-10T00:00:00Z' },
      ],
    });
    mockUserAPI.getDashboardStats.mockRejectedValue(new Error('Network error'));

    render(<EnhancedRecruiterDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    // 1 hire of 8 days -> avgTimeToHire: 8 days
    expect(screen.getByText('8 days')).toBeInTheDocument();
    // 1 responded (ACCEPTED) out of 2 total -> responseRate: 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
