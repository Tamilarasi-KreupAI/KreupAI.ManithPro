import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';


export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        bio: true,
        skills: true,
        experience: true,
        education: true,
        location: true,
        linkedIn: true,
        portfolio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const {
      firstName,
      lastName,
      phone,
      bio,
      skills,
      experience,
      education,
      location,
      linkedIn,
      portfolio,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName,
        lastName,
        phone,
        bio,
        skills,
        experience,
        education,
        location,
        linkedIn,
        portfolio,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        bio: true,
        skills: true,
        experience: true,
        education: true,
        location: true,
        linkedIn: true,
        portfolio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new passwords are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'CANDIDATE') {
      // Candidate stats
      const [totalApplications, pendingApplications, acceptedApplications] = await Promise.all([
        prisma.application.count({
          where: { candidateId: req.user.userId },
        }),
        prisma.application.count({
          where: {
            candidateId: req.user.userId,
            status: { in: ['PENDING', 'REVIEWING'] },
          },
        }),
        prisma.application.count({
          where: {
            candidateId: req.user.userId,
            status: { in: ['ACCEPTED', 'INTERVIEW_SCHEDULED', 'SHORTLISTED'] },
          },
        }),
      ]);

      const recentApplications = await prisma.application.findMany({
        where: { candidateId: req.user.userId },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              type: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: 5,
      });

      res.json({
        totalApplications,
        pendingApplications,
        acceptedApplications,
        recentApplications,
      });
    } else {
      // Recruiter/Admin stats
      const applicationWhere = req.user.role === 'ADMIN' ? {} : { job: { postedById: req.user.userId } };
      const jobWhere = req.user.role === 'ADMIN' ? {} : { postedById: req.user.userId };

      const [totalJobs, openJobs, totalApplications, pendingApplications, recruiterApplications] = await Promise.all([
        prisma.job.count({
          where: jobWhere,
        }),
        prisma.job.count({
          where: {
            status: 'OPEN',
            ...jobWhere,
          },
        }),
        prisma.application.count({
          where: applicationWhere,
        }),
        prisma.application.count({
          where: {
            status: { in: ['PENDING', 'REVIEWING'] },
            ...applicationWhere,
          },
        }),
        prisma.application.findMany({
          where: applicationWhere,
          select: {
            id: true,
            status: true,
            appliedAt: true,
            updatedAt: true,
            statusHistory: {
              select: {
                toStatus: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            interviews: {
              select: { id: true },
              take: 1,
            },
            messages: {
              select: { id: true },
              take: 1,
            },
          },
        }),
      ]);

      const recentApplications = await prisma.application.findMany({
        where: applicationWhere,
        include: {
          job: {
            select: {
              id: true,
              title: true,
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
        orderBy: { appliedAt: 'desc' },
        take: 10,
      });

      // =========================================================================
      // Time-to-Hire Calculation (R-14)
      // Unit: days
      // Numerator: Sum of days from application to hire across all completed hires (status === 'ACCEPTED')
      // Denominator: Count of completed hires with valid applied and hired dates
      // Hired date is determined by statusHistory when transitioned to 'ACCEPTED', falling back to updatedAt.
      // If no completed hires or insufficient date data, returns 0 without inventing data.
      // =========================================================================
      const hiredApplications = recruiterApplications.filter((app) => app.status === 'ACCEPTED');
      let totalHireDays = 0;
      let validHiresCount = 0;

      for (const app of hiredApplications) {
        if (!app.appliedAt) continue;
        const appliedDate = new Date(app.appliedAt);
        const acceptedHistory = app.statusHistory?.find((h) => h.toStatus === 'ACCEPTED');
        const hiredDate = acceptedHistory ? new Date(acceptedHistory.createdAt) : (app.updatedAt ? new Date(app.updatedAt) : null);

        if (hiredDate && !isNaN(appliedDate.getTime()) && !isNaN(hiredDate.getTime())) {
          const diffMs = hiredDate.getTime() - appliedDate.getTime();
          if (diffMs >= 0) {
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            totalHireDays += days;
            validHiresCount++;
          }
        }
      }

      const avgTimeToHire = validHiresCount > 0 ? Math.round(totalHireDays / validHiresCount) : 0;

      // =========================================================================
      // Response Rate Calculation (R-14)
      // Unit: percentage (0 - 100%)
      // Denominator: Total valid applications received for recruiter's jobs (recruiterApplications.length)
      // Numerator: Applications that have actual recruiter response/action records:
      //   - Status transitioned beyond PENDING (REVIEWING, SHORTLISTED, INTERVIEW_SCHEDULED, ACCEPTED, REJECTED)
      //   - An interview has been scheduled
      //   - A recruiter message has been sent
      //   - A status history progression record exists
      // Missing or unresponded records (e.g. pending with no actions) are not counted as responses.
      // If denominator is 0, returns 0 without inventing data.
      // =========================================================================
      const totalAppsCount = recruiterApplications.length;
      let respondedAppsCount = 0;

      for (const app of recruiterApplications) {
        const hasRespondedStatus = ['REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'].includes(app.status);
        const hasInterview = (app.interviews?.length ?? 0) > 0;
        const hasMessage = (app.messages?.length ?? 0) > 0;
        const hasStatusHistoryProgression = (app.statusHistory?.length ?? 0) > 0 && app.statusHistory.some((h) => h.toStatus !== 'PENDING');

        if (hasRespondedStatus || hasInterview || hasMessage || hasStatusHistoryProgression) {
          respondedAppsCount++;
        }
      }

      const responseRate = totalAppsCount > 0 ? Math.round((respondedAppsCount / totalAppsCount) * 100) : 0;

      res.json({
        totalJobs,
        openJobs,
        totalApplications,
        pendingApplications,
        recentApplications,
        avgTimeToHire,
        timeToHire: avgTimeToHire,
        responseRate,
      });
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: 'Password is required to delete account' });
      return;
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: req.user.userId },
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
