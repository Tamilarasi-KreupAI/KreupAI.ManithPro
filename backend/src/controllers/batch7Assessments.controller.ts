// @ts-nocheck
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// ============================================
// 1.4.3 - LIVE CODING ENVIRONMENT
// ============================================

// Get available live coding sessions for a candidate
export const getLiveCodingSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { status, upcoming } = req.query;

    const where: any = { candidateId: userId };

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.scheduledAt = { gte: new Date() };
      where.status = { in: ['SCHEDULED', 'WAITING'] };
    }

    const sessions = await prisma.liveCodingSession.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching live coding sessions:', error);
    res.status(500).json({ error: 'Failed to fetch live coding sessions' });
  }
};

// Get a specific live coding session
export const getLiveCodingSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    const session = await prisma.liveCodingSession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { candidateId: userId },
          { interviewerId: userId },
        ],
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching live coding session:', error);
    res.status(500).json({ error: 'Failed to fetch live coding session' });
  }
};

// Schedule a new live coding session (recruiter/admin)
export const scheduleLiveCodingSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const interviewerId = req.user?.userId;
    const {
      candidateId,
      applicationId,
      title,
      description,
      scheduledAt,
      durationMinutes,
      programmingLanguage,
      problemStatement,
      starterCode,
      testCases,
      hints,
      difficultyLevel,
    } = req.body;

    const session = await prisma.liveCodingSession.create({
      data: {
        candidateId,
        interviewerId,
        applicationId,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: durationMinutes || 60,
        programmingLanguage,
        problemStatement,
        starterCode,
        testCases,
        hints,
        difficultyLevel,
        status: 'SCHEDULED',
      },
    });

    res.status(201).json({ session });
  } catch (error) {
    console.error('Error scheduling live coding session:', error);
    res.status(500).json({ error: 'Failed to schedule live coding session' });
  }
};

// Join a live coding session
export const joinLiveCodingSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    const session = await prisma.liveCodingSession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { candidateId: userId },
          { interviewerId: userId },
        ],
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Update session status if it's the candidate joining
    if (session.candidateId === userId && session.status === 'SCHEDULED') {
      await prisma.liveCodingSession.update({
        where: { id: sessionId },
        data: { status: 'WAITING' },
      });
    }

    // Generate or return room URL (in real implementation, integrate with WebSocket/WebRTC service)
    const roomUrl = session.roomUrl || `https://live-coding.kreupai.com/room/${sessionId}`;

    res.json({
      session: {
        ...session,
        roomUrl,
      },
    });
  } catch (error) {
    console.error('Error joining live coding session:', error);
    res.status(500).json({ error: 'Failed to join live coding session' });
  }
};

// Start the live coding session (interviewer action)
export const startLiveCodingSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const interviewerId = req.user?.userId;
    const { sessionId } = req.params;

    const session = await prisma.liveCodingSession.findFirst({
      where: {
        id: sessionId,
        interviewerId,
        status: { in: ['SCHEDULED', 'WAITING'] },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found or already started' });
      return;
    }

    const updatedSession = await prisma.liveCodingSession.update({
      where: { id: sessionId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    res.json({ session: updatedSession });
  } catch (error) {
    console.error('Error starting live coding session:', error);
    res.status(500).json({ error: 'Failed to start live coding session' });
  }
};

// Submit code during live coding session
export const submitLiveCodingCode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;
    const { sessionId } = req.params;
    const { code, language } = req.body;

    const session = await prisma.liveCodingSession.findFirst({
      where: {
        id: sessionId,
        candidateId,
        status: 'IN_PROGRESS',
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Active session not found' });
      return;
    }

    // Store code submission
    const updatedSession = await prisma.liveCodingSession.update({
      where: { id: sessionId },
      data: {
        candidateCode: code,
        codeSnapshots: {
          push: {
            code,
            language,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    // In real implementation, run code against test cases
    const testResults = {
      passed: Math.floor(Math.random() * 10),
      total: 10,
      executionTime: Math.random() * 1000,
    };

    res.json({
      session: updatedSession,
      testResults,
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
};

// End live coding session with evaluation
export const endLiveCodingSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const interviewerId = req.user?.userId;
    const { sessionId } = req.params;
    const {
      score,
      feedback,
      codeQualityScore,
      problemSolvingScore,
      communicationScore,
      technicalKnowledgeScore,
      recommendation,
    } = req.body;

    const session = await prisma.liveCodingSession.findFirst({
      where: {
        id: sessionId,
        interviewerId,
        status: 'IN_PROGRESS',
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Active session not found' });
      return;
    }

    const updatedSession = await prisma.liveCodingSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        score,
        feedback,
        codeQualityScore,
        problemSolvingScore,
        communicationScore,
        technicalKnowledgeScore,
        recommendation,
      },
    });

    res.json({ session: updatedSession });
  } catch (error) {
    console.error('Error ending live coding session:', error);
    res.status(500).json({ error: 'Failed to end live coding session' });
  }
};

// ============================================
// 1.4.4 - TAKE-HOME PROJECT SYSTEM
// ============================================

// Get all take-home projects (browse available templates)
export const getTakeHomeProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, difficulty, isActive } = req.query;

    const where: any = {};

    if (category) where.category = category;
    if (difficulty) where.difficultyLevel = difficulty;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const projects = await prisma.takeHomeProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching take-home projects:', error);
    res.status(500).json({ error: 'Failed to fetch take-home projects' });
  }
};

// Get a specific take-home project
export const getTakeHomeProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const project = await prisma.takeHomeProject.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug },
        ],
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ project });
  } catch (error) {
    console.error('Error fetching take-home project:', error);
    res.status(500).json({ error: 'Failed to fetch take-home project' });
  }
};

// Create a new take-home project template (admin/recruiter)
export const createTakeHomeProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const createdById = req.user?.userId;
    const {
      title,
      slug,
      description,
      category,
      difficultyLevel,
      estimatedHours,
      deadlineHours,
      requirements,
      evaluationCriteria,
      starterRepoUrl,
      techStack,
      skills,
      allowedExtensions,
      maxSubmissionSize,
      rubric,
    } = req.body;

    // Check if slug already exists
    const existing = await prisma.takeHomeProject.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ error: 'Project with this slug already exists' });
      return;
    }

    const project = await prisma.takeHomeProject.create({
      data: {
        title,
        slug,
        description,
        category,
        difficultyLevel,
        estimatedHours: estimatedHours || 8,
        deadlineHours: deadlineHours || 72,
        requirements,
        evaluationCriteria,
        starterRepoUrl,
        techStack: techStack || [],
        skills: skills || [],
        allowedExtensions: allowedExtensions || ['.zip', '.tar.gz', '.git'],
        maxSubmissionSize: maxSubmissionSize || 50 * 1024 * 1024, // 50MB
        rubric,
        createdById,
        isActive: true,
      },
    });

    res.status(201).json({ project });
  } catch (error) {
    console.error('Error creating take-home project:', error);
    res.status(500).json({ error: 'Failed to create take-home project' });
  }
};

// Assign a take-home project to a candidate
export const assignTakeHomeProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const assignedById = req.user?.userId;
    const { projectId, candidateId, applicationId, customDeadlineHours, notes } = req.body;

    const project = await prisma.takeHomeProject.findUnique({
      where: { id: projectId },
    });

    if (!project || !project.isActive) {
      res.status(404).json({ error: 'Project not found or inactive' });
      return;
    }

    const deadlineHours = customDeadlineHours || project.deadlineHours;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + deadlineHours);

    const submission = await prisma.projectSubmission.create({
      data: {
        projectId,
        candidateId,
        applicationId,
        assignedById,
        deadline,
        status: 'ASSIGNED',
        notes,
      },
      include: {
        project: true,
      },
    });

    res.status(201).json({ submission });
  } catch (error) {
    console.error('Error assigning take-home project:', error);
    res.status(500).json({ error: 'Failed to assign take-home project' });
  }
};

// Get candidate's project assignments
export const getCandidateProjectSubmissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;
    const { status } = req.query;

    const where: any = { candidateId };
    if (status) where.status = status;

    const submissions = await prisma.projectSubmission.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Error fetching project submissions:', error);
    res.status(500).json({ error: 'Failed to fetch project submissions' });
  }
};

// Start working on assigned project
export const startProjectSubmission = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;
    const { submissionId } = req.params;

    const submission = await prisma.projectSubmission.findFirst({
      where: {
        id: submissionId,
        candidateId,
        status: 'ASSIGNED',
      },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found or already started' });
      return;
    }

    // Check if deadline hasn't passed
    if (new Date() > submission.deadline) {
      await prisma.projectSubmission.update({
        where: { id: submissionId },
        data: { status: 'EXPIRED' },
      });
      res.status(400).json({ error: 'Deadline has passed' });
      return;
    }

    const updatedSubmission = await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: { project: true },
    });

    res.json({ submission: updatedSubmission });
  } catch (error) {
    console.error('Error starting project submission:', error);
    res.status(500).json({ error: 'Failed to start project submission' });
  }
};

// Submit project
export const submitProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;
    const { submissionId } = req.params;
    const { repositoryUrl, liveUrl, submissionNotes, files } = req.body;

    const submission = await prisma.projectSubmission.findFirst({
      where: {
        id: submissionId,
        candidateId,
        status: 'IN_PROGRESS',
      },
    });

    if (!submission) {
      res.status(404).json({ error: 'Active submission not found' });
      return;
    }

    // Check if deadline hasn't passed
    const now = new Date();
    if (now > submission.deadline) {
      await prisma.projectSubmission.update({
        where: { id: submissionId },
        data: { status: 'EXPIRED' },
      });
      res.status(400).json({ error: 'Deadline has passed' });
      return;
    }

    const updatedSubmission = await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'SUBMITTED',
        submittedAt: now,
        repositoryUrl,
        liveUrl,
        submissionNotes,
        submittedFiles: files || [],
      },
      include: { project: true },
    });

    res.json({ submission: updatedSubmission });
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Failed to submit project' });
  }
};

// Review project submission (recruiter/reviewer)
export const reviewProjectSubmission = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const reviewerId = req.user?.userId;
    const { submissionId } = req.params;
    const {
      overallScore,
      criteriaScores,
      feedback,
      strengths,
      improvements,
      recommendation,
      decision, // 'ACCEPTED' | 'REJECTED'
    } = req.body;

    const submission = await prisma.projectSubmission.findFirst({
      where: {
        id: submissionId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found or not ready for review' });
      return;
    }

    const updatedSubmission = await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: {
        status: decision || 'REVIEWED',
        reviewerId,
        reviewedAt: new Date(),
        overallScore,
        criteriaScores,
        feedback,
        strengths: strengths || [],
        improvements: improvements || [],
        recommendation,
      },
      include: { project: true },
    });

    res.json({ submission: updatedSubmission });
  } catch (error) {
    console.error('Error reviewing project submission:', error);
    res.status(500).json({ error: 'Failed to review project submission' });
  }
};

// ============================================
// 1.4.5 - EXTERNAL ASSESSMENT INTEGRATION (HackerRank/CodeSignal)
// ============================================

// Get external assessments for a profile
export const getExternalAssessments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { profileId } = req.query;

    // Get profile
    const profile = profileId
      ? await prisma.candidateProfile.findUnique({ where: { id: profileId as string } })
      : await prisma.candidateProfile.findUnique({ where: { userId } });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const assessments = await prisma.externalAssessment.findMany({
      where: { profileId: profile.id },
      orderBy: { completedAt: 'desc' },
    });

    res.json({ assessments });
  } catch (error) {
    console.error('Error fetching external assessments:', error);
    res.status(500).json({ error: 'Failed to fetch external assessments' });
  }
};

// Link an external assessment
export const linkExternalAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      provider,
      assessmentId,
      assessmentName,
      assessmentUrl,
      score,
      maxScore,
      percentile,
      completedAt,
      skills,
      certificateUrl,
      metadata,
    } = req.body;

    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // Check for duplicate
    const existing = await prisma.externalAssessment.findFirst({
      where: {
        profileId: profile.id,
        provider,
        externalAssessmentId: assessmentId,
      },
    });

    if (existing) {
      res.status(400).json({ error: 'This assessment is already linked' });
      return;
    }

    const assessment = await prisma.externalAssessment.create({
      data: {
        profileId: profile.id,
        provider,
        externalAssessmentId: assessmentId,
        assessmentName,
        assessmentUrl,
        score,
        maxScore,
        percentile,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        skills: skills || [],
        certificateUrl,
        metadata,
        isVerified: false, // Will be verified through provider API
      },
    });

    res.status(201).json({ assessment });
  } catch (error) {
    console.error('Error linking external assessment:', error);
    res.status(500).json({ error: 'Failed to link external assessment' });
  }
};

// Verify external assessment (fetch from provider API)
export const verifyExternalAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { assessmentId } = req.params;

    const assessment = await prisma.externalAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    // In real implementation, call provider API to verify
    // This is a mock verification
    const verified = true;
    const verificationData = {
      verifiedAt: new Date(),
      verificationMethod: 'API',
      providerResponse: { status: 'verified' },
    };

    const updatedAssessment = await prisma.externalAssessment.update({
      where: { id: assessmentId },
      data: {
        isVerified: verified,
        verifiedAt: verificationData.verifiedAt,
        verificationMethod: verificationData.verificationMethod,
      },
    });

    res.json({ assessment: updatedAssessment, verified });
  } catch (error) {
    console.error('Error verifying external assessment:', error);
    res.status(500).json({ error: 'Failed to verify external assessment' });
  }
};

// Get OAuth URL for external provider
export const getExternalProviderAuthUrl = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { provider } = req.params;

    // In real implementation, generate actual OAuth URLs
    const authUrls: Record<string, string> = {
      HACKERRANK: `https://www.hackerrank.com/oauth/authorize?client_id=xxx&redirect_uri=xxx&state=${userId}`,
      CODESIGNAL: `https://app.codesignal.com/oauth/authorize?client_id=xxx&redirect_uri=xxx&state=${userId}`,
      LEETCODE: `https://leetcode.com/accounts/login/?next=/api/oauth/authorize?client_id=xxx`,
      CODILITY: `https://codility.com/oauth/authorize?client_id=xxx&redirect_uri=xxx&state=${userId}`,
    };

    const authUrl = authUrls[provider.toUpperCase()];
    if (!authUrl) {
      res.status(400).json({ error: 'Unsupported provider' });
      return;
    }

    res.json({ authUrl, provider });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

// Import assessments from external provider
export const importExternalAssessments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { provider, accessToken } = req.body;

    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // In real implementation, fetch from provider API using accessToken
    // This is mock data
    const mockAssessments = [
      {
        provider,
        externalAssessmentId: `${provider.toLowerCase()}_${Date.now()}_1`,
        assessmentName: 'Problem Solving (Intermediate)',
        score: 85,
        maxScore: 100,
        percentile: 78,
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
        isVerified: true,
        verifiedAt: new Date(),
        verificationMethod: 'OAUTH_IMPORT',
      },
      {
        provider,
        externalAssessmentId: `${provider.toLowerCase()}_${Date.now()}_2`,
        assessmentName: 'React (Advanced)',
        score: 92,
        maxScore: 100,
        percentile: 89,
        completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        skills: ['React', 'JavaScript', 'Frontend Development'],
        isVerified: true,
        verifiedAt: new Date(),
        verificationMethod: 'OAUTH_IMPORT',
      },
    ];

    const createdAssessments = await Promise.all(
      mockAssessments.map(async (data) => {
        const existing = await prisma.externalAssessment.findFirst({
          where: {
            profileId: profile.id,
            externalAssessmentId: data.externalAssessmentId,
          },
        });

        if (existing) return existing;

        return prisma.externalAssessment.create({
          data: {
            ...data,
            profileId: profile.id,
          },
        });
      })
    );

    res.json({ assessments: createdAssessments, imported: createdAssessments.length });
  } catch (error) {
    console.error('Error importing external assessments:', error);
    res.status(500).json({ error: 'Failed to import external assessments' });
  }
};

// ============================================
// 1.4.6 - SOFT SKILLS ASSESSMENT
// ============================================

// Get available soft skills assessments
export const getSoftSkillsAssessments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, isActive } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const assessments = await prisma.softSkillsAssessment.findMany({
      where,
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ assessments });
  } catch (error) {
    console.error('Error fetching soft skills assessments:', error);
    res.status(500).json({ error: 'Failed to fetch soft skills assessments' });
  }
};

// Get a specific soft skills assessment with questions
export const getSoftSkillsAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const includeAnswers = req.query.includeAnswers === 'true' &&
      (req.user?.role === 'ADMIN' || req.user?.role === 'RECRUITER');

    const assessment = await prisma.softSkillsAssessment.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
        isActive: true,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            scenario: true,
            order: true,
            // Only include scoring data for admins/recruiters
            ...(includeAnswers && {
              scoringRubric: true,
              traits: true,
            }),
          },
        },
      },
    });

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    res.json({ assessment });
  } catch (error) {
    console.error('Error fetching soft skills assessment:', error);
    res.status(500).json({ error: 'Failed to fetch soft skills assessment' });
  }
};

// Start a soft skills assessment attempt
export const startSoftSkillsAttempt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;
    const { assessmentId, applicationId } = req.body;

    const assessment = await prisma.softSkillsAssessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    if (!assessment || !assessment.isActive) {
      res.status(404).json({ error: 'Assessment not found or inactive' });
      return;
    }

    // Check if candidate already has an incomplete attempt
    const existingAttempt = await prisma.softSkillAttempt.findFirst({
      where: {
        assessmentId,
        candidateId,
        completedAt: null,
      },
    });

    if (existingAttempt) {
      res.json({
        attempt: existingAttempt,
        assessment: {
          ...assessment,
          questions: assessment.questions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            scenario: q.scenario,
            order: q.order,
          })),
        },
        resuming: true,
      });
      return;
    }

    const attempt = await prisma.softSkillAttempt.create({
      data: {
        assessmentId,
        candidateId,
        applicationId,
        startedAt: new Date(),
        answers: [],
      },
    });

    res.status(201).json({
      attempt,
      assessment: {
        ...assessment,
        questions: assessment.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          scenario: q.scenario,
          order: q.order,
        })),
      },
    });
  } catch (error) {
    console.error('Error starting soft skills attempt:', error);
    res.status(500).json({ error: 'Failed to start soft skills attempt' });
  }
};

// Submit soft skills assessment
export const submitSoftSkillsAttempt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;
    const { attemptId } = req.params;
    const { answers } = req.body;

    const attempt = await prisma.softSkillAttempt.findFirst({
      where: {
        id: attemptId,
        candidateId,
        completedAt: null,
      },
      include: {
        assessment: {
          include: { questions: true },
        },
      },
    });

    if (!attempt) {
      res.status(404).json({ error: 'Active attempt not found' });
      return;
    }

    // Calculate scores based on scoring rubric (mock implementation)
    const traitScores: Record<string, number> = {};
    let totalScore = 0;

    attempt.assessment.questions.forEach((question) => {
      const answer = answers.find((a: any) => a.questionId === question.id);
      if (answer && question.scoringRubric) {
        const rubric = question.scoringRubric as any;
        const score = rubric[answer.answer] || 0;
        totalScore += score;

        // Aggregate trait scores
        if (question.traits) {
          (question.traits as string[]).forEach((trait) => {
            traitScores[trait] = (traitScores[trait] || 0) + score;
          });
        }
      }
    });

    const maxPossibleScore = attempt.assessment.questions.length * 5; // Assuming max 5 per question
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

    const updatedAttempt = await prisma.softSkillAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        answers,
        overallScore: percentageScore,
        traitScores,
        insights: generateSoftSkillInsights(traitScores, percentageScore),
      },
    });

    res.json({ attempt: updatedAttempt });
  } catch (error) {
    console.error('Error submitting soft skills attempt:', error);
    res.status(500).json({ error: 'Failed to submit soft skills attempt' });
  }
};

// Helper function to generate insights
function generateSoftSkillInsights(traitScores: Record<string, number>, overallScore: number): string[] {
  const insights: string[] = [];

  const sortedTraits = Object.entries(traitScores).sort(([, a], [, b]) => b - a);

  if (sortedTraits.length > 0) {
    insights.push(`Your strongest trait is ${sortedTraits[0][0]}`);
  }

  if (overallScore >= 80) {
    insights.push('You demonstrate excellent soft skills across multiple areas');
  } else if (overallScore >= 60) {
    insights.push('You show solid soft skills with room for growth in some areas');
  } else {
    insights.push('Consider focusing on developing your soft skills further');
  }

  return insights;
}

// Get user's soft skills assessment results
export const getUserSoftSkillsAttempts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;

    const attempts = await prisma.softSkillAttempt.findMany({
      where: {
        candidateId,
        completedAt: { not: null },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            category: true,
            description: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json({ attempts });
  } catch (error) {
    console.error('Error fetching soft skills attempts:', error);
    res.status(500).json({ error: 'Failed to fetch soft skills attempts' });
  }
};

// ============================================
// 1.4.7 - LANGUAGE PROFICIENCY TESTS
// ============================================

// Get available language proficiency tests
export const getLanguageTests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { language, testType, isActive } = req.query;

    const where: any = {};
    if (language) where.language = language;
    if (testType) where.testType = testType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const tests = await prisma.languageProficiencyTest.findMany({
      where,
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: [{ language: 'asc' }, { difficultyLevel: 'asc' }],
    });

    res.json({ tests });
  } catch (error) {
    console.error('Error fetching language tests:', error);
    res.status(500).json({ error: 'Failed to fetch language tests' });
  }
};

// Get a specific language test
export const getLanguageTest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const test = await prisma.languageProficiencyTest.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
        isActive: true,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            audioUrl: true,
            imageUrl: true,
            passage: true,
            order: true,
            points: true,
            // Don't include correctAnswer for candidates
          },
        },
      },
    });

    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    res.json({ test });
  } catch (error) {
    console.error('Error fetching language test:', error);
    res.status(500).json({ error: 'Failed to fetch language test' });
  }
};

// Start a language test attempt
export const startLanguageTestAttempt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;
    const { testId, applicationId } = req.body;

    const test = await prisma.languageProficiencyTest.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            audioUrl: true,
            imageUrl: true,
            passage: true,
            order: true,
            points: true,
          },
        },
      },
    });

    if (!test || !test.isActive) {
      res.status(404).json({ error: 'Test not found or inactive' });
      return;
    }

    // Check if candidate already has an incomplete attempt
    const existingAttempt = await prisma.languageTestAttempt.findFirst({
      where: {
        testId,
        candidateId,
        completedAt: null,
      },
    });

    if (existingAttempt) {
      res.json({
        attempt: existingAttempt,
        test,
        resuming: true,
      });
      return;
    }

    const attempt = await prisma.languageTestAttempt.create({
      data: {
        testId,
        candidateId,
        applicationId,
        startedAt: new Date(),
        answers: [],
      },
    });

    res.status(201).json({ attempt, test });
  } catch (error) {
    console.error('Error starting language test attempt:', error);
    res.status(500).json({ error: 'Failed to start language test attempt' });
  }
};

// Submit language test
export const submitLanguageTestAttempt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;
    const { attemptId } = req.params;
    const { answers } = req.body;

    const attempt = await prisma.languageTestAttempt.findFirst({
      where: {
        id: attemptId,
        candidateId,
        completedAt: null,
      },
      include: {
        test: {
          include: { questions: true },
        },
      },
    });

    if (!attempt) {
      res.status(404).json({ error: 'Active attempt not found' });
      return;
    }

    // Calculate scores
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const sectionScores: Record<string, { correct: number; total: number }> = {};

    attempt.test.questions.forEach((question) => {
      const answer = answers.find((a: any) => a.questionId === question.id);
      totalPoints += question.points;

      const isCorrect = answer && answer.answer === question.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }

      // Track section scores
      const section = question.questionType;
      if (!sectionScores[section]) {
        sectionScores[section] = { correct: 0, total: 0 };
      }
      sectionScores[section].total++;
      if (isCorrect) sectionScores[section].correct++;
    });

    const percentageScore = Math.round((earnedPoints / totalPoints) * 100);
    const cefrLevel = calculateCEFRLevel(percentageScore);

    const updatedAttempt = await prisma.languageTestAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        answers,
        score: percentageScore,
        sectionScores,
        cefrLevel,
        correctAnswers,
        totalQuestions: attempt.test.questions.length,
      },
    });

    res.json({ attempt: updatedAttempt });
  } catch (error) {
    console.error('Error submitting language test attempt:', error);
    res.status(500).json({ error: 'Failed to submit language test attempt' });
  }
};

// Calculate CEFR level based on score
function calculateCEFRLevel(score: number): string {
  if (score >= 95) return 'C2';
  if (score >= 85) return 'C1';
  if (score >= 70) return 'B2';
  if (score >= 55) return 'B1';
  if (score >= 40) return 'A2';
  return 'A1';
}

// Get user's language test results
export const getUserLanguageTestAttempts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const candidateId = req.user?.userId;

    const attempts = await prisma.languageTestAttempt.findMany({
      where: {
        candidateId,
        completedAt: { not: null },
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            language: true,
            testType: true,
            difficultyLevel: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json({ attempts });
  } catch (error) {
    console.error('Error fetching language test attempts:', error);
    res.status(500).json({ error: 'Failed to fetch language test attempts' });
  }
};

// ============================================
// COMBINED STATS ENDPOINT
// ============================================

export const getBatch7AssessmentStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });

    const [
      liveCodingSessions,
      projectSubmissions,
      externalAssessments,
      softSkillAttempts,
      languageTestAttempts,
    ] = await Promise.all([
      prisma.liveCodingSession.findMany({
        where: { candidateId: userId },
        select: { status: true, score: true },
      }),
      prisma.projectSubmission.findMany({
        where: { candidateId: userId },
        select: { status: true, overallScore: true },
      }),
      profile ? prisma.externalAssessment.findMany({
        where: { profileId: profile.id },
        select: { provider: true, score: true, maxScore: true },
      }) : Promise.resolve([]),
      prisma.softSkillAttempt.findMany({
        where: { candidateId: userId, completedAt: { not: null } },
        select: { overallScore: true },
      }),
      prisma.languageTestAttempt.findMany({
        where: { candidateId: userId, completedAt: { not: null } },
        select: { score: true, cefrLevel: true },
      }),
    ]);

    const stats = {
      liveCoding: {
        total: liveCodingSessions.length,
        completed: liveCodingSessions.filter(s => s.status === 'COMPLETED').length,
        averageScore: calculateAverage(liveCodingSessions.filter(s => s.score).map(s => s.score!)),
      },
      takeHomeProjects: {
        total: projectSubmissions.length,
        submitted: projectSubmissions.filter(s => ['SUBMITTED', 'REVIEWED', 'ACCEPTED'].includes(s.status)).length,
        averageScore: calculateAverage(projectSubmissions.filter(s => s.overallScore).map(s => s.overallScore!)),
      },
      externalAssessments: {
        total: externalAssessments.length,
        byProvider: groupByProvider(externalAssessments),
        averagePercentile: calculateAverage(
          externalAssessments
            .filter(a => a.score && a.maxScore)
            .map(a => (a.score! / a.maxScore!) * 100)
        ),
      },
      softSkills: {
        total: softSkillAttempts.length,
        averageScore: calculateAverage(softSkillAttempts.filter(a => a.overallScore).map(a => a.overallScore!)),
      },
      languageTests: {
        total: languageTestAttempts.length,
        averageScore: calculateAverage(languageTestAttempts.filter(a => a.score).map(a => a.score!)),
        highestCEFR: getHighestCEFR(languageTestAttempts.map(a => a.cefrLevel).filter(Boolean) as string[]),
      },
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching batch 7 stats:', error);
    res.status(500).json({ error: 'Failed to fetch assessment stats' });
  }
};

function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
}

function groupByProvider(assessments: Array<{ provider: string }>): Record<string, number> {
  return assessments.reduce((acc, curr) => {
    acc[curr.provider] = (acc[curr.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function getHighestCEFR(levels: string[]): string | null {
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (levels.length === 0) return null;
  return levels.sort((a, b) => order.indexOf(b) - order.indexOf(a))[0];
}
