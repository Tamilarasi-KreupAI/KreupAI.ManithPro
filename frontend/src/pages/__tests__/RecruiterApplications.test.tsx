import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecruiterApplications, {
  escapeCSVValue,
  convertApplicationsToCSV,
  downloadCSV,
} from '../RecruiterApplications';

const mockJobAPI = {
  getAll: vi.fn(),
};

const mockApplicationAPI = {
  getAll: vi.fn(),
  bulkUpdateStatus: vi.fn(),
};

vi.mock('../../services/api', () => ({
  jobAPI: {
    getAll: () => mockJobAPI.getAll(),
  },
  applicationAPI: {
    getAll: (params?: any) => mockApplicationAPI.getAll(params),
    bulkUpdateStatus: (payload: any) => mockApplicationAPI.bulkUpdateStatus(payload),
  },
}));

const mockJobs = [
  { id: 'job-1', title: 'Frontend Engineer', location: 'Remote', type: 'FULL_TIME' },
  { id: 'job-2', title: 'Backend "Lead" Engineer', location: 'New York', type: 'FULL_TIME' },
];

const mockApplications = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateId: 'cand-1',
    status: 'PENDING',
    appliedAt: '2026-10-01T10:00:00.000Z',
    resume: 'uploads/resume1.pdf',
    candidate: {
      id: 'cand-1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      skills: ['React', 'TypeScript'],
    },
    job: {
      id: 'job-1',
      title: 'Frontend Engineer',
      location: 'Remote',
      type: 'FULL_TIME',
    },
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    candidateId: 'cand-2',
    status: 'SHORTLISTED',
    appliedAt: '2026-10-05T12:00:00.000Z',
    resume: 'uploads/resume2.pdf',
    candidate: {
      id: 'cand-2',
      firstName: 'Bob, Jr.',
      lastName: 'Jones',
      email: 'bob@example.com',
      skills: ['Node.js'],
    },
    job: {
      id: 'job-2',
      title: 'Backend "Lead" Engineer',
      location: 'New York',
      type: 'FULL_TIME',
    },
  },
  {
    id: 'app-3',
    jobId: 'job-1',
    candidateId: 'cand-3',
    status: 'REJECTED',
    appliedAt: '2026-09-20T08:00:00.000Z',
    resume: 'uploads/resume3.pdf',
    candidate: {
      id: 'cand-3',
      firstName: 'Charlie\nSenior',
      lastName: 'Brown',
      email: 'charlie@example.com',
      skills: ['Python'],
    },
    job: {
      id: 'job-1',
      title: 'Frontend Engineer',
      location: 'Remote',
      type: 'FULL_TIME',
    },
  },
];

describe('R-15: Recruiter CSV Export Utility Functions', () => {
  describe('escapeCSVValue', () => {
    it('returns empty string for null and undefined', () => {
      expect(escapeCSVValue(null)).toBe('');
      expect(escapeCSVValue(undefined)).toBe('');
    });

    it('returns simple string without modification if no special characters exist', () => {
      expect(escapeCSVValue('Software Engineer')).toBe('Software Engineer');
      expect(escapeCSVValue('Alice Smith')).toBe('Alice Smith');
    });

    it('wraps values containing commas in double quotes', () => {
      expect(escapeCSVValue('Smith, Alice')).toBe('"Smith, Alice"');
      expect(escapeCSVValue('Remote, Full-Time')).toBe('"Remote, Full-Time"');
    });

    it('escapes existing double quotes by doubling them and wrapping in double quotes', () => {
      expect(escapeCSVValue('Backend "Lead" Engineer')).toBe('"Backend ""Lead"" Engineer"');
      expect(escapeCSVValue('"Quotes"')).toBe('"""Quotes"""');
    });

    it('wraps values containing newlines in double quotes', () => {
      expect(escapeCSVValue('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
      expect(escapeCSVValue('Line 1\r\nLine 2')).toBe('"Line 1\r\nLine 2"');
    });

    it('correctly handles values containing both commas and double quotes', () => {
      expect(escapeCSVValue('Jones, "Bob" Jr.')).toBe('"Jones, ""Bob"" Jr."');
    });

    it('converts numbers and booleans to string', () => {
      expect(escapeCSVValue(42)).toBe('42');
      expect(escapeCSVValue(true)).toBe('true');
    });
  });

  describe('convertApplicationsToCSV', () => {
    it('returns empty string when applications array is empty or null', () => {
      expect(convertApplicationsToCSV([])).toBe('');
      expect(convertApplicationsToCSV(null as any)).toBe('');
    });

    it('generates valid CSV with header and data rows', () => {
      const csv = convertApplicationsToCSV(mockApplications as any);

      expect(csv).toContain('Candidate Name,Email,Job Title,Application Status,Applied Date');

      // Check row 1
      expect(csv).toContain('Alice Smith,alice@example.com,Frontend Engineer,PENDING');

      // Check row 2 (escaped comma and quote)
      expect(csv).toContain('"Bob, Jr. Jones",bob@example.com,"Backend ""Lead"" Engineer",SHORTLISTED');

      // Check row 3 (escaped newline)
      expect(csv).toContain('"Charlie\nSenior Brown",charlie@example.com,Frontend Engineer,REJECTED');
    });

    it('handles applications with missing optional fields gracefully', () => {
      const sparseApp = [
        {
          id: 'sparse-1',
          jobId: 'job-x',
          candidateId: 'cand-x',
          status: 'PENDING',
          appliedAt: '',
          resume: '',
        },
      ];

      const csv = convertApplicationsToCSV(sparseApp as any);
      expect(csv).toBe('Candidate Name,Email,Job Title,Application Status,Applied Date\n,,,PENDING,');
    });
  });

  describe('downloadCSV', () => {
    it('does nothing when csv string is empty', () => {
      const mockCreateObjectURL = URL.createObjectURL as any;
      mockCreateObjectURL.mockClear();

      downloadCSV('');
      expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    it('creates object URL and triggers anchor click when csv has content', () => {
      const mockCreateObjectURL = URL.createObjectURL as any;
      const mockRevokeObjectURL = URL.revokeObjectURL as any;
      mockCreateObjectURL.mockReset();
      mockCreateObjectURL.mockReturnValue('blob:mock-url');
      mockRevokeObjectURL.mockReset();

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      downloadCSV('Header\nValue', 'test.csv');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

      clickSpy.mockRestore();
    });
  });
});

describe('R-15: Recruiter Applications Page CSV Export Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (URL.createObjectURL as any).mockReset();
    (URL.createObjectURL as any).mockReturnValue('blob:mock-url');
    (URL.revokeObjectURL as any).mockReset();

    mockJobAPI.getAll.mockResolvedValue({ jobs: mockJobs });
    mockApplicationAPI.getAll.mockResolvedValue({
      applications: mockApplications,
      pagination: {
        total: mockApplications.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });

  it('renders the Export CSV button in enabled state when applications exist', async () => {
    render(
      <BrowserRouter>
        <RecruiterApplications />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Application Manager')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).not.toBeDisabled();
  });

const readBlobText = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
};

  it('exports multiple filtered applications with correct CSV headers and values', async () => {
    let capturedBlob: Blob | null = null;
    (URL.createObjectURL as any).mockImplementation((blob: any) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <RecruiterApplications />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    fireEvent.click(exportBtn);

    expect(capturedBlob).not.toBeNull();
    const text = await readBlobText(capturedBlob as unknown as Blob);

    expect(text).toContain('Candidate Name,Email,Job Title,Application Status,Applied Date');
    expect(text).toContain('Alice Smith');
    expect(text).toContain('alice@example.com');
    expect(text).toContain('"Bob, Jr. Jones"');
    expect(text).toContain('bob@example.com');
    expect(text).toContain('"Backend ""Lead"" Engineer"');
    expect(text).toContain('Charlie\nSenior Brown');

    clickSpy.mockRestore();
  });

  it('exports only matching records after changing a search term', async () => {
    let capturedBlob: Blob | null = null;
    (URL.createObjectURL as any).mockImplementation((blob: any) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <RecruiterApplications />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search candidates or jobs...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    fireEvent.click(exportBtn);

    expect(capturedBlob).not.toBeNull();
    const text = await readBlobText(capturedBlob as unknown as Blob);

    expect(text).toContain('Alice Smith');
    expect(text).toContain('alice@example.com');
    expect(text).not.toContain('Bob, Jr.');
    expect(text).not.toContain('Charlie');

    clickSpy.mockRestore();
  });

  it('exports only matching records after changing status filter', async () => {
    let capturedBlob: Blob | null = null;
    (URL.createObjectURL as any).mockImplementation((blob: any) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <RecruiterApplications />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // Select 'SHORTLISTED'
    const statusSelect = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelect, { target: { value: 'SHORTLISTED' } });

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    fireEvent.click(exportBtn);

    expect(capturedBlob).not.toBeNull();
    const text = await readBlobText(capturedBlob as unknown as Blob);

    expect(text).toContain('"Bob, Jr. Jones"');
    expect(text).toContain('SHORTLISTED');
    expect(text).not.toContain('Alice Smith');
    expect(text).not.toContain('Charlie');

    clickSpy.mockRestore();
  });

  it('handles empty-results case clearly and disables download', async () => {
    (URL.createObjectURL as any).mockClear();

    mockApplicationAPI.getAll.mockResolvedValue({
      applications: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });

    render(
      <BrowserRouter>
        <RecruiterApplications />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Applications Found')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    expect(exportBtn).toBeDisabled();
    expect(exportBtn).toHaveAttribute('title', 'No applications to export');

    fireEvent.click(exportBtn);
    expect((URL.createObjectURL as any)).not.toHaveBeenCalled();
  });

  it('disables export button when filtered results yield no matches', async () => {
    (URL.createObjectURL as any).mockClear();

    render(
      <BrowserRouter>
        <RecruiterApplications />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search candidates or jobs...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentCandidate999' } });

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    expect(exportBtn).toBeDisabled();

    fireEvent.click(exportBtn);
    expect((URL.createObjectURL as any)).not.toHaveBeenCalled();
  });
});
