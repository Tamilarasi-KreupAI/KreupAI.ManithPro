import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { processAchievements } from './achievements.controller';

const prisma = new PrismaClient();

// ============================================
// GITHUB INTEGRATION (Feature 1.2.1)
// ============================================

// Get GitHub OAuth URL
export const getGithubAuthUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.FRONTEND_URL}/integrations/github/callback`;
    const scope = 'read:user user:email repo';
    const state = Buffer.from(JSON.stringify({ userId: (req as any).user.id })).toString('base64');

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating GitHub auth URL:', error);
    res.status(500).json({ error: 'Failed to generate GitHub auth URL' });
  }
};

// GitHub OAuth callback
export const githubCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // In production, exchange code for access token
    // For now, we'll simulate the OAuth flow

    // Decode state to get user ID
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = stateData.userId;
    } catch {
      userId = (req as any).user.id;
    }

    // Get user's profile
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // In production, you would:
    // 1. Exchange code for access token using GitHub API
    // 2. Fetch user data from GitHub
    // 3. Store the access token securely (encrypted)

    // For demo purposes, we'll create a mock GitHub profile
    // In production, replace this with actual GitHub API calls

    const mockGithubData = {
      githubId: `gh_${Date.now()}`,
      username: 'demo_user',
      displayName: 'Demo User',
      avatarUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      profileUrl: 'https://github.com/demo_user',
      bio: 'Full-stack developer passionate about open source',
      company: 'Tech Company',
      location: 'San Francisco, CA',
      blog: 'https://blog.example.com',
      email: 'demo@example.com',
      publicRepos: 42,
      totalStars: 156,
      followers: 234,
      following: 89,
      totalContributions: 1523,
      contributionsLastYear: 847,
      longestStreak: 45,
      currentStreak: 12,
    };

    const githubProfile = await prisma.githubProfile.upsert({
      where: { profileId: profile.id },
      update: {
        ...mockGithubData,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
      create: {
        profileId: profile.id,
        ...mockGithubData,
        status: 'CONNECTED',
        connectedAt: new Date(),
        lastSyncAt: new Date(),
      },
    });

    // Check for GitHub achievement
    await processAchievements(userId);

    res.json({
      message: 'GitHub connected successfully',
      profile: {
        id: githubProfile.id,
        username: githubProfile.username,
        displayName: githubProfile.displayName,
        avatarUrl: githubProfile.avatarUrl,
        profileUrl: githubProfile.profileUrl,
        publicRepos: githubProfile.publicRepos,
        totalStars: githubProfile.totalStars,
        followers: githubProfile.followers,
        status: githubProfile.status,
      },
    });
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    res.status(500).json({ error: 'Failed to connect GitHub' });
  }
};

// Get connected GitHub profile
export const getGithubProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        githubProfile: {
          include: {
            repositories: {
              where: { isShowcased: true },
              orderBy: { stars: 'desc' },
              take: 6,
            },
          },
        },
      },
    });

    if (!profile?.githubProfile) {
      return res.status(404).json({ error: 'GitHub not connected' });
    }

    // Remove sensitive data
    const { accessToken, refreshToken, ...safeProfile } = profile.githubProfile;

    res.json(safeProfile);
  } catch (error) {
    console.error('Error getting GitHub profile:', error);
    res.status(500).json({ error: 'Failed to get GitHub profile' });
  }
};

// Sync GitHub data
export const syncGithubProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { githubProfile: true },
    });

    if (!profile?.githubProfile) {
      return res.status(404).json({ error: 'GitHub not connected' });
    }

    // In production, you would:
    // 1. Use the stored access token to fetch fresh data from GitHub API
    // 2. Update the stored data

    // Simulate sync with updated mock data
    const updatedProfile = await prisma.githubProfile.update({
      where: { id: profile.githubProfile.id },
      data: {
        lastSyncAt: new Date(),
        syncError: null,
        // In production, update with fresh data from GitHub API
        contributionsLastYear: profile.githubProfile.contributionsLastYear + Math.floor(Math.random() * 10),
        currentStreak: profile.githubProfile.currentStreak + 1,
      },
    });

    res.json({
      message: 'GitHub profile synced successfully',
      lastSyncAt: updatedProfile.lastSyncAt,
    });
  } catch (error) {
    console.error('Error syncing GitHub profile:', error);
    res.status(500).json({ error: 'Failed to sync GitHub profile' });
  }
};

// Get GitHub repositories
export const getGithubRepositories = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { language, showcased, page = 1, limit = 20 } = req.query;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { githubProfile: true },
    });

    if (!profile?.githubProfile) {
      return res.status(404).json({ error: 'GitHub not connected' });
    }

    const where: any = { githubProfileId: profile.githubProfile.id };
    if (language) where.language = language;
    if (showcased === 'true') where.isShowcased = true;

    const [repositories, total] = await Promise.all([
      prisma.githubRepository.findMany({
        where,
        orderBy: { stars: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.githubRepository.count({ where }),
    ]);

    // Get unique languages for filtering
    const languages = await prisma.githubRepository.groupBy({
      by: ['language'],
      where: { githubProfileId: profile.githubProfile.id },
      _count: true,
    });

    res.json({
      repositories,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      languages: languages.filter(l => l.language).map(l => ({
        name: l.language,
        count: l._count,
      })),
    });
  } catch (error) {
    console.error('Error getting GitHub repositories:', error);
    res.status(500).json({ error: 'Failed to get GitHub repositories' });
  }
};

// Toggle repository showcase status
export const toggleRepositoryShowcase = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { repoId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { githubProfile: true },
    });

    if (!profile?.githubProfile) {
      return res.status(404).json({ error: 'GitHub not connected' });
    }

    const repo = await prisma.githubRepository.findFirst({
      where: {
        id: repoId,
        githubProfileId: profile.githubProfile.id,
      },
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const updatedRepo = await prisma.githubRepository.update({
      where: { id: repoId },
      data: { isShowcased: !repo.isShowcased },
    });

    res.json({
      message: updatedRepo.isShowcased ? 'Repository added to showcase' : 'Repository removed from showcase',
      isShowcased: updatedRepo.isShowcased,
    });
  } catch (error) {
    console.error('Error toggling repository showcase:', error);
    res.status(500).json({ error: 'Failed to update repository' });
  }
};

// Disconnect GitHub
export const disconnectGithub = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { githubProfile: true },
    });

    if (!profile?.githubProfile) {
      return res.status(404).json({ error: 'GitHub not connected' });
    }

    // Delete GitHub profile and all repositories
    await prisma.githubProfile.delete({
      where: { id: profile.githubProfile.id },
    });

    res.json({ message: 'GitHub disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting GitHub:', error);
    res.status(500).json({ error: 'Failed to disconnect GitHub' });
  }
};

// ============================================
// LINKEDIN INTEGRATION (Feature 1.2.2)
// ============================================

// Get LinkedIn OAuth URL
export const getLinkedInAuthUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.FRONTEND_URL}/integrations/linkedin/callback`;
    const scope = 'r_liteprofile r_emailaddress w_member_social';
    const state = Buffer.from(JSON.stringify({ userId: (req as any).user.id })).toString('base64');

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating LinkedIn auth URL:', error);
    res.status(500).json({ error: 'Failed to generate LinkedIn auth URL' });
  }
};

// LinkedIn OAuth callback
export const linkedInCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Decode state to get user ID
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = stateData.userId;
    } catch {
      userId = (req as any).user.id;
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // In production, exchange code for access token and fetch profile
    // For demo, create mock LinkedIn data

    const mockLinkedInData = {
      linkedInId: `li_${Date.now()}`,
      vanityName: 'demo-user',
      profileUrl: 'https://www.linkedin.com/in/demo-user',
      firstName: 'Demo',
      lastName: 'User',
      headline: 'Senior Software Engineer at Tech Company',
      summary: 'Passionate software engineer with 10+ years of experience in building scalable web applications.',
      profilePicture: 'https://media.licdn.com/dms/image/placeholder.jpg',
      location: 'San Francisco Bay Area',
      country: 'United States',
      currentCompany: 'Tech Company',
      currentTitle: 'Senior Software Engineer',
      industry: 'Computer Software',
      connections: 500,
      followersCount: 1250,
      positions: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Company',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          isCurrent: true,
          description: 'Leading development of microservices architecture',
        },
        {
          title: 'Software Engineer',
          company: 'Startup Inc',
          location: 'San Francisco, CA',
          startDate: '2017-06',
          endDate: '2019-12',
          description: 'Full-stack development with React and Node.js',
        },
      ],
      education: [
        {
          school: 'Stanford University',
          degree: 'Master of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2015',
          endDate: '2017',
        },
        {
          school: 'UC Berkeley',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2011',
          endDate: '2015',
        },
      ],
      skills: [
        { name: 'JavaScript', endorsements: 45 },
        { name: 'React', endorsements: 38 },
        { name: 'Node.js', endorsements: 32 },
        { name: 'Python', endorsements: 28 },
        { name: 'AWS', endorsements: 25 },
      ],
    };

    const linkedInProfile = await prisma.linkedInProfile.upsert({
      where: { profileId: profile.id },
      update: {
        ...mockLinkedInData,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
        isVerified: true,
        verifiedAt: new Date(),
      },
      create: {
        profileId: profile.id,
        ...mockLinkedInData,
        status: 'CONNECTED',
        connectedAt: new Date(),
        lastSyncAt: new Date(),
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Check for LinkedIn achievement
    await processAchievements(userId);

    res.json({
      message: 'LinkedIn connected successfully',
      profile: {
        id: linkedInProfile.id,
        firstName: linkedInProfile.firstName,
        lastName: linkedInProfile.lastName,
        headline: linkedInProfile.headline,
        profilePicture: linkedInProfile.profilePicture,
        profileUrl: linkedInProfile.profileUrl,
        connections: linkedInProfile.connections,
        isVerified: linkedInProfile.isVerified,
      },
    });
  } catch (error) {
    console.error('Error in LinkedIn callback:', error);
    res.status(500).json({ error: 'Failed to connect LinkedIn' });
  }
};

// Get connected LinkedIn profile
export const getLinkedInProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { linkedInProfile: true },
    });

    if (!profile?.linkedInProfile) {
      return res.status(404).json({ error: 'LinkedIn not connected' });
    }

    // Remove sensitive data
    const { accessToken, refreshToken, ...safeProfile } = profile.linkedInProfile;

    res.json(safeProfile);
  } catch (error) {
    console.error('Error getting LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn profile' });
  }
};

// Sync LinkedIn data
export const syncLinkedInProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { linkedInProfile: true },
    });

    if (!profile?.linkedInProfile) {
      return res.status(404).json({ error: 'LinkedIn not connected' });
    }

    // In production, fetch fresh data from LinkedIn API

    const updatedProfile = await prisma.linkedInProfile.update({
      where: { id: profile.linkedInProfile.id },
      data: {
        lastSyncAt: new Date(),
        syncError: null,
      },
    });

    res.json({
      message: 'LinkedIn profile synced successfully',
      lastSyncAt: updatedProfile.lastSyncAt,
    });
  } catch (error) {
    console.error('Error syncing LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to sync LinkedIn profile' });
  }
};

// Import LinkedIn data to profile
export const importLinkedInData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { importWorkHistory, importEducation, importSkills } = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { linkedInProfile: true },
    });

    if (!profile?.linkedInProfile) {
      return res.status(404).json({ error: 'LinkedIn not connected' });
    }

    const linkedIn = profile.linkedInProfile;
    const importResults: any = {};

    // Import work history
    if (importWorkHistory && linkedIn.positions) {
      const positions = linkedIn.positions as any[];
      for (const position of positions) {
        await prisma.workExperience.create({
          data: {
            profileId: profile.id,
            companyName: position.company,
            title: position.title,
            location: position.location,
            employmentType: 'FULL_TIME',
            startDate: new Date(position.startDate),
            endDate: position.endDate ? new Date(position.endDate) : null,
            isCurrent: position.isCurrent || false,
            description: position.description,
            verificationStatus: 'VERIFIED',
            verificationMethod: 'linkedin',
          },
        });
      }
      importResults.workHistory = positions.length;
    }

    // Import education
    if (importEducation && linkedIn.education) {
      const educations = linkedIn.education as any[];
      for (const edu of educations) {
        await prisma.education.create({
          data: {
            profileId: profile.id,
            institutionName: edu.school,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: new Date(`${edu.startDate}-01-01`),
            endDate: edu.endDate ? new Date(`${edu.endDate}-01-01`) : null,
            verificationStatus: 'VERIFIED',
            verificationMethod: 'linkedin',
          },
        });
      }
      importResults.education = educations.length;
    }

    // Import skills
    if (importSkills && linkedIn.skills) {
      const skills = linkedIn.skills as any[];
      for (const skill of skills) {
        await prisma.candidateSkill.upsert({
          where: {
            profileId_name: {
              profileId: profile.id,
              name: skill.name,
            },
          },
          update: {
            endorsementCount: skill.endorsements || 0,
          },
          create: {
            profileId: profile.id,
            name: skill.name,
            endorsementCount: skill.endorsements || 0,
            proficiencyLevel: 7, // Default to advanced
            proficiencyLabel: 'ADVANCED',
          },
        });
      }
      importResults.skills = skills.length;
    }

    // Update import settings
    await prisma.linkedInProfile.update({
      where: { id: linkedIn.id },
      data: {
        importWorkHistory,
        importEducation,
        importSkills,
      },
    });

    res.json({
      message: 'LinkedIn data imported successfully',
      imported: importResults,
    });
  } catch (error) {
    console.error('Error importing LinkedIn data:', error);
    res.status(500).json({ error: 'Failed to import LinkedIn data' });
  }
};

// Disconnect LinkedIn
export const disconnectLinkedIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { linkedInProfile: true },
    });

    if (!profile?.linkedInProfile) {
      return res.status(404).json({ error: 'LinkedIn not connected' });
    }

    await prisma.linkedInProfile.delete({
      where: { id: profile.linkedInProfile.id },
    });

    res.json({ message: 'LinkedIn disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting LinkedIn:', error);
    res.status(500).json({ error: 'Failed to disconnect LinkedIn' });
  }
};

// ============================================
// INTEGRATION STATUS
// ============================================

// Get all integration statuses
export const getIntegrationStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        githubProfile: {
          select: {
            id: true,
            username: true,
            status: true,
            lastSyncAt: true,
            syncError: true,
          },
        },
        linkedInProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
            lastSyncAt: true,
            syncError: true,
            isVerified: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      github: profile.githubProfile
        ? {
            connected: true,
            ...profile.githubProfile,
          }
        : { connected: false },
      linkedin: profile.linkedInProfile
        ? {
            connected: true,
            ...profile.linkedInProfile,
          }
        : { connected: false },
    });
  } catch (error) {
    console.error('Error getting integration status:', error);
    res.status(500).json({ error: 'Failed to get integration status' });
  }
};
