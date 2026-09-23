-- SkillEmbedding storage for the semantic matching engine (Module 15 / AI-04).
-- Company-scoped embeddings: the same skill text can be embedded per company,
-- duplicates within one company scope are prevented by a unique constraint.

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('TECHNICAL', 'DOMAIN', 'SOFT', 'TOOL', 'LANGUAGE', 'CERTIFICATION');

-- CreateTable
CREATE TABLE "skill_embeddings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "companyName" TEXT,
    "skillName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "skillCategory" TEXT,
    "skillType" "SkillType" NOT NULL DEFAULT 'TECHNICAL',
    "skillText" TEXT NOT NULL,
    "embeddingProvider" TEXT NOT NULL DEFAULT 'local-mock',
    "embeddingModel" TEXT NOT NULL DEFAULT 'deterministic-hash-1536d',
    "embeddingVersion" TEXT NOT NULL DEFAULT '1.0',
    "embeddingVector" JSONB NOT NULL,
    "vectorDimension" INTEGER NOT NULL DEFAULT 1536,
    "synonyms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "alternateNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_embeddings_companyId_normalizedName_embeddingModel_key" ON "skill_embeddings"("companyId", "normalizedName", "embeddingModel");

-- CreateIndex
CREATE INDEX "skill_embeddings_companyId_idx" ON "skill_embeddings"("companyId");

-- CreateIndex
CREATE INDEX "skill_embeddings_skillType_idx" ON "skill_embeddings"("skillType");

-- CreateIndex
CREATE INDEX "skill_embeddings_embeddingModel_idx" ON "skill_embeddings"("embeddingModel");

-- CreateIndex
CREATE INDEX "skill_embeddings_createdAt_idx" ON "skill_embeddings"("createdAt");
