import { Request, Response } from 'express';
import { PrismaClient, InterviewStatus, InterviewType } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new interview
export const createInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      applicationId,
      type,
      scheduledAt,
      endTime,
      timeZone,
      meetingLink,
      location,
      instructions,
      notes,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify application exists and get candidate info
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: {
          include: {
            postedBy: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Verify user is the recruiter who posted the job
    if (application.job.postedById !== userId) {
      res.status(403).json({ error: 'You can only schedule interviews for your own job postings' });
      return;
    }

    const interview = await prisma.interview.create({
      data: {
        type,
        scheduledAt: new Date(scheduledAt),
        endTime: new Date(endTime),
        timeZone,
        meetingLink,
        location,
        instructions,
        notes,
        applicationId,
        scheduledById: userId,
        candidateId: application.candidateId,
      },
      include: {
        application: {
          include: {
            job: true,
            candidate: true,
          },
        },
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
    });

    // Update application status if not already set
    if (application.status !== 'INTERVIEW_SCHEDULED') {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'INTERVIEW_SCHEDULED' },
      });
    }

    // Create notification for candidate
    await prisma.notification.create({
      data: {
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview Scheduled',
        message: `You have been scheduled for a ${type.toLowerCase().replace('_', ' ')} interview for ${application.job.title}`,
        link: `/interviews/${interview.id}`,
        userId: application.candidateId,
      },
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
};

// Get all interviews for a user (both as candidate and recruiter)
export const getInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, type, from, to } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const where: any = {
      OR: [
        { candidateId: userId },
        { scheduledById: userId },
      ],
    };

    if (status) {
      where.status = status as InterviewStatus;
    }

    if (type) {
      where.type = type as InterviewType;
    }

    if (from || to) {
      where.scheduledAt = {};
      if (from) {
        where.scheduledAt.gte = new Date(from as string);
      }
      if (to) {
        where.scheduledAt.lte = new Date(to as string);
      }
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            job: true,
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                skills: true,
              },
            },
          },
        },
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// Get interview by ID
export const getInterviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: true,
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
                linkedIn: true,
                portfolio: true,
              },
            },
          },
        },
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
            linkedIn: true,
            portfolio: true,
          },
        },
      },
    });

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Verify user is either the candidate or the recruiter
    if (interview.candidateId !== userId && interview.scheduledById !== userId) {
      res.status(403).json({ error: 'You do not have permission to view this interview' });
      return;
    }

    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

// Update interview
export const updateInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Only the recruiter who scheduled the interview can update it
    if (interview.scheduledById !== userId) {
      res.status(403).json({ error: 'Only the recruiter who scheduled this interview can update it' });
      return;
    }

    const {
      type,
      status,
      scheduledAt,
      endTime,
      timeZone,
      meetingLink,
      location,
      instructions,
      notes,
      feedback,
      rating,
    } = req.body;

    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(timeZone !== undefined && { timeZone }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(location !== undefined && { location }),
        ...(instructions !== undefined && { instructions }),
        ...(notes !== undefined && { notes }),
        ...(feedback !== undefined && { feedback }),
        ...(rating !== undefined && { rating }),
      },
      include: {
        application: {
          include: {
            job: true,
            candidate: true,
          },
        },
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
    });

    // Create notification for status changes
    if (status && status !== interview.status) {
      await prisma.notification.create({
        data: {
          type: 'INTERVIEW_SCHEDULED',
          title: 'Interview Status Updated',
          message: `Your interview status has been updated to ${status.toLowerCase().replace('_', ' ')}`,
          link: `/interviews/${id}`,
          userId: interview.candidateId,
        },
      });
    }

    res.json(updatedInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

// Delete interview
export const deleteInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Only the recruiter who scheduled the interview can delete it
    if (interview.scheduledById !== userId) {
      res.status(403).json({ error: 'Only the recruiter who scheduled this interview can delete it' });
      return;
    }

    await prisma.interview.delete({
      where: { id },
    });

    // Create notification for candidate
    await prisma.notification.create({
      data: {
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview Cancelled',
        message: 'An interview has been cancelled by the recruiter',
        userId: interview.candidateId,
      },
    });

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
};

// Get upcoming interviews for a user
export const getUpcomingInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const now = new Date();

    const interviews = await prisma.interview.findMany({
      where: {
        OR: [
          { candidateId: userId },
          { scheduledById: userId },
        ],
        scheduledAt: {
          gte: now,
        },
        status: {
          in: ['SCHEDULED', 'RESCHEDULED'],
        },
      },
      include: {
        application: {
          include: {
            job: true,
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
        },
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 10,
    });

    res.json(interviews);
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming interviews' });
  }
};

// Get interviews for a specific application
export const getInterviewsByApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user has access to this application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            postedBy: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // User must be either the candidate or the recruiter
    if (application.candidateId !== userId && application.job.postedById !== userId) {
      res.status(403).json({ error: 'You do not have permission to view these interviews' });
      return;
    }

    const interviews = await prisma.interview.findMany({
      where: {
        applicationId,
      },
      include: {
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews for application:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// Submit interview feedback
export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { feedback, rating } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Only the recruiter can submit feedback
    if (interview.scheduledById !== userId) {
      res.status(403).json({ error: 'Only the recruiter can submit feedback' });
      return;
    }

    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        feedback,
        rating,
        status: 'COMPLETED',
      },
      include: {
        application: {
          include: {
            job: true,
            candidate: true,
          },
        },
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
    });

    res.json(updatedInterview);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};
