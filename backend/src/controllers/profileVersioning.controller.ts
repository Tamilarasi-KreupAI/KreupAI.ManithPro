// @ts-nocheck
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create a profile snapshot
const createProfileSnapshot = async (profileId: string) => {
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: profileId },
    include: {
      workExperiences: {
        orderBy: { startDate: 'desc' },
      },
      educations: {
        orderBy: { startDate: 'desc' },
      },
      certifications: {
        orderBy: { issueDate: 'desc' },
      },
      skills: {
        orderBy: { displayOrder: 'asc' },
      },
      projects: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!profile) return null;

  // Remove sensitive/internal fields
  const { user, versions, githubProfile, linkedInProfile, ...profileData } = profile as any;

  return {
    ...profileData,
    workExperiences: profile.workExperiences.map(({ id, profileId, createdAt, updatedAt, ...exp }) => exp),
    educations: profile.educations.map(({ id, profileId, createdAt, updatedAt, ...edu }) => edu),
    certifications: profile.certifications.map(({ id, profileId, createdAt, updatedAt, ...cert }) => cert),
    skills: profile.skills.map(({ id, profileId, createdAt, updatedAt, endorsements, ...skill }) => skill),
    projects: profile.projects.map(({ id, profileId, createdAt, updatedAt, ...proj }) => proj),
  };
};

// Helper function to compute changes between versions
const computeChanges = (oldSnapshot: any, newSnapshot: any): any[] => {
  const changes: any[] = [];
  const fieldsToCompare = [
    'headline', 'summary', 'location', 'city', 'state', 'country',
    'expectedSalary', 'noticePeriod', 'remotePreference',
  ];

  // Compare basic fields
  for (const field of fieldsToCompare) {
    if (oldSnapshot[field] !== newSnapshot[field]) {
      changes.push({
        field,
        oldValue: oldSnapshot[field],
        newValue: newSnapshot[field],
        type: 'update',
      });
    }
  }

  // Compare arrays (skills, experiences, etc.)
  const arrayFields = ['workExperiences', 'educations', 'certifications', 'skills', 'projects'];

  for (const field of arrayFields) {
    const oldItems = oldSnapshot[field] || [];
    const newItems = newSnapshot[field] || [];

    if (oldItems.length !== newItems.length) {
      changes.push({
        field,
        oldValue: `${oldItems.length} items`,
        newValue: `${newItems.length} items`,
        type: newItems.length > oldItems.length ? 'add' : 'remove',
      });
    }
  }

  return changes;
};

// Generate a change summary (in production, this could use AI)
const generateChangeSummary = (changes: any[]): string => {
  if (changes.length === 0) return 'No changes';

  const summaryParts: string[] = [];

  const additions = changes.filter(c => c.type === 'add');
  const updates = changes.filter(c => c.type === 'update');
  const removals = changes.filter(c => c.type === 'remove');

  if (additions.length > 0) {
    summaryParts.push(`Added ${additions.length} item(s)`);
  }
  if (updates.length > 0) {
    const fields = updates.map(u => u.field).join(', ');
    summaryParts.push(`Updated ${fields}`);
  }
  if (removals.length > 0) {
    summaryParts.push(`Removed ${removals.length} item(s)`);
  }

  return summaryParts.join('; ');
};

// ============================================
// PROFILE VERSION ENDPOINTS
// ============================================

// Create a new profile version (manual save point)
export const createProfileVersion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { versionLabel } = req.body;

    // Get user's profile
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get the latest version number
    const latestVersion = await prisma.profileVersion.findFirst({
      where: { profileId: profile.id },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Create snapshot
    const snapshot = await createProfileSnapshot(profile.id);

    if (!snapshot) {
      return res.status(500).json({ error: 'Failed to create profile snapshot' });
    }

    // Compute changes from previous version
    let changes = null;
    let changeSummary = 'Initial version';

    if (latestVersion) {
      changes = computeChanges(latestVersion.profileSnapshot, snapshot);
      changeSummary = generateChangeSummary(changes);
    }

    // Create the version
    const version = await prisma.profileVersion.create({
      data: {
        profileId: profile.id,
        versionNumber: newVersionNumber,
        versionLabel: versionLabel || `Version ${newVersionNumber}`,
        profileSnapshot: snapshot,
        changes,
        changeSummary,
        createdBy: 'user',
      },
    });

    res.status(201).json({
      message: 'Profile version created successfully',
      version: {
        id: version.id,
        versionNumber: version.versionNumber,
        versionLabel: version.versionLabel,
        changeSummary: version.changeSummary,
        createdAt: version.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating profile version:', error);
    res.status(500).json({ error: 'Failed to create profile version' });
  }
};

// Get all profile versions
export const getProfileVersions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const versions = await prisma.profileVersion.findMany({
      where: { profileId: profile.id },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        versionNumber: true,
        versionLabel: true,
        changeSummary: true,
        createdBy: true,
        createdAt: true,
      },
    });

    res.json({
      total: versions.length,
      versions,
    });
  } catch (error) {
    console.error('Error getting profile versions:', error);
    res.status(500).json({ error: 'Failed to get profile versions' });
  }
};

// Get a specific profile version
export const getProfileVersion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { versionId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const version = await prisma.profileVersion.findFirst({
      where: {
        id: versionId,
        profileId: profile.id,
      },
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(version);
  } catch (error) {
    console.error('Error getting profile version:', error);
    res.status(500).json({ error: 'Failed to get profile version' });
  }
};

// Compare two profile versions
export const compareVersions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { versionId1, versionId2 } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const [version1, version2] = await Promise.all([
      prisma.profileVersion.findFirst({
        where: { id: versionId1, profileId: profile.id },
      }),
      prisma.profileVersion.findFirst({
        where: { id: versionId2, profileId: profile.id },
      }),
    ]);

    if (!version1 || !version2) {
      return res.status(404).json({ error: 'One or both versions not found' });
    }

    const changes = computeChanges(version1.profileSnapshot, version2.profileSnapshot);

    res.json({
      version1: {
        id: version1.id,
        versionNumber: version1.versionNumber,
        versionLabel: version1.versionLabel,
        createdAt: version1.createdAt,
      },
      version2: {
        id: version2.id,
        versionNumber: version2.versionNumber,
        versionLabel: version2.versionLabel,
        createdAt: version2.createdAt,
      },
      changes,
      summary: generateChangeSummary(changes),
    });
  } catch (error) {
    console.error('Error comparing versions:', error);
    res.status(500).json({ error: 'Failed to compare versions' });
  }
};

// Restore a profile version
export const restoreVersion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { versionId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const version = await prisma.profileVersion.findFirst({
      where: {
        id: versionId,
        profileId: profile.id,
      },
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const snapshot = version.profileSnapshot as any;

    // Create a new version before restoring (so user can undo)
    await prisma.profileVersion.create({
      data: {
        profileId: profile.id,
        versionNumber: (await prisma.profileVersion.count({ where: { profileId: profile.id } })) + 1,
        versionLabel: `Before restore from v${version.versionNumber}`,
        profileSnapshot: await createProfileSnapshot(profile.id),
        changeSummary: `Backup before restoring version ${version.versionNumber}`,
        createdBy: 'system',
      },
    });

    // Restore profile basic info
    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: {
        headline: snapshot.headline,
        summary: snapshot.summary,
        city: snapshot.city,
        state: snapshot.state,
        country: snapshot.country,
        expectedSalary: snapshot.expectedSalary,
        noticePeriod: snapshot.noticePeriod,
        remotePreference: snapshot.remotePreference,
        website: snapshot.website,
        github: snapshot.github,
        linkedin: snapshot.linkedin,
        twitter: snapshot.twitter,
      },
    });

    // Create another version after restore
    await prisma.profileVersion.create({
      data: {
        profileId: profile.id,
        versionNumber: (await prisma.profileVersion.count({ where: { profileId: profile.id } })) + 1,
        versionLabel: `Restored from v${version.versionNumber}`,
        profileSnapshot: await createProfileSnapshot(profile.id),
        changeSummary: `Restored profile to version ${version.versionNumber}`,
        createdBy: 'system',
      },
    });

    res.json({
      message: `Profile restored to version ${version.versionNumber}`,
      restoredVersion: version.versionNumber,
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
};

// Delete a profile version
export const deleteVersion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { versionId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const version = await prisma.profileVersion.findFirst({
      where: {
        id: versionId,
        profileId: profile.id,
      },
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Don't allow deleting the only version
    const versionCount = await prisma.profileVersion.count({
      where: { profileId: profile.id },
    });

    if (versionCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only version' });
    }

    await prisma.profileVersion.delete({
      where: { id: versionId },
    });

    res.json({
      message: 'Version deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting version:', error);
    res.status(500).json({ error: 'Failed to delete version' });
  }
};

// Auto-save version (called internally when profile changes significantly)
export const autoSaveVersion = async (profileId: string, trigger: string) => {
  try {
    const latestVersion = await prisma.profileVersion.findFirst({
      where: { profileId },
      orderBy: { versionNumber: 'desc' },
    });

    // Check if we should auto-save (e.g., at least 1 hour since last save)
    if (latestVersion) {
      const hoursSinceLastSave =
        (Date.now() - new Date(latestVersion.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSave < 1) {
        return null; // Don't auto-save too frequently
      }
    }

    const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;
    const snapshot = await createProfileSnapshot(profileId);

    if (!snapshot) return null;

    let changes = null;
    let changeSummary = 'Initial version';

    if (latestVersion) {
      changes = computeChanges(latestVersion.profileSnapshot, snapshot);
      if (changes.length === 0) return null; // No changes, don't save
      changeSummary = generateChangeSummary(changes);
    }

    return await prisma.profileVersion.create({
      data: {
        profileId,
        versionNumber: newVersionNumber,
        versionLabel: `Auto-save (${trigger})`,
        profileSnapshot: snapshot,
        changes,
        changeSummary,
        createdBy: 'system',
      },
    });
  } catch (error) {
    console.error('Error auto-saving version:', error);
    return null;
  }
};

// Get version timeline (for visualization)
export const getVersionTimeline = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const versions = await prisma.profileVersion.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        versionNumber: true,
        versionLabel: true,
        changeSummary: true,
        createdBy: true,
        createdAt: true,
        changes: true,
      },
    });

    // Format for timeline visualization
    const timeline = versions.map((v, index) => ({
      ...v,
      isFirst: index === 0,
      isLatest: index === versions.length - 1,
      changeCount: (v.changes as any[])?.length || 0,
    }));

    res.json({
      total: timeline.length,
      timeline,
    });
  } catch (error) {
    console.error('Error getting version timeline:', error);
    res.status(500).json({ error: 'Failed to get version timeline' });
  }
};
