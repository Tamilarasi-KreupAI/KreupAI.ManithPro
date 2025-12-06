import { Response } from 'express';
import { PrismaClient, SkillProficiencyLevel } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate profile completeness score based on filled sections
 */
const calculateCompletenessScore = async (profileId: string): Promise<number> => {
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: profileId },
    include: {
      workExperiences: { take: 1 },
      educations: { take: 1 },
      skills: { take: 1 },
      projects: { take: 1 },
      certifications: { take: 1 },
    },
  });

  if (!profile) return 0;

  let score = 0;
  const weights = {
    basicInfo: 20,      // headline, summary, location
    workExperience: 25,
    education: 15,
    skills: 20,
    projects: 10,
    certifications: 5,
    socialLinks: 5,
  };

  // Basic info check (headline, summary, location)
  if (profile.headline) score += weights.basicInfo * 0.4;
  if (profile.summary) score += weights.basicInfo * 0.4;
  if (profile.city || profile.country) score += weights.basicInfo * 0.2;

  // Work experience check
  if (profile.workExperiences.length > 0) score += weights.workExperience;

  // Education check
  if (profile.educations.length > 0) score += weights.education;

  // Skills check
  if (profile.skills.length > 0) score += weights.skills;

  // Projects check
  if (profile.projects.length > 0) score += weights.projects;

  // Certifications check
  if (profile.certifications.length > 0) score += weights.certifications;

  // Social links check
  if (profile.github || profile.linkedin || profile.website) score += weights.socialLinks;

  return Math.round(score);
};

/**
 * Map proficiency level number to enum
 */
const getProficiencyLabel = (level: number): SkillProficiencyLevel => {
  if (level <= 2) return 'BEGINNER';
  if (level <= 4) return 'ELEMENTARY';
  if (level <= 6) return 'INTERMEDIATE';
  if (level <= 8) return 'ADVANCED';
  return 'EXPERT';
};

// ============================================
// 1.1.1 - STRUCTURED PROFILE BUILDER
// ============================================

/**
 * Get or create candidate profile
 */
export const getCandidateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        workExperiences: {
          orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
        },
        educations: {
          orderBy: [{ isOngoing: 'desc' }, { startDate: 'desc' }],
        },
        certifications: {
          orderBy: [{ issueDate: 'desc' }],
        },
        skills: {
          orderBy: [{ isPrimary: 'desc' }, { proficiencyLevel: 'desc' }],
          include: {
            endorsements: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
        projects: {
          orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
        },
        achievements: {
          orderBy: [{ isCompleted: 'desc' }, { earnedAt: 'desc' }],
        },
      },
    });

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: {
          userId: req.user.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          workExperiences: true,
          educations: true,
          certifications: true,
          skills: { include: { endorsements: true } },
          projects: true,
          achievements: true,
        },
      });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate profile' });
  }
};

/**
 * Get candidate profile by user ID (public view)
 */
export const getCandidateProfileById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        workExperiences: {
          where: { verificationStatus: { in: ['VERIFIED', 'PENDING'] } },
          orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
        },
        educations: {
          orderBy: [{ isOngoing: 'desc' }, { startDate: 'desc' }],
        },
        certifications: {
          orderBy: [{ issueDate: 'desc' }],
        },
        skills: {
          orderBy: [{ isPrimary: 'desc' }, { proficiencyLevel: 'desc' }],
          include: {
            endorsements: {
              where: { isVerified: true },
              take: 3,
            },
          },
        },
        projects: {
          where: { isPublic: true },
          orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
        },
        achievements: {
          where: { isCompleted: true },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    if (!profile.isPublic && req.user?.userId !== userId) {
      res.status(403).json({ error: 'This profile is private' });
      return;
    }

    // Hide salary expectation if setting is off
    if (!profile.showSalaryExpectation && req.user?.userId !== userId) {
      profile.expectedSalary = null;
      profile.expectedSalaryCurrency = null;
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get candidate profile by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate profile' });
  }
};

/**
 * Update candidate profile basic information
 */
export const updateCandidateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const {
      headline,
      summary,
      dateOfBirth,
      nationality,
      languages,
      address,
      city,
      state,
      country,
      zipCode,
      preferredLocation,
      willingToRelocate,
      remotePreference,
      expectedSalary,
      expectedSalaryCurrency,
      noticePeriod,
      availableFrom,
      jobTypes,
      industries,
      website,
      github,
      linkedin,
      twitter,
      stackoverflow,
      dribbble,
      behance,
      medium,
      kaggle,
      isPublic,
      allowMessages,
      showSalaryExpectation,
    } = req.body;

    // Upsert profile
    let profile = await prisma.candidateProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        headline,
        summary,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        nationality,
        languages,
        address,
        city,
        state,
        country,
        zipCode,
        preferredLocation,
        willingToRelocate,
        remotePreference,
        expectedSalary,
        expectedSalaryCurrency,
        noticePeriod,
        availableFrom: availableFrom ? new Date(availableFrom) : undefined,
        jobTypes,
        industries,
        website,
        github,
        linkedin,
        twitter,
        stackoverflow,
        dribbble,
        behance,
        medium,
        kaggle,
        isPublic,
        allowMessages,
        showSalaryExpectation,
      },
      create: {
        userId: req.user.userId,
        headline,
        summary,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        nationality,
        languages,
        address,
        city,
        state,
        country,
        zipCode,
        preferredLocation,
        willingToRelocate,
        remotePreference,
        expectedSalary,
        expectedSalaryCurrency,
        noticePeriod,
        availableFrom: availableFrom ? new Date(availableFrom) : undefined,
        jobTypes,
        industries,
        website,
        github,
        linkedin,
        twitter,
        stackoverflow,
        dribbble,
        behance,
        medium,
        kaggle,
        isPublic,
        allowMessages,
        showSalaryExpectation,
      },
    });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(profile.id);
    profile = await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    res.json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update candidate profile error:', error);
    res.status(500).json({ error: 'Failed to update candidate profile' });
  }
};

// ============================================
// 1.1.3 - EXPERIENCE TIMELINE
// ============================================

/**
 * Add work experience
 */
export const addWorkExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Ensure profile exists
    let profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: { userId: req.user.userId },
      });
    }

    const {
      companyName,
      companyLogo,
      companyWebsite,
      companyLinkedin,
      companySize,
      industry,
      title,
      employmentType,
      department,
      location,
      isRemote,
      startDate,
      endDate,
      isCurrent,
      description,
      responsibilities,
      achievements,
      technologies,
      skills,
      referenceEmail,
      teamSize,
      budget,
      revenue,
    } = req.body;

    if (!companyName || !title || !startDate || !employmentType) {
      res.status(400).json({ error: 'Company name, title, start date, and employment type are required' });
      return;
    }

    const workExperience = await prisma.workExperience.create({
      data: {
        profileId: profile.id,
        companyName,
        companyLogo,
        companyWebsite,
        companyLinkedin,
        companySize,
        industry,
        title,
        employmentType,
        department,
        location,
        isRemote: isRemote || false,
        startDate: new Date(startDate),
        endDate: endDate && !isCurrent ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        description,
        responsibilities: responsibilities || [],
        achievements: achievements || [],
        technologies: technologies || [],
        skills: skills || [],
        referenceEmail,
        teamSize,
        budget,
        revenue,
      },
    });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(profile.id);
    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    res.status(201).json({
      message: 'Work experience added successfully',
      workExperience,
    });
  } catch (error) {
    console.error('Add work experience error:', error);
    res.status(500).json({ error: 'Failed to add work experience' });
  }
};

/**
 * Update work experience
 */
export const updateWorkExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.workExperience.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Work experience not found' });
      return;
    }

    const {
      companyName,
      companyLogo,
      companyWebsite,
      companyLinkedin,
      companySize,
      industry,
      title,
      employmentType,
      department,
      location,
      isRemote,
      startDate,
      endDate,
      isCurrent,
      description,
      responsibilities,
      achievements,
      technologies,
      skills,
      referenceEmail,
      teamSize,
      budget,
      revenue,
      displayOrder,
    } = req.body;

    const workExperience = await prisma.workExperience.update({
      where: { id },
      data: {
        companyName,
        companyLogo,
        companyWebsite,
        companyLinkedin,
        companySize,
        industry,
        title,
        employmentType,
        department,
        location,
        isRemote,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate && !isCurrent ? new Date(endDate) : null,
        isCurrent,
        description,
        responsibilities,
        achievements,
        technologies,
        skills,
        referenceEmail,
        teamSize,
        budget,
        revenue,
        displayOrder,
      },
    });

    res.json({
      message: 'Work experience updated successfully',
      workExperience,
    });
  } catch (error) {
    console.error('Update work experience error:', error);
    res.status(500).json({ error: 'Failed to update work experience' });
  }
};

/**
 * Delete work experience
 */
export const deleteWorkExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.workExperience.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
      include: { profile: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Work experience not found' });
      return;
    }

    await prisma.workExperience.delete({ where: { id } });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(existing.profileId);
    await prisma.candidateProfile.update({
      where: { id: existing.profileId },
      data: { completenessScore },
    });

    res.json({ message: 'Work experience deleted successfully' });
  } catch (error) {
    console.error('Delete work experience error:', error);
    res.status(500).json({ error: 'Failed to delete work experience' });
  }
};

/**
 * Get work experience timeline
 */
export const getWorkExperienceTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      res.json({ experiences: [] });
      return;
    }

    const experiences = await prisma.workExperience.findMany({
      where: { profileId: profile.id },
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    });

    // Calculate total experience
    let totalMonths = 0;
    experiences.forEach((exp) => {
      const end = exp.isCurrent ? new Date() : exp.endDate || new Date();
      const months = (end.getFullYear() - exp.startDate.getFullYear()) * 12 +
        (end.getMonth() - exp.startDate.getMonth());
      totalMonths += Math.max(0, months);
    });

    const totalYears = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    res.json({
      experiences,
      summary: {
        totalExperiences: experiences.length,
        totalYears,
        totalMonths: remainingMonths,
        totalExperienceString: `${totalYears} years${remainingMonths > 0 ? ` ${remainingMonths} months` : ''}`,
      },
    });
  } catch (error) {
    console.error('Get work experience timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch work experience timeline' });
  }
};

// ============================================
// 1.1.4 - EDUCATION & CERTIFICATIONS HUB
// ============================================

/**
 * Add education
 */
export const addEducation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: { userId: req.user.userId },
      });
    }

    const {
      institutionName,
      institutionLogo,
      institutionWebsite,
      institutionLocation,
      institutionType,
      degree,
      fieldOfStudy,
      specialization,
      startDate,
      endDate,
      isOngoing,
      grade,
      gradeScale,
      activities,
      achievements,
      thesis,
      thesisDescription,
      courseProjects,
      certificateUrl,
    } = req.body;

    if (!institutionName || !degree || !fieldOfStudy || !startDate) {
      res.status(400).json({ error: 'Institution name, degree, field of study, and start date are required' });
      return;
    }

    const education = await prisma.education.create({
      data: {
        profileId: profile.id,
        institutionName,
        institutionLogo,
        institutionWebsite,
        institutionLocation,
        institutionType,
        degree,
        fieldOfStudy,
        specialization,
        startDate: new Date(startDate),
        endDate: endDate && !isOngoing ? new Date(endDate) : null,
        isOngoing: isOngoing || false,
        grade,
        gradeScale,
        activities: activities || [],
        achievements: achievements || [],
        thesis,
        thesisDescription,
        courseProjects,
        certificateUrl,
      },
    });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(profile.id);
    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    res.status(201).json({
      message: 'Education added successfully',
      education,
    });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ error: 'Failed to add education' });
  }
};

/**
 * Update education
 */
export const updateEducation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.education.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Education not found' });
      return;
    }

    const education = await prisma.education.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: 'Education updated successfully',
      education,
    });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ error: 'Failed to update education' });
  }
};

/**
 * Delete education
 */
export const deleteEducation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.education.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Education not found' });
      return;
    }

    await prisma.education.delete({ where: { id } });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(existing.profileId);
    await prisma.candidateProfile.update({
      where: { id: existing.profileId },
      data: { completenessScore },
    });

    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ error: 'Failed to delete education' });
  }
};

/**
 * Add certification
 */
export const addCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: { userId: req.user.userId },
      });
    }

    const {
      name,
      issuingOrganization,
      organizationLogo,
      organizationWebsite,
      credentialId,
      credentialUrl,
      issueDate,
      expirationDate,
      doesNotExpire,
      description,
      skills,
    } = req.body;

    if (!name || !issuingOrganization || !issueDate) {
      res.status(400).json({ error: 'Name, issuing organization, and issue date are required' });
      return;
    }

    const certification = await prisma.certification.create({
      data: {
        profileId: profile.id,
        name,
        issuingOrganization,
        organizationLogo,
        organizationWebsite,
        credentialId,
        credentialUrl,
        issueDate: new Date(issueDate),
        expirationDate: expirationDate && !doesNotExpire ? new Date(expirationDate) : null,
        doesNotExpire: doesNotExpire || false,
        description,
        skills: skills || [],
      },
    });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(profile.id);
    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    res.status(201).json({
      message: 'Certification added successfully',
      certification,
    });
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({ error: 'Failed to add certification' });
  }
};

/**
 * Update certification
 */
export const updateCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.certification.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }

    const certification = await prisma.certification.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: 'Certification updated successfully',
      certification,
    });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({ error: 'Failed to update certification' });
  }
};

/**
 * Delete certification
 */
export const deleteCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.certification.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }

    await prisma.certification.delete({ where: { id } });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(existing.profileId);
    await prisma.candidateProfile.update({
      where: { id: existing.profileId },
      data: { completenessScore },
    });

    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({ error: 'Failed to delete certification' });
  }
};

// ============================================
// 1.1.2 - DYNAMIC SKILLS MATRIX
// ============================================

/**
 * Add skill
 */
export const addSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: { userId: req.user.userId },
      });
    }

    const {
      name,
      category,
      subcategory,
      proficiencyLevel,
      yearsOfExperience,
      lastUsed,
      projects,
      certifications,
      tags,
      isPrimary,
    } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Skill name is required' });
      return;
    }

    // Check if skill already exists
    const existingSkill = await prisma.candidateSkill.findFirst({
      where: {
        profileId: profile.id,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existingSkill) {
      res.status(400).json({ error: 'Skill already exists in your profile' });
      return;
    }

    const level = proficiencyLevel || 5;
    const skill = await prisma.candidateSkill.create({
      data: {
        profileId: profile.id,
        name,
        category,
        subcategory,
        proficiencyLevel: level,
        proficiencyLabel: getProficiencyLabel(level),
        yearsOfExperience,
        lastUsed: lastUsed ? new Date(lastUsed) : null,
        projects: projects || [],
        certifications: certifications || [],
        tags: tags || [],
        isPrimary: isPrimary || false,
      },
    });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(profile.id);
    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    res.status(201).json({
      message: 'Skill added successfully',
      skill,
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
};

/**
 * Update skill
 */
export const updateSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.candidateSkill.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    const { proficiencyLevel, ...otherData } = req.body;

    const skill = await prisma.candidateSkill.update({
      where: { id },
      data: {
        ...otherData,
        proficiencyLevel,
        proficiencyLabel: proficiencyLevel ? getProficiencyLabel(proficiencyLevel) : undefined,
      },
    });

    res.json({
      message: 'Skill updated successfully',
      skill,
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
};

/**
 * Delete skill
 */
export const deleteSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.candidateSkill.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    await prisma.candidateSkill.delete({ where: { id } });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(existing.profileId);
    await prisma.candidateProfile.update({
      where: { id: existing.profileId },
      data: { completenessScore },
    });

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
};

/**
 * Bulk add skills
 */
export const bulkAddSkills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: { userId: req.user.userId },
      });
    }

    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      res.status(400).json({ error: 'Skills array is required' });
      return;
    }

    // Get existing skills to avoid duplicates
    const existingSkills = await prisma.candidateSkill.findMany({
      where: { profileId: profile.id },
      select: { name: true },
    });
    const existingNames = new Set(existingSkills.map((s) => s.name.toLowerCase()));

    // Filter out duplicates and prepare data
    const newSkillsData = skills
      .filter((s: any) => !existingNames.has(s.name.toLowerCase()))
      .map((s: any) => ({
        profileId: profile!.id,
        name: s.name,
        category: s.category || null,
        subcategory: s.subcategory || null,
        proficiencyLevel: s.proficiencyLevel || 5,
        proficiencyLabel: getProficiencyLabel(s.proficiencyLevel || 5),
        yearsOfExperience: s.yearsOfExperience || null,
        tags: s.tags || [],
        isPrimary: s.isPrimary || false,
      }));

    if (newSkillsData.length === 0) {
      res.status(400).json({ error: 'All skills already exist in your profile' });
      return;
    }

    await prisma.candidateSkill.createMany({
      data: newSkillsData,
    });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(profile.id);
    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    res.status(201).json({
      message: `${newSkillsData.length} skills added successfully`,
      addedCount: newSkillsData.length,
      skippedCount: skills.length - newSkillsData.length,
    });
  } catch (error) {
    console.error('Bulk add skills error:', error);
    res.status(500).json({ error: 'Failed to add skills' });
  }
};

/**
 * Get skills matrix (grouped by category)
 */
export const getSkillsMatrix = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      res.json({ matrix: {}, summary: { total: 0 } });
      return;
    }

    const skills = await prisma.candidateSkill.findMany({
      where: { profileId: profile.id },
      include: {
        endorsements: {
          select: {
            id: true,
            endorserName: true,
            endorserTitle: true,
            relationship: true,
            createdAt: true,
          },
          take: 3,
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { proficiencyLevel: 'desc' }],
    });

    // Group by category
    const matrix: Record<string, typeof skills> = {};
    skills.forEach((skill) => {
      const category = skill.category || 'Other';
      if (!matrix[category]) {
        matrix[category] = [];
      }
      matrix[category].push(skill);
    });

    // Calculate summary
    const summary = {
      total: skills.length,
      byProficiency: {
        beginner: skills.filter((s) => s.proficiencyLevel <= 2).length,
        elementary: skills.filter((s) => s.proficiencyLevel > 2 && s.proficiencyLevel <= 4).length,
        intermediate: skills.filter((s) => s.proficiencyLevel > 4 && s.proficiencyLevel <= 6).length,
        advanced: skills.filter((s) => s.proficiencyLevel > 6 && s.proficiencyLevel <= 8).length,
        expert: skills.filter((s) => s.proficiencyLevel > 8).length,
      },
      primarySkills: skills.filter((s) => s.isPrimary),
      totalEndorsements: skills.reduce((sum, s) => sum + s.endorsementCount, 0),
    };

    res.json({ matrix, summary });
  } catch (error) {
    console.error('Get skills matrix error:', error);
    res.status(500).json({ error: 'Failed to fetch skills matrix' });
  }
};

/**
 * Endorse a skill
 */
export const endorseSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { skillId } = req.params;
    const { comment, rating, relationship } = req.body;

    // Get the skill
    const skill = await prisma.candidateSkill.findUnique({
      where: { id: skillId },
      include: { profile: true },
    });

    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    // Can't endorse your own skill
    if (skill.profile.userId === req.user.userId) {
      res.status(400).json({ error: 'You cannot endorse your own skill' });
      return;
    }

    // Get endorser info
    const endorser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        firstName: true,
        lastName: true,
        linkedIn: true,
      },
    });

    if (!endorser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if already endorsed
    const existingEndorsement = await prisma.skillEndorsement.findFirst({
      where: {
        skillId,
        endorserId: req.user.userId,
      },
    });

    if (existingEndorsement) {
      res.status(400).json({ error: 'You have already endorsed this skill' });
      return;
    }

    // Create endorsement
    const endorsement = await prisma.skillEndorsement.create({
      data: {
        skillId,
        endorserId: req.user.userId,
        endorserName: `${endorser.firstName} ${endorser.lastName}`,
        endorserLinkedin: endorser.linkedIn,
        relationship,
        comment,
        rating,
      },
    });

    // Update endorsement count
    await prisma.candidateSkill.update({
      where: { id: skillId },
      data: {
        endorsementCount: { increment: 1 },
      },
    });

    res.status(201).json({
      message: 'Skill endorsed successfully',
      endorsement,
    });
  } catch (error) {
    console.error('Endorse skill error:', error);
    res.status(500).json({ error: 'Failed to endorse skill' });
  }
};

// ============================================
// 1.1.5 - PROJECT PORTFOLIO
// ============================================

/**
 * Add project
 */
export const addProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: { userId: req.user.userId },
      });
    }

    const {
      title,
      shortDescription,
      description,
      projectType,
      status,
      startDate,
      endDate,
      isOngoing,
      technologies,
      frameworks,
      languages,
      tools,
      repositoryUrl,
      liveUrl,
      demoUrl,
      documentationUrl,
      thumbnailUrl,
      images,
      videos,
      role,
      teamSize,
      contributions,
      impact,
      users,
      downloads,
      stars,
      forks,
      workExperienceId,
      isPublic,
      isFeatured,
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Project title is required' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        profileId: profile.id,
        title,
        shortDescription,
        description,
        projectType,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate && !isOngoing ? new Date(endDate) : null,
        isOngoing: isOngoing || false,
        technologies: technologies || [],
        frameworks: frameworks || [],
        languages: languages || [],
        tools: tools || [],
        repositoryUrl,
        liveUrl,
        demoUrl,
        documentationUrl,
        thumbnailUrl,
        images: images || [],
        videos: videos || [],
        role,
        teamSize,
        contributions: contributions || [],
        impact,
        users,
        downloads,
        stars,
        forks,
        workExperienceId,
        isPublic: isPublic !== false,
        isFeatured: isFeatured || false,
      },
    });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(profile.id);
    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    res.status(201).json({
      message: 'Project added successfully',
      project,
    });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
};

/**
 * Update project
 */
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.project.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

/**
 * Delete project
 */
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.project.findFirst({
      where: {
        id,
        profile: { userId: req.user.userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id } });

    // Update completeness score
    const completenessScore = await calculateCompletenessScore(existing.profileId);
    await prisma.candidateProfile.update({
      where: { id: existing.profileId },
      data: { completenessScore },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

/**
 * Get portfolio
 */
export const getPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      res.json({ projects: [], summary: { total: 0 } });
      return;
    }

    const projects = await prisma.project.findMany({
      where: { profileId: profile.id },
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    // Collect all unique technologies
    const allTechnologies = new Set<string>();
    projects.forEach((p) => {
      p.technologies.forEach((t) => allTechnologies.add(t));
      p.frameworks.forEach((f) => allTechnologies.add(f));
      p.languages.forEach((l) => allTechnologies.add(l));
    });

    const summary = {
      total: projects.length,
      featured: projects.filter((p) => p.isFeatured).length,
      byType: {
        personal: projects.filter((p) => p.projectType === 'personal').length,
        professional: projects.filter((p) => p.projectType === 'professional').length,
        openSource: projects.filter((p) => p.projectType === 'open-source').length,
        freelance: projects.filter((p) => p.projectType === 'freelance').length,
        academic: projects.filter((p) => p.projectType === 'academic').length,
      },
      technologies: Array.from(allTechnologies),
    };

    res.json({ projects, summary });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

/**
 * Reorder projects
 */
export const reorderProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { projectIds } = req.body;

    if (!Array.isArray(projectIds)) {
      res.status(400).json({ error: 'Project IDs array is required' });
      return;
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // Update display order for each project
    await Promise.all(
      projectIds.map((id, index) =>
        prisma.project.updateMany({
          where: {
            id,
            profileId: profile.id,
          },
          data: { displayOrder: index },
        })
      )
    );

    res.json({ message: 'Projects reordered successfully' });
  } catch (error) {
    console.error('Reorder projects error:', error);
    res.status(500).json({ error: 'Failed to reorder projects' });
  }
};

// ============================================
// PROFILE COMPLETENESS & SUGGESTIONS
// ============================================

/**
 * Get profile completeness score and suggestions
 */
export const getProfileCompleteness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        workExperiences: { take: 1 },
        educations: { take: 1 },
        skills: { take: 1 },
        projects: { take: 1 },
        certifications: { take: 1 },
      },
    });

    if (!profile) {
      res.json({
        score: 0,
        sections: {},
        suggestions: ['Create your profile to get started'],
      });
      return;
    }

    const sections = {
      basicInfo: {
        completed: !!(profile.headline && profile.summary),
        weight: 20,
        items: {
          headline: !!profile.headline,
          summary: !!profile.summary,
          location: !!(profile.city || profile.country),
        },
      },
      workExperience: {
        completed: profile.workExperiences.length > 0,
        weight: 25,
        count: profile.workExperiences.length,
      },
      education: {
        completed: profile.educations.length > 0,
        weight: 15,
        count: profile.educations.length,
      },
      skills: {
        completed: profile.skills.length > 0,
        weight: 20,
        count: profile.skills.length,
      },
      projects: {
        completed: profile.projects.length > 0,
        weight: 10,
        count: profile.projects.length,
      },
      certifications: {
        completed: profile.certifications.length > 0,
        weight: 5,
        count: profile.certifications.length,
      },
      socialLinks: {
        completed: !!(profile.github || profile.linkedin || profile.website),
        weight: 5,
        items: {
          github: !!profile.github,
          linkedin: !!profile.linkedin,
          website: !!profile.website,
        },
      },
    };

    const suggestions: string[] = [];
    if (!profile.headline) suggestions.push('Add a professional headline to stand out');
    if (!profile.summary) suggestions.push('Write a compelling professional summary');
    if (profile.workExperiences.length === 0) suggestions.push('Add your work experience');
    if (profile.educations.length === 0) suggestions.push('Add your educational background');
    if (profile.skills.length === 0) suggestions.push('Add your skills to showcase your expertise');
    if (profile.skills.length < 5) suggestions.push('Add more skills (aim for at least 5)');
    if (profile.projects.length === 0) suggestions.push('Showcase your projects to demonstrate your work');
    if (!profile.github && !profile.linkedin) suggestions.push('Link your GitHub or LinkedIn profile');

    res.json({
      score: profile.completenessScore,
      sections,
      suggestions: suggestions.slice(0, 5), // Top 5 suggestions
    });
  } catch (error) {
    console.error('Get profile completeness error:', error);
    res.status(500).json({ error: 'Failed to fetch profile completeness' });
  }
};
