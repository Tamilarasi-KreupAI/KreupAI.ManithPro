import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const saveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { jobId } = req.body;

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check if already saved
    const existingSave = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.userId,
          jobId,
        },
      },
    });

    if (existingSave) {
      res.status(409).json({ error: 'Job already saved' });
      return;
    }

    // Save job
    const savedJob = await prisma.savedJob.create({
      data: {
        userId: req.user.userId,
        jobId,
      },
      include: {
        job: {
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
        },
      },
    });

    res.status(201).json({
      message: 'Job saved successfully',
      savedJob,
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ error: 'Failed to save job' });
  }
};

export const unsaveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { jobId } = req.params;

    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.userId,
          jobId,
        },
      },
    });

    if (!savedJob) {
      res.status(404).json({ error: 'Saved job not found' });
      return;
    }

    await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: req.user.userId,
          jobId,
        },
      },
    });

    res.json({ message: 'Job unsaved successfully' });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({ error: 'Failed to unsave job' });
  }
};

export const getSavedJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId: req.user.userId },
        include: {
          job: {
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
          },
        },
        orderBy: { savedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.savedJob.count({ where: { userId: req.user.userId } }),
    ]);

    res.json({
      savedJobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
};

export const checkIfSaved = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { jobId } = req.params;

    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.userId,
          jobId,
        },
      },
    });

    res.json({ isSaved: !!savedJob });
  } catch (error) {
    console.error('Check saved job error:', error);
    res.status(500).json({ error: 'Failed to check saved job' });
  }
};
