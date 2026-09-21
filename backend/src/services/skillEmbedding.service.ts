import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// SKILL EMBEDDING STORAGE SERVICE
// Backs Module 15 (Semantic Matching Engine) — company-scoped embedding
// persistence. The same skill within the same company scope is stored once
// and reused; the same skill in a different company scope is stored
// separately (enforced by the DB-level unique constraint).
// ============================================

export interface StoreEmbeddingInput {
  skillText: string;
  embeddingVector: number[];
  embeddingProvider: string;
  embeddingModel: string;
  embeddingVersion: string;
  companyId: string | null;
  companyName?: string | null;
  skillName?: string;
  skillCategory?: string | null;
  skillType?: string;
  vectorDimension?: number;
  createdById?: string | null;
}

/**
 * Normalize skill text into the dedupe key used by the unique constraint.
 */
export const normalizeSkillText = (skillText: string): string =>
  skillText.toLowerCase().trim();

/**
 * Store an embedding for a skill within a company scope.
 *
 * The database-level unique constraint on
 * (companyId, normalizedName, embeddingModel) guarantees that storing the
 * same skill text within the same company scope twice does not create a
 * second row — the existing row is returned instead.
 */
export const storeEmbedding = async (input: StoreEmbeddingInput) => {
  const normalizedName = normalizeSkillText(input.skillName ?? input.skillText);

  return prisma.skillEmbedding.upsert({
    where: {
      companyId_normalizedName_embeddingModel: {
        companyId: input.companyId,
        normalizedName,
        embeddingModel: input.embeddingModel,
      },
    },
    create: {
      companyId: input.companyId,
      companyName: input.companyName ?? null,
      skillName: input.skillName ?? input.skillText,
      normalizedName,
      skillCategory: input.skillCategory ?? null,
      // Cast is safe: model enum values match the controller's skill types.
      skillType: (input.skillType as any) ?? 'TECHNICAL',
      skillText: input.skillText,
      embeddingProvider: input.embeddingProvider,
      embeddingModel: input.embeddingModel,
      embeddingVersion: input.embeddingVersion,
      embeddingVector: input.embeddingVector,
      vectorDimension: input.vectorDimension ?? input.embeddingVector.length,
      createdById: input.createdById ?? null,
    },
    update: {
      embeddingVector: input.embeddingVector,
      embeddingProvider: input.embeddingProvider,
      embeddingVersion: input.embeddingVersion,
      vectorDimension: input.vectorDimension ?? input.embeddingVector.length,
    },
  });
};

/**
 * Fetch a stored embedding by skill text + company scope.
 * Returns the record including the stored vector and provider/model
 * metadata, or null when no embedding has been persisted yet.
 */
export const fetchEmbeddingBySkillAndCompany = async (
  skillText: string,
  companyId: string | null,
  embeddingModel?: string
) => {
  return prisma.skillEmbedding.findUnique({
    where: {
      companyId_normalizedName_embeddingModel: {
        companyId,
        normalizedName: normalizeSkillText(skillText),
        embeddingModel: embeddingModel ?? 'deterministic-hash-1536d',
      },
    },
  });
};

/**
 * Deterministic local embedding generator — the actual embedding
 * implementation currently in use (no external API call). Produces a stable
 * vector for the same input so persisted embeddings remain reproducible.
 */
export const generateLocalEmbedding = (skillText: string, dimension = 1536): number[] => {
  const vector = new Array<number>(dimension);
  let h1 = 2166136261;
  let h2 = 16777619;
  for (let i = 0; i < skillText.length; i++) {
    h1 = (h1 ^ skillText.charCodeAt(i)) >>> 0;
    h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = (h2 + skillText.charCodeAt(i) * (i + 1)) >>> 0;
  }
  let state = h1 ^ h2;
  for (let i = 0; i < dimension; i++) {
    // xorshift32 — deterministic per (skillText)
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5; state >>>= 0;
    vector[i] = (state / 0xffffffff) * 2 - 1;
  }
  return vector;
};

/** Metadata describing the actual embedding generation implementation. */
export const EMBEDDING_PROVIDER = 'local-mock';
export const EMBEDDING_MODEL = 'deterministic-hash-1536d';
export const EMBEDDING_VERSION = '1.0';
export const EMBEDDING_DIMENSION = 1536;

/**
 * Reuse-or-generate: fetch a stored embedding for the skill + company scope;
 * if none exists, generate one with the actual local generator, persist it,
 * and return it. Always returns { vector, created } plus the stored record.
 */
export const getOrCreateSkillEmbedding = async (params: {
  skillText: string;
  companyId: string | null;
  companyName?: string | null;
  skillName?: string;
  skillCategory?: string | null;
  skillType?: string;
  createdById?: string | null;
}): Promise<{ vector: number[]; created: boolean; record: any }> => {
  const existing = await fetchEmbeddingBySkillAndCompany(
    params.skillText,
    params.companyId,
    EMBEDDING_MODEL
  );

  if (existing && existing.isActive) {
    return { vector: existing.embeddingVector as number[], created: false, record: existing };
  }

  const vector = generateLocalEmbedding(params.skillText, EMBEDDING_DIMENSION);
  const record = await storeEmbedding({
    skillText: params.skillText,
    embeddingVector: vector,
    embeddingProvider: EMBEDDING_PROVIDER,
    embeddingModel: EMBEDDING_MODEL,
    embeddingVersion: EMBEDDING_VERSION,
    companyId: params.companyId,
    companyName: params.companyName ?? null,
    skillName: params.skillName,
    skillCategory: params.skillCategory ?? null,
    skillType: params.skillType,
    vectorDimension: EMBEDDING_DIMENSION,
    createdById: params.createdById ?? null,
  });

  return { vector, created: true, record };
};

export default prisma;
