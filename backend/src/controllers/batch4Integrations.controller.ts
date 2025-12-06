import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 1.2.8 - KAGGLE INTEGRATION
// ============================================

export const connectKaggle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { username } = req.body;

    // Get candidate profile
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // In production, this would verify with Kaggle API
    // For now, we create a mock profile
    const kaggleProfile = await prisma.kaggleProfile.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        kaggleId: `kaggle-${username}`,
        username,
        displayName: username,
        profileUrl: `https://www.kaggle.com/${username}`,
        tier: 'Expert',
        competitionTier: 'Expert',
        notebookTier: 'Master',
        competitionCount: 25,
        datasetCount: 8,
        notebookCount: 42,
        discussionCount: 156,
        totalMedals: 15,
        goldMedals: 3,
        silverMedals: 5,
        bronzeMedals: 7,
        status: 'CONNECTED',
      },
      update: {
        username,
        displayName: username,
        profileUrl: `https://www.kaggle.com/${username}`,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
    });

    res.json({ profile: kaggleProfile });
  } catch (error) {
    console.error('Error connecting Kaggle:', error);
    res.status(500).json({ error: 'Failed to connect Kaggle' });
  }
};

export const getKaggleProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { kaggleProfile: true },
    });

    if (!profile?.kaggleProfile) {
      return res.json(null);
    }

    res.json(profile.kaggleProfile);
  } catch (error) {
    console.error('Error fetching Kaggle profile:', error);
    res.status(500).json({ error: 'Failed to fetch Kaggle profile' });
  }
};

export const disconnectKaggle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await prisma.kaggleProfile.deleteMany({
      where: { profileId: profile.id },
    });

    res.json({ message: 'Kaggle disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Kaggle:', error);
    res.status(500).json({ error: 'Failed to disconnect Kaggle' });
  }
};

// ============================================
// 1.2.9 - LEETCODE/HACKERRANK INTEGRATION
// ============================================

export const connectCodingPlatform = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { platform, username } = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const validPlatforms = ['leetcode', 'hackerrank', 'codeforces', 'codechef'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const platformUrls: Record<string, string> = {
      leetcode: `https://leetcode.com/${username}`,
      hackerrank: `https://www.hackerrank.com/${username}`,
      codeforces: `https://codeforces.com/profile/${username}`,
      codechef: `https://www.codechef.com/users/${username}`,
    };

    // Create mock data based on platform
    const codingProfile = await prisma.codingPlatformProfile.upsert({
      where: {
        profileId_platform: {
          profileId: profile.id,
          platform,
        },
      },
      create: {
        profileId: profile.id,
        platform,
        platformUserId: `${platform}-${username}`,
        username,
        displayName: username,
        profileUrl: platformUrls[platform],
        rating: platform === 'leetcode' ? 1850 : platform === 'codeforces' ? 1650 : 2100,
        globalRank: Math.floor(Math.random() * 50000) + 1000,
        totalSolved: platform === 'leetcode' ? 456 : platform === 'hackerrank' ? 320 : 180,
        easySolved: 180,
        mediumSolved: 200,
        hardSolved: 76,
        acceptanceRate: 65.5,
        contestsAttended: 35,
        currentStreak: 15,
        maxStreak: 45,
        totalActiveDays: 280,
        status: 'CONNECTED',
      },
      update: {
        username,
        displayName: username,
        profileUrl: platformUrls[platform],
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
    });

    res.json({ profile: codingProfile });
  } catch (error) {
    console.error('Error connecting coding platform:', error);
    res.status(500).json({ error: 'Failed to connect coding platform' });
  }
};

export const getCodingPlatforms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { codingPlatforms: true },
    });

    res.json({ platforms: profile?.codingPlatforms || [] });
  } catch (error) {
    console.error('Error fetching coding platforms:', error);
    res.status(500).json({ error: 'Failed to fetch coding platforms' });
  }
};

export const disconnectCodingPlatform = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { platform } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await prisma.codingPlatformProfile.deleteMany({
      where: {
        profileId: profile.id,
        platform,
      },
    });

    res.json({ message: `${platform} disconnected successfully` });
  } catch (error) {
    console.error('Error disconnecting coding platform:', error);
    res.status(500).json({ error: 'Failed to disconnect coding platform' });
  }
};

// ============================================
// 1.2.10 - ONLINE COURSES (COURSERA/UDEMY)
// ============================================

export const connectOnlineCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { platform, username } = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const validPlatforms = ['coursera', 'udemy', 'edx', 'pluralsight', 'linkedin_learning'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const courseProfile = await prisma.onlineCourseProfile.upsert({
      where: {
        profileId_platform: {
          profileId: profile.id,
          platform,
        },
      },
      create: {
        profileId: profile.id,
        platform,
        platformUserId: username,
        username,
        displayName: username,
        totalCourses: 25,
        completedCourses: 18,
        totalHours: 320,
        certificationsEarned: 12,
        status: 'CONNECTED',
      },
      update: {
        username,
        displayName: username,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
    });

    res.json({ profile: courseProfile });
  } catch (error) {
    console.error('Error connecting online courses:', error);
    res.status(500).json({ error: 'Failed to connect online courses' });
  }
};

export const getOnlineCourseProfiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        onlineCourseProfiles: {
          include: { courses: true },
        },
      },
    });

    res.json({ profiles: profile?.onlineCourseProfiles || [] });
  } catch (error) {
    console.error('Error fetching online course profiles:', error);
    res.status(500).json({ error: 'Failed to fetch online course profiles' });
  }
};

export const addOnlineCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { courseProfileId, courseData } = req.body;

    const course = await prisma.onlineCourse.create({
      data: {
        courseProfileId,
        courseId: `course-${Date.now()}`,
        ...courseData,
      },
    });

    res.json({ course });
  } catch (error) {
    console.error('Error adding online course:', error);
    res.status(500).json({ error: 'Failed to add online course' });
  }
};

export const disconnectOnlineCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { platform } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await prisma.onlineCourseProfile.deleteMany({
      where: {
        profileId: profile.id,
        platform,
      },
    });

    res.json({ message: `${platform} disconnected successfully` });
  } catch (error) {
    console.error('Error disconnecting online courses:', error);
    res.status(500).json({ error: 'Failed to disconnect online courses' });
  }
};

// ============================================
// 1.2.11 - ACADEMIC PROFILES (GOOGLE SCHOLAR)
// ============================================

export const connectAcademicProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { platform, profileUrl, displayName } = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const validPlatforms = ['google_scholar', 'researchgate', 'orcid', 'academia'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const academicProfile = await prisma.academicProfile.upsert({
      where: {
        profileId_platform: {
          profileId: profile.id,
          platform,
        },
      },
      create: {
        profileId: profile.id,
        platform,
        platformUserId: `${platform}-${Date.now()}`,
        profileUrl,
        displayName,
        affiliation: 'University Research Lab',
        totalPublications: 28,
        totalCitations: 450,
        hIndex: 12,
        i10Index: 15,
        researchInterests: ['Machine Learning', 'Natural Language Processing', 'Computer Vision'],
        status: 'CONNECTED',
      },
      update: {
        profileUrl,
        displayName,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
    });

    res.json({ profile: academicProfile });
  } catch (error) {
    console.error('Error connecting academic profile:', error);
    res.status(500).json({ error: 'Failed to connect academic profile' });
  }
};

export const getAcademicProfiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        academicProfiles: {
          include: { publications: true },
        },
      },
    });

    res.json({ profiles: profile?.academicProfiles || [] });
  } catch (error) {
    console.error('Error fetching academic profiles:', error);
    res.status(500).json({ error: 'Failed to fetch academic profiles' });
  }
};

export const addPublication = async (req: Request, res: Response) => {
  try {
    const { academicProfileId, publicationData } = req.body;

    const publication = await prisma.publication.create({
      data: {
        academicProfileId,
        publicationId: `pub-${Date.now()}`,
        ...publicationData,
      },
    });

    res.json({ publication });
  } catch (error) {
    console.error('Error adding publication:', error);
    res.status(500).json({ error: 'Failed to add publication' });
  }
};

export const disconnectAcademicProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { platform } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await prisma.academicProfile.deleteMany({
      where: {
        profileId: profile.id,
        platform,
      },
    });

    res.json({ message: `${platform} disconnected successfully` });
  } catch (error) {
    console.error('Error disconnecting academic profile:', error);
    res.status(500).json({ error: 'Failed to disconnect academic profile' });
  }
};

// ============================================
// 1.2.12 - CUSTOM PORTFOLIO LINKS
// ============================================

export const addPortfolioLink = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, url, description, linkType, tags, category, isFeatured } = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Auto-detect platform from URL
    let platform = null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'YouTube';
    else if (url.includes('vimeo.com')) platform = 'Vimeo';
    else if (url.includes('figma.com')) platform = 'Figma';
    else if (url.includes('codepen.io')) platform = 'CodePen';
    else if (url.includes('codesandbox.io')) platform = 'CodeSandbox';
    else if (url.includes('replit.com')) platform = 'Replit';
    else if (url.includes('netlify.app')) platform = 'Netlify';
    else if (url.includes('vercel.app')) platform = 'Vercel';
    else if (url.includes('heroku.com')) platform = 'Heroku';

    const link = await prisma.customPortfolioLink.create({
      data: {
        profileId: profile.id,
        title,
        url,
        description,
        linkType,
        platform,
        tags: tags || [],
        category,
        isFeatured: isFeatured || false,
        isPublic: true,
        showPreview: true,
      },
    });

    res.json({ link });
  } catch (error) {
    console.error('Error adding portfolio link:', error);
    res.status(500).json({ error: 'Failed to add portfolio link' });
  }
};

export const getPortfolioLinks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        customPortfolioLinks: {
          orderBy: [
            { isFeatured: 'desc' },
            { displayOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    res.json({ links: profile?.customPortfolioLinks || [] });
  } catch (error) {
    console.error('Error fetching portfolio links:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio links' });
  }
};

export const updatePortfolioLink = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { linkId } = req.params;
    const updateData = req.body;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const link = await prisma.customPortfolioLink.updateMany({
      where: {
        id: linkId,
        profileId: profile.id,
      },
      data: updateData,
    });

    if (link.count === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const updatedLink = await prisma.customPortfolioLink.findUnique({
      where: { id: linkId },
    });

    res.json({ link: updatedLink });
  } catch (error) {
    console.error('Error updating portfolio link:', error);
    res.status(500).json({ error: 'Failed to update portfolio link' });
  }
};

export const deletePortfolioLink = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { linkId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await prisma.customPortfolioLink.deleteMany({
      where: {
        id: linkId,
        profileId: profile.id,
      },
    });

    res.json({ message: 'Portfolio link deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio link:', error);
    res.status(500).json({ error: 'Failed to delete portfolio link' });
  }
};

export const reorderPortfolioLinks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { linkIds } = req.body; // Array of link IDs in new order

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update display order for each link
    await Promise.all(
      linkIds.map((linkId: string, index: number) =>
        prisma.customPortfolioLink.updateMany({
          where: {
            id: linkId,
            profileId: profile.id,
          },
          data: {
            displayOrder: index,
          },
        })
      )
    );

    res.json({ message: 'Links reordered successfully' });
  } catch (error) {
    console.error('Error reordering portfolio links:', error);
    res.status(500).json({ error: 'Failed to reorder portfolio links' });
  }
};

// ============================================
// ALL BATCH 4 INTEGRATIONS STATUS
// ============================================

export const getBatch4IntegrationsStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        kaggleProfile: true,
        codingPlatforms: true,
        onlineCourseProfiles: true,
        academicProfiles: true,
        customPortfolioLinks: true,
      },
    });

    const status = {
      kaggle: profile?.kaggleProfile
        ? {
            connected: true,
            id: profile.kaggleProfile.id,
            username: profile.kaggleProfile.username,
            tier: profile.kaggleProfile.tier,
            status: profile.kaggleProfile.status,
          }
        : { connected: false },
      codingPlatforms: {
        leetcode: profile?.codingPlatforms.find(p => p.platform === 'leetcode')
          ? {
              connected: true,
              id: profile.codingPlatforms.find(p => p.platform === 'leetcode')!.id,
              username: profile.codingPlatforms.find(p => p.platform === 'leetcode')!.username,
              totalSolved: profile.codingPlatforms.find(p => p.platform === 'leetcode')!.totalSolved,
            }
          : { connected: false },
        hackerrank: profile?.codingPlatforms.find(p => p.platform === 'hackerrank')
          ? {
              connected: true,
              id: profile.codingPlatforms.find(p => p.platform === 'hackerrank')!.id,
              username: profile.codingPlatforms.find(p => p.platform === 'hackerrank')!.username,
              totalSolved: profile.codingPlatforms.find(p => p.platform === 'hackerrank')!.totalSolved,
            }
          : { connected: false },
        codeforces: profile?.codingPlatforms.find(p => p.platform === 'codeforces')
          ? {
              connected: true,
              id: profile.codingPlatforms.find(p => p.platform === 'codeforces')!.id,
              username: profile.codingPlatforms.find(p => p.platform === 'codeforces')!.username,
              rating: profile.codingPlatforms.find(p => p.platform === 'codeforces')!.rating,
            }
          : { connected: false },
      },
      onlineCourses: {
        coursera: profile?.onlineCourseProfiles.find(p => p.platform === 'coursera')
          ? {
              connected: true,
              id: profile.onlineCourseProfiles.find(p => p.platform === 'coursera')!.id,
              completedCourses: profile.onlineCourseProfiles.find(p => p.platform === 'coursera')!.completedCourses,
            }
          : { connected: false },
        udemy: profile?.onlineCourseProfiles.find(p => p.platform === 'udemy')
          ? {
              connected: true,
              id: profile.onlineCourseProfiles.find(p => p.platform === 'udemy')!.id,
              completedCourses: profile.onlineCourseProfiles.find(p => p.platform === 'udemy')!.completedCourses,
            }
          : { connected: false },
      },
      academic: {
        googleScholar: profile?.academicProfiles.find(p => p.platform === 'google_scholar')
          ? {
              connected: true,
              id: profile.academicProfiles.find(p => p.platform === 'google_scholar')!.id,
              totalPublications: profile.academicProfiles.find(p => p.platform === 'google_scholar')!.totalPublications,
              citations: profile.academicProfiles.find(p => p.platform === 'google_scholar')!.totalCitations,
            }
          : { connected: false },
        researchgate: profile?.academicProfiles.find(p => p.platform === 'researchgate')
          ? {
              connected: true,
              id: profile.academicProfiles.find(p => p.platform === 'researchgate')!.id,
              totalPublications: profile.academicProfiles.find(p => p.platform === 'researchgate')!.totalPublications,
            }
          : { connected: false },
      },
      portfolioLinks: {
        count: profile?.customPortfolioLinks.length || 0,
        featuredCount: profile?.customPortfolioLinks.filter(l => l.isFeatured).length || 0,
      },
    };

    res.json(status);
  } catch (error) {
    console.error('Error fetching batch 4 integrations status:', error);
    res.status(500).json({ error: 'Failed to fetch integrations status' });
  }
};
