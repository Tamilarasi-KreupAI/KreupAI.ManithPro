import { Request, Response } from 'express';
import { prisma } from '../database/prisma';


const normaliseSkills = (skills: string[]) => skills.map((skill) => skill.toLowerCase());

const buildJobRecommendations = async (candidateId: string) => {
  const candidate = await prisma.user.findUnique({
    where: { id: candidateId },
    include: { candidateProfile: true },
  });
  if (!candidate || candidate.role !== 'CANDIDATE') return null;

  const [jobs, applications] = await Promise.all([
    prisma.job.findMany({ where: { status: 'OPEN' }, take: 100 }),
    prisma.application.findMany({ where: { candidateId }, select: { jobId: true }, take: 1000 }),
  ]);
  const appliedJobIds = new Set(applications.map((application) => application.jobId));
  const candidateSkills = normaliseSkills(candidate.skills);
  const preferredLocations = candidate.candidateProfile?.preferredLocation.map((location) => location.toLowerCase()) ?? [];
  const preferredJobTypes = candidate.candidateProfile?.jobTypes ?? [];
  const expectedSalary = candidate.candidateProfile?.expectedSalary;

  return jobs
    .filter((job) => !appliedJobIds.has(job.id))
    .map((job) => {
      const jobSkills = normaliseSkills(job.skills);
      const matchedSkills = job.skills.filter((skill) => candidateSkills.includes(skill.toLowerCase()));
      const missingSkills = job.skills.filter((skill) => !candidateSkills.includes(skill.toLowerCase()));
      const skillScore = jobSkills.length ? (matchedSkills.length / jobSkills.length) * 100 : 0;
      const locationMatch = preferredLocations.includes(job.location.toLowerCase()) || candidate.location?.toLowerCase() === job.location.toLowerCase();
      const salaryMatch = expectedSalary === null || expectedSalary === undefined || job.salaryMax === null || job.salaryMax === undefined || job.salaryMax >= expectedSalary;
      const typeMatch = preferredJobTypes.includes(job.type);
      const recommendationScore = Math.min(100, Math.round(skillScore * 0.6 + (locationMatch ? 20 : 0) + (salaryMatch ? 20 : 0) + (typeMatch ? 10 : 0)));
      const matchReasons = [
        ...(skillScore >= 70 ? [{ reason: `${Math.round(skillScore)}% skill match`, weight: 0.6 }] : []),
        ...(matchedSkills.length ? [{ reason: `Matches ${matchedSkills.length} of your skills`, weight: 0.6 }] : []),
        ...(locationMatch ? [{ reason: 'Location matches your preference', weight: 0.2 }] : []),
        ...(salaryMatch && job.salaryMax ? [{ reason: 'Salary aligns with your expectations', weight: 0.2 }] : []),
        ...(typeMatch ? [{ reason: 'Matches your preferred job type', weight: 0.1 }] : []),
      ];
      return {
        id: job.id,
        candidateId,
        jobId: job.id,
        recommendationScore,
        recommendationRank: 0,
        recommendationType: recommendationScore >= 70 ? 'STRONG_MATCH' : recommendationScore >= 40 ? 'GOOD_MATCH' : 'POTENTIAL_MATCH',
        skillMatch: skillScore / 100,
        experienceMatch: 0,
        locationMatch: locationMatch ? 1 : 0,
        salaryMatch: salaryMatch ? 1 : 0,
        jobTitle: job.title,
        jobCompany: job.companyName,
        jobLocation: job.location,
        matchReasons,
        highlightedSkills: matchedSkills,
        missingSkills,
        growthOpportunities: missingSkills,
        job,
      };
    })
    .filter((recommendation) => recommendation.recommendationScore >= 30)
    .sort((left, right) => right.recommendationScore - left.recommendationScore)
    .slice(0, 20)
    .map((recommendation, index) => ({ ...recommendation, recommendationRank: index + 1 }));
};

const buildCandidateRecommendations = async (jobId: string) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return { job: null, recommendations: [] };
  const [candidates, applications] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      take: 200,
      select: {
        id: true, firstName: true, lastName: true, role: true, skills: true, experience: true,
        education: true, location: true,
        candidateProfile: { select: { headline: true, expectedSalary: true } },
      },
    }),
    prisma.application.findMany({ where: { jobId }, select: { candidateId: true }, take: 1000 }),
  ]);
  const appliedCandidateIds = new Set(applications.map((application) => application.candidateId));
  const jobSkills = normaliseSkills(job.skills);
  const recommendations = candidates
    .filter((candidate) => !appliedCandidateIds.has(candidate.id))
    .map((candidate) => {
      const candidateSkills = normaliseSkills(candidate.skills);
      const matchedSkills = job.skills.filter((skill) => candidateSkills.includes(skill.toLowerCase()));
      const skillScore = jobSkills.length ? (matchedSkills.length / jobSkills.length) * 100 : 0;
      const experienceMatch = job.experience ? Boolean(candidate.experience && String(candidate.experience).includes(job.experience)) : false;
      const expectedSalary = candidate.candidateProfile?.expectedSalary;
      const salaryMatch = expectedSalary === null || expectedSalary === undefined || job.salaryMax === null || job.salaryMax === undefined || expectedSalary <= job.salaryMax;
      const recommendationScore = Math.min(100, Math.round(skillScore * 0.7 + (experienceMatch ? 20 : 0) + (salaryMatch ? 10 : 0)));
      const matchReasons = [
        ...(skillScore >= 70 ? [{ reason: `${Math.round(skillScore)}% skill match`, importance: 'high' }] : []),
        ...(matchedSkills.length ? [{ reason: `Has ${matchedSkills.length} required skills`, importance: 'high' }] : []),
        ...(experienceMatch ? [{ reason: 'Experience level matches', importance: 'medium' }] : []),
        ...(candidate.education ? [{ reason: `${candidate.education} education`, importance: 'low' }] : []),
      ];
      return {
        id: candidate.id,
        jobId,
        candidateId: candidate.id,
        recommendationScore,
        recommendationRank: 0,
        recommendationType: recommendationScore >= 70 ? 'TOP_PICK' : recommendationScore >= 40 ? 'GOOD_MATCH' : 'POTENTIAL',
        overallMatch: recommendationScore / 100,
        skillMatch: skillScore / 100,
        experienceMatch: experienceMatch ? 1 : 0,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateTitle: candidate.candidateProfile?.headline ?? '',
        candidateLocation: candidate.location ?? '',
        candidateExperience: candidate.experience ?? 0,
        candidateSkills: candidate.skills,
        matchReasons,
        standoutFactors: matchedSkills,
        candidate,
      };
    })
    .filter((recommendation) => recommendation.recommendationScore >= 40)
    .sort((left, right) => right.recommendationScore - left.recommendationScore)
    .slice(0, 15)
    .map((recommendation, index) => ({ ...recommendation, recommendationRank: index + 1 }));
  return { job, recommendations };
};

// ============================================================================
// 5.3.1 JOB RECOMMENDATIONS FOR CANDIDATES
// ============================================================================

// Generate Job Recommendations
export const generateJobRecommendations = async (req: Request, res: Response) => {
  try {
    const candidateId = req.user!.role === 'CANDIDATE' ? req.user!.userId : req.body.candidateId;
    const recommendations = candidateId ? await buildJobRecommendations(candidateId) : null;
    if (!recommendations) return res.status(404).json({ success: false, error: 'Candidate not found' });
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error generating job recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
};

// Get Job Recommendations for Candidate
export const getJobRecommendations = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    if (req.user!.role === 'CANDIDATE' && candidateId !== req.user!.userId) return res.status(403).json({ success: false, error: 'Not authorized to view these recommendations' });
    const recommendations = await buildJobRecommendations(candidateId);
    if (!recommendations) return res.status(404).json({ success: false, error: 'Candidate not found' });
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};

// Record Candidate Interaction with Recommendation
export const recordJobRecommendationInteraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, feedbackRating, feedbackComment, dismissReason } = req.body;

    const updateData: any = {};
    if (action === 'view') updateData.viewedAt = new Date();
    if (action === 'click') updateData.clickedAt = new Date();
    if (action === 'save') updateData.savedAt = new Date();
    if (action === 'apply') updateData.appliedAt = new Date();
    if (action === 'dismiss') {
      updateData.dismissedAt = new Date();
      updateData.dismissReason = dismissReason;
    }
    if (feedbackRating) updateData.feedbackRating = feedbackRating;
    if (feedbackComment) updateData.feedbackComment = feedbackComment;

    const recommendation = await prisma.jobRecommendation.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ success: false, error: 'Failed to record interaction' });
  }
};

// ============================================================================
// 5.3.2 CANDIDATE RECOMMENDATIONS FOR RECRUITERS
// ============================================================================

// Generate Candidate Recommendations for Job
export const generateCandidateRecommendations = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.body;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    if (req.user!.role !== 'ADMIN' && job.postedById !== req.user!.userId) return res.status(403).json({ success: false, error: 'Not authorized to view these recommendations' });
    const result = await buildCandidateRecommendations(jobId);
    res.status(200).json({ success: true, data: result.recommendations });
  } catch (error) {
    console.error('Error generating candidate recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
};

// Get Candidate Recommendations for Job
export const getCandidateRecommendations = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    if (req.user!.role !== 'ADMIN' && job.postedById !== req.user!.userId) return res.status(403).json({ success: false, error: 'Not authorized to view these recommendations' });
    const result = await buildCandidateRecommendations(jobId);

    // Merge persisted contactedAt from DB rows so the frontend can restore invitation state
    const recruiterId = req.user!.userId;
    let persistedMap = new Map<string, Date | null>();
    try {
      const persisted = await prisma.candidateRecommendation.findMany({
        where: { jobId, recruiterId },
        select: { candidateId: true, contactedAt: true },
      });
      persisted.forEach((row) => persistedMap.set(row.candidateId, row.contactedAt));
    } catch {
      // Non-fatal: if the table has no rows yet, we simply skip the merge
    }

    const enriched = result.recommendations.map((rec) => {
      const contactedAt = persistedMap.get(rec.candidateId);
      return contactedAt ? { ...rec, contactedAt } : rec;
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error('Error getting candidate recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};

// Record Recruiter Action on Candidate Recommendation
export const recordCandidateRecommendationAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;   // id == candidateId (from the dynamic recommendation build)
    const { action, rejectionReason, jobId } = req.body;
    const recruiterId = req.user!.userId;

    if (!jobId) {
      return res.status(400).json({ success: false, error: 'jobId is required to record a candidate action' });
    }

    const updateData: any = {};
    if (action === 'view') updateData.viewedAt = new Date();
    if (action === 'shortlist') updateData.shortlistedAt = new Date();
    if (action === 'contact') updateData.contactedAt = new Date();
    if (action === 'reject') {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason;
    }

    // Look up by the natural composite key (candidateId + jobId + recruiterId), NOT the PK.
    // The old code used findUnique({ id }) where id === candidateId. This caused cross-job
    // collisions: a second invite for JobB would find the row created for JobA (same candidateId
    // PK), update its contactedAt, but leave jobId as JobA — so getCandidateRecommendations
    // (WHERE jobId=JobB) would never see a contactedAt for the candidate.
    const existingRow = await prisma.candidateRecommendation.findFirst({
      where: { candidateId: id, jobId, recruiterId },
    });

    let recommendation: any;
    if (existingRow) {
      recommendation = await prisma.candidateRecommendation.update({
        where: { id: existingRow.id },
        data: updateData,
      });
    } else {
      // Do NOT set id: candidateId — let Prisma auto-generate a UUID so there are no PK
      // collisions when the same candidate is invited for multiple jobs.
      const companyId = req.user!.companyId || 'default-company';
      recommendation = await prisma.candidateRecommendation.create({
        data: {
          companyId,
          jobId,
          candidateId: id,
          recruiterId,
          recommendationScore: 80,
          recommendationRank: 1,
          recommendationType: 'GOOD_MATCH',
          overallMatch: 0.8,
          skillMatch: 0.8,
          experienceMatch: 1.0,
          candidateName: '',
          candidateTitle: '',
          candidateLocation: '',
          candidateExperience: 0,
          ...updateData,
        },
      });
    }

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Error recording action:', error);
    res.status(500).json({ success: false, error: 'Failed to record action' });
  }
};


// ============================================================================
// 5.3.3 SIMILAR CANDIDATES FINDER
// ============================================================================

// Find Similar Candidates
export const findSimilarCandidates = async (req: Request, res: Response) => {
  try {
    const { sourceCandidateId, sourceType, forJobId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const match = await prisma.similarCandidateMatch.create({
      data: {
        companyId,
        sourceCandidateId,
        sourceType: sourceType || 'TOP_PERFORMER',
        similarCandidateId: req.body.similarCandidateId || `candidate-${Date.now()}`,
        overallSimilarity: req.body.overallSimilarity || 0.82,
        skillSimilarity: req.body.skillSimilarity || 0.85,
        experienceSimilarity: req.body.experienceSimilarity || 0.78,
        backgroundSimilarity: req.body.backgroundSimilarity || 0.80,
        sharedSkills: req.body.sharedSkills || ['React', 'Node.js', 'Python'],
        keyDifferences: req.body.keyDifferences || {
          experience: 'Similar has 2 more years',
          education: 'Different university',
        },
        additionalStrengths: req.body.additionalStrengths || ['AWS certified'],
        forJobId,
      },
    });

    res.status(201).json({ success: true, data: match });
  } catch (error) {
    console.error('Error finding similar candidates:', error);
    res.status(500).json({ success: false, error: 'Failed to find similar candidates' });
  }
};

// Get Similar Candidates for Source
export const getSimilarCandidates = async (req: Request, res: Response) => {
  try {
    const { sourceCandidateId } = req.params;
    const companyId = req.user?.companyId || 'default-company';

    const matches = await prisma.similarCandidateMatch.findMany({
      where: { companyId, sourceCandidateId },
      orderBy: { overallSimilarity: 'desc' },
    });

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    console.error('Error getting similar candidates:', error);
    res.status(500).json({ success: false, error: 'Failed to get similar candidates' });
  }
};

// Record Action on Similar Candidate
export const recordSimilarCandidateAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actionTaken } = req.body;

    const match = await prisma.similarCandidateMatch.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        actionTaken,
      },
    });

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    console.error('Error recording action:', error);
    res.status(500).json({ success: false, error: 'Failed to record action' });
  }
};

// ============================================================================
// 5.3.4 PASSIVE CANDIDATE IDENTIFICATION
// ============================================================================

// Identify Passive Candidates
export const identifyPassiveCandidates = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const profile = await prisma.passiveCandidateProfile.upsert({
      where: {
        companyId_candidateId: { companyId, candidateId },
      },
      update: {
        ...req.body,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        candidateId,
        isPassive: req.body.isPassive ?? true,
        passiveScore: req.body.passiveScore || 75,
        jobSearchActivity: req.body.jobSearchActivity || 'LOW',
        profileUpdateFrequency: req.body.profileUpdateFrequency || 'RARELY',
        responseToOutreach: req.body.responseToOutreach || 'SLOW',
        openToOpportunities: req.body.openToOpportunities ?? true,
        matchingSkills: req.body.matchingSkills || ['Leadership', 'Strategy'],
        targetRoles: req.body.targetRoles || ['VP Engineering', 'CTO'],
        conversionLikelihood: req.body.conversionLikelihood || 0.35,
        conversionFactors: req.body.conversionFactors || {
          compensation: 'high impact',
          challenge: 'medium impact',
          location: 'low impact',
        },
      },
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error identifying passive candidate:', error);
    res.status(500).json({ success: false, error: 'Failed to identify passive candidate' });
  }
};

// Get Passive Candidates
export const getPassiveCandidates = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { minScore } = req.query;

    const whereClause: any = { companyId, isPassive: true };
    if (minScore) {
      whereClause.passiveScore = { gte: parseFloat(minScore as string) };
    }

    const profiles = await prisma.passiveCandidateProfile.findMany({
      where: whereClause,
      orderBy: { conversionLikelihood: 'desc' },
    });

    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    console.error('Error getting passive candidates:', error);
    res.status(500).json({ success: false, error: 'Failed to get passive candidates' });
  }
};

// Record Outreach to Passive Candidate
export const recordPassiveCandidateOutreach = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const profile = await prisma.passiveCandidateProfile.update({
      where: { id },
      data: {
        timesContacted: { increment: 1 },
        lastContactedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error recording outreach:', error);
    res.status(500).json({ success: false, error: 'Failed to record outreach' });
  }
};

// ============================================================================
// 5.3.5 SKILL-UP RECOMMENDATIONS
// ============================================================================

// Generate Skill-Up Recommendations
export const generateSkillUpRecommendations = async (req: Request, res: Response) => {
  try {
    const { candidateId, targetRoleTitle, targetJobId } = req.body;

    const recommendation = await prisma.skillUpRecommendation.create({
      data: {
        candidateId,
        targetJobId,
        targetRoleTitle: targetRoleTitle || 'Senior Software Engineer',
        currentSkills: req.body.currentSkills || ['JavaScript', 'React'],
        currentLevel: req.body.currentLevel || 'MID',
        requiredSkills: req.body.requiredSkills || ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
        missingSkills: req.body.missingSkills || ['AWS', 'Docker', 'Kubernetes'],
        skillRecommendations: req.body.skillRecommendations || [
          { skill: 'AWS', priority: 'high', timeToLearn: '2 months' },
          { skill: 'Docker', priority: 'high', timeToLearn: '1 month' },
          { skill: 'Kubernetes', priority: 'medium', timeToLearn: '2 months' },
        ],
        prioritySkills: req.body.prioritySkills || ['AWS', 'Docker'],
        quickWins: req.body.quickWins || ['Docker basics', 'AWS S3'],
        longTermGoals: req.body.longTermGoals || ['Kubernetes certification', 'System design'],
        suggestedCourses: req.body.suggestedCourses || [
          { name: 'AWS Solutions Architect', platform: 'Coursera', duration: '40 hours' },
          { name: 'Docker Mastery', platform: 'Udemy', duration: '20 hours' },
        ],
        estimatedTimeToReady: req.body.estimatedTimeToReady || 4,
        salaryImpact: req.body.salaryImpact || { increase: '15-25%', newRange: '$120k-$150k' },
        jobOpportunityImpact: req.body.jobOpportunityImpact || 45,
      },
    });

    res.status(201).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Error generating skill-up recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
};

// Get Skill-Up Recommendations
export const getSkillUpRecommendations = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;

    const recommendations = await prisma.skillUpRecommendation.findMany({
      where: { candidateId },
      orderBy: { generatedAt: 'desc' },
    });

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};

// Update Skill Progress
export const updateSkillProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { skillsAcquired, progressPercentage } = req.body;

    const recommendation = await prisma.skillUpRecommendation.update({
      where: { id },
      data: {
        skillsAcquired,
        progressPercentage,
        lastProgressUpdate: new Date(),
      },
    });

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, error: 'Failed to update progress' });
  }
};

// ============================================================================
// 5.3.6 RE-ENGAGEMENT SUGGESTIONS
// ============================================================================

// Generate Re-engagement Suggestions
export const generateReEngagementSuggestions = async (req: Request, res: Response) => {
  try {
    const { jobId, candidateId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const suggestion = await prisma.reEngagementSuggestion.create({
      data: {
        companyId,
        jobId,
        jobTitle: req.body.jobTitle || 'Senior Engineer',
        candidateId,
        candidateName: req.body.candidateName || 'Jane Smith',
        previousJobId: req.body.previousJobId,
        previousApplicationDate: req.body.previousApplicationDate ? new Date(req.body.previousApplicationDate) : undefined,
        previousOutcome: req.body.previousOutcome || 'REJECTED',
        reEngagementScore: req.body.reEngagementScore || 78,
        reEngagementReasons: req.body.reEngagementReasons || [
          { reason: 'Gained required experience', impact: 'high' },
          { reason: 'New certifications', impact: 'medium' },
        ],
        currentFitScore: req.body.currentFitScore || 0.82,
        previousFitScore: req.body.previousFitScore || 0.65,
        fitImprovement: req.body.fitImprovement || 0.17,
        newSkills: req.body.newSkills || ['AWS', 'Kubernetes'],
        newCertifications: req.body.newCertifications || ['AWS Solutions Architect'],
        careerProgression: req.body.careerProgression || 'Promoted to Lead Developer',
        suggestedOutreach: req.body.suggestedOutreach || 'Reference their growth and new qualifications',
        talkingPoints: req.body.talkingPoints || ['Acknowledge their growth', 'Highlight role changes'],
      },
    });

    res.status(201).json({ success: true, data: suggestion });
  } catch (error) {
    console.error('Error generating re-engagement suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to generate suggestions' });
  }
};

// Get Re-engagement Suggestions for Job
export const getReEngagementSuggestions = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user?.companyId || 'default-company';

    const suggestions = await prisma.reEngagementSuggestion.findMany({
      where: { companyId, jobId },
      orderBy: { reEngagementScore: 'desc' },
    });

    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to get suggestions' });
  }
};

// Update Re-engagement Status
export const updateReEngagementStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { suggestionStatus, actionNotes } = req.body;

    const suggestion = await prisma.reEngagementSuggestion.update({
      where: { id },
      data: {
        suggestionStatus,
        actionNotes,
        reviewedAt: new Date(),
        reviewedBy: req.user?.id,
      },
    });

    res.status(200).json({ success: true, data: suggestion });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};

// ============================================================================
// 5.3.7 INTERVIEW PANEL RECOMMENDATIONS
// ============================================================================

// Generate Interview Panel Recommendations
export const generateInterviewPanelRecommendations = async (req: Request, res: Response) => {
  try {
    const { jobId, candidateId, interviewRound } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const recommendation = await prisma.interviewPanelRecommendation.create({
      data: {
        companyId,
        jobId,
        candidateId,
        interviewRound: interviewRound || 'TECHNICAL',
        interviewerId: req.body.interviewerId || `interviewer-${Date.now()}`,
        interviewerName: req.body.interviewerName || 'Senior Engineer',
        interviewerTitle: req.body.interviewerTitle || 'Staff Engineer',
        interviewerDepartment: req.body.interviewerDepartment || 'Engineering',
        recommendationScore: req.body.recommendationScore || 92,
        recommendationRank: req.body.recommendationRank || 1,
        recommendationType: req.body.recommendationType || 'BEST_FIT',
        matchReasons: req.body.matchReasons || [
          { reason: 'Same technical stack expertise', importance: 'high' },
          { reason: 'Similar career background', importance: 'medium' },
        ],
        relevantExpertise: req.body.relevantExpertise || ['React', 'System Design', 'Team Leadership'],
        interviewerRating: req.body.interviewerRating || 4.8,
        feedbackQuality: req.body.feedbackQuality || 0.92,
        availabilityScore: req.body.availabilityScore || 0.85,
        suggestedFocusAreas: req.body.suggestedFocusAreas || ['System design', 'Problem solving', 'Technical depth'],
        suggestedDuration: req.body.suggestedDuration || 60,
      },
    });

    res.status(201).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Error generating panel recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
};

// Get Interview Panel Recommendations
export const getInterviewPanelRecommendations = async (req: Request, res: Response) => {
  try {
    const { jobId, candidateId } = req.params;
    const companyId = req.user?.companyId || 'default-company';

    const recommendations = await prisma.interviewPanelRecommendation.findMany({
      where: { companyId, jobId, candidateId },
      orderBy: { recommendationScore: 'desc' },
    });

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};

// Select Interviewer
export const selectInterviewer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const recommendation = await prisma.interviewPanelRecommendation.update({
      where: { id },
      data: {
        selected: true,
        selectedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Error selecting interviewer:', error);
    res.status(500).json({ success: false, error: 'Failed to select interviewer' });
  }
};

// ============================================================================
// 5.3.8 SOURCING CHANNEL RECOMMENDATIONS
// ============================================================================

// Generate Sourcing Channel Recommendations
export const generateSourcingRecommendations = async (req: Request, res: Response) => {
  try {
    const { roleTitle, jobId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const recommendation = await prisma.sourcingChannelRecommendation.create({
      data: {
        companyId,
        jobId,
        roleTitle,
        roleLevel: req.body.roleLevel || 'SENIOR',
        requiredSkills: req.body.requiredSkills || ['React', 'Node.js'],
        location: req.body.location || 'San Francisco, CA',
        industry: req.body.industry || 'Technology',
        channelName: req.body.channelName || 'LinkedIn',
        channelType: req.body.channelType || 'SOCIAL',
        recommendationScore: req.body.recommendationScore || 88,
        recommendationRank: req.body.recommendationRank || 1,
        confidenceLevel: req.body.confidenceLevel || 0.85,
        expectedCandidates: req.body.expectedCandidates || 50,
        expectedQuality: req.body.expectedQuality || 0.75,
        expectedCost: req.body.expectedCost || 500,
        expectedTimeToHire: req.body.expectedTimeToHire || 30,
        historicalSuccessRate: req.body.historicalSuccessRate || 0.68,
        channelStrengths: req.body.channelStrengths || ['Large talent pool', 'Advanced filtering', 'InMail capability'],
        bestFor: req.body.bestFor || ['Senior roles', 'Tech positions', 'Passive candidates'],
        pastHiresFromChannel: req.body.pastHiresFromChannel || 25,
        suggestedActions: req.body.suggestedActions || [
          { action: 'Use boolean search with specific skills', priority: 'high' },
          { action: 'Target competing companies', priority: 'medium' },
        ],
        budgetRecommendation: req.body.budgetRecommendation || 2000,
        dataFreshness: new Date(),
      },
    });

    res.status(201).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Error generating sourcing recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
};

// Get Sourcing Channel Recommendations
export const getSourcingRecommendations = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { jobId, roleTitle } = req.query;

    const whereClause: any = { companyId };
    if (jobId) whereClause.jobId = jobId;
    if (roleTitle) whereClause.roleTitle = { contains: roleTitle as string, mode: 'insensitive' };

    const recommendations = await prisma.sourcingChannelRecommendation.findMany({
      where: whereClause,
      orderBy: { recommendationScore: 'desc' },
    });

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};

// ============================================================================
// RECOMMENDATION FEEDBACK & CONFIGURATION
// ============================================================================

// Submit Recommendation Feedback
export const submitRecommendationFeedback = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';

    const feedback = await prisma.recommendationFeedback.create({
      data: {
        companyId,
        recommendationType: req.body.recommendationType,
        recommendationId: req.body.recommendationId,
        userId: req.user?.id || 'anonymous',
        userRole: req.body.userRole || 'RECRUITER',
        rating: req.body.rating,
        wasHelpful: req.body.wasHelpful,
        wasAccurate: req.body.wasAccurate,
        feedbackText: req.body.feedbackText,
        actionTaken: req.body.actionTaken,
        outcome: req.body.outcome,
      },
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to submit feedback' });
  }
};

// Get/Create Recommendation Config
export const getOrCreateRecommendationConfig = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { recommendationType } = req.params;

    let config = await prisma.recommendationConfig.findUnique({
      where: {
        companyId_recommendationType: { companyId, recommendationType },
      },
    });

    if (!config) {
      config = await prisma.recommendationConfig.create({
        data: {
          companyId,
          recommendationType,
          weights: { skills: 0.35, experience: 0.25, location: 0.20, culture: 0.20 },
          thresholds: { minimum: 60, highlight: 80 },
          createdById: req.user?.id || 'system',
        },
      });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({ success: false, error: 'Failed to get config' });
  }
};

// Update Recommendation Config
export const updateRecommendationConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await prisma.recommendationConfig.update({
      where: { id },
      data: {
        ...req.body,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ success: false, error: 'Failed to update config' });
  }
};

// Get Smart Recommendations Stats
export const getSmartRecommendationsStats = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';

    const [
      jobRecommendations,
      candidateRecommendations,
      similarMatches,
      passiveCandidates,
      skillUpRecs,
      reEngagements,
      panelRecs,
      sourcingRecs,
    ] = await Promise.all([
      prisma.jobRecommendation.count({ where: { companyId } }),
      prisma.candidateRecommendation.count({ where: { companyId } }),
      prisma.similarCandidateMatch.count({ where: { companyId } }),
      prisma.passiveCandidateProfile.count({ where: { companyId } }),
      prisma.skillUpRecommendation.count(),
      prisma.reEngagementSuggestion.count({ where: { companyId } }),
      prisma.interviewPanelRecommendation.count({ where: { companyId } }),
      prisma.sourcingChannelRecommendation.count({ where: { companyId } }),
    ]);

    // Get feedback stats
    const feedbackStats = await prisma.recommendationFeedback.aggregate({
      where: { companyId },
      _avg: { rating: true },
      _count: true,
    });

    res.status(200).json({
      success: true,
      data: {
        totalRecommendations: {
          jobRecommendations,
          candidateRecommendations,
          similarMatches,
          passiveCandidates,
          skillUpRecommendations: skillUpRecs,
          reEngagementSuggestions: reEngagements,
          interviewPanelRecommendations: panelRecs,
          sourcingChannelRecommendations: sourcingRecs,
        },
        feedback: {
          totalFeedback: feedbackStats._count,
          averageRating: feedbackStats._avg.rating || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
};
