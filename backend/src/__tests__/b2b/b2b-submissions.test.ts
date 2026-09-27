/**
 * WS14-T08 — B2B Submissions API Tests
 *
 * Tests /api/b2b/submissions* endpoints.
 * Covers: vendor submit, vendor get, client get, client update status, vendor withdraw.
 * Regression: WS14-T05 (submission workflow), WS14-T06 (candidate ownership).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $use: vi.fn(),
    b2BCandidate: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    b2BRequirement: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    b2BPlacement: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    b2BSettings: {
      findUnique: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

vi.mock('../../utils/upload', () => ({
  resumeUpload: { single: () => (_req: any, _res: any, next: () => void) => next() },
  validateFileSignature: () => (_req: any, _res: any, next: () => void) => next(),
  handleUploadError: (_err: any, _req: any, _res: any, next: () => void) => next(),
}));

vi.mock('multer', () => {
  const m: any = () => ({ single: () => (_req: any, _res: any, next: () => void) => next() });
  m.memoryStorage = () => ({});
  return { default: m };
});

vi.mock('../../controllers/notification.controller', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
  getNotifications: vi.fn((_req: any, res: any) => res.json({ notifications: [], unreadCount: 0 })),
  markAsRead: vi.fn((_req: any, res: any) => res.json({ success: true })),
  markAllAsRead: vi.fn((_req: any, res: any) => res.json({ success: true })),
  deleteNotification: vi.fn((_req: any, res: any) => res.json({ success: true })),
  deleteAllRead: vi.fn((_req: any, res: any) => res.json({ success: true })),
  getUnreadCount: vi.fn((_req: any, res: any) => res.json({ count: 0 })),
}));

import request from 'supertest';
import app from '../../index';
import {
  makeVendorToken,
  makeClientToken,
  makeVendorId,
  makeClientId,
  makeReqId,
  makeCandId,
  makePlaceId,
  makeCandidate,
  makeRequirement,
  makePlacement,
} from './b2b-test-factory';

describe('WS14-T08 — B2B Submissions: Vendor Submit', () => {
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: client has no auto-approve settings
    mockPrisma.b2BSettings.findUnique.mockResolvedValue(null);
  });

  // ── C. Authorization ──────────────────────────────────────────────────────

  it('C1 — POST /submissions rejects unauthenticated', async () => {
    const res = await request(app).post('/api/b2b/submissions').send({});
    expect(res.status).toBe(401);
  });

  it('C2 — POST /submissions rejects CLIENT role', async () => {
    const res = await request(app)
      .post('/api/b2b/submissions')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ requirementId: makeReqId(), candidateId: makeCandId() });
    expect(res.status).toBe(403);
  });

  // ── B. Validation ─────────────────────────────────────────────────────────

  it('B1 — POST /submissions rejects missing requirementId', async () => {
    const res = await request(app)
      .post('/api/b2b/submissions')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ candidateId: makeCandId() });
    expect(res.status).toBe(400);
  });

  it('B2 — POST /submissions rejects missing candidateId', async () => {
    const res = await request(app)
      .post('/api/b2b/submissions')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ requirementId: makeReqId() });
    expect(res.status).toBe(400);
  });

  it('B3 — POST /submissions returns 404 when requirement not found/not open', async () => {
    mockPrisma.b2BRequirement.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/b2b/submissions')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ requirementId: makeReqId(), candidateId: makeCandId() });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/requirement/i);
  });

  it('B4 — POST /submissions returns 404 when candidate not found', async () => {
    const req = makeRequirement(clientId);
    mockPrisma.b2BRequirement.findFirst.mockResolvedValue(req);
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null); // candidate not found

    const res = await request(app)
      .post('/api/b2b/submissions')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ requirementId: req.id, candidateId: makeCandId() });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/candidate/i);
  });

  // ── C. Ownership ──────────────────────────────────────────────────────────

  it('C3 — POST /submissions blocks submitting another vendor\'s candidate', async () => {
    const req = makeRequirement(clientId);
    mockPrisma.b2BRequirement.findFirst.mockResolvedValue(req);
    // candidate.findFirst with vendorId filter returns null (belongs to different vendor)
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/b2b/submissions')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ requirementId: req.id, candidateId: makeCandId() });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/candidate/i);
  });

  // ── A. Happy Paths ────────────────────────────────────────────────────────

  it('A1 — POST /submissions creates submission successfully', async () => {
    const req = makeRequirement(clientId);
    const cand = makeCandidate(vendorId);
    const placement = makePlacement(vendorId, clientId, req.id, cand.id);

    mockPrisma.b2BRequirement.findFirst.mockResolvedValue(req);
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(cand);
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(null); // not a duplicate
    mockPrisma.b2BPlacement.create.mockResolvedValue(placement);
    mockPrisma.b2BRequirement.update.mockResolvedValue({ ...req, proposalsCount: 1 });

    const res = await request(app)
      .post('/api/b2b/submissions')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ requirementId: req.id, candidateId: cand.id, notes: 'Great candidate' });

    expect(res.status).toBe(201);
    expect(res.body.submissionId).toBe(placement.id);
    expect(res.body.message).toMatch(/submitted/i);
  });

  // ── D. Edge Cases ─────────────────────────────────────────────────────────

  it('D1 — POST /submissions blocks duplicate submission (same candidate + requirement)', async () => {
    const req = makeRequirement(clientId);
    const cand = makeCandidate(vendorId);
    const existing = makePlacement(vendorId, clientId, req.id, cand.id);

    mockPrisma.b2BRequirement.findFirst.mockResolvedValue(req);
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(cand);
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(existing); // already submitted

    const res = await request(app)
      .post('/api/b2b/submissions')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ requirementId: req.id, candidateId: cand.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already been submitted/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('WS14-T08 — B2B Submissions: Retrieval', () => {
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.b2BCandidate.findMany.mockResolvedValue([]);
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([]);
  });

  it('A1 — GET /submissions/vendor returns vendor submissions', async () => {
    const placement = makePlacement(vendorId, clientId, makeReqId(), makeCandId());
    mockPrisma.b2BPlacement.findMany.mockResolvedValue([placement]);

    mockPrisma.b2BPlacement.count.mockResolvedValue(1);
    const res = await request(app)
      .get('/api/b2b/submissions/vendor')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(mockPrisma.b2BPlacement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ vendorId }) })
    );
  });

  it('A2 — GET /submissions/vendor returns empty array when no submissions', async () => {
    mockPrisma.b2BPlacement.findMany.mockResolvedValue([]);
    mockPrisma.b2BPlacement.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/b2b/submissions/vendor')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.totalItems).toBe(0);
  });

  it('WS14-T09 — GET /submissions/vendor rejects invalid pagination with 400', async () => {
    const res = await request(app)
      .get('/api/b2b/submissions/vendor?pageSize=100')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(400);
  });

  it('WS14-T09 — GET /submissions/vendor passes search and status filters to prisma', async () => {
    mockPrisma.b2BPlacement.findMany.mockResolvedValue([]);
    mockPrisma.b2BPlacement.count.mockResolvedValue(0);

    await request(app)
      .get('/api/b2b/submissions/vendor?search=Developer&status=SHORTLISTED')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(mockPrisma.b2BPlacement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          vendorId,
          status: 'SHORTLISTED',
          title: { contains: 'Developer', mode: 'insensitive' },
        }),
      })
    );
  });

  it('A3 — GET /submissions/client returns client submissions', async () => {
    const placement = makePlacement(vendorId, clientId, makeReqId(), makeCandId());
    mockPrisma.b2BPlacement.findMany.mockResolvedValue([placement]);

    const res = await request(app)
      .get('/api/b2b/submissions/client')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockPrisma.b2BPlacement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId } })
    );
  });

  it('C1 — GET /submissions/vendor rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/submissions/vendor');
    expect(res.status).toBe(401);
  });

  it('C2 — GET /submissions/client rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/submissions/client');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('WS14-T08 — B2B Submissions: Status Updates', () => {
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTransaction = () => {
    mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
      // Execute the transaction fn with the mock prisma client
      return fn(mockPrisma);
    });
    mockPrisma.b2BPlacement.count.mockResolvedValue(0);
    mockPrisma.b2BPlacement.update.mockResolvedValue({});
    mockPrisma.b2BPlacement.findMany.mockResolvedValue([]);
    mockPrisma.b2BCandidate.update.mockResolvedValue({});
    mockPrisma.b2BRequirement.update.mockResolvedValue({});
  };

  it('B1 — PATCH /submissions/:id/status rejects invalid status', async () => {
    const placement = makePlacement(vendorId, clientId, makeReqId(), makeCandId(), { status: 'SUBMITTED' });
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(placement);
    mockPrisma.b2BRequirement.findUnique.mockResolvedValue(makeRequirement(clientId, { requiredCount: 2 }));

    const res = await request(app)
      .patch(`/api/b2b/submissions/${placement.id}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('A1 — PATCH /submissions/:id/status (SHORTLISTED) succeeds', async () => {
    const reqId = makeReqId();
    const candId = makeCandId();
    const placement = makePlacement(vendorId, clientId, reqId, candId, { status: 'SUBMITTED' });
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(placement);
    mockPrisma.b2BRequirement.findUnique.mockResolvedValue(
      makeRequirement(clientId, { id: reqId, status: 'OPEN', requiredCount: 2 })
    );
    mockTransaction();

    const res = await request(app)
      .patch(`/api/b2b/submissions/${placement.id}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'SHORTLISTED' });

    expect(res.status).toBe(200);
  });

  it('C1 — PATCH /submissions/:id/status rejects VENDOR updating (wrong role)', async () => {
    const res = await request(app)
      .patch(`/api/b2b/submissions/${makePlaceId()}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'SHORTLISTED' });
    expect(res.status).toBe(403);
  });

  it('D1 — PATCH /submissions/:id/status returns 404 for nonexistent submission', async () => {
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/b2b/submissions/${makePlaceId()}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'SHORTLISTED' });

    expect(res.status).toBe(404);
  });

  it('B2 — PATCH /submissions/:id/status rejects review notes > 2000 chars', async () => {
    const placement = makePlacement(vendorId, clientId, makeReqId(), makeCandId(), { status: 'SUBMITTED' });
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(placement);
    mockPrisma.b2BRequirement.findUnique.mockResolvedValue(makeRequirement(clientId, { status: 'OPEN', requiredCount: 2 }));

    const res = await request(app)
      .patch(`/api/b2b/submissions/${placement.id}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'SHORTLISTED', notes: 'x'.repeat(2001) });

    expect(res.status).toBe(400);
  });

  it('A2 — PATCH /submissions/:id/withdraw (vendor withdraws) succeeds', async () => {
    const reqId = makeReqId();
    const candId = makeCandId();
    const placement = makePlacement(vendorId, clientId, reqId, candId, { status: 'SUBMITTED' });
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(placement);

    mockPrisma.$transaction.mockImplementation(async (fn: Function) => fn(mockPrisma));
    mockPrisma.b2BPlacement.update.mockResolvedValue({ ...placement, status: 'WITHDRAWN' });
    mockPrisma.b2BPlacement.count.mockResolvedValue(0);
    mockPrisma.b2BCandidate.update.mockResolvedValue({});

    const res = await request(app)
      .patch(`/api/b2b/submissions/${placement.id}/withdraw`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/withdrawn/i);
  });

  it('D2 — PATCH /submissions/:id/withdraw rejects already-shortlisted submission', async () => {
    const placement = makePlacement(vendorId, clientId, makeReqId(), makeCandId(), { status: 'SHORTLISTED' });
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(placement);

    const res = await request(app)
      .patch(`/api/b2b/submissions/${placement.id}/withdraw`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/SUBMITTED/i);
  });

  it('C2 — PATCH /submissions/:id/withdraw rejects CLIENT role (wrong role)', async () => {
    const res = await request(app)
      .patch(`/api/b2b/submissions/${makePlaceId()}/withdraw`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });

  it('C3 — PATCH /submissions/:id/withdraw rejects vendor B withdrawing vendor A\'s submission', async () => {
    const vendor2Token = makeVendorToken(makeVendorId()); // different vendor
    // findFirst with vendorId from token returns null
    mockPrisma.b2BPlacement.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/b2b/submissions/${makePlaceId()}/withdraw`)
      .set('Authorization', `Bearer ${vendor2Token}`);

    expect(res.status).toBe(404);
  });
});
