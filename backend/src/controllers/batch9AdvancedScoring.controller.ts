import { Request, Response } from 'express';

import {
  getCultureFitScore as fetchCultureFitScore,
  getGrowthPotentialScore as fetchGrowthPotentialScore,
  getTechnicalDepthScore as fetchTechnicalDepthScore,
  getCommunicationScore as fetchCommunicationScore,
  getReliabilityScore as fetchReliabilityScore,
  getAllProfileScores,
} from '../services/scoringStorage.service';

import {
  computeCultureFitScore,
  computeGrowthPotentialScore,
  computeTechnicalDepthScore,
  computeCommunicationScore,
  computeReliabilityScore,
  computeAndPersistAllAdvancedScores,
  loadCandidateScoringData,
  persistCultureFitScore,
  persistGrowthPotentialScore,
  persistTechnicalDepthScore,
  persistCommunicationScore,
  persistReliabilityScore,
} from '../services/advancedScoring.service';

// ============================================================
// Helpers
// ============================================================

function getAuthenticatedUserId(req: Request): string {
  const user = (req as any).user;

  const userId =
    user?.id ||
    user?.userId ||
    (req.params as any)?.userId ||
    (req.body as any)?.userId;

  if (!userId) {
    const error: any = new Error('Authenticated user not found');
    error.statusCode = 401;
    throw error;
  }

  return String(userId);
}

function queryString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return String(value[0]).trim() || undefined;
  }

  return undefined;
}

function isAI12Score(score: any): boolean {
  return Boolean(
    score &&
      score.scoringVersion === '2.0' &&
      typeof score.overallCultureScore !== 'undefined' ||
      score &&
        score.scoringVersion === '2.0' &&
        typeof score.overallGrowthScore !== 'undefined' ||
      score &&
        score.scoringVersion === '2.0' &&
        typeof score.overallTechnicalScore !== 'undefined' ||
      score &&
        score.scoringVersion === '2.0' &&
        typeof score.overallCommScore !== 'undefined' ||
      score &&
        score.scoringVersion === '2.0' &&
        typeof score.overallReliabilityScore !== 'undefined',
  );
}

function isStoredAI12Score(score: any): boolean {
  return Boolean(score && score.scoringVersion === '2.0');
}

function getErrorStatus(error: any): number {
  return Number.isInteger(error?.statusCode)
    ? error.statusCode
    : 500;
}

function getErrorMessage(
  error: any,
  fallback: string,
): string {
  return error?.message || fallback;
}

function scoreResponse(
  result: any,
  persisted?: any,
): any {
  if (persisted) {
    return persisted;
  }

  return {
    dimension: result.dimension,
    status: result.status,
    score: result.score,
    tier: result.tier,
    inputs: result.inputs,
    components: result.components,
    reason: result.reason,
    scoringVersion: result.scoringVersion,

    // Frontend-compatible overall fields
    ...(result.dimension === 'cultureFit'
      ? {
          overallCultureScore: result.score,
          fitLevel: result.tier,
        }
      : {}),

    ...(result.dimension === 'growthPotential'
      ? {
          overallGrowthScore: result.score,
          growthTier: result.tier,
        }
      : {}),

    ...(result.dimension === 'technicalDepth'
      ? {
          overallTechnicalScore: result.score,
          technicalTier: result.tier,
        }
      : {}),

    ...(result.dimension === 'communication'
      ? {
          overallCommScore: result.score,
          communicationTier: result.tier,
        }
      : {}),

    ...(result.dimension === 'reliability'
      ? {
          overallReliabilityScore: result.score,
          reliabilityTier: result.tier,
        }
      : {}),
  };
}

async function loadRequestContext(req: Request) {
  const userId = getAuthenticatedUserId(req);

  const query = req.query || {};

  const companyId = queryString(query.companyId);
  const jobId = queryString(query.jobId);

  const data = await loadCandidateScoringData(
    userId,
    jobId ?? null,
  );

  const profileId = data.profile?.id;

  if (!profileId) {
    const error: any = new Error(
      `Candidate profile not found for user ${userId}.`,
    );
    error.statusCode = 404;
    throw error;
  }

  return {
    userId,
    profileId,
    companyId,
    jobId,
    data,
  };
}

// ============================================================
// 2.1.3 - CULTURE FIT ANALYSIS
// ============================================================

// Get culture fit analysis for current user
export const getCultureFitAnalysis = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      companyId,
      jobId,
      data,
    } = await loadRequestContext(req);

    const stored = await fetchCultureFitScore(
      profileId,
      companyId ?? null,
      jobId ?? null,
    );

    if (isStoredAI12Score(stored)) {
      return res.json({
        analysis: stored,
        source: 'database',
      });
    }

    const result = computeCultureFitScore(data);

    if (result.status !== 'COMPLETE') {
      return res.json({
        analysis: scoreResponse(result),
        source: 'computed',
        userId,
        profileId,
      });
    }

    const persisted = await persistCultureFitScore(
      userId,
      profileId,
      result,
      companyId ?? null,
      jobId ?? null,
    );

    return res.json({
      analysis: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to get culture fit analysis',
        ),
      });
  }
};

// Generate/regenerate culture fit analysis
export const generateCultureFitAnalysis = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      companyId,
      jobId,
      data,
    } = await loadRequestContext(req);

    const result = computeCultureFitScore(data);

    if (result.status !== 'COMPLETE') {
      return res.status(422).json({
        analysis: scoreResponse(result),
        source: 'computed',
        message:
          'Culture fit score is incomplete because required candidate or job data is missing.',
      });
    }

    const persisted = await persistCultureFitScore(
      userId,
      profileId,
      result,
      companyId ?? null,
      jobId ?? null,
    );

    return res.json({
      analysis: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to generate culture fit analysis',
        ),
      });
  }
};

// Submit culture fit questionnaire
export const submitCultureQuestionnaire = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const body = req.body || {};
    const responses = body.responses || {};

    return res.json({
      submitted: true,
      userId,
      responseCount:
        typeof responses === 'object'
          ? Object.keys(responses).length
          : 0,
      message:
        'Questionnaire responses received. Culture scoring uses stored candidate and job records.',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to submit culture questionnaire',
        ),
      });
  }
};

// ============================================================
// 2.1.4 - GROWTH POTENTIAL SCORE
// ============================================================

// Get growth potential score for current user
export const getGrowthPotentialScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      data,
    } = await loadRequestContext(req);

    const stored = await fetchGrowthPotentialScore(
      profileId,
    );

    if (isStoredAI12Score(stored)) {
      return res.json({
        score: stored,
        source: 'database',
      });
    }

    const result = computeGrowthPotentialScore(data);

    if (result.status !== 'COMPLETE') {
      return res.json({
        score: scoreResponse(result),
        source: 'computed',
        userId,
        profileId,
      });
    }

    const persisted = await persistGrowthPotentialScore(
      userId,
      profileId,
      result,
    );

    return res.json({
      score: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to get growth potential score',
        ),
      });
  }
};

// Regenerate growth potential score
export const regenerateGrowthPotentialScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      data,
    } = await loadRequestContext(req);

    const result = computeGrowthPotentialScore(data);

    if (result.status !== 'COMPLETE') {
      return res.status(422).json({
        score: scoreResponse(result),
        message:
          'Growth potential score is incomplete because required candidate data is missing.',
      });
    }

    const persisted = await persistGrowthPotentialScore(
      userId,
      profileId,
      result,
    );

    return res.json({
      score: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to regenerate growth potential score',
        ),
      });
  }
};

// ============================================================
// 2.1.5 - TECHNICAL DEPTH SCORE
// ============================================================

// Get technical depth score for current user
export const getTechnicalDepthScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      data,
    } = await loadRequestContext(req);

    const stored = await fetchTechnicalDepthScore(
      profileId,
    );

    if (isStoredAI12Score(stored)) {
      return res.json({
        score: stored,
        source: 'database',
      });
    }

    const result = computeTechnicalDepthScore(data);

    if (result.status !== 'COMPLETE') {
      return res.json({
        score: scoreResponse(result),
        source: 'computed',
        userId,
        profileId,
      });
    }

    const persisted = await persistTechnicalDepthScore(
      userId,
      profileId,
      result,
    );

    return res.json({
      score: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to get technical depth score',
        ),
      });
  }
};

// Regenerate technical depth score
export const regenerateTechnicalDepthScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      data,
    } = await loadRequestContext(req);

    const result = computeTechnicalDepthScore(data);

    if (result.status !== 'COMPLETE') {
      return res.status(422).json({
        score: scoreResponse(result),
        message:
          'Technical depth score is incomplete because required candidate data is missing.',
      });
    }

    const persisted = await persistTechnicalDepthScore(
      userId,
      profileId,
      result,
    );

    return res.json({
      score: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to regenerate technical depth score',
        ),
      });
  }
};

// ============================================================
// 2.1.6 - COMMUNICATION SCORE
// ============================================================

// Get communication score for current user
export const getCommunicationScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      data,
    } = await loadRequestContext(req);

    const stored = await fetchCommunicationScore(
      profileId,
    );

    if (isStoredAI12Score(stored)) {
      return res.json({
        score: stored,
        source: 'database',
      });
    }

    const result = computeCommunicationScore(data);

    if (result.status !== 'COMPLETE') {
      return res.json({
        score: scoreResponse(result),
        source: 'computed',
        userId,
        profileId,
      });
    }

    const persisted = await persistCommunicationScore(
      userId,
      profileId,
      result,
    );

    return res.json({
      score: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to get communication score',
        ),
      });
  }
};

// Regenerate communication score
export const regenerateCommunicationScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      data,
    } = await loadRequestContext(req);

    const result = computeCommunicationScore(data);

    if (result.status !== 'COMPLETE') {
      return res.status(422).json({
        score: scoreResponse(result),
        message:
          'Communication score is incomplete because required communication data is missing.',
      });
    }

    const persisted = await persistCommunicationScore(
      userId,
      profileId,
      result,
    );

    return res.json({
      score: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to regenerate communication score',
        ),
      });
  }
};

// ============================================================
// 2.1.7 - RELIABILITY SCORE
// ============================================================

// Get reliability score for current user
export const getReliabilityScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      data,
    } = await loadRequestContext(req);

    const stored = await fetchReliabilityScore(
      profileId,
    );

    if (isStoredAI12Score(stored)) {
      return res.json({
        score: stored,
        source: 'database',
      });
    }

    const result = computeReliabilityScore(data);

    if (result.status !== 'COMPLETE') {
      return res.json({
        score: scoreResponse(result),
        source: 'computed',
        userId,
        profileId,
      });
    }

    const persisted = await persistReliabilityScore(
      userId,
      profileId,
      result,
    );

    return res.json({
      score: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to get reliability score',
        ),
      });
  }
};

// Get reliability score for a specific user
// Recruiter view
export const getUserReliabilityScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const targetUserId = String(
      (req.params as any).userId || '',
    );

    if (!targetUserId) {
      return res.status(400).json({
        error: 'userId parameter is required',
      });
    }

    const jobId = queryString(
      (req.query as any)?.jobId,
    );

    const data = await loadCandidateScoringData(
      targetUserId,
      jobId ?? null,
    );

    const profileId = data.profile?.id;

    if (!profileId) {
      return res.status(404).json({
        error: `Candidate profile not found for user ${targetUserId}.`,
      });
    }

    const stored = await fetchReliabilityScore(
      profileId,
    );

    if (isStoredAI12Score(stored)) {
      return res.json({
        score: stored,
        source: 'database',
      });
    }

    const result = computeReliabilityScore(data);

    if (result.status !== 'COMPLETE') {
      return res.json({
        score: scoreResponse(result),
        source: 'computed',
        userId: targetUserId,
        profileId,
      });
    }

    const persisted = await persistReliabilityScore(
      targetUserId,
      profileId,
      result,
    );

    return res.json({
      score: scoreResponse(result, persisted),
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to get user reliability score',
        ),
      });
  }
};

// ============================================================
// COMPREHENSIVE SCORING DASHBOARD
// ============================================================

// Get all advanced scores for current user
export const getAllAdvancedScores = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      userId,
      profileId,
      companyId,
      jobId,
    } = await loadRequestContext(req);

    // First read scores already persisted by AI-12.
    const storedScores = await getAllProfileScores(
      profileId,
      companyId ?? null,
      jobId ?? null,
    );

    const allStoredAI12 =
      isStoredAI12Score(storedScores.cultureFit) &&
      isStoredAI12Score(storedScores.growthPotential) &&
      isStoredAI12Score(storedScores.technicalDepth) &&
      isStoredAI12Score(storedScores.communication) &&
      isStoredAI12Score(storedScores.reliability);

    if (allStoredAI12) {
      return res.json({
        userId,
        profileId,
        lastUpdated: new Date().toISOString(),
        scores: storedScores,
        source: 'database',
      });
    }

    // No complete AI-12 set exists yet.
    // Compute from current candidate/job records and persist it.
    const result =
      await computeAndPersistAllAdvancedScores(
        userId,
        jobId ?? null,
        companyId ?? null,
      );

    const refreshedScores =
      await getAllProfileScores(
        profileId,
        companyId ?? null,
        jobId ?? null,
      );

    return res.json({
      userId,
      profileId,
      lastUpdated: new Date().toISOString(),
      scores: {
        cultureFit:
          refreshedScores.cultureFit ??
          scoreResponse(result.cultureFit),

        growthPotential:
          refreshedScores.growthPotential ??
          scoreResponse(result.growthPotential),

        technicalDepth:
          refreshedScores.technicalDepth ??
          scoreResponse(result.technicalDepth),

        communication:
          refreshedScores.communication ??
          scoreResponse(result.communication),

        reliability:
          refreshedScores.reliability ??
          scoreResponse(result.reliability),
      },
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to get all advanced scores',
        ),
      });
  }
};

// Regenerate all advanced scores
export const regenerateAllAdvancedScores = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const companyId = queryString(
      req.query?.companyId,
    );

    const jobId = queryString(
      req.query?.jobId,
    );

    const result =
      await computeAndPersistAllAdvancedScores(
        userId,
        jobId ?? null,
        companyId ?? null,
      );

    return res.json({
      userId,
      lastUpdated: new Date().toISOString(),
      scores: {
        cultureFit: scoreResponse(
          result.cultureFit,
          result.persisted.cultureFit,
        ),

        growthPotential: scoreResponse(
          result.growthPotential,
          result.persisted.growthPotential,
        ),

        technicalDepth: scoreResponse(
          result.technicalDepth,
          result.persisted.technicalDepth,
        ),

        communication: scoreResponse(
          result.communication,
          result.persisted.communication,
        ),

        reliability: scoreResponse(
          result.reliability,
          result.persisted.reliability,
        ),
      },
      source: 'computed-and-persisted',
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to regenerate all advanced scores',
        ),
      });
  }
};

// ============================================================
// Candidate Scoring Dashboard
// ============================================================

export const getCandidateScoringDashboard = async (
  req: Request,
  res: Response,
) => {
  try {
    const candidateId = String(
      (req.params as any).candidateId || '',
    );

    if (!candidateId) {
      return res.status(400).json({
        error: 'candidateId parameter is required',
      });
    }

    const companyId = queryString(
      req.query?.companyId,
    );

    const jobId = queryString(
      req.query?.jobId,
    );

    // Compute/persist the current stored candidate scores.
    const result =
      await computeAndPersistAllAdvancedScores(
        candidateId,
        jobId ?? null,
        companyId ?? null,
      );

    // Read back the persisted values so dashboard values
    // come from the AI-11 storage layer.
    const data = result.data;

    const profileId = data.profile?.id;

    if (!profileId) {
      return res.status(404).json({
        error: `Candidate profile not found for user ${candidateId}.`,
      });
    }

    const storedScores =
      await getAllProfileScores(
        profileId,
        companyId ?? null,
        jobId ?? null,
      );

    const candidateName =
      [
        data.user?.firstName,
        data.user?.lastName,
      ]
        .filter(Boolean)
        .join(' ') ||
      candidateId;

    const numericScores = [
      storedScores.cultureFit?.overallCultureScore,
      storedScores.growthPotential?.overallGrowthScore,
      storedScores.technicalDepth?.overallTechnicalScore,
      storedScores.communication?.overallCommScore,
      storedScores.reliability?.overallReliabilityScore,
    ].filter(
      (value): value is number =>
        typeof value === 'number' &&
        Number.isFinite(value),
    );

    const overallScore =
      numericScores.length > 0
        ? Math.round(
            numericScores.reduce(
              (sum, value) => sum + value,
              0,
            ) / numericScores.length,
          )
        : null;

    return res.json({
      dashboard: {
        candidateId,
        candidateName,
        profileId,
        lastUpdated: new Date().toISOString(),

        scores: {
          cultureFit:
            storedScores.cultureFit ??
            scoreResponse(result.cultureFit),

          growthPotential:
            storedScores.growthPotential ??
            scoreResponse(result.growthPotential),

          technicalDepth:
            storedScores.technicalDepth ??
            scoreResponse(result.technicalDepth),

          communication:
            storedScores.communication ??
            scoreResponse(result.communication),

          reliability:
            storedScores.reliability ??
            scoreResponse(result.reliability),
        },

        overallScore,

        scoringVersion: '2.0',

        source: 'database',
      },
    });
  } catch (error: any) {
    return res
      .status(getErrorStatus(error))
      .json({
        error: getErrorMessage(
          error,
          'Failed to get candidate scoring dashboard',
        ),
      });
  }
};