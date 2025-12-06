import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// ============================================
// 1.4.8 - DOMAIN-SPECIFIC ASSESSMENTS
// ============================================

// Get all domain assessments
export const getDomainAssessments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { domain, difficulty, isActive } = req.query;

    const where: any = {};
    if (domain) where.domain = domain;
    if (difficulty) where.difficultyLevel = difficulty;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const assessments = await prisma.domainAssessment.findMany({
      where,
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: [{ domain: 'asc' }, { difficultyLevel: 'asc' }],
    });

    res.json({ assessments });
  } catch (error) {
    console.error('Error fetching domain assessments:', error);
    res.status(500).json({ error: 'Failed to fetch domain assessments' });
  }
};

// Get a specific domain assessment
export const getDomainAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const includeQuestions = req.query.includeQuestions === 'true';

    const assessment = await prisma.domainAssessment.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
        isActive: true,
      },
      include: includeQuestions ? {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            caseStudy: true,
            exhibits: true,
            points: true,
            difficulty: true,
            topic: true,
            order: true,
            // Don't include correctAnswer
          },
        },
      } : undefined,
    });

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    res.json({ assessment });
  } catch (error) {
    console.error('Error fetching domain assessment:', error);
    res.status(500).json({ error: 'Failed to fetch domain assessment' });
  }
};

// Start a domain assessment attempt
export const startDomainAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { assessmentId, applicationId } = req.body;

    const assessment = await prisma.domainAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          orderBy: assessment => assessment.randomizeQuestions ? undefined : { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            caseStudy: true,
            exhibits: true,
            points: true,
            difficulty: true,
            topic: true,
          },
        },
      },
    });

    if (!assessment || !assessment.isActive) {
      res.status(404).json({ error: 'Assessment not found or inactive' });
      return;
    }

    // Check for existing incomplete attempt
    const existingAttempt = await prisma.domainAssessmentAttempt.findFirst({
      where: {
        assessmentId,
        userId,
        status: 'IN_PROGRESS',
      },
    });

    if (existingAttempt) {
      res.json({
        attempt: existingAttempt,
        assessment,
        resuming: true,
      });
      return;
    }

    // Randomize questions if configured
    let questions = assessment.questions;
    if (assessment.randomizeQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    // Limit to questionCount
    questions = questions.slice(0, assessment.questionCount);

    const attempt = await prisma.domainAssessmentAttempt.create({
      data: {
        assessmentId,
        userId: userId!,
        applicationId,
        status: 'IN_PROGRESS',
        answers: [],
      },
    });

    res.status(201).json({
      attempt,
      assessment: { ...assessment, questions },
    });
  } catch (error) {
    console.error('Error starting domain assessment:', error);
    res.status(500).json({ error: 'Failed to start domain assessment' });
  }
};

// Save progress on domain assessment
export const saveDomainAssessmentProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { attemptId } = req.params;
    const { answers, currentQuestionIndex, timeSpentSeconds, flaggedQuestions } = req.body;

    const attempt = await prisma.domainAssessmentAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: 'IN_PROGRESS',
      },
    });

    if (!attempt) {
      res.status(404).json({ error: 'Active attempt not found' });
      return;
    }

    const updatedAttempt = await prisma.domainAssessmentAttempt.update({
      where: { id: attemptId },
      data: {
        answers,
        currentQuestionIndex,
        timeSpentSeconds,
        questionsAnswered: answers.length,
        flaggedQuestions: flaggedQuestions || [],
      },
    });

    res.json({ attempt: updatedAttempt });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
};

// Submit domain assessment
export const submitDomainAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { attemptId } = req.params;
    const { answers, timeSpentSeconds } = req.body;

    const attempt = await prisma.domainAssessmentAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: 'IN_PROGRESS',
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

    // Calculate scores
    let totalPoints = 0;
    let earnedPoints = 0;
    const topicScores: Record<string, { correct: number; total: number }> = {};
    const skillScores: Record<string, { correct: number; total: number }> = {};

    attempt.assessment.questions.forEach((question) => {
      const answer = answers.find((a: any) => a.questionId === question.id);
      totalPoints += question.points;

      // Track topic and skill scores
      const topic = question.topic || 'General';
      if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 };
      topicScores[topic].total++;

      question.skills.forEach((skill) => {
        if (!skillScores[skill]) skillScores[skill] = { correct: 0, total: 0 };
        skillScores[skill].total++;
      });

      // Check answer
      let isCorrect = false;
      if (answer) {
        const options = question.options as any[];
        if (options) {
          const correctOption = options.find((o: any) => o.isCorrect);
          isCorrect = correctOption && answer.answer === correctOption.id;
        } else if (question.correctAnswer) {
          isCorrect = answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        }
      }

      if (isCorrect) {
        earnedPoints += question.points;
        topicScores[topic].correct++;
        question.skills.forEach((skill) => {
          skillScores[skill].correct++;
        });
      }
    });

    const percentageScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentageScore >= attempt.assessment.passingScore;

    // Calculate percentile (mock - in production would compare to all attempts)
    const percentile = Math.min(100, Math.round(percentageScore + Math.random() * 10));

    // Generate certificate if passed
    let certificateUrl = null;
    let certificateExpiresAt = null;
    if (passed && attempt.assessment.providesCertificate) {
      certificateUrl = `https://certificates.kreupai.com/${attemptId}`;
      if (attempt.assessment.certificateValidDays) {
        certificateExpiresAt = new Date();
        certificateExpiresAt.setDate(certificateExpiresAt.getDate() + attempt.assessment.certificateValidDays);
      }
    }

    const updatedAttempt = await prisma.domainAssessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        answers,
        timeSpentSeconds,
        questionsAnswered: answers.length,
        rawScore: earnedPoints,
        percentageScore,
        passed,
        topicScores,
        skillScores,
        percentile,
        certificateUrl,
        certificateExpiresAt,
      },
      include: { assessment: true },
    });

    // Update skill decay trackers
    for (const [skill, scores] of Object.entries(skillScores)) {
      const skillScore = (scores.correct / scores.total) * 100;
      await updateSkillDecay(userId!, skill, skillScore, attemptId);
    }

    // Update assessment analytics
    await updateAssessmentAnalytics(userId!, 'domain', percentageScore, passed);

    res.json({ attempt: updatedAttempt });
  } catch (error) {
    console.error('Error submitting domain assessment:', error);
    res.status(500).json({ error: 'Failed to submit domain assessment' });
  }
};

// Get user's domain assessment attempts
export const getUserDomainAttempts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { domain, status } = req.query;

    const where: any = { userId };
    if (status) where.status = status;

    const attempts = await prisma.domainAssessmentAttempt.findMany({
      where,
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            slug: true,
            domain: true,
            subDomain: true,
            difficultyLevel: true,
            passingScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by domain if specified
    const filtered = domain
      ? attempts.filter((a) => a.assessment.domain === domain)
      : attempts;

    res.json({ attempts: filtered });
  } catch (error) {
    console.error('Error fetching domain attempts:', error);
    res.status(500).json({ error: 'Failed to fetch domain attempts' });
  }
};

// ============================================
// 1.4.9 - ASSESSMENT ANALYTICS
// ============================================

// Get comprehensive assessment analytics
export const getAssessmentAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    let analytics = await prisma.assessmentAnalytics.findUnique({
      where: { userId },
    });

    if (!analytics) {
      // Generate analytics if not exists
      analytics = await generateAssessmentAnalytics(userId!);
    }

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching assessment analytics:', error);
    res.status(500).json({ error: 'Failed to fetch assessment analytics' });
  }
};

// Refresh assessment analytics
export const refreshAssessmentAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const analytics = await generateAssessmentAnalytics(userId!);
    res.json({ analytics });
  } catch (error) {
    console.error('Error refreshing analytics:', error);
    res.status(500).json({ error: 'Failed to refresh analytics' });
  }
};

// Helper function to generate analytics
async function generateAssessmentAnalytics(userId: string) {
  // Fetch all assessment data
  const [
    codingSubmissions,
    quizAttempts,
    domainAttempts,
    softSkillAttempts,
    languageAttempts,
  ] = await Promise.all([
    prisma.challengeSubmission.findMany({
      where: { candidateId: userId, status: 'COMPLETED' },
      select: { score: true, createdAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, submittedAt: { not: null } },
      select: { score: true, passed: true, createdAt: true },
    }),
    prisma.domainAssessmentAttempt.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { percentageScore: true, passed: true, createdAt: true, skillScores: true },
    }),
    prisma.softSkillAttempt.findMany({
      where: { candidateId: userId, completedAt: { not: null } },
      select: { overallScore: true, createdAt: true },
    }),
    prisma.languageTestAttempt.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { totalScore: true, createdAt: true },
    }),
  ]);

  // Calculate aggregate stats
  const allScores = [
    ...codingSubmissions.map(s => s.score).filter(Boolean),
    ...quizAttempts.map(a => a.score).filter(Boolean),
    ...domainAttempts.map(a => a.percentageScore).filter(Boolean),
    ...softSkillAttempts.map(a => a.overallScore).filter(Boolean),
    ...languageAttempts.map(a => a.totalScore).filter(Boolean),
  ] as number[];

  const totalTaken = allScores.length;
  const totalPassed = [
    ...quizAttempts.filter(a => a.passed),
    ...domainAttempts.filter(a => a.passed),
  ].length;

  const avgScore = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : null;

  // Build score history
  const scoreHistory = [
    ...codingSubmissions.map(s => ({ date: s.createdAt, type: 'coding', score: s.score })),
    ...quizAttempts.map(a => ({ date: a.createdAt, type: 'quiz', score: a.score })),
    ...domainAttempts.map(a => ({ date: a.createdAt, type: 'domain', score: a.percentageScore })),
    ...softSkillAttempts.map(a => ({ date: a.createdAt, type: 'softSkill', score: a.overallScore })),
    ...languageAttempts.map(a => ({ date: a.createdAt, type: 'language', score: a.totalScore })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate skill performance from domain assessments
  const skillPerformance: Record<string, { assessments: number; totalScore: number }> = {};
  domainAttempts.forEach(attempt => {
    if (attempt.skillScores) {
      const skills = attempt.skillScores as Record<string, { correct: number; total: number }>;
      Object.entries(skills).forEach(([skill, data]) => {
        if (!skillPerformance[skill]) {
          skillPerformance[skill] = { assessments: 0, totalScore: 0 };
        }
        skillPerformance[skill].assessments++;
        skillPerformance[skill].totalScore += (data.correct / data.total) * 100;
      });
    }
  });

  const skillPerformanceFormatted = Object.fromEntries(
    Object.entries(skillPerformance).map(([skill, data]) => [
      skill,
      {
        assessments: data.assessments,
        avgScore: Math.round(data.totalScore / data.assessments),
      },
    ])
  );

  // Identify strengths and weaknesses
  const sortedSkills = Object.entries(skillPerformanceFormatted)
    .sort(([, a], [, b]) => b.avgScore - a.avgScore);

  const topStrengths = sortedSkills.slice(0, 5).map(([skill]) => skill);
  const areasForImprovement = sortedSkills.slice(-3).reverse().map(([skill]) => skill);

  // Upsert analytics
  const analytics = await prisma.assessmentAnalytics.upsert({
    where: { userId },
    update: {
      totalAssessmentsTaken: totalTaken,
      totalAssessmentsPassed: totalPassed,
      overallAverageScore: avgScore,
      codingChallenges: {
        taken: codingSubmissions.length,
        avgScore: codingSubmissions.length > 0
          ? codingSubmissions.reduce((a, b) => a + (b.score || 0), 0) / codingSubmissions.length
          : null,
      },
      technicalQuizzes: {
        taken: quizAttempts.length,
        passed: quizAttempts.filter(a => a.passed).length,
        avgScore: quizAttempts.length > 0
          ? quizAttempts.reduce((a, b) => a + (b.score || 0), 0) / quizAttempts.length
          : null,
      },
      domainAssessments: {
        taken: domainAttempts.length,
        passed: domainAttempts.filter(a => a.passed).length,
        avgScore: domainAttempts.length > 0
          ? domainAttempts.reduce((a, b) => a + (b.percentageScore || 0), 0) / domainAttempts.length
          : null,
      },
      softSkillsTests: {
        taken: softSkillAttempts.length,
        avgScore: softSkillAttempts.length > 0
          ? softSkillAttempts.reduce((a, b) => a + (b.overallScore || 0), 0) / softSkillAttempts.length
          : null,
      },
      languageTests: {
        taken: languageAttempts.length,
        avgScore: languageAttempts.length > 0
          ? languageAttempts.reduce((a, b) => a + (b.totalScore || 0), 0) / languageAttempts.length
          : null,
      },
      skillPerformance: skillPerformanceFormatted,
      scoreHistory: scoreHistory.slice(0, 50), // Keep last 50
      topStrengths,
      areasForImprovement,
      lastAnalyzedAt: new Date(),
    },
    create: {
      userId,
      totalAssessmentsTaken: totalTaken,
      totalAssessmentsPassed: totalPassed,
      overallAverageScore: avgScore,
      topStrengths,
      areasForImprovement,
      lastAnalyzedAt: new Date(),
    },
  });

  return analytics;
}

// Helper to update analytics incrementally
async function updateAssessmentAnalytics(
  userId: string,
  assessmentType: string,
  score: number,
  passed: boolean
) {
  try {
    const existing = await prisma.assessmentAnalytics.findUnique({ where: { userId } });

    if (existing) {
      await prisma.assessmentAnalytics.update({
        where: { userId },
        data: {
          totalAssessmentsTaken: { increment: 1 },
          totalAssessmentsPassed: passed ? { increment: 1 } : undefined,
          lastAssessmentAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error updating assessment analytics:', error);
  }
}

// ============================================
// 1.4.10 - SKILL DECAY TRACKING
// ============================================

// Get skill decay trackers
export const getSkillDecayTrackers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { needsRefresh, category } = req.query;

    const where: any = { userId };

    if (needsRefresh === 'true') {
      where.refreshDueAt = { lte: new Date() };
    }

    if (category) {
      where.skillCategory = category;
    }

    const trackers = await prisma.skillDecayTracker.findMany({
      where,
      orderBy: [{ refreshPriority: 'asc' }, { refreshDueAt: 'asc' }],
    });

    res.json({ trackers });
  } catch (error) {
    console.error('Error fetching skill decay trackers:', error);
    res.status(500).json({ error: 'Failed to fetch skill decay trackers' });
  }
};

// Get decay summary
export const getSkillDecaySummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const trackers = await prisma.skillDecayTracker.findMany({
      where: { userId },
    });

    const now = new Date();
    const needsRefresh = trackers.filter(t => t.refreshDueAt && new Date(t.refreshDueAt) <= now);
    const upcomingRefresh = trackers.filter(t => {
      if (!t.refreshDueAt) return false;
      const dueDate = new Date(t.refreshDueAt);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return dueDate > now && dueDate <= thirtyDaysFromNow;
    });

    const byCategory: Record<string, number> = {};
    trackers.forEach(t => {
      const cat = t.skillCategory || 'OTHER';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    const summary = {
      totalTracked: trackers.length,
      needsRefresh: needsRefresh.length,
      upcomingRefresh: upcomingRefresh.length,
      byCategory,
      urgentSkills: needsRefresh.map(t => ({
        skill: t.skillName,
        lastAssessed: t.lastAssessedAt,
        estimatedScore: t.currentEstimatedScore,
        priority: t.refreshPriority,
      })),
    };

    res.json({ summary });
  } catch (error) {
    console.error('Error fetching decay summary:', error);
    res.status(500).json({ error: 'Failed to fetch decay summary' });
  }
};

// Helper to update skill decay
async function updateSkillDecay(
  userId: string,
  skillName: string,
  score: number,
  assessmentId: string
) {
  try {
    const existing = await prisma.skillDecayTracker.findUnique({
      where: { userId_skillName: { userId, skillName } },
    });

    // Calculate refresh due date (e.g., 6 months for most skills)
    const refreshDueAt = new Date();
    refreshDueAt.setMonth(refreshDueAt.getMonth() + 6);

    const scoreHistory = existing?.scoreHistory as any[] || [];
    scoreHistory.push({ date: new Date(), score, assessmentId });

    if (existing) {
      await prisma.skillDecayTracker.update({
        where: { userId_skillName: { userId, skillName } },
        data: {
          lastAssessedAt: new Date(),
          lastScore: score,
          peakScore: Math.max(existing.peakScore, score),
          assessmentCount: { increment: 1 },
          currentEstimatedScore: score,
          refreshDueAt,
          refreshPriority: score < 70 ? 'HIGH' : score < 85 ? 'MEDIUM' : 'LOW',
          reminderSent: false,
          scoreHistory: scoreHistory.slice(-10), // Keep last 10
        },
      });
    } else {
      await prisma.skillDecayTracker.create({
        data: {
          userId,
          skillName,
          lastAssessedAt: new Date(),
          lastScore: score,
          peakScore: score,
          currentEstimatedScore: score,
          refreshDueAt,
          refreshPriority: score < 70 ? 'HIGH' : score < 85 ? 'MEDIUM' : 'LOW',
          skillCategory: 'TECHNICAL',
          scoreHistory: [{ date: new Date(), score, assessmentId }],
        },
      });
    }
  } catch (error) {
    console.error('Error updating skill decay:', error);
  }
}

// ============================================
// 2.1.1 - AI PROFILE SCORER
// ============================================

// Get AI profile score
export const getAIProfileScore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
        skills: true,
        projects: true,
        achievements: true,
        externalAssessments: true,
        emailVerifications: true,
        certificationVerifications: true,
        trustScore: true,
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // Check for existing score
    let score = await prisma.aIProfileScore.findUnique({
      where: { profileId: profile.id },
    });

    // Generate new score if not exists or stale (older than 24 hours)
    const isStale = score && new Date().getTime() - new Date(score.lastScoredAt).getTime() > 24 * 60 * 60 * 1000;

    if (!score || isStale) {
      score = await generateAIProfileScore(userId!, profile);
    }

    res.json({ score });
  } catch (error) {
    console.error('Error fetching AI profile score:', error);
    res.status(500).json({ error: 'Failed to fetch AI profile score' });
  }
};

// Regenerate AI profile score
export const regenerateAIProfileScore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
        skills: true,
        projects: true,
        achievements: true,
        externalAssessments: true,
        emailVerifications: true,
        certificationVerifications: true,
        trustScore: true,
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const score = await generateAIProfileScore(userId!, profile);
    res.json({ score });
  } catch (error) {
    console.error('Error regenerating AI profile score:', error);
    res.status(500).json({ error: 'Failed to regenerate AI profile score' });
  }
};

// Helper to generate AI profile score
async function generateAIProfileScore(userId: string, profile: any) {
  // Calculate component scores
  const profileCompleteness = profile.completenessScore || 0;

  // Experience depth (based on years and roles)
  const totalExperienceMonths = profile.workExperiences.reduce((total: number, exp: any) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    return total + Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }, 0);
  const experienceDepth = Math.min(100, totalExperienceMonths / 1.2);

  // Skills verification
  const verifiedSkills = profile.skills.filter((s: any) => s.verificationStatus === 'VERIFIED').length;
  const totalSkills = profile.skills.length || 1;
  const skillsVerification = Math.min(100, (verifiedSkills / totalSkills) * 100 + (totalSkills * 2));

  // Education strength
  const educationCount = profile.educations.length;
  const certCount = profile.certifications.length;
  const educationStrength = Math.min(100, (educationCount * 20) + (certCount * 10) + 30);

  // Project quality (based on count and descriptions)
  const projectQuality = Math.min(100, profile.projects.length * 15 + 20);

  // Assessment performance
  const externalAssessments = profile.externalAssessments || [];
  const avgAssessmentScore = externalAssessments.length > 0
    ? externalAssessments.reduce((sum: number, a: any) => sum + ((a.score || 0) / (a.maxScore || 100) * 100), 0) / externalAssessments.length
    : 50;
  const assessmentPerformance = avgAssessmentScore;

  // Verification score
  const verifications = [
    ...profile.emailVerifications,
    ...profile.certificationVerifications,
  ];
  const verifiedCount = verifications.filter((v: any) => v.status === 'VERIFIED').length;
  const verificationScore = Math.min(100, verifiedCount * 15 + (profile.trustScore?.score || 50));

  // Engagement score (mock - would be based on activity)
  const engagementScore = 60 + Math.random() * 30;

  // Calculate weighted overall score
  const weights = {
    profileCompleteness: 0.15,
    experienceDepth: 0.20,
    skillsVerification: 0.15,
    educationStrength: 0.10,
    projectQuality: 0.10,
    assessmentPerformance: 0.15,
    verificationScore: 0.10,
    engagementScore: 0.05,
  };

  const overallScore = Math.round(
    profileCompleteness * weights.profileCompleteness +
    experienceDepth * weights.experienceDepth +
    skillsVerification * weights.skillsVerification +
    educationStrength * weights.educationStrength +
    projectQuality * weights.projectQuality +
    assessmentPerformance * weights.assessmentPerformance +
    verificationScore * weights.verificationScore +
    engagementScore * weights.engagementScore
  );

  // Determine grade
  const scoreGrade = overallScore >= 95 ? 'A+' :
    overallScore >= 90 ? 'A' :
    overallScore >= 85 ? 'B+' :
    overallScore >= 80 ? 'B' :
    overallScore >= 75 ? 'C+' :
    overallScore >= 70 ? 'C' :
    overallScore >= 60 ? 'D' : 'F';

  // Identify strengths and weaknesses
  const componentScores = {
    profileCompleteness,
    experienceDepth,
    skillsVerification,
    educationStrength,
    projectQuality,
    assessmentPerformance,
    verificationScore,
    engagementScore,
  };

  const sortedComponents = Object.entries(componentScores).sort(([, a], [, b]) => b - a);
  const strengths = sortedComponents.slice(0, 3).map(([key]) => formatComponentName(key));
  const weaknesses = sortedComponents.slice(-2).map(([key]) => formatComponentName(key));

  // Generate recommendations
  const recommendations = [];
  if (profileCompleteness < 80) {
    recommendations.push({ area: 'Profile', suggestion: 'Complete all profile sections', impact: 'HIGH' });
  }
  if (skillsVerification < 60) {
    recommendations.push({ area: 'Skills', suggestion: 'Take skill assessments to verify your abilities', impact: 'HIGH' });
  }
  if (projectQuality < 50) {
    recommendations.push({ area: 'Projects', suggestion: 'Add more portfolio projects with detailed descriptions', impact: 'MEDIUM' });
  }

  // Estimate career level
  const yearsOfExperience = Math.round(totalExperienceMonths / 12);
  const estimatedLevel = yearsOfExperience <= 2 ? 'ENTRY' :
    yearsOfExperience <= 5 ? 'MID' :
    yearsOfExperience <= 8 ? 'SENIOR' :
    yearsOfExperience <= 12 ? 'LEAD' : 'EXECUTIVE';

  // Upsert score
  const score = await prisma.aIProfileScore.upsert({
    where: { profileId: profile.id },
    update: {
      overallScore,
      scoreGrade,
      profileCompleteness,
      experienceDepth,
      skillsVerification,
      educationStrength,
      projectQuality,
      assessmentPerformance,
      verificationScore,
      engagementScore,
      componentWeights: weights,
      componentDetails: Object.fromEntries(
        Object.entries(componentScores).map(([key, value]) => [key, { score: value }])
      ),
      strengths,
      weaknesses,
      recommendations,
      estimatedLevel,
      yearsOfExperience,
      marketPercentile: Math.min(99, overallScore + Math.random() * 10 - 5),
      lastScoredAt: new Date(),
    },
    create: {
      profileId: profile.id,
      userId,
      overallScore,
      scoreGrade,
      profileCompleteness,
      experienceDepth,
      skillsVerification,
      educationStrength,
      projectQuality,
      assessmentPerformance,
      verificationScore,
      engagementScore,
      componentWeights: weights,
      componentDetails: Object.fromEntries(
        Object.entries(componentScores).map(([key, value]) => [key, { score: value }])
      ),
      strengths,
      weaknesses,
      recommendations,
      estimatedLevel,
      yearsOfExperience,
      marketPercentile: Math.min(99, overallScore + Math.random() * 10 - 5),
      lastScoredAt: new Date(),
    },
  });

  return score;
}

function formatComponentName(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

// ============================================
// 2.1.2 - JOB-FIT SCORE
// ============================================

// Calculate job fit score for a specific job
export const calculateJobFitScore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Get user profile
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        workExperiences: true,
        educations: true,
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // Calculate component scores
    const candidateSkills = profile.skills.map(s => s.skillName.toLowerCase());
    const requiredSkills = job.skills.map(s => s.toLowerCase());

    const matchedSkills = requiredSkills.filter(s => candidateSkills.includes(s));
    const missingSkills = requiredSkills.filter(s => !candidateSkills.includes(s));
    const bonusSkills = candidateSkills.filter(s => !requiredSkills.includes(s));

    const skillsMatch = requiredSkills.length > 0
      ? (matchedSkills.length / requiredSkills.length) * 100
      : 100;

    // Experience match
    const totalExperienceYears = profile.workExperiences.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    }, 0);

    // Parse required experience (e.g., "3-5 years")
    const expMatch = job.experience?.match(/(\d+)/);
    const requiredExp = expMatch ? parseInt(expMatch[1]) : 0;
    const experienceMatch = requiredExp > 0
      ? Math.min(100, (totalExperienceYears / requiredExp) * 100)
      : 100;

    // Education match
    const hasRelevantEducation = profile.educations.some(edu =>
      job.education?.toLowerCase().includes(edu.degree.toLowerCase()) ||
      job.education?.toLowerCase().includes(edu.fieldOfStudy.toLowerCase())
    );
    const educationMatch = hasRelevantEducation ? 90 : 60;

    // Location match
    const candidateLocation = profile.city?.toLowerCase() || '';
    const jobLocation = job.location.toLowerCase();
    const locationMatch = jobLocation.includes('remote') ? 100 :
      candidateLocation.includes(jobLocation) || jobLocation.includes(candidateLocation) ? 100 :
      profile.willingToRelocate ? 70 : 40;

    // Salary match
    const salaryMatch = job.salaryMax && profile.expectedSalary
      ? profile.expectedSalary <= job.salaryMax ? 100 :
        profile.expectedSalary <= job.salaryMax * 1.1 ? 80 :
        profile.expectedSalary <= job.salaryMax * 1.2 ? 60 : 40
      : 80;

    // Seniority match (simplified)
    const seniorityMatch = 75;

    // Industry match
    const industryMatch = profile.industries?.includes(job.companyIndustry || '') ? 90 : 60;

    // Calculate overall fit
    const weights = {
      skills: 0.30,
      experience: 0.25,
      education: 0.10,
      location: 0.10,
      salary: 0.10,
      seniority: 0.10,
      industry: 0.05,
    };

    const overallFitScore = Math.round(
      skillsMatch * weights.skills +
      experienceMatch * weights.experience +
      educationMatch * weights.education +
      locationMatch * weights.location +
      salaryMatch * weights.salary +
      seniorityMatch * weights.seniority +
      industryMatch * weights.industry
    );

    const fitCategory = overallFitScore >= 85 ? 'EXCELLENT_FIT' :
      overallFitScore >= 70 ? 'GOOD_FIT' :
      overallFitScore >= 55 ? 'MODERATE_FIT' :
      overallFitScore >= 40 ? 'LOW_FIT' : 'POOR_FIT';

    // Generate AI summary
    const candidateSummary = `Candidate shows ${fitCategory.replace('_', ' ').toLowerCase()} with ${matchedSkills.length}/${requiredSkills.length} required skills and ${Math.round(totalExperienceYears)} years of experience.`;

    // Identify interview focus areas
    const interviewFocus = [];
    if (missingSkills.length > 0) {
      interviewFocus.push(`Assess proficiency in: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    if (experienceMatch < 80) {
      interviewFocus.push('Evaluate depth of experience in similar roles');
    }

    // Concern flags
    const concernFlags = [];
    if (skillsMatch < 50) concernFlags.push('Missing many required skills');
    if (experienceMatch < 60) concernFlags.push('May be underqualified');
    if (salaryMatch < 60) concernFlags.push('Salary expectations may exceed budget');

    // Upsert job fit score
    const score = await prisma.jobFitScore.upsert({
      where: { userId_jobId: { userId: userId!, jobId } },
      update: {
        overallFitScore,
        fitCategory,
        skillsMatch,
        experienceMatch,
        educationMatch,
        locationMatch,
        salaryMatch,
        senioritylMatch: seniorityMatch,
        industryMatch,
        matchedSkills: matchedSkills.map(s => ({ skill: s, match: true })),
        missingSkills,
        bonusSkills,
        candidateSummary,
        interviewFocus,
        concernFlags,
        requirementMatches: {},
        calculatedAt: new Date(),
      },
      create: {
        userId: userId!,
        profileId: profile.id,
        jobId,
        overallFitScore,
        fitCategory,
        skillsMatch,
        experienceMatch,
        educationMatch,
        locationMatch,
        salaryMatch,
        senioritylMatch: seniorityMatch,
        industryMatch,
        matchedSkills: matchedSkills.map(s => ({ skill: s, match: true })),
        missingSkills,
        bonusSkills,
        candidateSummary,
        interviewFocus,
        concernFlags,
        requirementMatches: {},
        calculatedAt: new Date(),
      },
    });

    res.json({ score });
  } catch (error) {
    console.error('Error calculating job fit score:', error);
    res.status(500).json({ error: 'Failed to calculate job fit score' });
  }
};

// Get job fit score
export const getJobFitScore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    const score = await prisma.jobFitScore.findUnique({
      where: { userId_jobId: { userId: userId!, jobId } },
    });

    if (!score) {
      res.status(404).json({ error: 'Job fit score not found. Calculate it first.' });
      return;
    }

    res.json({ score });
  } catch (error) {
    console.error('Error fetching job fit score:', error);
    res.status(500).json({ error: 'Failed to fetch job fit score' });
  }
};

// Get all job fit scores for user
export const getUserJobFitScores = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const scores = await prisma.jobFitScore.findMany({
      where: { userId },
      orderBy: { overallFitScore: 'desc' },
    });

    // Get job details for each score
    const jobIds = scores.map(s => s.jobId);
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds } },
      select: {
        id: true,
        title: true,
        companyName: true,
        location: true,
        type: true,
      },
    });

    const scoresWithJobs = scores.map(score => ({
      ...score,
      job: jobs.find(j => j.id === score.jobId),
    }));

    res.json({ scores: scoresWithJobs });
  } catch (error) {
    console.error('Error fetching user job fit scores:', error);
    res.status(500).json({ error: 'Failed to fetch job fit scores' });
  }
};

// Get job fit scores for a job (recruiter view)
export const getJobApplicantScores = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { minScore, fitCategory } = req.query;

    const where: any = { jobId };
    if (minScore) where.overallFitScore = { gte: parseFloat(minScore as string) };
    if (fitCategory) where.fitCategory = fitCategory;

    const scores = await prisma.jobFitScore.findMany({
      where,
      orderBy: { overallFitScore: 'desc' },
    });

    // Get user details
    const userIds = scores.map(s => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const scoresWithUsers = scores.map(score => ({
      ...score,
      user: users.find(u => u.id === score.userId),
    }));

    res.json({ scores: scoresWithUsers });
  } catch (error) {
    console.error('Error fetching job applicant scores:', error);
    res.status(500).json({ error: 'Failed to fetch job applicant scores' });
  }
};
