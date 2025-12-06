import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 1.4.1 - CODING CHALLENGES
// ============================================

// Get all published challenges
export const getCodingChallenges = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status: 'PUBLISHED' };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const [challenges, total] = await Promise.all([
      prisma.codingChallenge.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          difficulty: true,
          category: true,
          subcategory: true,
          tags: true,
          supportedLanguages: true,
          timeLimitMinutes: true,
          pointsValue: true,
          totalAttempts: true,
          totalCompletions: true,
          successRate: true,
          avgCompletionTime: true,
        },
      }),
      prisma.codingChallenge.count({ where }),
    ]);

    res.json({
      challenges,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching coding challenges:', error);
    res.status(500).json({ error: 'Failed to fetch coding challenges' });
  }
};

// Get single challenge by slug
export const getCodingChallenge = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const challenge = await prisma.codingChallenge.findUnique({
      where: { slug },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Don't expose solution code or hidden test cases to users
    const { solutionCode, hiddenTestCases, ...safeChallenge } = challenge;

    res.json({ challenge: safeChallenge });
  } catch (error) {
    console.error('Error fetching coding challenge:', error);
    res.status(500).json({ error: 'Failed to fetch coding challenge' });
  }
};

// Start challenge attempt
export const startChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { challengeId, language } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const challenge = await prisma.codingChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if user has exceeded max attempts
    if (challenge.maxAttempts) {
      const existingAttempts = await prisma.challengeSubmission.count({
        where: {
          challengeId,
          userId,
        },
      });

      if (existingAttempts >= challenge.maxAttempts) {
        return res.status(400).json({ error: 'Maximum attempts exceeded' });
      }
    }

    // Get attempt number
    const attemptNumber = await prisma.challengeSubmission.count({
      where: { challengeId, userId },
    }) + 1;

    // Get starter code for selected language
    const starterCode = (challenge.starterCode as Record<string, string>)?.[language] || '';

    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId,
        userId,
        attemptNumber,
        language,
        code: starterCode,
        status: 'IN_PROGRESS',
        totalTestCases: challenge.totalTestCases,
      },
    });

    res.json({
      success: true,
      submission,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        problemStatement: challenge.problemStatement,
        constraints: challenge.constraints,
        hints: challenge.hints,
        examples: challenge.examples,
        sampleTestCases: challenge.sampleTestCases,
        timeLimitMinutes: challenge.timeLimitMinutes,
      },
    });
  } catch (error) {
    console.error('Error starting challenge:', error);
    res.status(500).json({ error: 'Failed to start challenge' });
  }
};

// Submit code for challenge
export const submitChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { submissionId, code } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const submission = await prisma.challengeSubmission.findFirst({
      where: {
        id: submissionId,
        userId,
        status: 'IN_PROGRESS',
      },
      include: {
        challenge: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Active submission not found' });
    }

    const timeSpentSeconds = Math.floor(
      (new Date().getTime() - new Date(submission.startedAt).getTime()) / 1000
    );

    // TODO: Actually run code against test cases
    // For now, simulate grading
    const mockResults = simulateGrading(code, submission.challenge);

    const updatedSubmission = await prisma.challengeSubmission.update({
      where: { id: submissionId },
      data: {
        code,
        status: 'COMPLETED',
        submittedAt: new Date(),
        completedAt: new Date(),
        timeSpentSeconds,
        testCasesPassed: mockResults.passed,
        score: mockResults.score,
        testResults: mockResults.testResults,
        executionTime: mockResults.executionTime,
        autoFeedback: mockResults.feedback,
        linesOfCode: code.split('\n').filter((line: string) => line.trim()).length,
      },
    });

    // Update challenge statistics
    await prisma.codingChallenge.update({
      where: { id: submission.challengeId },
      data: {
        totalAttempts: { increment: 1 },
        totalCompletions: mockResults.score === 100 ? { increment: 1 } : undefined,
      },
    });

    res.json({
      success: true,
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error('Error submitting challenge:', error);
    res.status(500).json({ error: 'Failed to submit challenge' });
  }
};

// Get user's challenge submissions
export const getUserChallengeSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const submissions = await prisma.challengeSubmission.findMany({
      where: { userId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// ============================================
// 1.4.2 - TECHNICAL QUIZZES
// ============================================

// Get all published quizzes
export const getTechnicalQuizzes = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status: 'PUBLISHED' };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const [quizzes, total] = await Promise.all([
      prisma.technicalQuiz.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          category: true,
          subcategory: true,
          difficulty: true,
          tags: true,
          questionCount: true,
          timeLimitMinutes: true,
          passingScore: true,
          maxAttempts: true,
          totalAttempts: true,
          totalCompletions: true,
          avgScore: true,
        },
      }),
      prisma.technicalQuiz.count({ where }),
    ]);

    res.json({
      quizzes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching technical quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch technical quizzes' });
  }
};

// Get single quiz by slug
export const getTechnicalQuiz = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const quiz = await prisma.technicalQuiz.findUnique({
      where: { slug },
      include: {
        questions: {
          select: {
            id: true,
            questionNumber: true,
            questionType: true,
            questionText: true,
            questionCode: true,
            options: true,
            points: true,
            difficulty: true,
            displayOrder: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Remove correct answers from questions for security
    const safeQuestions = quiz.questions.map((q) => ({
      ...q,
      options: (q.options as any[]).map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        // Don't include isCorrect
      })),
    }));

    res.json({
      quiz: {
        ...quiz,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    console.error('Error fetching technical quiz:', error);
    res.status(500).json({ error: 'Failed to fetch technical quiz' });
  }
};

// Start quiz attempt
export const startQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { quizId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const quiz = await prisma.technicalQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user has exceeded max attempts
    if (quiz.maxAttempts) {
      const existingAttempts = await prisma.quizAttempt.count({
        where: {
          quizId,
          userId,
        },
      });

      if (existingAttempts >= quiz.maxAttempts) {
        return res.status(400).json({ error: 'Maximum attempts exceeded' });
      }
    }

    // Check cooldown
    if (quiz.cooldownMinutes) {
      const lastAttempt = await prisma.quizAttempt.findFirst({
        where: {
          quizId,
          userId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastAttempt) {
        const cooldownEnd = new Date(
          lastAttempt.createdAt.getTime() + quiz.cooldownMinutes * 60 * 1000
        );
        if (new Date() < cooldownEnd) {
          return res.status(400).json({
            error: 'Cooldown period not over',
            cooldownEndsAt: cooldownEnd,
          });
        }
      }
    }

    // Get attempt number
    const attemptNumber = await prisma.quizAttempt.count({
      where: { quizId, userId },
    }) + 1;

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        attemptNumber,
        status: 'IN_PROGRESS',
        totalQuestions: quiz.questions.length,
        totalPoints,
        passingScore: quiz.passingScore,
        answers: [],
      },
    });

    res.json({
      success: true,
      attempt,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        instructions: quiz.instructions,
        timeLimitMinutes: quiz.timeLimitMinutes,
        showTimer: quiz.showTimer,
        questionCount: quiz.questionCount,
      },
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
};

// Submit quiz answers
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { attemptId, answers } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: 'IN_PROGRESS',
      },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Active quiz attempt not found' });
    }

    const timeSpentSeconds = Math.floor(
      (new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000
    );

    // Grade the quiz
    const { results, correctAnswers, pointsEarned, skillBreakdown } = gradeQuiz(
      answers,
      attempt.quiz.questions
    );

    const score = (pointsEarned / attempt.totalPoints) * 100;
    const passed = score >= attempt.quiz.passingScore;

    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        submittedAt: new Date(),
        timeSpentSeconds,
        answers: results,
        correctAnswers,
        incorrectAnswers: attempt.totalQuestions - correctAnswers,
        skippedQuestions: answers.filter((a: any) => !a.selectedOptions?.length).length,
        pointsEarned,
        score,
        passed,
        skillBreakdown,
      },
    });

    // Update quiz statistics
    await prisma.technicalQuiz.update({
      where: { id: attempt.quizId },
      data: {
        totalAttempts: { increment: 1 },
        totalCompletions: { increment: 1 },
      },
    });

    // Update question statistics
    for (const result of results) {
      await prisma.quizQuestion.update({
        where: { id: result.questionId },
        data: {
          correctCount: result.isCorrect ? { increment: 1 } : undefined,
          incorrectCount: !result.isCorrect && result.selectedOptions?.length
            ? { increment: 1 }
            : undefined,
          skipCount: !result.selectedOptions?.length ? { increment: 1 } : undefined,
        },
      });
    }

    // Prepare response based on quiz settings
    let responseData: any = {
      success: true,
      attempt: {
        ...updatedAttempt,
        answers: attempt.quiz.showCorrectAnswers ? results : undefined,
      },
    };

    if (attempt.quiz.showScoreImmediately) {
      responseData.score = score;
      responseData.passed = passed;
      responseData.correctAnswers = correctAnswers;
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

// Get user's quiz attempts
export const getUserQuizAttempts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ attempts });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
};

// Get assessment statistics for user
export const getAssessmentStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [challengeStats, quizStats] = await Promise.all([
      prisma.challengeSubmission.aggregate({
        where: { userId, status: 'COMPLETED' },
        _count: true,
        _avg: { score: true },
      }),
      prisma.quizAttempt.aggregate({
        where: { userId, status: 'COMPLETED' },
        _count: true,
        _avg: { score: true },
      }),
    ]);

    const challengesByCategory = await prisma.challengeSubmission.groupBy({
      by: ['challengeId'],
      where: { userId, status: 'COMPLETED' },
    });

    const quizzesByCategory = await prisma.quizAttempt.groupBy({
      by: ['quizId'],
      where: { userId, status: 'COMPLETED' },
    });

    res.json({
      stats: {
        challenges: {
          completed: challengeStats._count,
          averageScore: challengeStats._avg.score || 0,
        },
        quizzes: {
          completed: quizStats._count,
          averageScore: quizStats._avg.score || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    res.status(500).json({ error: 'Failed to fetch assessment stats' });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function simulateGrading(code: string, challenge: any) {
  // This is a mock grading function
  // In production, this would run the code against test cases
  const totalTests = challenge.totalTestCases || 5;
  const passed = Math.floor(Math.random() * (totalTests + 1));
  const score = (passed / totalTests) * 100;

  const testResults = Array.from({ length: totalTests }, (_, i) => ({
    testCaseId: `test-${i + 1}`,
    passed: i < passed,
    executionTime: Math.random() * 100,
    output: i < passed ? 'Expected output' : 'Incorrect output',
    expectedOutput: 'Expected output',
    error: i >= passed ? 'Output mismatch' : null,
  }));

  return {
    passed,
    score,
    testResults,
    executionTime: testResults.reduce((sum, t) => sum + (t.executionTime || 0), 0) / totalTests,
    feedback: score === 100
      ? 'Perfect! All test cases passed.'
      : score >= 70
      ? 'Good job! Most test cases passed.'
      : 'Keep trying. Review your logic.',
  };
}

function gradeQuiz(answers: any[], questions: any[]) {
  const results = [];
  let correctAnswers = 0;
  let pointsEarned = 0;
  const skillBreakdown: Record<string, { correct: number; total: number }> = {};

  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    const correctOptions = question.correctAnswers || [];
    const selectedOptions = answer?.selectedOptions || [];

    // Check if answer is correct
    let isCorrect = false;
    if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
      isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
    } else if (question.questionType === 'multiple_select') {
      isCorrect =
        selectedOptions.length === correctOptions.length &&
        selectedOptions.every((opt: string) => correctOptions.includes(opt));
    } else if (question.questionType === 'fill_blank' || question.questionType === 'code_output') {
      const answerText = answer?.answerText?.trim().toLowerCase();
      const expected = question.expectedAnswer?.trim().toLowerCase();
      const variations = question.acceptedVariations || [];
      isCorrect =
        answerText === expected ||
        variations.some((v: string) => v.trim().toLowerCase() === answerText);
    }

    if (isCorrect) {
      correctAnswers++;
      pointsEarned += question.points;
    }

    // Track skill breakdown
    if (question.skill) {
      if (!skillBreakdown[question.skill]) {
        skillBreakdown[question.skill] = { correct: 0, total: 0 };
      }
      skillBreakdown[question.skill].total++;
      if (isCorrect) {
        skillBreakdown[question.skill].correct++;
      }
    }

    results.push({
      questionId: question.id,
      selectedOptions,
      answerText: answer?.answerText,
      isCorrect,
      points: isCorrect ? question.points : 0,
      correctOptions,
    });
  }

  return { results, correctAnswers, pointsEarned, skillBreakdown };
}

export default {
  // Coding challenges
  getCodingChallenges,
  getCodingChallenge,
  startChallenge,
  submitChallenge,
  getUserChallengeSubmissions,
  // Technical quizzes
  getTechnicalQuizzes,
  getTechnicalQuiz,
  startQuiz,
  submitQuiz,
  getUserQuizAttempts,
  // Stats
  getAssessmentStats,
};
