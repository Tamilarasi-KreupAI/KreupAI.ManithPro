/**
 * WS14-T08 — B2B Candidates API Tests
 *
 * Tests /api/b2b/candidates* endpoints.
 * Covers: add, list, update, delete, resume upload/download, bulk CSV import.
 * Regression: WS14-T03, WS14-T06, WS14-T07.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoist Prisma mock ──
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $use: vi.fn(),
    b2BCandidate: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    b2BPlacement: {
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock upload utils so no disk access occurs
vi.mock('../../utils/upload', () => ({
  resumeUpload: { single: () => (_req: any, _res: any, next: () => void) => next() },
  validateFileSignature: () => (_req: any, _res: any, next: () => void) => next(),
  handleUploadError: (_err: any, _req: any, res: any, next: () => void) => next(),
}));

// Mock multer for csvUpload (used in b2b.controller)
vi.mock('multer', () => {
  const multerMock: any = () => ({
    single: () => (req: any, _res: any, next: () => void) => {
      // Simulate CSV buffer being attached
      if (req.headers['x-test-csv']) {
        req.file = {
          fieldname: 'file',
          originalname: 'test.csv',
          mimetype: 'text/csv',
          buffer: Buffer.from(req.headers['x-test-csv'] as string, 'base64'),
          size: 100,
        };
      }
      next();
    },
  });
  multerMock.memoryStorage = () => ({});
  return { default: multerMock };
});

// Mock notification controller
vi.mock('../../controllers/notification.controller', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
  getNotifications: vi.fn((_req: any, res: any) => res.json({ notifications: [], unreadCount: 0 })),
  markAsRead: vi.fn((_req: any, res: any) => res.json({ success: true })),
  markAllAsRead: vi.fn((_req: any, res: any) => res.json({ success: true })),
  deleteNotification: vi.fn((_req: any, res: any) => res.json({ success: true })),
  deleteAllRead: vi.fn((_req: any, res: any) => res.json({ success: true })),
  getUnreadCount: vi.fn((_req: any, res: any) => res.json({ count: 0 })),
}));

// Mock fs to prevent real filesystem access
vi.mock('fs', async () => {
  const existsSync = vi.fn().mockReturnValue(false);
  const unlink = vi.fn((_path: string, cb: (err: null) => void) => cb(null));
  const unlinkSync = vi.fn();
  return {
    default: { existsSync, unlink, unlinkSync },
    existsSync,
    unlink,
    unlinkSync,
  };
});

import request from 'supertest';
import app from '../../index';
import {
  makeVendorToken,
  makeClientToken,
  makeCandidateToken,
  makeVendorId,
  makeCandId,
  makeCandidate,
} from './b2b-test-factory';

// ─────────────────────────────────────────────────────────────────────────────
describe('WS14-T08 — B2B Candidates', () => {
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);

  const vendor2Id = makeVendorId();
  const vendor2Token = makeVendorToken(vendor2Id);

  const clientToken = makeClientToken();
  const candidateToken = makeCandidateToken();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── C. Authorization / Security ───────────────────────────────────────────

  it('C1 — GET /candidates rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/candidates');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('C2 — GET /candidates rejects non-VENDOR role (CLIENT)', async () => {
    const res = await request(app)
      .get('/api/b2b/candidates')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });

  it('C3 — GET /candidates rejects CANDIDATE role', async () => {
    const res = await request(app)
      .get('/api/b2b/candidates')
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(res.status).toBe(403);
  });

  // ── A. Happy Paths ────────────────────────────────────────────────────────

  it('A1 — GET /candidates returns empty list in paginated format', async () => {
    mockPrisma.b2BCandidate.findMany.mockResolvedValue([]);
    mockPrisma.b2BCandidate.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.totalItems).toBe(0);
  });

  it('A2 — GET /candidates returns only this vendor\'s candidates in paginated format', async () => {
    const cand = makeCandidate(vendorId);
    mockPrisma.b2BCandidate.findMany.mockResolvedValue([cand]);
    mockPrisma.b2BCandidate.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(cand.id);
    expect(res.body.data[0].email).toBe(cand.email);
    expect(mockPrisma.b2BCandidate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ vendorId }) })
    );
  });

  it('WS14-T09 — GET /candidates rejects invalid pagination with 400', async () => {
    const res = await request(app)
      .get('/api/b2b/candidates?page=-1')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(400);
  });

  it('WS14-T09 — GET /candidates passes search, status, and skill filters to prisma', async () => {
    mockPrisma.b2BCandidate.findMany.mockResolvedValue([]);
    mockPrisma.b2BCandidate.count.mockResolvedValue(0);

    await request(app)
      .get('/api/b2b/candidates?search=John&status=AVAILABLE&skill=React')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(mockPrisma.b2BCandidate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          vendorId,
          status: 'AVAILABLE',
          skills: { has: 'React' },
          OR: [
            { firstName: { contains: 'John', mode: 'insensitive' } },
            { lastName: { contains: 'John', mode: 'insensitive' } },
            { email: { contains: 'John', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });

  it('A3 — POST /candidates creates a candidate successfully (WS14-T03 regression)', async () => {
    const email = `test-${Date.now()}@t08.test`;
    const cand = makeCandidate(vendorId, { email });
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null); // no duplicate
    mockPrisma.b2BCandidate.create.mockResolvedValue(cand);

    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Candidate',
        email,
        skills: ['Node.js'],
      });

    expect(res.status).toBe(201);
    expect(res.body.candidateId).toBe(cand.id);
    // vendorId must come from auth, not request body
    expect(mockPrisma.b2BCandidate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ vendorId }),
      })
    );
  });

  it('A4 — PUT /candidates/:id updates candidate (WS14-T06 regression)', async () => {
    const cand = makeCandidate(vendorId);
    const updated = { ...cand, firstName: 'Updated' };
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(cand);
    mockPrisma.b2BCandidate.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/api/b2b/candidates/${cand.id}`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Updated');
  });

  it('A5 — DELETE /candidates/:id deletes candidate with no active submission (WS14-T06 regression)', async () => {
    const cand = makeCandidate(vendorId);
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(cand);
    mockPrisma.b2BPlacement.count.mockResolvedValue(0); // no active submissions
    mockPrisma.b2BCandidate.delete.mockResolvedValue(cand);

    const res = await request(app)
      .delete(`/api/b2b/candidates/${cand.id}`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  // ── B. Validation ─────────────────────────────────────────────────────────

  it('B1 — POST /candidates rejects missing firstName', async () => {
    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ lastName: 'Doe', email: 'x@t.com', skills: [] });
    expect(res.status).toBe(400);
  });

  it('B2 — POST /candidates rejects missing lastName', async () => {
    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'John', email: 'x@t.com', skills: [] });
    expect(res.status).toBe(400);
  });

  it('B3 — POST /candidates rejects missing email', async () => {
    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'John', lastName: 'Doe', skills: [] });
    expect(res.status).toBe(400);
  });

  it('B4 — POST /candidates rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'John', lastName: 'Doe', email: 'not-an-email', skills: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('B5 — POST /candidates rejects invalid phone', async () => {
    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'J', lastName: 'D', email: 'j@t.com', phone: '123', skills: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/phone/i);
  });

  it('B6 — POST /candidates rejects invalid experience (float)', async () => {
    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'J', lastName: 'D', email: 'j@t.com', experience: 3.5, skills: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/experience/i);
  });

  it('B7 — POST /candidates rejects negative experience', async () => {
    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'J', lastName: 'D', email: 'j@t.com', experience: -1, skills: [] });
    expect(res.status).toBe(400);
  });

  it('B8 — POST /candidates rejects duplicate email for same vendor (409, WS14-T06 regression)', async () => {
    const existingCand = makeCandidate(vendorId);
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(existingCand);

    const res = await request(app)
      .post('/api/b2b/candidates')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'J', lastName: 'D', email: existingCand.email, skills: [] });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/duplicate|already exists/i);
  });

  // ── C. Ownership / Security ───────────────────────────────────────────────

  it('C4 — PUT /candidates/:id rejects update by Vendor B (ownership enforcement)', async () => {
    const cand = makeCandidate(vendorId); // belongs to vendor1
    // Vendor 2 queries: returns null (not found for their vendorId)
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/b2b/candidates/${cand.id}`)
      .set('Authorization', `Bearer ${vendor2Token}`)
      .send({ firstName: 'Hacked' });

    expect(res.status).toBe(404);
    expect(mockPrisma.b2BCandidate.update).not.toHaveBeenCalled();
  });

  it('C5 — DELETE /candidates/:id rejects delete by Vendor B', async () => {
    const cand = makeCandidate(vendorId);
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/b2b/candidates/${cand.id}`)
      .set('Authorization', `Bearer ${vendor2Token}`);

    expect(res.status).toBe(404);
    expect(mockPrisma.b2BCandidate.delete).not.toHaveBeenCalled();
  });

  // ── D. Edge Cases ─────────────────────────────────────────────────────────

  it('D1 — DELETE /candidates/:id blocked when candidate has active submission (WS14-T06 regression)', async () => {
    const cand = makeCandidate(vendorId);
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(cand);
    mockPrisma.b2BPlacement.count.mockResolvedValue(1); // active submission exists

    const res = await request(app)
      .delete(`/api/b2b/candidates/${cand.id}`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/active submission|cannot delete/i);
    expect(mockPrisma.b2BCandidate.delete).not.toHaveBeenCalled();
  });

  it('D2 — PUT /candidates/:id returns 404 for nonexistent ID', async () => {
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/b2b/candidates/nonexistent-id')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ firstName: 'X' });
    expect(res.status).toBe(404);
  });

  it('D3 — DELETE /candidates/:id returns 404 for nonexistent ID', async () => {
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/b2b/candidates/nonexistent-id')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(404);
  });

  it('D4 — GET /candidates/:id returns 404 for nonexistent ID', async () => {
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .get('/api/b2b/candidates/nonexistent-id')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(404);
  });

  // ── WS14-T07 Resume Regression ────────────────────────────────────────────

  it('R1 — GET /candidates/:id/resume returns 404 when no resume uploaded (WS14-T07 regression)', async () => {
    const cand = makeCandidate(vendorId, { resumeUrl: null });
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(cand);

    const res = await request(app)
      .get(`/api/b2b/candidates/${cand.id}/resume`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No resume/i);
  });

  it('R2 — GET /candidates/:id/resume returns 404 for Vendor B (cross-vendor ownership, WS14-T07 regression)', async () => {
    const cand = makeCandidate(vendorId);
    // Vendor 2 queries: not found
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/b2b/candidates/${cand.id}/resume`)
      .set('Authorization', `Bearer ${vendor2Token}`);

    expect(res.status).toBe(404);
  });

  it('R3 — GET /candidates/:id/resume returns 404 when file not on disk (WS14-T07 regression)', async () => {
    const cand = makeCandidate(vendorId, { resumeUrl: '/uploads/resumes/test-resume.pdf' });
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(cand);
    // fs.existsSync is mocked to return false

    const res = await request(app)
      .get(`/api/b2b/candidates/${cand.id}/resume`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/file not found/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Upload Tests (separate describe for clarity)
// ─────────────────────────────────────────────────────────────────────────────
describe('WS14-T08 — B2B Bulk Candidate Upload', () => {
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.b2BCandidate.findFirst.mockResolvedValue(null); // no duplicates by default
    mockPrisma.b2BCandidate.create.mockImplementation((args: any) => ({
      id: makeCandId(),
      ...args.data,
      status: 'AVAILABLE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  const HEADER = 'firstName,lastName,email,phone,experience,skills';

  const buildCsvRequest = (csvContent: string) =>
    request(app)
      .post('/api/b2b/candidates/bulk')
      .set('Authorization', `Bearer ${vendorToken}`)
      .set('x-test-csv', Buffer.from(csvContent, 'utf-8').toString('base64'));

  it('B1 — bulk upload: empty CSV returns 400', async () => {
    const res = await buildCsvRequest('');
    expect(res.status).toBe(400);
  });

  it('B2 — bulk upload: header-only CSV (no data rows) returns 400', async () => {
    const res = await buildCsvRequest(HEADER);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no data rows/i);
  });

  it('B3 — bulk upload: no file uploaded returns 400', async () => {
    // Don't set x-test-csv header → no file
    const res = await request(app)
      .post('/api/b2b/candidates/bulk')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/No CSV/i);
  });

  it('B4 — bulk upload: unauthenticated returns 401', async () => {
    const res = await request(app).post('/api/b2b/candidates/bulk');
    expect(res.status).toBe(401);
  });

  it('A1 — bulk upload: valid CSV creates candidates (WS14-T07 regression)', async () => {
    const email1 = `bulk1-${Date.now()}@t08.test`;
    const email2 = `bulk2-${Date.now()}@t08.test`;
    const csv = [HEADER, `John,Doe,${email1},,,TypeScript`, `Jane,Smith,${email2},,,React`].join('\n');

    const res = await buildCsvRequest(csv);

    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBe(2);
    expect(res.body.summary.created).toBe(2);
    expect(res.body.summary.failed).toBe(0);
    expect(res.body.errors).toHaveLength(0);
  });

  it('B5 — bulk upload: invalid email row is rejected', async () => {
    const csv = [HEADER, 'John,Doe,not-valid-email,,,TypeScript'].join('\n');
    const res = await buildCsvRequest(csv);

    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBe(1);
    expect(res.body.summary.failed).toBe(1);
    expect(res.body.errors[0].row).toBe(2);
    expect(res.body.errors[0].reason).toMatch(/email/i);
  });

  it('B6 — bulk upload: missing firstName row is rejected', async () => {
    const csv = [HEADER, `,Doe,missingfirst@t08.test,,,`].join('\n');
    const res = await buildCsvRequest(csv);

    expect(res.status).toBe(200);
    expect(res.body.summary.failed).toBe(1);
    expect(res.body.errors[0].reason).toMatch(/first name/i);
  });

  it('B7 — bulk upload: duplicate email within the same CSV is caught (WS14-T07 regression)', async () => {
    const email = `dup-${Date.now()}@t08.test`;
    const csv = [
      HEADER,
      `John,Doe,${email},,,TypeScript`,
      `Jane,Smith,${email},,,React`, // duplicate
    ].join('\n');

    const res = await buildCsvRequest(csv);

    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBe(2);
    expect(res.body.summary.created).toBe(1);
    expect(res.body.summary.failed).toBe(1);
    expect(res.body.errors[0].reason).toMatch(/Duplicate email in this file/i);
  });

  it('D1 — bulk upload: mixed valid and invalid rows (WS14-T07 regression)', async () => {
    const email = `mix-${Date.now()}@t08.test`;
    const csv = [
      HEADER,
      `John,Doe,${email},,,TypeScript`, // valid
      `,Doe,nofirstname@t08.test,,,`,   // invalid (no first name)
      `Jane,Smith,bad-email,,,React`,    // invalid (bad email)
    ].join('\n');

    const res = await buildCsvRequest(csv);

    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBe(3);
    expect(res.body.summary.created).toBe(1);
    expect(res.body.summary.failed).toBe(2);
    expect(res.body.errors).toHaveLength(2);
  });

  it('D2 — bulk upload: duplicate email already in DB is rejected (WS14-T07 regression)', async () => {
    const existingEmail = `existing-${Date.now()}@t08.test`;
    // Second call to findFirst returns the existing candidate
    mockPrisma.b2BCandidate.findFirst.mockResolvedValueOnce({
      id: makeCandId(),
      vendorId,
      email: existingEmail,
    });

    const csv = [HEADER, `John,Doe,${existingEmail},,,TypeScript`].join('\n');
    const res = await buildCsvRequest(csv);

    expect(res.status).toBe(200);
    expect(res.body.summary.failed).toBe(1);
    expect(res.body.errors[0].reason).toMatch(/already exists/i);
  });

  it('B8 — bulk upload: invalid experience value is rejected', async () => {
    const email = `exp-${Date.now()}@t08.test`;
    const csv = [HEADER, `John,Doe,${email},,3.5,TypeScript`].join('\n'); // float exp

    const res = await buildCsvRequest(csv);

    expect(res.status).toBe(200);
    expect(res.body.summary.failed).toBe(1);
    expect(res.body.errors[0].reason).toMatch(/experience/i);
  });
});
