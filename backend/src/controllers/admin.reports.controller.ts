import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get all available report types
 */
export const getReportTypes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reportTypes = [
      {
        id: 'users',
        name: 'User Report',
        description: 'Comprehensive user data with registration trends',
        category: 'Users',
      },
      {
        id: 'jobs',
        name: 'Job Listings Report',
        description: 'All job postings with status and applications',
        category: 'Jobs',
      },
      {
        id: 'applications',
        name: 'Applications Report',
        description: 'Application submissions with status tracking',
        category: 'Applications',
      },
      {
        id: 'interviews',
        name: 'Interviews Report',
        description: 'Interview schedules and outcomes',
        category: 'Interviews',
      },
      {
        id: 'recruiters',
        name: 'Recruiter Performance Report',
        description: 'Recruiter metrics and KPIs',
        category: 'Analytics',
      },
      {
        id: 'candidates',
        name: 'Candidate Activity Report',
        description: 'Candidate engagement and application history',
        category: 'Analytics',
      },
      {
        id: 'conversion',
        name: 'Conversion Funnel Report',
        description: 'Application to hire conversion metrics',
        category: 'Analytics',
      },
      {
        id: 'revenue',
        name: 'Revenue Report',
        description: 'Financial metrics and subscription data',
        category: 'Finance',
      },
    ];

    res.json({ reportTypes });
  } catch (error) {
    console.error('Error fetching report types:', error);
    res.status(500).json({ error: 'Failed to fetch report types' });
  }
};

/**
 * Generate user report
 */
export const generateUserReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo, role, format = 'json' } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            applications: true,
            postedJobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const report = {
      generatedAt: new Date(),
      type: 'users',
      filters: { dateFrom, dateTo, role },
      summary: {
        totalUsers: users.length,
        byRole: await prisma.user.groupBy({
          by: ['role'],
          where,
          _count: { role: true },
        }),
      },
      data: users.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        applicationsCount: (user as any)._count?.applications || 0,
        jobsPostedCount: (user as any)._count?.postedJobs || 0,
      })),
    };

    if (format === 'csv') {
      return exportToCSV(res, report.data, 'user-report.csv');
    }

    res.json(report);
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ error: 'Failed to generate user report' });
  }
};

/**
 * Generate job listings report
 */
export const generateJobReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo, status, type, format = 'json' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        postedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const report = {
      generatedAt: new Date(),
      type: 'jobs',
      filters: { dateFrom, dateTo, status, type },
      summary: {
        totalJobs: jobs.length,
        totalApplications: jobs.reduce((sum, job) => sum + job._count.applications, 0),
        byStatus: await prisma.job.groupBy({
          by: ['status'],
          where,
          _count: { status: true },
        }),
        byType: await prisma.job.groupBy({
          by: ['type'],
          where,
          _count: { type: true },
        }),
      },
      data: jobs,
    };

    if (format === 'csv') {
      return exportToCSV(res, report.data, 'job-report.csv');
    }

    res.json(report);
  } catch (error) {
    console.error('Error generating job report:', error);
    res.status(500).json({ error: 'Failed to generate job report' });
  }
};

/**
 * Generate applications report
 */
export const generateApplicationReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo, status, format = 'json' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.appliedAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
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
            type: true,
            postedBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const report = {
      generatedAt: new Date(),
      type: 'applications',
      filters: { dateFrom, dateTo, status },
      summary: {
        totalApplications: applications.length,
        byStatus: await prisma.application.groupBy({
          by: ['status'],
          where,
          _count: { status: true },
        }),
        avgTimeToProcess: await calculateAvgTimeToProcess(where),
      },
      data: applications,
    };

    if (format === 'csv') {
      return exportToCSV(res, report.data, 'application-report.csv');
    }

    res.json(report);
  } catch (error) {
    console.error('Error generating application report:', error);
    res.status(500).json({ error: 'Failed to generate application report' });
  }
};

/**
 * Generate interviews report
 */
export const generateInterviewReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo, status, type, format = 'json' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (dateFrom || dateTo) {
      where.scheduledAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        scheduledBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
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
      orderBy: { scheduledAt: 'desc' },
    });

    const report = {
      generatedAt: new Date(),
      type: 'interviews',
      filters: { dateFrom, dateTo, status, type },
      summary: {
        totalInterviews: interviews.length,
        byStatus: await prisma.interview.groupBy({
          by: ['status'],
          where,
          _count: { status: true },
        }),
        byType: await prisma.interview.groupBy({
          by: ['type'],
          where,
          _count: { type: true },
        }),
        averageRating: calculateAverageRating(interviews),
      },
      data: interviews,
    };

    if (format === 'csv') {
      return exportToCSV(res, report.data, 'interview-report.csv');
    }

    res.json(report);
  } catch (error) {
    console.error('Error generating interview report:', error);
    res.status(500).json({ error: 'Failed to generate interview report' });
  }
};

/**
 * Generate recruiter performance report
 */
export const generateRecruiterReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo, format = 'json' } = req.query;

    const where: any = { role: 'RECRUITER' };
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const recruiters = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        postedJobs: {
          select: {
            id: true,
            status: true,
            _count: {
              select: {
                applications: true,
              },
            },
          },
        },
      },
    });

    const performanceData = await Promise.all(
      recruiters.map(async (recruiter) => {
        const totalJobs = recruiter.postedJobs.length;
        const activeJobs = recruiter.postedJobs.filter(j => j.status === 'OPEN').length;
        const totalApplications = recruiter.postedJobs.reduce((sum, job) => sum + job._count.applications, 0);

        const interviewsScheduled = await prisma.interview.count({
          where: { scheduledById: recruiter.id },
        });

        return {
          id: recruiter.id,
          name: `${recruiter.firstName} ${recruiter.lastName}`,
          email: recruiter.email,
          joinedDate: recruiter.createdAt,
          totalJobs,
          activeJobs,
          totalApplications,
          averageApplicationsPerJob: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(2) : 0,
          interviewsScheduled,
        };
      })
    );

    const report = {
      generatedAt: new Date(),
      type: 'recruiter-performance',
      filters: { dateFrom, dateTo },
      summary: {
        totalRecruiters: recruiters.length,
        totalJobsPosted: performanceData.reduce((sum, r) => sum + r.totalJobs, 0),
        totalApplications: performanceData.reduce((sum, r) => sum + r.totalApplications, 0),
        totalInterviewsScheduled: performanceData.reduce((sum, r) => sum + r.interviewsScheduled, 0),
      },
      data: performanceData,
    };

    if (format === 'csv') {
      return exportToCSV(res, report.data, 'recruiter-report.csv');
    }

    res.json(report);
  } catch (error) {
    console.error('Error generating recruiter report:', error);
    res.status(500).json({ error: 'Failed to generate recruiter report' });
  }
};

/**
 * Generate conversion funnel report
 */
export const generateConversionReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query;

    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const [
      totalJobs,
      totalApplications,
      totalInterviews,
      totalHires,
    ] = await Promise.all([
      prisma.job.count({ where: dateFilter }),
      prisma.application.count({
        where: {
          appliedAt: dateFilter.createdAt,
        },
      }),
      prisma.interview.count({
        where: {
          scheduledAt: dateFilter.createdAt,
        },
      }),
      prisma.application.count({
        where: {
          status: 'ACCEPTED',
          appliedAt: dateFilter.createdAt,
        },
      }),
    ]);

    const applicationToInterviewRate = totalApplications > 0
      ? ((totalInterviews / totalApplications) * 100).toFixed(2)
      : 0;

    const interviewToHireRate = totalInterviews > 0
      ? ((totalHires / totalInterviews) * 100).toFixed(2)
      : 0;

    const overallConversionRate = totalApplications > 0
      ? ((totalHires / totalApplications) * 100).toFixed(2)
      : 0;

    const report = {
      generatedAt: new Date(),
      type: 'conversion-funnel',
      filters: { dateFrom, dateTo },
      data: {
        totalJobs,
        totalApplications,
        totalInterviews,
        totalHires,
        applicationToInterviewRate: parseFloat(applicationToInterviewRate as string),
        interviewToHireRate: parseFloat(interviewToHireRate as string),
        overallConversionRate: parseFloat(overallConversionRate as string),
      },
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating conversion report:', error);
    res.status(500).json({ error: 'Failed to generate conversion report' });
  }
};

/**
 * Get scheduled reports
 */
export const getScheduledReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // This is a placeholder for future implementation of scheduled report generation
    // Would include cron jobs or scheduled tasks for automated report generation
    res.json({
      scheduledReports: [],
      message: 'Scheduled reports feature coming soon',
    });
  } catch (error) {
    console.error('Error fetching scheduled reports:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled reports' });
  }
};

/**
 * Get report history
 */
export const getReportHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '20' } = req.query;

    // This would query a ReportHistory table if implemented
    // For now, return empty array as placeholder
    res.json({
      reports: [],
      message: 'Report history feature requires database schema update',
    });
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
};

// Helper Functions

/**
 * Calculate average time to process applications
 */
async function calculateAvgTimeToProcess(where: any): Promise<number> {
  const applications = await prisma.application.findMany({
    where: {
      ...where,
      status: { not: 'PENDING' },
    },
    select: {
      appliedAt: true,
      updatedAt: true,
    },
  });

  if (applications.length === 0) return 0;

  const totalDays = applications.reduce((sum, app) => {
    const days = Math.floor(
      (app.updatedAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  return Math.round(totalDays / applications.length);
}

/**
 * Calculate average interview rating
 */
function calculateAverageRating(interviews: any[]): number {
  const ratedInterviews = interviews.filter(i => i.rating !== null);
  if (ratedInterviews.length === 0) return 0;

  const totalRating = ratedInterviews.reduce((sum, i) => sum + (i.rating || 0), 0);
  return parseFloat((totalRating / ratedInterviews.length).toFixed(2));
}

/**
 * Export data to CSV format
 */
function exportToCSV(res: Response, data: any[], filename: string): void {
  if (data.length === 0) {
    res.status(404).json({ error: 'No data to export' });
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]).filter(key => !key.startsWith('_'));
  const csvRows = [headers.join(',')];

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    });
    csvRows.push(values.join(','));
  });

  const csv = csvRows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csv);
}
