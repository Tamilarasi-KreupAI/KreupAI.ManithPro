import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

// Default achievement definitions to seed
const defaultAchievements = [
  // Profile Achievements
  {
    name: 'profile_starter',
    title: 'Profile Starter',
    description: 'Complete your basic profile information',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'profileCompleteness', operator: 'gte', value: 20 },
    targetValue: 1,
    points: 10,
    badgeIcon: 'user',
    badgeColor: 'blue',
    tier: 'bronze',
  },
  {
    name: 'profile_builder',
    title: 'Profile Builder',
    description: 'Complete 50% of your profile',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'profileCompleteness', operator: 'gte', value: 50 },
    targetValue: 1,
    points: 25,
    badgeIcon: 'user-check',
    badgeColor: 'green',
    tier: 'silver',
  },
  {
    name: 'profile_master',
    title: 'Profile Master',
    description: 'Complete your entire profile',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'profileCompleteness', operator: 'gte', value: 100 },
    targetValue: 1,
    points: 50,
    badgeIcon: 'award',
    badgeColor: 'gold',
    tier: 'gold',
  },
  // Skills Achievements
  {
    name: 'skill_collector',
    title: 'Skill Collector',
    description: 'Add your first 5 skills',
    category: 'skill',
    type: 'progressive',
    criteria: { field: 'skillsCount', operator: 'gte', value: 5 },
    targetValue: 5,
    points: 15,
    badgeIcon: 'code',
    badgeColor: 'purple',
    tier: 'bronze',
  },
  {
    name: 'skill_enthusiast',
    title: 'Skill Enthusiast',
    description: 'Add 15 skills to your profile',
    category: 'skill',
    type: 'progressive',
    criteria: { field: 'skillsCount', operator: 'gte', value: 15 },
    targetValue: 15,
    points: 30,
    badgeIcon: 'code',
    badgeColor: 'indigo',
    tier: 'silver',
  },
  {
    name: 'skill_expert',
    title: 'Skill Expert',
    description: 'Add 30 skills to your profile',
    category: 'skill',
    type: 'progressive',
    criteria: { field: 'skillsCount', operator: 'gte', value: 30 },
    targetValue: 30,
    points: 50,
    badgeIcon: 'star',
    badgeColor: 'yellow',
    tier: 'gold',
  },
  {
    name: 'endorsed',
    title: 'Endorsed',
    description: 'Receive your first skill endorsement',
    category: 'social',
    type: 'one_time',
    criteria: { field: 'endorsementCount', operator: 'gte', value: 1 },
    targetValue: 1,
    points: 20,
    badgeIcon: 'thumbs-up',
    badgeColor: 'teal',
    tier: 'bronze',
  },
  {
    name: 'highly_endorsed',
    title: 'Highly Endorsed',
    description: 'Receive 10 skill endorsements',
    category: 'social',
    type: 'progressive',
    criteria: { field: 'endorsementCount', operator: 'gte', value: 10 },
    targetValue: 10,
    points: 40,
    badgeIcon: 'heart',
    badgeColor: 'red',
    tier: 'silver',
  },
  // Experience Achievements
  {
    name: 'experience_starter',
    title: 'Career Journey',
    description: 'Add your first work experience',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'experienceCount', operator: 'gte', value: 1 },
    targetValue: 1,
    points: 15,
    badgeIcon: 'briefcase',
    badgeColor: 'gray',
    tier: 'bronze',
  },
  {
    name: 'experienced_pro',
    title: 'Experienced Professional',
    description: 'Add 3 work experiences',
    category: 'profile',
    type: 'progressive',
    criteria: { field: 'experienceCount', operator: 'gte', value: 3 },
    targetValue: 3,
    points: 30,
    badgeIcon: 'briefcase',
    badgeColor: 'blue',
    tier: 'silver',
  },
  // Education Achievements
  {
    name: 'scholar',
    title: 'Scholar',
    description: 'Add your education details',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'educationCount', operator: 'gte', value: 1 },
    targetValue: 1,
    points: 15,
    badgeIcon: 'graduation-cap',
    badgeColor: 'blue',
    tier: 'bronze',
  },
  // Certification Achievements
  {
    name: 'certified',
    title: 'Certified Professional',
    description: 'Add your first certification',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'certificationCount', operator: 'gte', value: 1 },
    targetValue: 1,
    points: 20,
    badgeIcon: 'certificate',
    badgeColor: 'orange',
    tier: 'bronze',
  },
  {
    name: 'certification_collector',
    title: 'Certification Collector',
    description: 'Add 5 certifications',
    category: 'profile',
    type: 'progressive',
    criteria: { field: 'certificationCount', operator: 'gte', value: 5 },
    targetValue: 5,
    points: 40,
    badgeIcon: 'certificate',
    badgeColor: 'yellow',
    tier: 'gold',
  },
  // Project Achievements
  {
    name: 'project_creator',
    title: 'Project Creator',
    description: 'Add your first project',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'projectCount', operator: 'gte', value: 1 },
    targetValue: 1,
    points: 20,
    badgeIcon: 'folder',
    badgeColor: 'cyan',
    tier: 'bronze',
  },
  {
    name: 'portfolio_builder',
    title: 'Portfolio Builder',
    description: 'Add 5 projects to your portfolio',
    category: 'profile',
    type: 'progressive',
    criteria: { field: 'projectCount', operator: 'gte', value: 5 },
    targetValue: 5,
    points: 40,
    badgeIcon: 'folder-open',
    badgeColor: 'blue',
    tier: 'silver',
  },
  // Integration Achievements
  {
    name: 'github_connected',
    title: 'GitHub Connected',
    description: 'Connect your GitHub account',
    category: 'social',
    type: 'one_time',
    criteria: { field: 'githubConnected', operator: 'eq', value: true },
    targetValue: 1,
    points: 25,
    badgeIcon: 'github',
    badgeColor: 'gray',
    tier: 'silver',
  },
  {
    name: 'linkedin_connected',
    title: 'LinkedIn Connected',
    description: 'Connect your LinkedIn account',
    category: 'social',
    type: 'one_time',
    criteria: { field: 'linkedinConnected', operator: 'eq', value: true },
    targetValue: 1,
    points: 25,
    badgeIcon: 'linkedin',
    badgeColor: 'blue',
    tier: 'silver',
  },
  // Activity Achievements
  {
    name: 'first_application',
    title: 'First Step',
    description: 'Submit your first job application',
    category: 'activity',
    type: 'one_time',
    criteria: { field: 'applicationCount', operator: 'gte', value: 1 },
    targetValue: 1,
    points: 15,
    badgeIcon: 'send',
    badgeColor: 'green',
    tier: 'bronze',
  },
  {
    name: 'active_applicant',
    title: 'Active Applicant',
    description: 'Submit 10 job applications',
    category: 'activity',
    type: 'progressive',
    criteria: { field: 'applicationCount', operator: 'gte', value: 10 },
    targetValue: 10,
    points: 30,
    badgeIcon: 'send',
    badgeColor: 'blue',
    tier: 'silver',
  },
  // Milestone Achievements
  {
    name: 'early_adopter',
    title: 'Early Adopter',
    description: 'Be among the first 1000 users',
    category: 'milestone',
    type: 'one_time',
    criteria: { field: 'userNumber', operator: 'lte', value: 1000 },
    targetValue: 1,
    points: 100,
    badgeIcon: 'rocket',
    badgeColor: 'purple',
    tier: 'platinum',
  },
  {
    name: 'verified_profile',
    title: 'Verified Professional',
    description: 'Get your work experience verified',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'verifiedExperience', operator: 'gte', value: 1 },
    targetValue: 1,
    points: 50,
    badgeIcon: 'check-circle',
    badgeColor: 'green',
    tier: 'gold',
  },
];

// Seed achievement definitions
export const seedAchievementDefinitions = async (req: Request, res: Response) => {
  try {
    const results = [];

    for (const achievement of defaultAchievements) {
      const result = await prisma.achievementDefinition.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement,
      });
      results.push(result);
    }

    res.json({
      message: 'Achievement definitions seeded successfully',
      count: results.length,
      achievements: results,
    });
  } catch (error) {
    console.error('Error seeding achievement definitions:', error);
    res.status(500).json({ error: 'Failed to seed achievement definitions' });
  }
};

// Get all achievement definitions
export const getAchievementDefinitions = async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const definitions = await prisma.achievementDefinition.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
      ],
    });

    // Group by category
    const groupedByCategory = definitions.reduce((acc: any, def) => {
      if (!acc[def.category]) {
        acc[def.category] = [];
      }
      acc[def.category].push(def);
      return acc;
    }, {});

    res.json({
      total: definitions.length,
      categories: Object.keys(groupedByCategory),
      definitions: groupedByCategory,
    });
  } catch (error) {
    console.error('Error getting achievement definitions:', error);
    res.status(500).json({ error: 'Failed to get achievement definitions' });
  }
};

// ============================================
// USER ACHIEVEMENTS
// ============================================

// Get user achievements
export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user's profile
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        achievements: {
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get all achievement definitions
    const definitions = await prisma.achievementDefinition.findMany({
      where: { isActive: true },
    });

    // Calculate total points
    const totalPoints = profile.achievements
      .filter(a => a.isCompleted)
      .reduce((sum, a) => sum + a.points, 0);

    // Separate earned and unearned achievements
    const earnedIds = new Set(profile.achievements.filter(a => a.isCompleted).map(a => `${a.type}-${a.category}`));

    const earned = profile.achievements.filter(a => a.isCompleted);
    const inProgress = profile.achievements.filter(a => !a.isCompleted);
    const locked = definitions.filter(d => !earnedIds.has(`${d.type}-${d.category}`));

    res.json({
      totalPoints,
      totalEarned: earned.length,
      totalAvailable: definitions.length,
      achievements: {
        earned,
        inProgress,
        locked: locked.map(d => ({
          ...d,
          isLocked: true,
        })),
      },
    });
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({ error: 'Failed to get user achievements' });
  }
};

// Check and update achievements for a user
export const checkAndUpdateAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const newlyEarned = await processAchievements(userId);

    res.json({
      message: 'Achievements checked successfully',
      newlyEarned,
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
};

// Process achievements for a user (internal function)
export const processAchievements = async (userId: string) => {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      workExperiences: true,
      educations: true,
      certifications: true,
      skills: {
        include: { endorsements: true },
      },
      projects: true,
      achievements: true,
      githubProfile: true,
      linkedInProfile: true,
    },
  });

  if (!profile) return [];

  // Calculate metrics
  const metrics = {
    profileCompleteness: profile.completenessScore,
    skillsCount: profile.skills.length,
    endorsementCount: profile.skills.reduce((sum, s) => sum + s.endorsementCount, 0),
    experienceCount: profile.workExperiences.length,
    educationCount: profile.educations.length,
    certificationCount: profile.certifications.length,
    projectCount: profile.projects.length,
    githubConnected: !!profile.githubProfile,
    linkedinConnected: !!profile.linkedInProfile,
    verifiedExperience: profile.workExperiences.filter(e => e.verificationStatus === 'VERIFIED').length,
  };

  // Get all active definitions
  const definitions = await prisma.achievementDefinition.findMany({
    where: { isActive: true },
  });

  const newlyEarned: any[] = [];

  for (const definition of definitions) {
    // Check if already earned
    const existing = profile.achievements.find(
      a => a.type === definition.type && a.category === definition.category
    );

    if (existing?.isCompleted) continue;

    // Evaluate criteria
    const { field, operator, value } = definition.criteria as any;
    const currentValue = metrics[field as keyof typeof metrics];

    let isEarned = false;
    let currentProgress = 0;

    if (typeof currentValue === 'boolean') {
      isEarned = currentValue === value;
      currentProgress = isEarned ? 1 : 0;
    } else if (typeof currentValue === 'number') {
      currentProgress = currentValue;
      switch (operator) {
        case 'gte':
          isEarned = currentValue >= value;
          break;
        case 'lte':
          isEarned = currentValue <= value;
          break;
        case 'eq':
          isEarned = currentValue === value;
          break;
      }
    }

    // Update or create achievement
    const achievementData = {
      title: definition.title,
      description: definition.description,
      type: definition.type,
      category: definition.category,
      badgeIcon: definition.badgeIcon,
      badgeColor: definition.badgeColor,
      points: definition.points,
      currentProgress,
      targetProgress: definition.targetValue,
      isCompleted: isEarned,
      earnedAt: isEarned ? new Date() : null,
    };

    if (existing) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: achievementData,
      });
    } else {
      await prisma.achievement.create({
        data: {
          ...achievementData,
          profileId: profile.id,
        },
      });
    }

    if (isEarned && !existing?.isCompleted) {
      newlyEarned.push({
        title: definition.title,
        points: definition.points,
        tier: definition.tier,
      });
    }
  }

  return newlyEarned;
};

// Get achievement leaderboard
export const getAchievementLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // This is a simplified leaderboard - in production, you'd want to cache this
    const profiles = await prisma.candidateProfile.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
        achievements: {
          where: { isCompleted: true },
        },
      },
    });

    const leaderboard = profiles
      .map(profile => ({
        userId: profile.userId,
        name: `${profile.user.firstName} ${profile.user.lastName}`,
        headline: profile.headline,
        totalPoints: profile.achievements.reduce((sum, a) => sum + a.points, 0),
        achievementCount: profile.achievements.length,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, Number(limit));

    res.json({
      leaderboard,
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

// Get achievement statistics
export const getAchievementStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        achievements: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const definitions = await prisma.achievementDefinition.findMany({
      where: { isActive: true },
    });

    const completedAchievements = profile.achievements.filter(a => a.isCompleted);
    const totalPoints = completedAchievements.reduce((sum, a) => sum + a.points, 0);
    const maxPossiblePoints = definitions.reduce((sum, d) => sum + d.points, 0);

    // Group by category
    const byCategory = definitions.reduce((acc: any, def) => {
      if (!acc[def.category]) {
        acc[def.category] = { total: 0, earned: 0, points: 0 };
      }
      acc[def.category].total++;
      return acc;
    }, {});

    completedAchievements.forEach(a => {
      if (byCategory[a.category]) {
        byCategory[a.category].earned++;
        byCategory[a.category].points += a.points;
      }
    });

    // Calculate tier distribution
    const tierCounts = {
      platinum: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
    };

    completedAchievements.forEach(a => {
      const def = definitions.find(d => d.type === a.type && d.category === a.category);
      if (def?.tier) {
        tierCounts[def.tier as keyof typeof tierCounts]++;
      }
    });

    res.json({
      totalPoints,
      maxPossiblePoints,
      progressPercentage: Math.round((totalPoints / maxPossiblePoints) * 100),
      earnedCount: completedAchievements.length,
      totalAvailable: definitions.length,
      byCategory,
      tierDistribution: tierCounts,
      recentAchievements: completedAchievements
        .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
        .slice(0, 5),
    });
  } catch (error) {
    console.error('Error getting achievement stats:', error);
    res.status(500).json({ error: 'Failed to get achievement stats' });
  }
};
