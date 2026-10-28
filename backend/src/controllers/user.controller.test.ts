import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  jobCount,
  applicationCount,
  applicationFindMany,
  userFindUnique,
} = vi.hoisted(() => ({
  jobCount: vi.fn(),
  applicationCount: vi.fn(),
  applicationFindMany: vi.fn(),
  userFindUnique: vi.fn(),
}));

vi.mock('../database/prisma', () => ({
  prisma: {
    job: {
      count: jobCount,
    },
    application: {
      count: applicationCount,
      findMany: applicationFindMany,
    },
    user: {
      findUnique: userFindUnique,
      count: vi.fn(),
    },
  },
}));

import { getDashboardStats } from './user.controller';

const createResponse = () => {
  const res: any = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('R-14: Recruiter Dashboard Stats KPIs (Time-to-Hire and Response Rate)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const res = createResponse();
    await getDashboardStats({ user: undefined } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
  });

  it('safely returns 0 for avgTimeToHire and responseRate when recruiter has no applications', async () => {
    jobCount.mockResolvedValueOnce(2); // totalJobs
    jobCount.mockResolvedValueOnce(1); // openJobs
    applicationCount.mockResolvedValueOnce(0); // totalApplications
    applicationCount.mockResolvedValueOnce(0); // pendingApplications
    applicationFindMany.mockResolvedValueOnce([]); // recruiterApplications
    applicationFindMany.mockResolvedValueOnce([]); // recentApplications

    const res = createResponse();
    await getDashboardStats(
      { user: { userId: 'recruiter-1', role: 'RECRUITER' } } as any,
      res as any
    );

    expect(res.json).toHaveBeenCalledWith({
      totalJobs: 2,
      openJobs: 1,
      totalApplications: 0,
      pendingApplications: 0,
      recentApplications: [],
      avgTimeToHire: 0,
      timeToHire: 0,
      responseRate: 0,
    });
  });

  it('calculates actual Time-to-Hire in days and Response Rate from actual recruiter application records', async () => {
    jobCount.mockResolvedValueOnce(5); // totalJobs
    jobCount.mockResolvedValueOnce(3); // openJobs
    applicationCount.mockResolvedValueOnce(4); // totalApplications
    applicationCount.mockResolvedValueOnce(1); // pendingApplications

    const app1Applied = new Date('2026-10-01T00:00:00Z');
    const app1Hired = new Date('2026-10-11T00:00:00Z'); // 10 days via statusHistory

    const app2Applied = new Date('2026-10-05T00:00:00Z');
    const app2Hired = new Date('2026-10-25T00:00:00Z'); // 20 days via updatedAt fallback

    const app3Applied = new Date('2026-10-10T00:00:00Z'); // Under review

    const app4Applied = new Date('2026-10-12T00:00:00Z'); // Pending with no action

    const recruiterApps = [
      {
        id: 'app-1',
        status: 'ACCEPTED',
        appliedAt: app1Applied,
        updatedAt: new Date('2026-10-15T00:00:00Z'),
        statusHistory: [
          { toStatus: 'ACCEPTED', createdAt: app1Hired },
          { toStatus: 'REVIEWING', createdAt: new Date('2026-10-02T00:00:00Z') },
        ],
        interviews: [],
        messages: [],
      },
      {
        id: 'app-2',
        status: 'ACCEPTED',
        appliedAt: app2Applied,
        updatedAt: app2Hired,
        statusHistory: [],
        interviews: [],
        messages: [],
      },
      {
        id: 'app-3',
        status: 'REVIEWING',
        appliedAt: app3Applied,
        updatedAt: new Date('2026-10-11T00:00:00Z'),
        statusHistory: [{ toStatus: 'REVIEWING', createdAt: new Date('2026-10-11T00:00:00Z') }],
        interviews: [{ id: 'int-1' }],
        messages: [],
      },
      {
        id: 'app-4',
        status: 'PENDING',
        appliedAt: app4Applied,
        updatedAt: app4Applied,
        statusHistory: [],
        interviews: [],
        messages: [],
      },
    ];

    applicationFindMany.mockResolvedValueOnce(recruiterApps); // recruiterApplications
    applicationFindMany.mockResolvedValueOnce([]); // recentApplications

    const res = createResponse();
    await getDashboardStats(
      { user: { userId: 'recruiter-1', role: 'RECRUITER' } } as any,
      res as any
    );

    // Time-to-Hire: (10 days + 20 days) / 2 valid hires = 15 days
    // Response Rate: 3 responded (app-1 ACCEPTED, app-2 ACCEPTED, app-3 REVIEWING) out of 4 total = 75%
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        totalJobs: 5,
        openJobs: 3,
        totalApplications: 4,
        pendingApplications: 1,
        avgTimeToHire: 15,
        timeToHire: 15,
        responseRate: 75,
      })
    );
  });

  it('safely handles missing or invalid date records without inventing data', async () => {
    jobCount.mockResolvedValueOnce(1);
    jobCount.mockResolvedValueOnce(1);
    applicationCount.mockResolvedValueOnce(2);
    applicationCount.mockResolvedValueOnce(0);

    const recruiterApps = [
      {
        id: 'app-invalid-1',
        status: 'ACCEPTED',
        appliedAt: new Date('2026-10-20T00:00:00Z'),
        updatedAt: new Date('2026-10-10T00:00:00Z'), // hired before applied (invalid negative duration)
        statusHistory: [],
        interviews: [],
        messages: [],
      },
      {
        id: 'app-invalid-2',
        status: 'ACCEPTED',
        appliedAt: null, // missing applied date
        updatedAt: new Date('2026-10-10T00:00:00Z'),
        statusHistory: [],
        interviews: [],
        messages: [],
      },
    ];

    applicationFindMany.mockResolvedValueOnce(recruiterApps);
    applicationFindMany.mockResolvedValueOnce([]);

    const res = createResponse();
    await getDashboardStats(
      { user: { userId: 'recruiter-1', role: 'RECRUITER' } } as any,
      res as any
    );

    // Since both hired records have invalid date data, avgTimeToHire safely returns 0
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        avgTimeToHire: 0,
        timeToHire: 0,
        responseRate: 100, // both apps have status ACCEPTED (responded)
      })
    );
  });

  it('counts interview or message on PENDING application as response', async () => {
    jobCount.mockResolvedValueOnce(1);
    jobCount.mockResolvedValueOnce(1);
    applicationCount.mockResolvedValueOnce(2);
    applicationCount.mockResolvedValueOnce(2);

    const recruiterApps = [
      {
        id: 'app-with-interview',
        status: 'PENDING',
        appliedAt: new Date('2026-10-10T00:00:00Z'),
        updatedAt: new Date('2026-10-10T00:00:00Z'),
        statusHistory: [],
        interviews: [{ id: 'int-1' }], // Interview scheduled counts as response
        messages: [],
      },
      {
        id: 'app-silent-pending',
        status: 'PENDING',
        appliedAt: new Date('2026-10-10T00:00:00Z'),
        updatedAt: new Date('2026-10-10T00:00:00Z'),
        statusHistory: [],
        interviews: [],
        messages: [], // No action taken
      },
    ];

    applicationFindMany.mockResolvedValueOnce(recruiterApps);
    applicationFindMany.mockResolvedValueOnce([]);

    const res = createResponse();
    await getDashboardStats(
      { user: { userId: 'recruiter-1', role: 'RECRUITER' } } as any,
      res as any
    );

    // 1 responded out of 2 total = 50%
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        responseRate: 50,
      })
    );
  });
});
