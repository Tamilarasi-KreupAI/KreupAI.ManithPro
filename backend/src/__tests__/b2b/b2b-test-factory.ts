/**
 * WS14-T08 — B2B Test Factory
 *
 * Generates unique test data and tokens. Never hardcodes production IDs.
 * All IDs are generated with a test-unique prefix to prevent collisions.
 */
import { generateToken } from '../../utils/jwt';

let counter = 0;
const uid = () => `t08-${Date.now()}-${++counter}`;

// ─── Token Factories ──────────────────────────────────────────────────────────

export const makeVendorToken = (vendorId = uid()) =>
  generateToken({ userId: vendorId, email: `vendor-${vendorId}@t08.test`, role: 'VENDOR' });

export const makeClientToken = (clientId = uid()) =>
  generateToken({ userId: clientId, email: `client-${clientId}@t08.test`, role: 'CLIENT' });

export const makeAdminToken = (adminId = uid()) =>
  generateToken({ userId: adminId, email: `admin-${adminId}@t08.test`, role: 'ADMIN' });

export const makeCandidateToken = (candidateId = uid()) =>
  generateToken({ userId: candidateId, email: `candidate-${candidateId}@t08.test`, role: 'CANDIDATE' });

// ─── Data Factories ───────────────────────────────────────────────────────────

export const makeVendorId = () => `vendor-${uid()}`;
export const makeClientId = () => `client-${uid()}`;
export const makeReqId   = () => `req-${uid()}`;
export const makeCandId  = () => `cand-${uid()}`;
export const makePlaceId = () => `place-${uid()}`;

export const makeCandidate = (vendorId: string, overrides: Record<string, unknown> = {}) => ({
  id: makeCandId(),
  vendorId,
  firstName: 'Test',
  lastName: 'Candidate',
  email: `candidate-${uid()}@t08.test`,
  phone: null,
  skills: ['TypeScript'],
  experience: 3,
  resumeUrl: null,
  status: 'AVAILABLE',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const makeRequirement = (clientId: string, overrides: Record<string, unknown> = {}) => ({
  id: makeReqId(),
  clientId,
  title: `Requirement ${uid()}`,
  description: 'Test requirement',
  primarySkills: ['Node.js'],
  location: 'Remote',
  workMode: 'REMOTE',
  employmentType: 'CONTRACT',
  minExperience: 2,
  maxExperience: 5,
  budget: 5000,
  currency: 'USD',
  requiredCount: 2,
  proposalsCount: 0,
  status: 'OPEN',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const makePlacement = (
  vendorId: string,
  clientId: string,
  requirementId: string,
  candidateId: string,
  overrides: Record<string, unknown> = {}
) => ({
  id: makePlaceId(),
  vendorId,
  clientId,
  requirementId,
  candidateId,
  title: 'Test Requirement',
  status: 'SUBMITTED',
  notes: null,
  submittedAt: new Date(),
  reviewedAt: null,
  reviewedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ─── CSV Helpers ──────────────────────────────────────────────────────────────

/** Build a valid CSV buffer for bulk upload tests */
export const makeCsvBuffer = (rows: string[]): Buffer =>
  Buffer.from(['firstName,lastName,email,phone,experience,skills', ...rows].join('\n'), 'utf-8');

export const validCsvRow = (email: string) =>
  `John,Doe,${email},,3,"TypeScript,Node.js"`;
