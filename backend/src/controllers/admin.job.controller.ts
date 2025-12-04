import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get all jobs with advanced filtering
export const getAllJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      type,
      search,
      companyName,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (companyName) {
      where.companyName = { contains: companyName as string, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.job.count({ where });

    // Get jobs
    const jobs = await prisma.job.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
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
          select: {
            applications: true,
            savedBy: true,
          },
        },
      },
    });

    res.json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get job by ID with detailed information
export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
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
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
        _count: {
          select: {
            applications: true,
            savedBy: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// Update job (admin can update any job)
export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      type,
      salary,
      salaryMin,
      salaryMax,
      benefits,
      skills,
      experience,
      education,
      status,
      positions,
      deadline,
      companyName,
      companyDescription,
      companyWebsite,
      companyLogo,
      companySize,
      companyIndustry,
    } = req.body;

    // Check if job exists
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Update job
    const job = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        requirements,
        responsibilities,
        location,
        type,
        salary,
        salaryMin,
        salaryMax,
        benefits,
        skills,
        experience,
        education,
        status,
        positions,
        deadline,
        companyName,
        companyDescription,
        companyWebsite,
        companyLogo,
        companySize,
        companyIndustry,
      },
      include: {
        postedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// Delete job (admin can delete any job)
export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if job exists
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Delete job (cascade will handle related records)
    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

// Update job status
export const updateJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['OPEN', 'CLOSED', 'DRAFT'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Check if job exists
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Update status
    const job = await prisma.job.update({
      where: { id },
      data: { status },
      include: {
        postedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
};

// Bulk delete jobs
export const bulkDeleteJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      res.status(400).json({ error: 'Invalid job IDs' });
      return;
    }

    // Delete jobs
    const result = await prisma.job.deleteMany({
      where: {
        id: { in: jobIds },
      },
    });

    res.json({ message: `Successfully deleted ${result.count} jobs` });
  } catch (error) {
    console.error('Error bulk deleting jobs:', error);
    res.status(500).json({ error: 'Failed to delete jobs' });
  }
};

// Bulk update job status
export const bulkUpdateJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobIds, status } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      res.status(400).json({ error: 'Invalid job IDs' });
      return;
    }

    if (!status || !['OPEN', 'CLOSED', 'DRAFT'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Update jobs
    const result = await prisma.job.updateMany({
      where: {
        id: { in: jobIds },
      },
      data: { status },
    });

    res.json({ message: `Successfully updated ${result.count} jobs` });
  } catch (error) {
    console.error('Error bulk updating job status:', error);
    res.status(500).json({ error: 'Failed to update jobs' });
  }
};

// Get job statistics
export const getJobStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalJobs,
      openJobs,
      closedJobs,
      draftJobs,
      jobsByType,
      topCompanies,
      avgApplicationsPerJob,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.job.count({ where: { status: 'CLOSED' } }),
      prisma.job.count({ where: { status: 'DRAFT' } }),
      prisma.job.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.job.groupBy({
        by: ['companyName'],
        _count: true,
        orderBy: { _count: { companyName: 'desc' } },
        take: 5,
      }),
      prisma.application.count().then(count =>
        prisma.job.count().then(jobs => jobs > 0 ? Math.round((count / jobs) * 10) / 10 : 0)
      ),
    ]);

    res.json({
      total: totalJobs,
      byStatus: {
        open: openJobs,
        closed: closedJobs,
        draft: draftJobs,
      },
      byType: jobsByType.map(t => ({ type: t.type, count: t._count })),
      topCompanies: topCompanies.map(c => ({ company: c.companyName, count: c._count })),
      averageApplicationsPerJob: avgApplicationsPerJob,
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ error: 'Failed to fetch job statistics' });
  }
};

// Get applications for a specific job
export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      page = '1',
      limit = '10',
      status,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Build where clause
    const where: any = { jobId: id };
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.application.count({ where });

    // Get applications
    const applications = await prisma.application.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { appliedAt: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            skills: true,
            experience: true,
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
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'Failed to fetch job applications' });
  }
};
