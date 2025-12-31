// @ts-nocheck
import { Prisma } from '@prisma/client';
import { prisma, getPaginationParams, createPaginatedResult, PaginationParams, PaginatedResult } from './prisma';
import { cache, cacheAside, CacheKeys, invalidateEntity } from './cache';

// ============================================================
// OPTIMIZED QUERY UTILITIES
// ============================================================
//
// This module provides optimized, reusable query patterns for
// common database operations with built-in caching support.
//
// Features:
// - Cached queries with automatic invalidation
// - Pagination helpers
// - Search and filtering utilities
// - Bulk operation helpers
// - Query performance monitoring
// ============================================================

// ============================================================
// USER QUERIES
// ============================================================

export const UserQueries = {
  /**
   * Find user by ID with caching
   */
  async findById(id: string) {
    return cacheAside(
      CacheKeys.user(id),
      300, // 5 minutes
      () => prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          isActive: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    );
  },

  /**
   * Find user by email with caching
   */
  async findByEmail(email: string) {
    return cacheAside(
      CacheKeys.userByEmail(email),
      300,
      () => prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          isActive: true,
        },
      })
    );
  },

  /**
   * Get user permissions with caching
   */
  async getPermissions(userId: string): Promise<string[]> {
    const cached = await cache.get<string[]>(CacheKeys.userPermissions(userId));
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        userPermissions: {
          select: {
            permission: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!user) return [];

    const permissions = user.userPermissions.map((up) => up.permission.name);
    await cache.set(CacheKeys.userPermissions(userId), permissions, 600);

    return permissions;
  },

  /**
   * List users with pagination
   */
  async list(params: PaginationParams & {
    role?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResult<any>> {
    const { skip, take, page, pageSize } = getPaginationParams(params);

    const where: Prisma.UserWhereInput = {
      ...(params.role && { role: params.role as any }),
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.search && {
        OR: [
          { email: { contains: params.search, mode: 'insensitive' } },
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return createPaginatedResult(users, total, page, pageSize);
  },

  /**
   * Invalidate user cache
   */
  async invalidateCache(userId: string, email?: string) {
    await invalidateEntity('user', userId);
    if (email) {
      await cache.delete(CacheKeys.userByEmail(email));
    }
  },
};

// ============================================================
// JOB QUERIES
// ============================================================

export const JobQueries = {
  /**
   * Find job by ID with caching
   */
  async findById(id: string) {
    return cacheAside(
      CacheKeys.job(id),
      300,
      () => prisma.job.findUnique({
        where: { id },
        include: {
          postedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      })
    );
  },

  /**
   * Search jobs with filters and pagination
   */
  async search(params: PaginationParams & {
    query?: string;
    type?: string;
    status?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    skills?: string[];
    department?: string;
  }): Promise<PaginatedResult<any>> {
    const { skip, take, page, pageSize } = getPaginationParams(params);

    const where: Prisma.JobWhereInput = {
      ...(params.status && { status: params.status as any }),
      ...(params.type && { type: params.type as any }),
      ...(params.department && { department: params.department }),
      ...(params.location && {
        location: { contains: params.location, mode: 'insensitive' },
      }),
      ...(params.salaryMin && { salaryMax: { gte: params.salaryMin } }),
      ...(params.salaryMax && { salaryMin: { lte: params.salaryMax } }),
      ...(params.skills?.length && {
        skills: { hasSome: params.skills },
      }),
      ...(params.query && {
        OR: [
          { title: { contains: params.query, mode: 'insensitive' } },
          { description: { contains: params.query, mode: 'insensitive' } },
          { companyName: { contains: params.query, mode: 'insensitive' } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          companyName: true,
          location: true,
          type: true,
          status: true,
          salaryMin: true,
          salaryMax: true,
          skills: true,
          department: true,
          experienceLevel: true,
          createdAt: true,
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return createPaginatedResult(jobs, total, page, pageSize);
  },

  /**
   * Get job statistics for dashboard
   */
  async getStats(recruiterId?: string) {
    const where = recruiterId ? { postedById: recruiterId } : {};

    const [total, open, closed, filled] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.count({ where: { ...where, status: 'OPEN' } }),
      prisma.job.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.job.count({ where: { ...where, status: 'FILLED' } }),
    ]);

    return { total, open, closed, filled };
  },

  /**
   * Invalidate job cache
   */
  async invalidateCache(jobId: string) {
    await invalidateEntity('job', jobId);
  },
};

// ============================================================
// APPLICATION QUERIES
// ============================================================

export const ApplicationQueries = {
  /**
   * Find application by ID with caching
   */
  async findById(id: string) {
    return cacheAside(
      CacheKeys.application(id),
      300,
      () => prisma.application.findUnique({
        where: { id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
              location: true,
            },
          },
          candidate: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    );
  },

  /**
   * Get applications by job with pagination
   */
  async byJob(jobId: string, params: PaginationParams & {
    status?: string;
  }): Promise<PaginatedResult<any>> {
    const { skip, take, page, pageSize } = getPaginationParams(params);

    const where: Prisma.ApplicationWhereInput = {
      jobId,
      ...(params.status && { status: params.status as any }),
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          candidate: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              candidateProfile: {
                select: {
                  headline: true,
                  experienceYears: true,
                  skills: true,
                },
              },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return createPaginatedResult(applications, total, page, pageSize);
  },

  /**
   * Get applications by candidate with pagination
   */
  async byCandidate(candidateId: string, params: PaginationParams): Promise<PaginatedResult<any>> {
    const { skip, take, page, pageSize } = getPaginationParams(params);

    const where: Prisma.ApplicationWhereInput = { candidateId };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
              location: true,
              type: true,
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return createPaginatedResult(applications, total, page, pageSize);
  },

  /**
   * Get application pipeline statistics
   */
  async getPipelineStats(jobId?: string) {
    const where = jobId ? { jobId } : {};

    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);
  },

  /**
   * Bulk update application status
   */
  async bulkUpdateStatus(ids: string[], status: string) {
    const result = await prisma.application.updateMany({
      where: { id: { in: ids } },
      data: { status: status as any },
    });

    // Invalidate cache for all updated applications
    for (const id of ids) {
      await invalidateEntity('application', id);
    }

    return result;
  },

  /**
   * Invalidate application cache
   */
  async invalidateCache(applicationId: string) {
    await invalidateEntity('application', applicationId);
  },
};

// ============================================================
// INTERVIEW QUERIES
// ============================================================

export const InterviewQueries = {
  /**
   * Find interview by ID with caching
   */
  async findById(id: string) {
    return cacheAside(
      CacheKeys.interview(id),
      300,
      () => prisma.interview.findUnique({
        where: { id },
        include: {
          application: {
            include: {
              job: true,
              candidate: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          scheduledBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    );
  },

  /**
   * Get upcoming interviews
   */
  async getUpcoming(userId: string, days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return prisma.interview.findMany({
      where: {
        OR: [
          { scheduledById: userId },
          { application: { candidateId: userId } },
        ],
        scheduledAt: {
          gte: new Date(),
          lte: futureDate,
        },
        status: 'SCHEDULED',
      },
      include: {
        application: {
          include: {
            job: {
              select: { id: true, title: true, companyName: true },
            },
            candidate: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  },

  /**
   * Invalidate interview cache
   */
  async invalidateCache(interviewId: string) {
    await invalidateEntity('interview', interviewId);
  },
};

// ============================================================
// ANALYTICS QUERIES
// ============================================================

export const AnalyticsQueries = {
  /**
   * Get dashboard statistics (cached)
   */
  async getDashboardStats(userId: string) {
    const cacheKey = CacheKeys.dashboardStats(userId);

    return cacheAside(cacheKey, 300, async () => {
      const [
        totalJobs,
        totalApplications,
        upcomingInterviews,
        newApplicationsToday,
      ] = await Promise.all([
        prisma.job.count({ where: { postedById: userId } }),
        prisma.application.count({
          where: { job: { postedById: userId } },
        }),
        prisma.interview.count({
          where: {
            scheduledById: userId,
            scheduledAt: { gte: new Date() },
            status: 'SCHEDULED',
          },
        }),
        prisma.application.count({
          where: {
            job: { postedById: userId },
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

      return {
        totalJobs,
        totalApplications,
        upcomingInterviews,
        newApplicationsToday,
      };
    });
  },

  /**
   * Get hiring funnel metrics
   */
  async getHiringFunnel(jobId?: string, dateRange?: { start: Date; end: Date }) {
    const where: Prisma.ApplicationWhereInput = {
      ...(jobId && { jobId }),
      ...(dateRange && {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    };

    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const funnel = {
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    for (const item of statusCounts) {
      const key = item.status.toLowerCase();
      if (key in funnel) {
        funnel[key as keyof typeof funnel] = item._count;
      }
    }

    return funnel;
  },

  /**
   * Get time-to-hire metrics
   */
  async getTimeToHire(dateRange?: { start: Date; end: Date }) {
    const where: Prisma.ApplicationWhereInput = {
      status: 'HIRED',
      ...(dateRange && {
        updatedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    };

    const hiredApplications = await prisma.application.findMany({
      where,
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    if (hiredApplications.length === 0) {
      return { averageDays: 0, minDays: 0, maxDays: 0, totalHired: 0 };
    }

    const daysToHire = hiredApplications.map((app) => {
      const diff = app.updatedAt.getTime() - app.createdAt.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    });

    return {
      averageDays: Math.round(daysToHire.reduce((a, b) => a + b, 0) / daysToHire.length),
      minDays: Math.min(...daysToHire),
      maxDays: Math.max(...daysToHire),
      totalHired: hiredApplications.length,
    };
  },

  /**
   * Invalidate dashboard cache
   */
  async invalidateDashboard(userId: string) {
    await cache.delete(CacheKeys.dashboardStats(userId));
  },
};

// ============================================================
// EXPORT ALL QUERIES
// ============================================================

export const queries = {
  users: UserQueries,
  jobs: JobQueries,
  applications: ApplicationQueries,
  interviews: InterviewQueries,
  analytics: AnalyticsQueries,
};

export default queries;
