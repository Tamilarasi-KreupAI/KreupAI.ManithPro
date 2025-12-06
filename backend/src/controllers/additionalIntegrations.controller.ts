import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { processAchievements } from './achievements.controller';

const prisma = new PrismaClient();

// ============================================
// STACK OVERFLOW INTEGRATION (Feature 1.2.3)
// ============================================

export const connectStackOverflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { accessCode } = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Mock Stack Overflow data (in production, use Stack Exchange API)
    const mockData = {
      stackOverflowId: `so_${Date.now()}`,
      displayName: 'Demo Developer',
      profileUrl: 'https://stackoverflow.com/users/1234567/demo-developer',
      avatarUrl: 'https://www.gravatar.com/avatar/default',
      location: 'San Francisco, CA',
      aboutMe: 'Full-stack developer who loves helping others',
      reputation: 15420,
      goldBadges: 12,
      silverBadges: 45,
      bronzeBadges: 89,
      totalBadges: 146,
      questionCount: 23,
      answerCount: 156,
      acceptedAnswerCount: 78,
      upVotes: 1234,
      downVotes: 12,
      viewCount: 45670,
      topTags: [
        { name: 'javascript', score: 4500, answerCount: 45 },
        { name: 'typescript', score: 3200, answerCount: 32 },
        { name: 'react', score: 2800, answerCount: 28 },
        { name: 'node.js', score: 2100, answerCount: 21 },
        { name: 'python', score: 1800, answerCount: 18 },
      ],
      topAnswers: [
        { title: 'How to use async/await in JavaScript', score: 245, url: 'https://stackoverflow.com/a/12345' },
        { title: 'React hooks best practices', score: 189, url: 'https://stackoverflow.com/a/12346' },
        { title: 'TypeScript generics explained', score: 156, url: 'https://stackoverflow.com/a/12347' },
      ],
      creationDate: new Date('2015-03-15'),
      lastAccessDate: new Date(),
    };

    const stackOverflowProfile = await prisma.stackOverflowProfile.upsert({
      where: { profileId: profile.id },
      update: { ...mockData, status: 'CONNECTED', lastSyncAt: new Date() },
      create: { profileId: profile.id, ...mockData, status: 'CONNECTED', connectedAt: new Date(), lastSyncAt: new Date() },
    });

    await processAchievements(userId);

    res.json({
      message: 'Stack Overflow connected successfully',
      profile: stackOverflowProfile,
    });
  } catch (error) {
    console.error('Error connecting Stack Overflow:', error);
    res.status(500).json({ error: 'Failed to connect Stack Overflow' });
  }
};

export const getStackOverflowProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { stackOverflowProfile: true },
    });

    if (!profile?.stackOverflowProfile) {
      return res.status(404).json({ error: 'Stack Overflow not connected' });
    }

    const { accessToken, ...safeProfile } = profile.stackOverflowProfile;
    res.json(safeProfile);
  } catch (error) {
    console.error('Error getting Stack Overflow profile:', error);
    res.status(500).json({ error: 'Failed to get Stack Overflow profile' });
  }
};

export const disconnectStackOverflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { stackOverflowProfile: true },
    });

    if (!profile?.stackOverflowProfile) {
      return res.status(404).json({ error: 'Stack Overflow not connected' });
    }

    await prisma.stackOverflowProfile.delete({
      where: { id: profile.stackOverflowProfile.id },
    });

    res.json({ message: 'Stack Overflow disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Stack Overflow:', error);
    res.status(500).json({ error: 'Failed to disconnect Stack Overflow' });
  }
};

// ============================================
// NOTION INTEGRATION (Feature 1.2.4)
// ============================================

export const connectNotion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { accessCode } = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Mock Notion data
    const mockData = {
      workspaceId: `ws_${Date.now()}`,
      workspaceName: 'My Portfolio Workspace',
      workspaceIcon: 'https://www.notion.so/icons/briefcase_gray.svg',
      notionUserId: `user_${Date.now()}`,
      userName: 'Demo User',
      userEmail: 'demo@example.com',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default',
      portfolioPages: [
        { id: 'page1', title: 'My Portfolio', url: 'https://notion.so/my-portfolio', lastEditedTime: new Date() },
        { id: 'page2', title: 'Project Case Studies', url: 'https://notion.so/case-studies', lastEditedTime: new Date() },
        { id: 'page3', title: 'Technical Blog Posts', url: 'https://notion.so/blog', lastEditedTime: new Date() },
      ],
      totalPages: 3,
    };

    const notionPortfolio = await prisma.notionPortfolio.upsert({
      where: { profileId: profile.id },
      update: { ...mockData, status: 'CONNECTED', lastSyncAt: new Date() },
      create: { profileId: profile.id, ...mockData, status: 'CONNECTED', connectedAt: new Date(), lastSyncAt: new Date() },
    });

    res.json({
      message: 'Notion connected successfully',
      portfolio: notionPortfolio,
    });
  } catch (error) {
    console.error('Error connecting Notion:', error);
    res.status(500).json({ error: 'Failed to connect Notion' });
  }
};

export const getNotionPortfolio = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { notionPortfolio: true },
    });

    if (!profile?.notionPortfolio) {
      return res.status(404).json({ error: 'Notion not connected' });
    }

    const { accessToken, botId, ...safePortfolio } = profile.notionPortfolio;
    res.json(safePortfolio);
  } catch (error) {
    console.error('Error getting Notion portfolio:', error);
    res.status(500).json({ error: 'Failed to get Notion portfolio' });
  }
};

export const disconnectNotion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { notionPortfolio: true },
    });

    if (!profile?.notionPortfolio) {
      return res.status(404).json({ error: 'Notion not connected' });
    }

    await prisma.notionPortfolio.delete({
      where: { id: profile.notionPortfolio.id },
    });

    res.json({ message: 'Notion disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Notion:', error);
    res.status(500).json({ error: 'Failed to disconnect Notion' });
  }
};

// ============================================
// GITLAB INTEGRATION (Feature 1.2.5)
// ============================================

export const connectGitLab = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { accessCode } = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Mock GitLab data
    const mockData = {
      gitlabId: `gl_${Date.now()}`,
      username: 'demo_developer',
      name: 'Demo Developer',
      avatarUrl: 'https://gitlab.com/uploads/-/system/user/avatar/default.png',
      webUrl: 'https://gitlab.com/demo_developer',
      email: 'demo@example.com',
      bio: 'Senior developer passionate about DevOps and CI/CD',
      company: 'Tech Corp',
      location: 'San Francisco',
      website: 'https://demo.dev',
      publicRepos: 28,
      privateRepos: 15,
      followers: 156,
      following: 67,
      starredProjects: 89,
      totalCommits: 3456,
      totalMergeRequests: 234,
      totalIssues: 89,
      topLanguages: [
        { name: 'Python', percentage: 40 },
        { name: 'JavaScript', percentage: 30 },
        { name: 'Go', percentage: 20 },
        { name: 'Shell', percentage: 10 },
      ],
    };

    const gitlabProfile = await prisma.gitLabProfile.upsert({
      where: { profileId: profile.id },
      update: { ...mockData, status: 'CONNECTED', lastSyncAt: new Date() },
      create: { profileId: profile.id, ...mockData, status: 'CONNECTED', connectedAt: new Date(), lastSyncAt: new Date() },
    });

    // Add some mock projects
    const mockProjects = [
      {
        gitlabProfileId: gitlabProfile.id,
        projectId: 'p1',
        name: 'kubernetes-deploy',
        nameWithNamespace: 'demo_developer/kubernetes-deploy',
        path: 'kubernetes-deploy',
        description: 'Kubernetes deployment automation scripts',
        webUrl: 'https://gitlab.com/demo_developer/kubernetes-deploy',
        starCount: 45,
        forksCount: 12,
        openIssuesCount: 3,
        languages: { Python: 70, Shell: 30 },
        visibility: 'public',
        isArchived: false,
        createdAt: new Date('2023-01-15'),
        lastActivityAt: new Date(),
      },
      {
        gitlabProfileId: gitlabProfile.id,
        projectId: 'p2',
        name: 'api-gateway',
        nameWithNamespace: 'demo_developer/api-gateway',
        path: 'api-gateway',
        description: 'Microservices API gateway built with Go',
        webUrl: 'https://gitlab.com/demo_developer/api-gateway',
        starCount: 78,
        forksCount: 23,
        openIssuesCount: 5,
        languages: { Go: 90, Dockerfile: 10 },
        visibility: 'public',
        isArchived: false,
        createdAt: new Date('2022-06-20'),
        lastActivityAt: new Date(),
      },
    ];

    for (const project of mockProjects) {
      await prisma.gitLabProject.upsert({
        where: { gitlabProfileId_projectId: { gitlabProfileId: gitlabProfile.id, projectId: project.projectId } },
        update: project,
        create: project,
      });
    }

    res.json({
      message: 'GitLab connected successfully',
      profile: gitlabProfile,
    });
  } catch (error) {
    console.error('Error connecting GitLab:', error);
    res.status(500).json({ error: 'Failed to connect GitLab' });
  }
};

export const getGitLabProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        gitlabProfile: {
          include: { projects: { orderBy: { starCount: 'desc' }, take: 6 } },
        },
      },
    });

    if (!profile?.gitlabProfile) {
      return res.status(404).json({ error: 'GitLab not connected' });
    }

    const { accessToken, refreshToken, ...safeProfile } = profile.gitlabProfile;
    res.json(safeProfile);
  } catch (error) {
    console.error('Error getting GitLab profile:', error);
    res.status(500).json({ error: 'Failed to get GitLab profile' });
  }
};

export const disconnectGitLab = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { gitlabProfile: true },
    });

    if (!profile?.gitlabProfile) {
      return res.status(404).json({ error: 'GitLab not connected' });
    }

    await prisma.gitLabProfile.delete({
      where: { id: profile.gitlabProfile.id },
    });

    res.json({ message: 'GitLab disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting GitLab:', error);
    res.status(500).json({ error: 'Failed to disconnect GitLab' });
  }
};

// ============================================
// BEHANCE/DRIBBBLE INTEGRATION (Feature 1.2.6)
// ============================================

export const connectDesignPlatform = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { platform, accessCode } = req.body; // platform: 'behance' or 'dribbble'

    if (!['behance', 'dribbble'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Mock design platform data
    const mockData = {
      platform,
      platformUserId: `${platform}_${Date.now()}`,
      username: 'design_pro',
      displayName: 'Design Pro',
      profileUrl: platform === 'behance' ? 'https://behance.net/design_pro' : 'https://dribbble.com/design_pro',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'UI/UX Designer | Product Design | Creative Director',
      location: 'New York, NY',
      followers: 12500,
      following: 320,
      projectCount: 45,
      appreciations: platform === 'behance' ? 23400 : 0,
      likes: platform === 'dribbble' ? 18900 : 0,
      views: 456000,
      comments: 2340,
      skills: ['UI Design', 'UX Design', 'Product Design', 'Branding', 'Illustration'],
      fields: ['UI/UX', 'Product Design', 'Web Design'],
      featuredProjects: [
        { title: 'E-commerce App Redesign', imageUrl: 'https://example.com/project1.jpg', url: 'https://example.com/p1', views: 12000, likes: 890 },
        { title: 'SaaS Dashboard Design', imageUrl: 'https://example.com/project2.jpg', url: 'https://example.com/p2', views: 9800, likes: 670 },
        { title: 'Mobile Banking App', imageUrl: 'https://example.com/project3.jpg', url: 'https://example.com/p3', views: 8500, likes: 520 },
      ],
    };

    const designPortfolio = await prisma.designPortfolio.upsert({
      where: { profileId_platform: { profileId: profile.id, platform } },
      update: { ...mockData, status: 'CONNECTED', lastSyncAt: new Date() },
      create: { profileId: profile.id, ...mockData, status: 'CONNECTED', connectedAt: new Date(), lastSyncAt: new Date() },
    });

    res.json({
      message: `${platform} connected successfully`,
      portfolio: designPortfolio,
    });
  } catch (error) {
    console.error('Error connecting design platform:', error);
    res.status(500).json({ error: 'Failed to connect design platform' });
  }
};

export const getDesignPortfolios = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { designPortfolios: true },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const safePortfolios = profile.designPortfolios.map(({ accessToken, ...p }) => p);
    res.json({ portfolios: safePortfolios });
  } catch (error) {
    console.error('Error getting design portfolios:', error);
    res.status(500).json({ error: 'Failed to get design portfolios' });
  }
};

export const disconnectDesignPlatform = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { platform } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await prisma.designPortfolio.delete({
      where: { profileId_platform: { profileId: profile.id, platform } },
    });

    res.json({ message: `${platform} disconnected successfully` });
  } catch (error) {
    console.error('Error disconnecting design platform:', error);
    res.status(500).json({ error: 'Failed to disconnect design platform' });
  }
};

// ============================================
// MEDIUM/DEV.TO INTEGRATION (Feature 1.2.7)
// ============================================

export const connectBlogPlatform = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { platform, accessCode, apiKey } = req.body; // platform: 'medium' or 'devto'

    if (!['medium', 'devto'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Mock blog platform data
    const mockData = {
      platform,
      platformUserId: `${platform}_${Date.now()}`,
      username: 'tech_writer',
      displayName: 'Tech Writer',
      profileUrl: platform === 'medium' ? 'https://medium.com/@tech_writer' : 'https://dev.to/tech_writer',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Writing about web development, cloud architecture, and software engineering best practices.',
      followers: platform === 'medium' ? 8500 : 12300,
      following: 450,
      articleCount: 67,
      totalReactions: 45600,
      totalViews: 890000,
      totalComments: 2340,
      topTopics: ['javascript', 'react', 'nodejs', 'typescript', 'aws'],
      articles: [
        {
          title: 'Building Scalable React Applications',
          url: platform === 'medium' ? 'https://medium.com/@tech_writer/article1' : 'https://dev.to/tech_writer/article1',
          publishedAt: '2024-01-15',
          reactions: 2450,
          views: 45000,
          comments: 89,
        },
        {
          title: 'TypeScript Best Practices in 2024',
          url: platform === 'medium' ? 'https://medium.com/@tech_writer/article2' : 'https://dev.to/tech_writer/article2',
          publishedAt: '2024-01-08',
          reactions: 1890,
          views: 32000,
          comments: 56,
        },
        {
          title: 'AWS Lambda Performance Optimization',
          url: platform === 'medium' ? 'https://medium.com/@tech_writer/article3' : 'https://dev.to/tech_writer/article3',
          publishedAt: '2024-01-02',
          reactions: 1560,
          views: 28000,
          comments: 45,
        },
      ],
      apiKey: platform === 'devto' ? apiKey : null,
    };

    const blogPlatform = await prisma.blogPlatform.upsert({
      where: { profileId_platform: { profileId: profile.id, platform } },
      update: { ...mockData, status: 'CONNECTED', lastSyncAt: new Date() },
      create: { profileId: profile.id, ...mockData, status: 'CONNECTED', connectedAt: new Date(), lastSyncAt: new Date() },
    });

    res.json({
      message: `${platform} connected successfully`,
      platform: blogPlatform,
    });
  } catch (error) {
    console.error('Error connecting blog platform:', error);
    res.status(500).json({ error: 'Failed to connect blog platform' });
  }
};

export const getBlogPlatforms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { blogPlatforms: true },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const safePlatforms = profile.blogPlatforms.map(({ accessToken, apiKey, ...p }) => p);
    res.json({ platforms: safePlatforms });
  } catch (error) {
    console.error('Error getting blog platforms:', error);
    res.status(500).json({ error: 'Failed to get blog platforms' });
  }
};

export const disconnectBlogPlatform = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { platform } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await prisma.blogPlatform.delete({
      where: { profileId_platform: { profileId: profile.id, platform } },
    });

    res.json({ message: `${platform} disconnected successfully` });
  } catch (error) {
    console.error('Error disconnecting blog platform:', error);
    res.status(500).json({ error: 'Failed to disconnect blog platform' });
  }
};

// ============================================
// ALL INTEGRATIONS STATUS
// ============================================

export const getAllIntegrationsStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        githubProfile: { select: { id: true, username: true, status: true, lastSyncAt: true } },
        linkedInProfile: { select: { id: true, firstName: true, lastName: true, status: true, lastSyncAt: true, isVerified: true } },
        stackOverflowProfile: { select: { id: true, displayName: true, reputation: true, status: true, lastSyncAt: true } },
        notionPortfolio: { select: { id: true, workspaceName: true, status: true, lastSyncAt: true } },
        gitlabProfile: { select: { id: true, username: true, status: true, lastSyncAt: true } },
        designPortfolios: { select: { id: true, platform: true, username: true, status: true, lastSyncAt: true } },
        blogPlatforms: { select: { id: true, platform: true, username: true, status: true, lastSyncAt: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      github: profile.githubProfile ? { connected: true, ...profile.githubProfile } : { connected: false },
      linkedin: profile.linkedInProfile ? { connected: true, ...profile.linkedInProfile } : { connected: false },
      stackoverflow: profile.stackOverflowProfile ? { connected: true, ...profile.stackOverflowProfile } : { connected: false },
      notion: profile.notionPortfolio ? { connected: true, ...profile.notionPortfolio } : { connected: false },
      gitlab: profile.gitlabProfile ? { connected: true, ...profile.gitlabProfile } : { connected: false },
      design: profile.designPortfolios.map(p => ({ connected: true, ...p })),
      blog: profile.blogPlatforms.map(p => ({ connected: true, ...p })),
    });
  } catch (error) {
    console.error('Error getting all integrations status:', error);
    res.status(500).json({ error: 'Failed to get integrations status' });
  }
};
