import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { sendJobMatchNotificationEmail } from '../utils/email';

const prisma = new PrismaClient();

export const createJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      type,
      salary,
      salaryMin,
      salaryMax,
      benefits,
      skills,
      experience,
      education,
      positions,
      deadline,
      status,
      companyName,
      companyDescription,
      companyWebsite,
      companyLogo,
      companySize,
      companyIndustry,
    } = req.body;

    if (!title || !description || !location || !type || !companyName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        location,
        type,
        salary,
        salaryMin,
        salaryMax,
        benefits: benefits || [],
        skills: skills || [],
        experience,
        education,
        positions: positions || 1,
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'OPEN',
        companyName,
        companyDescription,
        companyWebsite,
        companyLogo,
        companySize,
        companyIndustry,
        postedById: req.user.userId,
      },
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
    });

    // Send notifications to matching candidates
    if (job.status === 'OPEN' && skills && skills.length > 0) {
      try {
        // Find candidates with matching skills and enabled job alerts
        const candidates = await prisma.user.findMany({
  where: {
    role: 'CANDIDATE',
    skills: {
      hasSome: skills,
    },
    OR: [
      {
        notificationPreference: null,
      },
      {
        notificationPreference: {
          notificationsEnabled: true,
          jobAlerts: true,
          OR: [
            { unsubscribedAt: null },
            { unsubscribedAt: { gt: new Date() } },
          ],
        },
      },
    ],
  },
  take: 50,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
            notificationPreference: {
              select: {
                emailEnabled: true,
                inAppEnabled: true,
              },
            },
          },
        });

        const notificationPromises = candidates.map(async (candidate) => {
          const matchingSkills = candidate.skills.filter(
            (candidateSkill: string) =>
              skills.some(
                (jobSkill: string) =>
                  candidateSkill
                    .toLowerCase()
                    .includes(jobSkill.toLowerCase()) ||
                  jobSkill
                    .toLowerCase()
                    .includes(candidateSkill.toLowerCase())
              )
          );

          if (matchingSkills.length > 0) {
  // In-app notification
  if (
    !candidate.notificationPreference ||
    candidate.notificationPreference.inAppEnabled
  ) {
    await prisma.notification.create({
      data: {
        userId: candidate.id,
        type: 'JOB_POSTED',
        title: 'New job matching your skills',
        message: `${job.title} at ${job.companyName} matches your skills.`,
        link: `/jobs/${job.id}`,
      },
    });
  }

  // Email notification
  if (
    !candidate.notificationPreference ||
    candidate.notificationPreference.emailEnabled
  ) {
    const salaryDisplay =
      salary ||
      (salaryMin && salaryMax
        ? `$${salaryMin} - $${salaryMax}`
        : undefined);

    await sendJobMatchNotificationEmail(
      candidate.email,
      `${candidate.firstName} ${candidate.lastName}`,
      job.title,
      job.id,
      job.companyName,
      job.location,
      job.type,
      matchingSkills,
      salaryDisplay
    );
  }
}
        });

        const batchSize = 10;
let totalSuccess = 0;
let totalFailure = 0;

for (let i = 0; i < candidates.length; i += batchSize) {
  const batch = candidates.slice(i, i + batchSize);

  const notificationPromises = batch.map(async (candidate) => {
    const matchingSkills = candidate.skills.filter(
      (candidateSkill: string) =>
        skills.some(
          (jobSkill: string) =>
            candidateSkill
              .toLowerCase()
              .includes(jobSkill.toLowerCase()) ||
            jobSkill
              .toLowerCase()
              .includes(candidateSkill.toLowerCase())
        )
    );

    if (matchingSkills.length === 0) {
      return;
    }

    // In-app notification
    if (candidate.notificationPreference?.inAppEnabled) {
      await prisma.notification.create({
        data: {
          userId: candidate.id,
          type: 'JOB_POSTED',
          title: 'New job matching your skills',
          message: `${job.title} at ${job.companyName} matches your skills.`,
          link: `/jobs/${job.id}`,
        },
      });
    }

    // Email notification
    if (candidate.notificationPreference?.emailEnabled) {
      const salaryDisplay =
        salary ||
        (salaryMin && salaryMax
          ? `$${salaryMin} - $${salaryMax}`
          : undefined);

      await sendJobMatchNotificationEmail(
        candidate.email,
        `${candidate.firstName} ${candidate.lastName}`,
        job.title,
        job.id,
        job.companyName,
        job.location,
        job.type,
        matchingSkills,
        salaryDisplay
      );
    }
  });

  const results = await Promise.allSettled(
    notificationPromises
  );

  totalSuccess += results.filter(
    (result) => result.status === 'fulfilled'
  ).length;

  totalFailure += results.filter(
    (result) => result.status === 'rejected'
  ).length;
}

console.log(
  `Job match notifications sent: ${totalSuccess} successful, ${totalFailure} failed for job: ${job.title}`
);
      } catch (notificationError) {
        console.error(
          'Failed to send job match notifications:',
          notificationError
        );
      }
    }

    res.status(201).json({
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const getAllJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      status,
      type,
      location,
      search,
      skills,
      postedBy,
      page = '1',
      limit = '10',
      salaryMin,
      salaryMax,
      experience,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Validate pagination
    const pageNum = Math.max(
      1,
      parseInt(page as string, 10) || 1
    );

    const requestedLimit = parseInt(
      limit as string,
      10
    ) || 10;

    const limitNum = Math.min(
      100,
      Math.max(1, requestedLimit)
    );

    const skip = (pageNum - 1) * limitNum;

    // Validate sorting
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'title',
      'salaryMin',
      'salaryMax',
      'deadline',
    ];

    const validSortBy = allowedSortFields.includes(
      sortBy as string
    )
      ? (sortBy as string)
      : 'createdAt';

    const validSortOrder =
      sortOrder === 'asc' || sortOrder === 'desc'
        ? (sortOrder as 'asc' | 'desc')
        : 'desc';

    // Build filters
    const where: any = {};

    // Recruiter can filter their own jobs
    if (postedBy === 'me' && req.user) {
      where.postedById = req.user.userId;
    }

    // Status filter
    if (status) {
      const validStatuses = [
        'OPEN',
        'CLOSED',
        'DRAFT',
      ];

      if (validStatuses.includes(status as string)) {
        where.status = status;
      } else {
        res.status(400).json({
          error: 'Invalid job status',
        });
        return;
      }
    } else if (
      req.user?.role === 'CANDIDATE' &&
      postedBy !== 'me'
    ) {
      where.status = 'OPEN';
    }

    // Recruiters can only see their own jobs
    if (req.user?.role === 'RECRUITER') {
      where.postedById = req.user.userId;
    }

    // Job type filter
    if (type) {
      const validTypes = [
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'INTERNSHIP',
        'REMOTE',
      ];

      if (validTypes.includes(type as string)) {
        where.type = type;
      } else {
        res.status(400).json({
          error: 'Invalid job type',
        });
        return;
      }
    }

    // Location filter
    if (location) {
      where.location = {
        contains: location as string,
        mode: 'insensitive',
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          title: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = (skills as string)
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      if (skillsArray.length > 0) {
        where.skills = {
          hasSome: skillsArray,
        };
      }
    }

    // Salary filters
    const minSalary = salaryMin
      ? parseInt(salaryMin as string, 10)
      : undefined;

    const maxSalary = salaryMax
      ? parseInt(salaryMax as string, 10)
      : undefined;

    if (
      salaryMin &&
      (minSalary === undefined ||
        Number.isNaN(minSalary))
    ) {
      res.status(400).json({
        error: 'Invalid salaryMin',
      });
      return;
    }

    if (
      salaryMax &&
      (maxSalary === undefined ||
        Number.isNaN(maxSalary))
    ) {
      res.status(400).json({
        error: 'Invalid salaryMax',
      });
      return;
    }

    if (
      minSalary !== undefined &&
      maxSalary !== undefined &&
      minSalary > maxSalary
    ) {
      res.status(400).json({
        error:
          'salaryMin cannot be greater than salaryMax',
      });
      return;
    }

    if (
      minSalary !== undefined ||
      maxSalary !== undefined
    ) {
      where.AND = [
        ...(where.AND || []),
        ...(minSalary !== undefined
          ? [{ salaryMax: { gte: minSalary } }]
          : []),
        ...(maxSalary !== undefined
          ? [{ salaryMin: { lte: maxSalary } }]
          : []),
      ];
    }

    // Experience filter
    if (experience) {
      where.experience = {
        contains: experience as string,
        mode: 'insensitive',
      };
    }

    // Fetch jobs and total count
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          postedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          [validSortBy]: validSortOrder,
        },
        skip,
        take: limitNum,
      }),

      prisma.job.count({
        where,
      }),
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(
          total / limitNum
        ),
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);

    res.status(500).json({
      error: 'Failed to fetch jobs',
    });
  }
};

export const getJobById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                skills: true,
                experience: true,
              },
            },
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({
        error: 'Job not found',
      });
      return;
    }

    // Hide applications from candidates
    if (req.user?.role === 'CANDIDATE') {
      const {
        applications,
        ...jobWithoutApplications
      } = job;

      res.json(jobWithoutApplications);
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);

    res.status(500).json({
      error: 'Failed to fetch job',
    });
  }
};

export const updateJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;

    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      res.status(404).json({
        error: 'Job not found',
      });
      return;
    }

    if (
      existingJob.postedById !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      res.status(403).json({
        error: 'Not authorized to update this job',
      });
      return;
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      type,
      salary,
      salaryMin,
      salaryMax,
      benefits,
      skills,
      experience,
      education,
      positions,
      deadline,
      status,
      companyName,
      companyDescription,
      companyWebsite,
      companyLogo,
      companySize,
      companyIndustry,
    } = req.body;

    if (
      title !== undefined &&
      !String(title).trim()
    ) {
      res.status(400).json({
        error: 'Job title cannot be empty',
      });
      return;
    }

    if (
      description !== undefined &&
      !String(description).trim()
    ) {
      res.status(400).json({
        error: 'Job description cannot be empty',
      });
      return;
    }

    if (
      location !== undefined &&
      !String(location).trim()
    ) {
      res.status(400).json({
        error: 'Location cannot be empty',
      });
      return;
    }

    if (
      companyName !== undefined &&
      !String(companyName).trim()
    ) {
      res.status(400).json({
        error: 'Company name cannot be empty',
      });
      return;
    }

    const validJobTypes = [
      'FULL_TIME',
      'PART_TIME',
      'CONTRACT',
      'INTERNSHIP',
      'REMOTE',
    ];

    if (
      type !== undefined &&
      !validJobTypes.includes(type)
    ) {
      res.status(400).json({
        error: 'Invalid job type',
      });
      return;
    }

    const validStatuses = [
      'OPEN',
      'CLOSED',
      'DRAFT',
    ];

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      res.status(400).json({
        error: 'Invalid job status',
      });
      return;
    }

    const parsedSalaryMin =
      salaryMin === undefined ||
      salaryMin === ''
        ? undefined
        : Number(salaryMin);

    const parsedSalaryMax =
      salaryMax === undefined ||
      salaryMax === ''
        ? undefined
        : Number(salaryMax);

    if (
      parsedSalaryMin !== undefined &&
      (!Number.isInteger(parsedSalaryMin) ||
        parsedSalaryMin < 0)
    ) {
      res.status(400).json({
        error: 'Invalid minimum salary',
      });
      return;
    }

    if (
      parsedSalaryMax !== undefined &&
      (!Number.isInteger(parsedSalaryMax) ||
        parsedSalaryMax < 0)
    ) {
      res.status(400).json({
        error: 'Invalid maximum salary',
      });
      return;
    }

    if (
      parsedSalaryMin !== undefined &&
      parsedSalaryMax !== undefined &&
      parsedSalaryMin > parsedSalaryMax
    ) {
      res.status(400).json({
        error:
          'Minimum salary cannot be greater than maximum salary',
      });
      return;
    }

    if (
      positions !== undefined &&
      (!Number.isInteger(Number(positions)) ||
        Number(positions) < 1)
    ) {
      res.status(400).json({
        error:
          'Positions must be a positive integer',
      });
      return;
    }

    let parsedDeadline:
      | Date
      | null
      | undefined;

    if (deadline !== undefined) {
      if (!deadline) {
        parsedDeadline = null;
      } else {
        parsedDeadline = new Date(deadline);

        if (
          Number.isNaN(
            parsedDeadline.getTime()
          )
        ) {
          res.status(400).json({
            error: 'Invalid deadline',
          });
          return;
        }
      }
    }

    // Explicit allowlist prevents mass assignment
    const updateData: any = {};

    if (title !== undefined)
      updateData.title =
        String(title).trim();

    if (description !== undefined)
      updateData.description =
        String(description).trim();

    if (requirements !== undefined)
      updateData.requirements = requirements;

    if (responsibilities !== undefined)
      updateData.responsibilities =
        responsibilities;

    if (location !== undefined)
      updateData.location =
        String(location).trim();

    if (type !== undefined)
      updateData.type = type;

    if (salary !== undefined)
      updateData.salary = salary;

    if (salaryMin !== undefined)
      updateData.salaryMin =
        parsedSalaryMin;

    if (salaryMax !== undefined)
      updateData.salaryMax =
        parsedSalaryMax;

    if (benefits !== undefined)
      updateData.benefits = benefits;

    if (skills !== undefined)
      updateData.skills = skills;

    if (experience !== undefined)
      updateData.experience = experience;

    if (education !== undefined)
      updateData.education = education;

    if (positions !== undefined)
      updateData.positions =
        Number(positions);

    if (deadline !== undefined)
      updateData.deadline =
        parsedDeadline;

    if (status !== undefined)
      updateData.status = status;

    if (companyName !== undefined)
      updateData.companyName =
        String(companyName).trim();

    if (companyDescription !== undefined)
      updateData.companyDescription =
        companyDescription;

    if (companyWebsite !== undefined)
      updateData.companyWebsite =
        companyWebsite;

    if (companyLogo !== undefined)
      updateData.companyLogo =
        companyLogo;

    if (companySize !== undefined)
      updateData.companySize =
        companySize;

    if (companyIndustry !== undefined)
      updateData.companyIndustry =
        companyIndustry;

    const updatedJob =
      await prisma.job.update({
        where: { id },
        data: updateData,
        include: {
          postedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

    res.json({
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error(
      'Update job error:',
      error
    );

    res.status(500).json({
      error: 'Failed to update job',
    });
  }
};

export const deleteJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;

    // Check if job exists
    const existingJob =
      await prisma.job.findUnique({
        where: { id },
      });

    if (!existingJob) {
      res.status(404).json({
        error: 'Job not found',
      });
      return;
    }

    // Check ownership
    if (
      existingJob.postedById !==
        req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      res.status(403).json({
        error:
          'Not authorized to delete this job',
      });
      return;
    }

    // Close the job instead of permanently deleting it
    await prisma.job.update({
      where: { id },
      data: {
        status: 'CLOSED',
      },
    });

    res.json({
      message: 'Job closed successfully',
    });
  } catch (error) {
    console.error(
      'Delete job error:',
      error
    );

    res.status(500).json({
      error: 'Failed to delete job',
    });
  }
};