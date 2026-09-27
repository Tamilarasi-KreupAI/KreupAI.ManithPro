/**
 * WS14-T08 — B2B Auth Registration Tests
 *
 * Tests POST /api/auth/register/b2b
 * - Happy paths: vendor & client registration
 * - Validation: missing fields, bad email, wrong role
 * - Duplicate email
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoist Prisma mock (must be before any imports that load @prisma/client) ──
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $use: vi.fn(),
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// ── Also mock bcryptjs so tests don't do real hashing ──
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}));

import request from 'supertest';
import app from '../../index';
import { makeVendorId } from './b2b-test-factory';

describe('WS14-T08 — B2B Auth Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(null); // no duplicate by default
  });

  const validVendorPayload = () => ({
    firstName: 'Acme',
    lastName: 'Vendor',
    email: `vendor-${makeVendorId()}@t08reg.test`,
    password: 'SecurePass123!',
    role: 'VENDOR',
    companyName: 'Acme Corp',
    companyEmail: 'acme@corp.test',
  });

  const validClientPayload = () => ({
    firstName: 'Big',
    lastName: 'Client',
    email: `client-${makeVendorId()}@t08reg.test`,
    password: 'SecurePass456!',
    role: 'CLIENT',
    companyName: 'BigCo',
    companyEmail: 'big@client.test',
  });

  // ── A. Happy Paths ────────────────────────────────────────────────────────

  it('A1 — registers a VENDOR successfully', async () => {
    const payload = validVendorPayload();
    const newUser = {
      id: makeVendorId(),
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: 'VENDOR',
      companyName: payload.companyName,
      companyEmail: payload.companyEmail,
      approvalStatus: 'PENDING',
      approvalRequestedAt: new Date(),
      createdAt: new Date(),
    };
    mockPrisma.user.create.mockResolvedValue(newUser);

    const res = await request(app)
      .post('/api/auth/register/b2b')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/submitted successfully/i);
    expect(res.body.user.role).toBe('VENDOR');
    expect(res.body.user.approvalStatus).toBe('PENDING');
    // T08 regression: no token is returned before admin approval
    expect(res.body.token).toBeUndefined();
  });

  it('A2 — registers a CLIENT successfully', async () => {
    const payload = validClientPayload();
    mockPrisma.user.create.mockResolvedValue({
      id: makeVendorId(),
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: 'CLIENT',
      companyName: payload.companyName,
      companyEmail: payload.companyEmail,
      approvalStatus: 'PENDING',
      approvalRequestedAt: new Date(),
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register/b2b')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('CLIENT');
  });

  // ── B. Validation ─────────────────────────────────────────────────────────

  it('B1 — rejects missing firstName', async () => {
    const { firstName: _omit, ...payload } = validVendorPayload() as any;
    const res = await request(app).post('/api/auth/register/b2b').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('B2 — rejects missing companyName', async () => {
    const { companyName: _omit, ...payload } = validVendorPayload() as any;
    const res = await request(app).post('/api/auth/register/b2b').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('B3 — rejects missing companyEmail', async () => {
    const { companyEmail: _omit, ...payload } = validVendorPayload() as any;
    const res = await request(app).post('/api/auth/register/b2b').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('B4 — rejects invalid company email format', async () => {
    const res = await request(app)
      .post('/api/auth/register/b2b')
      .send({ ...validVendorPayload(), companyEmail: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('B5 — rejects unsupported role (RECRUITER)', async () => {
    const res = await request(app)
      .post('/api/auth/register/b2b')
      .send({ ...validVendorPayload(), role: 'RECRUITER' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/CLIENT or VENDOR/i);
  });

  it('B6 — rejects ADMIN role', async () => {
    const res = await request(app)
      .post('/api/auth/register/b2b')
      .send({ ...validVendorPayload(), role: 'ADMIN' });
    expect(res.status).toBe(400);
  });

  // ── C. Duplicate ──────────────────────────────────────────────────────────

  it('C1 — rejects duplicate email (409)', async () => {
    const payload = validVendorPayload();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user', email: payload.email });

    const res = await request(app).post('/api/auth/register/b2b').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });
});
