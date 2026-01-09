import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
const prisma = new PrismaClient();

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

    const pendingContractsCount = await prisma.b2BContract.count({
      where: { vendorId: userId, status: 'PENDING' }
    });

    const activeContractsCount = await prisma.b2BContract.count({
      where: { vendorId: userId, status: 'ACTIVE' }
    });

    const pendingInvoicesCount = await prisma.b2BInvoice.count({
      where: { vendorId: userId, status: 'PENDING' }
    });

    const candidatesCount = await prisma.b2BCandidate.count({
      where: { vendorId: userId }
    });

    // Submission stats
    const submittedCount = await prisma.b2BPlacement.count({
      where: { vendorId: userId, status: 'SUBMITTED' }
    });
    const shortlistedCount = await prisma.b2BPlacement.count({
      where: { vendorId: userId, status: 'SHORTLISTED' }
    });
    const placedCount = await prisma.b2BPlacement.count({
      where: { vendorId: userId, status: 'PLACED' }
    });
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
    const requirementMap = new Map(requirements.map((r) => [r.id, r.title]));

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

    res.json({ message: `Contract ${status.toLowerCase()}` });
  } catch (error) {
    console.error('Update contract status error:', error);
    res.status(500).json({ error: 'Failed to update contract status' });
  }
};

export const getVendorCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;

    const candidates = await prisma.b2BCandidate.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      candidates.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        experience: c.experience,
        skills: c.skills || [],
        status: c.status,
        resumeUrl: c.resumeUrl,
      }))
    );
  } catch (error) {
    console.error('Fetch candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

export const addCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const { firstName, lastName, email, phone, skills, experience, resumeUrl } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const candidate = await prisma.b2BCandidate.create({
      data: {
        vendorId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
        experience: experience ? parseInt(experience) : null,
        resumeUrl: resumeUrl || null,
        status: 'AVAILABLE',
      },
    });

    res.status(201).json({
      message: 'Candidate added',
      candidateId: candidate.id,
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
};
export const downloadCandidateResume = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Placeholder until S3
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename=candidate-${id}.txt`);
  res.send('Resume will be available here.');
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
      where: { role: 'VENDOR' },
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
    const requirements = await prisma.b2BRequirement.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });

    // Get client info
    const clientIds = [...new Set(requirements.map((r) => r.clientId))];
    const clients = await prisma.user.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, firstName: true, lastName: true, companyName: true },
    });
    const clientMap = new Map(clients.map((c) => [c.id, c.companyName || `${c.firstName} ${c.lastName}`]));

    res.json(
      requirements.map((r) => ({
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
        budget: r.budget ? `${r.currency} ${Number(r.budget).toFixed(2)}` : '—',
        headcount: r.requiredCount,
        status: r.status,
        createdAt: r.createdAt,
      }))
    );
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

    // Create submission
    const submission = await prisma.b2BPlacement.create({
      data: {
        vendorId,
        clientId: requirement.clientId,
        requirementId,
        candidateId,
        title: requirement.title,
        status: 'SUBMITTED',
        notes: notes || null,
      },
    });

    // Increment proposalsCount on the requirement
    await prisma.b2BRequirement.update({
      where: { id: requirementId },
      data: { proposalsCount: { increment: 1 } },
    });

    // Update candidate status
    await prisma.b2BCandidate.update({
      where: { id: candidateId },
      data: { status: 'INTERVIEWING' },
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

    const submissions = await prisma.b2BPlacement.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });

    // Get candidate, client and requirement info
    const candidateIds = submissions.map((s) => s.candidateId);
    const clientIds = [...new Set(submissions.map((s) => s.clientId))];
    const requirementIds = [...new Set(submissions.map((s) => s.requirementId))];

    const [candidates, clients, requirements] = await Promise.all([
      prisma.b2BCandidate.findMany({
        where: { id: { in: candidateIds } },
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
      prisma.user.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, firstName: true, lastName: true, companyName: true },
      }),
      prisma.b2BRequirement.findMany({
        where: { id: { in: requirementIds } },
        select: { id: true, title: true },
      }),
    ]);

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));
    const clientMap = new Map(clients.map((c) => [c.id, c.companyName || `${c.firstName} ${c.lastName}`]));
    const requirementMap = new Map(requirements.map((r) => [r.id, r.title]));

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
          clientName: clientMap.get(s.clientId) || 'Unknown',
          status: s.status,
          notes: s.notes,
          submittedAt: s.submittedAt,
          reviewedAt: s.reviewedAt,
        };
      })
    );
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

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));
    const vendorMap = new Map(vendors.map((v) => [v.id, v.companyName || `${v.firstName} ${v.lastName}`]));
    const requirementMap = new Map(requirements.map((r) => [r.id, r.title]));

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
    const { status } = req.body;

    const validStatuses = ['SHORTLISTED', 'REJECTED', 'PLACED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be SHORTLISTED, REJECTED, or PLACED' });
    }

    const submission = await prisma.b2BPlacement.findFirst({
      where: { id, clientId },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    await prisma.b2BPlacement.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
      },
    });

    // Update candidate status based on submission status
    if (status === 'PLACED') {
      await prisma.b2BCandidate.update({
        where: { id: submission.candidateId },
        data: { status: 'PLACED' },
      });

      // Check if requirement is fully filled and auto-close it
      const requirement = await prisma.b2BRequirement.findUnique({
        where: { id: submission.requirementId },
        select: { requiredCount: true, status: true },
      });

      if (requirement && requirement.status === 'OPEN') {
        const placedCount = await prisma.b2BPlacement.count({
          where: {
            requirementId: submission.requirementId,
            status: 'PLACED',
          },
        });

        if (placedCount >= requirement.requiredCount) {
          await prisma.b2BRequirement.update({
            where: { id: submission.requirementId },
            data: { status: 'CLOSED' },
          });
        }
      }
    } else if (status === 'REJECTED') {
      // Check if candidate has other active submissions
      const otherSubmissions = await prisma.b2BPlacement.count({
        where: {
          candidateId: submission.candidateId,
          status: { in: ['SUBMITTED', 'SHORTLISTED'] },
          id: { not: id },
        },
      });

      if (otherSubmissions === 0) {
        await prisma.b2BCandidate.update({
          where: { id: submission.candidateId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    res.json({ message: `Submission ${status.toLowerCase()}` });
  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({ error: 'Failed to update submission status' });
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
