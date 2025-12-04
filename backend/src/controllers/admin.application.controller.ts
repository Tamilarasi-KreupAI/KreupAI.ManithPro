import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get all applications with advanced filtering
export const getAllApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      jobId,
      candidateId,
      search,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (search) {
      where.OR = [
        { job: { title: { contains: search as string, mode: 'insensitive' } } },
        { job: { companyName: { contains: search as string, mode: 'insensitive' } } },
        { candidate: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { candidate: { email: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.appliedAt = {};
      if (dateFrom) {
        where.appliedAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.appliedAt.lte = new Date(dateTo as string);
      }
    }

    // Get total count
    const total = await prisma.application.count({ where });

    // Get applications
    const applications = await prisma.application.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            type: true,
            status: true,
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            skills: true,
            experience: true,
          },
        },
        _count: {
          select: {
            interviews: true,
          },
        },
      },
    });

    res.json({
      applications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Get application by ID with full details
export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            postedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            skills: true,
            experience: true,
            education: true,
            bio: true,
            linkedIn: true,
            portfolio: true,
          },
        },
        interviews: {
          include: {
            scheduledBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { scheduledAt: 'desc' },
        },
        messages: {
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            receiver: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

// Update application status
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({ where: { id } });
    if (!existingApplication) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Update status
    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        notes: notes || existingApplication.notes,
      },
      include: {
        job: {
          select: {
            title: true,
            companyName: true,
          },
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Update application notes
export const updateApplicationNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({ where: { id } });
    if (!existingApplication) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Update notes
    const application = await prisma.application.update({
      where: { id },
      data: { notes },
      include: {
        job: {
          select: {
            title: true,
            companyName: true,
          },
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(application);
  } catch (error) {
    console.error('Error updating application notes:', error);
    res.status(500).json({ error: 'Failed to update application notes' });
  }
};

// Delete application
export const deleteApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({ where: { id } });
    if (!existingApplication) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Delete application (cascade will handle related records)
    await prisma.application.delete({ where: { id } });

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

// Bulk update application status
export const bulkUpdateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationIds, status } = req.body;

    const validStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      res.status(400).json({ error: 'Invalid application IDs' });
      return;
    }

    // Update applications
    const result = await prisma.application.updateMany({
      where: {
        id: { in: applicationIds },
      },
      data: { status },
    });

    res.json({ message: `Successfully updated ${result.count} applications` });
  } catch (error) {
    console.error('Error bulk updating applications:', error);
    res.status(500).json({ error: 'Failed to update applications' });
  }
};

// Bulk delete applications
export const bulkDeleteApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationIds } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      res.status(400).json({ error: 'Invalid application IDs' });
      return;
    }

    // Delete applications
    const result = await prisma.application.deleteMany({
      where: {
        id: { in: applicationIds },
      },
    });

    res.json({ message: `Successfully deleted ${result.count} applications` });
  } catch (error) {
    console.error('Error bulk deleting applications:', error);
    res.status(500).json({ error: 'Failed to delete applications' });
  }
};

// Get application statistics
export const getApplicationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalApplications,
      byStatus,
      recentApplications,
      avgApplicationsPerJob,
      topJobs,
    ] = await Promise.all([
      // Total applications
      prisma.application.count(),

      // Applications by status
      prisma.application.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Recent applications (last 30 days)
      prisma.application.count({
        where: { appliedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),

      // Average applications per job
      prisma.application.count().then(count =>
        prisma.job.count().then(jobs => jobs > 0 ? Math.round((count / jobs) * 10) / 10 : 0)
      ),

      // Top jobs by application count
      prisma.application.groupBy({
        by: ['jobId'],
        _count: true,
        orderBy: { _count: { jobId: 'desc' } },
        take: 5,
      }),
    ]);

    // Get job details for top jobs
    const topJobDetails = await Promise.all(
      topJobs.map(async (job) => {
        const jobDetail = await prisma.job.findUnique({
          where: { id: job.jobId },
          select: { id: true, title: true, companyName: true },
        });
        return {
          ...jobDetail,
          applicationCount: job._count,
        };
      })
    );

    res.json({
      total: totalApplications,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
      recentApplications,
      averageApplicationsPerJob: avgApplicationsPerJob,
      topJobs: topJobDetails,
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ error: 'Failed to fetch application statistics' });
  }
};

// Export applications to CSV (returns data for CSV generation)
export const exportApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, jobId, dateFrom, dateTo } = req.query;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (dateFrom || dateTo) {
      where.appliedAt = {};
      if (dateFrom) {
        where.appliedAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.appliedAt.lte = new Date(dateTo as string);
      }
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            title: true,
            companyName: true,
            location: true,
            type: true,
          },
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            experience: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Format data for CSV export
    const csvData = applications.map(app => ({
      applicationId: app.id,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      candidateEmail: app.candidate.email,
      candidatePhone: app.candidate.phone || '',
      candidateLocation: app.candidate.location || '',
      candidateExperience: app.candidate.experience || 0,
      jobTitle: app.job.title,
      company: app.job.companyName,
      jobLocation: app.job.location,
      jobType: app.job.type,
      status: app.status,
      appliedDate: app.appliedAt.toISOString(),
      notes: app.notes || '',
    }));

    res.json({ data: csvData, count: csvData.length });
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({ error: 'Failed to export applications' });
  }
};
