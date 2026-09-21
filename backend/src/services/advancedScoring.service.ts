import { prisma } from '../database/prisma';

import {
  saveCultureFitScore,
  saveGrowthPotentialScore,
  saveTechnicalDepthScore,
  saveCommunicationScore,
  saveReliabilityScore,
} from './scoringStorage.service';

export const SCORING_VERSION = '2.0';

export type ScoreStatus = 'COMPLETE' | 'INCOMPLETE';

export interface ComputedAdvancedScore {
  dimension:
    | 'cultureFit'
    | 'growthPotential'
    | 'technicalDepth'
    | 'communication'
    | 'reliability';
  status: ScoreStatus;
  score: number | null;
  tier: string | null;
  inputs: Record<string, unknown>;
  components: Record<string, number>;
  reason?: string;
  scoringVersion: string;
}

export interface CandidateScoringData {
  user: any;
  profile: any | null;
  workExperiences: any[];
  educations: any[];
  skills: any[];
  certifications: any[];
  projects: any[];
  achievements: any[];
  applications: any[];
  interviews: any[];
  messages: any[];
  job: any | null;
}

// ============================================================
// Generic Helpers
// ============================================================

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

function tokenize(value: unknown): string[] {
  const text = normalizeText(value);

  if (!text) {
    return [];
  }

  return text
    .replace(/[^a-z0-9+#.\- ]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function uniqueStrings(values: unknown[]): string[] {
  return [...new Set(
    values
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean),
  )];
}

function overlapScore(candidateValues: string[], targetValues: string[]): number {
  const candidate = new Set(
    candidateValues.map((value) => normalizeText(value)).filter(Boolean),
  );

  const target = new Set(
    targetValues.map((value) => normalizeText(value)).filter(Boolean),
  );

  if (!candidate.size || !target.size) {
    return 0;
  }

  let matches = 0;

  for (const value of target) {
    if (candidate.has(value)) {
      matches += 1;
      continue;
    }

    const candidateTokens = [...candidate].flatMap(tokenize);
    const targetTokens = tokenize(value);

    if (
      targetTokens.length > 0 &&
      targetTokens.some((token) => candidateTokens.includes(token))
    ) {
      matches += 1;
    }
  }

  return clamp((matches / target.size) * 100);
}

function textQualityScore(texts: string[]): number {
  const validTexts = texts
    .map((text) => text.trim())
    .filter(Boolean);

  if (!validTexts.length) {
    return 0;
  }

  const combined = validTexts.join(' ').trim();

  const wordCount = combined.split(/\s+/).filter(Boolean).length;

  const sentenceCount = combined
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;

  const longTextScore = clamp((wordCount / 180) * 100);
  const sentenceScore = clamp((sentenceCount / 12) * 100);

  const punctuationScore = /[.!?]/.test(combined) ? 100 : 50;

  return round(
    longTextScore * 0.5 +
    sentenceScore * 0.3 +
    punctuationScore * 0.2,
  );
}

function proficiencyScore(label: unknown): number {
  switch (normalizeText(label)) {
    case 'expert':
      return 100;
    case 'advanced':
      return 85;
    case 'intermediate':
      return 70;
    case 'elementary':
      return 50;
    case 'beginner':
      return 30;
    default:
      return 50;
  }
}

function tierFromScore(
  score: number,
  tiers: Array<{ minimum: number; label: string }>,
): string {
  for (const tier of tiers) {
    if (score >= tier.minimum) {
      return tier.label;
    }
  }

  return tiers[tiers.length - 1]?.label ?? '';
}

function calculateExperienceYears(workExperiences: any[]): number {
  let totalMonths = 0;

  for (const experience of workExperiences) {
    if (!experience?.startDate) {
      continue;
    }

    const start = new Date(experience.startDate).getTime();

    if (Number.isNaN(start)) {
      continue;
    }

    const end = experience.endDate
      ? new Date(experience.endDate).getTime()
      : experience.isCurrent
        ? Date.now()
        : start;

    if (Number.isNaN(end) || end <= start) {
      continue;
    }

    totalMonths += (end - start) / (1000 * 60 * 60 * 24 * 30.4375);
  }

  return round(totalMonths / 12);
}

function experienceMatchScore(
  candidateYears: number,
  requiredYears: unknown,
): number {
  if (
    requiredYears === null ||
    requiredYears === undefined ||
    requiredYears === ''
  ) {
    return 100;
  }

  const requiredText = String(requiredYears);

  const match = requiredText.match(/(\d+(?:\.\d+)?)/);

  if (!match) {
    return 100;
  }

  const required = Number(match[1]);

  if (!Number.isFinite(required) || required <= 0) {
    return 100;
  }

  if (candidateYears >= required) {
    return 100;
  }

  return clamp((candidateYears / required) * 100);
}

// ============================================================
// Load Candidate / Job Data
// ============================================================

export async function loadCandidateScoringData(
  userId: string,
  jobId?: string | null,
): Promise<CandidateScoringData> {
  const [
    user,
    profile,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        skills: true,
        experience: true,
        education: true,
      },
    }),

    prisma.candidateProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        headline: true,
        summary: true,
        preferredLocation: true,
        willingToRelocate: true,
        remotePreference: true,
        expectedSalary: true,
        jobTypes: true,
        industries: true,
        completenessScore: true,
        languages: true,
      },
    }),
  ]);

  if (!user) {
    throw new Error(`Candidate user not found: ${userId}`);
  }

  const profileId = profile?.id;

  const [
    workExperiences,
    educations,
    skills,
    certifications,
    projects,
    achievements,
    applications,
    interviews,
    sentMessages,
    receivedMessages,
    job,
  ] = await Promise.all([
    profileId
      ? prisma.workExperience.findMany({
          where: { profileId },
          orderBy: { displayOrder: 'asc' },
        })
      : Promise.resolve([]),

    profileId
      ? prisma.education.findMany({
          where: { profileId },
          orderBy: { displayOrder: 'asc' },
        })
      : Promise.resolve([]),

    profileId
      ? prisma.candidateSkill.findMany({
          where: { profileId },
          orderBy: { displayOrder: 'asc' },
        })
      : Promise.resolve([]),

    profileId
      ? prisma.certification.findMany({
          where: { profileId },
          orderBy: { displayOrder: 'asc' },
        })
      : Promise.resolve([]),

    profileId
      ? prisma.project.findMany({
          where: { profileId },
          orderBy: { displayOrder: 'asc' },
        })
      : Promise.resolve([]),

    profileId
      ? prisma.achievement.findMany({
          where: { profileId },
          orderBy: { earnedAt: 'desc' },
        })
      : Promise.resolve([]),

    prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: true,
        interviews: true,
      },
      orderBy: { appliedAt: 'desc' },
    }),

    prisma.interview.findMany({
      where: { candidateId: userId },
      orderBy: { scheduledAt: 'desc' },
    }),

    prisma.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),

    prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),

    jobId
      ? prisma.job.findUnique({
          where: { id: jobId },
        })
      : Promise.resolve(null),
  ]);

  return {
    user,
    profile,
    workExperiences,
    educations,
    skills,
    certifications,
    projects,
    achievements,
    applications,
    interviews,
    messages: [...sentMessages, ...receivedMessages],
    job,
  };
}

// ============================================================
// 1. Culture Fit
// Approved inputs:
// candidate profile/preferences + relevant job/company fields
// ============================================================

export function computeCultureFitScore(
  data: CandidateScoringData,
): ComputedAdvancedScore {
  const { profile, skills, workExperiences, job } = data;

  if (!profile) {
    return {
      dimension: 'cultureFit',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {},
      components: {},
      reason: 'Candidate profile is missing.',
      scoringVersion: SCORING_VERSION,
    };
  }

  if (!job) {
    return {
      dimension: 'cultureFit',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {
        candidate: {
          preferredLocation: profile.preferredLocation,
          willingToRelocate: profile.willingToRelocate,
          remotePreference: profile.remotePreference,
          jobTypes: profile.jobTypes,
          industries: profile.industries,
        },
      },
      components: {},
      reason: 'Job data is required for culture fit scoring.',
      scoringVersion: SCORING_VERSION,
    };
  }

  const candidateSkills = uniqueStrings(
    skills.map((skill) => skill.name),
  );

  const candidateIndustries = uniqueStrings([
    ...(Array.isArray(profile.industries) ? profile.industries : []),
    ...workExperiences.map((experience) => experience.industry),
  ]);

  const preferredLocations = Array.isArray(profile.preferredLocation)
    ? profile.preferredLocation
    : [];

  const jobSkills = Array.isArray(job.skills) ? job.skills : [];

  const skillMatch = overlapScore(candidateSkills, jobSkills);

  const industryMatch =
    job.companyIndustry &&
    candidateIndustries.length
      ? overlapScore(candidateIndustries, [job.companyIndustry])
      : 100;

  const locationMatch = (() => {
    if (!job.location) {
      return 100;
    }

    if (preferredLocations.length === 0) {
      return profile.willingToRelocate ? 75 : 50;
    }

    return overlapScore(preferredLocations, [job.location]);
  })();

  const jobTypeMatch = (() => {
    if (!job.type || !Array.isArray(profile.jobTypes)) {
      return 100;
    }

    return overlapScore(profile.jobTypes, [job.type]);
  })();

  const candidateYears = calculateExperienceYears(workExperiences);

  const experienceMatch = experienceMatchScore(
    candidateYears,
    job.experience,
  );

  const score = round(
    skillMatch * 0.30 +
    industryMatch * 0.20 +
    locationMatch * 0.20 +
    jobTypeMatch * 0.10 +
    experienceMatch * 0.20,
  );

  return {
    dimension: 'cultureFit',
    status: 'COMPLETE',
    score: clamp(score),
    tier: tierFromScore(clamp(score), [
      { minimum: 80, label: 'STRONG_FIT' },
      { minimum: 65, label: 'GOOD_FIT' },
      { minimum: 50, label: 'MODERATE_FIT' },
      { minimum: 0, label: 'POTENTIAL_MISMATCH' },
    ]),
    inputs: {
      candidate: {
        preferredLocation: profile.preferredLocation,
        willingToRelocate: profile.willingToRelocate,
        remotePreference: profile.remotePreference,
        jobTypes: profile.jobTypes,
        industries: profile.industries,
        skillNames: candidateSkills,
      },
      job: {
        location: job.location,
        type: job.type,
        skills: jobSkills,
        experience: job.experience,
        education: job.education,
        companyIndustry: job.companyIndustry,
        companySize: job.companySize,
      },
    },
    components: {
      skillMatch: round(skillMatch),
      industryMatch: round(industryMatch),
      locationMatch: round(locationMatch),
      jobTypeMatch: round(jobTypeMatch),
      experienceMatch: round(experienceMatch),
    },
    scoringVersion: SCORING_VERSION,
  };
}

// ============================================================
// 2. Growth Potential
// Approved inputs:
// experience + education + skills + projects/achievements
// ============================================================

export function computeGrowthPotentialScore(
  data: CandidateScoringData,
): ComputedAdvancedScore {
  const {
    profile,
    workExperiences,
    educations,
    skills,
    projects,
    achievements,
  } = data;

  if (!profile) {
    return {
      dimension: 'growthPotential',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {},
      components: {},
      reason: 'Candidate profile is missing.',
      scoringVersion: SCORING_VERSION,
    };
  }

  const experienceYears = calculateExperienceYears(workExperiences);

  const skillScores = skills
    .map((skill) => {
      const proficiency = proficiencyScore(skill.proficiencyLabel);

      const years = Number(skill.yearsOfExperience ?? 0);

      const yearsScore = Number.isFinite(years)
        ? clamp(years * 15)
        : 0;

      return round(proficiency * 0.7 + yearsScore * 0.3);
    })
    .filter((score) => score > 0);

  const skillScore = skillScores.length
    ? average(skillScores)
    : 0;

  const experienceScore = clamp(
    experienceYears * 15 + workExperiences.length * 5,
  );

  const educationScore = clamp(
    educations.length * 25 +
    educations.filter((education) => education.isOngoing).length * 10,
  );

  const projectScore = clamp(
    projects.length * 18 +
    projects.filter((project) => project.isFeatured).length * 10,
  );

  const achievementScore = clamp(
    achievements.filter((achievement) => achievement.isCompleted).length * 20 +
    achievements.reduce(
      (sum, achievement) => sum + Number(achievement.points || 0),
      0,
    ),
  );

  const score = round(
    experienceScore * 0.25 +
    educationScore * 0.15 +
    skillScore * 0.25 +
    projectScore * 0.20 +
    achievementScore * 0.15,
  );

  const availableGroups = [
    workExperiences.length > 0,
    educations.length > 0,
    skills.length > 0,
    projects.length > 0 || achievements.length > 0,
  ].filter(Boolean).length;

  if (availableGroups < 2) {
    return {
      dimension: 'growthPotential',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {
        experienceYears,
        educationCount: educations.length,
        skills: skills.map((skill) => ({
          name: skill.name,
          proficiencyLabel: skill.proficiencyLabel,
          yearsOfExperience: skill.yearsOfExperience,
        })),
        projectCount: projects.length,
        achievementCount: achievements.length,
      },
      components: {
        experienceScore: round(experienceScore),
        educationScore: round(educationScore),
        skillScore: round(skillScore),
        projectScore: round(projectScore),
        achievementScore: round(achievementScore),
      },
      reason: 'At least two approved growth-input groups are required.',
      scoringVersion: SCORING_VERSION,
    };
  }

  return {
    dimension: 'growthPotential',
    status: 'COMPLETE',
    score: clamp(score),
    tier: tierFromScore(clamp(score), [
      { minimum: 80, label: 'STRONG_GROWTH' },
      { minimum: 60, label: 'STEADY_GROWTH' },
      { minimum: 0, label: 'LIMITED_GROWTH' },
    ]),
    inputs: {
      experience: {
        years: experienceYears,
        count: workExperiences.length,
      },
      education: educations.map((education) => ({
        institutionName: education.institutionName,
        degree: education.degree,
        fieldOfStudy: education.fieldOfStudy,
        specialization: education.specialization,
        grade: education.grade,
      })),
      skills: skills.map((skill) => ({
        name: skill.name,
        proficiencyLevel: skill.proficiencyLevel,
        proficiencyLabel: skill.proficiencyLabel,
        yearsOfExperience: skill.yearsOfExperience,
      })),
      projects: projects.map((project) => ({
        title: project.title,
        technologies: project.technologies,
        frameworks: project.frameworks,
        languages: project.languages,
        tools: project.tools,
        contributions: project.contributions,
        impact: project.impact,
        isFeatured: project.isFeatured,
      })),
      achievements: achievements.map((achievement) => ({
        title: achievement.title,
        type: achievement.type,
        points: achievement.points,
        isCompleted: achievement.isCompleted,
      })),
    },
    components: {
      experienceScore: round(experienceScore),
      educationScore: round(educationScore),
      skillScore: round(skillScore),
      projectScore: round(projectScore),
      achievementScore: round(achievementScore),
    },
    scoringVersion: SCORING_VERSION,
  };
}

// ============================================================
// 3. Technical Depth
// Approved inputs:
// skills + experience + projects + certifications
// ============================================================

export function computeTechnicalDepthScore(
  data: CandidateScoringData,
): ComputedAdvancedScore {
  const {
    profile,
    skills,
    workExperiences,
    projects,
    certifications,
  } = data;

  if (!profile) {
    return {
      dimension: 'technicalDepth',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {},
      components: {},
      reason: 'Candidate profile is missing.',
      scoringVersion: SCORING_VERSION,
    };
  }

  const skillScores = skills
    .map((skill) => {
      const base = proficiencyScore(skill.proficiencyLabel);

      const verifiedBonus = skill.isVerified ? 10 : 0;

      const years = Number(skill.yearsOfExperience ?? 0);

      const experienceBonus = Number.isFinite(years)
        ? clamp(years * 5)
        : 0;

      return clamp(
        base * 0.70 +
        verifiedBonus * 0.15 +
        experienceBonus * 0.15,
      );
    });

  const skillDepth = skillScores.length
    ? average(skillScores)
    : 0;

  const experienceTechnicalCounts = workExperiences.map((experience) => {
    const technologies = Array.isArray(experience.technologies)
      ? experience.technologies.length
      : 0;

    const technologySkills = Array.isArray(experience.skills)
      ? experience.skills.length
      : 0;

    const responsibilities = Array.isArray(experience.responsibilities)
      ? experience.responsibilities.length
      : 0;

    const achievements = Array.isArray(experience.achievements)
      ? experience.achievements.length
      : 0;

    return clamp(
      technologies * 12 +
      technologySkills * 8 +
      responsibilities * 4 +
      achievements * 4,
    );
  });

  const experienceDepth = experienceTechnicalCounts.length
    ? average(experienceTechnicalCounts)
    : 0;

  const projectDepthScores = projects.map((project) => {
    const technologies = Array.isArray(project.technologies)
      ? project.technologies.length
      : 0;

    const frameworks = Array.isArray(project.frameworks)
      ? project.frameworks.length
      : 0;

    const languages = Array.isArray(project.languages)
      ? project.languages.length
      : 0;

    const contributions = Array.isArray(project.contributions)
      ? project.contributions.length
      : 0;

    const impact = project.impact ? 15 : 0;

    return clamp(
      technologies * 10 +
      frameworks * 10 +
      languages * 8 +
      contributions * 8 +
      impact,
    );
  });

  const projectDepth = projectDepthScores.length
    ? average(projectDepthScores)
    : 0;

  const certificationScore = clamp(
    certifications.length * 20 +
    certifications.filter(
      (certification) => certification.verificationStatus === 'VERIFIED',
    ).length * 10,
  );

  const availableGroups = [
    skills.length > 0,
    workExperiences.length > 0,
    projects.length > 0,
    certifications.length > 0,
  ].filter(Boolean).length;

  if (availableGroups < 2) {
    return {
      dimension: 'technicalDepth',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {
        skillCount: skills.length,
        experienceCount: workExperiences.length,
        projectCount: projects.length,
        certificationCount: certifications.length,
      },
      components: {
        skillDepth: round(skillDepth),
        experienceDepth: round(experienceDepth),
        projectDepth: round(projectDepth),
        certificationScore: round(certificationScore),
      },
      reason: 'At least two approved technical-input groups are required.',
      scoringVersion: SCORING_VERSION,
    };
  }

  const score = round(
    skillDepth * 0.35 +
    experienceDepth * 0.25 +
    projectDepth * 0.25 +
    certificationScore * 0.15,
  );

  const technicalNames = uniqueStrings(
    skills.map((skill) => skill.name),
  );

  return {
    dimension: 'technicalDepth',
    status: 'COMPLETE',
    score: clamp(score),
    tier: tierFromScore(clamp(score), [
      { minimum: 85, label: 'EXPERT' },
      { minimum: 70, label: 'SENIOR' },
      { minimum: 50, label: 'INTERMEDIATE' },
      { minimum: 0, label: 'SURFACE' },
    ]),
    inputs: {
      skills: skills.map((skill) => ({
        name: skill.name,
        category: skill.category,
        proficiencyLevel: skill.proficiencyLevel,
        proficiencyLabel: skill.proficiencyLabel,
        yearsOfExperience: skill.yearsOfExperience,
        isVerified: skill.isVerified,
      })),
      experience: workExperiences.map((experience) => ({
        title: experience.title,
        companyName: experience.companyName,
        technologies: experience.technologies,
        skills: experience.skills,
        responsibilities: experience.responsibilities,
        achievements: experience.achievements,
      })),
      projects: projects.map((project) => ({
        title: project.title,
        technologies: project.technologies,
        frameworks: project.frameworks,
        languages: project.languages,
        tools: project.tools,
        contributions: project.contributions,
        impact: project.impact,
      })),
      certifications: certifications.map((certification) => ({
        name: certification.name,
        issuingOrganization: certification.issuingOrganization,
        skills: certification.skills,
        verificationStatus: certification.verificationStatus,
      })),
    },
    components: {
      skillDepth: round(skillDepth),
      experienceDepth: round(experienceDepth),
      projectDepth: round(projectDepth),
      certificationScore: round(certificationScore),
    },
    scoringVersion: SCORING_VERSION,
  };
}

// ============================================================
// 4. Communication
// Approved inputs:
// profile/about text + experience/project descriptions
// + available communication/interview records
// ============================================================

export function computeCommunicationScore(
  data: CandidateScoringData,
): ComputedAdvancedScore {
  const {
    user,
    profile,
    workExperiences,
    projects,
    applications,
    interviews,
    messages,
  } = data;

  if (!profile) {
    return {
      dimension: 'communication',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {},
      components: {},
      reason: 'Candidate profile is missing.',
      scoringVersion: SCORING_VERSION,
    };
  }

  const profileTexts = [
    user.bio,
    profile.headline,
    profile.summary,
  ].filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );

  const experienceTexts = workExperiences.flatMap((experience) => [
    experience.description,
    ...(Array.isArray(experience.responsibilities)
      ? experience.responsibilities
      : []),
    ...(Array.isArray(experience.achievements)
      ? experience.achievements
      : []),
  ]).filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );

  const projectTexts = projects.flatMap((project) => [
    project.shortDescription,
    project.description,
    project.impact,
    ...(Array.isArray(project.contributions)
      ? project.contributions
      : []),
  ]).filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );

  const applicationTexts = applications.flatMap((application) => [
    application.coverLetter,
  ]).filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );

  const interviewTexts = interviews.flatMap((interview) => [
    interview.feedback,
    interview.notes,
  ]).filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );

  const messageTexts = messages
    .map((message) => message.content)
    .filter(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    );

  const profileScore = textQualityScore(profileTexts);
  const experienceScore = textQualityScore(experienceTexts);
  const projectScore = textQualityScore(projectTexts);
  const applicationScore = textQualityScore(applicationTexts);
  const interviewScore = textQualityScore(interviewTexts);
  const messageScore = textQualityScore(messageTexts);

  const availableScores = [
    profileScore,
    experienceScore,
    projectScore,
    applicationScore,
    interviewScore,
    messageScore,
  ].filter((value) => value > 0);

  if (availableScores.length < 2) {
    return {
      dimension: 'communication',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {
        profileText: profileTexts,
        experienceText: experienceTexts,
        projectText: projectTexts,
        applicationText: applicationTexts,
        interviewText: interviewTexts,
        messageText: messageTexts,
      },
      components: {
        profileScore: round(profileScore),
        experienceScore: round(experienceScore),
        projectScore: round(projectScore),
        applicationScore: round(applicationScore),
        interviewScore: round(interviewScore),
        messageScore: round(messageScore),
      },
      reason: 'At least two communication-input groups are required.',
      scoringVersion: SCORING_VERSION,
    };
  }

  const weightedComponents: number[] = [];
  const weights: number[] = [];

  const addComponent = (value: number, weight: number) => {
    if (value > 0) {
      weightedComponents.push(value * weight);
      weights.push(weight);
    }
  };

  addComponent(profileScore, 0.25);
  addComponent(experienceScore, 0.15);
  addComponent(projectScore, 0.15);
  addComponent(applicationScore, 0.15);
  addComponent(interviewScore, 0.15);
  addComponent(messageScore, 0.15);

  const score = round(
    weightedComponents.reduce((sum, value) => sum + value, 0) /
    weights.reduce((sum, value) => sum + value, 0),
  );

  return {
    dimension: 'communication',
    status: 'COMPLETE',
    score: clamp(score),
    tier: tierFromScore(clamp(score), [
      { minimum: 80, label: 'STRONG' },
      { minimum: 60, label: 'DEVELOPING' },
      { minimum: 0, label: 'NEEDS_IMPROVEMENT' },
    ]),
    inputs: {
      profileText: profileTexts,
      experienceText: experienceTexts,
      projectText: projectTexts,
      applicationText: applicationTexts,
      interviewText: interviewTexts,
      messageText: messageTexts,
    },
    components: {
      profileScore: round(profileScore),
      experienceScore: round(experienceScore),
      projectScore: round(projectScore),
      applicationScore: round(applicationScore),
      interviewScore: round(interviewScore),
      messageScore: round(messageScore),
    },
    scoringVersion: SCORING_VERSION,
  };
}

// ============================================================
// 5. Reliability
// Approved inputs:
// application history + interview attendance/response/engagement
// ============================================================

export function computeReliabilityScore(
  data: CandidateScoringData,
): ComputedAdvancedScore {
  const {
    profile,
    applications,
    interviews,
    messages,
  } = data;

  if (!profile) {
    return {
      dimension: 'reliability',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {},
      components: {},
      reason: 'Candidate profile is missing.',
      scoringVersion: SCORING_VERSION,
    };
  }

  const totalInterviews = interviews.length;

  const completedInterviews = interviews.filter(
    (interview) => normalizeText(interview.status) === 'completed',
  ).length;

  const noShowInterviews = interviews.filter(
    (interview) => normalizeText(interview.status) === 'no_show',
  ).length;

  const cancelledInterviews = interviews.filter(
    (interview) => normalizeText(interview.status) === 'cancelled',
  ).length;

  const rescheduledInterviews = interviews.filter(
    (interview) => normalizeText(interview.status) === 'rescheduled',
  ).length;

  const interviewAttendanceScore =
    totalInterviews > 0
      ? clamp(
          ((completedInterviews +
            cancelledInterviews * 0.5 +
            rescheduledInterviews * 0.75) /
            totalInterviews) *
            100 -
            noShowInterviews * 20,
        )
      : 0;

  const applicationScore = applications.length
    ? clamp(
        applications.reduce((total, application) => {
          let score = 50;

          if (application.resume) {
            score += 20;
          }

          if (application.coverLetter) {
            score += 10;
          }

          if (application.appliedAt) {
            score += 10;
          }

          if (application.status) {
            score += 10;
          }

          return total + clamp(score);
        }, 0) / applications.length,
      )
    : 0;

  const responseScore = messages.length
    ? clamp(messages.filter((message) => {
        return typeof message.content === 'string' &&
          message.content.trim().length > 0;
      }).length / messages.length * 100)
    : 0;

  const profileCompletionScore = clamp(
    Number(profile.completenessScore ?? 0),
  );

  const availableComponents = [
    applicationScore,
    interviewAttendanceScore,
    responseScore,
    profileCompletionScore,
  ].filter((value) => value > 0);

  if (availableComponents.length < 2) {
    return {
      dimension: 'reliability',
      status: 'INCOMPLETE',
      score: null,
      tier: null,
      inputs: {
        applicationHistory: applications.map((application) => ({
          id: application.id,
          status: application.status,
          appliedAt: application.appliedAt,
          hasResume: Boolean(application.resume),
          hasCoverLetter: Boolean(application.coverLetter),
        })),
        interviewHistory: interviews.map((interview) => ({
          id: interview.id,
          status: interview.status,
          scheduledAt: interview.scheduledAt,
          endTime: interview.endTime,
        })),
        messageCount: messages.length,
        profileCompletenessScore: profile.completenessScore,
      },
      components: {
        applicationScore: round(applicationScore),
        interviewAttendanceScore: round(interviewAttendanceScore),
        responseScore: round(responseScore),
        profileCompletionScore: round(profileCompletionScore),
      },
      reason: 'At least two reliability-input groups are required.',
      scoringVersion: SCORING_VERSION,
    };
  }

  const availableWeights: Array<[number, number]> = [];

  if (applicationScore > 0) {
    availableWeights.push([applicationScore, 0.30]);
  }

  if (interviewAttendanceScore > 0) {
    availableWeights.push([interviewAttendanceScore, 0.35]);
  }

  if (responseScore > 0) {
    availableWeights.push([responseScore, 0.20]);
  }

  if (profileCompletionScore > 0) {
    availableWeights.push([profileCompletionScore, 0.15]);
  }

  const totalWeight = availableWeights.reduce(
    (sum, [, weight]) => sum + weight,
    0,
  );

  const score = round(
    availableWeights.reduce(
      (sum, [component, weight]) => sum + component * weight,
      0,
    ) / totalWeight,
  );

  return {
    dimension: 'reliability',
    status: 'COMPLETE',
    score: clamp(score),
    tier: tierFromScore(clamp(score), [
      { minimum: 85, label: 'HIGHLY_RELIABLE' },
      { minimum: 70, label: 'RELIABLE' },
      { minimum: 50, label: 'MODERATELY_RELIABLE' },
      { minimum: 0, label: 'NEEDS_MONITORING' },
    ]),
    inputs: {
      applicationHistory: applications.map((application) => ({
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
        hasResume: Boolean(application.resume),
        hasCoverLetter: Boolean(application.coverLetter),
      })),
      interviewHistory: interviews.map((interview) => ({
        id: interview.id,
        status: interview.status,
        scheduledAt: interview.scheduledAt,
        endTime: interview.endTime,
      })),
      engagement: {
        messageCount: messages.length,
      },
      profileCompletenessScore: profile.completenessScore,
    },
    components: {
      applicationScore: round(applicationScore),
      interviewAttendanceScore: round(interviewAttendanceScore),
      responseScore: round(responseScore),
      profileCompletionScore: round(profileCompletionScore),
    },
    scoringVersion: SCORING_VERSION,
  };
}

// ============================================================
// Compute all five dimensions from the same stored data
// ============================================================

export async function computeAllAdvancedScores(
  userId: string,
  jobId?: string | null,
) {
  const data = await loadCandidateScoringData(userId, jobId);

  return {
    data,
    cultureFit: computeCultureFitScore(data),
    growthPotential: computeGrowthPotentialScore(data),
    technicalDepth: computeTechnicalDepthScore(data),
    communication: computeCommunicationScore(data),
    reliability: computeReliabilityScore(data),
  };
}

// ============================================================
// Persistence - AI-11 Storage Integration
// ============================================================

function ensureScore(result: ComputedAdvancedScore): number {
  if (result.status !== 'COMPLETE' || result.score === null) {
    throw new Error(
      `${result.dimension} score is incomplete and cannot be persisted.`,
    );
  }

  return result.score;
}

export async function persistCultureFitScore(
  userId: string,
  profileId: string,
  result: ComputedAdvancedScore,
  companyId?: string | null,
  jobId?: string | null,
) {
  const score = ensureScore(result);

  return saveCultureFitScore({
    userId,
    profileId,
    companyId: companyId ?? null,
    jobId: jobId ?? null,

    overallCultureScore: score,
    fitLevel: result.tier ?? 'MODERATE_FIT',

    workStyleAlignment: result.components.locationMatch ?? score,
    collaborationStyle: 'NOT_COMPUTED',
    communicationStyle: 'NOT_COMPUTED',
    decisionMaking: 'NOT_COMPUTED',
    feedbackPreference: 'NOT_COMPUTED',

    remotePreference: 'NOT_COMPUTED',
    workHoursFlexibility: 'NOT_COMPUTED',
    meetingTolerance: 'NOT_COMPUTED',
    focusTimeNeeds: 'NOT_COMPUTED',

    valuesAlignment: result.components.industryMatch ?? score,
    topValues: [],
    matchedValues: {
      skillMatch: result.components.skillMatch ?? 0,
      industryMatch: result.components.industryMatch ?? 0,
      locationMatch: result.components.locationMatch ?? 0,
      jobTypeMatch: result.components.jobTypeMatch ?? 0,
      experienceMatch: result.components.experienceMatch ?? 0,
    },

    conflictingValues: [],
    teamSizePreference: 'NOT_COMPUTED',
    leadershipStyle: 'NOT_COMPUTED',
    conflictResolution: 'NOT_COMPUTED',
    teamRoleArchetype: 'NOT_COMPUTED',

    primaryMotivators: [],
    careerPriorities: null,

    workLifeBalance: 0,
    preferredCompanySize: 'NOT_COMPUTED',
    preferredIndustries: Array.isArray(
      (result.inputs.candidate as any)?.industries,
    )
      ? (result.inputs.candidate as any).industries
      : [],

    startupReadiness: 0,
    corporateReadiness: 0,
    changeAdaptability: 0,
    ambiguityTolerance: 0,
    riskTolerance: 'NOT_COMPUTED',

    strengthFactors: result.components,
    concernFactors: {},

    recommendations: [
      'Computed from approved candidate preference and job fields.',
    ],

    fitSummary:
      'AI-12 deterministic culture fit score using stored candidate/job data.',

    assessmentResponses: null,

    inferredFromProfile: result.inputs.candidate ?? null,

    behavioralSignals: {
      scoringVersion: result.scoringVersion,
      components: result.components,
    },

    scoringVersion: result.scoringVersion,
    lastAnalyzedAt: new Date(),
    confidence: 1,
  });
}

export async function persistGrowthPotentialScore(
  userId: string,
  profileId: string,
  result: ComputedAdvancedScore,
) {
  const score = ensureScore(result);

  return saveGrowthPotentialScore({
    userId,
    profileId,

    overallGrowthScore: score,
    growthTier: result.tier ?? 'LIMITED_GROWTH',

    learningAgility: result.components.skillScore ?? 0,
    skillAcquisitionRate: result.components.skillScore ?? 0,
    knowledgeRetention: result.components.educationScore ?? 0,
    adaptabilityScore: result.components.experienceScore ?? 0,
    careerProgressionRate: result.components.experienceScore ?? 0,

    promotionHistory: null,

    roleComplexityGrowth: result.components.experienceScore ?? 0,
    responsibilityExpansion: result.components.experienceScore ?? 0,

    careerMomentum:
      score >= 80
        ? 'STRONG'
        : score >= 60
          ? 'STEADY'
          : 'LIMITED',

    skillGrowthVelocity: result.components.skillScore ?? 0,

    techAdoptionSpeed:
      result.components.projectScore >= 70 ? 'FAST' : 'STEADY',

    breadthVsDepth:
      result.components.skillScore >= result.components.projectScore
        ? 'BREADTH'
        : 'DEPTH',

    emergingSkills: [],

    continuousLearning: result.components.educationScore ?? 0,
    recentCertifications: 0,

    educationRecency: 'FROM_STORED_EDUCATION_DATA',
    learningInvestment: result.components.educationScore ?? 0,

    leadershipPotential: 0,
    managementExperience: null,
    mentorshipActivities: 0,

    initiativeTaking: result.components.projectScore ?? 0,
    innovationScore: result.components.achievementScore ?? 0,

    impactEvidence: result.inputs.projects ?? null,

    problemSolvingAbility: result.components.projectScore ?? 0,
    creativeThinking: result.components.projectScore ?? 0,

    achievementDensity: result.components.achievementScore ?? 0,
    recognitionFrequency: result.components.achievementScore ?? 0,

    overachievementSignals: null,
    predictedGrowthPath: null,

    suggestedRoles: [],
    developmentAreas: [],

    ceilingEstimate: null,

    growthDrivers: {
      inputs: result.inputs,
      components: result.components,
      scoringVersion: result.scoringVersion,
    },

    growthLimiters: {},

    recommendations: [
      'Computed from stored experience, education, skills, projects and achievements.',
    ],

    potentialSummary:
      'AI-12 deterministic growth potential score using stored candidate data.',

    linkedinActivity: null,
    githubActivity: null,
    learningPlatformData: null,

    scoringVersion: result.scoringVersion,
    lastScoredAt: new Date(),
    confidence: 1,
  });
}

export async function persistTechnicalDepthScore(
  userId: string,
  profileId: string,
  result: ComputedAdvancedScore,
) {
  const score = ensureScore(result);

  return saveTechnicalDepthScore({
    userId,
    profileId,

    overallTechnicalScore: score,
    technicalTier: result.tier ?? 'SURFACE',

    codeQualityScore: result.components.projectDepth ?? 0,
    codeComplexityHandled: 'FROM_STORED_PROJECT_DATA',
    codingPatterns: null,

    bestPracticesScore: result.components.experienceDepth ?? 0,
    testingPractices: 0,

    githubScore: null,
    totalContributions: null,
    consistencyScore: null,
    repositoryQuality: null,
    openSourceImpact: null,

    languageProficiency: result.inputs.skills ?? null,

    stackOverflowScore: null,
    reputation: null,
    answerQuality: null,
    topTags: [],
    acceptedAnswerRate: null,
    helpfulnessScore: null,

    projectComplexityScore: result.components.projectDepth ?? 0,

    architectureExperience: null,
    systemDesignCapability: result.components.experienceDepth ?? 0,
    scalabilityExperience: null,

    primaryStack: Array.isArray(result.inputs.skills)
      ? result.inputs.skills
          .map((skill: any) => skill.name)
          .filter(Boolean)
      : [],

    stackDepth: {
      skillDepth: result.components.skillDepth,
      experienceDepth: result.components.experienceDepth,
      projectDepth: result.components.projectDepth,
    },

    stackBreadth: Array.isArray(result.inputs.skills)
      ? result.inputs.skills.length
      : 0,

    modernTechAdoption: result.components.projectDepth ?? 0,

    domainExpertise: result.inputs.experience ?? null,

    specializations: [],

    industryExperience: result.inputs.experience ?? null,

    algorithmProficiency: null,
    dataStructureSkills: null,

    debuggingAbility: result.components.experienceDepth ?? 0,
    optimizationSkills: null,
    technicalLeadership: 0,

    architectureDecisions: null,
    mentorshipEvidence: null,
    codeReviewActivity: null,

    relevantCertifications: result.inputs.certifications ?? null,

    certificationScore: result.components.certificationScore ?? 0,

    technicalStrengths: [],
    technicalGaps: [],
    recommendations: [
      'Computed from stored skills, experience, projects and certifications.',
    ],

    technicalSummary:
      'AI-12 deterministic technical depth score using stored candidate data.',

    marketPercentile: null,
    similarProfiles: null,

    analyzedRepos: null,
    analyzedProjects: result.inputs.projects ?? null,

    lastGithubSync: null,
    lastStackOverflowSync: null,

    scoringVersion: result.scoringVersion,
    lastScoredAt: new Date(),
    confidence: 1,
  });
}

export async function persistCommunicationScore(
  userId: string,
  profileId: string,
  result: ComputedAdvancedScore,
) {
  const score = ensureScore(result);

  return saveCommunicationScore({
    userId,
    profileId,

    overallCommScore: score,
    communicationTier: result.tier ?? 'DEVELOPING',

    writtenScore: result.components.profileScore ?? 0,
    writingClarity: result.components.profileScore ?? 0,
    writingConciseness: result.components.profileScore ?? 0,
    grammarAccuracy: result.components.profileScore ?? 0,
    professionalTone: result.components.profileScore ?? 0,
    structureOrganization: result.components.profileScore ?? 0,

    writingSamples: result.inputs.profileText ?? null,

    vocabularyLevel: 'FROM_STORED_TEXT',
    technicalWriting: result.components.experienceScore ?? 0,
    persuasiveWriting: result.components.applicationScore ?? 0,

    verbalScore: result.components.interviewScore ?? null,
    articulationClarity: result.components.interviewScore ?? null,
    responseStructure: result.components.interviewScore ?? null,
    activeListening: null,
    questionHandling: null,

    interviewCommunication: result.inputs.interviewText ?? null,

    presentationSkills: null,
    explanationAbility: result.components.projectScore ?? 0,
    technicalExplanation: result.components.projectScore ?? 0,

    emailProfessionalism: null,
    responsiveness: result.components.messageScore ?? 0,
    followUpQuality: result.components.messageScore ?? null,
    negotiationSkills: null,

    languageProficiencies: null,
    primaryLanguage: 'English',

    crossCulturalAwareness: null,
    collaborationComm: result.components.experienceScore ?? 0,
    feedbackDelivery: result.components.interviewScore ?? null,
    feedbackReception: null,
    conflictCommunication: null,

    profileWritingQuality: result.components.profileScore ?? 0,
    projectDescriptions: result.components.projectScore ?? 0,
    experienceArticulation: result.components.experienceScore ?? 0,

    publicSpeaking: null,
    contentCreation: null,
    socialMediaProfessionalism: null,

    communicationStrengths: [],
    communicationGaps: [],
    developmentAreas: [],

    recommendations: [
      'Computed from stored profile, experience, project and communication records.',
    ],

    commSummary:
      'AI-12 deterministic communication score using stored candidate data.',

    analyzedDocuments: {
      profile: result.inputs.profileText ?? [],
      experience: result.inputs.experienceText ?? [],
      projects: result.inputs.projectText ?? [],
      applications: result.inputs.applicationText ?? [],
    },

    interviewTranscripts: result.inputs.interviewText ?? null,

    emailSamples: null,

    scoringVersion: result.scoringVersion,
    lastScoredAt: new Date(),
    confidence: 1,
  });
}

export async function persistReliabilityScore(
  userId: string,
  profileId: string,
  result: ComputedAdvancedScore,
) {
  const score = ensureScore(result);

  const interviewHistory =
    (result.inputs.interviewHistory as any[]) ?? [];

  const noShowCount = interviewHistory.filter(
    (interview) =>
      String(interview.status).toLowerCase() === 'no_show',
  ).length;

  const rescheduleCount = interviewHistory.filter(
    (interview) =>
      String(interview.status).toLowerCase() === 'rescheduled',
  ).length;

  return saveReliabilityScore({
    userId,
    profileId,

    overallReliabilityScore: score,
    reliabilityTier: result.tier ?? 'MODERATELY_RELIABLE',

    applicationCompletion:
      result.components.applicationScore ?? 0,

    profileCompleteness:
      result.components.profileCompletionScore ?? 0,

    documentSubmission:
      result.components.applicationScore ?? 0,

    deadlineAdherence:
      result.components.applicationScore ?? 0,

    responseRate:
      result.components.responseScore ?? 0,

    averageResponseTime: 0,
    responseTimeConsistency: 0,

    responseQuality:
      result.components.responseScore ?? 0,

    interviewAttendance:
      result.components.interviewAttendanceScore ?? 0,

    punctualityScore:
      result.components.interviewAttendanceScore ?? 0,

    rescheduleRate:
      interviewHistory.length
        ? rescheduleCount / interviewHistory.length * 100
        : 0,

    noShowCount,

    lastMinuteCancellations: 0,

    engagementConsistency:
      result.components.responseScore ?? 0,

    followThroughRate:
      result.components.applicationScore ?? 0,

    processAdherence:
      result.components.applicationScore ?? 0,

    loginConsistency: null,
    profileUpdateFrequency: null,

    applicationActivity:
      result.inputs.applicationHistory ?? null,

    applicationHistory:
      result.inputs.applicationHistory ?? null,

    withdrawalPatterns: null,

    ghostingIncidents: 0,

    longTermCommitment:
      result.components.applicationScore ?? 0,

    jobHoppingRisk:
      result.components.applicationScore >= 70
        ? 'LOW'
        : 'REVIEW',

    averageTenure: null,

    careerStability:
      result.components.applicationScore ?? 0,

    referenceAvailability: null,
    referenceQuality: null,
    employerRelationships: null,

    verificationCompliance:
      result.components.applicationScore ?? 0,

    documentAuthenticity: null,
    backgroundCheckStatus: null,

    reliabilityRisks: {},
    redFlags: [],
    greenFlags: [],

    reliabilityDrivers: {
      components: result.components,
      scoringVersion: result.scoringVersion,
    },

    concernAreas: [],

    recommendations: [
      'Computed from stored application, interview and engagement records.',
    ],

    reliabilitySummary:
      'AI-12 deterministic reliability score using stored candidate activity.',

    reliabilityTrend: 'STORED_ACTIVITY',

    trendData: {
      applicationScore: result.components.applicationScore,
      interviewAttendanceScore:
        result.components.interviewAttendanceScore,
      responseScore: result.components.responseScore,
      profileCompletionScore:
        result.components.profileCompletionScore,
    },

    dataPoints:
      interviewHistory.length +
      ((result.inputs.applicationHistory as any[]) ?? []).length,

    confidenceLevel: 'HIGH',

    scoringVersion: result.scoringVersion,
    lastScoredAt: new Date(),
    confidence: 1,
  });
}

// ============================================================
// Persist all five scores
// ============================================================

export async function computeAndPersistAllAdvancedScores(
  userId: string,
  jobId?: string | null,
  companyId?: string | null,
) {
  const result = await computeAllAdvancedScores(userId, jobId);

  const profileId = result.data.profile?.id;

  if (!profileId) {
    throw new Error(
      `Candidate profile not found for user ${userId}.`,
    );
  }

  const persisted: Record<string, unknown> = {};

  if (result.cultureFit.status === 'COMPLETE') {
    persisted.cultureFit = await persistCultureFitScore(
      userId,
      profileId,
      result.cultureFit,
      companyId,
      jobId,
    );
  }

  if (result.growthPotential.status === 'COMPLETE') {
    persisted.growthPotential =
      await persistGrowthPotentialScore(
        userId,
        profileId,
        result.growthPotential,
      );
  }

  if (result.technicalDepth.status === 'COMPLETE') {
    persisted.technicalDepth =
      await persistTechnicalDepthScore(
        userId,
        profileId,
        result.technicalDepth,
      );
  }

  if (result.communication.status === 'COMPLETE') {
    persisted.communication =
      await persistCommunicationScore(
        userId,
        profileId,
        result.communication,
      );
  }

  if (result.reliability.status === 'COMPLETE') {
    persisted.reliability =
      await persistReliabilityScore(
        userId,
        profileId,
        result.reliability,
      );
  }

  return {
    ...result,
    persisted,
  };
}