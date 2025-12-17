import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { sendApplicationSubmittedEmail, sendApplicationStatusEmail } from '../utils/email';

const prisma = new PrismaClient();

export const checkIfApplied = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'CANDIDATE') {
      res.status(403).json({ error: 'Only candidates can check application status' });
      return;
    }

    const { jobId } = req.params;

    const application = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: req.user.userId,
        },
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
      },
    });

    res.json({
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ error: 'Failed to check application status' });
  }
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'CANDIDATE') {
      res.status(403).json({ error: 'Only candidates can apply for jobs' });
      return;
    }

    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Resume file is required' });
      return;
    }

    // Check if job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.status !== 'OPEN') {
      res.status(400).json({ error: 'This job is no longer accepting applications' });
      return;
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: req.user.userId,
        },
      },
    });

    if (existingApplication) {
      res.status(409).json({ error: 'You have already applied for this job' });
      return;
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: req.user.userId,
        resume: req.file.path,
        coverLetter,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send confirmation email
    await sendApplicationSubmittedEmail(
      application.candidate.email,
      `${application.candidate.firstName} ${application.candidate.lastName}`,
      application.job.title
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { jobId, status, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Candidates can only see their own applications
    if (req.user.role === 'CANDIDATE') {
      where.candidateId = req.user.userId;
    }

    if (jobId) {
      where.jobId = jobId;

      // If querying specific job, ensure user has access
      if (req.user.role === 'RECRUITER' || req.user.role === 'ADMIN') {
        const job = await prisma.job.findUnique({
          where: { id: jobId as string },
        });

        if (!job) {
          res.status(404).json({ error: 'Job not found' });
          return;
        }

        if (job.postedById !== req.user.userId && req.user.role !== 'ADMIN') {
          res.status(403).json({ error: 'Not authorized to view these applications' });
          return;
        }
      }
    } else {
      // If no jobId, recruiters can only see applications for their jobs
      if (req.user.role === 'RECRUITER') {
        const recruiterJobs = await prisma.job.findMany({
          where: { postedById: req.user.userId },
          select: { id: true },
        });
        const jobIds = recruiterJobs.map(j => j.id);

        // If recruiter has no jobs, return empty result instead of querying all
        if (jobIds.length === 0) {
          res.json({
            applications: [],
            pagination: {
              total: 0,
              page: pageNum,
              limit: limitNum,
              totalPages: 0,
            },
          });
          return;
        }

        where.jobId = { in: jobIds };
      }
    }

    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              type: true,
              companyName: true,
              companyLogo: true,
              salary: true,
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
              skills: true,
              experience: true,
              education: true,
              location: true,
              linkedIn: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.application.count({ where }),
    ]);

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
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

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
            bio: true,
            skills: true,
            experience: true,
            education: true,
            location: true,
            linkedIn: true,
            portfolio: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Check authorization
    const isCandidate = req.user.userId === application.candidateId;
    const isRecruiter = req.user.userId === application.job.postedById;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isCandidate && !isRecruiter && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to view this application' });
      return;
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'CANDIDATE') {
      res.status(403).json({ error: 'Candidates cannot update application status' });
      return;
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Check if recruiter owns the job
    if (application.job.postedById !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized to update this application' });
      return;
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status, notes },
      include: {
        job: {
          select: {
            title: true,
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

    // Send status update email
    await sendApplicationStatusEmail(
      updatedApplication.candidate.email,
      `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
      updatedApplication.job.title,
      status
    );

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

export const withdrawApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.candidateId !== req.user.userId) {
      res.status(403).json({ error: 'Not authorized to withdraw this application' });
      return;
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });

    res.json({
      message: 'Application withdrawn successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
};
