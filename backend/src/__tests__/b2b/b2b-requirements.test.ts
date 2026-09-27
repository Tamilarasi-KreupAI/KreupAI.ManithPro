/**
 * WS14-T08 — B2B Requirements Tests
 *
 * Tests GET /api/b2b/requirements/open
 * - Happy paths: vendor gets open requirements
 * - Auth: unauthenticated, wrong role
 * - Edge cases: empty list, nonexistent
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $use: vi.fn(),
    b2BRequirement: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
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
  makeRequirement,
} from './b2b-test-factory';

describe('WS14-T08 — B2B Requirements (Vendor View)', () => {
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([
      { id: clientId, firstName: 'Big', lastName: 'Client', companyName: 'BigCo' },
    ]);
  });

  // ── C. Authorization ──────────────────────────────────────────────────────

  it('C1 — GET /requirements/open rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/requirements/open');
    expect(res.status).toBe(401);
  });

  it('C2 — GET /requirements/open rejects CLIENT role (vendor-only route)', async () => {
    const res = await request(app)
      .get('/api/b2b/requirements/open')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });

  // ── A. Happy Paths ────────────────────────────────────────────────────────

  it('A1 — GET /requirements/open returns empty data array and pagination metadata when no open reqs', async () => {
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([]);
    mockPrisma.b2BRequirement.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/b2b/requirements/open')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.totalItems).toBe(0);
  });

  it('A2 — GET /requirements/open returns list of open requirements in paginated data', async () => {
    const req1 = makeRequirement(clientId);
    const req2 = makeRequirement(clientId);
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([req1, req2]);
    mockPrisma.b2BRequirement.count.mockResolvedValue(2);

    const res = await request(app)
      .get('/api/b2b/requirements/open')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].id).toBe(req1.id);
    expect(res.body.data[0].status).toBe('OPEN');
    expect(res.body.pagination.totalItems).toBe(2);
  });

  it('A3 — GET /requirements/open response shape includes required fields', async () => {
    const req = makeRequirement(clientId);
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([req]);
    mockPrisma.b2BRequirement.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/b2b/requirements/open')
      .set('Authorization', `Bearer ${vendorToken}`);

    const item = res.body.data[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('title');
    expect(item).toHaveProperty('status');
    expect(item.status).toBe('OPEN');
  });

  it('WS14-T09 — rejects invalid page or pageSize with 400', async () => {
    const res1 = await request(app)
      .get('/api/b2b/requirements/open?page=invalid')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res1.status).toBe(400);

    const res2 = await request(app)
      .get('/api/b2b/requirements/open?pageSize=100')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res2.status).toBe(400);
  });

  it('WS14-T09 — passes search and skill filters to prisma', async () => {
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([]);
    mockPrisma.b2BRequirement.count.mockResolvedValue(0);

    await request(app)
      .get('/api/b2b/requirements/open?search=React&skill=TypeScript')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(mockPrisma.b2BRequirement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'OPEN',
          primarySkills: { has: 'TypeScript' },
          OR: [
            { title: { contains: 'React', mode: 'insensitive' } },
            { description: { contains: 'React', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });

  // ── D. Edge Cases ─────────────────────────────────────────────────────────

  it('D1 — GET /requirements/open only returns OPEN requirements (not CLOSED)', async () => {
    // Controller filters by status: 'OPEN' — we verify the Prisma call
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([]);

    await request(app)
      .get('/api/b2b/requirements/open')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(mockPrisma.b2BRequirement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'OPEN' } })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Client-side requirement management
// ─────────────────────────────────────────────────────────────────────────────
describe('WS14-T08 — B2B Requirements (Client Management)', () => {
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);
  const vendorToken = makeVendorToken();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('C1 — POST /requirements rejects unauthenticated', async () => {
    const res = await request(app).post('/api/b2b/requirements').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });

  it('C2 — POST /requirements rejects VENDOR role', async () => {
    const res = await request(app)
      .post('/api/b2b/requirements')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ title: 'Test' });
    expect(res.status).toBe(403);
  });

  it('B1 — POST /requirements rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/b2b/requirements')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({}); // empty
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('A1 — POST /requirements creates requirement', async () => {
    const req = makeRequirement(clientId);
    mockPrisma.b2BRequirement.create.mockResolvedValue(req);

    const res = await request(app)
      .post('/api/b2b/requirements')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: req.title,
        description: req.description,
        primarySkills: ['Node.js', 'TypeScript'],
        count: req.requiredCount,
        location: req.location,
        workMode: req.workMode,
        employmentType: req.employmentType,
      });

    expect(res.status).toBe(201);
    // clientId must be taken from auth, not body
    expect(mockPrisma.b2BRequirement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ clientId }),
      })
    );
  });
});
