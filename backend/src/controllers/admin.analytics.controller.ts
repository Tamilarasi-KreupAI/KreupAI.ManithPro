import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get dashboard overview statistics
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalInterviews,
      activeJobs,
      pendingApplications,
      scheduledInterviews,
      recentUsers,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.interview.count(),

      // Active/pending counts
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.application.count({ where: { status: { in: ['PENDING', 'REVIEWING'] } } }),
      prisma.interview.count({ where: { status: 'SCHEDULED' } }),

      // Recent activity (last 30 days)
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.job.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.application.count({
        where: { appliedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    res.json({
      overview: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalInterviews,
        activeJobs,
        pendingApplications,
        scheduledInterviews,
      },
      recentActivity: {
        newUsers: recentUsers,
        newJobs: recentJobs,
        newApplications: recentApplications,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get user analytics
export const getUserAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      usersByRole,
      userGrowth,
      activeUsers,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // User growth over last 12 months
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM users
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month DESC
      `,

      // Active users (users with activity in last 30 days)
      prisma.user.count({
        where: {
          OR: [
            { applications: { some: { appliedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
            { postedJobs: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
          ],
        },
      }),
    ]);

    res.json({
      total: totalUsers,
      byRole: usersByRole.map(r => ({ role: r.role, count: r._count })),
      growth: userGrowth,
      activeUsers,
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};

// Get job analytics
export const getJobAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalJobs,
      jobsByStatus,
      jobsByType,
      jobsWithApplications,
      averageApplicationsPerJob,
      topCompanies,
    ] = await Promise.all([
      // Total jobs
      prisma.job.count(),

      // Jobs by status
      prisma.job.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Jobs by type
      prisma.job.groupBy({
        by: ['type'],
        _count: true,
      }),

      // Jobs with at least one application
      prisma.job.count({
        where: { applications: { some: {} } },
      }),

      // Average applications per job
      prisma.application.count().then(count => prisma.job.count().then(jobs => jobs > 0 ? count / jobs : 0)),

      // Top companies by job postings
      prisma.job.groupBy({
        by: ['companyName'],
        _count: true,
        orderBy: { _count: { companyName: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      total: totalJobs,
      byStatus: jobsByStatus.map(s => ({ status: s.status, count: s._count })),
      byType: jobsByType.map(t => ({ type: t.type, count: t._count })),
      jobsWithApplications,
      averageApplicationsPerJob: Math.round(averageApplicationsPerJob * 10) / 10,
      topCompanies: topCompanies.map(c => ({ company: c.companyName, jobCount: c._count })),
    });
  } catch (error) {
    console.error('Error fetching job analytics:', error);
    res.status(500).json({ error: 'Failed to fetch job analytics' });
  }
};

// Get application analytics
export const getApplicationAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalApplications,
      applicationsByStatus,
      applicationTrend,
      averageTimeToHire,
    ] = await Promise.all([
      // Total applications
      prisma.application.count(),

      // Applications by status
      prisma.application.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Application trend over last 12 months
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "appliedAt") as month,
          COUNT(*) as count
        FROM applications
        WHERE "appliedAt" >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month DESC
      `,

      // Average time to hire (from application to acceptance) in days
      prisma.$queryRaw`
        SELECT AVG(EXTRACT(epoch FROM ("updatedAt" - "appliedAt"))/86400) as avg_days
        FROM applications
        WHERE status = 'ACCEPTED'
      `,
    ]);

    res.json({
      total: totalApplications,
      byStatus: applicationsByStatus.map(s => ({ status: s.status, count: s._count })),
      trend: applicationTrend,
      averageTimeToHire: averageTimeToHire[0]?.avg_days ? Math.round(averageTimeToHire[0].avg_days) : null,
    });
  } catch (error) {
    console.error('Error fetching application analytics:', error);
    res.status(500).json({ error: 'Failed to fetch application analytics' });
  }
};

// Get interview analytics
export const getInterviewAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalInterviews,
      interviewsByStatus,
      interviewsByType,
      upcomingInterviews,
    ] = await Promise.all([
      // Total interviews
      prisma.interview.count(),

      // Interviews by status
      prisma.interview.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Interviews by type
      prisma.interview.groupBy({
        by: ['type'],
        _count: true,
      }),

      // Upcoming interviews (next 7 days)
      prisma.interview.count({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    res.json({
      total: totalInterviews,
      byStatus: interviewsByStatus.map(s => ({ status: s.status, count: s._count })),
      byType: interviewsByType.map(t => ({ type: t.type, count: t._count })),
      upcomingInterviews,
    });
  } catch (error) {
    console.error('Error fetching interview analytics:', error);
    res.status(500).json({ error: 'Failed to fetch interview analytics' });
  }
};

// Get system activity (recent activities across the platform)
export const getSystemActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '20' } = req.query;
    const limitNum = parseInt(limit as string);

    const [recentUsers, recentJobs, recentApplications, recentInterviews] = await Promise.all([
      // Recent user registrations
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
      }),

      // Recent job postings
      prisma.job.findMany({
        select: {
          id: true,
          title: true,
          companyName: true,
          status: true,
          createdAt: true,
          postedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
      }),

      // Recent applications
      prisma.application.findMany({
        select: {
          id: true,
          status: true,
          appliedAt: true,
          candidate: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          job: {
            select: {
              title: true,
              companyName: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: limitNum,
      }),

      // Recent interviews
      prisma.interview.findMany({
        select: {
          id: true,
          type: true,
          status: true,
          scheduledAt: true,
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          application: {
            select: {
              job: {
                select: {
                  title: true,
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
      }),
    ]);

    res.json({
      recentUsers,
      recentJobs,
      recentApplications,
      recentInterviews,
    });
  } catch (error) {
    console.error('Error fetching system activity:', error);
    res.status(500).json({ error: 'Failed to fetch system activity' });
  }
};

// Get conversion funnel analytics
export const getConversionFunnel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalJobs,
      jobsWithApplications,
      applicationsShortlisted,
      interviewsScheduled,
      offersAccepted,
    ] = await Promise.all([
      // Total jobs posted
      prisma.job.count(),

      // Jobs with at least one application
      prisma.job.count({
        where: { applications: { some: {} } },
      }),

      // Applications that reached shortlisted stage
      prisma.application.count({
        where: { status: { in: ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED'] } },
      }),

      // Applications with interviews scheduled
      prisma.application.count({
        where: { status: { in: ['INTERVIEW_SCHEDULED', 'ACCEPTED'] } },
      }),

      // Applications accepted
      prisma.application.count({
        where: { status: 'ACCEPTED' },
      }),
    ]);

    const totalApplications = await prisma.application.count();

    res.json({
      funnel: [
        { stage: 'Jobs Posted', count: totalJobs, percentage: 100 },
        { stage: 'Jobs with Applications', count: jobsWithApplications, percentage: totalJobs > 0 ? (jobsWithApplications / totalJobs * 100).toFixed(1) : 0 },
        { stage: 'Applications Received', count: totalApplications, percentage: 100 },
        { stage: 'Shortlisted', count: applicationsShortlisted, percentage: totalApplications > 0 ? (applicationsShortlisted / totalApplications * 100).toFixed(1) : 0 },
        { stage: 'Interviews Scheduled', count: interviewsScheduled, percentage: totalApplications > 0 ? (interviewsScheduled / totalApplications * 100).toFixed(1) : 0 },
        { stage: 'Offers Accepted', count: offersAccepted, percentage: totalApplications > 0 ? (offersAccepted / totalApplications * 100).toFixed(1) : 0 },
      ],
    });
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    res.status(500).json({ error: 'Failed to fetch conversion funnel' });
  }
};
