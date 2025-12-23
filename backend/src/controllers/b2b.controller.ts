import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}
export const getClientDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [requirements] = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM b2b_requirements
      WHERE client_id = ${userId}
    `;

    const [contracts] = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM b2b_contracts
      WHERE client_id = ${userId}
    `;

    res.json([
      {
        name: 'Active Requirements',
        value: requirements.count,
        change: '+2 this week',
        changeType: 'increase',
        icon: 'M9 5H7a2 2 0 00-2 2v12',
      },
      {
        name: 'Active Contracts',
        value: contracts.count,
        change: 'No change',
        changeType: 'neutral',
        icon: 'M9 12h6',
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

    const [placements] = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM b2b_placements
      WHERE vendor_id = ${userId}
    `;

    const [contracts] = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM b2b_contracts
      WHERE vendor_id = ${userId}
    `;

    res.json([
      {
        name: 'Active Placements',
        value: placements.count,
        change: '+1 this week',
        changeType: 'increase',
        icon: 'M12 6v6',
      },
      {
        name: 'Pending Contracts',
        value: contracts.count,
        change: 'Awaiting response',
        changeType: 'warning',
        icon: 'M9 12h6',
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

    const data = await prisma.$queryRaw<any[]>`
      SELECT id, title, status, required_count, proposals_count
      FROM b2b_requirements
      WHERE client_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    res.json(
      data.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        count: r.required_count,
        applicants: r.proposals_count,
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

    const data = await prisma.b2b_placements.findMany({
      where: { vendor_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    res.json(
      data.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        count: p.placed_count,
        applicants: p.submissions_count,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent placements' });
  }
};
export const getPendingContracts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = Number(req.query.limit) || 2;

    const data = await prisma.$queryRaw<any[]>`
      SELECT id, partner_name, role, status, created_at
      FROM b2b_contracts
      WHERE (client_id = ${userId} OR vendor_id = ${userId})
        AND status IN ('PENDING', 'NEGOTIATION')
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    res.json(
      data.map((c) => ({
        id: c.id,
        partner: c.partner_name,
        role: c.role,
        status: c.status,
        date: c.created_at,
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

    const [result] = await prisma.$queryRaw<any[]>`
      INSERT INTO b2b_requirements (
        title,
        status,
        required_count,
        proposals_count,
        client_id
      )
      VALUES (
        ${title},
        'OPEN',
        ${count},
        0,
        ${userId}
      )
      RETURNING id;
    `;

    res.status(201).json({
      message: 'Requirement created successfully',
      requirementId: result.id,
    });
  } catch (error) {
    console.error('Create requirement error:', error);
    res.status(500).json({ error: 'Failed to create requirement' });
  }
};
export const getAllRequirements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const data = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        title,
        status,
        required_count,
        proposals_count,
        created_at
      FROM b2b_requirements
      WHERE client_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json(
      data.map((r) => ({
        id: r.id,
        title: r.title,
        skills: [], // can be enhanced later
        count: r.required_count,
        filled: r.proposals_count,
        budget: '—',
        duration: '—',
        status: r.status,
        postedAt: r.created_at,
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

    const contracts = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        partner_name,
        role,
        status,
        created_at
      FROM b2b_contracts
      WHERE client_id = ${userId}
         OR vendor_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json(
      contracts.map((c) => ({
        id: c.id,
        partner: c.partner_name,
        candidate: '—',
        role: c.role,
        startDate: '—',
        duration: '—',
        rate: '—',
        status: c.status,
        signedAt: c.created_at,
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

    const [contract] = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM b2b_contracts
      WHERE id = ${id}
        AND (client_id = ${userId} OR vendor_id = ${userId})
    `;

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({
      id: contract.id,
      partner: contract.partner_name,
      role: contract.role,
      status: contract.status,
      content: `
        CONTRACT AGREEMENT

        Partner: ${contract.partner_name}
        Role: ${contract.role}
        Status: ${contract.status}

        This agreement is made between the client and vendor
        for providing staffing services as agreed.
      `,
      createdAt: contract.created_at,
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

    const [contract] = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM b2b_contracts
      WHERE id = ${id}
        AND (client_id = ${userId} OR vendor_id = ${userId})
    `;

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const fileContent = `
CONTRACT AGREEMENT

Partner: ${contract.partner_name}
Role: ${contract.role}
Status: ${contract.status}

Signed on: ${contract.created_at}

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
    const { partnerName, role, vendorId } = req.body;

    if (!partnerName || !role || !vendorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 🔐 VERIFY VENDOR EXISTS & ROLE IS VENDOR
    const vendor = await prisma.$queryRaw<any[]>`
      SELECT id, role
      FROM users
      WHERE id = ${vendorId}
    `;

    if (vendor.length === 0) {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    if (vendor[0].role !== 'VENDOR') {
      return res.status(400).json({ error: 'User is not a vendor' });
    }

    // ✅ SAFE INSERT
    const [contract] = await prisma.$queryRaw<any[]>`
      INSERT INTO b2b_contracts (
        partner_name,
        role,
        status,
        client_id,
        vendor_id
      )
      VALUES (
        ${partnerName},
        ${role},
        'PENDING',
        ${userId},
        ${vendorId}
      )
      RETURNING id;
    `;

    res.status(201).json({
      message: 'Draft contract created',
      contractId: contract.id,
    });
  } catch (error) {
    console.error('Create draft contract error:', error);
    res.status(500).json({ error: 'Failed to create draft contract' });
  }
};
export const getVendorCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;

    const candidates = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM b2b_candidates
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
    `;

    res.json(
      candidates.map((c) => ({
        id: c.id,
        name: c.name,
        title: c.title,
        experience: `${c.experience_years} Years`,
        skills: c.skills || [],
        status: c.status,
        rate: c.rate,
        location: c.location,
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
    const { name, title, experienceYears, skills, rate, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Candidate name is required' });
    }

    const [candidate] = await prisma.$queryRaw<any[]>`
      INSERT INTO b2b_candidates (
        vendor_id,
        name,
        title,
        experience_years,
        skills,
        rate,
        location
      )
      VALUES (
        ${vendorId},
        ${name},
        ${title},
        ${experienceYears},
        ${skills},
        ${rate},
        ${location}
      )
      RETURNING id;
    `;

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

    const [candidate] = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        name,
        title,
        experience_years,
        skills,
        status,
        rate,
        location,
        resume_url,
        created_at
      FROM b2b_candidates
      WHERE id = ${id}
        AND vendor_id = ${vendorId}
    `;

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({
      id: candidate.id,
      name: candidate.name,
      title: candidate.title,
      experience: `${candidate.experience_years} Years`,
      skills: candidate.skills || [],
      status: candidate.status,
      rate: candidate.rate,
      location: candidate.location,
      resumeUrl: candidate.resume_url,
      createdAt: candidate.created_at,
    });
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate profile' });
  }
};
export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const invoices = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM b2b_invoices
      WHERE client_id = ${userId}
         OR vendor_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json(
      invoices.map((i) => ({
        id: i.id,
        partner: i.partner_name,
        amount: `$${Number(i.amount).toFixed(2)}`,
        dueDate: i.due_date,
        status: i.status,
        items: i.items,
      }))
    );
  } catch (error) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    // 1️⃣ Auth check
    const clientId = req.user?.userId;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2️⃣ Extract body
    const { vendorId, partnerName, amount, currency, dueDate, items } = req.body;

    // 3️⃣ Generate IDs
    const invoiceId = randomUUID();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    // 4️⃣ Ensure items is TEXT (DB schema requirement)
    const itemsText = typeof items === 'string' ? items : JSON.stringify(items);

    // 5️⃣ Insert invoice
    await prisma.$queryRaw`
      INSERT INTO b2b_invoices (
        id,
        client_id,
        vendor_id,
        partner_name,
        amount,
        currency,
        due_date,
        status,
        items,
        created_at,
        invoice_number
      )
      VALUES (
        ${invoiceId}::text,
        ${clientId}::text,
        ${vendorId}::text,
        ${partnerName}::text,
        ${amount}::numeric,
        ${currency}::text,
        ${dueDate}::date,
        'UNPAID',
        ${itemsText}::text,
        NOW(),
        ${invoiceNumber}::text
      )
    `;

    // 6️⃣ Response
    return res.status(201).json({
      message: 'Invoice created successfully',
      invoiceId,
      invoiceNumber,
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

    const result = await prisma.$queryRaw`
      UPDATE b2b_invoices
      SET status = 'PAID'
      WHERE id = ${id}
        AND client_id = ${userId}
        AND status = 'UNPAID'
    `;

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
