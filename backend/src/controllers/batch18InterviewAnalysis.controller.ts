import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 4.2.1 - SPEECH-TO-TEXT TRANSCRIPTION
// ============================================

// Create transcription job
export const createTranscription = async (req: Request, res: Response) => {
  try {
    const { interviewId, responseId, sourceType, sourceUrl, duration, language } = req.body;

    const transcription = await prisma.interviewTranscription.create({
      data: {
        interviewId,
        responseId,
        sourceType,
        sourceUrl,
        duration,
        language: language || 'en',
        rawTranscript: '', // Will be populated after processing
        status: 'PENDING',
      },
    });

    // In production, this would trigger async processing
    // For now, simulate processing
    setTimeout(async () => {
      try {
        await prisma.interviewTranscription.update({
          where: { id: transcription.id },
          data: {
            status: 'COMPLETED',
            rawTranscript: 'Sample transcription text from interview...',
            formattedTranscript: '[00:00] Interviewer: Sample question\n[00:15] Candidate: Sample answer...',
            confidence: 0.92,
            wordCount: 250,
            audioQuality: 'GOOD',
            processingTime: 5000,
          },
        });
      } catch (err) {
        console.error('Transcription processing error:', err);
      }
    }, 2000);

    res.status(201).json(transcription);
  } catch (error) {
    console.error('Error creating transcription:', error);
    res.status(500).json({ error: 'Failed to create transcription' });
  }
};

// Get transcriptions for interview
export const getTranscriptions = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const transcriptions = await prisma.interviewTranscription.findMany({
      where: { interviewId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(transcriptions);
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    res.status(500).json({ error: 'Failed to fetch transcriptions' });
  }
};

// Get transcription by ID
export const getTranscriptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transcription = await prisma.interviewTranscription.findUnique({
      where: { id },
      include: {
        interview: {
          select: { id: true, title: true, candidateId: true },
        },
      },
    });

    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }

    res.json(transcription);
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({ error: 'Failed to fetch transcription' });
  }
};

// Retry transcription
export const retryTranscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transcription = await prisma.interviewTranscription.update({
      where: { id },
      data: {
        status: 'PENDING',
        errorMessage: null,
      },
    });

    res.json(transcription);
  } catch (error) {
    console.error('Error retrying transcription:', error);
    res.status(500).json({ error: 'Failed to retry transcription' });
  }
};

// ============================================
// 4.2.2 - ANSWER QUALITY SCORING
// ============================================

// Analyze answer quality
export const analyzeAnswer = async (req: Request, res: Response) => {
  try {
    const {
      interviewId,
      transcriptionId,
      responseId,
      questionId,
      questionText,
      questionType,
      answerText,
      expectedKeywords,
    } = req.body;

    // Simulate AI analysis
    const overallScore = 65 + Math.random() * 30;
    const analysis = await prisma.answerAnalysis.create({
      data: {
        interviewId,
        transcriptionId,
        responseId,
        questionId,
        questionText,
        questionType,
        answerText,
        answerLength: answerText.split(/\s+/).length,
        expectedKeywords: expectedKeywords || [],
        overallScore,
        relevanceScore: 60 + Math.random() * 35,
        completenessScore: 60 + Math.random() * 35,
        depthScore: 55 + Math.random() * 40,
        clarityScore: 65 + Math.random() * 30,
        structureScore: 60 + Math.random() * 35,
        specificityScore: 55 + Math.random() * 40,
        strengths: ['Clear communication', 'Good examples provided'],
        weaknesses: ['Could provide more specific metrics'],
        keyPoints: ['Demonstrated relevant experience', 'Shows problem-solving ability'],
        missingElements: ['Quantifiable results', 'Team collaboration examples'],
        suggestions: ['Include more specific outcomes', 'Mention team dynamics'],
        confidenceLevel: 0.85,
        aiReasoning: 'The response demonstrates relevant experience but lacks specific metrics and quantifiable outcomes.',
      },
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error analyzing answer:', error);
    res.status(500).json({ error: 'Failed to analyze answer' });
  }
};

// Get answer analyses for interview
export const getAnswerAnalyses = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const analyses = await prisma.answerAnalysis.findMany({
      where: { interviewId },
      orderBy: { analyzedAt: 'asc' },
    });

    res.json(analyses);
  } catch (error) {
    console.error('Error fetching answer analyses:', error);
    res.status(500).json({ error: 'Failed to fetch answer analyses' });
  }
};

// ============================================
// 4.2.3 - KEYWORD & TOPIC DETECTION
// ============================================

// Detect topics in interview
export const detectTopics = async (req: Request, res: Response) => {
  try {
    const { interviewId, transcriptionId, expectedTopics } = req.body;

    // Get transcription if exists
    let transcript = '';
    if (transcriptionId) {
      const transcription = await prisma.interviewTranscription.findUnique({
        where: { id: transcriptionId },
      });
      transcript = transcription?.rawTranscript || '';
    }

    // Simulate topic detection
    const detection = await prisma.topicDetection.create({
      data: {
        interviewId,
        transcriptionId,
        topics: [
          { topic: 'React Development', relevance: 0.95, frequency: 12, context: ['frontend', 'components'] },
          { topic: 'Team Leadership', relevance: 0.78, frequency: 8, context: ['management', 'mentoring'] },
          { topic: 'Problem Solving', relevance: 0.85, frequency: 10, context: ['debugging', 'optimization'] },
        ],
        primaryTopics: ['React Development', 'Problem Solving'],
        secondaryTopics: ['Team Leadership', 'Agile Methodology'],
        keywords: [
          { keyword: 'React', count: 15, importance: 0.95 },
          { keyword: 'TypeScript', count: 8, importance: 0.85 },
          { keyword: 'testing', count: 6, importance: 0.75 },
        ],
        technicalKeywords: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        softSkillKeywords: ['leadership', 'communication', 'problem-solving'],
        industryKeywords: ['agile', 'CI/CD', 'microservices'],
        namedEntities: {
          companies: ['Google', 'Microsoft'],
          technologies: ['React', 'TypeScript', 'AWS'],
          people: [],
          locations: ['San Francisco'],
        },
        expectedTopics: expectedTopics || [],
        coveredExpected: expectedTopics?.slice(0, 3) || [],
        missedTopics: expectedTopics?.slice(3) || [],
        topicCoverageScore: 75,
        topicDepthScore: 80,
        relevanceScore: 85,
      },
    });

    res.status(201).json(detection);
  } catch (error) {
    console.error('Error detecting topics:', error);
    res.status(500).json({ error: 'Failed to detect topics' });
  }
};

// Get topic detections for interview
export const getTopicDetections = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const detections = await prisma.topicDetection.findMany({
      where: { interviewId },
      orderBy: { analyzedAt: 'desc' },
    });

    res.json(detections);
  } catch (error) {
    console.error('Error fetching topic detections:', error);
    res.status(500).json({ error: 'Failed to fetch topic detections' });
  }
};

// ============================================
// 4.2.4 - SENTIMENT & CONFIDENCE ANALYSIS
// ============================================

// Analyze sentiment
export const analyzeSentiment = async (req: Request, res: Response) => {
  try {
    const { interviewId, transcriptionId, responseId } = req.body;

    const analysis = await prisma.sentimentAnalysis.create({
      data: {
        interviewId,
        transcriptionId,
        responseId,
        overallSentiment: 'POSITIVE',
        sentimentScore: 0.65,
        sentimentConfidence: 0.88,
        emotions: {
          joy: 0.3,
          enthusiasm: 0.6,
          confidence: 0.7,
          nervousness: 0.2,
          frustration: 0.05,
        },
        dominantEmotion: 'enthusiasm',
        emotionalVariation: 0.35,
        confidenceLevel: 'HIGH',
        confidenceScore: 78,
        hesitationMarkers: 5,
        fillerWords: { um: 3, uh: 2 },
        enthusiasmScore: 75,
        passionIndicators: ['excited about technology', 'passionate about learning'],
        authenticityScore: 82,
        consistencyScore: 85,
        sentimentTimeline: [
          { timestamp: '0:00', sentiment: 'neutral', confidence: 0.7 },
          { timestamp: '2:00', sentiment: 'positive', confidence: 0.85 },
          { timestamp: '5:00', sentiment: 'very_positive', confidence: 0.9 },
        ],
        sentimentTrend: 'IMPROVING',
        voiceEnergy: 72,
        speechPace: 'NORMAL',
        toneVariation: 45,
      },
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
};

// Get sentiment analyses for interview
export const getSentimentAnalyses = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const analyses = await prisma.sentimentAnalysis.findMany({
      where: { interviewId },
      orderBy: { analyzedAt: 'desc' },
    });

    res.json(analyses);
  } catch (error) {
    console.error('Error fetching sentiment analyses:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment analyses' });
  }
};

// ============================================
// 4.2.5 - COMMUNICATION SKILLS SCORE
// ============================================

// Calculate communication score
export const calculateCommunicationScore = async (req: Request, res: Response) => {
  try {
    const { interviewId, benchmarkRole } = req.body;

    // Check if score already exists
    const existing = await prisma.communicationScore.findFirst({
      where: { interview: { id: interviewId } } as any,
    });

    const scoreData = {
      overallScore: 72 + Math.random() * 20,
      clarityScore: 75 + Math.random() * 20,
      articulationScore: 70 + Math.random() * 25,
      vocabularyScore: 78 + Math.random() * 18,
      grammarScore: 85 + Math.random() * 12,
      coherenceScore: 72 + Math.random() * 22,
      structureScore: 68 + Math.random() * 25,
      conciseness: 65 + Math.random() * 28,
      relevance: 80 + Math.random() * 15,
      professionalismScore: 82 + Math.random() * 15,
      engagementScore: 75 + Math.random() * 20,
      listeningIndicators: 70 + Math.random() * 25,
      technicalClarity: 72 + Math.random() * 23,
      useOfExamples: 68 + Math.random() * 27,
      strengths: ['Clear articulation', 'Good use of examples', 'Professional tone'],
      areasForImprovement: ['Be more concise', 'Improve answer structure'],
      feedback: {
        clarity: 'Explanations are clear and easy to follow',
        structure: 'Could benefit from using frameworks like STAR method',
        vocabulary: 'Appropriate technical vocabulary usage',
      },
      recommendations: ['Practice using STAR method', 'Work on being more concise'],
      percentile: 72,
      benchmarkRole: benchmarkRole || 'Software Engineer',
    };

    let score;
    if (existing) {
      score = await prisma.communicationScore.update({
        where: { id: existing.id },
        data: scoreData as any,
      });
    } else {
      score = await prisma.communicationScore.create({
        data: {
          interview: { connect: { id: interviewId } },
          ...scoreData,
        } as any,
      });
    }

    res.status(existing ? 200 : 201).json(score);
  } catch (error) {
    console.error('Error calculating communication score:', error);
    res.status(500).json({ error: 'Failed to calculate communication score' });
  }
};

// Get communication score for interview
export const getCommunicationScore = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const score = await prisma.communicationScore.findFirst({
      where: { interview: { id: interviewId } } as any,
    });

    if (!score) {
      return res.status(404).json({ error: 'Communication score not found' });
    }

    res.json(score);
  } catch (error) {
    console.error('Error fetching communication score:', error);
    res.status(500).json({ error: 'Failed to fetch communication score' });
  }
};

// ============================================
// 4.2.6 - TECHNICAL ACCURACY CHECKER
// ============================================

// Verify technical claim
export const verifyTechnicalClaim = async (req: Request, res: Response) => {
  try {
    const {
      interviewId,
      responseId,
      claimText,
      claimType,
      claimContext,
    } = req.body;

    // Simulate verification
    const verification = await prisma.technicalVerification.create({
      data: {
        interviewId,
        responseId,
        claimText,
        claimType: claimType || 'TECHNICAL_FACT',
        claimContext,
        verificationStatus: 'VERIFIED',
        accuracyScore: 75 + Math.random() * 20,
        confidenceLevel: 0.8 + Math.random() * 0.15,
        supportingEvidence: [
          { source: 'Documentation', match: 'React hooks introduced in v16.8' },
        ],
        technicalDepth: 'INTERMEDIATE',
        isCurrent: true,
        relevanceToRole: 85,
        potentialIssues: [],
        exaggerationRisk: 15,
        followUpQuestions: ['Can you provide a specific example of this implementation?'],
      },
    });

    res.status(201).json(verification);
  } catch (error) {
    console.error('Error verifying claim:', error);
    res.status(500).json({ error: 'Failed to verify claim' });
  }
};

// Get technical verifications for interview
export const getTechnicalVerifications = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const verifications = await prisma.technicalVerification.findMany({
      where: { interviewId },
      orderBy: { verifiedAt: 'desc' },
    });

    res.json(verifications);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
};

// ============================================
// 4.2.7 - RED FLAG DETECTION
// ============================================

// Detect red flags
export const detectRedFlags = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    // Simulate red flag detection analysis
    // In production, this would analyze the full interview content

    // Check for existing red flags
    const existingFlags = await prisma.redFlagAlert.findMany({
      where: { interviewId },
    });

    if (existingFlags.length > 0) {
      return res.json({ message: 'Analysis already performed', flags: existingFlags });
    }

    // Simulate finding potential flags (randomly for demo)
    const potentialFlags = Math.random() > 0.5 ? [
      {
        flagType: 'INCONSISTENCY',
        severity: 'MEDIUM',
        title: 'Timeline Inconsistency',
        description: 'Mentioned working at company A and B during overlapping periods.',
        triggerText: 'I was at Company A from 2019-2021, and at Company B from 2020-2022',
        confidence: 0.7,
        categories: ['CONSISTENCY'],
        suggestedActions: ['Clarify employment timeline'],
        followUpQuestions: ['Can you clarify the exact dates of your employment at each company?'],
      },
    ] : [];

    const createdFlags = await Promise.all(
      potentialFlags.map(flag =>
        prisma.redFlagAlert.create({
          data: {
            interviewId,
            ...flag,
          },
        })
      )
    );

    res.json({
      flagsDetected: createdFlags.length,
      flags: createdFlags,
    });
  } catch (error) {
    console.error('Error detecting red flags:', error);
    res.status(500).json({ error: 'Failed to detect red flags' });
  }
};

// Get red flag alerts for interview
export const getRedFlagAlerts = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const { severity, isReviewed } = req.query;

    const where: any = { interviewId };
    if (severity) where.severity = severity;
    if (isReviewed !== undefined) where.isReviewed = isReviewed === 'true';

    const alerts = await prisma.redFlagAlert.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { detectedAt: 'desc' }],
    });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching red flag alerts:', error);
    res.status(500).json({ error: 'Failed to fetch red flag alerts' });
  }
};

// Review red flag
export const reviewRedFlag = async (req: Request, res: Response) => {
  try {
    const reviewerId = (req as any).user.id;
    const { id } = req.params;
    const { disposition, reviewNotes, isFalsePositive } = req.body;

    const alert = await prisma.redFlagAlert.update({
      where: { id },
      data: {
        isReviewed: true,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        disposition,
        reviewNotes,
        isFalsePositive: isFalsePositive || false,
      },
    });

    res.json(alert);
  } catch (error) {
    console.error('Error reviewing red flag:', error);
    res.status(500).json({ error: 'Failed to review red flag' });
  }
};

// ============================================
// 4.2.8 - SUMMARY GENERATION
// ============================================

// Generate interview summary
export const generateSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { interviewId } = req.params;

    // Get interview data
    const interview = await prisma.aIScreeningInterview.findUnique({
      where: { id: interviewId },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        job: { select: { id: true, title: true, requirements: true } },
        responses: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Generate summary (simulated AI)
    const summary = await prisma.interviewSummary.create({
      data: {
        interviewId,
        candidateId: interview.candidateId,
        executiveSummary: `${interview.candidate.firstName} ${interview.candidate.lastName} demonstrated strong technical capabilities and good communication skills during the ${interview.title} screening. The candidate shows promise for the ${interview.job?.title || 'role'} position.`,
        detailedSummary: `The candidate completed ${interview.completedQuestions} out of ${interview.totalQuestions} questions. Overall performance indicates solid experience in relevant areas with room for growth in certain technical domains. The candidate demonstrated enthusiasm for the role and alignment with company values.`,
        bulletPoints: [
          'Strong technical background in relevant technologies',
          'Good problem-solving approach with clear examples',
          'Effective communication style',
          'Some gaps in specific technical areas that can be addressed',
          'Shows potential for growth and learning',
        ],
        overallScore: interview.overallScore || 75,
        scoreBreakdown: {
          technical: 78,
          communication: 82,
          cultural: 75,
          experience: 72,
        },
        ranking: 'Strong',
        topStrengths: ['Technical expertise', 'Communication skills', 'Problem-solving ability'],
        areasOfConcern: ['Limited experience with specific frameworks', 'Could improve on system design'],
        uniqueQualities: ['Unique background in cross-functional teams', 'Strong mentorship experience'],
        technicalSkills: {
          'React': 4,
          'TypeScript': 4,
          'Node.js': 3,
          'System Design': 2,
        },
        softSkills: {
          'Communication': 4,
          'Leadership': 3,
          'Collaboration': 4,
        },
        skillGaps: ['Advanced system design', 'Large-scale distributed systems'],
        culturalFitScore: 78,
        culturalFitNotes: ['Values align with company culture', 'Collaborative mindset'],
        relevantExperience: ['5 years in frontend development', 'Team lead experience'],
        notableAchievements: ['Led migration to TypeScript', 'Reduced build time by 40%'],
        experienceGaps: ['No experience with our specific tech stack'],
        hiringRecommendation: 'YES',
        recommendationReason: 'Candidate shows strong potential and relevant experience. Recommended to proceed to the next round.',
        nextSteps: ['Schedule technical deep-dive', 'Team culture fit interview'],
        suggestedInterviewers: ['Senior Engineer', 'Engineering Manager'],
        followUpQuestions: ['Dive deeper into system design experience', 'Discuss leadership style'],
        areasToProbe: ['Specific technical implementation details', 'Conflict resolution approach'],
      },
    });

    res.status(201).json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

// Get interview summaries
export const getInterviewSummaries = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const summaries = await prisma.interviewSummary.findMany({
      where: { interviewId },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { version: 'desc' },
    });

    res.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
};

// Approve summary
export const approveSummary = async (req: Request, res: Response) => {
  try {
    const reviewerId = (req as any).user.id;
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const summary = await prisma.interviewSummary.update({
      where: { id },
      data: {
        isApproved: true,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes,
      },
    });

    res.json(summary);
  } catch (error) {
    console.error('Error approving summary:', error);
    res.status(500).json({ error: 'Failed to approve summary' });
  }
};

// Update hiring recommendation
export const updateRecommendation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hiringRecommendation, recommendationReason, nextSteps } = req.body;

    const summary = await prisma.interviewSummary.update({
      where: { id },
      data: {
        hiringRecommendation,
        recommendationReason,
        nextSteps: nextSteps || undefined,
      },
    });

    res.json(summary);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
};

// ============================================
// 4.2.9 - HIGHLIGHT EXTRACTION
// ============================================

// Extract highlights from interview
export const extractHighlights = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    // Simulate highlight extraction
    const highlights = [
      {
        highlightType: 'STRENGTH',
        title: 'Strong Technical Example',
        description: 'Candidate provided detailed explanation of optimizing React performance',
        transcript: 'I implemented memo and useMemo hooks strategically, reducing re-renders by 60%...',
        startTime: 120,
        endTime: 180,
        duration: 60,
        importance: 'HIGH',
        relevanceScore: 92,
        tags: ['technical', 'react', 'performance'],
        categories: ['Technical Skills'],
        aiInsight: 'Demonstrates deep understanding of React optimization techniques',
        sentiment: 'positive',
        keyTakeaway: 'Strong performance optimization skills',
      },
      {
        highlightType: 'GREAT_EXAMPLE',
        title: 'Leadership Experience',
        description: 'Described mentoring junior developers effectively',
        transcript: 'I set up weekly code reviews and pairing sessions with new team members...',
        startTime: 300,
        endTime: 360,
        duration: 60,
        importance: 'MEDIUM',
        relevanceScore: 78,
        tags: ['leadership', 'mentorship', 'teamwork'],
        categories: ['Soft Skills'],
        aiInsight: 'Shows commitment to team development',
        sentiment: 'positive',
        keyTakeaway: 'Active mentor and team player',
      },
    ];

    const createdHighlights = await Promise.all(
      highlights.map(highlight =>
        prisma.interviewHighlight.create({
          data: {
            interviewId,
            ...highlight,
          },
        })
      )
    );

    res.status(201).json(createdHighlights);
  } catch (error) {
    console.error('Error extracting highlights:', error);
    res.status(500).json({ error: 'Failed to extract highlights' });
  }
};

// Get interview highlights
export const getHighlights = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const { highlightType, importance } = req.query;

    const where: any = { interviewId };
    if (highlightType) where.highlightType = highlightType;
    if (importance) where.importance = importance;

    const highlights = await prisma.interviewHighlight.findMany({
      where,
      orderBy: [{ importance: 'desc' }, { relevanceScore: 'desc' }],
    });

    res.json(highlights);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    res.status(500).json({ error: 'Failed to fetch highlights' });
  }
};

// Bookmark highlight
export const bookmarkHighlight = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { bookmarkNotes } = req.body;

    const highlight = await prisma.interviewHighlight.update({
      where: { id },
      data: {
        isBookmarked: true,
        bookmarkedById: userId,
        bookmarkNotes,
      },
    });

    res.json(highlight);
  } catch (error) {
    console.error('Error bookmarking highlight:', error);
    res.status(500).json({ error: 'Failed to bookmark highlight' });
  }
};

// Share highlight
export const shareHighlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    const highlight = await prisma.interviewHighlight.update({
      where: { id },
      data: {
        sharedWith: { push: userIds },
      },
    });

    res.json(highlight);
  } catch (error) {
    console.error('Error sharing highlight:', error);
    res.status(500).json({ error: 'Failed to share highlight' });
  }
};

// ============================================
// 4.2.10 - COMPARATIVE ANALYSIS
// ============================================

// Create candidate comparison
export const createComparison = async (req: Request, res: Response) => {
  try {
    const createdById = (req as any).user.id;
    const {
      jobId,
      comparisonName,
      candidateIds,
      interviewIds,
      primaryCandidateId,
      criteria,
      weights,
    } = req.body;

    // Simulate comparative analysis
    const scores: Record<string, any> = {};
    const overallRanking: any[] = [];

    candidateIds.forEach((candidateId: string, index: number) => {
      const overall = 65 + Math.random() * 30;
      scores[candidateId] = {
        overall,
        technical: 60 + Math.random() * 35,
        communication: 65 + Math.random() * 30,
        cultural: 70 + Math.random() * 25,
        experience: 60 + Math.random() * 35,
      };
      overallRanking.push({ candidateId, rank: index + 1, score: overall });
    });

    // Sort by score
    overallRanking.sort((a, b) => b.score - a.score);
    overallRanking.forEach((item, index) => {
      item.rank = index + 1;
    });

    const comparison = await prisma.candidateComparison.create({
      data: {
        jobId,
        comparisonName: comparisonName || `Comparison ${new Date().toISOString().split('T')[0]}`,
        candidateIds,
        interviewIds: interviewIds || [],
        primaryCandidateId,
        createdById,
        criteria: criteria || ['technical', 'communication', 'cultural', 'experience'],
        weights,
        overallRanking,
        scores,
        strengthsComparison: JSON.parse(JSON.stringify(Object.fromEntries(
          candidateIds.map((id: string) => [id, ['Technical skills', 'Communication']])
        ))),
        weaknessesComparison: JSON.parse(JSON.stringify(Object.fromEntries(
          candidateIds.map((id: string) => [id, ['System design', 'Leadership experience']])
        ))),
        topRecommendation: overallRanking[0]?.candidateId,
        recommendationReason: 'Highest overall score with strong technical and communication skills.',
        orderOfPreference: overallRanking.map(r => r.candidateId),
        keyDifferentiators: {
          technical: 'Candidate A has stronger React experience',
          communication: 'Candidate B articulates complex concepts better',
        },
        status: 'COMPLETED',
      } as any,
    });

    res.status(201).json(comparison);
  } catch (error) {
    console.error('Error creating comparison:', error);
    res.status(500).json({ error: 'Failed to create comparison' });
  }
};

// Get comparisons
export const getComparisons = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { jobId, status } = req.query;

    const where: any = {
      OR: [{ createdById: userId }, { sharedWith: { has: userId } }],
    };
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;

    const comparisons = await prisma.candidateComparison.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comparisons);
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
};

// Get comparison by ID
export const getComparisonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comparison = await prisma.candidateComparison.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        primaryCandidate: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    res.json(comparison);
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
};

// Share comparison
export const shareComparison = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    const comparison = await prisma.candidateComparison.update({
      where: { id },
      data: {
        sharedWith: { push: userIds },
        sharedAt: new Date(),
        status: 'SHARED',
      },
    });

    res.json(comparison);
  } catch (error) {
    console.error('Error sharing comparison:', error);
    res.status(500).json({ error: 'Failed to share comparison' });
  }
};

// ============================================
// ANALYTICS & AGGREGATION
// ============================================

// Get full analysis for interview
export const getFullAnalysis = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const [
      transcriptions,
      answerAnalyses,
      topicDetections,
      sentimentAnalyses,
      communicationScore,
      technicalVerifications,
      redFlagAlerts,
      summaries,
      highlights,
    ] = await Promise.all([
      prisma.interviewTranscription.findMany({ where: { interviewId } }),
      prisma.answerAnalysis.findMany({ where: { interviewId } }),
      prisma.topicDetection.findMany({ where: { interviewId } }),
      prisma.sentimentAnalysis.findMany({ where: { interviewId } }),
      prisma.communicationScore.findFirst({ where: { interview: { id: interviewId } } as any }),
      prisma.technicalVerification.findMany({ where: { interviewId } }),
      prisma.redFlagAlert.findMany({ where: { interviewId } }),
      prisma.interviewSummary.findMany({ where: { interviewId } }),
      prisma.interviewHighlight.findMany({ where: { interviewId } }),
    ]);

    res.json({
      interviewId,
      transcriptions,
      answerAnalyses,
      topicDetections,
      sentimentAnalyses,
      communicationScore,
      technicalVerifications,
      redFlagAlerts,
      summaries,
      highlights,
      analysisStats: {
        transcriptionCount: transcriptions.length,
        answerAnalysisCount: answerAnalyses.length,
        redFlagCount: redFlagAlerts.length,
        highlightCount: highlights.length,
        averageAnswerScore: answerAnalyses.length > 0
          ? answerAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / answerAnalyses.length
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching full analysis:', error);
    res.status(500).json({ error: 'Failed to fetch full analysis' });
  }
};

// Run full analysis pipeline
export const runFullAnalysis = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    // This would trigger all analysis jobs in production
    // For now, return a status indicating analysis has started

    res.json({
      message: 'Full analysis pipeline started',
      interviewId,
      estimatedCompletionTime: '5-10 minutes',
      stages: [
        { stage: 'transcription', status: 'queued' },
        { stage: 'answerAnalysis', status: 'queued' },
        { stage: 'topicDetection', status: 'queued' },
        { stage: 'sentimentAnalysis', status: 'queued' },
        { stage: 'communicationScore', status: 'queued' },
        { stage: 'technicalVerification', status: 'queued' },
        { stage: 'redFlagDetection', status: 'queued' },
        { stage: 'highlightExtraction', status: 'queued' },
        { stage: 'summaryGeneration', status: 'queued' },
      ],
    });
  } catch (error) {
    console.error('Error running full analysis:', error);
    res.status(500).json({ error: 'Failed to run full analysis' });
  }
};
