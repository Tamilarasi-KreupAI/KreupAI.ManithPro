import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// AI SCREENING INTERVIEWS (4.1.1-4.1.3)
// ============================================

// Create a new AI screening interview
export const createScreeningInterview = async (req: Request, res: Response) => {
  try {
    const recruiterId = (req as any).user.id;
    const {
      candidateId,
      jobId,
      applicationId,
      interviewType,
      title,
      description,
      questionFlowId,
      totalTimeLimit,
      perQuestionTimeLimit,
      language,
      accessibilitySettings,
      aiTone,
      aiPersonality,
      enableSmallTalk,
      expiresAt,
    } = req.body;

    // Get question count from flow if provided
    let totalQuestions = 0;
    if (questionFlowId) {
      const questionCount = await prisma.screeningQuestion.count({
        where: { flowId: questionFlowId },
      });
      totalQuestions = questionCount;
    }

    const interview = await prisma.aIScreeningInterview.create({
      data: {
        candidateId,
        recruiterId,
        jobId,
        applicationId,
        interviewType: interviewType || 'VIDEO_ASYNC',
        title,
        description,
        questionFlowId,
        totalQuestions,
        totalTimeLimit,
        perQuestionTimeLimit,
        language: language || 'en',
        accessibilitySettings,
        aiTone: aiTone || 'PROFESSIONAL',
        aiPersonality,
        enableSmallTalk: enableSmallTalk !== false,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        job: { select: { id: true, title: true, companyName: true } },
        questionFlow: true,
      },
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error creating screening interview:', error);
    res.status(500).json({ error: 'Failed to create screening interview' });
  }
};

// Get screening interviews (for recruiter)
export const getScreeningInterviews = async (req: Request, res: Response) => {
  try {
    const recruiterId = (req as any).user.id;
    const { status, jobId, interviewType, page = 1, limit = 20 } = req.query;

    const where: any = { recruiterId };
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (interviewType) where.interviewType = interviewType;

    const interviews = await prisma.aIScreeningInterview.findMany({
      where,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        job: { select: { id: true, title: true, companyName: true } },
        questionFlow: { select: { id: true, name: true } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.aIScreeningInterview.count({ where });

    res.json({ interviews, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching screening interviews:', error);
    res.status(500).json({ error: 'Failed to fetch screening interviews' });
  }
};

// Get candidate's screening interviews
export const getCandidateInterviews = async (req: Request, res: Response) => {
  try {
    const candidateId = (req as any).user.id;
    const { status } = req.query;

    const where: any = { candidateId };
    if (status) where.status = status;

    const interviews = await prisma.aIScreeningInterview.findMany({
      where,
      include: {
        job: { select: { id: true, title: true, companyName: true, companyLogo: true } },
        questionFlow: { select: { id: true, name: true, estimatedDuration: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(interviews);
  } catch (error) {
    console.error('Error fetching candidate interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// Get interview by invite token (public endpoint for candidates)
export const getInterviewByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const interview = await prisma.aIScreeningInterview.findUnique({
      where: { inviteToken: token },
      include: {
        job: { select: { id: true, title: true, companyName: true, companyLogo: true, description: true } },
        questionFlow: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                questionText: true,
                questionType: true,
                expectedResponseType: true,
                maxResponseDuration: true,
                timeLimit: true,
                translations: true,
                options: true,
                hint: true,
                accessibilityNotes: true,
              },
            },
          },
        },
        responses: {
          select: { questionId: true, status: true, retakeNumber: true },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.tokenExpiresAt && new Date() > interview.tokenExpiresAt) {
      return res.status(400).json({ error: 'Interview link has expired' });
    }

    if (interview.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Interview has been cancelled' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview by token:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

// Start interview
export const startInterview = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { recordingConsent, language, accessibilitySettings } = req.body;

    // First get the interview to calculate timeRemaining
    const existingInterview = await prisma.aIScreeningInterview.findUnique({
      where: { inviteToken: token },
    });

    const interview = await prisma.aIScreeningInterview.update({
      where: { inviteToken: token },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        recordingConsent: recordingConsent || false,
        language: language || undefined,
        accessibilitySettings: accessibilitySettings || undefined,
        timeRemaining: existingInterview?.totalTimeLimit ? existingInterview.totalTimeLimit * 60 : null,
      },
    });

    res.json(interview);
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

// Complete interview
export const completeInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Calculate overall score from responses
    const responses = await prisma.screeningResponse.findMany({
      where: { interviewId: id },
      select: { aiScore: true },
    });

    const scores = responses.filter(r => r.aiScore !== null).map(r => r.aiScore as number);
    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    const interview = await prisma.aIScreeningInterview.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        overallScore,
        completedQuestions: responses.length,
      },
    });

    res.json(interview);
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({ error: 'Failed to complete interview' });
  }
};

// Cancel interview
export const cancelInterview = async (req: Request, res: Response) => {
  try {
    const recruiterId = (req as any).user.id;
    const { id } = req.params;

    const interview = await prisma.aIScreeningInterview.update({
      where: { id, recruiterId },
      data: { status: 'CANCELLED' },
    });

    res.json(interview);
  } catch (error) {
    console.error('Error cancelling interview:', error);
    res.status(500).json({ error: 'Failed to cancel interview' });
  }
};

// Extend deadline
export const extendDeadline = async (req: Request, res: Response) => {
  try {
    const recruiterId = (req as any).user.id;
    const { id } = req.params;
    const { additionalDays } = req.body;

    const interview = await prisma.aIScreeningInterview.findFirst({
      where: { id, recruiterId },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const newExpiry = new Date(interview.expiresAt || Date.now());
    newExpiry.setDate(newExpiry.getDate() + (additionalDays || 3));

    const updated = await prisma.aIScreeningInterview.update({
      where: { id },
      data: {
        expiresAt: newExpiry,
        tokenExpiresAt: newExpiry,
        deadlineExtensions: { increment: 1 },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error extending deadline:', error);
    res.status(500).json({ error: 'Failed to extend deadline' });
  }
};

// ============================================
// QUESTION FLOWS (4.1.4)
// ============================================

// Create question flow
export const createQuestionFlow = async (req: Request, res: Response) => {
  try {
    const createdById = (req as any).user.id;
    const {
      name,
      description,
      category,
      jobId,
      targetRole,
      targetLevel,
      interviewType,
      supportedLanguages,
      defaultLanguage,
      estimatedDuration,
      defaultTimePerQuestion,
      isTemplate,
    } = req.body;

    const flow = await prisma.questionFlow.create({
      data: {
        createdById,
        name,
        description,
        category,
        jobId,
        targetRole,
        targetLevel,
        interviewType: interviewType || 'VIDEO_ASYNC',
        supportedLanguages: supportedLanguages || ['en'],
        defaultLanguage: defaultLanguage || 'en',
        estimatedDuration,
        defaultTimePerQuestion,
        isTemplate: isTemplate || false,
      },
    });

    res.status(201).json(flow);
  } catch (error) {
    console.error('Error creating question flow:', error);
    res.status(500).json({ error: 'Failed to create question flow' });
  }
};

// Get question flows
export const getQuestionFlows = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { category, isTemplate, jobId } = req.query;

    const where: any = {
      OR: [{ createdById: userId }, { isTemplate: true }],
      isActive: true,
    };
    if (category) where.category = category;
    if (isTemplate !== undefined) where.isTemplate = isTemplate === 'true';
    if (jobId) where.jobId = jobId;

    const flows = await prisma.questionFlow.findMany({
      where,
      include: {
        _count: { select: { questions: true, screeningInterviews: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(flows);
  } catch (error) {
    console.error('Error fetching question flows:', error);
    res.status(500).json({ error: 'Failed to fetch question flows' });
  }
};

// Get question flow with questions
export const getQuestionFlowWithQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const flow = await prisma.questionFlow.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        followUpRules: {
          include: {
            triggerQuestion: { select: { id: true, questionText: true } },
            followUpQuestion: { select: { id: true, questionText: true } },
          },
        },
        job: { select: { id: true, title: true } },
      },
    });

    if (!flow) {
      return res.status(404).json({ error: 'Question flow not found' });
    }

    res.json(flow);
  } catch (error) {
    console.error('Error fetching question flow:', error);
    res.status(500).json({ error: 'Failed to fetch question flow' });
  }
};

// Update question flow
export const updateQuestionFlow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;

    const flow = await prisma.questionFlow.update({
      where: { id, createdById: userId },
      data: updates,
    });

    res.json(flow);
  } catch (error) {
    console.error('Error updating question flow:', error);
    res.status(500).json({ error: 'Failed to update question flow' });
  }
};

// Delete question flow
export const deleteQuestionFlow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await prisma.questionFlow.delete({
      where: { id, createdById: userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting question flow:', error);
    res.status(500).json({ error: 'Failed to delete question flow' });
  }
};

// ============================================
// SCREENING QUESTIONS
// ============================================

// Add question to flow
export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { flowId } = req.params;
    const {
      questionText,
      questionType,
      category,
      translations,
      expectedResponseType,
      maxResponseDuration,
      maxResponseLength,
      allowRetakes,
      maxRetakes,
      options,
      correctAnswer,
      orderIndex,
      isRequired,
      difficulty,
      maxPoints,
      scoringCriteria,
      hint,
      sampleAnswer,
      evaluationGuidelines,
      timeLimit,
      accessibilityNotes,
      hasAudioDescription,
      hasSignLanguage,
      aiFollowUpEnabled,
      aiEvaluationPrompt,
    } = req.body;

    // Get max order index if not provided
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const maxOrder = await prisma.screeningQuestion.aggregate({
        where: { flowId },
        _max: { orderIndex: true },
      });
      finalOrderIndex = (maxOrder._max.orderIndex || 0) + 1;
    }

    const question = await prisma.screeningQuestion.create({
      data: {
        flowId,
        questionText,
        questionType: questionType || 'TEXT',
        category,
        translations,
        expectedResponseType: expectedResponseType || 'VIDEO',
        maxResponseDuration,
        maxResponseLength,
        allowRetakes: allowRetakes !== false,
        maxRetakes: maxRetakes || 2,
        options,
        correctAnswer,
        orderIndex: finalOrderIndex,
        isRequired: isRequired !== false,
        difficulty: difficulty || 'MEDIUM',
        maxPoints: maxPoints || 10,
        scoringCriteria,
        hint,
        sampleAnswer,
        evaluationGuidelines,
        timeLimit,
        accessibilityNotes,
        hasAudioDescription: hasAudioDescription || false,
        hasSignLanguage: hasSignLanguage || false,
        aiFollowUpEnabled: aiFollowUpEnabled !== false,
        aiEvaluationPrompt,
      },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
};

// Update question
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await prisma.screeningQuestion.update({
      where: { id },
      data: updates,
    });

    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

// Delete question
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.screeningQuestion.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// Reorder questions
export const reorderQuestions = async (req: Request, res: Response) => {
  try {
    const { flowId } = req.params;
    const { questionIds } = req.body; // Array of question IDs in new order

    const updates = questionIds.map((id: string, index: number) =>
      prisma.screeningQuestion.update({
        where: { id },
        data: { orderIndex: index },
      })
    );

    await prisma.$transaction(updates);

    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering questions:', error);
    res.status(500).json({ error: 'Failed to reorder questions' });
  }
};

// ============================================
// SCREENING RESPONSES
// ============================================

// Submit response
export const submitResponse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { interviewId, questionId } = req.params;
    const {
      responseType,
      textResponse,
      videoUrl,
      audioUrl,
      codeResponse,
      codeLanguage,
      selectedOptions,
      timeSpentSeconds,
    } = req.body;

    // Check for existing response (for retakes)
    const existingResponses = await prisma.screeningResponse.count({
      where: { interviewId, questionId, userId },
    });

    const response = await prisma.screeningResponse.create({
      data: {
        interviewId,
        questionId,
        userId,
        responseType,
        textResponse,
        videoUrl,
        audioUrl,
        codeResponse,
        codeLanguage,
        selectedOptions: selectedOptions || [],
        startedAt: new Date(Date.now() - (timeSpentSeconds || 0) * 1000),
        completedAt: new Date(),
        timeSpentSeconds,
        retakeNumber: existingResponses,
        status: 'SUBMITTED',
      },
    });

    // Update interview progress
    await prisma.aIScreeningInterview.update({
      where: { id: interviewId },
      data: {
        completedQuestions: { increment: existingResponses === 0 ? 1 : 0 },
        currentQuestionIndex: { increment: existingResponses === 0 ? 1 : 0 },
      },
    });

    // Trigger AI analysis (in production, this would be async)
    // For now, simulate AI scoring
    setTimeout(async () => {
      try {
        await prisma.screeningResponse.update({
          where: { id: response.id },
          data: {
            status: 'ANALYZING',
            aiScore: Math.random() * 10, // Simulated score
            aiSummary: 'AI analysis pending implementation',
            aiSentiment: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'][Math.floor(Math.random() * 3)],
            aiConfidenceLevel: 0.7 + Math.random() * 0.3,
          },
        });
      } catch (err) {
        console.error('AI analysis error:', err);
      }
    }, 1000);

    res.status(201).json(response);
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
};

// Get responses for interview
export const getInterviewResponses = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const responses = await prisma.screeningResponse.findMany({
      where: { interviewId },
      include: {
        question: {
          select: { id: true, questionText: true, questionType: true, maxPoints: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
};

// Review response manually
export const reviewResponse = async (req: Request, res: Response) => {
  try {
    const reviewerId = (req as any).user.id;
    const { id } = req.params;
    const { manualScore, manualFeedback } = req.body;

    const response = await prisma.screeningResponse.update({
      where: { id },
      data: {
        manualScore,
        manualFeedback,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        status: 'REVIEWED',
      },
    });

    res.json(response);
  } catch (error) {
    console.error('Error reviewing response:', error);
    res.status(500).json({ error: 'Failed to review response' });
  }
};

// ============================================
// FOLLOW-UP RULES (4.1.5)
// ============================================

// Add follow-up rule
export const addFollowUpRule = async (req: Request, res: Response) => {
  try {
    const { flowId } = req.params;
    const {
      triggerQuestionId,
      conditionType,
      conditionValue,
      conditionOperator,
      actionType,
      followUpQuestionId,
      customFollowUpText,
      additionalQuestionIds,
      useAIGeneration,
      aiGenerationPrompt,
      priority,
    } = req.body;

    const rule = await prisma.followUpRule.create({
      data: {
        flowId,
        triggerQuestionId,
        conditionType,
        conditionValue,
        conditionOperator: conditionOperator || 'EQUALS',
        actionType,
        followUpQuestionId,
        customFollowUpText,
        additionalQuestionIds: additionalQuestionIds || [],
        useAIGeneration: useAIGeneration || false,
        aiGenerationPrompt,
        priority: priority || 0,
      },
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error adding follow-up rule:', error);
    res.status(500).json({ error: 'Failed to add follow-up rule' });
  }
};

// Update follow-up rule
export const updateFollowUpRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rule = await prisma.followUpRule.update({
      where: { id },
      data: updates,
    });

    res.json(rule);
  } catch (error) {
    console.error('Error updating follow-up rule:', error);
    res.status(500).json({ error: 'Failed to update follow-up rule' });
  }
};

// Delete follow-up rule
export const deleteFollowUpRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.followUpRule.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting follow-up rule:', error);
    res.status(500).json({ error: 'Failed to delete follow-up rule' });
  }
};

// Evaluate follow-up rules for a response
export const evaluateFollowUps = async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;

    const response = await prisma.screeningResponse.findUnique({
      where: { id: responseId },
      include: {
        question: {
          include: {
            followUpRules: {
              where: { isActive: true },
              orderBy: { priority: 'desc' },
            },
          },
        },
      },
    });

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Evaluate rules (simplified - in production would have more complex logic)
    const triggeredRules = [];
    for (const rule of response.question.followUpRules) {
      let triggered = false;

      if (rule.conditionType === 'KEYWORD_MATCH') {
        const keywords = (rule.conditionValue as any).keywords || [];
        const text = (response.textResponse || response.transcription || '').toLowerCase();
        triggered = keywords.some((kw: string) => text.includes(kw.toLowerCase()));
      } else if (rule.conditionType === 'SCORE_THRESHOLD') {
        const threshold = (rule.conditionValue as any).threshold || 5;
        triggered = (response.aiScore || 0) < threshold;
      } else if (rule.conditionType === 'SENTIMENT') {
        const targetSentiment = (rule.conditionValue as any).sentiment;
        triggered = response.aiSentiment === targetSentiment;
      }

      if (triggered) {
        triggeredRules.push(rule);
      }
    }

    res.json({
      responseId,
      triggeredRules,
      nextAction: triggeredRules[0]?.actionType || null,
      followUpQuestionId: triggeredRules[0]?.followUpQuestionId || null,
    });
  } catch (error) {
    console.error('Error evaluating follow-ups:', error);
    res.status(500).json({ error: 'Failed to evaluate follow-ups' });
  }
};

// ============================================
// SCREENING TEMPLATES
// ============================================

// Get templates
export const getScreeningTemplates = async (req: Request, res: Response) => {
  try {
    const { category, interviewType } = req.query;

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (interviewType) where.interviewType = interviewType;

    const templates = await prisma.screeningTemplate.findMany({
      where,
      orderBy: { usageCount: 'desc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Create template
export const createScreeningTemplate = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      interviewType,
      defaultQuestions,
      defaultDuration,
      defaultTimePerQuestion,
      aiTone,
      aiPersonality,
      smallTalkEnabled,
      smallTalkPrompts,
      supportedLanguages,
      defaultLanguage,
      defaultAccessibility,
      logoUrl,
      primaryColor,
      welcomeMessage,
      completionMessage,
      isPublic,
    } = req.body;

    const template = await prisma.screeningTemplate.create({
      data: {
        name,
        description,
        category,
        interviewType: interviewType || 'VIDEO_ASYNC',
        defaultQuestions,
        defaultDuration,
        defaultTimePerQuestion,
        aiTone: aiTone || 'PROFESSIONAL',
        aiPersonality,
        smallTalkEnabled: smallTalkEnabled !== false,
        smallTalkPrompts: smallTalkPrompts || [],
        supportedLanguages: supportedLanguages || ['en'],
        defaultLanguage: defaultLanguage || 'en',
        defaultAccessibility,
        logoUrl,
        primaryColor,
        welcomeMessage,
        completionMessage,
        isPublic: isPublic || false,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// ============================================
// ACCESSIBILITY PREFERENCES (4.1.7)
// ============================================

// Get accessibility preferences
export const getAccessibilityPrefs = async (req: Request, res: Response) => {
  try {
    const candidateId = (req as any).user.id;

    let prefs = await prisma.candidateAccessibilityPrefs.findUnique({
      where: { candidateId },
    });

    if (!prefs) {
      prefs = await prisma.candidateAccessibilityPrefs.create({
        data: { candidateId },
      });
    }

    res.json(prefs);
  } catch (error) {
    console.error('Error fetching accessibility prefs:', error);
    res.status(500).json({ error: 'Failed to fetch accessibility preferences' });
  }
};

// Update accessibility preferences
export const updateAccessibilityPrefs = async (req: Request, res: Response) => {
  try {
    const candidateId = (req as any).user.id;
    const updates = req.body;

    const prefs = await prisma.candidateAccessibilityPrefs.upsert({
      where: { candidateId },
      update: updates,
      create: { candidateId, ...updates },
    });

    res.json(prefs);
  } catch (error) {
    console.error('Error updating accessibility prefs:', error);
    res.status(500).json({ error: 'Failed to update accessibility preferences' });
  }
};

// ============================================
// CHAT-BASED SCREENING (4.1.3)
// ============================================

// Get next chat message/question
export const getChatMessage = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const interview = await prisma.aIScreeningInterview.findUnique({
      where: { id: interviewId },
      include: {
        questionFlow: {
          include: {
            questions: { orderBy: { orderIndex: 'asc' } },
          },
        },
        responses: { select: { questionId: true } },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const answeredQuestionIds = new Set(interview.responses.map(r => r.questionId));
    const nextQuestion = interview.questionFlow?.questions.find(
      q => !answeredQuestionIds.has(q.id)
    );

    if (!nextQuestion) {
      return res.json({
        type: 'COMPLETION',
        message: 'Thank you for completing the interview! Your responses have been recorded.',
      });
    }

    // Generate AI chat message (simplified)
    const aiMessage = interview.enableSmallTalk && interview.currentQuestionIndex === 0
      ? `Welcome! I'm excited to learn more about you. Let's start with our first question:\n\n${nextQuestion.questionText}`
      : nextQuestion.questionText;

    res.json({
      type: 'QUESTION',
      questionId: nextQuestion.id,
      message: aiMessage,
      questionType: nextQuestion.questionType,
      expectedResponseType: nextQuestion.expectedResponseType,
      timeLimit: nextQuestion.timeLimit,
      options: nextQuestion.options,
      hint: nextQuestion.hint,
    });
  } catch (error) {
    console.error('Error getting chat message:', error);
    res.status(500).json({ error: 'Failed to get chat message' });
  }
};

// Submit chat response
export const submitChatResponse = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const { questionId, message, responseType } = req.body;

    // Create response
    const response = await prisma.screeningResponse.create({
      data: {
        interviewId,
        questionId,
        userId: (req as any).user?.id || 'anonymous',
        responseType: responseType || 'TEXT',
        textResponse: message,
        completedAt: new Date(),
        status: 'SUBMITTED',
      },
    });

    // Update progress
    await prisma.aIScreeningInterview.update({
      where: { id: interviewId },
      data: {
        completedQuestions: { increment: 1 },
        currentQuestionIndex: { increment: 1 },
      },
    });

    // Check if interview is complete
    const interview = await prisma.aIScreeningInterview.findUnique({
      where: { id: interviewId },
    });

    const isComplete = interview && interview.completedQuestions >= interview.totalQuestions;

    if (isComplete) {
      await prisma.aIScreeningInterview.update({
        where: { id: interviewId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    res.json({
      response,
      isComplete,
    });
  } catch (error) {
    console.error('Error submitting chat response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
};

// ============================================
// STATISTICS & ANALYTICS
// ============================================

// Get screening statistics
export const getScreeningStats = async (req: Request, res: Response) => {
  try {
    const recruiterId = (req as any).user.id;

    const [total, completed, inProgress, pending, avgScore] = await Promise.all([
      prisma.aIScreeningInterview.count({ where: { recruiterId } }),
      prisma.aIScreeningInterview.count({ where: { recruiterId, status: 'COMPLETED' } }),
      prisma.aIScreeningInterview.count({ where: { recruiterId, status: 'IN_PROGRESS' } }),
      prisma.aIScreeningInterview.count({ where: { recruiterId, status: 'PENDING' } }),
      prisma.aIScreeningInterview.aggregate({
        where: { recruiterId, status: 'COMPLETED', overallScore: { not: null } },
        _avg: { overallScore: true },
      }),
    ]);

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

    res.json({
      total,
      completed,
      inProgress,
      pending,
      completionRate,
      avgScore: avgScore._avg.overallScore?.toFixed(2) || null,
    });
  } catch (error) {
    console.error('Error fetching screening stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
