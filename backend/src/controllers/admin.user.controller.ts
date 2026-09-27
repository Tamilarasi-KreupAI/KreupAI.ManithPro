import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import {
  sendAccountApprovalEmail,
  sendAccountRejectionEmail,
} from '../utils/email';
const prisma = new PrismaClient();

// Get all users with filtering and pagination
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            postedJobs: true,
            applications: true,
          },
        },
      },
    });

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID with detailed information
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        postedJobs: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                applications: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            job: {
              select: {
                id: true,
                title: true,
                companyName: true,
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            postedJobs: true,
            applications: true,
            savedJobs: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, phone, location } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone,
        location,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        location: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      role,
      phone,
      location,
      bio,
      skills,
      experience,
      education,
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });

      if (emailTaken) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        role,
        phone,
        location,
        bio,
        skills,
        experience,
        education,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        location: true,
        bio: true,
        skills: true,
        experience: true,
        education: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user?.userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Update user role
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['CANDIDATE', 'RECRUITER', 'CLIENT', 'VENDOR', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    if (id === req.user?.userId) {
      res.status(400).json({ error: 'Cannot change your own role' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Reset user password
export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Get user statistics
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, candidateCount, recruiterCount, adminCount, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'CANDIDATE' } }),
        prisma.user.count({ where: { role: 'RECRUITER' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    res.json({
      total: totalUsers,
      byRole: {
        candidate: candidateCount,
        recruiter: recruiterCount,
        admin: adminCount,
      },
      recentUsers,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// Bulk delete users
export const bulkDeleteUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ error: 'Invalid user IDs' });
      return;
    }

    if (userIds.includes(req.user?.userId)) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const result = await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });

    res.json({ message: `Successfully deleted ${result.count} users` });
  } catch (error) {
    console.error('Error bulk deleting users:', error);
    res.status(500).json({ error: 'Failed to delete users' });
  }
};

// ==================== RECRUITER APPROVAL ====================

// Get pending recruiter approvals
export const getPendingRecruiters = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      role: 'RECRUITER' as const,
      approvalStatus: 'PENDING' as const,
    };

    const [recruiters, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { approvalRequestedAt: 'asc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          location: true,
          companyName: true,
          companyWebsite: true,
          companyEmail: true,
          approvalStatus: true,
          approvalRequestedAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      recruiters,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching pending recruiters:', error);
    res.status(500).json({ error: 'Failed to fetch pending recruiters' });
  }
};

// ==================== CLIENT / VENDOR APPROVAL ====================

// Get pending CLIENT and VENDOR approvals
export const getPendingClientVendor = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = '1', limit = '10', role } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (
      isNaN(pageNum) ||
      pageNum < 1 ||
      isNaN(limitNum) ||
      limitNum < 1
    ) {
      res.status(400).json({ error: 'Invalid page or limit' });
      return;
    }

    if (role && role !== 'CLIENT' && role !== 'VENDOR') {
      res.status(400).json({
        error: 'Role must be CLIENT or VENDOR',
      });
      return;
    }

    const skip = (pageNum - 1) * limitNum;

    const where = role
      ? {
          role: role as 'CLIENT' | 'VENDOR',
          approvalStatus: 'PENDING' as const,
        }
      : {
          role: {
            in: ['CLIENT', 'VENDOR'] as ('CLIENT' | 'VENDOR')[],
          },
          approvalStatus: 'PENDING' as const,
        };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { approvalRequestedAt: 'asc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          skills: true,
          location: true,
          role: true,
          approvalStatus: true,
          approvalRequestedAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching pending CLIENT/VENDOR users:', error);
    res.status(500).json({
      error: 'Failed to fetch pending CLIENT/VENDOR users',
    });
  }
};

// Approve CLIENT or VENDOR
export const approveClientVendor = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'CLIENT' && user.role !== 'VENDOR') {
      res.status(400).json({
        error: 'User is not a CLIENT or VENDOR',
      });
      return;
    }

    if (user.approvalStatus !== 'PENDING') {
      res.status(400).json({
        error: 'User is not pending approval',
      });
      return;
    }

    const updatedUser = await prisma.user.update({
  where: { id },
  data: {
    approvalStatus: 'APPROVED',
    approvedAt: new Date(),
    approvedById: req.user?.userId,
  },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    approvalStatus: true,
    approvedAt: true,
  },
});

// Send approval email
await sendAccountApprovalEmail(
  updatedUser.email,
  `${updatedUser.firstName} ${updatedUser.lastName}`,
  updatedUser.role as 'CLIENT' | 'VENDOR'
);

    res.json({
      message: `${updatedUser.role} approved successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error approving CLIENT/VENDOR:', error);
    res.status(500).json({
      error: 'Failed to approve user',
    });
  }
};

// Reject CLIENT or VENDOR
export const rejectClientVendor = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'CLIENT' && user.role !== 'VENDOR') {
      res.status(400).json({
        error: 'User is not a CLIENT or VENDOR',
      });
      return;
    }

    if (user.approvalStatus !== 'PENDING') {
      res.status(400).json({
        error: 'User is not pending approval',
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason: reason || 'No reason provided',
        approvedById: req.user?.userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        approvalStatus: true,
        rejectionReason: true,
      },
    });
// Send rejection email
await sendAccountRejectionEmail(
  updatedUser.email,
  `${updatedUser.firstName} ${updatedUser.lastName}`,
  updatedUser.role as 'CLIENT' | 'VENDOR',
  updatedUser.rejectionReason || 'No reason provided'
);

    res.json({
      message: `${updatedUser.role} rejected`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error rejecting CLIENT/VENDOR:', error);
    res.status(500).json({
      error: 'Failed to reject user',
    });
  }
};

// ==================== RECRUITER APPROVAL ====================

// Approve recruiter
export const approveRecruiter = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'RECRUITER') {
      res.status(400).json({ error: 'User is not a recruiter' });
      return;
    }

    if (user.approvalStatus !== 'PENDING') {
      res.status(400).json({ error: 'Recruiter is not pending approval' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedById: req.user?.userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyName: true,
        companyEmail: true,
        approvalStatus: true,
        approvedAt: true,
      },
    });
// Send approval email
await sendAccountApprovalEmail(
  updatedUser.email,
  `${updatedUser.firstName} ${updatedUser.lastName}`,
  'RECRUITER'
);

    res.json({
      message: 'Recruiter approved successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error approving recruiter:', error);
    res.status(500).json({ error: 'Failed to approve recruiter' });
  }
};

// Reject recruiter
export const rejectRecruiter = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'RECRUITER') {
      res.status(400).json({ error: 'User is not a recruiter' });
      return;
    }

    if (user.approvalStatus !== 'PENDING') {
      res.status(400).json({ error: 'Recruiter is not pending approval' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason: reason || 'No reason provided',
        approvedById: req.user?.userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyName: true,
        approvalStatus: true,
        rejectionReason: true,
      },
    });
// Send rejection email
await sendAccountRejectionEmail(
  updatedUser.email,
  `${updatedUser.firstName} ${updatedUser.lastName}`,
  'RECRUITER',
  updatedUser.rejectionReason || 'No reason provided'
);

    res.json({
      message: 'Recruiter rejected',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error rejecting recruiter:', error);
    res.status(500).json({ error: 'Failed to reject recruiter' });
  }
};

// Get recruiter approval statistics
export const getRecruiterApprovalStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'RECRUITER',
          approvalStatus: 'PENDING',
        },
      }),
      prisma.user.count({
        where: {
          role: 'RECRUITER',
          approvalStatus: 'APPROVED',
        },
      }),
      prisma.user.count({
        where: {
          role: 'RECRUITER',
          approvalStatus: 'REJECTED',
        },
      }),
    ]);

    res.json({
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    });
  } catch (error) {
    console.error('Error fetching recruiter stats:', error);
    res.status(500).json({
      error: 'Failed to fetch recruiter approval statistics',
    });
  }
};