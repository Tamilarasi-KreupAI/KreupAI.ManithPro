// ============================================================
// INTEGRATION TESTS - Tests using MSW for API mocking
// ============================================================

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { server } from '../msw';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// ============================================
// Test Setup
// ============================================
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================
// Test Component that fetches jobs
// ============================================
interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
}

interface JobsResponse {
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const JobsList = () => {
  const { data, isLoading, error } = useQuery<JobsResponse>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await fetch('/api/v1/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div role="status">Loading jobs...</div>;
  }

  if (error) {
    return <div role="alert">Error loading jobs</div>;
  }

  if (!data?.data.length) {
    return <div>No jobs found</div>;
  }

  return (
    <ul role="list">
      {data.data.map((job) => (
        <li key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.department}</p>
          <p>{job.location}</p>
        </li>
      ))}
    </ul>
  );
};

// ============================================
// Jobs List Tests
// ============================================
describe('JobsList Integration', () => {
  it('displays loading state initially', () => {
    render(<JobsList />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading jobs...');
  });

  it('displays jobs from API', async () => {
    render(<JobsList />);

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
  });

  it('displays error when API fails', async () => {
    // Override handler to return error
    server.use(
      http.get('/api/v1/jobs', () => {
        return HttpResponse.json(
          { error: 'Server error' },
          { status: 500 }
        );
      })
    );

    render(<JobsList />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error loading jobs');
    });
  });

  it('displays empty state when no jobs', async () => {
    // Override handler to return empty array
    server.use(
      http.get('/api/v1/jobs', () => {
        return HttpResponse.json({
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      })
    );

    render(<JobsList />);

    await waitFor(() => {
      expect(screen.getByText('No jobs found')).toBeInTheDocument();
    });
  });
});

// ============================================
// Test Component that creates a job
// ============================================
interface CreateJobFormProps {
  onSuccess?: () => void;
}

const CreateJobForm = ({ onSuccess }: CreateJobFormProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status: 'DRAFT' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      setStatus('success');
      onSuccess?.();
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Job title"
        aria-label="Job title"
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Creating...' : 'Create Job'}
      </button>
      {status === 'success' && <p role="status">Job created successfully!</p>}
      {status === 'error' && <p role="alert">Failed to create job</p>}
    </form>
  );
};

import { useState } from 'react';

// ============================================
// Create Job Tests
// ============================================
describe('CreateJobForm Integration', () => {
  it('creates job successfully', async () => {
    const onSuccess = vi.fn();
    render(<CreateJobForm onSuccess={onSuccess} />);

    const input = screen.getByLabelText('Job title');
    const button = screen.getByRole('button', { name: /create job/i });

    await userEvent.type(input, 'New Position');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Job created successfully!');
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows error on failure', async () => {
    server.use(
      http.post('/api/v1/jobs', () => {
        return HttpResponse.json(
          { error: 'Validation failed' },
          { status: 400 }
        );
      })
    );

    render(<CreateJobForm />);

    const input = screen.getByLabelText('Job title');
    const button = screen.getByRole('button', { name: /create job/i });

    await userEvent.type(input, 'Test');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to create job');
    });
  });
});

// Import vi and userEvent
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// ============================================
// Auth Integration Tests
// ============================================
describe('Auth Integration', () => {
  const LoginForm = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<{ firstName: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('loading');

      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        setUser(data.user);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };

    if (user) {
      return <div>Welcome, {user.firstName}!</div>;
    }

    return (
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          aria-label="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password"
        />
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in...' : 'Login'}
        </button>
        {status === 'error' && <p role="alert">Invalid credentials</p>}
      </form>
    );
  };

  it('logs in successfully with valid credentials', async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'admin@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome, admin!/i)).toBeInTheDocument();
    });
  });

  it('shows error with invalid credentials', async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });
});
