import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================
// 1.3.6 - EDUCATION VERIFICATION
// ============================================

// Request education verification
export const requestEducationVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      educationId,
      institutionName,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Determine verification provider based on institution
    const verificationProvider = determineEducationProvider(institutionName);

    const verification = await prisma.educationVerification.upsert({
      where: { educationId },
      create: {
        profileId: profile.id,
        educationId,
        institutionName,
        degree,
        fieldOfStudy,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        grade,
        verificationProvider,
        requestStatus: 'PENDING',
        requestId: crypto.randomBytes(16).toString('hex'),
        requestSentAt: new Date(),
      },
      update: {
        requestStatus: 'PENDING',
        requestSentAt: new Date(),
        verificationAttempts: { increment: 1 },
      },
    });

    // TODO: Actually send verification request to provider

    res.json({
      success: true,
      message: 'Education verification requested',
      verification,
    });
  } catch (error) {
    console.error('Error requesting education verification:', error);
    res.status(500).json({ error: 'Failed to request education verification' });
  }
};

// Upload verification documents
export const uploadEducationDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { verificationId, transcriptUrl, diplomaUrl, additionalDocs } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const verification = await prisma.educationVerification.findFirst({
      where: {
        id: verificationId,
        profileId: profile.id,
      },
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    const updatedVerification = await prisma.educationVerification.update({
      where: { id: verificationId },
      data: {
        transcriptUrl,
        diplomaUrl,
        additionalDocs: additionalDocs || [],
        verificationMethod: 'manual',
        needsManualReview: true,
      },
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      verification: updatedVerification,
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
};

// Get education verifications
export const getEducationVerifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const verifications = await prisma.educationVerification.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ verifications });
  } catch (error) {
    console.error('Error fetching education verifications:', error);
    res.status(500).json({ error: 'Failed to fetch education verifications' });
  }
};

// ============================================
// 1.3.7 - BACKGROUND CHECK INTEGRATION
// ============================================

// Request background check
export const requestBackgroundCheck = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      provider,
      checkType,
      packageName,
      includedChecks,
      consentGiven,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!consentGiven) {
      return res.status(400).json({ error: 'Consent is required for background check' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Check for existing pending check
    const existingCheck = await prisma.backgroundCheck.findFirst({
      where: {
        profileId: profile.id,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    if (existingCheck) {
      return res.status(400).json({ error: 'A background check is already in progress' });
    }

    const backgroundCheck = await prisma.backgroundCheck.create({
      data: {
        profileId: profile.id,
        provider: provider || 'checkr',
        checkType: checkType || 'STANDARD',
        packageName,
        includedChecks: includedChecks || getDefaultChecks(checkType),
        requestId: crypto.randomBytes(16).toString('hex'),
        status: 'PENDING',
        requestedAt: new Date(),
        consentGiven: true,
        consentGivenAt: new Date(),
        totalChecks: includedChecks?.length || getDefaultChecks(checkType).length,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      },
    });

    // TODO: Actually initiate background check with provider

    res.json({
      success: true,
      message: 'Background check initiated',
      backgroundCheck,
    });
  } catch (error) {
    console.error('Error requesting background check:', error);
    res.status(500).json({ error: 'Failed to request background check' });
  }
};

// Get background check status
export const getBackgroundCheckStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const backgroundCheck = await prisma.backgroundCheck.findFirst({
      where: {
        id,
        profileId: profile.id,
      },
    });

    if (!backgroundCheck) {
      return res.status(404).json({ error: 'Background check not found' });
    }

    res.json({ backgroundCheck });
  } catch (error) {
    console.error('Error fetching background check:', error);
    res.status(500).json({ error: 'Failed to fetch background check' });
  }
};

// Get all background checks
export const getBackgroundChecks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const backgroundChecks = await prisma.backgroundCheck.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ backgroundChecks });
  } catch (error) {
    console.error('Error fetching background checks:', error);
    res.status(500).json({ error: 'Failed to fetch background checks' });
  }
};

// ============================================
// 1.3.9 - VERIFIED BADGE SYSTEM
// ============================================

// Get user's badges
export const getVerifiedBadges = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const badges = await prisma.verifiedBadge.findMany({
      where: {
        profileId: profile.id,
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
};

// Toggle badge visibility
export const toggleBadgeVisibility = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { badgeId, showOnProfile } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const badge = await prisma.verifiedBadge.updateMany({
      where: {
        id: badgeId,
        profileId: profile.id,
      },
      data: { showOnProfile },
    });

    res.json({
      success: true,
      message: 'Badge visibility updated',
    });
  } catch (error) {
    console.error('Error toggling badge visibility:', error);
    res.status(500).json({ error: 'Failed to update badge visibility' });
  }
};

// Reorder badges
export const reorderBadges = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { badgeOrder } = req.body; // Array of { badgeId, displayOrder }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    for (const item of badgeOrder) {
      await prisma.verifiedBadge.updateMany({
        where: {
          id: item.badgeId,
          profileId: profile.id,
        },
        data: { displayOrder: item.displayOrder },
      });
    }

    res.json({
      success: true,
      message: 'Badge order updated',
    });
  } catch (error) {
    console.error('Error reordering badges:', error);
    res.status(500).json({ error: 'Failed to reorder badges' });
  }
};

// Award badge (internal function, can be called from other controllers)
export const awardBadge = async (
  profileId: string,
  badgeType: string,
  verificationSource: string,
  verificationId?: string
) => {
  const badgeConfig = getBadgeConfig(badgeType);

  const badge = await prisma.verifiedBadge.upsert({
    where: {
      profileId_badgeType: {
        profileId,
        badgeType,
      },
    },
    create: {
      profileId,
      badgeType,
      badgeName: badgeConfig.name,
      badgeDescription: badgeConfig.description,
      badgeIcon: badgeConfig.icon,
      badgeColor: badgeConfig.color,
      verificationSource,
      verificationId,
      verificationType: badgeType,
      isActive: true,
      showOnProfile: true,
    },
    update: {
      isActive: true,
      earnedAt: new Date(),
      verificationSource,
      verificationId,
    },
  });

  return badge;
};

// Get available badges
export const getAvailableBadges = async (req: Request, res: Response) => {
  try {
    const badgeTypes = [
      { type: 'email', ...getBadgeConfig('email') },
      { type: 'linkedin', ...getBadgeConfig('linkedin') },
      { type: 'education', ...getBadgeConfig('education') },
      { type: 'employment', ...getBadgeConfig('employment') },
      { type: 'certification', ...getBadgeConfig('certification') },
      { type: 'background', ...getBadgeConfig('background') },
      { type: 'identity', ...getBadgeConfig('identity') },
      { type: 'premium', ...getBadgeConfig('premium') },
    ];

    res.json({ badges: badgeTypes });
  } catch (error) {
    console.error('Error fetching available badges:', error);
    res.status(500).json({ error: 'Failed to fetch available badges' });
  }
};

// Get extended verification status
export const getExtendedVerificationStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        EducationVerification: true,
        BackgroundCheck: true,
        VerifiedBadge: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const status = {
      educationVerifications: {
        total: profile.EducationVerification.length,
        verified: profile.EducationVerification.filter((v) => v.isVerified).length,
        pending: profile.EducationVerification.filter(
          (v) => v.requestStatus === 'PENDING' || v.requestStatus === 'SENT'
        ).length,
      },
      backgroundChecks: {
        total: profile.BackgroundCheck.length,
        completed: profile.BackgroundCheck.filter((c) => c.status === 'COMPLETED').length,
        pending: profile.BackgroundCheck.filter(
          (c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS'
        ).length,
        latestResult: profile.BackgroundCheck[0]?.overallResult,
      },
      badges: {
        total: profile.VerifiedBadge.length,
        active: profile.VerifiedBadge.filter((b) => b.isActive).length,
        displayed: profile.VerifiedBadge.filter((b) => b.showOnProfile).length,
      },
    };

    res.json({ status });
  } catch (error) {
    console.error('Error fetching extended verification status:', error);
    res.status(500).json({ error: 'Failed to fetch extended verification status' });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function determineEducationProvider(institutionName: string): string | null {
  const institution = institutionName.toLowerCase();

  // US institutions - National Student Clearinghouse
  if (
    institution.includes('university') ||
    institution.includes('college') ||
    institution.includes('institute of technology')
  ) {
    return 'national_student_clearinghouse';
  }

  // UK institutions - HEDD
  if (institution.includes('uk') || institution.includes('oxford') || institution.includes('cambridge')) {
    return 'hedd';
  }

  return 'manual';
}

function getDefaultChecks(checkType: string): string[] {
  switch (checkType) {
    case 'BASIC':
      return ['identity', 'ssn_trace'];
    case 'STANDARD':
      return ['identity', 'ssn_trace', 'criminal', 'sex_offender'];
    case 'COMPREHENSIVE':
      return [
        'identity',
        'ssn_trace',
        'criminal',
        'sex_offender',
        'education',
        'employment',
        'credit',
        'driving',
      ];
    default:
      return ['identity', 'ssn_trace', 'criminal'];
  }
}

function getBadgeConfig(badgeType: string) {
  const configs: Record<string, { name: string; description: string; icon: string; color: string }> = {
    email: {
      name: 'Verified Email',
      description: 'Work email verified',
      icon: 'mail',
      color: '#10B981',
    },
    linkedin: {
      name: 'LinkedIn Verified',
      description: 'LinkedIn profile connected and verified',
      icon: 'linkedin',
      color: '#0A66C2',
    },
    education: {
      name: 'Education Verified',
      description: 'Educational credentials verified',
      icon: 'academic-cap',
      color: '#8B5CF6',
    },
    employment: {
      name: 'Employment Verified',
      description: 'Employment history verified',
      icon: 'briefcase',
      color: '#3B82F6',
    },
    certification: {
      name: 'Certification Verified',
      description: 'Professional certifications verified',
      icon: 'badge-check',
      color: '#F59E0B',
    },
    background: {
      name: 'Background Checked',
      description: 'Background check completed',
      icon: 'shield-check',
      color: '#14B8A6',
    },
    identity: {
      name: 'Identity Verified',
      description: 'Identity verified through official documents',
      icon: 'identification',
      color: '#6366F1',
    },
    premium: {
      name: 'Premium Member',
      description: 'Premium subscription active',
      icon: 'star',
      color: '#FFD700',
    },
  };

  return configs[badgeType] || {
    name: 'Badge',
    description: 'Verified badge',
    icon: 'check-circle',
    color: '#6B7280',
  };
}

export default {
  // Education verification
  requestEducationVerification,
  uploadEducationDocuments,
  getEducationVerifications,
  // Background checks
  requestBackgroundCheck,
  getBackgroundCheckStatus,
  getBackgroundChecks,
  // Badges
  getVerifiedBadges,
  toggleBadgeVisibility,
  reorderBadges,
  awardBadge,
  getAvailableBadges,
  // Status
  getExtendedVerificationStatus,
};
