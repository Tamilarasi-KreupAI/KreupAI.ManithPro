import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { sendApplicationSubmittedEmail, sendApplicationStatusEmail } from '../utils/email';
import { generateResumeFromProfile } from '../utils/resumeGenerator';
import path from 'path';
import fs from 'fs';

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

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: req.user.userId,
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

    // Send status update email
    await sendApplicationStatusEmail(
      updatedApplication.candidate.email,
      `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
      updatedApplication.job.title,
      status
    );

    // Send automated message to candidate based on status
    const statusMessages: Record<string, string> = {
      UNDER_REVIEW: `Great news! Your application for the ${updatedApplication.job.title} position has been reviewed and is now under consideration. Our team is carefully evaluating your qualifications. We'll keep you updated on the next steps.`,
      SHORTLISTED: `Congratulations! 🎉 You've been shortlisted for the ${updatedApplication.job.title} position. Your profile stood out among many applicants. We'll be reaching out soon to schedule the next steps in our interview process. Please keep an eye on your email and phone.`,
      INTERVIEWED: `Thank you for taking the time to interview for the ${updatedApplication.job.title} position. We appreciate your interest in joining our team. We're currently reviewing all candidates and will get back to you with our decision soon.`,
      OFFERED: `Congratulations! 🎊 We're thrilled to extend an offer for the ${updatedApplication.job.title} position. You'll receive a formal offer letter via email shortly with all the details including compensation, benefits, and start date. We're excited about the possibility of you joining our team!`,
      REJECTED: `Thank you for your interest in the ${updatedApplication.job.title} position and for taking the time to apply. After careful consideration, we've decided to move forward with other candidates whose experience more closely matches our current needs. We appreciate your interest and encourage you to apply for future opportunities with us. We wish you all the best in your job search.`,
      WITHDRAWN: `We've confirmed that your application for the ${updatedApplication.job.title} position has been withdrawn as per your request. Thank you for considering our opportunity, and we hope to see you apply for other positions in the future.`,
    };

    const messageContent = statusMessages[status] || `Your application status for ${updatedApplication.job.title} has been updated to: ${status.replace('_', ' ')}.`;

    // Add notes from recruiter if provided
    const fullMessage = notes
      ? `${messageContent}\n\nRecruiter's Note: ${notes}`
      : messageContent;

    try {
      // Create automated message from recruiter to candidate
      await prisma.message.create({
        data: {
          content: fullMessage,
          senderId: updatedApplication.job.postedBy.id,
          receiverId: updatedApplication.candidate.id,
          applicationId: id,
          attachments: [],
        },
      });

      // Create notification for candidate
      await prisma.notification.create({
        data: {
          type: 'APPLICATION_STATUS',
          title: `Application Status Updated: ${status.replace('_', ' ')}`,
          message: `Your application for ${updatedApplication.job.title} has been updated`,
          link: `/applications`,
          userId: updatedApplication.candidate.id,
        },
      });
    } catch (messageError) {
      console.error('Failed to send automated message:', messageError);
      // Don't fail the status update if message sending fails
    }

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
