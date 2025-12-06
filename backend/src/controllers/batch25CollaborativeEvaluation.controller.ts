import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// 6.2.1 SCORECARD TEMPLATES
// ============================================================================

// Create scorecard template
export const createScorecardTemplate = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      jobId,
      interviewStage,
      criteria,
      ratingScale,
      requiredFields,
      optionalFields,
      autoScoring,
      passingThreshold,
    } = req.body;

    const template = await prisma.scorecardTemplate.create({
      data: {
        name,
        description,
        jobId,
        interviewStage,
        criteria,
        ratingScale,
        requiredFields,
        optionalFields,
        autoScoring: autoScoring || false,
        passingThreshold,
        createdBy: (req as any).user.id,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Scorecard template created successfully',
    });
  } catch (error) {
    console.error('Error creating scorecard template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scorecard template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get scorecard templates
export const getScorecardTemplates = async (req: Request, res: Response) => {
  try {
    const { jobId, interviewStage, isActive, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (interviewStage) where.interviewStage = interviewStage;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [templates, total] = await Promise.all([
      prisma.scorecardTemplate.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.scorecardTemplate.count({ where }),
    ]);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching scorecard templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scorecard templates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get scorecard template by ID
export const getScorecardTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.scorecardTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Scorecard template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error fetching scorecard template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scorecard template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update scorecard template
export const updateScorecardTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await prisma.scorecardTemplate.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: template,
      message: 'Scorecard template updated successfully',
    });
  } catch (error) {
    console.error('Error updating scorecard template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scorecard template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Clone scorecard template
export const cloneScorecardTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, jobId } = req.body;

    const original = await prisma.scorecardTemplate.findUnique({
      where: { id },
    });

    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'Original template not found',
      });
    }

    const cloned = await prisma.scorecardTemplate.create({
      data: {
        name: name || `${original.name} (Copy)`,
        description: original.description,
        jobId: jobId || original.jobId,
        interviewStage: original.interviewStage,
        criteria: original.criteria,
        ratingScale: original.ratingScale,
        requiredFields: original.requiredFields,
        optionalFields: original.optionalFields,
        autoScoring: original.autoScoring,
        passingThreshold: original.passingThreshold,
        createdBy: (req as any).user.id,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: cloned,
      message: 'Scorecard template cloned successfully',
    });
  } catch (error) {
    console.error('Error cloning scorecard template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clone scorecard template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 6.2.2 INTERVIEW FEEDBACK FORMS
// ============================================================================

// Submit interview feedback
export const submitInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const {
      applicationId,
      interviewId,
      scorecardTemplateId,
      ratings,
      overallScore,
      strengths,
      weaknesses,
      recommendation,
      notes,
      attachments,
      timeSpent,
    } = req.body;

    const feedback = await prisma.interviewFeedback.create({
      data: {
        applicationId,
        interviewId,
        scorecardTemplateId,
        evaluatorId: (req as any).user.id,
        ratings,
        overallScore,
        strengths,
        weaknesses,
        recommendation,
        notes,
        attachments,
        timeSpent,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: feedback,
      message: 'Interview feedback submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting interview feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit interview feedback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get interview feedbacks
export const getInterviewFeedbacks = async (req: Request, res: Response) => {
  try {
    const {
      applicationId,
      interviewId,
      evaluatorId,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const where: any = {};
    if (applicationId) where.applicationId = applicationId;
    if (interviewId) where.interviewId = interviewId;
    if (evaluatorId) where.evaluatorId = evaluatorId;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [feedbacks, total] = await Promise.all([
      prisma.interviewFeedback.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.interviewFeedback.count({ where }),
    ]);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching interview feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview feedbacks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get feedback by ID
export const getInterviewFeedbackById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.interviewFeedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Interview feedback not found',
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Error fetching interview feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview feedback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update interview feedback
export const updateInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const feedback = await prisma.interviewFeedback.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: feedback,
      message: 'Interview feedback updated successfully',
    });
  } catch (error) {
    console.error('Error updating interview feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview feedback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Save feedback draft
export const saveFeedbackDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const draftData = req.body;

    const feedback = await prisma.interviewFeedback.upsert({
      where: { id: id || 'new' },
      update: {
        ...draftData,
        status: 'DRAFT',
        updatedAt: new Date(),
      },
      create: {
        ...draftData,
        evaluatorId: (req as any).user.id,
        status: 'DRAFT',
      },
    });

    res.json({
      success: true,
      data: feedback,
      message: 'Feedback draft saved successfully',
    });
  } catch (error) {
    console.error('Error saving feedback draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save feedback draft',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 6.2.3 BLIND EVALUATION MODE
// ============================================================================

// Configure blind evaluation
export const configureBlindEvaluation = async (req: Request, res: Response) => {
  try {
    const {
      jobId,
      hiddenFields,
      revealStage,
      anonymizeNames,
      hidePhotos,
      hideCompanyNames,
      hideEducationInstitutions,
      customRules,
    } = req.body;

    const config = await prisma.blindEvaluationConfig.create({
      data: {
        jobId,
        hiddenFields,
        revealStage,
        anonymizeNames: anonymizeNames || true,
        hidePhotos: hidePhotos || true,
        hideCompanyNames: hideCompanyNames || false,
        hideEducationInstitutions: hideEducationInstitutions || false,
        customRules,
        createdBy: (req as any).user.id,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: config,
      message: 'Blind evaluation configured successfully',
    });
  } catch (error) {
    console.error('Error configuring blind evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure blind evaluation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get blind evaluation config
export const getBlindEvaluationConfig = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const config = await prisma.blindEvaluationConfig.findFirst({
      where: { jobId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching blind evaluation config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blind evaluation config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update blind evaluation config
export const updateBlindEvaluationConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const config = await prisma.blindEvaluationConfig.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: config,
      message: 'Blind evaluation config updated successfully',
    });
  } catch (error) {
    console.error('Error updating blind evaluation config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blind evaluation config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get anonymized candidate data
export const getAnonymizedCandidate = async (req: Request, res: Response) => {
  try {
    const { applicationId, jobId } = req.params;

    // Get blind evaluation config
    const config = await prisma.blindEvaluationConfig.findFirst({
      where: { jobId, isActive: true },
    });

    // Get application data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Anonymize data based on config
    let anonymizedData: any = { ...application };

    if (config) {
      if (config.anonymizeNames) {
        anonymizedData.candidate.name = `Candidate ${application.id.slice(-4)}`;
      }
      if (config.hidePhotos) {
        anonymizedData.candidate.photo = null;
      }
      if (config.hideCompanyNames && config.hiddenFields) {
        // Apply hiding logic
      }
    }

    res.json({
      success: true,
      data: anonymizedData,
      blindMode: !!config,
    });
  } catch (error) {
    console.error('Error fetching anonymized candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch anonymized candidate',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 6.2.4 FEEDBACK AGGREGATION
// ============================================================================

// Create feedback aggregation
export const createFeedbackAggregation = async (req: Request, res: Response) => {
  try {
    const {
      applicationId,
      interviewStage,
      feedbackIds,
      aggregatedScores,
      consensusRating,
      strengthsSummary,
      weaknessesSummary,
      keyInsights,
      recommendationBreakdown,
      finalRecommendation,
    } = req.body;

    const aggregation = await prisma.feedbackAggregation.create({
      data: {
        applicationId,
        interviewStage,
        feedbackIds,
        feedbackCount: feedbackIds?.length || 0,
        aggregatedScores,
        consensusRating,
        strengthsSummary,
        weaknessesSummary,
        keyInsights,
        recommendationBreakdown,
        finalRecommendation,
        aggregatedAt: new Date(),
        aggregatedBy: (req as any).user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: aggregation,
      message: 'Feedback aggregation created successfully',
    });
  } catch (error) {
    console.error('Error creating feedback aggregation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feedback aggregation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get feedback aggregations
export const getFeedbackAggregations = async (req: Request, res: Response) => {
  try {
    const { applicationId, interviewStage, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (applicationId) where.applicationId = applicationId;
    if (interviewStage) where.interviewStage = interviewStage;

    const skip = (Number(page) - 1) * Number(limit);

    const [aggregations, total] = await Promise.all([
      prisma.feedbackAggregation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { aggregatedAt: 'desc' },
      }),
      prisma.feedbackAggregation.count({ where }),
    ]);

    res.json({
      success: true,
      data: aggregations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching feedback aggregations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback aggregations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Calculate aggregation automatically
export const calculateAggregation = async (req: Request, res: Response) => {
  try {
    const { applicationId, interviewStage } = req.body;

    // Fetch all feedbacks for the application/stage
    const feedbacks = await prisma.interviewFeedback.findMany({
      where: {
        applicationId,
        status: 'SUBMITTED',
      },
    });

    if (feedbacks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No feedbacks found to aggregate',
      });
    }

    // Calculate aggregated scores
    const aggregatedScores: any = {};
    const recommendations: string[] = [];
    const allStrengths: string[] = [];
    const allWeaknesses: string[] = [];

    feedbacks.forEach((feedback) => {
      if (feedback.ratings) {
        const ratings = feedback.ratings as any;
        Object.keys(ratings).forEach((key) => {
          if (!aggregatedScores[key]) {
            aggregatedScores[key] = { total: 0, count: 0 };
          }
          aggregatedScores[key].total += ratings[key];
          aggregatedScores[key].count += 1;
        });
      }
      if (feedback.recommendation) recommendations.push(feedback.recommendation);
      if (feedback.strengths) allStrengths.push(...(feedback.strengths as string[]));
      if (feedback.weaknesses) allWeaknesses.push(...(feedback.weaknesses as string[]));
    });

    // Calculate averages
    const averagedScores: any = {};
    Object.keys(aggregatedScores).forEach((key) => {
      averagedScores[key] = aggregatedScores[key].total / aggregatedScores[key].count;
    });

    // Calculate consensus
    const overallScores = feedbacks.map((f) => f.overallScore).filter(Boolean) as number[];
    const consensusRating = overallScores.length > 0
      ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
      : null;

    // Calculate recommendation breakdown
    const recommendationBreakdown = recommendations.reduce((acc: any, rec) => {
      acc[rec] = (acc[rec] || 0) + 1;
      return acc;
    }, {});

    // Create aggregation
    const aggregation = await prisma.feedbackAggregation.create({
      data: {
        applicationId,
        interviewStage,
        feedbackIds: feedbacks.map((f) => f.id),
        feedbackCount: feedbacks.length,
        aggregatedScores: averagedScores,
        consensusRating,
        strengthsSummary: [...new Set(allStrengths)],
        weaknessesSummary: [...new Set(allWeaknesses)],
        recommendationBreakdown,
        aggregatedAt: new Date(),
        aggregatedBy: (req as any).user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: aggregation,
      message: 'Feedback aggregation calculated successfully',
    });
  } catch (error) {
    console.error('Error calculating aggregation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate aggregation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 6.2.5 CALIBRATION SESSIONS
// ============================================================================

// Create calibration session
export const createCalibrationSession = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      jobId,
      scheduledDate,
      participants,
      applicationIds,
      agenda,
      calibrationCriteria,
      targetDuration,
    } = req.body;

    const session = await prisma.calibrationSession.create({
      data: {
        name,
        description,
        jobId,
        scheduledDate: new Date(scheduledDate),
        participants,
        applicationIds,
        agenda,
        calibrationCriteria,
        targetDuration,
        facilitatorId: (req as any).user.id,
        status: 'SCHEDULED',
      },
    });

    res.status(201).json({
      success: true,
      data: session,
      message: 'Calibration session created successfully',
    });
  } catch (error) {
    console.error('Error creating calibration session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create calibration session',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get calibration sessions
export const getCalibrationSessions = async (req: Request, res: Response) => {
  try {
    const { jobId, status, facilitatorId, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;
    if (facilitatorId) where.facilitatorId = facilitatorId;

    const skip = (Number(page) - 1) * Number(limit);

    const [sessions, total] = await Promise.all([
      prisma.calibrationSession.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.calibrationSession.count({ where }),
    ]);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching calibration sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calibration sessions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update calibration session
export const updateCalibrationSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const session = await prisma.calibrationSession.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: session,
      message: 'Calibration session updated successfully',
    });
  } catch (error) {
    console.error('Error updating calibration session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update calibration session',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Start calibration session
export const startCalibrationSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.calibrationSession.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        actualStartTime: new Date(),
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: session,
      message: 'Calibration session started',
    });
  } catch (error) {
    console.error('Error starting calibration session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start calibration session',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Complete calibration session
export const completeCalibrationSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { outcomes, adjustedRatings, notes, actionItems } = req.body;

    const session = await prisma.calibrationSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualEndTime: new Date(),
        outcomes,
        adjustedRatings,
        notes,
        actionItems,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: session,
      message: 'Calibration session completed',
    });
  } catch (error) {
    console.error('Error completing calibration session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete calibration session',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 6.2.6 DECISION VOTING
// ============================================================================

// Create voting round
export const createVotingRound = async (req: Request, res: Response) => {
  try {
    const {
      applicationId,
      roundNumber,
      votingType,
      voters,
      deadline,
      requiredVotes,
      passingThreshold,
    } = req.body;

    const summary = await prisma.votingRoundSummary.create({
      data: {
        applicationId,
        roundNumber,
        votingType,
        voters,
        totalVoters: voters?.length || 0,
        votesReceived: 0,
        deadline: deadline ? new Date(deadline) : null,
        requiredVotes,
        passingThreshold,
        status: 'OPEN',
        createdBy: (req as any).user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: summary,
      message: 'Voting round created successfully',
    });
  } catch (error) {
    console.error('Error creating voting round:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create voting round',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Submit vote
export const submitVote = async (req: Request, res: Response) => {
  try {
    const {
      applicationId,
      votingRoundId,
      decision,
      confidence,
      reasoning,
      conditions,
      feedbackReference,
    } = req.body;

    const vote = await prisma.hiringDecisionVote.create({
      data: {
        applicationId,
        votingRoundId,
        voterId: (req as any).user.id,
        decision,
        confidence,
        reasoning,
        conditions,
        feedbackReference,
        votedAt: new Date(),
      },
    });

    // Update voting round summary
    await prisma.votingRoundSummary.update({
      where: { id: votingRoundId },
      data: {
        votesReceived: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: vote,
      message: 'Vote submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit vote',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get votes for application
export const getVotes = async (req: Request, res: Response) => {
  try {
    const { applicationId, votingRoundId, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (applicationId) where.applicationId = applicationId;
    if (votingRoundId) where.votingRoundId = votingRoundId;

    const skip = (Number(page) - 1) * Number(limit);

    const [votes, total] = await Promise.all([
      prisma.hiringDecisionVote.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { votedAt: 'desc' },
      }),
      prisma.hiringDecisionVote.count({ where }),
    ]);

    res.json({
      success: true,
      data: votes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch votes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get voting round summary
export const getVotingRoundSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const summary = await prisma.votingRoundSummary.findUnique({
      where: { id },
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Voting round not found',
      });
    }

    // Get votes for this round
    const votes = await prisma.hiringDecisionVote.findMany({
      where: { votingRoundId: id },
    });

    // Calculate vote breakdown
    const voteBreakdown = votes.reduce((acc: any, vote) => {
      acc[vote.decision] = (acc[vote.decision] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ...summary,
        votes,
        voteBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching voting round summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voting round summary',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Close voting round
export const closeVotingRound = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { finalDecision, decisionNotes } = req.body;

    // Get all votes
    const votes = await prisma.hiringDecisionVote.findMany({
      where: { votingRoundId: id },
    });

    // Calculate result
    const voteBreakdown = votes.reduce((acc: any, vote) => {
      acc[vote.decision] = (acc[vote.decision] || 0) + 1;
      return acc;
    }, {});

    const summary = await prisma.votingRoundSummary.update({
      where: { id },
      data: {
        status: 'CLOSED',
        voteBreakdown,
        finalDecision,
        decisionNotes,
        closedAt: new Date(),
        closedBy: (req as any).user.id,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: summary,
      message: 'Voting round closed successfully',
    });
  } catch (error) {
    console.error('Error closing voting round:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close voting round',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 6.2.7 EVALUATION DEADLINES
// ============================================================================

// Create evaluation deadline
export const createEvaluationDeadline = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      jobId,
      deadlineType,
      daysFromTrigger,
      triggerEvent,
      reminderSchedule,
      escalationRules,
      autoActions,
    } = req.body;

    const deadline = await prisma.evaluationDeadline.create({
      data: {
        name,
        description,
        jobId,
        deadlineType,
        daysFromTrigger,
        triggerEvent,
        reminderSchedule,
        escalationRules,
        autoActions,
        createdBy: (req as any).user.id,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: deadline,
      message: 'Evaluation deadline created successfully',
    });
  } catch (error) {
    console.error('Error creating evaluation deadline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create evaluation deadline',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get evaluation deadlines
export const getEvaluationDeadlines = async (req: Request, res: Response) => {
  try {
    const { jobId, isActive, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [deadlines, total] = await Promise.all([
      prisma.evaluationDeadline.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.evaluationDeadline.count({ where }),
    ]);

    res.json({
      success: true,
      data: deadlines,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching evaluation deadlines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation deadlines',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update evaluation deadline
export const updateEvaluationDeadline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const deadline = await prisma.evaluationDeadline.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: deadline,
      message: 'Evaluation deadline updated successfully',
    });
  } catch (error) {
    console.error('Error updating evaluation deadline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update evaluation deadline',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get deadline instances
export const getDeadlineInstances = async (req: Request, res: Response) => {
  try {
    const { deadlineId, applicationId, status, overdue, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (deadlineId) where.deadlineId = deadlineId;
    if (applicationId) where.applicationId = applicationId;
    if (status) where.status = status;
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'COMPLETED' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [instances, total] = await Promise.all([
      prisma.deadlineInstance.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { dueDate: 'asc' },
      }),
      prisma.deadlineInstance.count({ where }),
    ]);

    res.json({
      success: true,
      data: instances,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching deadline instances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deadline instances',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update deadline instance status
export const updateDeadlineInstanceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, completedAt, notes } = req.body;

    const instance = await prisma.deadlineInstance.update({
      where: { id },
      data: {
        status,
        completedAt: completedAt ? new Date(completedAt) : status === 'COMPLETED' ? new Date() : null,
        notes,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: instance,
      message: 'Deadline instance updated successfully',
    });
  } catch (error) {
    console.error('Error updating deadline instance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deadline instance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 6.2.8 DISAGREEMENT RESOLUTION
// ============================================================================

// Flag disagreement
export const flagDisagreement = async (req: Request, res: Response) => {
  try {
    const {
      applicationId,
      feedbackIds,
      disagreementType,
      criteriaInvolved,
      scoreDifference,
      description,
      suggestedResolution,
    } = req.body;

    const disagreement = await prisma.evaluationDisagreement.create({
      data: {
        applicationId,
        feedbackIds,
        disagreementType,
        criteriaInvolved,
        scoreDifference,
        description,
        suggestedResolution,
        flaggedBy: (req as any).user.id,
        status: 'OPEN',
      },
    });

    res.status(201).json({
      success: true,
      data: disagreement,
      message: 'Disagreement flagged successfully',
    });
  } catch (error) {
    console.error('Error flagging disagreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flag disagreement',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get disagreements
export const getDisagreements = async (req: Request, res: Response) => {
  try {
    const { applicationId, status, disagreementType, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (applicationId) where.applicationId = applicationId;
    if (status) where.status = status;
    if (disagreementType) where.disagreementType = disagreementType;

    const skip = (Number(page) - 1) * Number(limit);

    const [disagreements, total] = await Promise.all([
      prisma.evaluationDisagreement.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.evaluationDisagreement.count({ where }),
    ]);

    res.json({
      success: true,
      data: disagreements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching disagreements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disagreements',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Resolve disagreement
export const resolveDisagreement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution, resolutionMethod, adjustedScores, notes } = req.body;

    const disagreement = await prisma.evaluationDisagreement.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution,
        resolutionMethod,
        adjustedScores,
        resolvedBy: (req as any).user.id,
        resolvedAt: new Date(),
        notes,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: disagreement,
      message: 'Disagreement resolved successfully',
    });
  } catch (error) {
    console.error('Error resolving disagreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve disagreement',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Escalate disagreement
export const escalateDisagreement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { escalatedTo, escalationReason } = req.body;

    const disagreement = await prisma.evaluationDisagreement.update({
      where: { id },
      data: {
        status: 'ESCALATED',
        escalatedTo,
        escalationReason,
        escalatedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: disagreement,
      message: 'Disagreement escalated successfully',
    });
  } catch (error) {
    console.error('Error escalating disagreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate disagreement',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 6.2.9 HISTORICAL COMPARISON
// ============================================================================

// Create candidate comparison
export const createCandidateComparison = async (req: Request, res: Response) => {
  try {
    const {
      jobId,
      applicationIds,
      comparisonCriteria,
      scores,
      rankings,
      notes,
    } = req.body;

    const comparison = await prisma.candidateComparison.create({
      data: {
        jobId,
        applicationIds,
        candidateCount: applicationIds?.length || 0,
        comparisonCriteria,
        scores,
        rankings,
        notes,
        createdBy: (req as any).user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: comparison,
      message: 'Candidate comparison created successfully',
    });
  } catch (error) {
    console.error('Error creating candidate comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create candidate comparison',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get candidate comparisons
export const getCandidateComparisons = async (req: Request, res: Response) => {
  try {
    const { jobId, createdBy, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (createdBy) where.createdBy = createdBy;

    const skip = (Number(page) - 1) * Number(limit);

    const [comparisons, total] = await Promise.all([
      prisma.candidateComparison.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.candidateComparison.count({ where }),
    ]);

    res.json({
      success: true,
      data: comparisons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching candidate comparisons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate comparisons',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create hiring benchmark
export const createHiringBenchmark = async (req: Request, res: Response) => {
  try {
    const {
      jobId,
      benchmarkType,
      periodStart,
      periodEnd,
      metrics,
      thresholds,
      historicalData,
      successIndicators,
    } = req.body;

    const benchmark = await prisma.hiringBenchmark.create({
      data: {
        jobId,
        benchmarkType,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        metrics,
        thresholds,
        historicalData,
        successIndicators,
        createdBy: (req as any).user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: benchmark,
      message: 'Hiring benchmark created successfully',
    });
  } catch (error) {
    console.error('Error creating hiring benchmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hiring benchmark',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get hiring benchmarks
export const getHiringBenchmarks = async (req: Request, res: Response) => {
  try {
    const { jobId, benchmarkType, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (benchmarkType) where.benchmarkType = benchmarkType;

    const skip = (Number(page) - 1) * Number(limit);

    const [benchmarks, total] = await Promise.all([
      prisma.hiringBenchmark.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.hiringBenchmark.count({ where }),
    ]);

    res.json({
      success: true,
      data: benchmarks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching hiring benchmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hiring benchmarks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Compare to historical benchmarks
export const compareToHistoricalBenchmarks = async (req: Request, res: Response) => {
  try {
    const { applicationId, jobId } = req.params;

    // Get benchmarks for the job
    const benchmarks = await prisma.hiringBenchmark.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get candidate's feedback aggregation
    const aggregation = await prisma.feedbackAggregation.findFirst({
      where: { applicationId },
      orderBy: { aggregatedAt: 'desc' },
    });

    if (!aggregation) {
      return res.status(404).json({
        success: false,
        message: 'No feedback aggregation found for this application',
      });
    }

    // Compare scores to benchmarks
    const comparison: any = {
      candidateScores: aggregation.aggregatedScores,
      benchmarkComparison: [],
      percentileRanking: {},
    };

    benchmarks.forEach((benchmark) => {
      comparison.benchmarkComparison.push({
        benchmarkId: benchmark.id,
        benchmarkType: benchmark.benchmarkType,
        metrics: benchmark.metrics,
        thresholds: benchmark.thresholds,
      });
    });

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error('Error comparing to benchmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare to benchmarks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// STATS
// ============================================================================

// Get collaborative evaluation stats
export const getCollaborativeEvaluationStats = async (req: Request, res: Response) => {
  try {
    const { jobId, startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const whereDate = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const whereJob = jobId ? { jobId: jobId as string } : {};

    const [
      totalTemplates,
      totalFeedbacks,
      totalAggregations,
      totalSessions,
      totalVotingRounds,
      totalDisagreements,
      openDisagreements,
      totalComparisons,
      totalBenchmarks,
    ] = await Promise.all([
      prisma.scorecardTemplate.count({ where: { ...whereJob, isActive: true } }),
      prisma.interviewFeedback.count({ where: whereDate }),
      prisma.feedbackAggregation.count({ where: whereDate }),
      prisma.calibrationSession.count({ where: { ...whereJob, ...whereDate } }),
      prisma.votingRoundSummary.count({ where: whereDate }),
      prisma.evaluationDisagreement.count({ where: whereDate }),
      prisma.evaluationDisagreement.count({ where: { ...whereDate, status: 'OPEN' } }),
      prisma.candidateComparison.count({ where: { ...whereJob, ...whereDate } }),
      prisma.hiringBenchmark.count({ where: { ...whereJob, ...whereDate } }),
    ]);

    // Calculate average feedback completion time
    const feedbacks = await prisma.interviewFeedback.findMany({
      where: { ...whereDate, timeSpent: { not: null } },
      select: { timeSpent: true },
    });

    const avgFeedbackTime = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + (f.timeSpent || 0), 0) / feedbacks.length
      : 0;

    res.json({
      success: true,
      data: {
        scorecardTemplates: totalTemplates,
        feedbacksSubmitted: totalFeedbacks,
        aggregationsCreated: totalAggregations,
        calibrationSessions: totalSessions,
        votingRounds: totalVotingRounds,
        disagreements: {
          total: totalDisagreements,
          open: openDisagreements,
          resolved: totalDisagreements - openDisagreements,
        },
        candidateComparisons: totalComparisons,
        hiringBenchmarks: totalBenchmarks,
        avgFeedbackTimeMinutes: Math.round(avgFeedbackTime),
      },
    });
  } catch (error) {
    console.error('Error fetching collaborative evaluation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaborative evaluation stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
