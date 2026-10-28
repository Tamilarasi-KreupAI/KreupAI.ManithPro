import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecruiterDashboard from '../RecruiterDashboard';

const mockJobAPI = {
  getAll: vi.fn(),
};

const mockApplicationAPI = {
  getAll: vi.fn(),
};

const mockUserAPI = {
  getDashboardStats: vi.fn(),
};

vi.mock('../../services/api', () => ({
  jobAPI: {
    getAll: (params?: any) => mockJobAPI.getAll(params),
  },
  applicationAPI: {
    getAll: () => mockApplicationAPI.getAll(),
  },
  userAPI: {
    getDashboardStats: () => mockUserAPI.getDashboardStats(),
  },
}));

describe('R-14: RecruiterDashboard KPI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJobAPI.getAll.mockResolvedValue({ jobs: [] });
    mockApplicationAPI.getAll.mockResolvedValue({ applications: [] });
  });

  it('displays Time-to-Hire (days) and Response Rate (%) from userAPI.getDashboardStats', async () => {
    mockJobAPI.getAll.mockResolvedValue({
      jobs: [{ id: 'job-1', title: 'Frontend Developer', status: 'OPEN' }],
    });
    mockApplicationAPI.getAll.mockResolvedValue({
      applications: [{ id: 'app-1', jobId: 'job-1', status: 'ACCEPTED', appliedAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-15T00:00:00Z' }],
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

    render(
      <BrowserRouter>
        <RecruiterDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument();
    });

    // Check all 6 cards
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getAllByText('Pending Review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hired').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Time-to-Hire (days)')).toBeInTheDocument();
    expect(screen.getByText('14 days')).toBeInTheDocument();
    expect(screen.getByText('Response Rate (%)')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('safely handles zero values for Time-to-Hire and Response Rate', async () => {
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

    render(
      <BrowserRouter>
        <RecruiterDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Time-to-Hire (days)')).toBeInTheDocument();
    expect(screen.getByText('0 days')).toBeInTheDocument();
    expect(screen.getByText('Response Rate (%)')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
