import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $use: vi.fn(),
    job: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
     findUnique: vi.fn(),
     findMany: vi.fn(),
    },
    application: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

import request from 'supertest';
import app from '../index';
import { generateToken } from '../utils/jwt';

const candidateToken = generateToken({
  userId: 'test-candidate-id',
  email: 'test-candidate@manithpro.com',
  role: 'CANDIDATE',
});

const recruiterToken = generateToken({
  userId: 'test-recruiter-id',
  email: 'test-recruiter@manithpro.com',
  role: 'RECRUITER',
});

describe('Jobs API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthenticated job listing requests', async () => {
    const response = await request(app).get('/api/jobs');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No token provided');
  });

  it('should return paginated jobs', async () => {
    mockPrisma.job.findMany.mockResolvedValue([
      {
        id: 'job-1',
        title: 'Frontend Developer',
        companyName: 'Test Company',
        status: 'OPEN',
      },
    ]);

    mockPrisma.job.count.mockResolvedValue(25);

    const response = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${candidateToken}`)
      .query({
        page: 2,
        limit: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.pagination.total).toBe(25);
    expect(response.body.pagination.totalPages).toBe(3);

    expect(mockPrisma.job.findMany).toHaveBeenCalled();
    expect(mockPrisma.job.count).toHaveBeenCalled();
  });

  it('should pass search and salary filters to Prisma', async () => {
    mockPrisma.job.findMany.mockResolvedValue([]);
    mockPrisma.job.count.mockResolvedValue(0);

    const response = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${candidateToken}`)
      .query({
        search: 'developer',
        location: 'Remote',
        salaryMin: 50000,
        salaryMax: 150000,
      });

    expect(response.status).toBe(200);

    const findManyCall = mockPrisma.job.findMany.mock.calls[0][0];

    expect(findManyCall.where.OR).toBeDefined();
    expect(findManyCall.where.location).toBeDefined();
    expect(findManyCall.where.AND).toBeDefined();

    expect(findManyCall.where.AND).toEqual(
      expect.arrayContaining([
        { salaryMax: { gte: 50000 } },
        { salaryMin: { lte: 150000 } },
      ])
    );
  });

  it('should close a job instead of deleting it', async () => {
    mockPrisma.job.findUnique.mockResolvedValue({
      id: 'job-1',
      postedById: 'test-recruiter-id',
      status: 'OPEN',
    });

    mockPrisma.job.update.mockResolvedValue({
      id: 'job-1',
      status: 'CLOSED',
    });

    const response = await request(app)
      .delete('/api/jobs/job-1')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Job closed successfully');

    expect(mockPrisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
        data: { status: 'CLOSED' },
      })
    );

    expect(mockPrisma.job.delete).not.toHaveBeenCalled();
  });

  it('should return paginated companies', async () => {
    mockPrisma.job.groupBy.mockResolvedValue([
      {
        companyName: 'TechCorp Inc.',
        companyDescription: 'Technology company',
        companyWebsite: 'https://techcorp.example.com',
        companyLogo: null,
        companySize: '500-1000',
        companyIndustry: 'Technology',
        _count: { id: 3 },
      },
      {
        companyName: 'DesignHub Co.',
        companyDescription: 'Design company',
        companyWebsite: null,
        companyLogo: null,
        companySize: '50-100',
        companyIndustry: 'Design',
        _count: { id: 2 },
      },
    ]);

    const response = await request(app)
      .get('/api/companies')
      .set('Authorization', `Bearer ${candidateToken}`)
      .query({
        page: 1,
        limit: 20,
      });

    expect(response.status).toBe(200);
    expect(response.body.companies).toHaveLength(2);
    expect(response.body.companies[0].companyName).toBe('TechCorp Inc.');
    expect(response.body.companies[0].jobCount).toBe(3);
  });

  it('should return a company by name case-insensitively', async () => {
    mockPrisma.job.findFirst.mockResolvedValue({
      companyName: 'TechCorp Inc.',
      companyDescription: 'Technology company',
      companyWebsite: 'https://techcorp.example.com',
      companyLogo: null,
      companySize: '500-1000',
      companyIndustry: 'Technology',
    });

    mockPrisma.job.findMany.mockResolvedValue([
      {
        id: 'job-1',
        title: 'Senior Full-Stack Developer',
        companyName: 'TechCorp Inc.',
        status: 'OPEN',
      },
    ]);

    mockPrisma.job.count.mockResolvedValue(1);

    const response = await request(app)
      .get('/api/companies/techcorp%20inc.')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(response.status).toBe(200);
    expect(response.body.company.name).toBe('TechCorp Inc.');
    expect(response.body.company.totalJobs).toBe(1);
    expect(response.body.jobs).toHaveLength(1);
  });

  it('should reject job creation with missing required fields', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: '',
        description: '',
        location: '',
        companyName: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
  
  it('should create a job successfully', async () => {
  mockPrisma.user.findMany.mockResolvedValue([]);

  mockPrisma.job.create.mockResolvedValue({
    id: 'job-new',
    title: 'Backend Developer',
    description: 'Build backend APIs',
    location: 'Chennai',
    type: 'FULL_TIME',
    companyName: 'Test Company',
    status: 'OPEN',
    postedById: 'test-recruiter-id',
    postedBy: {
      id: 'test-recruiter-id',
      firstName: 'Test',
      lastName: 'Recruiter',
      email: 'test-recruiter@manithpro.com',
    },
  });

  const response = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${recruiterToken}`)
    .send({
      title: 'Backend Developer',
      description: 'Build backend APIs',
      location: 'Chennai',
      type: 'FULL_TIME',
      companyName: 'Test Company',
      skills: ['Node.js', 'TypeScript'],
      salaryMin: 50000,
      salaryMax: 80000,
      positions: 2,
    });

  expect(response.status).toBe(201);
  expect(response.body.job).toBeDefined();
  expect(response.body.job.title).toBe('Backend Developer');

  expect(mockPrisma.job.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        title: 'Backend Developer',
        description: 'Build backend APIs',
        location: 'Chennai',
        type: 'FULL_TIME',
        companyName: 'Test Company',
        postedById: 'test-recruiter-id',
      }),
    })
  );
});

  it('should reject applications after the job deadline', async () => {
    mockPrisma.job.findUnique.mockResolvedValue({
      id: 'job-1',
      title: 'Frontend Developer',
      status: 'OPEN',
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      postedBy: {
        firstName: 'Test',
        lastName: 'Recruiter',
      },
    });

    const response = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        jobId: 'job-1',
        coverLetter: 'Test application',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'The application deadline for this job has passed'
    );

    expect(mockPrisma.application.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.application.create).not.toHaveBeenCalled();
  });

  it('should update a job successfully', async () => {
    mockPrisma.job.findUnique.mockResolvedValue({
      id: 'job-1',
      postedById: 'test-recruiter-id',
      title: 'Old Title',
      description: 'Old Description',
      location: 'Chennai',
      companyName: 'Test Company',
      status: 'OPEN',
    });

    mockPrisma.job.update.mockResolvedValue({
      id: 'job-1',
      title: 'Updated Frontend Developer',
      description: 'Updated Description',
      location: 'Chennai',
      companyName: 'Test Company',
      status: 'OPEN',
    });

    const response = await request(app)
      .put('/api/jobs/job-1')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Updated Frontend Developer',
        description: 'Updated Description',
        location: 'Chennai',
        companyName: 'Test Company',
        status: 'OPEN',
      });

    expect(response.status).toBe(200);

    expect(mockPrisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
      })
    );
  });

  it('should reject unauthorized job updates', async () => {
    mockPrisma.job.findUnique.mockResolvedValue({
      id: 'job-1',
      postedById: 'another-recruiter-id',
      title: 'Existing Job',
      description: 'Existing Description',
      location: 'Chennai',
      companyName: 'Test Company',
      status: 'OPEN',
    });

    const response = await request(app)
      .put('/api/jobs/job-1')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Unauthorized Update',
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      'Not authorized to update this job'
    );

    expect(mockPrisma.job.update).not.toHaveBeenCalled();
  });
});
