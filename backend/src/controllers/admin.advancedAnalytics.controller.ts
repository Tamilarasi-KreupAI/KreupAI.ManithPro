import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get comprehensive dashboard analytics
export const getComprehensiveAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = '30' } = req.query;
    const days = parseInt(timeRange as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      userGrowth,
      jobTrends,
      applicationTrends,
      interviewTrends,
      conversionRates,
      topPerformers,
    ] = await Promise.all([
      // User growth
      getUserGrowthData(startDate),

      // Job posting trends
      getJobTrendData(startDate),

      // Application trends
      getApplicationTrendData(startDate),

      // Interview trends
      getInterviewTrendData(startDate),

      // Conversion rates
      getConversionRates(),

      // Top performers
      getTopPerformers(),
    ]);

    res.json({
      userGrowth,
      jobTrends,
      applicationTrends,
      interviewTrends,
      conversionRates,
      topPerformers,
      timeRange: days,
    });
  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error);
    res.status(500).json({ error: 'Failed to fetch comprehensive analytics' });
  }
};

// Get user growth data
const getUserGrowthData = async (startDate: Date) => {
  const usersByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE("createdAt") as date, COUNT(*)::int as count
    FROM users
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    where: { createdAt: { gte: startDate } },
    _count: true,
  });

  return {
    byDay: usersByDay.map(d => ({ date: d.date, count: Number(d.count) })),
    byRole: usersByRole.map(r => ({ role: r.role, count: r._count })),
  };
};

// Get job trend data
const getJobTrendData = async (startDate: Date) => {
  const jobsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE("createdAt") as date, COUNT(*)::int as count
    FROM jobs
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const jobsByType = await prisma.job.groupBy({
    by: ['type'],
    where: { createdAt: { gte: startDate } },
    _count: true,
  });

  const jobsByStatus = await prisma.job.groupBy({
    by: ['status'],
    _count: true,
  });

  return {
    byDay: jobsByDay.map(d => ({ date: d.date, count: Number(d.count) })),
    byType: jobsByType.map(t => ({ type: t.type, count: t._count })),
    byStatus: jobsByStatus.map(s => ({ status: s.status, count: s._count })),
  };
};

// Get application trend data
const getApplicationTrendData = async (startDate: Date) => {
  const applicationsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE("appliedAt") as date, COUNT(*)::int as count
    FROM applications
    WHERE "appliedAt" >= ${startDate}
    GROUP BY DATE("appliedAt")
    ORDER BY date ASC
  `;

  const applicationsByStatus = await prisma.application.groupBy({
    by: ['status'],
    _count: true,
  });

  return {
    byDay: applicationsByDay.map(d => ({ date: d.date, count: Number(d.count) })),
    byStatus: applicationsByStatus.map(s => ({ status: s.status, count: s._count })),
  };
};

// Get interview trend data
const getInterviewTrendData = async (startDate: Date) => {
  const interviewsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE("scheduledAt") as date, COUNT(*)::int as count
    FROM interviews
    WHERE "scheduledAt" >= ${startDate}
    GROUP BY DATE("scheduledAt")
    ORDER BY date ASC
  `;

  const interviewsByType = await prisma.interview.groupBy({
    by: ['type'],
    _count: true,
  });

  const interviewsByStatus = await prisma.interview.groupBy({
    by: ['status'],
    _count: true,
  });

  return {
    byDay: interviewsByDay.map(d => ({ date: d.date, count: Number(d.count) })),
    byType: interviewsByType.map(t => ({ type: t.type, count: t._count })),
    byStatus: interviewsByStatus.map(s => ({ status: s.status, count: s._count })),
  };
};

// Get conversion rates
const getConversionRates = async () => {
  const [
    totalJobs,
    totalApplications,
    shortlistedApplications,
    interviewScheduled,
    offersAccepted,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'SHORTLISTED' } }),
    prisma.application.count({ where: { status: 'INTERVIEW_SCHEDULED' } }),
    prisma.application.count({ where: { status: 'ACCEPTED' } }),
  ]);

  return {
    applicationToShortlist: totalApplications > 0 ? (shortlistedApplications / totalApplications * 100).toFixed(2) : 0,
    shortlistToInterview: shortlistedApplications > 0 ? (interviewScheduled / shortlistedApplications * 100).toFixed(2) : 0,
    interviewToOffer: interviewScheduled > 0 ? (offersAccepted / interviewScheduled * 100).toFixed(2) : 0,
    overallConversion: totalApplications > 0 ? (offersAccepted / totalApplications * 100).toFixed(2) : 0,
  };
};

// Get top performers
const getTopPerformers = async () => {
  const [topRecruiters, topJobs, topCandidates] = await Promise.all([
    // Top recruiters by job postings
    prisma.user.findMany({
      where: { role: 'RECRUITER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            postedJobs: true,
          },
        },
      },
      orderBy: {
        postedJobs: {
          _count: 'desc',
        },
      },
      take: 5,
    }),

    // Top jobs by applications
    prisma.job.findMany({
      select: {
        id: true,
        title: true,
        companyName: true,
        status: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        applications: {
          _count: 'desc',
        },
      },
      take: 5,
    }),

    // Top candidates by applications
    prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        applications: {
          _count: 'desc',
        },
      },
      take: 5,
    }),
  ]);

  return {
    topRecruiters: topRecruiters.map(r => ({
      id: r.id,
      name: `${r.firstName} ${r.lastName}`,
      email: r.email,
      jobsPosted: r._count.postedJobs,
    })),
    topJobs: topJobs.map(j => ({
      id: j.id,
      title: j.title,
      companyName: j.companyName,
      status: j.status,
      applications: j._count.applications,
    })),
    topCandidates: topCandidates.map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      applications: c._count.applications,
    })),
  };
};

// Get recruiter performance analytics
export const getRecruiterPerformance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recruiters = await prisma.user.findMany({
      where: { role: 'RECRUITER' },
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

    const performance = recruiters.map(recruiter => {
      const totalJobs = recruiter.postedJobs.length;
      const activeJobs = recruiter.postedJobs.filter(j => j.status === 'OPEN').length;
      const totalApplications = recruiter.postedJobs.reduce((sum, job) => sum + job._count.applications, 0);
      const avgApplicationsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(2) : 0;

      return {
        id: recruiter.id,
        name: `${recruiter.firstName} ${recruiter.lastName}`,
        email: recruiter.email,
        joinedDate: recruiter.createdAt,
        totalJobs,
        activeJobs,
        totalApplications,
        avgApplicationsPerJob,
      };
    });

    // Sort by total jobs
    performance.sort((a, b) => b.totalJobs - a.totalJobs);

    res.json({ recruiters: performance, count: performance.length });
  } catch (error) {
    console.error('Error fetching recruiter performance:', error);
    res.status(500).json({ error: 'Failed to fetch recruiter performance' });
  }
};

// Get time-to-hire analytics
export const getTimeToHireAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const acceptedApplications = await prisma.application.findMany({
      where: { status: 'ACCEPTED' },
      select: {
        appliedAt: true,
        updatedAt: true,
        job: {
          select: {
            title: true,
            companyName: true,
          },
        },
      },
    });

    const timeToHireData = acceptedApplications.map(app => {
      const days = Math.floor((app.updatedAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24));
      return {
        jobTitle: app.job.title,
        companyName: app.job.companyName,
        days,
        appliedAt: app.appliedAt,
        hiredAt: app.updatedAt,
      };
    });

    const avgTimeToHire = timeToHireData.length > 0
      ? Math.round(timeToHireData.reduce((sum, d) => sum + d.days, 0) / timeToHireData.length)
      : 0;

    // Group by ranges
    const ranges = {
      '0-7': 0,
      '8-14': 0,
      '15-30': 0,
      '31-60': 0,
      '60+': 0,
    };

    timeToHireData.forEach(d => {
      if (d.days <= 7) ranges['0-7']++;
      else if (d.days <= 14) ranges['8-14']++;
      else if (d.days <= 30) ranges['15-30']++;
      else if (d.days <= 60) ranges['31-60']++;
      else ranges['60+']++;
    });

    res.json({
      averageTimeToHire: avgTimeToHire,
      distributionByDays: ranges,
      recentHires: timeToHireData.slice(0, 10),
      totalHires: timeToHireData.length,
    });
  } catch (error) {
    console.error('Error fetching time-to-hire analytics:', error);
    res.status(500).json({ error: 'Failed to fetch time-to-hire analytics' });
  }
};

// Get source tracking analytics (where candidates come from)
export const getSourceAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // In a real application, you'd track sources. For now, we'll use location as a proxy
    const candidatesByLocation = await prisma.user.groupBy({
      by: ['location'],
      where: {
        role: 'CANDIDATE',
        location: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          location: 'desc',
        },
      },
      take: 10,
    });

    const applicationsByLocation = await prisma.$queryRaw<Array<{ location: string; count: bigint }>>`
      SELECT u.location, COUNT(*)::int as count
      FROM applications a
      JOIN users u ON a."candidateId" = u.id
      WHERE u.location IS NOT NULL
      GROUP BY u.location
      ORDER BY count DESC
      LIMIT 10
    `;

    res.json({
      candidatesByLocation: candidatesByLocation.map(c => ({
        location: c.location,
        count: c._count,
      })),
      applicationsByLocation: applicationsByLocation.map(a => ({
        location: a.location,
        count: Number(a.count),
      })),
    });
  } catch (error) {
    console.error('Error fetching source analytics:', error);
    res.status(500).json({ error: 'Failed to fetch source analytics' });
  }
};

// Get skills demand analytics
export const getSkillsDemandAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all jobs and their required skills
    const jobs = await prisma.job.findMany({
      select: {
        skills: true,
        status: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // Count skill frequency
    const skillCounts: { [key: string]: { demand: number; applications: number } } = {};

    jobs.forEach(job => {
      job.skills.forEach(skill => {
        if (!skillCounts[skill]) {
          skillCounts[skill] = { demand: 0, applications: 0 };
        }
        skillCounts[skill].demand++;
        skillCounts[skill].applications += job._count.applications;
      });
    });

    // Convert to array and sort
    const skillsArray = Object.entries(skillCounts).map(([skill, data]) => ({
      skill,
      demand: data.demand,
      applications: data.applications,
      avgApplicationsPerJob: data.demand > 0 ? (data.applications / data.demand).toFixed(2) : 0,
    }));

    skillsArray.sort((a, b) => b.demand - a.demand);

    res.json({
      topSkills: skillsArray.slice(0, 20),
      totalSkills: skillsArray.length,
    });
  } catch (error) {
    console.error('Error fetching skills demand analytics:', error);
    res.status(500).json({ error: 'Failed to fetch skills demand analytics' });
  }
};

// Get industry analytics
export const getIndustryAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobsByIndustry = await prisma.job.groupBy({
      by: ['companyIndustry'],
      where: {
        companyIndustry: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          companyIndustry: 'desc',
        },
      },
      take: 10,
    });

    // Get applications by industry
    const applicationsByIndustry = await prisma.$queryRaw<Array<{ industry: string; count: bigint }>>`
      SELECT j."companyIndustry" as industry, COUNT(*)::int as count
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      WHERE j."companyIndustry" IS NOT NULL
      GROUP BY j."companyIndustry"
      ORDER BY count DESC
      LIMIT 10
    `;

    res.json({
      jobsByIndustry: jobsByIndustry.map(i => ({
        industry: i.companyIndustry,
        count: i._count,
      })),
      applicationsByIndustry: applicationsByIndustry.map(a => ({
        industry: a.industry,
        count: Number(a.count),
      })),
    });
  } catch (error) {
    console.error('Error fetching industry analytics:', error);
    res.status(500).json({ error: 'Failed to fetch industry analytics' });
  }
};

// Get engagement metrics
export const getEngagementMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      activeUsers,
      savedJobs,
      avgApplicationsPerCandidate,
      avgJobsPerRecruiter,
    ] = await Promise.all([
      // Active users (with activity in last 30 days)
      prisma.user.count({
        where: {
          OR: [
            { applications: { some: { appliedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
            { postedJobs: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
          ],
        },
      }),

      // Total saved jobs
      prisma.savedJob.count(),

      // Average applications per candidate
      prisma.application.count().then(count =>
        prisma.user.count({ where: { role: 'CANDIDATE' } }).then(candidates =>
          candidates > 0 ? (count / candidates).toFixed(2) : 0
        )
      ),

      // Average jobs per recruiter
      prisma.job.count().then(count =>
        prisma.user.count({ where: { role: 'RECRUITER' } }).then(recruiters =>
          recruiters > 0 ? (count / recruiters).toFixed(2) : 0
        )
      ),
    ]);

    res.json({
      activeUsers,
      savedJobs,
      avgApplicationsPerCandidate,
      avgJobsPerRecruiter,
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json({ error: 'Failed to fetch engagement metrics' });
  }
};

// Get revenue analytics (placeholder for future billing implementation)
export const getRevenueAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // This is a placeholder implementation
    // When billing/subscription system is implemented, this will track:
    // - Monthly recurring revenue (MRR)
    // - Annual recurring revenue (ARR)
    // - Revenue by subscription tier
    // - Revenue growth rate
    // - Customer lifetime value (LTV)
    // - Churn rate

    // For now, return mock data structure
    res.json({
      totalRevenue: 0,
      monthlyRecurringRevenue: 0,
      annualRecurringRevenue: 0,
      revenueGrowth: 0,
      byTier: [],
      revenueOverTime: [],
      message: 'Revenue tracking requires billing system implementation',
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};
