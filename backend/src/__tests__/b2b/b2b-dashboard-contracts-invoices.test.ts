/**
 * WS14-T08 — B2B Dashboard, Contracts, Invoices, Settings & Vendors
 *
 * Adds coverage for controller branches not exercised by the existing test files:
 *   - getClientDashboardStats / getVendorDashboardStats (lines 61-190)
 *   - getRecentRequirements / getRecentPlacements / getPendingContracts (192-332)
 *   - getAllContracts / viewContract / downloadContract (606-723)
 *   - createDraftContract / updateContractStatus (724-828)
 *   - getVendors (1557-1585)
 *   - getInvoices / createInvoice / payInvoice / downloadInvoice (1418-1555)
 *   - getB2BSettings / updateB2BSettings (2075-2193)
 *
 * Tests only add coverage — no production code is modified.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist Prisma mock
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $use: vi.fn(),
    $transaction: vi.fn(),
    b2BRequirement: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    b2BContract: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    b2BInvoice: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    b2BPlacement: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    b2BCandidate: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    b2BSettings: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
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
  makeCandId,
  makeRequirement,
  makePlacement,
} from './b2b-test-factory';

// Helper factories
const makeContract = (clientId: string, vendorId: string, overrides: Record<string, unknown> = {}) => ({
  id: `contract-${makeReqId()}`,
  partnerName: 'Partner Corp',
  role: 'Software Engineer',
  status: 'PENDING',
  terms: 'NET30',
  startDate: null,
  clientId,
  vendorId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeInvoice = (clientId: string, vendorId: string, overrides: Record<string, unknown> = {}) => ({
  id: `invoice-${makeReqId()}`,
  invoiceNo: `INV-2026-12345`,
  clientId,
  vendorId,
  contractId: null,
  amount: 5000,
  status: 'PENDING',
  dueDate: null,
  paidAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Dashboard Tests
describe('WS14-T08 — B2B Client Dashboard Stats', () => {
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);
  const vendorToken = makeVendorToken();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.b2BRequirement.count.mockResolvedValue(3);
    mockPrisma.b2BContract.count.mockResolvedValue(1);
    mockPrisma.b2BPlacement.count.mockResolvedValue(2);
  });

  it('A1 - returns stats for authenticated client', async () => {
    const res = await request(app)
      .get('/api/b2b/stats/client')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('value');
  });

  it('C1 - rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/stats/client');
    expect(res.status).toBe(401);
  });

  it('C2 - rejects VENDOR role', async () => {
    const res = await request(app)
      .get('/api/b2b/stats/client')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(403);
  });
});

describe('WS14-T08 - B2B Vendor Dashboard Stats', () => {
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);
  const clientToken = makeClientToken();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.b2BContract.count.mockResolvedValue(2);
    mockPrisma.b2BInvoice.count.mockResolvedValue(1);
    mockPrisma.b2BCandidate.count.mockResolvedValue(5);
    mockPrisma.b2BPlacement.count.mockResolvedValue(3);
    mockPrisma.b2BContract.groupBy.mockResolvedValue([
      { status: 'PENDING', _count: { _all: 1 } },
      { status: 'ACTIVE', _count: { _all: 1 } }
    ]);
    mockPrisma.b2BPlacement.groupBy.mockResolvedValue([
      { status: 'SUBMITTED', _count: { _all: 2 } },
      { status: 'SHORTLISTED', _count: { _all: 1 } }
    ]);
  });

  it('A1 - returns stats for authenticated vendor', async () => {
    const res = await request(app)
      .get('/api/b2b/stats/vendor')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('C1 - rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/stats/vendor');
    expect(res.status).toBe(401);
  });

  it('C2 - rejects CLIENT role', async () => {
    const res = await request(app)
      .get('/api/b2b/stats/vendor')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });
});

describe('WS14-T08 - B2B Recent Requirements Widget', () => {
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.b2BPlacement.groupBy.mockResolvedValue([]);
  });

  it('A1 - returns list of recent requirements', async () => {
    const req1 = makeRequirement(clientId);
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([req1]);
    const res = await request(app)
      .get('/api/b2b/requirements/recent')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id', req1.id);
  });

  it('A2 - returns empty list', async () => {
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/b2b/requirements/recent')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('C1 - rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/requirements/recent');
    expect(res.status).toBe(401);
  });
});

describe('WS14-T08 - B2B Recent Placements Widget', () => {
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.b2BCandidate.findMany.mockResolvedValue([]);
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([]);
    mockPrisma.b2BPlacement.groupBy.mockResolvedValue([]);
  });

  it('A1 - returns empty list', async () => {
    mockPrisma.b2BPlacement.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/b2b/placements/recent')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('A2 - returns placement data with candidate names', async () => {
    const candidateId = makeCandId();
    const requirementId = makeReqId();
    const placement = makePlacement(vendorId, makeClientId(), requirementId, candidateId);
    mockPrisma.b2BPlacement.findMany.mockResolvedValue([placement]);
    mockPrisma.b2BCandidate.findMany.mockResolvedValue([
      { id: candidateId, firstName: 'John', lastName: 'Doe' },
    ]);
    mockPrisma.b2BRequirement.findMany.mockResolvedValue([
      { id: requirementId, title: 'Senior Dev' },
    ]);
    const res = await request(app)
      .get('/api/b2b/placements/recent')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('id', placement.id);
  });

  it('C1 - rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/placements/recent');
    expect(res.status).toBe(401);
  });
});

describe('WS14-T08 - B2B Pending Contracts Widget', () => {
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);

  beforeEach(() => { vi.clearAllMocks(); });

  it('A1 - returns pending contracts list', async () => {
    const contract = makeContract(clientId, makeVendorId());
    mockPrisma.b2BContract.findMany.mockResolvedValue([contract]);
    const res = await request(app)
      .get('/api/b2b/contracts/pending')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('C1 - rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/contracts/pending');
    expect(res.status).toBe(401);
  });
});

describe('WS14-T08 - B2B Contracts CRUD', () => {
  const clientId = makeClientId();
  const vendorId = makeVendorId();
  const clientToken = makeClientToken(clientId);
  const vendorToken = makeVendorToken(vendorId);

  beforeEach(() => { vi.clearAllMocks(); });

  it('A1 - GET /contracts returns empty list', async () => {
    mockPrisma.b2BContract.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/b2b/contracts')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('A2 - GET /contracts returns proper shape', async () => {
    const contract = makeContract(clientId, vendorId);
    mockPrisma.b2BContract.findMany.mockResolvedValue([contract]);
    const res = await request(app)
      .get('/api/b2b/contracts')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('id', contract.id);
    expect(res.body[0]).toHaveProperty('isClient');
    expect(res.body[0]).toHaveProperty('isVendor');
  });

  it('C1 - GET /contracts rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/contracts');
    expect(res.status).toBe(401);
  });

  it('A3 - GET /contracts/:id returns contract details', async () => {
    const contract = makeContract(clientId, vendorId);
    mockPrisma.b2BContract.findFirst.mockResolvedValue(contract);
    const res = await request(app)
      .get(`/api/b2b/contracts/${contract.id}/view`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', contract.id);
    expect(res.body).toHaveProperty('content');
  });

  it('B1 - GET /contracts/:id returns 404 when not found', async () => {
    mockPrisma.b2BContract.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .get('/api/b2b/contracts/nonexistent-id')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(404);
  });

  it('A4 - GET /contracts/:id/download returns file', async () => {
    const contract = makeContract(clientId, vendorId);
    mockPrisma.b2BContract.findFirst.mockResolvedValue(contract);
    const res = await request(app)
      .get(`/api/b2b/contracts/${contract.id}/download`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  it('B2 - GET /contracts/:id/download returns 404 when not found', async () => {
    mockPrisma.b2BContract.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .get('/api/b2b/contracts/nonexistent-id/download')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(404);
  });

  it('A5 - POST /contracts creates draft contract', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: vendorId, role: 'VENDOR' });
    const contract = makeContract(clientId, vendorId);
    mockPrisma.b2BContract.create.mockResolvedValue(contract);
    const res = await request(app)
      .post('/api/b2b/contracts')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ partnerName: 'Partner Corp', role: 'Dev', vendorId, terms: 'NET30' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('contractId');
  });

  it('B3 - POST /contracts rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/b2b/contracts')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ partnerName: 'Partner' });
    expect(res.status).toBe(400);
  });

  it('B4 - POST /contracts rejects invalid vendor ID', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/b2b/contracts')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ partnerName: 'Partner Corp', role: 'Dev', vendorId: 'invalid-vendor' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid vendor/i);
  });

  it('B5 - POST /contracts rejects non-VENDOR role user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: clientId, role: 'CLIENT' });
    const res = await request(app)
      .post('/api/b2b/contracts')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ partnerName: 'Partner Corp', role: 'Dev', vendorId: clientId });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not a vendor/i);
  });

  it('C2 - POST /contracts rejects unauthenticated', async () => {
    const res = await request(app)
      .post('/api/b2b/contracts')
      .send({ partnerName: 'Partner', role: 'Dev', vendorId });
    expect(res.status).toBe(401);
  });
});

describe('WS14-T08 - B2B Contract Status Update', () => {
  const clientId = makeClientId();
  const vendorId = makeVendorId();
  const clientToken = makeClientToken(clientId);
  const vendorToken = makeVendorToken(vendorId);

  beforeEach(() => { vi.clearAllMocks(); });

  it('A1 - vendor approves pending contract', async () => {
    const contract = makeContract(clientId, vendorId, { status: 'PENDING' });
    mockPrisma.b2BContract.findFirst.mockResolvedValue(contract);
    mockPrisma.b2BContract.update.mockResolvedValue({ ...contract, status: 'ACTIVE' });
    const res = await request(app)
      .patch(`/api/b2b/contracts/${contract.id}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it('A2 - client cancels contract', async () => {
    const contract = makeContract(clientId, vendorId, { status: 'ACTIVE' });
    mockPrisma.b2BContract.findFirst.mockResolvedValue(contract);
    mockPrisma.b2BContract.update.mockResolvedValue({ ...contract, status: 'CANCELLED' });
    const res = await request(app)
      .patch(`/api/b2b/contracts/${contract.id}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'CANCELLED' });
    expect(res.status).toBe(200);
  });

  it('B1 - rejects invalid status', async () => {
    const contract = makeContract(clientId, vendorId);
    mockPrisma.b2BContract.findFirst.mockResolvedValue(contract);
    const res = await request(app)
      .patch(`/api/b2b/contracts/${contract.id}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid status/i);
  });

  it('B2 - returns 404 when contract not found', async () => {
    mockPrisma.b2BContract.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/b2b/contracts/nonexistent/status')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(404);
  });

  it('B3 - rejects non-vendor trying to approve pending contract', async () => {
    const contract = makeContract(clientId, vendorId, { status: 'PENDING' });
    mockPrisma.b2BContract.findFirst.mockResolvedValue(contract);
    const res = await request(app)
      .patch(`/api/b2b/contracts/${contract.id}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(403);
  });

  it('B4 - rejects non-client trying to cancel', async () => {
    const contract = makeContract(clientId, vendorId, { status: 'ACTIVE' });
    mockPrisma.b2BContract.findFirst.mockResolvedValue(contract);
    const res = await request(app)
      .patch(`/api/b2b/contracts/${contract.id}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'CANCELLED' });
    expect(res.status).toBe(403);
  });

  it('C1 - rejects unauthenticated', async () => {
    const res = await request(app)
      .patch('/api/b2b/contracts/some-id/status')
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(401);
  });
});

describe('WS14-T08 - B2B Vendors List', () => {
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);

  beforeEach(() => { vi.clearAllMocks(); });

  it('A1 - returns approved vendors list', async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: makeVendorId(), firstName: 'Vendor', lastName: 'One', email: 'v1@test.com', companyName: 'V Corp' },
      { id: makeVendorId(), firstName: 'Vendor', lastName: 'Two', email: 'v2@test.com', companyName: null },
    ]);
    const res = await request(app)
      .get('/api/b2b/vendors')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('email');
  });

  it('A2 - returns empty when no approved vendors', async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/b2b/vendors')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('C1 - rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/vendors');
    expect(res.status).toBe(401);
  });
});

describe('WS14-T08 - B2B Invoices', () => {
  const clientId = makeClientId();
  const vendorId = makeVendorId();
  const clientToken = makeClientToken(clientId);
  const vendorToken = makeVendorToken(vendorId);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([
      { id: clientId, firstName: 'Client', lastName: 'User', companyName: 'ClientCo' },
      { id: vendorId, firstName: 'Vendor', lastName: 'User', companyName: 'VendorCo' },
    ]);
    mockPrisma.b2BContract.findMany.mockResolvedValue([]);
  });

  it('A1 - GET /invoices returns empty list', async () => {
    mockPrisma.b2BInvoice.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/b2b/invoices')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('A2 - GET /invoices returns invoices with proper shape', async () => {
    const invoice = makeInvoice(clientId, vendorId);
    mockPrisma.b2BInvoice.findMany.mockResolvedValue([invoice]);
    const res = await request(app)
      .get('/api/b2b/invoices')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('id', invoice.id);
    expect(res.body[0]).toHaveProperty('invoiceNo');
    expect(res.body[0]).toHaveProperty('status', 'PENDING');
    expect(res.body[0]).toHaveProperty('isClient');
    expect(res.body[0]).toHaveProperty('isVendor');
  });

  it('A3 - GET /invoices includes contract name', async () => {
    const contractId = `contract-${makeReqId()}`;
    const invoice = makeInvoice(clientId, vendorId, { contractId });
    mockPrisma.b2BInvoice.findMany.mockResolvedValue([invoice]);
    mockPrisma.b2BContract.findMany.mockResolvedValue([
      { id: contractId, partnerName: 'Partner Corp', role: 'Dev' },
    ]);
    const res = await request(app)
      .get('/api/b2b/invoices')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('contractName', 'Partner Corp - Dev');
  });

  it('C1 - GET /invoices rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/invoices');
    expect(res.status).toBe(401);
  });

  it('A4 - POST /invoices creates invoice', async () => {
    const invoice = makeInvoice(clientId, vendorId);
    mockPrisma.b2BInvoice.create.mockResolvedValue(invoice);
    const res = await request(app)
      .post('/api/b2b/invoices')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ vendorId, amount: 5000, dueDate: '2026-12-31' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('invoiceId');
    expect(res.body).toHaveProperty('invoiceNumber');
  });

  it('B1 - POST /invoices rejects missing amount', async () => {
    const res = await request(app)
      .post('/api/b2b/invoices')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ vendorId });
    expect(res.status).toBe(400);
  });

  it('C2 - POST /invoices rejects unauthenticated', async () => {
    const res = await request(app)
      .post('/api/b2b/invoices')
      .send({ vendorId, amount: 5000 });
    expect(res.status).toBe(401);
  });

  it('A5 - POST /invoices/:id/pay marks invoice paid', async () => {
    const invoice = makeInvoice(clientId, vendorId);
    mockPrisma.b2BInvoice.findFirst.mockResolvedValue(invoice);
    mockPrisma.b2BInvoice.update.mockResolvedValue({ ...invoice, status: 'PAID' });
    const res = await request(app)
      .post(`/api/b2b/invoices/${invoice.id}/pay`)
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/paid/i);
  });

  it('B2 - POST /invoices/:id/pay returns 404 not found', async () => {
    mockPrisma.b2BInvoice.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/b2b/invoices/nonexistent/pay')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(404);
  });

  it('C3 - POST /invoices/:id/pay rejects unauthenticated', async () => {
    const res = await request(app).post('/api/b2b/invoices/some-id/pay');
    expect(res.status).toBe(401);
  });

  it('A6 - GET /invoices/:id/download returns text file', async () => {
    const invoiceId = `invoice-${makeReqId()}`;
    const res = await request(app)
      .get(`/api/b2b/invoices/${invoiceId}/download`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toContain(invoiceId);
  });
});

describe('WS14-T08 - B2B Settings', () => {
  const clientId = makeClientId();
  const clientToken = makeClientToken(clientId);
  const vendorId = makeVendorId();
  const vendorToken = makeVendorToken(vendorId);

  const mockSettings = {
    id: 'settings-1',
    userId: clientId,
    companyName: 'Test Co',
    contactPerson: 'Test User',
    phone: null,
    address: null,
    website: null,
    description: null,
    emailNotifications: true,
    newSubmissionsNotify: true,
    contractUpdatesNotify: true,
    invoiceRemindersNotify: true,
    weeklyDigestNotify: false,
    defaultPaymentTerms: 'NET30',
    preferredContractDuration: null,
    autoApproveSubmissions: false,
    requireNDA: false,
    bankName: null,
    accountNumber: null,
    routingNumber: null,
    minimumRate: null,
    serviceAreas: [],
    specializations: [],
    availableForNewProjects: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
    });
  });

  it('A1 - GET /settings returns existing settings', async () => {
    mockPrisma.b2BSettings.findUnique.mockResolvedValue(mockSettings);
    const res = await request(app)
      .get('/api/b2b/settings')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('companyName', 'Test Co');
    expect(res.body).toHaveProperty('email', 'test@test.com');
  });

  it('A2 - GET /settings creates defaults when none exist', async () => {
    mockPrisma.b2BSettings.findUnique.mockResolvedValue(null);
    mockPrisma.b2BSettings.create.mockResolvedValue({ ...mockSettings, userId: clientId });
    const res = await request(app)
      .get('/api/b2b/settings')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(mockPrisma.b2BSettings.create).toHaveBeenCalled();
  });

  it('C1 - GET /settings rejects unauthenticated', async () => {
    const res = await request(app).get('/api/b2b/settings');
    expect(res.status).toBe(401);
  });

  it('A3 - PUT /settings updates settings', async () => {
    mockPrisma.b2BSettings.upsert.mockResolvedValue({ ...mockSettings, companyName: 'Updated Co' });
    const res = await request(app)
      .put('/api/b2b/settings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ companyName: 'Updated Co', contactPerson: 'Updated User', emailNotifications: true });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it('C2 - PUT /settings rejects unauthenticated', async () => {
    const res = await request(app).put('/api/b2b/settings').send({ companyName: 'Test' });
    expect(res.status).toBe(401);
  });

  it('A4 - GET /settings works for vendor role', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      email: 'vendor@test.com',
      firstName: 'Vendor',
      lastName: 'User',
    });
    mockPrisma.b2BSettings.findUnique.mockResolvedValue({ ...mockSettings, userId: vendorId });
    const res = await request(app)
      .get('/api/b2b/settings')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(200);
  });
});


