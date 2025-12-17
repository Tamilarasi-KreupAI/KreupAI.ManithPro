import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
      const [totalJobs, openJobs, totalApplications, pendingApplications] = await Promise.all([
        prisma.job.count({
          where: req.user.role === 'ADMIN' ? {} : { postedById: req.user.userId },
        }),
        prisma.job.count({
          where: {
            status: 'OPEN',
            ...(req.user.role === 'ADMIN' ? {} : { postedById: req.user.userId }),
          },
        }),
        prisma.application.count({
          where: req.user.role === 'ADMIN'
            ? {}
            : {
                job: { postedById: req.user.userId },
              },
        }),
        prisma.application.count({
          where: {
            status: { in: ['PENDING', 'REVIEWING'] },
            ...(req.user.role === 'ADMIN'
              ? {}
              : { job: { postedById: req.user.userId } }),
          },
        }),
      ]);

      const recentApplications = await prisma.application.findMany({
        where: req.user.role === 'ADMIN'
          ? {}
          : {
              job: { postedById: req.user.userId },
            },
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

      res.json({
        totalJobs,
        openJobs,
        totalApplications,
        pendingApplications,
        recentApplications,
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
