// ============================================================
// APPLICATION INTEGRATION TESTS
// Tests for the complete application workflow
// ============================================================

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '../test-utils';
import { server } from '../msw';
import { http, HttpResponse } from 'msw';
import { useState, useEffect } from 'react';
import userEvent from '@testing-library/user-event';

// ============================================
// Test Setup
// ============================================
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================
// Types
// ============================================
interface Application {
  id: string;
  candidateName: string;
  email: string;
  jobTitle: string;
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'OFFERED' | 'REJECTED' | 'HIRED';
  appliedAt: string;
  resumeUrl?: string;
}

interface ApplicationsResponse {
  data: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Mock Data
// ============================================
const mockApplications: Application[] = [
  {
    id: 'app-1',
    candidateName: 'John Doe',
    email: 'john@example.com',
    jobTitle: 'Senior Software Engineer',
    status: 'PENDING',
    appliedAt: '2024-01-15T10:00:00Z',
    resumeUrl: '/resumes/john-doe.pdf',
  },
  {
    id: 'app-2',
    candidateName: 'Jane Smith',
    email: 'jane@example.com',
    jobTitle: 'Product Manager',
    status: 'INTERVIEW',
    appliedAt: '2024-01-14T09:00:00Z',
  },
  {
    id: 'app-3',
    candidateName: 'Bob Wilson',
    email: 'bob@example.com',
    jobTitle: 'UX Designer',
    status: 'OFFERED',
    appliedAt: '2024-01-13T11:00:00Z',
  },
];

// ============================================
// Applications List Component
// ============================================
interface ApplicationsListProps {
  onSelect?: (app: Application) => void;
  onStatusChange?: (id: string, status: Application['status']) => void;
}

const ApplicationsList = ({ onSelect, onStatusChange }: ApplicationsListProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Application['status'] | 'ALL'>('ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter !== 'ALL') params.set('status', filter);

        const response = await fetch(`/api/v1/applications?${params}`);
        if (!response.ok) throw new Error('Failed to fetch applications');

        const data: ApplicationsResponse = await response.json();
        setApplications(data.data);
      } catch (err) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filter]);

  const handleStatusChange = async (id: string, newStatus: Application['status']) => {
    try {
      const response = await fetch(`/api/v1/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setApplications(apps =>
        apps.map(app => (app.id === id ? { ...app, status: newStatus } : app))
      );
      onStatusChange?.(id, newStatus);
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  if (loading) {
    return <div role="status">Loading applications...</div>;
  }

  if (error) {
    return <div role="alert">{error}</div>;
  }

  return (
    <div>
      <div className="filters">
        <label htmlFor="status-filter">Filter by status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as Application['status'] | 'ALL')}
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFERED">Offered</option>
          <option value="REJECTED">Rejected</option>
          <option value="HIRED">Hired</option>
        </select>
      </div>

      {applications.length === 0 ? (
        <p>No applications found</p>
      ) : (
        <table role="table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} data-testid={`application-row-${app.id}`}>
                <td>
                  <button
                    onClick={() => onSelect?.(app)}
                    className="candidate-name"
                  >
                    {app.candidateName}
                  </button>
                </td>
                <td>{app.jobTitle}</td>
                <td>
                  <span className={`status-badge status-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <select
                    aria-label={`Change status for ${app.candidateName}`}
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(app.id, e.target.value as Application['status'])
                    }
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFERED">Offered</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="HIRED">Hired</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ============================================
// Application Detail Component
// ============================================
interface ApplicationDetailProps {
  applicationId: string;
  onClose?: () => void;
}

const ApplicationDetail = ({ applicationId, onClose }: ApplicationDetailProps) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/applications/${applicationId}`);
        if (!response.ok) throw new Error('Application not found');

        const data = await response.json();
        setApplication(data);
      } catch (err) {
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  if (loading) return <div role="status">Loading details...</div>;
  if (error) return <div role="alert">{error}</div>;
  if (!application) return <div>Application not found</div>;

  return (
    <div role="dialog" aria-labelledby="app-detail-title">
      <header>
        <h2 id="app-detail-title">{application.candidateName}</h2>
        <button onClick={onClose} aria-label="Close">×</button>
      </header>
      <dl>
        <dt>Email</dt>
        <dd>{application.email}</dd>
        <dt>Position</dt>
        <dd>{application.jobTitle}</dd>
        <dt>Status</dt>
        <dd>{application.status}</dd>
        <dt>Applied</dt>
        <dd>{new Date(application.appliedAt).toLocaleDateString()}</dd>
        {application.resumeUrl && (
          <>
            <dt>Resume</dt>
            <dd>
              <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
            </dd>
          </>
        )}
      </dl>
    </div>
  );
};

// ============================================
// Tests
// ============================================
describe('Applications Integration', () => {
  describe('ApplicationsList', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/v1/applications', ({ request }) => {
          const url = new URL(request.url);
          const statusFilter = url.searchParams.get('status');

          let filteredApps = mockApplications;
          if (statusFilter) {
            filteredApps = mockApplications.filter(app => app.status === statusFilter);
          }

          return HttpResponse.json({
            data: filteredApps,
            pagination: {
              page: 1,
              limit: 10,
              total: filteredApps.length,
              totalPages: 1,
            },
          });
        })
      );
    });

    it('displays loading state initially', () => {
      render(<ApplicationsList />);
      expect(screen.getByRole('status')).toHaveTextContent('Loading applications...');
    });

    it('displays applications from API', async () => {
      render(<ApplicationsList />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('filters applications by status', async () => {
      render(<ApplicationsList />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const filter = screen.getByLabelText('Filter by status:');
      await userEvent.selectOptions(filter, 'PENDING');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('updates application status', async () => {
      const onStatusChange = vi.fn();

      server.use(
        http.patch('/api/v1/applications/:id/status', () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<ApplicationsList onStatusChange={onStatusChange} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText('Change status for John Doe');
      await userEvent.selectOptions(statusSelect, 'REVIEWED');

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('app-1', 'REVIEWED');
      });
    });

    it('calls onSelect when candidate name clicked', async () => {
      const onSelect = vi.fn();
      render(<ApplicationsList onSelect={onSelect} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('John Doe'));

      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'app-1',
          candidateName: 'John Doe',
        })
      );
    });

    it('displays error when API fails', async () => {
      server.use(
        http.get('/api/v1/applications', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      render(<ApplicationsList />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load applications');
      });
    });

    it('displays empty state when no applications', async () => {
      server.use(
        http.get('/api/v1/applications', () => {
          return HttpResponse.json({
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          });
        })
      );

      render(<ApplicationsList />);

      await waitFor(() => {
        expect(screen.getByText('No applications found')).toBeInTheDocument();
      });
    });
  });

  describe('ApplicationDetail', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/v1/applications/:id', ({ params }) => {
          const app = mockApplications.find(a => a.id === params.id);
          if (!app) {
            return HttpResponse.json({ error: 'Not found' }, { status: 404 });
          }
          return HttpResponse.json(app);
        })
      );
    });

    it('displays loading state initially', () => {
      render(<ApplicationDetail applicationId="app-1" />);
      expect(screen.getByRole('status')).toHaveTextContent('Loading details...');
    });

    it('displays application details', async () => {
      render(<ApplicationDetail applicationId="app-1" />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('View Resume')).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', async () => {
      const onClose = vi.fn();
      render(<ApplicationDetail applicationId="app-1" onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('displays error for non-existent application', async () => {
      render(<ApplicationDetail applicationId="non-existent" />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load application details');
      });
    });
  });
});

// ============================================
// Application Workflow E2E Test
// ============================================
describe('Application Workflow E2E', () => {
  const ApplicationWorkflow = () => {
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [statusUpdates, setStatusUpdates] = useState<string[]>([]);

    return (
      <div>
        {selectedApp ? (
          <ApplicationDetail
            applicationId={selectedApp.id}
            onClose={() => setSelectedApp(null)}
          />
        ) : (
          <ApplicationsList
            onSelect={setSelectedApp}
            onStatusChange={(id, status) => {
              setStatusUpdates(prev => [...prev, `${id}: ${status}`]);
            }}
          />
        )}
        {statusUpdates.length > 0 && (
          <div data-testid="status-updates">
            <h3>Recent Updates</h3>
            <ul>
              {statusUpdates.map((update, i) => (
                <li key={i}>{update}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  beforeEach(() => {
    server.use(
      http.get('/api/v1/applications', () => {
        return HttpResponse.json({
          data: mockApplications,
          pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
        });
      }),
      http.get('/api/v1/applications/:id', ({ params }) => {
        const app = mockApplications.find(a => a.id === params.id);
        return HttpResponse.json(app);
      }),
      http.patch('/api/v1/applications/:id/status', () => {
        return HttpResponse.json({ success: true });
      })
    );
  });

  it('complete workflow: list -> detail -> back -> status change', async () => {
    render(<ApplicationWorkflow />);

    // Wait for list to load
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Click on candidate to view details
    await userEvent.click(screen.getByText('John Doe'));

    // Wait for detail view
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    // Close detail view
    await userEvent.click(screen.getByLabelText('Close'));

    // Back to list
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Change application status
    const statusSelect = screen.getByLabelText('Change status for John Doe');
    await userEvent.selectOptions(statusSelect, 'INTERVIEW');

    // Verify update was recorded
    await waitFor(() => {
      const updates = screen.getByTestId('status-updates');
      expect(updates).toHaveTextContent('app-1: INTERVIEW');
    });
  });
});
