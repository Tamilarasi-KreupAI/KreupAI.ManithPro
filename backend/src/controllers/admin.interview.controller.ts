import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get all interviews with advanced filtering
export const getAllInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      type,
      candidateId,
      scheduledById,
      search,
      dateFrom,
      dateTo,
      sortBy = 'scheduledAt',
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

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (scheduledById) {
      where.scheduledById = scheduledById;
    }

    if (search) {
      where.OR = [
        { candidate: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { application: { job: { title: { contains: search as string, mode: 'insensitive' } } } },
        { application: { job: { companyName: { contains: search as string, mode: 'insensitive' } } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) {
        where.scheduledAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.scheduledAt.lte = new Date(dateTo as string);
      }
    }

    // Get total count
    const total = await prisma.interview.count({ where });

    // Get interviews
    const interviews = await prisma.interview.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
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
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                companyName: true,
                location: true,
              },
            },
          },
        },
      },
    });

    res.json({
      interviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// Get interview by ID with full details
export const getInterviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
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
          },
        },
        scheduledBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        application: {
          include: {
            job: true,
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

// Update interview
export const updateInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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

    // Check if interview exists
    const existingInterview = await prisma.interview.findUnique({ where: { id } });
    if (!existingInterview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Update interview
    const interview = await prisma.interview.update({
      where: { id },
      data: {
        type,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        timeZone,
        meetingLink,
        location,
        instructions,
        notes,
        feedback,
        rating: rating ? parseInt(rating) : undefined,
      },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        application: {
          include: {
            job: {
              select: {
                title: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    res.json(interview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

// Update interview status
export const updateInterviewStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, feedback, rating } = req.body;

    const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Check if interview exists
    const existingInterview = await prisma.interview.findUnique({ where: { id } });
    if (!existingInterview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Update status and optional feedback/rating
    const interview = await prisma.interview.update({
      where: { id },
      data: {
        status,
        feedback: feedback || existingInterview.feedback,
        rating: rating ? parseInt(rating) : existingInterview.rating,
      },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        application: {
          include: {
            job: {
              select: {
                title: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    res.json(interview);
  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({ error: 'Failed to update interview status' });
  }
};

// Delete interview
export const deleteInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if interview exists
    const existingInterview = await prisma.interview.findUnique({ where: { id } });
    if (!existingInterview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Delete interview
    await prisma.interview.delete({ where: { id } });

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
};

// Bulk update interview status
export const bulkUpdateInterviewStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewIds, status } = req.body;

    const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    if (!Array.isArray(interviewIds) || interviewIds.length === 0) {
      res.status(400).json({ error: 'Invalid interview IDs' });
      return;
    }

    // Update interviews
    const result = await prisma.interview.updateMany({
      where: {
        id: { in: interviewIds },
      },
      data: { status },
    });

    res.json({ message: `Successfully updated ${result.count} interviews` });
  } catch (error) {
    console.error('Error bulk updating interviews:', error);
    res.status(500).json({ error: 'Failed to update interviews' });
  }
};

// Bulk delete interviews
export const bulkDeleteInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewIds } = req.body;

    if (!Array.isArray(interviewIds) || interviewIds.length === 0) {
      res.status(400).json({ error: 'Invalid interview IDs' });
      return;
    }

    // Delete interviews
    const result = await prisma.interview.deleteMany({
      where: {
        id: { in: interviewIds },
      },
    });

    res.json({ message: `Successfully deleted ${result.count} interviews` });
  } catch (error) {
    console.error('Error bulk deleting interviews:', error);
    res.status(500).json({ error: 'Failed to delete interviews' });
  }
};

// Get interview statistics
export const getInterviewStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalInterviews,
      byStatus,
      byType,
      upcomingInterviews,
      completedInterviews,
      avgRating,
      interviewsThisWeek,
      interviewsThisMonth,
    ] = await Promise.all([
      // Total interviews
      prisma.interview.count(),

      // Interviews by status
      prisma.interview.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Interviews by type
      prisma.interview.groupBy({
        by: ['type'],
        _count: true,
      }),

      // Upcoming interviews (next 7 days)
      prisma.interview.count({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Completed interviews
      prisma.interview.count({
        where: { status: 'COMPLETED' },
      }),

      // Average rating
      prisma.interview.aggregate({
        where: { rating: { not: null } },
        _avg: { rating: true },
      }),

      // Interviews this week
      prisma.interview.count({
        where: {
          scheduledAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Interviews this month
      prisma.interview.count({
        where: {
          scheduledAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    res.json({
      total: totalInterviews,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
      byType: byType.map(t => ({ type: t.type, count: t._count })),
      upcomingInterviews,
      completedInterviews,
      averageRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
      thisWeek: interviewsThisWeek,
      thisMonth: interviewsThisMonth,
    });
  } catch (error) {
    console.error('Error fetching interview stats:', error);
    res.status(500).json({ error: 'Failed to fetch interview statistics' });
  }
};

// Get interview calendar (for calendar view)
export const getInterviewCalendar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }

    const interviews = await prisma.interview.findMany({
      where: {
        scheduledAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
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
      orderBy: { scheduledAt: 'asc' },
    });

    res.json({ interviews });
  } catch (error) {
    console.error('Error fetching interview calendar:', error);
    res.status(500).json({ error: 'Failed to fetch interview calendar' });
  }
};

// Get upcoming interviews (next 7 days)
export const getUpcomingInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
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
        scheduledBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                companyName: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    res.json({ interviews, count: interviews.length });
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming interviews' });
  }
};

// Export interviews to CSV
export const exportInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, type, dateFrom, dateTo } = req.query;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) {
        where.scheduledAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.scheduledAt.lte = new Date(dateTo as string);
      }
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
          include: {
            job: {
              select: {
                title: true,
                companyName: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    // Format data for CSV export
    const csvData = interviews.map(interview => ({
      interviewId: interview.id,
      candidateName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
      candidateEmail: interview.candidate.email,
      candidatePhone: interview.candidate.phone || '',
      jobTitle: interview.application.job.title,
      company: interview.application.job.companyName,
      type: interview.type,
      status: interview.status,
      scheduledAt: interview.scheduledAt.toISOString(),
      endTime: interview.endTime?.toISOString() || '',
      location: interview.location || interview.meetingLink || '',
      scheduledBy: `${interview.scheduledBy.firstName} ${interview.scheduledBy.lastName}`,
      rating: interview.rating || '',
      feedback: interview.feedback || '',
    }));

    res.json({ data: csvData, count: csvData.length });
  } catch (error) {
    console.error('Error exporting interviews:', error);
    res.status(500).json({ error: 'Failed to export interviews' });
  }
};
