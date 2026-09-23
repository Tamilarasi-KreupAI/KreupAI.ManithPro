import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../middleware/auth';

export const getCompanies = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(
      1,
      Number.parseInt(page as string, 10) || 1
    );

    const limitNum = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(limit as string, 10) || 20
      )
    );

    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search && String(search).trim()) {
      where.companyName = {
        contains: String(search).trim(),
        mode: 'insensitive',
      };
    }

    // Get paginated companies directly from the database
    const companies = await prisma.job.groupBy({
      by: [
        'companyName',
        'companyDescription',
        'companyWebsite',
        'companyLogo',
        'companySize',
        'companyIndustry',
      ],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        companyName: 'asc',
      },
      skip,
      take: limitNum,
    });

    // Get total number of unique company groups
    const allCompanies = await prisma.job.groupBy({
      by: [
        'companyName',
        'companyDescription',
        'companyWebsite',
        'companyLogo',
        'companySize',
        'companyIndustry',
      ],
      where,
    });

    const total = allCompanies.length;

    res.json({
      companies: companies.map((company) => ({
        companyName: company.companyName,
        companyDescription: company.companyDescription,
        companyWebsite: company.companyWebsite,
        companyLogo: company.companyLogo,
        companySize: company.companySize,
        companyIndustry: company.companyIndustry,
        jobCount: company._count.id,
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      error: 'Failed to fetch companies',
    });
  }
};

export const getCompanyByName = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.params;

    if (!name || !name.trim()) {
      res.status(400).json({
        error: 'Company name is required',
      });
      return;
    }

    const companyName = name.trim();

    // Case-insensitive company lookup
    const companyJob = await prisma.job.findFirst({
      where: {
        companyName: {
          equals: companyName,
          mode: 'insensitive',
        },
      },
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
      res.status(404).json({
        error: 'Company not found',
      });
      return;
    }

    const jobWhere = {
      companyName: {
        equals: companyJob.companyName,
        mode: 'insensitive' as const,
      },
    };

    const jobs = await prisma.job.findMany({
      where: jobWhere,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalJobs = await prisma.job.count({
      where: jobWhere,
    });

    const openJobs = jobs.filter(
      (job) => job.status === 'OPEN'
    ).length;

    res.json({
      company: {
        name: companyJob.companyName,
        description: companyJob.companyDescription,
        website: companyJob.companyWebsite,
        logo: companyJob.companyLogo,
        size: companyJob.companySize,
        industry: companyJob.companyIndustry,
        totalJobs,
        openJobs,
      },
      jobs,
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      error: 'Failed to fetch company details',
    });
  }
};