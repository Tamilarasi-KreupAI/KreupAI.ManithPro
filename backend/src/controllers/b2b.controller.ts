import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { isValidSubmissionTransition } from '../utils/b2bSubmissionWorkflow';
import { createNotification } from './notification.controller';
import { resumeUpload, validateFileSignature, handleUploadError } from '../utils/upload';
import { getPaginationParams, createPaginatedResult } from '../database/prisma';

// WS14-T07: Re-export upload middleware for use in b2b routes
export const candidateResumeUpload = resumeUpload;
export { validateFileSignature as validateCandidateResumeSignature, handleUploadError as handleCandidateUploadError };

// WS14-T07: CSV upload multer instance (memory storage, no disk I/O for CSV)
import multer from 'multer';
export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max for CSV
  fileFilter: (_req, file, cb) => {
    // Accept only CSV (text/csv or application/vnd.ms-excel when browser sends CSV)
    const allowedMimes = ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) || ext === '.csv') {
      cb(null, true);
    } else {
      const err: any = new Error('Only CSV files are accepted for bulk upload');
      err.status = 400;
      cb(err);
    }
  },
});

const prisma = new PrismaClient();

// ============================================================
// WS14-T06: Candidate Validation Helpers
// ============================================================

/** Basic RFC-5322 inspired email check */
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/**
 * Phone validation: optional field.
 * Accepts digits, spaces, dashes, dots, parentheses, leading + sign.
 * Minimum 7 digits after stripping non-numeric characters.
 */
const isValidPhone = (phone: string): boolean => {
  const stripped = phone.replace(/[^\d]/g, '');
  return stripped.length >= 7 && stripped.length <= 15 && /^[+\d][\d\s().\-]*$/.test(phone.trim());
};

/** Experience must be a non-negative integer <= 60 */
const isValidExperience = (value: unknown): boolean => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 60;
};

import { AuthRequest } from '../middleware/auth';
export const getClientDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const activeRequirementsCount = await prisma.b2BRequirement.count({
      where: { clientId: userId, status: 'OPEN' }
    });

    const pendingContractsCount = await prisma.b2BContract.count({
      where: { clientId: userId, status: 'PENDING' }
    });

    const activeContractsCount = await prisma.b2BContract.count({
      where: { clientId: userId, status: 'ACTIVE' }
    });

    // Submissions to client's requirements
    const pendingSubmissionsCount = await prisma.b2BPlacement.count({
      where: { clientId: userId, status: 'SUBMITTED' }
    });
    const shortlistedCount = await prisma.b2BPlacement.count({
      where: { clientId: userId, status: 'SHORTLISTED' }
    });
    const placedCount = await prisma.b2BPlacement.count({
      where: { clientId: userId, status: 'PLACED' }
    });

    res.json([
      {
        name: 'Active Requirements',
        value: activeRequirementsCount,
        change: 'Open positions',
        changeType: 'neutral',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      },
      {
        name: 'Candidate Submissions',
        value: pendingSubmissionsCount + shortlistedCount,
        change: `${pendingSubmissionsCount} to review, ${shortlistedCount} shortlisted`,
        changeType: pendingSubmissionsCount > 0 ? 'warning' : 'neutral',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      {
        name: 'Placements',
        value: placedCount,
        change: 'Confirmed hires',
        changeType: placedCount > 0 ? 'increase' : 'neutral',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      },
      {
        name: 'Active Contracts',
        value: activeContractsCount,
        change: 'Approved',
        changeType: 'increase',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      },
    ]);
  } catch (error) {
    console.error('Client dashboard error:', error);
    res.status(500).json({ error: 'Failed to load client dashboard stats' });
  }
};

export const getVendorDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    let pendingContractsCount = 0;
    let activeContractsCount = 0;
    let candidatesCount = 0;
    let submittedCount = 0;
    let shortlistedCount = 0;
    let placedCount = 0;

    // At most 2 database query operations via Promise.all (placements groupBy + contracts groupBy & candidate count)
    const [placementGroup, contractGroupAndCandidates] = await Promise.all([
      prisma.b2BPlacement.groupBy
        ? prisma.b2BPlacement.groupBy({
            by: ['status'],
            where: { vendorId: userId },
            _count: { _all: true },
          })
        : Promise.resolve([]),
      Promise.all([
        prisma.b2BContract.groupBy
          ? prisma.b2BContract.groupBy({
              by: ['status'],
              where: { vendorId: userId },
              _count: { _all: true },
            })
          : Promise.resolve([]),
        prisma.b2BCandidate.count({ where: { vendorId: userId } }),
      ]),
    ]);

    const placementList = Array.isArray(placementGroup) ? placementGroup : [];
    const contractList = Array.isArray(contractGroupAndCandidates[0]) ? contractGroupAndCandidates[0] : [];
    candidatesCount = contractGroupAndCandidates[1] || 0;

    const placementMap = new Map(placementList.map((p) => [p.status, p._count?._all || p._count || 0]));
    const contractMap = new Map(contractList.map((c) => [c.status, c._count?._all || c._count || 0]));

    submittedCount = placementMap.get('SUBMITTED') || 0;
    shortlistedCount = placementMap.get('SHORTLISTED') || 0;
    placedCount = placementMap.get('PLACED') || 0;
    pendingContractsCount = contractMap.get('PENDING') || 0;
    activeContractsCount = contractMap.get('ACTIVE') || 0;

    const totalSubmissions = submittedCount + shortlistedCount + placedCount;

    res.json([
      {
        name: 'Submissions',
        value: totalSubmissions,
        change: `${shortlistedCount} shortlisted, ${placedCount} placed`,
        changeType: shortlistedCount > 0 ? 'increase' : 'neutral',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      {
        name: 'Pending Contracts',
        value: pendingContractsCount,
        change: 'Needs your approval',
        changeType: pendingContractsCount > 0 ? 'warning' : 'neutral',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      },
      {
        name: 'Active Contracts',
        value: activeContractsCount,
        change: 'Approved',
        changeType: 'increase',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      },
      {
        name: 'Candidates',
        value: candidatesCount,
        change: 'In talent pool',
        changeType: 'neutral',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      },
    ]);
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    res.status(500).json({ error: 'Failed to load vendor dashboard stats' });
  }
};

export const getRecentRequirements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = Number(req.query.limit) || 3;

    const data = await prisma.b2BRequirement.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        requiredCount: true,
        proposalsCount: true,
      }
    });

    // Get actual submission counts for these requirements
    const requirementIds = data.map((r) => r.id);
    const submissionCounts = await prisma.b2BPlacement.groupBy({
      by: ['requirementId'],
      where: { requirementId: { in: requirementIds } },
      _count: true,
    });
    const countMap = new Map(submissionCounts.map((sc) => [sc.requirementId, sc._count]));

    res.json(
      data.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        count: r.requiredCount,
        applicants: countMap.get(r.id) || r.proposalsCount,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recent requirements' });
  }
};

export const getRecentPlacements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = Number(req.query.limit) || 3;

    const submissions = await prisma.b2BPlacement.findMany({
      where: { vendorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get candidate names and requirement info
    const candidateIds = submissions.map((s) => s.candidateId);
    const requirementIds = [...new Set(submissions.map((s) => s.requirementId))];

    const [candidates, requirements] = await Promise.all([
      prisma.b2BCandidate.findMany({
        where: { id: { in: candidateIds } },
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.b2BRequirement.findMany({
        where: { id: { in: requirementIds } },
        select: { id: true, title: true },
      }),
    ]);

    const candidateMap = new Map(candidates.map((c) => [c.id, `${c.firstName} ${c.lastName}`]));
    const requirementMap = new Map<string, string>(requirements.map((r) => [r.id, r.title] as [string, string]));

    // Count submissions per status for each requirement
    const submissionCounts = await prisma.b2BPlacement.groupBy({
      by: ['requirementId', 'status'],
      where: { vendorId: userId, requirementId: { in: requirementIds } },
      _count: true,
    });

    res.json(
      submissions.map((p) => {
        const placedCount = submissionCounts
          .filter((sc) => sc.requirementId === p.requirementId && sc.status === 'PLACED')
          .reduce((sum, sc) => sum + sc._count, 0);
        const submittedCount = submissionCounts
          .filter((sc) => sc.requirementId === p.requirementId)
          .reduce((sum, sc) => sum + sc._count, 0);

        return {
          id: p.id,
          title: requirementMap.get(p.requirementId) || p.title,
          candidateName: candidateMap.get(p.candidateId) || 'Unknown',
          status: p.status,
          count: placedCount,
          applicants: submittedCount,
          submittedAt: p.submittedAt,
        };
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recent placements' });
  }
};
export const getPendingContracts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = Number(req.query.limit) || 2;

    const data = await prisma.b2BContract.findMany({
      where: {
        OR: [
          { clientId: userId },
          { vendorId: userId }
        ],
        status: { in: ['PENDING', 'NEGOTIATION'] }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        partnerName: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    res.json(
      data.map((c) => ({
        id: c.id,
        partner: c.partnerName,
        role: c.role,
        status: c.status,
        date: c.createdAt,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending contracts' });
  }
};
export const createRequirement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const {
      title,
      description,
      workMode,
      location,
      employmentType,
      duration,
      primarySkills,
      secondarySkills,
      minExperience,
      maxExperience,
      qualification,
      budget,
      currency,
      frequency,
      noticePeriod,
      count,
    } = req.body;

    if (!title || !description || !primarySkills || !count) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure skills are arrays
    const primarySkillsArray = Array.isArray(primarySkills) ? primarySkills : [primarySkills];
    const secondarySkillsArray = secondarySkills
      ? (Array.isArray(secondarySkills) ? secondarySkills : [secondarySkills])
      : [];

    const result = await prisma.b2BRequirement.create({
      data: {
        clientId: userId,
        title,
        description,
        workMode: workMode || 'Remote',
        location: location || 'Flexible',
        employmentType: employmentType || 'Contract',
        duration: duration || '6 months',
        primarySkills: primarySkillsArray,
        secondarySkills: secondarySkillsArray,
        minExperience: parseInt(minExperience) || 0,
        maxExperience: parseInt(maxExperience) || 10,
        qualification: qualification || 'Bachelor',
        budget: parseFloat(budget) || 0,
        currency: currency || 'USD',
        frequency: frequency || 'Hourly',
        noticePeriod: noticePeriod || '2 weeks',
        status: 'OPEN',
        requiredCount: parseInt(count) || 1,
        proposalsCount: 0,
        skills: primarySkillsArray,
      }
    });

    res.status(201).json({
      message: 'Requirement created successfully',
      requirementId: result.id,
    });
  } catch (error) {
    console.error('Create requirement error:', error);
    res.status(500).json({ error: 'Failed to create requirement' });
  }
};

export const getRequirementById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const requirement = await prisma.b2BRequirement.findFirst({
      where: {
        id,
        clientId: userId
      }
    });

    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json({
      id: requirement.id,
      title: requirement.title,
      description: requirement.description,
      workMode: requirement.workMode,
      location: requirement.location,
      employmentType: requirement.employmentType,
      duration: requirement.duration,
      primarySkills: requirement.primarySkills || [],
      secondarySkills: requirement.secondarySkills || [],
      minExperience: requirement.minExperience,
      maxExperience: requirement.maxExperience,
      qualification: requirement.qualification,
      budget: requirement.budget,
      currency: requirement.currency,
      frequency: requirement.frequency,
      noticePeriod: requirement.noticePeriod,
      count: requirement.requiredCount,
      filled: requirement.proposalsCount,
      status: requirement.status,
      postedAt: requirement.createdAt,
    });
  } catch (error) {
    console.error('Get requirement error:', error);
    res.status(500).json({ error: 'Failed to fetch requirement' });
  }
};

export const updateRequirement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const {
      title,
      description,
      workMode,
      location,
      employmentType,
      duration,
      primarySkills,
      secondarySkills,
      minExperience,
      maxExperience,
      qualification,
      budget,
      currency,
      frequency,
      noticePeriod,
      count,
      status,
    } = req.body;

    // Verify ownership
    const existing = await prisma.b2BRequirement.findFirst({
      where: { id, clientId: userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Requirement not found or unauthorized' });
    }

    // Ensure skills are arrays
    const primarySkillsArray = primarySkills
      ? (Array.isArray(primarySkills) ? primarySkills : [primarySkills])
      : [];
    const secondarySkillsArray = secondarySkills
      ? (Array.isArray(secondarySkills) ? secondarySkills : [secondarySkills])
      : [];

    await prisma.b2BRequirement.update({
      where: { id },
      data: {
        title,
        description,
        workMode,
        location,
        employmentType,
        duration,
        primarySkills: primarySkillsArray,
        secondarySkills: secondarySkillsArray,
        minExperience: parseInt(minExperience) || 0,
        maxExperience: parseInt(maxExperience) || 10,
        qualification,
        budget: parseFloat(budget) || 0,
        currency,
        frequency,
        noticePeriod,
        requiredCount: parseInt(count) || 1,
        status: status || 'OPEN',
        skills: primarySkillsArray,
      }
    });

    res.json({ message: 'Requirement updated successfully' });
  } catch (error) {
    console.error('Update requirement error:', error);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
};

export const deleteRequirement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.b2BRequirement.findFirst({
      where: { id, clientId: userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Requirement not found or unauthorized' });
    }

    await prisma.b2BRequirement.delete({
      where: { id }
    });

    res.json({ message: 'Requirement deleted successfully' });
  } catch (error) {
    console.error('Delete requirement error:', error);
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
};

export const getAllRequirements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const data = await prisma.b2BRequirement.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' }
    });

    // Get actual PLACED counts for all requirements (filled positions)
    const requirementIds = data.map((r) => r.id);
    const placedCounts = await prisma.b2BPlacement.groupBy({
      by: ['requirementId'],
      where: { requirementId: { in: requirementIds }, status: 'PLACED' },
      _count: true,
    });
    const filledMap = new Map(placedCounts.map((pc) => [pc.requirementId, pc._count]));

    // Auto-close any requirements that are fully filled but still OPEN
    const requirementsToClose = data.filter((r) => {
      const filled = filledMap.get(r.id) || 0;
      return r.status === 'OPEN' && filled >= r.requiredCount;
    });

    if (requirementsToClose.length > 0) {
      await prisma.b2BRequirement.updateMany({
        where: { id: { in: requirementsToClose.map((r) => r.id) } },
        data: { status: 'CLOSED' },
      });
      // Update status in data for response
      requirementsToClose.forEach((r) => {
        r.status = 'CLOSED';
      });
    }

    res.json(
      data.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        workMode: r.workMode,
        location: r.location,
        employmentType: r.employmentType,
        duration: r.duration,
        skills: r.primarySkills || [],
        secondarySkills: r.secondarySkills || [],
        minExperience: r.minExperience,
        maxExperience: r.maxExperience,
        qualification: r.qualification,
        budget: r.budget ? `${r.currency} ${Number(r.budget).toFixed(2)}` : '—',
        currency: r.currency,
        frequency: r.frequency,
        noticePeriod: r.noticePeriod,
        count: r.requiredCount,
        filled: filledMap.get(r.id) || 0,
        status: r.status,
        postedAt: r.createdAt,
      }))
    );
  } catch (error) {
    console.error('Fetch requirements error:', error);
    res.status(500).json({ error: 'Failed to fetch requirements' });
  }
};
export const getAllContracts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const contracts = await prisma.b2BContract.findMany({
      where: {
        OR: [
          { clientId: userId },
          { vendorId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      contracts.map((c) => ({
        id: c.id,
        partner: c.partnerName,
        candidate: '—',
        role: c.role,
        terms: c.terms || '—',
        startDate: c.startDate || '—',
        duration: '—',
        rate: '—',
        status: c.status,
        signedAt: c.createdAt,
        isVendor: c.vendorId === userId,
        isClient: c.clientId === userId,
      }))
    );
  } catch (error) {
    console.error('Fetch contracts error:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
};

export const viewContract = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const contract = await prisma.b2BContract.findFirst({
      where: {
        id,
        OR: [
          { clientId: userId },
          { vendorId: userId },
        ],
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({
      id: contract.id,
      partner: contract.partnerName,
      role: contract.role,
      status: contract.status,
      content: `
        CONTRACT AGREEMENT

        Partner: ${contract.partnerName}
        Role: ${contract.role}
        Status: ${contract.status}

        This agreement is made between the client and vendor
        for providing staffing services as agreed.
      `,
      createdAt: contract.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load contract' });
  }
};

export const downloadContract = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const contract = await prisma.b2BContract.findFirst({
      where: {
        id,
        OR: [
          { clientId: userId },
          { vendorId: userId },
        ],
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const fileContent = `
CONTRACT AGREEMENT

Partner: ${contract.partnerName}
Role: ${contract.role}
Status: ${contract.status}

Signed on: ${contract.createdAt}

This document serves as a formal agreement.
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=contract-${contract.id}.txt`);

    res.send(fileContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to download contract' });
  }
};
export const createDraftContract = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { partnerName, role, vendorId, terms } = req.body;

    if (!partnerName || !role || !vendorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 🔐 VERIFY VENDOR EXISTS & ROLE IS VENDOR
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { id: true, role: true },
    });

    if (!vendor) {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    if (vendor.role !== 'VENDOR') {
      return res.status(400).json({ error: 'User is not a vendor' });
    }

    // ✅ Create contract using Prisma ORM
    const contract = await prisma.b2BContract.create({
      data: {
        partnerName,
        role,
        terms: terms || null,
        status: 'PENDING',
        clientId: userId,
        vendorId,
      },
    });

    res.status(201).json({
      message: 'Draft contract created',
      contractId: contract.id,
    });
  } catch (error) {
    console.error('Create draft contract error:', error);
    res.status(500).json({ error: 'Failed to create draft contract' });
  }
};

export const updateContractStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'ACTIVE', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find contract and verify user is involved
    const contract = await prisma.b2BContract.findFirst({
      where: {
        id,
        OR: [
          { clientId: userId },
          { vendorId: userId },
        ],
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Only vendor can approve/reject pending contracts
    if (contract.status === 'PENDING' && (status === 'ACTIVE' || status === 'REJECTED')) {
      if (contract.vendorId !== userId) {
        return res.status(403).json({ error: 'Only the vendor can approve or reject this contract' });
      }
    }

    // Only client can cancel contracts
    if (status === 'CANCELLED' && contract.clientId !== userId) {
      return res.status(403).json({ error: 'Only the client can cancel this contract' });
    }

    await prisma.b2BContract.update({
      where: { id },
      data: { status },
    });
const notifyUserId = contract.clientId === userId
      ? contract.vendorId
      : contract.clientId;

    await createNotification(
      notifyUserId,
      'B2B_CONTRACT_UPDATED',
      'Contract Status Updated',
      `Your B2B contract status has been changed to ${status.toLowerCase()}.`,
      '/b2b/contracts'
    );

    res.json({ message: `Contract ${status.toLowerCase()}` });
  } catch (error) {
    console.error('Update contract status error:', error);
    res.status(500).json({ error: 'Failed to update contract status' });
  }
};

export const getVendorCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const rawPage = req.query.page as string | undefined;
    const rawPageSize = req.query.pageSize as string | undefined;
    const page = rawPage ? Number(rawPage) : 1;
    const pageSize = rawPageSize ? Number(rawPageSize) : 20;
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '').trim();
    const skill = String(req.query.skill || '').trim();

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const pagination = getPaginationParams({ page, pageSize, maxPageSize: 50 });
    const where: any = { vendorId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (skill) where.skills = { has: skill };

    const [candidates, totalItems] = await Promise.all([
      prisma.b2BCandidate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.b2BCandidate.count({ where }),
    ]);

    const items = candidates.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      experience: c.experience,
      skills: c.skills || [],
      status: c.status,
      resumeUrl: c.resumeUrl,
    }));

    res.json(createPaginatedResult(items, totalItems, pagination.page, pagination.pageSize));
  } catch (error) {
    console.error('Fetch candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

export const addCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const { firstName, lastName, email, phone, skills, experience, resumeUrl } = req.body;

    // Required field validation
    const trimmedFirst = (firstName || '').trim();
    const trimmedLast = (lastName || '').trim();
    const trimmedEmail = (email || '').trim();

    if (!trimmedFirst || !trimmedLast || !trimmedEmail) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    // Email format validation
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Phone validation (only when provided)
    const trimmedPhone = phone ? (phone as string).trim() : null;
    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Experience validation (only when provided)
    if (experience !== undefined && experience !== null && experience !== '') {
      if (!isValidExperience(experience)) {
        return res.status(400).json({ error: 'Experience must be a whole number between 0 and 60' });
      }
    }

    // Duplicate email check for same vendor (case-insensitive)
    const duplicate = await prisma.b2BCandidate.findFirst({
      where: {
        vendorId,
        email: { equals: trimmedEmail, mode: 'insensitive' },
      },
    });
    if (duplicate) {
      return res.status(409).json({ error: 'A candidate with this email already exists in your talent pool' });
    }

    const candidate = await prisma.b2BCandidate.create({
      data: {
        vendorId,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail.toLowerCase(),
        phone: trimmedPhone || null,
        skills: Array.isArray(skills) ? skills.map((s: string) => s.trim()).filter(Boolean) : (skills ? [(skills as string).trim()] : []),
        experience: (experience !== undefined && experience !== null && experience !== '') ? parseInt(experience as string, 10) : null,
        resumeUrl: resumeUrl ? (resumeUrl as string).trim() || null : null,
        status: 'AVAILABLE',
      },
    });

    res.status(201).json({
      message: 'Candidate added',
      candidateId: candidate.id,
    });
  } catch (error: any) {
    // Handle Prisma unique constraint violation as a fallback
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'A candidate with this email already exists in your talent pool' });
    }
    console.error('Add candidate error:', error);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
};
// ============================================================
// WS14-T07: Upload Candidate Resume (POST /candidates/:id/resume)
// ============================================================
export const uploadCandidateResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user!.userId;
    const { id } = req.params;

    // Verify candidate exists and belongs to this vendor
    const candidate = await prisma.b2BCandidate.findFirst({
      where: { id, vendorId },
    });

    if (!candidate) {
      // If a file was uploaded before the ownership check, clean it up
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
      }
      // Return 404 if not found, 403 handled below for wrong vendor
      // Note: findFirst with vendorId already covers both cases
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded' });
      return;
    }

    // Delete old resume file if one exists
    if (candidate.resumeUrl) {
      const oldFilename = path.basename(candidate.resumeUrl);
      const STORAGE_ROOT = process.env.UPLOAD_STORAGE_ROOT || path.join(__dirname, '../../uploads');
      const oldPath = path.join(STORAGE_ROOT, 'resumes', oldFilename);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (e) {
        console.error('[b2b] Failed to delete old resume:', e);
      }
    }

    // Store only the relative path — never expose the full server path
    const storedPath = `/uploads/resumes/${req.file.filename}`;

    await prisma.b2BCandidate.update({
      where: { id },
      data: { resumeUrl: storedPath },
    });

    res.status(200).json({
      message: 'Resume uploaded successfully',
      resumeUrl: storedPath,
    });
  } catch (error) {
    console.error('Upload candidate resume error:', error);
    // Clean up the uploaded file on error
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
    }
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};

// ============================================================
// WS14-T07: Download Candidate Resume (GET /candidates/:id/resume)
// ============================================================
export const downloadCandidateResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user!.userId;
    const { id } = req.params;

    // Verify candidate exists AND belongs to this vendor (prevents cross-vendor access)
    const candidate = await prisma.b2BCandidate.findFirst({
      where: { id, vendorId },
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    if (!candidate.resumeUrl) {
      res.status(404).json({ error: 'No resume has been uploaded for this candidate' });
      return;
    }

    // Safely resolve file path — use only the filename component to prevent path traversal
    const filename = path.basename(candidate.resumeUrl);
    const STORAGE_ROOT = process.env.UPLOAD_STORAGE_ROOT || path.join(__dirname, '../../uploads');
    const filePath = path.join(STORAGE_ROOT, 'resumes', filename);

    // Verify the resolved path stays within the expected directory
    const resumesDir = path.join(STORAGE_ROOT, 'resumes');
    if (!filePath.startsWith(resumesDir)) {
      console.error('[b2b] Path traversal attempt blocked:', filePath);
      res.status(400).json({ error: 'Invalid file path' });
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Resume file not found on server' });
      return;
    }

    // Use a safe, non-identifying download filename
    const downloadName = `candidate-${id}-resume${path.extname(filename)}`;
    res.download(filePath, downloadName, (err) => {
      if (err && !res.headersSent) {
        console.error('[b2b] Resume download error:', err);
        res.status(500).json({ error: 'Failed to download resume' });
      }
    });
  } catch (error) {
    console.error('Download candidate resume error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download resume' });
    }
  }
};
export const getCandidateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const { id } = req.params;

    const candidate = await prisma.b2BCandidate.findFirst({
      where: { id, vendorId },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      experience: candidate.experience,
      skills: candidate.skills || [],
      status: candidate.status,
      resumeUrl: candidate.resumeUrl,
      createdAt: candidate.createdAt,
    });
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate profile' });
  }
};

// ============================================================
// WS14-T06: Update Candidate (PUT /candidates/:id)
// ============================================================
export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const { id } = req.params;
    const { firstName, lastName, email, phone, skills, experience, resumeUrl } = req.body;

    // Verify candidate belongs to this vendor
    const existing = await prisma.b2BCandidate.findFirst({
      where: { id, vendorId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Build validated update data
    const updateData: Record<string, unknown> = {};

    if (firstName !== undefined) {
      const trimmed = (firstName as string).trim();
      if (!trimmed) return res.status(400).json({ error: 'First name cannot be empty' });
      updateData.firstName = trimmed;
    }

    if (lastName !== undefined) {
      const trimmed = (lastName as string).trim();
      if (!trimmed) return res.status(400).json({ error: 'Last name cannot be empty' });
      updateData.lastName = trimmed;
    }

    if (email !== undefined) {
      const trimmed = (email as string).trim();
      if (!trimmed) return res.status(400).json({ error: 'Email cannot be empty' });
      if (!isValidEmail(trimmed)) return res.status(400).json({ error: 'Invalid email address' });

      const normalised = trimmed.toLowerCase();
      // Only check duplicate if email is actually changing
      if (normalised !== existing.email.toLowerCase()) {
        const duplicate = await prisma.b2BCandidate.findFirst({
          where: {
            vendorId,
            email: { equals: normalised, mode: 'insensitive' },
            id: { not: id },
          },
        });
        if (duplicate) {
          return res.status(409).json({ error: 'A candidate with this email already exists in your talent pool' });
        }
      }
      updateData.email = normalised;
    }

    if (phone !== undefined) {
      const trimmed = phone ? (phone as string).trim() : null;
      if (trimmed && !isValidPhone(trimmed)) {
        return res.status(400).json({ error: 'Invalid phone number' });
      }
      updateData.phone = trimmed || null;
    }

    if (experience !== undefined) {
      if (experience === null || experience === '') {
        updateData.experience = null;
      } else {
        if (!isValidExperience(experience)) {
          return res.status(400).json({ error: 'Experience must be a whole number between 0 and 60' });
        }
        updateData.experience = parseInt(experience as string, 10);
      }
    }

    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills)
        ? skills.map((s: string) => s.trim()).filter(Boolean)
        : skills ? [(skills as string).trim()] : [];
    }

    if (resumeUrl !== undefined) {
      updateData.resumeUrl = resumeUrl ? (resumeUrl as string).trim() || null : null;
    }

    // Prevent changing vendorId ownership
    delete updateData.vendorId;
    delete updateData.id;

    const updated = await prisma.b2BCandidate.update({
      where: { id },
      data: updateData as any,
    });

    res.json({
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      experience: updated.experience,
      skills: updated.skills || [],
      status: updated.status,
      resumeUrl: updated.resumeUrl,
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'A candidate with this email already exists in your talent pool' });
    }
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
};

// ============================================================
// WS14-T06: Delete Candidate (DELETE /candidates/:id)
// ============================================================
export const deleteCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const { id } = req.params;

    // Verify candidate belongs to this vendor
    const existing = await prisma.b2BCandidate.findFirst({
      where: { id, vendorId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Check for active submissions (SUBMITTED or SHORTLISTED)
    // Statuses defined in b2bSubmissionWorkflow: SUBMITTED, SHORTLISTED, REJECTED, PLACED, WITHDRAWN
    const activeSubmissions = await prisma.b2BPlacement.count({
      where: {
        candidateId: id,
        status: { in: ['SUBMITTED', 'SHORTLISTED'] },
      },
    });

    if (activeSubmissions > 0) {
      return res.status(409).json({
        error: 'Cannot delete candidate with active submissions. Withdraw or wait for the submissions to be resolved first.',
      });
    }

    await prisma.b2BCandidate.delete({ where: { id } });

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
};
// ============================================================
// WS14-T07: Bulk Candidate Upload (POST /candidates/bulk)
// Accepts a CSV file with columns:
//   firstName, lastName, email, phone, experience, skills
// ============================================================

/** Parse a CSV buffer into an array of row objects (string values) */
async function parseCsv(buffer: Buffer): Promise<Array<Record<string, string>>> {
  return new Promise((resolve, reject) => {
    const rows: Array<Record<string, string>> = [];
    let headers: string[] = [];
    let lineIndex = 0;

    const rl = readline.createInterface({
      input: require('stream').Readable.from(buffer.toString('utf-8')),
      crlfDelay: Infinity,
    });

    rl.on('line', (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return; // skip blank lines

      // Simple CSV split: handles quoted fields
      const parseRow = (rawLine: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < rawLine.length; i++) {
          const ch = rawLine[i];
          if (ch === '"') {
            inQuotes = !inQuotes;
          } else if (ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += ch;
          }
        }
        result.push(current.trim());
        return result;
      };

      if (lineIndex === 0) {
        headers = parseRow(trimmed).map((h) => h.toLowerCase().replace(/\s+/g, ''));
      } else {
        const values = parseRow(trimmed);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = (values[i] || '').trim();
        });
        rows.push(row);
      }
      lineIndex++;
    });

    rl.on('close', () => resolve(rows));
    rl.on('error', reject);
  });
}

export const bulkUploadCandidates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user!.userId;

    if (!req.file) {
      res.status(400).json({ error: 'No CSV file uploaded' });
      return;
    }

    // Parse CSV from buffer (memory storage)
    let rows: Array<Record<string, string>>;
    try {
      rows = await parseCsv(req.file.buffer);
    } catch (parseError) {
      res.status(400).json({ error: 'Failed to parse CSV file. Ensure it is a valid UTF-8 CSV.' });
      return;
    }

    if (rows.length === 0) {
      res.status(400).json({ error: 'CSV file contains no data rows' });
      return;
    }

    const errors: Array<{ row: number; reason: string }> = [];
    const createdIds: string[] = [];

    // Track emails already processed in this upload to catch in-file duplicates
    const seenEmails = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // row 1 = header, data starts at 2
      const row = rows[i];

      // Normalize/trim fields
      const firstName = (row['firstname'] || row['first_name'] || row['first name'] || '').trim();
      const lastName  = (row['lastname']  || row['last_name']  || row['last name']  || '').trim();
      const email     = (row['email'] || '').trim();
      const phone     = (row['phone'] || '').trim() || null;
      const skillsRaw = (row['skills'] || '').trim();
      const expRaw    = (row['experience'] || row['exp'] || '').trim();

      // --- Required field validation ---
      if (!firstName) { errors.push({ row: rowNum, reason: 'First name is required' }); continue; }
      if (!lastName)  { errors.push({ row: rowNum, reason: 'Last name is required' }); continue; }
      if (!email)     { errors.push({ row: rowNum, reason: 'Email is required' }); continue; }

      // --- Email format validation ---
      if (!isValidEmail(email)) { errors.push({ row: rowNum, reason: 'Invalid email address' }); continue; }
      const normalizedEmail = email.toLowerCase();

      // --- Phone validation (optional) ---
      if (phone && !isValidPhone(phone)) {
        errors.push({ row: rowNum, reason: 'Invalid phone number' }); continue;
      }

      // --- Experience validation (optional) ---
      let experience: number | null = null;
      if (expRaw !== '') {
        if (!isValidExperience(expRaw)) {
          errors.push({ row: rowNum, reason: 'Experience must be a whole number between 0 and 60' }); continue;
        }
        experience = parseInt(expRaw, 10);
      }

      // --- Skills: comma-separated string ---
      const skills = skillsRaw
        ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      // --- In-file duplicate check ---
      if (seenEmails.has(normalizedEmail)) {
        errors.push({ row: rowNum, reason: `Duplicate email in this file: ${normalizedEmail}` }); continue;
      }
      seenEmails.add(normalizedEmail);

      // --- Database duplicate check (same vendor + email) ---
      try {
        const duplicate = await prisma.b2BCandidate.findFirst({
          where: {
            vendorId,
            email: { equals: normalizedEmail, mode: 'insensitive' },
          },
        });
        if (duplicate) {
          errors.push({ row: rowNum, reason: `Email already exists in your talent pool: ${normalizedEmail}` }); continue;
        }

        // --- Create candidate (vendorId always from auth, never from CSV) ---
        const created = await prisma.b2BCandidate.create({
          data: {
            vendorId,  // NEVER taken from CSV
            firstName,
            lastName,
            email: normalizedEmail,
            phone: phone || null,
            skills,
            experience,
            status: 'AVAILABLE',
          },
        });
        createdIds.push(created.id);
      } catch (dbError: any) {
        // Handle Prisma unique constraint as fallback
        if (dbError?.code === 'P2002') {
          errors.push({ row: rowNum, reason: `Duplicate email for your vendor account: ${normalizedEmail}` });
        } else {
          console.error(`[b2b] Bulk upload DB error at row ${rowNum}:`, dbError);
          errors.push({ row: rowNum, reason: 'Database error while creating candidate' });
        }
      }
    }

    res.status(200).json({
      message: 'Bulk candidate upload completed',
      summary: {
        total: rows.length,
        created: createdIds.length,
        failed: errors.length,
      },
      errors,
    });
  } catch (error) {
    console.error('Bulk upload candidates error:', error);
    res.status(500).json({ error: 'Bulk upload failed' });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    console.log('getInvoices called by userId:', userId);

    const invoices = await prisma.b2BInvoice.findMany({
      where: {
        OR: [
          { clientId: userId },
          { vendorId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Found invoices:', invoices.length, invoices.map(i => ({ id: i.id, clientId: i.clientId, vendorId: i.vendorId })));

    // Get partner names for display
    const userIds = [...new Set([...invoices.map((i) => i.vendorId), ...invoices.map((i) => i.clientId)])];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, companyName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.companyName || `${u.firstName} ${u.lastName}`]));

    // Get contract info
    const contractIds = invoices.map((i) => i.contractId).filter(Boolean) as string[];
    const contracts = contractIds.length > 0
      ? await prisma.b2BContract.findMany({
          where: { id: { in: contractIds } },
          select: { id: true, partnerName: true, role: true },
        })
      : [];
    const contractMap = new Map(contracts.map((c) => [c.id, `${c.partnerName} - ${c.role}`]));

    res.json(
      invoices.map((i) => ({
        id: i.id,
        invoiceNo: i.invoiceNo,
        // Show the other party as partner
        partner: userId === i.clientId ? userMap.get(i.vendorId) : userMap.get(i.clientId),
        amount: `$${Number(i.amount).toFixed(2)}`,
        dueDate: i.dueDate,
        status: i.status,
        contractId: i.contractId,
        contractName: i.contractId ? contractMap.get(i.contractId) || '—' : '—',
        isClient: i.clientId === userId,  // Client created the invoice
        isVendor: i.vendorId === userId,  // Vendor receives/pays the invoice
      }))
    );
  } catch (error) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.user?.userId;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { vendorId, amount, dueDate, contractId } = req.body;

    if (!vendorId || !amount) {
      return res.status(400).json({ error: 'Vendor ID and amount are required' });
    }

    // Generate invoice number
    const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    const invoice = await prisma.b2BInvoice.create({
      data: {
        clientId,
        vendorId,
        contractId: contractId || null,
        invoiceNo,
        amount: parseFloat(amount),
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return res.status(201).json({
      message: 'Invoice created successfully',
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNo,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const payInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Vendor (recipient) pays the invoice
    const invoice = await prisma.b2BInvoice.findFirst({
      where: {
        id,
        vendorId: userId,
        status: 'PENDING',
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found, already paid, or you are not the recipient' });
    }

    await prisma.b2BInvoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    res.json({ message: 'Invoice marked as paid' });
  } catch (error) {
    console.error('Pay invoice error:', error);
    res.status(500).json({ error: 'Failed to pay invoice' });
  }
};

export const downloadInvoice = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.txt`);

  res.send(`INVOICE ${id}\n\nThank you for your business.`);
};

export const getVendors = async (req: AuthRequest, res: Response) => {
  try {
    const vendors = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        approvalStatus: 'APPROVED',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        companyName: true,
      },
      orderBy: { firstName: 'asc' },
    });

    res.json(
      vendors.map((v) => ({
        id: v.id,
        name: v.companyName || `${v.firstName} ${v.lastName}`,
        email: v.email,
      }))
    );
  } catch (error) {
    console.error('Fetch vendors error:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

// ================== PLACEMENTS / SUBMISSIONS ==================

// Vendors can see all open requirements from all clients
export const getOpenRequirements = async (req: AuthRequest, res: Response) => {
  try {
    const rawPage = req.query.page as string | undefined;
    const rawPageSize = req.query.pageSize as string | undefined;
    const page = rawPage ? Number(rawPage) : 1;
    const pageSize = rawPageSize ? Number(rawPageSize) : 20;
    const search = String(req.query.search || '').trim();
    const skill = String(req.query.skill || '').trim();

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const pagination = getPaginationParams({ page, pageSize, maxPageSize: 50 });
    const where: any = { status: 'OPEN' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (skill) {
      where.primarySkills = { has: skill };
    }

    const [requirements, totalItems] = await Promise.all([
      prisma.b2BRequirement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.b2BRequirement.count({ where }),
    ]);

    const clientIds = [...new Set(requirements.map((r) => r.clientId))];
    const clients = clientIds.length
      ? await prisma.user.findMany({
          where: { id: { in: clientIds } },
          select: { id: true, firstName: true, lastName: true, companyName: true },
        })
      : [];

    const clientMap = new Map<string, string>(clients.map((c) => [c.id, c.companyName || `${c.firstName} ${c.lastName}`] as [string, string]));
    const requirementMap = new Map<string, string>(requirements.map((r) => [r.id, r.title] as [string, string]));

    const items = requirements.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      clientName: clientMap.get(r.clientId) || 'Unknown',
      clientId: r.clientId,
      skills: r.primarySkills || [],
      location: r.location,
      workMode: r.workMode,
      employmentType: r.employmentType,
      minExperience: r.minExperience,
      maxExperience: r.maxExperience,
      budget: r.budget ? `${r.currency} ${Number(r.budget).toFixed(2)}` : '�',
      headcount: r.requiredCount,
      status: r.status,
      createdAt: r.createdAt,
    }));

    res.json(createPaginatedResult(items, totalItems, pagination.page, pagination.pageSize));
  } catch (error) {
    console.error('Fetch open requirements error:', error);
    res.status(500).json({ error: 'Failed to fetch open requirements' });
  }
};
// Vendor submits a candidate to a requirement
export const submitCandidateToRequirement = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const { requirementId, candidateId, notes } = req.body;

    if (!requirementId || !candidateId) {
      return res.status(400).json({ error: 'Requirement ID and Candidate ID are required' });
    }

    // Verify requirement exists and is open
    const requirement = await prisma.b2BRequirement.findFirst({
      where: { id: requirementId, status: 'OPEN' },
    });

    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found or not open' });
    }

    // Verify candidate belongs to vendor
    const candidate = await prisma.b2BCandidate.findFirst({
      where: { id: candidateId, vendorId },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found or does not belong to you' });
    }

    // Check if already submitted
    const existingSubmission = await prisma.b2BPlacement.findFirst({
      where: { requirementId, candidateId, vendorId },
    });

    if (existingSubmission) {
      return res.status(400).json({ error: 'This candidate has already been submitted to this requirement' });
    }
const clientSettings = await prisma.b2BSettings.findUnique({
  where: { userId: requirement.clientId },
  select: { autoApproveSubmissions: true, newSubmissionsNotify: true },
});

const initialStatus = clientSettings?.autoApproveSubmissions
  ? 'SHORTLISTED'
  : 'SUBMITTED';
    // Create submission
    const submission = await prisma.b2BPlacement.create({
      data: {
        vendorId,
        clientId: requirement.clientId,
        requirementId,
        candidateId,
        title: requirement.title,
        status: initialStatus,
        notes: notes || null,
      },
    });

    // Notify client about new submission when enabled
    if (clientSettings?.newSubmissionsNotify !== false) {
      await createNotification(
        requirement.clientId,
        'B2B_SUBMISSION_RECEIVED',
        'New Candidate Submission',
        `A vendor has submitted ${candidate.firstName} ${candidate.lastName} for ${requirement.title}.`,
        '/b2b/submissions'
      );
    }
    // Increment proposalsCount on the requirement
    await prisma.b2BRequirement.update({
      where: { id: requirementId },
      data: { proposalsCount: { increment: 1 } },
    });

    res.status(201).json({
      message: 'Candidate submitted successfully',
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Submit candidate error:', error);
    res.status(500).json({ error: 'Failed to submit candidate' });
  }
};

// Vendor gets their submissions/placements
export const getVendorSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const rawPage = req.query.page as string | undefined;
    const rawPageSize = req.query.pageSize as string | undefined;
    const page = rawPage ? Number(rawPage) : 1;
    const pageSize = rawPageSize ? Number(rawPageSize) : 20;
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '').trim();

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const pagination = getPaginationParams({ page, pageSize, maxPageSize: 50 });
    const where: any = { vendorId };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    const [submissions, totalItems] = await Promise.all([
      prisma.b2BPlacement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.b2BPlacement.count({ where }),
    ]);

    const candidateIds = submissions.map((s) => s.candidateId);
    const clientIds = [...new Set(submissions.map((s) => s.clientId))];
    const requirementIds = [...new Set(submissions.map((s) => s.requirementId))];

    const [candidates, clients, requirements] = await Promise.all([
      candidateIds.length
        ? prisma.b2BCandidate.findMany({
            where: { id: { in: candidateIds } },
            select: { id: true, firstName: true, lastName: true, email: true },
          })
        : [],
      clientIds.length
        ? prisma.user.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, firstName: true, lastName: true, companyName: true },
          })
        : [],
      requirementIds.length
        ? prisma.b2BRequirement.findMany({
            where: { id: { in: requirementIds } },
            select: { id: true, title: true },
          })
        : [],
    ]);

    const candidateMap = new Map<string, typeof candidates[number]>(candidates.map((c) => [c.id, c] as [string, typeof c]));
    const clientMap = new Map<string, string>(clients.map((c) => [c.id, c.companyName || `${c.firstName} ${c.lastName}`] as [string, string]));
    const requirementMap = new Map<string, string>(requirements.map((r) => [r.id, r.title] as [string, string]));

    const items = submissions.map((s) => {
      const candidate = candidateMap.get(s.candidateId);
      return {
        id: s.id,
        requirementId: s.requirementId,
        requirementTitle: requirementMap.get(s.requirementId) || s.title || 'Unknown',
        candidateId: s.candidateId,
        candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown',
        candidateEmail: candidate?.email || '',
        clientName: clientMap.get(s.clientId) || 'Unknown',
        status: s.status,
        notes: s.notes,
        submittedAt: s.submittedAt,
        reviewedAt: s.reviewedAt,
        reviewedById: s.reviewedById,
      };
    });

    res.json(createPaginatedResult(items, totalItems, pagination.page, pagination.pageSize));
  } catch (error) {
    console.error('Fetch vendor submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};
// Client gets submissions to their requirements
export const getClientSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.user!.userId;

    const submissions = await prisma.b2BPlacement.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    // Get candidate, vendor and requirement info
    const candidateIds = submissions.map((s) => s.candidateId);
    const vendorIds = [...new Set(submissions.map((s) => s.vendorId))];
    const requirementIds = [...new Set(submissions.map((s) => s.requirementId))];

    const [candidates, vendors, requirements] = await Promise.all([
      prisma.b2BCandidate.findMany({
        where: { id: { in: candidateIds } },
        select: { id: true, firstName: true, lastName: true, email: true, skills: true, experience: true },
      }),
      prisma.user.findMany({
        where: { id: { in: vendorIds } },
        select: { id: true, firstName: true, lastName: true, companyName: true },
      }),
      prisma.b2BRequirement.findMany({
        where: { id: { in: requirementIds } },
        select: { id: true, title: true },
      }),
    ]);

    const candidateMap = new Map<string, typeof candidates[number]>(candidates.map((c) => [c.id, c] as [string, typeof c]));
    const vendorMap = new Map(vendors.map((v) => [v.id, v.companyName || `${v.firstName} ${v.lastName}`]));
    const requirementMap = new Map<string, string>(requirements.map((r) => [r.id, r.title] as [string, string]));

    res.json(
      submissions.map((s) => {
        const candidate = candidateMap.get(s.candidateId);
        return {
          id: s.id,
          requirementId: s.requirementId,
          requirementTitle: requirementMap.get(s.requirementId) || s.title || 'Unknown',
          candidateId: s.candidateId,
          candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown',
          candidateEmail: candidate?.email || '',
          candidateSkills: candidate?.skills || [],
          candidateExperience: candidate?.experience,
          vendorId: s.vendorId,
          vendorName: vendorMap.get(s.vendorId) || 'Unknown',
          status: s.status,
          notes: s.notes,
          submittedAt: s.submittedAt,
          reviewedAt: s.reviewedAt,
          reviewedById: s.reviewedById,
        };
      })
    );
  } catch (error) {
    console.error('Fetch client submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};
// Client updates submission status (shortlist, reject, place)
export const updateSubmissionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.user!.userId;
    const { id } = req.params;
    const { status, notes } = req.body;
    if (notes !== undefined && notes !== null && notes.length > 2000) {
  return res.status(400).json({
    error: 'Review notes cannot exceed 2000 characters',
  });
}
    const validStatuses = ['SHORTLISTED', 'REJECTED', 'PLACED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be SHORTLISTED, REJECTED, or PLACED',
      });
    }

    // Verify that the submission belongs to this client
    const submission = await prisma.b2BPlacement.findFirst({
      where: { id, clientId },
    });

    if (!submission) {
      return res.status(404).json({
        error: 'Submission not found',
      });
    }

    // Validate the status transition
    if (!isValidSubmissionTransition(submission.status, status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${submission.status} to ${status}`,
      });
    }

    // Get the requirement
    const requirement = await prisma.b2BRequirement.findUnique({
      where: { id: submission.requirementId },
      select: {
        requiredCount: true,
        status: true,
      },
    });

    if (!requirement) {
      return res.status(404).json({
        error: 'Requirement not found',
      });
    }

    // No submission status changes are allowed once the requirement is closed
    if (requirement.status !== 'OPEN') {
      return res.status(400).json({
        error: 'Cannot change submission status for a closed requirement',
      });
    }

    // Perform all related database changes in one transaction.
    // If any operation fails, all changes are rolled back.
    await prisma.$transaction(async (tx) => {
      // PLACED requires an available headcount.
      // This check is performed inside the transaction.
      if (status === 'PLACED') {
        const placedCount = await tx.b2BPlacement.count({
          where: {
            requirementId: submission.requirementId,
            status: 'PLACED',
          },
        });

        if (placedCount >= requirement.requiredCount) {
          throw new Error('HEADCOUNT_REACHED');
        }
      }

      // Update submission status
      await tx.b2BPlacement.update({
        where: { id },
        data: {
  status,
  notes: notes ?? null,
  reviewedAt: new Date(),
  reviewedById: clientId,
},
      });

      // Get all submissions for this candidate
      const candidateSubmissions = await tx.b2BPlacement.findMany({
        where: {
          candidateId: submission.candidateId,
        },
        select: {
          status: true,
        },
      });

      // Derive candidate status from submission statuses
      const hasPlacedSubmission = candidateSubmissions.some(
        (s) => s.status === 'PLACED'
      );

      const hasActiveSubmission = candidateSubmissions.some(
        (s) =>
          s.status === 'SUBMITTED' ||
          s.status === 'SHORTLISTED'
      );

      let candidateStatus = 'AVAILABLE';

      if (hasPlacedSubmission) {
        candidateStatus = 'PLACED';
      } else if (hasActiveSubmission) {
        candidateStatus = 'INTERVIEWING';
      }

      // Update candidate status based on current submission state
      await tx.b2BCandidate.update({
        where: { id: submission.candidateId },
        data: {
          status: candidateStatus,
        },
      });

      // Close requirement when headcount is completely filled
      if (status === 'PLACED') {
        const placedCount = await tx.b2BPlacement.count({
          where: {
            requirementId: submission.requirementId,
            status: 'PLACED',
          },
        });

        if (placedCount >= requirement.requiredCount) {
          await tx.b2BRequirement.update({
            where: { id: submission.requirementId },
            data: {
              status: 'CLOSED',
            },
          });
        }
      }
    });
 // Notify vendor about submission status change
    await createNotification(
      submission.vendorId,
      'B2B_SUBMISSION_UPDATED',
      'Submission Status Updated',
      `Your candidate submission status has been changed to ${status.toLowerCase()}.`,
      '/b2b/submissions'
    );

    return res.json({
      message: `Submission ${status.toLowerCase()}`,
    });
  } catch (error) {
    console.error('Update submission status error:', error);

    // Headcount has already been reached
    if (
      error instanceof Error &&
      error.message === 'HEADCOUNT_REACHED'
    ) {
      return res.status(409).json({
        error: 'Requirement headcount has already been reached',
      });
    }

    return res.status(500).json({
      error: 'Failed to update submission status',
    });
  }
};
// Vendor withdraws a submitted candidate
export const withdrawSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const { id } = req.params;

    const submission = await prisma.b2BPlacement.findFirst({
      where: {
        id,
        vendorId,
      },
    });

    if (!submission) {
      return res.status(404).json({
        error: 'Submission not found',
      });
    }

    if (submission.status !== 'SUBMITTED') {
      return res.status(400).json({
        error: 'Only SUBMITTED submissions can be withdrawn',
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.b2BPlacement.update({
        where: { id },
        data: {
          status: 'WITHDRAWN',
          reviewedAt: new Date(),
        },
      });

      const otherActiveSubmissions = await tx.b2BPlacement.count({
        where: {
          candidateId: submission.candidateId,
          status: {
            in: ['SUBMITTED', 'SHORTLISTED'],
          },
          id: {
            not: id,
          },
        },
      });

      if (otherActiveSubmissions === 0) {
        await tx.b2BCandidate.update({
          where: { id: submission.candidateId },
          data: { status: 'AVAILABLE' },
        });
      }
    });

    return res.json({
      message: 'Submission withdrawn successfully',
    });
  } catch (error) {
    console.error('Withdraw submission error:', error);

    return res.status(500).json({
      error: 'Failed to withdraw submission',
    });
  }
};

// ==================== B2B SETTINGS ====================

export const getB2BSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true }
    });

    let settings = await prisma.b2BSettings.findUnique({
      where: { userId }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.b2BSettings.create({
        data: {
          userId,
          contactPerson: user ? `${user.firstName} ${user.lastName}` : '',
        }
      });
    }

    res.json({
      ...settings,
      email: user?.email
    });
  } catch (error) {
    console.error('Get B2B settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateB2BSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      companyName,
      contactPerson,
      phone,
      address,
      website,
      description,
      emailNotifications,
      newSubmissionsNotify,
      contractUpdatesNotify,
      invoiceRemindersNotify,
      weeklyDigestNotify,
      defaultPaymentTerms,
      preferredContractDuration,
      autoApproveSubmissions,
      requireNDA,
      bankName,
      accountNumber,
      routingNumber,
      minimumRate,
      serviceAreas,
      specializations,
      availableForNewProjects,
    } = req.body;

    const settings = await prisma.b2BSettings.upsert({
      where: { userId },
      update: {
        companyName,
        contactPerson,
        phone,
        address,
        website,
        description,
        emailNotifications,
        newSubmissionsNotify,
        contractUpdatesNotify,
        invoiceRemindersNotify,
        weeklyDigestNotify,
        defaultPaymentTerms,
        preferredContractDuration,
        autoApproveSubmissions,
        requireNDA,
        bankName,
        accountNumber,
        routingNumber,
        minimumRate,
        serviceAreas,
        specializations,
        availableForNewProjects,
      },
      create: {
        userId,
        companyName,
        contactPerson,
        phone,
        address,
        website,
        description,
        emailNotifications,
        newSubmissionsNotify,
        contractUpdatesNotify,
        invoiceRemindersNotify,
        weeklyDigestNotify,
        defaultPaymentTerms,
        preferredContractDuration,
        autoApproveSubmissions,
        requireNDA,
        bankName,
        accountNumber,
        routingNumber,
        minimumRate,
        serviceAreas,
        specializations,
        availableForNewProjects,
      }
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update B2B settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};





