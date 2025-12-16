import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get recruiter profile
export const getRecruiterProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    let recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            linkedIn: true,
          },
        },
      },
    });

    // If no recruiter profile exists, create one with defaults
    if (!recruiterProfile) {
      recruiterProfile = await prisma.recruiterProfile.create({
        data: {
          userId,
          companyName: '',
          companyWebsite: '',
          companySize: '1-50',
          industry: '',
          companyDescription: '',
          title: '',
          department: '',
          yearsOfExperience: 0,
          specializations: [],
          hiringRegions: [],
          activeJobs: 0,
          totalHires: 0,
          successRate: 0.0,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              location: true,
              linkedIn: true,
            },
          },
        },
      });
    }

    res.json(recruiterProfile);
  } catch (error: any) {
    console.error('Get recruiter profile error:', error);
    res.status(500).json({ error: 'Failed to fetch recruiter profile' });
  }
};

// Update recruiter profile
export const updateRecruiterProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      // Company Info
      companyName,
      companyWebsite,
      companySize,
      industry,
      companyDescription,
      // Recruiter Details
      title,
      department,
      yearsOfExperience,
      specializations,
      hiringRegions,
      // User Info
      firstName,
      lastName,
      phone,
      location,
      linkedIn,
    } = req.body;

    // Validation
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Update user info if provided
    if (firstName || lastName || phone || location || linkedIn) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(location !== undefined && { location }),
          ...(linkedIn !== undefined && { linkedIn }),
        },
      });
    }

    // Upsert recruiter profile
    const recruiterProfile = await prisma.recruiterProfile.upsert({
      where: { userId },
      update: {
        companyName,
        companyWebsite,
        companySize,
        industry,
        companyDescription,
        title,
        department,
        yearsOfExperience: yearsOfExperience || 0,
        specializations: specializations || [],
        hiringRegions: hiringRegions || [],
      },
      create: {
        userId,
        companyName,
        companyWebsite,
        companySize: companySize || '1-50',
        industry,
        companyDescription,
        title,
        department,
        yearsOfExperience: yearsOfExperience || 0,
        specializations: specializations || [],
        hiringRegions: hiringRegions || [],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            linkedIn: true,
          },
        },
      },
    });

    res.json(recruiterProfile);
  } catch (error: any) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({ error: 'Failed to update recruiter profile' });
  }
};

// Update recruiter stats (for system use)
export const updateRecruiterStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { activeJobs, totalHires, successRate } = req.body;

    const recruiterProfile = await prisma.recruiterProfile.update({
      where: { userId },
      data: {
        ...(activeJobs !== undefined && { activeJobs }),
        ...(totalHires !== undefined && { totalHires }),
        ...(successRate !== undefined && { successRate }),
      },
    });

    res.json(recruiterProfile);
  } catch (error: any) {
    console.error('Update recruiter stats error:', error);
    res.status(500).json({ error: 'Failed to update recruiter stats' });
  }
};
