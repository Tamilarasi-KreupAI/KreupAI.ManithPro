// ============================================================
// TEST UTILITIES - Custom render and test helpers
// ============================================================

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============================================
// Types
// ============================================
interface WrapperProps {
  children: ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialEntries?: string[];
  withRouter?: boolean;
  withQueryClient?: boolean;
  queryClient?: QueryClient;
}

// ============================================
// Create Test Query Client
// ============================================
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// ============================================
// All Providers Wrapper
// ============================================
export const AllProviders: React.FC<WrapperProps & { queryClient?: QueryClient }> = ({
  children,
  queryClient,
}) => {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// ============================================
// Memory Router Wrapper (for route testing)
// ============================================
export const MemoryRouterWrapper: React.FC<
  WrapperProps & { initialEntries?: string[] }
> = ({ children, initialEntries = ['/'] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );
};

// ============================================
// Custom Render Function
// ============================================
export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const {
    route = '/',
    initialEntries = [route],
    withRouter = true,
    withQueryClient = true,
    queryClient,
    ...renderOptions
  } = options;

  const client = queryClient || createTestQueryClient();

  const Wrapper: React.FC<WrapperProps> = ({ children }) => {
    let wrappedChildren = children;

    if (withQueryClient) {
      wrappedChildren = (
        <QueryClientProvider client={client}>
          {wrappedChildren}
        </QueryClientProvider>
      );
    }

    if (withRouter) {
      wrappedChildren = (
        <MemoryRouter initialEntries={initialEntries}>
          {wrappedChildren}
        </MemoryRouter>
      );
    }

    return <>{wrappedChildren}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// ============================================
// Render with Routes
// ============================================
interface RenderWithRoutesOptions extends CustomRenderOptions {
  path?: string;
  routes?: Array<{ path: string; element: ReactElement }>;
}

export const renderWithRoutes = (
  ui: ReactElement,
  options: RenderWithRoutesOptions = {}
): RenderResult => {
  const {
    path = '/',
    route = '/',
    routes = [],
    queryClient,
    ...renderOptions
  } = options;

  const client = queryClient || createTestQueryClient();

  const Wrapper: React.FC<WrapperProps> = ({ children }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={children} />
          {routes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// ============================================
// Wait Utilities
// ============================================
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const waitForNextTick = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

// ============================================
// Mock Data Factories
// ============================================
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'recruiter',
  avatar: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockJob = (overrides = {}) => ({
  id: 'job-1',
  title: 'Software Engineer',
  department: 'Engineering',
  location: 'San Francisco, CA',
  type: 'FULL_TIME',
  status: 'PUBLISHED',
  description: 'We are looking for a software engineer...',
  requirements: ['3+ years experience', 'React knowledge'],
  responsibilities: ['Build features', 'Review code'],
  salaryMin: 100000,
  salaryMax: 150000,
  applicantCount: 10,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockApplication = (overrides = {}) => ({
  id: 'app-1',
  jobId: 'job-1',
  candidateId: 'candidate-1',
  status: 'PENDING',
  stage: 'SCREENING',
  resume: 'resume.pdf',
  coverLetter: 'I am excited to apply...',
  appliedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockInterview = (overrides = {}) => ({
  id: 'interview-1',
  applicationId: 'app-1',
  type: 'VIDEO',
  status: 'SCHEDULED',
  scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  duration: 60,
  interviewers: [createMockUser({ id: 'interviewer-1' })],
  meetingUrl: 'https://meet.example.com/abc',
  ...overrides,
});

export const createMockCandidate = (overrides = {}) => ({
  id: 'candidate-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  location: 'New York, NY',
  headline: 'Senior Software Engineer',
  summary: 'Experienced engineer with...',
  skills: ['JavaScript', 'React', 'Node.js'],
  experience: [],
  education: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockNotification = (overrides = {}) => ({
  id: 'notification-1',
  type: 'application',
  title: 'New Application',
  message: 'John Doe applied for Software Engineer',
  read: false,
  createdAt: new Date().toISOString(),
  data: {},
  ...overrides,
});

// ============================================
// Event Simulation Helpers
// ============================================
export const simulateEscapeKey = () => {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    bubbles: true,
  });
  document.dispatchEvent(event);
};

export const simulateEnterKey = (element: HTMLElement) => {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true,
  });
  element.dispatchEvent(event);
};

export const simulateTabKey = (element: HTMLElement, shiftKey = false) => {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    code: 'Tab',
    shiftKey,
    bubbles: true,
  });
  element.dispatchEvent(event);
};

// ============================================
// Form Testing Helpers
// ============================================
export const fillInput = async (
  container: HTMLElement,
  name: string,
  value: string
) => {
  const { getByRole, getByLabelText } = await import('@testing-library/react');
  const { fireEvent } = await import('@testing-library/react');

  let input: HTMLElement;
  try {
    input = getByRole(container, 'textbox', { name: new RegExp(name, 'i') });
  } catch {
    input = getByLabelText(container, new RegExp(name, 'i'));
  }

  fireEvent.change(input, { target: { value } });
  return input;
};

export const selectOption = async (
  container: HTMLElement,
  name: string,
  value: string
) => {
  const { getByRole, getByLabelText } = await import('@testing-library/react');
  const { fireEvent } = await import('@testing-library/react');

  let select: HTMLElement;
  try {
    select = getByRole(container, 'combobox', { name: new RegExp(name, 'i') });
  } catch {
    select = getByLabelText(container, new RegExp(name, 'i'));
  }

  fireEvent.change(select, { target: { value } });
  return select;
};

// ============================================
// Re-export everything from testing-library
// ============================================
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Use custom render as default
export { customRender as render };
