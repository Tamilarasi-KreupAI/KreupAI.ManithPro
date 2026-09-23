import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    skillEmbedding: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

import {
  storeEmbedding,
  fetchEmbeddingBySkillAndCompany,
  getOrCreateSkillEmbedding,
  generateLocalEmbedding,
  normalizeSkillText,
  EMBEDDING_PROVIDER,
  EMBEDDING_MODEL,
  EMBEDDING_VERSION,
  EMBEDDING_DIMENSION,
} from '../services/skillEmbedding.service';

const VECTOR_A = generateLocalEmbedding('React', EMBEDDING_DIMENSION);

const storedRow = {
  id: 'emb-row-1',
  companyId: 'company-1',
  companyName: null,
  skillName: 'React',
  normalizedName: 'react',
  skillCategory: null,
  skillType: 'TECHNICAL',
  skillText: 'React',
  embeddingProvider: EMBEDDING_PROVIDER,
  embeddingModel: EMBEDDING_MODEL,
  embeddingVersion: EMBEDDING_VERSION,
  embeddingVector: VECTOR_A,
  vectorDimension: EMBEDDING_DIMENSION,
  synonyms: [],
  alternateNames: [],
  usageCount: 0,
  isActive: true,
  createdById: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SkillEmbedding storage service', () => {
  it('stores an embedding with skill text, vector, provider, model, version and company scope', async () => {
    mockPrisma.skillEmbedding.upsert.mockResolvedValueOnce(storedRow);

    const record = await storeEmbedding({
      skillText: 'React',
      embeddingVector: VECTOR_A,
      embeddingProvider: EMBEDDING_PROVIDER,
      embeddingModel: EMBEDDING_MODEL,
      embeddingVersion: EMBEDDING_VERSION,
      companyId: 'company-1',
    });

    expect(mockPrisma.skillEmbedding.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          companyId_normalizedName_embeddingModel: {
            companyId: 'company-1',
            normalizedName: 'react',
            embeddingModel: EMBEDDING_MODEL,
          },
        },
        create: expect.objectContaining({
          skillText: 'React',
          embeddingVector: VECTOR_A,
          embeddingProvider: EMBEDDING_PROVIDER,
          embeddingModel: EMBEDDING_MODEL,
          embeddingVersion: EMBEDDING_VERSION,
          companyId: 'company-1',
        }),
      })
    );
    expect(record.skillText).toBe('React');
    expect(record.embeddingVector).toEqual(VECTOR_A);
    expect(record.createdAt).toBeInstanceOf(Date);
  });


  it('re-storing the same skill text + company scope does not create a second row', async () => {
    mockPrisma.skillEmbedding.upsert.mockResolvedValue(storedRow);

    const first = await storeEmbedding({
      skillText: 'React',
      embeddingVector: VECTOR_A,
      embeddingProvider: EMBEDDING_PROVIDER,
      embeddingModel: EMBEDDING_MODEL,
      embeddingVersion: EMBEDDING_VERSION,
      companyId: 'company-1',
    });
    const second = await storeEmbedding({
      skillText: 'React',
      embeddingVector: VECTOR_A,
      embeddingProvider: EMBEDDING_PROVIDER,
      embeddingModel: EMBEDDING_MODEL,
      embeddingVersion: EMBEDDING_VERSION,
      companyId: 'company-1',
    });

    // Both calls upsert onto the same unique key → one logical row
    expect(first.id).toBe(second.id);
    expect(mockPrisma.skillEmbedding.upsert).toHaveBeenCalledTimes(2);
    expect(mockPrisma.skillEmbedding.upsert.mock.calls.every(
      ([arg]) => arg.where.companyId_normalizedName_embeddingModel.normalizedName === 'react'
    )).toBe(true);
  });

  it('stores the same skill text for two different company scopes separately', async () => {
    mockPrisma.skillEmbedding.upsert.mockResolvedValue(storedRow);

    await storeEmbedding({
      skillText: 'React',
      embeddingVector: VECTOR_A,
      embeddingProvider: EMBEDDING_PROVIDER,
      embeddingModel: EMBEDDING_MODEL,
      embeddingVersion: EMBEDDING_VERSION,
      companyId: 'company-1',
    });
    await storeEmbedding({
      skillText: 'React',
      embeddingVector: VECTOR_A,
      embeddingProvider: EMBEDDING_PROVIDER,
      embeddingModel: EMBEDDING_MODEL,
      embeddingVersion: EMBEDDING_VERSION,
      companyId: 'company-2',
    });

    const keys = mockPrisma.skillEmbedding.upsert.mock.calls.map(
      ([arg]) => arg.where.companyId_normalizedName_embeddingModel.companyId
    );
    expect(keys).toEqual(['company-1', 'company-2']);
  });

  it('getOrCreateSkillEmbedding reuses the stored vector instead of generating again', async () => {
    mockPrisma.skillEmbedding.findUnique.mockResolvedValueOnce(storedRow);

    const { vector, created } = await getOrCreateSkillEmbedding({
      skillText: 'React',
      companyId: 'company-1',
    });

    expect(created).toBe(false);
    expect(vector).toEqual(VECTOR_A);
    // fetch only — no generate/persist path executed
    expect(mockPrisma.skillEmbedding.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.skillEmbedding.upsert).not.toHaveBeenCalled();
  });

  it('getOrCreateSkillEmbedding generates + persists with real provider/model when nothing is stored', async () => {
    mockPrisma.skillEmbedding.findUnique.mockResolvedValueOnce(null);
    mockPrisma.skillEmbedding.upsert.mockResolvedValueOnce({
      ...storedRow,
      companyId: null,
      embeddingVector: generateLocalEmbedding('Docker', EMBEDDING_DIMENSION),
    });

    const { vector, created } = await getOrCreateSkillEmbedding({
      skillText: 'Docker',
      companyId: null,
    });

    expect(created).toBe(true);
    expect(vector).toHaveLength(EMBEDDING_DIMENSION);
    expect(mockPrisma.skillEmbedding.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          embeddingProvider: EMBEDDING_PROVIDER,
          embeddingModel: EMBEDDING_MODEL,
          embeddingVersion: EMBEDDING_VERSION,
          vectorDimension: EMBEDDING_DIMENSION,
        }),
      })
    );
  });

  it('generates a deterministic vector for the same skill text', () => {
    const a = generateLocalEmbedding('TypeScript');
    const b = generateLocalEmbedding('TypeScript');
    const c = generateLocalEmbedding('Python');

    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(a.every((v) => v >= -1 && v <= 1)).toBe(true);
  });

  it('normalizes skill text consistently for the dedupe key', () => {
    expect(normalizeSkillText('  React  ')).toBe('react');
    expect(normalizeSkillText('REACT')).toBe('react');
  });
});
