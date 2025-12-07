// ============================================================
// MSW HANDLERS - Mock Service Worker API handlers
// ============================================================

import { http, HttpResponse, delay } from 'msw';

// ============================================
// Base URL
// ============================================
const API_BASE = '/api/v1';

// ============================================
// Mock Data
// ============================================
const mockUsers = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'recruiter@example.com',
    firstName: 'Jane',
    lastName: 'Recruiter',
    role: 'recruiter',
    avatar: null,
    createdAt: '2024-01-15T00:00:00Z',
  },
];

const mockJobs = [
  {
    id: 'job-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'FULL_TIME',
    status: 'PUBLISHED',
    description: 'We are looking for a senior software engineer...',
    requirements: ['5+ years experience', 'React expertise'],
    responsibilities: ['Lead development', 'Mentor juniors'],
    salaryMin: 150000,
    salaryMax: 200000,
    applicantCount: 25,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'job-2',
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'FULL_TIME',
    status: 'PUBLISHED',
    description: 'Looking for an experienced product manager...',
    requirements: ['3+ years PM experience', 'Technical background'],
    responsibilities: ['Define roadmap', 'Work with engineering'],
    salaryMin: 120000,
    salaryMax: 160000,
    applicantCount: 15,
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
];

const mockCandidates = [
  {
    id: 'candidate-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    location: 'Austin, TX',
    headline: 'Full Stack Developer',
    summary: 'Experienced developer with 5+ years...',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    experience: [
      {
        id: 'exp-1',
        company: 'Tech Corp',
        title: 'Senior Developer',
        startDate: '2020-01-01',
        endDate: null,
        current: true,
        description: 'Building web applications',
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'State University',
        degree: 'BS Computer Science',
        field: 'Computer Science',
        startDate: '2012-09-01',
        endDate: '2016-05-15',
      },
    ],
    createdAt: '2024-01-05T00:00:00Z',
  },
];

const mockApplications = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    status: 'REVIEWING',
    stage: 'SCREENING',
    resume: 'resume-john-doe.pdf',
    coverLetter: 'I am excited to apply for this position...',
    appliedAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z',
    candidate: mockCandidates[0],
    job: mockJobs[0],
  },
];

const mockInterviews = [
  {
    id: 'interview-1',
    applicationId: 'app-1',
    type: 'VIDEO',
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    duration: 60,
    interviewers: [mockUsers[1]],
    meetingUrl: 'https://meet.example.com/interview-1',
    notes: '',
    createdAt: '2024-01-16T00:00:00Z',
  },
];

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'application',
    title: 'New Application',
    message: 'John Doe applied for Senior Software Engineer',
    read: false,
    createdAt: new Date().toISOString(),
    data: { applicationId: 'app-1', jobId: 'job-1' },
  },
  {
    id: 'notif-2',
    type: 'interview',
    title: 'Interview Scheduled',
    message: 'Interview with John Doe scheduled for tomorrow',
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    data: { interviewId: 'interview-1' },
  },
];

// ============================================
// Auth Handlers
// ============================================
export const authHandlers = [
  // Login
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: mockUsers[0],
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Logout
  http.post(`${API_BASE}/auth/logout`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),

  // Get current user
  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ user: mockUsers[0] });
  }),

  // Refresh token
  http.post(`${API_BASE}/auth/refresh`, async () => {
    await delay(50);
    return HttpResponse.json({
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
    });
  }),
];

// ============================================
// Jobs Handlers
// ============================================
export const jobsHandlers = [
  // List jobs
  http.get(`${API_BASE}/jobs`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredJobs = [...mockJobs];

    if (status) {
      filteredJobs = filteredJobs.filter(j => j.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter(
        j => j.title.toLowerCase().includes(searchLower) ||
             j.department.toLowerCase().includes(searchLower)
      );
    }

    const start = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(start, start + limit);

    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit),
      },
    });
  }),

  // Get single job
  http.get(`${API_BASE}/jobs/:id`, async ({ params }) => {
    await delay(50);
    const job = mockJobs.find(j => j.id === params.id);

    if (!job) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: job });
  }),

  // Create job
  http.post(`${API_BASE}/jobs`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;

    const newJob = {
      id: `job-${Date.now()}`,
      ...body,
      applicantCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newJob }, { status: 201 });
  }),

  // Update job
  http.patch(`${API_BASE}/jobs/:id`, async ({ params, request }) => {
    await delay(100);
    const job = mockJobs.find(j => j.id === params.id);

    if (!job) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as Record<string, unknown>;
    const updatedJob = {
      ...job,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: updatedJob });
  }),

  // Delete job
  http.delete(`${API_BASE}/jobs/:id`, async ({ params }) => {
    await delay(50);
    const jobIndex = mockJobs.findIndex(j => j.id === params.id);

    if (jobIndex === -1) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ success: true });
  }),
];

// ============================================
// Applications Handlers
// ============================================
export const applicationsHandlers = [
  // List applications
  http.get(`${API_BASE}/applications`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');
    const status = url.searchParams.get('status');

    let filtered = [...mockApplications];

    if (jobId) {
      filtered = filtered.filter(a => a.jobId === jobId);
    }

    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    return HttpResponse.json({
      data: filtered,
      pagination: {
        page: 1,
        limit: 10,
        total: filtered.length,
        totalPages: 1,
      },
    });
  }),

  // Get single application
  http.get(`${API_BASE}/applications/:id`, async ({ params }) => {
    await delay(50);
    const application = mockApplications.find(a => a.id === params.id);

    if (!application) {
      return HttpResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: application });
  }),

  // Update application status
  http.patch(`${API_BASE}/applications/:id/status`, async ({ params, request }) => {
    await delay(100);
    const application = mockApplications.find(a => a.id === params.id);

    if (!application) {
      return HttpResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as { status: string; stage?: string };
    const updated = {
      ...application,
      status: body.status,
      stage: body.stage || application.stage,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: updated });
  }),
];

// ============================================
// Candidates Handlers
// ============================================
export const candidatesHandlers = [
  // List candidates
  http.get(`${API_BASE}/candidates`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    let filtered = [...mockCandidates];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        c => c.firstName.toLowerCase().includes(searchLower) ||
             c.lastName.toLowerCase().includes(searchLower) ||
             c.email.toLowerCase().includes(searchLower)
      );
    }

    return HttpResponse.json({
      data: filtered,
      pagination: {
        page: 1,
        limit: 10,
        total: filtered.length,
        totalPages: 1,
      },
    });
  }),

  // Get single candidate
  http.get(`${API_BASE}/candidates/:id`, async ({ params }) => {
    await delay(50);
    const candidate = mockCandidates.find(c => c.id === params.id);

    if (!candidate) {
      return HttpResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: candidate });
  }),
];

// ============================================
// Interviews Handlers
// ============================================
export const interviewsHandlers = [
  // List interviews
  http.get(`${API_BASE}/interviews`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const applicationId = url.searchParams.get('applicationId');
    const status = url.searchParams.get('status');

    let filtered = [...mockInterviews];

    if (applicationId) {
      filtered = filtered.filter(i => i.applicationId === applicationId);
    }

    if (status) {
      filtered = filtered.filter(i => i.status === status);
    }

    return HttpResponse.json({
      data: filtered,
      pagination: {
        page: 1,
        limit: 10,
        total: filtered.length,
        totalPages: 1,
      },
    });
  }),

  // Get single interview
  http.get(`${API_BASE}/interviews/:id`, async ({ params }) => {
    await delay(50);
    const interview = mockInterviews.find(i => i.id === params.id);

    if (!interview) {
      return HttpResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: interview });
  }),

  // Schedule interview
  http.post(`${API_BASE}/interviews`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;

    const newInterview = {
      id: `interview-${Date.now()}`,
      ...body,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newInterview }, { status: 201 });
  }),

  // Update interview
  http.patch(`${API_BASE}/interviews/:id`, async ({ params, request }) => {
    await delay(100);
    const interview = mockInterviews.find(i => i.id === params.id);

    if (!interview) {
      return HttpResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as Record<string, unknown>;
    const updated = {
      ...interview,
      ...body,
    };

    return HttpResponse.json({ data: updated });
  }),

  // Cancel interview
  http.post(`${API_BASE}/interviews/:id/cancel`, async ({ params }) => {
    await delay(50);
    const interview = mockInterviews.find(i => i.id === params.id);

    if (!interview) {
      return HttpResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: { ...interview, status: 'CANCELLED' },
    });
  }),

  // Submit feedback
  http.post(`${API_BASE}/interviews/:id/feedback`, async ({ params, request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;

    return HttpResponse.json({
      data: {
        id: `feedback-${Date.now()}`,
        interviewId: params.id,
        ...body,
        createdAt: new Date().toISOString(),
      },
    });
  }),
];

// ============================================
// Notifications Handlers
// ============================================
export const notificationsHandlers = [
  // List notifications
  http.get(`${API_BASE}/notifications`, async () => {
    await delay(50);

    return HttpResponse.json({
      data: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.read).length,
    });
  }),

  // Mark as read
  http.patch(`${API_BASE}/notifications/:id/read`, async ({ params }) => {
    await delay(50);
    const notification = mockNotifications.find(n => n.id === params.id);

    if (!notification) {
      return HttpResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: { ...notification, read: true },
    });
  }),

  // Mark all as read
  http.post(`${API_BASE}/notifications/read-all`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),
];

// ============================================
// Users Handlers
// ============================================
export const usersHandlers = [
  // List users
  http.get(`${API_BASE}/users`, async () => {
    await delay(100);

    return HttpResponse.json({
      data: mockUsers,
      pagination: {
        page: 1,
        limit: 10,
        total: mockUsers.length,
        totalPages: 1,
      },
    });
  }),

  // Get user by ID
  http.get(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(50);
    const user = mockUsers.find(u => u.id === params.id);

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: user });
  }),
];

// ============================================
// Combined Handlers
// ============================================
export const handlers = [
  ...authHandlers,
  ...jobsHandlers,
  ...applicationsHandlers,
  ...candidatesHandlers,
  ...interviewsHandlers,
  ...notificationsHandlers,
  ...usersHandlers,
];

export default handlers;
