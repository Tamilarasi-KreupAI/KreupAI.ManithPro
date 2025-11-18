import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

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
      positions,
      deadline,
      status,
      companyName,
      companyDescription,
      companyWebsite,
      companyLogo,
      companySize,
      companyIndustry,
    } = req.body;

    if (!title || !description || !location || !type || !companyName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        location,
        type,
        salary,
        salaryMin,
        salaryMax,
        benefits: benefits || [],
        skills: skills || [],
        experience,
        education,
        positions: positions || 1,
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'OPEN',
        companyName,
        companyDescription,
        companyWebsite,
        companyLogo,
        companySize,
        companyIndustry,
        postedById: req.user.userId,
      },
      include: {
        postedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      type,
      location,
      search,
      skills,
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filters
    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      // By default, only show OPEN jobs to candidates
      if (req.user?.role === 'CANDIDATE') {
        where.status = 'OPEN';
      }
    }

    if (type) {
      where.type = type;
    }

    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (skills) {
      const skillsArray = (skills as string).split(',').map(s => s.trim());
      where.skills = { hasSome: skillsArray };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          postedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

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
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

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
                skills: true,
                experience: true,
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Hide applications from non-recruiters
    if (req.user?.role === 'CANDIDATE') {
      const { applications, ...jobWithoutApplications } = job;
      res.json(jobWithoutApplications);
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Check if job exists and user owns it (or is admin)
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (existingJob.postedById !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized to update this job' });
      return;
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...req.body,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      },
      include: {
        postedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Check if job exists and user owns it (or is admin)
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (existingJob.postedById !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized to delete this job' });
      return;
    }

    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};
