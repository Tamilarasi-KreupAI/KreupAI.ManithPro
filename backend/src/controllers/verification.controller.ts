import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================
// 1.3.1 - EMAIL DOMAIN VERIFICATION
// ============================================

// Request email verification
export const requestEmailVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workEmail, companyName, workExperienceId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!workEmail || !companyName) {
      return res.status(400).json({ error: 'Work email and company name are required' });
    }

    // Get candidate profile
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Extract domain from email
    const emailDomain = workEmail.split('@')[1];
    if (!emailDomain) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Generate verification code and token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create or update verification record
    const verification = await prisma.emailDomainVerification.upsert({
      where: {
        profileId_workEmail: {
          profileId: profile.id,
          workEmail,
        },
      },
      create: {
        profileId: profile.id,
        workEmail,
        emailDomain,
        companyName,
        workExperienceId,
        verificationCode,
        verificationToken,
        verificationStatus: 'SENT',
        codeSentAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      update: {
        verificationCode,
        verificationToken,
        verificationStatus: 'SENT',
        codeSentAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        verificationAttempts: 0,
      },
    });

    // TODO: Send actual email with verification code
    // For now, return success with mock response

    res.json({
      success: true,
      message: 'Verification email sent',
      verification: {
        id: verification.id,
        workEmail: verification.workEmail,
        emailDomain: verification.emailDomain,
        companyName: verification.companyName,
        status: verification.verificationStatus,
        expiresAt: verification.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error requesting email verification:', error);
    res.status(500).json({ error: 'Failed to request email verification' });
  }
};

// Verify email with code
export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { verificationId, code } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const verification = await prisma.emailDomainVerification.findFirst({
      where: {
        id: verificationId,
        profileId: profile.id,
      },
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    // Check if expired
    if (verification.expiresAt && new Date() > verification.expiresAt) {
      await prisma.emailDomainVerification.update({
        where: { id: verificationId },
        data: { verificationStatus: 'EXPIRED' },
      });
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Check attempts
    if (verification.verificationAttempts >= verification.maxAttempts) {
      await prisma.emailDomainVerification.update({
        where: { id: verificationId },
        data: { verificationStatus: 'FAILED' },
      });
      return res.status(400).json({ error: 'Maximum verification attempts exceeded' });
    }

    // Verify code
    if (verification.verificationCode !== code) {
      await prisma.emailDomainVerification.update({
        where: { id: verificationId },
        data: { verificationAttempts: { increment: 1 } },
      });
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Mark as verified
    const updatedVerification = await prisma.emailDomainVerification.update({
      where: { id: verificationId },
      data: {
        verificationStatus: 'COMPLETED',
        isVerified: true,
        verifiedAt: new Date(),
        verificationMethod: 'code',
      },
    });

    // Update work experience if linked
    if (verification.workExperienceId) {
      await prisma.workExperience.update({
        where: { id: verification.workExperienceId },
        data: {
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          verificationMethod: 'email',
        },
      });
    }

    // Recalculate trust score
    await recalculateTrustScore(profile.id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      verification: updatedVerification,
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
};

// Get email verifications
export const getEmailVerifications = async (req: Request, res: Response) => {
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

    const verifications = await prisma.emailDomainVerification.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ verifications });
  } catch (error) {
    console.error('Error fetching email verifications:', error);
    res.status(500).json({ error: 'Failed to fetch email verifications' });
  }
};

// Delete email verification
export const deleteEmailVerification = async (req: Request, res: Response) => {
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

    await prisma.emailDomainVerification.deleteMany({
      where: {
        id,
        profileId: profile.id,
      },
    });

    res.json({ success: true, message: 'Verification deleted' });
  } catch (error) {
    console.error('Error deleting email verification:', error);
    res.status(500).json({ error: 'Failed to delete email verification' });
  }
};

// ============================================
// 1.3.2 - LINKEDIN EMPLOYMENT VERIFICATION
// ============================================

// Request LinkedIn employment verification
export const requestLinkedInVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workExperienceId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        linkedInProfile: true,
        workExperiences: {
          where: { id: workExperienceId },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (!profile.linkedInProfile) {
      return res.status(400).json({ error: 'LinkedIn profile not connected' });
    }

    const workExperience = profile.workExperiences[0];
    if (!workExperience) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    // Create verification record
    const verification = await prisma.linkedInEmploymentVerification.upsert({
      where: { workExperienceId },
      create: {
        profileId: profile.id,
        workExperienceId,
        linkedInProfileId: profile.linkedInProfile.id,
        claimedCompanyName: workExperience.companyName,
        claimedTitle: workExperience.title,
        claimedStartDate: workExperience.startDate,
        claimedEndDate: workExperience.endDate,
        claimedIsCurrent: workExperience.isCurrent,
        verificationStatus: 'PENDING',
      },
      update: {
        verificationStatus: 'PENDING',
        lastCheckedAt: new Date(),
      },
    });

    // TODO: Actually compare with LinkedIn data
    // For now, simulate verification

    res.json({
      success: true,
      message: 'LinkedIn verification initiated',
      verification,
    });
  } catch (error) {
    console.error('Error requesting LinkedIn verification:', error);
    res.status(500).json({ error: 'Failed to request LinkedIn verification' });
  }
};

// Get LinkedIn employment verifications
export const getLinkedInVerifications = async (req: Request, res: Response) => {
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

    const verifications = await prisma.linkedInEmploymentVerification.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ verifications });
  } catch (error) {
    console.error('Error fetching LinkedIn verifications:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn verifications' });
  }
};

// ============================================
// 1.3.3 - PEER ENDORSEMENTS
// ============================================

// Request peer endorsement
export const requestPeerEndorsement = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      endorserEmail,
      endorserName,
      endorserTitle,
      endorserCompany,
      relationship,
      workedAtCompany,
      workedTogetherFrom,
      workedTogetherTo,
      requestMessage,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!endorserEmail || !endorserName || !relationship) {
      return res.status(400).json({
        error: 'Endorser email, name, and relationship are required',
      });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Generate request ID and token
    const requestId = crypto.randomBytes(16).toString('hex');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const endorsement = await prisma.peerEndorsement.create({
      data: {
        profileId: profile.id,
        requestId,
        requestStatus: 'SENT',
        requestSentAt: new Date(),
        requestExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        requestMessage,
        endorserEmail,
        endorserName,
        endorserTitle,
        endorserCompany,
        relationship,
        workedAtCompany,
        workedTogetherFrom: workedTogetherFrom ? new Date(workedTogetherFrom) : null,
        workedTogetherTo: workedTogetherTo ? new Date(workedTogetherTo) : null,
        verificationToken,
      },
    });

    // TODO: Send email to endorser with link

    res.json({
      success: true,
      message: 'Endorsement request sent',
      endorsement: {
        id: endorsement.id,
        endorserEmail: endorsement.endorserEmail,
        endorserName: endorsement.endorserName,
        status: endorsement.requestStatus,
        requestSentAt: endorsement.requestSentAt,
        requestExpiresAt: endorsement.requestExpiresAt,
      },
    });
  } catch (error) {
    console.error('Error requesting peer endorsement:', error);
    res.status(500).json({ error: 'Failed to request peer endorsement' });
  }
};

// Submit peer endorsement (for endorser)
export const submitPeerEndorsement = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const {
      endorsementTitle,
      endorsementText,
      strengths,
      areasOfExpertise,
      skillEndorsements,
      overallRating,
      workQualityRating,
      collaborationRating,
      communicationRating,
      leadershipRating,
      technicalSkillsRating,
      reliabilityRating,
      wouldWorkAgain,
      wouldRecommend,
    } = req.body;

    const endorsement = await prisma.peerEndorsement.findUnique({
      where: { verificationToken: token },
    });

    if (!endorsement) {
      return res.status(404).json({ error: 'Endorsement request not found' });
    }

    if (endorsement.requestExpiresAt && new Date() > endorsement.requestExpiresAt) {
      await prisma.peerEndorsement.update({
        where: { id: endorsement.id },
        data: { requestStatus: 'EXPIRED' },
      });
      return res.status(400).json({ error: 'Endorsement request has expired' });
    }

    const updatedEndorsement = await prisma.peerEndorsement.update({
      where: { id: endorsement.id },
      data: {
        requestStatus: 'ACCEPTED',
        endorsementTitle,
        endorsementText,
        strengths: strengths || [],
        areasOfExpertise: areasOfExpertise || [],
        skillEndorsements,
        overallRating,
        workQualityRating,
        collaborationRating,
        communicationRating,
        leadershipRating,
        technicalSkillsRating,
        reliabilityRating,
        wouldWorkAgain,
        wouldRecommend,
        isVerified: true,
        verifiedAt: new Date(),
        verificationMethod: 'email',
        endorsedAt: new Date(),
      },
    });

    // Recalculate trust score
    await recalculateTrustScore(endorsement.profileId);

    res.json({
      success: true,
      message: 'Endorsement submitted successfully',
      endorsement: updatedEndorsement,
    });
  } catch (error) {
    console.error('Error submitting peer endorsement:', error);
    res.status(500).json({ error: 'Failed to submit peer endorsement' });
  }
};

// Get peer endorsements
export const getPeerEndorsements = async (req: Request, res: Response) => {
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

    const endorsements = await prisma.peerEndorsement.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ endorsements });
  } catch (error) {
    console.error('Error fetching peer endorsements:', error);
    res.status(500).json({ error: 'Failed to fetch peer endorsements' });
  }
};

// Delete peer endorsement
export const deletePeerEndorsement = async (req: Request, res: Response) => {
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

    await prisma.peerEndorsement.deleteMany({
      where: {
        id,
        profileId: profile.id,
      },
    });

    res.json({ success: true, message: 'Endorsement deleted' });
  } catch (error) {
    console.error('Error deleting peer endorsement:', error);
    res.status(500).json({ error: 'Failed to delete peer endorsement' });
  }
};

// ============================================
// 1.3.4 - MANAGER REFERENCES SYSTEM
// ============================================

// Request manager reference
export const requestManagerReference = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      workExperienceId,
      referenceEmail,
      referenceName,
      referenceTitle,
      referenceCompany,
      referencePhone,
      referenceLinkedIn,
      referenceRelationship,
      companyName,
      candidateTitle,
      employmentStartDate,
      employmentEndDate,
      requestMessage,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!referenceEmail || !referenceName || !referenceRelationship || !companyName || !candidateTitle) {
      return res.status(400).json({
        error: 'Reference email, name, relationship, company, and title are required',
      });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Generate request ID and token
    const requestId = crypto.randomBytes(16).toString('hex');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const reference = await prisma.managerReference.create({
      data: {
        profileId: profile.id,
        workExperienceId,
        requestId,
        requestStatus: 'SENT',
        requestSentAt: new Date(),
        requestExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        requestMessage,
        referenceEmail,
        referenceName,
        referenceTitle,
        referenceCompany,
        referencePhone,
        referenceLinkedIn,
        referenceRelationship,
        companyName,
        candidateTitle,
        employmentStartDate: employmentStartDate ? new Date(employmentStartDate) : null,
        employmentEndDate: employmentEndDate ? new Date(employmentEndDate) : null,
        verificationToken,
      },
    });

    // TODO: Send email to reference with link

    res.json({
      success: true,
      message: 'Reference request sent',
      reference: {
        id: reference.id,
        referenceEmail: reference.referenceEmail,
        referenceName: reference.referenceName,
        status: reference.requestStatus,
        requestSentAt: reference.requestSentAt,
        requestExpiresAt: reference.requestExpiresAt,
      },
    });
  } catch (error) {
    console.error('Error requesting manager reference:', error);
    res.status(500).json({ error: 'Failed to request manager reference' });
  }
};

// Submit manager reference (for reference provider)
export const submitManagerReference = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const {
      wasDirectReport,
      reportingDuration,
      overallPerformance,
      technicalCompetence,
      communicationSkills,
      teamworkCollaboration,
      problemSolving,
      leadership,
      initiative,
      reliability,
      adaptability,
      keyStrengths,
      areasForImprovement,
      majorAccomplishments,
      reasonForLeaving,
      additionalComments,
      eligibleForRehire,
      rehireComments,
      overallRecommendation,
      recommendationText,
    } = req.body;

    const reference = await prisma.managerReference.findUnique({
      where: { verificationToken: token },
    });

    if (!reference) {
      return res.status(404).json({ error: 'Reference request not found' });
    }

    if (reference.requestExpiresAt && new Date() > reference.requestExpiresAt) {
      await prisma.managerReference.update({
        where: { id: reference.id },
        data: { requestStatus: 'EXPIRED' },
      });
      return res.status(400).json({ error: 'Reference request has expired' });
    }

    const updatedReference = await prisma.managerReference.update({
      where: { id: reference.id },
      data: {
        requestStatus: 'COMPLETED',
        wasDirectReport,
        reportingDuration,
        overallPerformance,
        technicalCompetence,
        communicationSkills,
        teamworkCollaboration,
        problemSolving,
        leadership,
        initiative,
        reliability,
        adaptability,
        keyStrengths,
        areasForImprovement,
        majorAccomplishments,
        reasonForLeaving,
        additionalComments,
        eligibleForRehire,
        rehireComments,
        overallRecommendation,
        recommendationText,
        isVerified: true,
        verifiedAt: new Date(),
        verificationMethod: 'email',
        completedAt: new Date(),
      },
    });

    // Update work experience verification if linked
    if (reference.workExperienceId) {
      await prisma.workExperience.update({
        where: { id: reference.workExperienceId },
        data: {
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          verificationMethod: 'reference',
        },
      });
    }

    // Recalculate trust score
    await recalculateTrustScore(reference.profileId);

    res.json({
      success: true,
      message: 'Reference submitted successfully',
      reference: updatedReference,
    });
  } catch (error) {
    console.error('Error submitting manager reference:', error);
    res.status(500).json({ error: 'Failed to submit manager reference' });
  }
};

// Get manager references
export const getManagerReferences = async (req: Request, res: Response) => {
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

    const references = await prisma.managerReference.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ references });
  } catch (error) {
    console.error('Error fetching manager references:', error);
    res.status(500).json({ error: 'Failed to fetch manager references' });
  }
};

// Send reminder for reference request
export const sendReferenceReminder = async (req: Request, res: Response) => {
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

    const reference = await prisma.managerReference.findFirst({
      where: {
        id,
        profileId: profile.id,
        requestStatus: { in: ['SENT', 'IN_PROGRESS'] },
      },
    });

    if (!reference) {
      return res.status(404).json({ error: 'Reference request not found or already completed' });
    }

    await prisma.managerReference.update({
      where: { id },
      data: {
        reminderSentAt: new Date(),
        reminderCount: { increment: 1 },
      },
    });

    // TODO: Send reminder email

    res.json({
      success: true,
      message: 'Reminder sent successfully',
    });
  } catch (error) {
    console.error('Error sending reference reminder:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
};

// Delete manager reference
export const deleteManagerReference = async (req: Request, res: Response) => {
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

    await prisma.managerReference.deleteMany({
      where: {
        id,
        profileId: profile.id,
      },
    });

    res.json({ success: true, message: 'Reference deleted' });
  } catch (error) {
    console.error('Error deleting manager reference:', error);
    res.status(500).json({ error: 'Failed to delete manager reference' });
  }
};

// ============================================
// 1.3.5 - CERTIFICATION VERIFICATION
// ============================================

// Request certification verification
export const requestCertificationVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      certificationId,
      certificationName,
      issuingOrganization,
      credentialId,
      credentialUrl,
      issueDate,
      expirationDate,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!certificationId || !certificationName || !issuingOrganization || !issueDate) {
      return res.status(400).json({
        error: 'Certification ID, name, issuing organization, and issue date are required',
      });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Determine verification provider based on issuing organization
    const verificationProvider = determineVerificationProvider(issuingOrganization);

    const verification = await prisma.certificationVerification.upsert({
      where: { certificationId },
      create: {
        profileId: profile.id,
        certificationId,
        certificationName,
        issuingOrganization,
        credentialId,
        credentialUrl,
        issueDate: new Date(issueDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        verificationProvider,
        verificationStatus: 'PENDING',
      },
      update: {
        verificationStatus: 'PENDING',
        lastVerificationAttempt: new Date(),
      },
    });

    // TODO: Actually verify with API
    // For now, simulate verification

    res.json({
      success: true,
      message: 'Certification verification initiated',
      verification,
    });
  } catch (error) {
    console.error('Error requesting certification verification:', error);
    res.status(500).json({ error: 'Failed to request certification verification' });
  }
};

// Get certification verifications
export const getCertificationVerifications = async (req: Request, res: Response) => {
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

    const verifications = await prisma.certificationVerification.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ verifications });
  } catch (error) {
    console.error('Error fetching certification verifications:', error);
    res.status(500).json({ error: 'Failed to fetch certification verifications' });
  }
};

// ============================================
// TRUST SCORE
// ============================================

// Get trust score
export const getTrustScore = async (req: Request, res: Response) => {
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

    let trustScore = await prisma.trustScore.findUnique({
      where: { profileId: profile.id },
    });

    if (!trustScore) {
      // Create initial trust score
      trustScore = await recalculateTrustScore(profile.id);
    }

    res.json({ trustScore });
  } catch (error) {
    console.error('Error fetching trust score:', error);
    res.status(500).json({ error: 'Failed to fetch trust score' });
  }
};

// Recalculate trust score
export const refreshTrustScore = async (req: Request, res: Response) => {
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

    const trustScore = await recalculateTrustScore(profile.id);

    res.json({
      success: true,
      message: 'Trust score recalculated',
      trustScore,
    });
  } catch (error) {
    console.error('Error refreshing trust score:', error);
    res.status(500).json({ error: 'Failed to refresh trust score' });
  }
};

// Get verification status summary
export const getVerificationStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        emailVerifications: true,
        linkedInVerifications: true,
        peerEndorsements: true,
        managerReferences: true,
        certificationVerifications: true,
        trustScore: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const status = {
      emailVerifications: {
        total: profile.emailVerifications.length,
        verified: profile.emailVerifications.filter((v) => v.isVerified).length,
        pending: profile.emailVerifications.filter((v) => v.verificationStatus === 'PENDING' || v.verificationStatus === 'SENT').length,
      },
      linkedInVerifications: {
        total: profile.linkedInVerifications.length,
        verified: profile.linkedInVerifications.filter((v) => v.isVerified).length,
        pending: profile.linkedInVerifications.filter((v) => v.verificationStatus === 'PENDING').length,
      },
      peerEndorsements: {
        total: profile.peerEndorsements.length,
        received: profile.peerEndorsements.filter((e) => e.requestStatus === 'ACCEPTED').length,
        pending: profile.peerEndorsements.filter((e) => e.requestStatus === 'SENT').length,
      },
      managerReferences: {
        total: profile.managerReferences.length,
        completed: profile.managerReferences.filter((r) => r.requestStatus === 'COMPLETED').length,
        pending: profile.managerReferences.filter((r) => r.requestStatus === 'SENT' || r.requestStatus === 'IN_PROGRESS').length,
      },
      certificationVerifications: {
        total: profile.certificationVerifications.length,
        verified: profile.certificationVerifications.filter((v) => v.isVerified).length,
        pending: profile.certificationVerifications.filter((v) => v.verificationStatus === 'PENDING').length,
      },
      trustScore: profile.trustScore,
    };

    res.json({ status });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Recalculate trust score
async function recalculateTrustScore(profileId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: profileId },
    include: {
      emailVerifications: true,
      linkedInVerifications: true,
      peerEndorsements: true,
      managerReferences: true,
      certificationVerifications: true,
    },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Calculate component scores
  const verifiedEmails = profile.emailVerifications.filter((v) => v.isVerified).length;
  const verifiedEmployments = profile.linkedInVerifications.filter((v) => v.isVerified).length;
  const endorsementsReceived = profile.peerEndorsements.filter((e) => e.requestStatus === 'ACCEPTED').length;
  const referencesReceived = profile.managerReferences.filter((r) => r.requestStatus === 'COMPLETED').length;
  const verifiedCertifications = profile.certificationVerifications.filter((v) => v.isVerified).length;

  // Score weights
  const emailVerificationScore = Math.min(verifiedEmails * 10, 20);
  const linkedInVerificationScore = Math.min(verifiedEmployments * 15, 30);
  const endorsementScore = Math.min(endorsementsReceived * 5, 20);
  const referenceScore = Math.min(referencesReceived * 10, 20);
  const certificationScore = Math.min(verifiedCertifications * 5, 10);

  const overallScore = emailVerificationScore + linkedInVerificationScore + endorsementScore + referenceScore + certificationScore;

  // Determine tier
  let tier: string;
  if (overallScore >= 80) {
    tier = 'platinum';
  } else if (overallScore >= 60) {
    tier = 'gold';
  } else if (overallScore >= 40) {
    tier = 'silver';
  } else if (overallScore >= 20) {
    tier = 'bronze';
  } else {
    tier = 'unverified';
  }

  // Upsert trust score
  const trustScore = await prisma.trustScore.upsert({
    where: { profileId },
    create: {
      profileId,
      overallScore,
      tier,
      emailVerificationScore,
      linkedInVerificationScore,
      endorsementScore,
      referenceScore,
      certificationScore,
      verifiedEmails,
      verifiedEmployments,
      endorsementsReceived,
      referencesReceived,
      verifiedCertifications,
      hasVerifiedIdentity: verifiedEmails > 0,
      hasVerifiedEmployment: verifiedEmployments > 0,
      hasEndorsements: endorsementsReceived > 0,
      hasReferences: referencesReceived > 0,
      hasVerifiedCerts: verifiedCertifications > 0,
      lastCalculatedAt: new Date(),
    },
    update: {
      overallScore,
      tier,
      emailVerificationScore,
      linkedInVerificationScore,
      endorsementScore,
      referenceScore,
      certificationScore,
      verifiedEmails,
      verifiedEmployments,
      endorsementsReceived,
      referencesReceived,
      verifiedCertifications,
      hasVerifiedIdentity: verifiedEmails > 0,
      hasVerifiedEmployment: verifiedEmployments > 0,
      hasEndorsements: endorsementsReceived > 0,
      hasReferences: referencesReceived > 0,
      hasVerifiedCerts: verifiedCertifications > 0,
      lastCalculatedAt: new Date(),
    },
  });

  return trustScore;
}

// Determine verification provider based on issuing organization
function determineVerificationProvider(issuingOrganization: string): string | null {
  const org = issuingOrganization.toLowerCase();

  if (org.includes('microsoft') || org.includes('azure')) {
    return 'credly';
  }
  if (org.includes('aws') || org.includes('amazon')) {
    return 'credly';
  }
  if (org.includes('google')) {
    return 'credly';
  }
  if (org.includes('cisco')) {
    return 'credly';
  }
  if (org.includes('coursera')) {
    return 'coursera';
  }
  if (org.includes('udemy')) {
    return 'udemy';
  }
  if (org.includes('linkedin')) {
    return 'linkedin_learning';
  }

  return null;
}

export default {
  // Email verification
  requestEmailVerification,
  verifyEmailCode,
  getEmailVerifications,
  deleteEmailVerification,
  // LinkedIn verification
  requestLinkedInVerification,
  getLinkedInVerifications,
  // Peer endorsements
  requestPeerEndorsement,
  submitPeerEndorsement,
  getPeerEndorsements,
  deletePeerEndorsement,
  // Manager references
  requestManagerReference,
  submitManagerReference,
  getManagerReferences,
  sendReferenceReminder,
  deleteManagerReference,
  // Certification verification
  requestCertificationVerification,
  getCertificationVerifications,
  // Trust score
  getTrustScore,
  refreshTrustScore,
  getVerificationStatus,
};
