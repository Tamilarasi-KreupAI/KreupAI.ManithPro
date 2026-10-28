import { Response } from 'express';
import { ApplicationStatus } from '@prisma/client';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../middleware/auth';
import { sendApplicationSubmittedEmail, sendApplicationStatusEmail } from '../utils/email';
import { generateResumeFromProfile } from '../utils/resumeGenerator';
import path from 'path';
import fs from 'fs';


const allowedStatusTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING: ['REVIEWING', 'REJECTED', 'WITHDRAWN'],
  REVIEWING: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW_SCHEDULED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_SCHEDULED: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};


export const checkIfApplied = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'VENDOR' || req.user.role === 'CLIENT') {
    res.status(403).json({ error: 'Insufficient permissions' });
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
    if (job.deadline && new Date() > job.deadline) {
      res.status(400).json({
        error: 'The application deadline for this job has passed',
      });
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

    // Generate resume from profile
    let resumePath: string;
    try {
      const resumeResult = await generateResumeFromProfile(req.user.userId);
      resumePath = resumeResult.filePath;
    } catch (error) {
      console.error('Error generating resume from profile:', error);
      res.status(400).json({
        error: 'Unable to generate resume from your profile. Please ensure your profile is complete.'
      });
      return;
    }

    // Create application and initial status history entry
    const application = await prisma.$transaction(async (tx) => {
      const createdApplication = await tx.application.create({
        data: {
          jobId,
          candidateId: req.user!.userId,
          resume: resumePath,
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

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: createdApplication.id,
          fromStatus: null,
          toStatus: ApplicationStatus.PENDING,
          notes: 'Application submitted',
          changedById: req.user!.userId,
        },
      });

      return createdApplication;
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

    const { jobId, status, search } = req.query;

const parsedPage = Number.parseInt(String(req.query.page ?? '1'), 10);
const parsedLimit = Number.parseInt(String(req.query.limit ?? '10'), 10);

const pageNum = Number.isFinite(parsedPage) && parsedPage > 0
  ? parsedPage
  : 1;

const limitNum = Number.isFinite(parsedLimit) && parsedLimit > 0
  ? Math.min(parsedLimit, 100)
  : 10;

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

const searchTerm = String(search ?? '').trim();

if (searchTerm) {
  where.OR = [
    {
      candidate: {
        is: {
          firstName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      },
    },
    {
      candidate: {
        is: {
          lastName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      },
    },
    {
      candidate: {
        is: {
          email: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      },
    },
    {
      job: {
        is: {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      },
    },
  ];
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
        statusHistory: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
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

    const validStatuses = Object.values(ApplicationStatus);

    if (!validStatuses.includes(status as ApplicationStatus)) {
      res.status(400).json({
        error: 'Invalid application status',
        validStatuses,
      });
      return;
    }

    const newStatus = status as ApplicationStatus;

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

    if (
      application.job.postedById !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      res.status(403).json({
        error: 'Not authorized to update this application',
      });
      return;
    }

    const currentStatus = application.status;

    if (currentStatus === newStatus) {
      res.status(400).json({
        error: `Application is already ${newStatus}`,
      });
      return;
    }

    const allowedNextStatuses = allowedStatusTransitions[currentStatus];

    if (!allowedNextStatuses.includes(newStatus)) {
      res.status(400).json({
        error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        currentStatus,
        allowedNextStatuses,
      });
      return;
    }

    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: {
          status: newStatus,
          notes,
        },
        include: {
          job: {
            select: {
              title: true,
              postedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
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
            },
          },
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: currentStatus,
          toStatus: newStatus,
          notes: notes || null,
          changedById: req.user!.userId,
        },
      });

      return updated;
    });

    await sendApplicationStatusEmail(
      updatedApplication.candidate.email,
      `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
      updatedApplication.job.title,
      newStatus
    );

    const statusMessages: Record<ApplicationStatus, string> = {
      PENDING: `Your application for the ${updatedApplication.job.title} position has been received and is currently pending review. We will keep you updated on the next steps.`,
      REVIEWING: `Your application for the ${updatedApplication.job.title} position is currently being reviewed by our hiring team. We will keep you updated as the process progresses.`,
      SHORTLISTED: `Congratulations! 🎉 You've been shortlisted for the ${updatedApplication.job.title} position. Our team will contact you soon regarding the next steps in the interview process.`,
      INTERVIEW_SCHEDULED: `Your application for the ${updatedApplication.job.title} position has progressed to the interview stage. Please check your interview details and be prepared for the scheduled interview.`,
      REJECTED: `Thank you for your interest in the ${updatedApplication.job.title} position. After careful consideration, we have decided to move forward with other candidates. We appreciate your time and encourage you to apply for future opportunities.`,
      ACCEPTED: `Congratulations! 🎉 Your application for the ${updatedApplication.job.title} position has been accepted. Our team will contact you with the next steps and further details.`,
      WITHDRAWN: `Your application for the ${updatedApplication.job.title} position has been withdrawn. Thank you for considering this opportunity, and we wish you the best in your job search.`,
    };

    const messageContent = statusMessages[newStatus];

    const fullMessage = notes
      ? `${messageContent}\n\nRecruiter's Note: ${notes}`
      : messageContent;

    try {
      await prisma.message.create({
        data: {
          content: fullMessage,
          senderId: updatedApplication.job.postedBy.id,
          receiverId: updatedApplication.candidate.id,
          applicationId: id,
          attachments: [],
        },
      });

      await prisma.notification.create({
        data: {
          type: 'APPLICATION_STATUS',
          title: `Application Status Updated: ${newStatus.replace('_', ' ')}`,
          message: `Your application for ${updatedApplication.job.title} has been updated`,
          link: `/applications`,
          userId: updatedApplication.candidate.id,
        },
      });
    } catch (messageError) {
      console.error('Failed to send automated message:', messageError);
    }

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication,
      statusHistory: {
        fromStatus: currentStatus,
        toStatus: newStatus,
        notes: notes || null,
      },
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

    const currentStatus = application.status;

    if (!allowedStatusTransitions[currentStatus].includes(ApplicationStatus.WITHDRAWN)) {
      res.status(400).json({
        error: `Application cannot be withdrawn from ${currentStatus} status`,
        currentStatus,
      });
      return;
    }

    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: { status: ApplicationStatus.WITHDRAWN },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: currentStatus,
          toStatus: ApplicationStatus.WITHDRAWN,
          notes: 'Application withdrawn by candidate',
          changedById: req.user!.userId,
        },
      });

      return updated;
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

export const downloadApplicationResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            postedById: true,
          },
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Check authorization - only recruiter who posted the job or admin can download
    if (req.user.role !== 'ADMIN' &&
        (req.user.role !== 'RECRUITER' || application.job.postedById !== req.user.userId)) {
      res.status(403).json({ error: 'Not authorized to download this resume' });
      return;
    }

    // Get the resume file path
    const resumePath = application.resume;

    // Handle both absolute and relative paths
    let filePath: string;
    if (path.isAbsolute(resumePath)) {
      filePath = resumePath;
    } else {
      // Assume it's relative to the uploads/resumes directory
      filePath = path.join(__dirname, '../../uploads/resumes', path.basename(resumePath));
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Resume file not found:', filePath);
      res.status(404).json({ error: 'Resume file not found' });
      return;
    }

    // Generate a friendly filename
    const fileName = `${application.candidate.firstName}_${application.candidate.lastName}_Resume.pdf`;

    // Send the file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading resume:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download resume' });
        }
      }
    });
  } catch (error) {
    console.error('Download application resume error:', error);
    res.status(500).json({ error: 'Failed to download resume' });
  }
};


export const bulkUpdateApplicationStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'RECRUITER' && req.user.role !== 'ADMIN') {
      res.status(403).json({
        error: 'Only recruiters and admins can update application status',
      });
      return;
    }

    const { applicationIds, status, notes } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      res.status(400).json({
        error: 'applicationIds must be a non-empty array',
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        error: 'Status is required',
      });
      return;
    }

    const validStatuses = Object.values(ApplicationStatus);

    if (!validStatuses.includes(status as ApplicationStatus)) {
      res.status(400).json({
        error: 'Invalid application status',
        validStatuses,
      });
      return;
    }

    const newStatus = status as ApplicationStatus;

    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            postedById: true,
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

    if (applications.length !== applicationIds.length) {
      res.status(404).json({
        error: 'One or more applications were not found',
      });
      return;
    }

    for (const application of applications) {
      if (
        req.user.role !== 'ADMIN' &&
        application.job.postedById !== req.user.userId
      ) {
        res.status(403).json({
          error: 'Not authorized to update one or more applications',
        });
        return;
      }

      const allowedNextStatuses =
        allowedStatusTransitions[application.status];

      if (!allowedNextStatuses.includes(newStatus)) {
        res.status(400).json({
          error: `Invalid status transition from ${application.status} to ${newStatus}`,
          applicationId: application.id,
          currentStatus: application.status,
          allowedNextStatuses,
        });
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const application of applications) {
        await tx.application.update({
          where: { id: application.id },
          data: {
            status: newStatus,
            notes,
          },
        });

        await tx.applicationStatusHistory.create({
          data: {
            applicationId: application.id,
            fromStatus: application.status,
            toStatus: newStatus,
            notes: notes || null,
            changedById: req.user!.userId,
          },
        });
      }
    });

    res.json({
      message: 'Applications status updated successfully',
      updatedCount: applications.length,
      status: newStatus,
      applicationIds,
    });
  } catch (error) {
    console.error('Bulk update application status error:', error);
    res.status(500).json({
      error: 'Failed to update application statuses',
    });
  }
};
