import { prisma } from '../database/prisma';

// ============================================================
// Culture Fit
// ============================================================

export async function saveCultureFitScore(data: any) {
  const {
    id,
    profileId,
    companyId = null,
    jobId = null,
    createdAt,
    updatedAt,
    userId,
    ...scoreData
  } = data;

  return prisma.cultureFitAnalysis.upsert({
    where: {
      profileId_companyId_jobId: {
        profileId,
        companyId,
        jobId,
      },
    },
    create: {
      ...scoreData,
      userId,
      profileId,
      companyId,
      jobId,
    },
    update: {
      ...scoreData,
    },
  });
}

export async function getCultureFitScore(
  profileId: string,
  companyId?: string | null,
  jobId?: string | null,
) {
  return prisma.cultureFitAnalysis.findUnique({
    where: {
      profileId_companyId_jobId: {
        profileId,
        companyId: companyId ?? null,
        jobId: jobId ?? null,
      },
    },
  });
}

// ============================================================
// Growth Potential
// ============================================================

export async function saveGrowthPotentialScore(data: any) {
  const {
    id,
    profileId,
    createdAt,
    updatedAt,
    userId,
    ...scoreData
  } = data;

  return prisma.growthPotentialScore.upsert({
    where: { profileId },
    create: {
      ...scoreData,
      userId,
      profileId,
    },
    update: {
      ...scoreData,
    },
  });
}

export async function getGrowthPotentialScore(profileId: string) {
  return prisma.growthPotentialScore.findUnique({
    where: { profileId },
  });
}

// ============================================================
// Technical Depth
// ============================================================

export async function saveTechnicalDepthScore(data: any) {
  const {
    id,
    profileId,
    createdAt,
    updatedAt,
    userId,
    ...scoreData
  } = data;

  return prisma.technicalDepthScore.upsert({
    where: { profileId },
    create: {
      ...scoreData,
      userId,
      profileId,
    },
    update: {
      ...scoreData,
    },
  });
}

export async function getTechnicalDepthScore(profileId: string) {
  return prisma.technicalDepthScore.findUnique({
    where: { profileId },
  });
}

// ============================================================
// Communication
// ============================================================

export async function saveCommunicationScore(data: any) {
  const {
    id,
    profileId,
    createdAt,
    updatedAt,
    userId,
    ...scoreData
  } = data;

  return prisma.communicationScore.upsert({
    where: { profileId },
    create: {
      ...scoreData,
      userId,
      profileId,
    },
    update: {
      ...scoreData,
    },
  });
}

export async function getCommunicationScore(profileId: string) {
  return prisma.communicationScore.findUnique({
    where: { profileId },
  });
}

// ============================================================
// Reliability
// ============================================================

export async function saveReliabilityScore(data: any) {
  const {
    id,
    profileId,
    createdAt,
    updatedAt,
    userId,
    ...scoreData
  } = data;

  return prisma.reliabilityScore.upsert({
    where: { profileId },
    create: {
      ...scoreData,
      userId,
      profileId,
    },
    update: {
      ...scoreData,
    },
  });
}

export async function getReliabilityScore(profileId: string) {
  return prisma.reliabilityScore.findUnique({
    where: { profileId },
  });
}

// ============================================================
// Generic Helpers
// ============================================================

export async function getAllProfileScores(
  profileId: string,
  companyId?: string | null,
  jobId?: string | null,
) {
  const [
    cultureFit,
    growthPotential,
    technicalDepth,
    communication,
    reliability,
  ] = await Promise.all([
    getCultureFitScore(profileId, companyId, jobId),
    getGrowthPotentialScore(profileId),
    getTechnicalDepthScore(profileId),
    getCommunicationScore(profileId),
    getReliabilityScore(profileId),
  ]);

  return {
    cultureFit,
    growthPotential,
    technicalDepth,
    communication,
    reliability,
  };
}