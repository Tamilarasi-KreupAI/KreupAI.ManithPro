import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get unique companies with their job count
    const where: any = {};
    if (search) {
      where.companyName = { contains: search as string, mode: 'insensitive' };
    }

    const companies = await prisma.job.groupBy({
      by: ['companyName', 'companyDescription', 'companyWebsite', 'companyLogo', 'companySize', 'companyIndustry'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    });

    // For pagination, we'll slice the array
    const total = companies.length;
    const paginatedCompanies = companies.slice(skip, skip + limitNum);

    res.json({
      companies: paginatedCompanies,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

export const getCompanyByName = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.params;

    // Get company info from the first job with this company name
    const companyJob = await prisma.job.findFirst({
      where: { companyName: name },
      select: {
        companyName: true,
        companyDescription: true,
        companyWebsite: true,
        companyLogo: true,
        companySize: true,
        companyIndustry: true,
      },
    });

    if (!companyJob) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Get all jobs for this company
    const [jobs, totalJobs] = await Promise.all([
      prisma.job.findMany({
        where: {
          companyName: name,
          status: req.user?.role === 'CANDIDATE' ? 'OPEN' : undefined,
        },
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({
        where: {
          companyName: name,
          status: 'OPEN',
        },
      }),
    ]);

    res.json({
      company: {
        name: companyJob.companyName,
        description: companyJob.companyDescription,
        website: companyJob.companyWebsite,
        logo: companyJob.companyLogo,
        size: companyJob.companySize,
        industry: companyJob.companyIndustry,
        totalJobs,
        openJobs: jobs.filter(j => j.status === 'OPEN').length,
      },
      jobs,
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};
