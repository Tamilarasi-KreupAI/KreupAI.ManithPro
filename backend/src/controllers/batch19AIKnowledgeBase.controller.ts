import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 4.3.1 - COMPANY KNOWLEDGE IMPORT
// ============================================

// Create company knowledge document
export const createCompanyKnowledge = async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      documentType,
      title,
      description,
      content,
      contentFormat,
      sourceUrl,
      filePath,
      category,
      subcategory,
      tags,
      isPublic,
      allowedRoles,
    } = req.body;

    const userId = (req as any).user?.id;

    const knowledge = await prisma.companyKnowledge.create({
      data: {
        companyName,
        documentType,
        title,
        description,
        content,
        contentFormat: contentFormat || 'TEXT',
        sourceUrl,
        filePath,
        category,
        subcategory,
        tags: tags || [],
        isPublic: isPublic || false,
        allowedRoles: allowedRoles || [],
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'Company knowledge document created',
      knowledge,
    });
  } catch (error) {
    console.error('Error creating company knowledge:', error);
    res.status(500).json({ error: 'Failed to create company knowledge document' });
  }
};

// Get company knowledge documents
export const getCompanyKnowledge = async (req: Request, res: Response) => {
  try {
    const { companyName, documentType, category, isPublic } = req.query;

    const where: any = { isActive: true };
    if (companyName) where.companyName = companyName;
    if (documentType) where.documentType = documentType;
    if (category) where.category = category;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const documents = await prisma.companyKnowledge.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching company knowledge:', error);
    res.status(500).json({ error: 'Failed to fetch company knowledge' });
  }
};

// Get company knowledge by ID
export const getCompanyKnowledgeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.companyKnowledge.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error fetching company knowledge:', error);
    res.status(500).json({ error: 'Failed to fetch company knowledge' });
  }
};

// Update company knowledge
export const updateCompanyKnowledge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const document = await prisma.companyKnowledge.update({
      where: { id },
      data: {
        ...updates,
        version: { increment: 1 },
      },
    });

    res.json({ message: 'Document updated', document });
  } catch (error) {
    console.error('Error updating company knowledge:', error);
    res.status(500).json({ error: 'Failed to update company knowledge' });
  }
};

// Process company knowledge (AI extraction)
export const processCompanyKnowledge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.companyKnowledge.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Simulate AI processing
    const extractedTopics = ['company values', 'work culture', 'benefits'];
    const extractedKeywords = ['innovation', 'collaboration', 'growth'];
    const summaryText = `Summary of ${document.title}: This document covers key aspects of the company's ${document.category.toLowerCase()} information.`;

    const updated = await prisma.companyKnowledge.update({
      where: { id },
      data: {
        isProcessed: true,
        processedAt: new Date(),
        extractedTopics,
        extractedKeywords,
        summaryText,
      },
    });

    res.json({ message: 'Document processed', document: updated });
  } catch (error) {
    console.error('Error processing company knowledge:', error);
    res.status(500).json({ error: 'Failed to process company knowledge' });
  }
};

// Delete company knowledge
export const deleteCompanyKnowledge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.companyKnowledge.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting company knowledge:', error);
    res.status(500).json({ error: 'Failed to delete company knowledge' });
  }
};

// ============================================
// 4.3.2 - ROLE-SPECIFIC KNOWLEDGE
// ============================================

// Create role-specific knowledge
export const createRoleKnowledge = async (req: Request, res: Response) => {
  try {
    const {
      jobId,
      roleTitle,
      department,
      seniorityLevel,
      teamName,
      teamSize,
      teamDescription,
      reportingTo,
      directReports,
      teamDynamics,
      requiredSkills,
      preferredSkills,
      technicalStack,
      toolsUsed,
      dailyResponsibilities,
      projectTypes,
      collaboratesWithTeams,
      meetingCadence,
      currentChallenges,
      growthOpportunities,
      successMetrics,
      domainKnowledge,
      industrySpecifics,
      complianceRequirements,
    } = req.body;

    const userId = (req as any).user?.id;

    const knowledge = await prisma.roleSpecificKnowledge.create({
      data: {
        jobId,
        roleTitle,
        department,
        seniorityLevel,
        teamName,
        teamSize,
        teamDescription,
        reportingTo,
        directReports,
        teamDynamics,
        requiredSkills: requiredSkills || {},
        preferredSkills,
        technicalStack: technicalStack || [],
        toolsUsed: toolsUsed || [],
        dailyResponsibilities: dailyResponsibilities || [],
        projectTypes: projectTypes || [],
        collaboratesWithTeams: collaboratesWithTeams || [],
        meetingCadence,
        currentChallenges: currentChallenges || [],
        growthOpportunities: growthOpportunities || [],
        successMetrics: successMetrics || [],
        domainKnowledge: domainKnowledge || [],
        industrySpecifics,
        complianceRequirements: complianceRequirements || [],
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'Role-specific knowledge created',
      knowledge,
    });
  } catch (error) {
    console.error('Error creating role knowledge:', error);
    res.status(500).json({ error: 'Failed to create role-specific knowledge' });
  }
};

// Get role-specific knowledge
export const getRoleKnowledge = async (req: Request, res: Response) => {
  try {
    const { jobId, roleTitle, department, seniorityLevel } = req.query;

    const where: any = { isActive: true };
    if (jobId) where.jobId = jobId;
    if (roleTitle) where.roleTitle = { contains: roleTitle as string, mode: 'insensitive' };
    if (department) where.department = department;
    if (seniorityLevel) where.seniorityLevel = seniorityLevel;

    const knowledge = await prisma.roleSpecificKnowledge.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ knowledge });
  } catch (error) {
    console.error('Error fetching role knowledge:', error);
    res.status(500).json({ error: 'Failed to fetch role-specific knowledge' });
  }
};

// Get role knowledge by ID
export const getRoleKnowledgeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const knowledge = await prisma.roleSpecificKnowledge.findUnique({
      where: { id },
    });

    if (!knowledge) {
      return res.status(404).json({ error: 'Role knowledge not found' });
    }

    res.json({ knowledge });
  } catch (error) {
    console.error('Error fetching role knowledge:', error);
    res.status(500).json({ error: 'Failed to fetch role knowledge' });
  }
};

// Update role knowledge
export const updateRoleKnowledge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const knowledge = await prisma.roleSpecificKnowledge.update({
      where: { id },
      data: updates,
    });

    res.json({ message: 'Role knowledge updated', knowledge });
  } catch (error) {
    console.error('Error updating role knowledge:', error);
    res.status(500).json({ error: 'Failed to update role knowledge' });
  }
};

// Delete role knowledge
export const deleteRoleKnowledge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.roleSpecificKnowledge.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Role knowledge deleted' });
  } catch (error) {
    console.error('Error deleting role knowledge:', error);
    res.status(500).json({ error: 'Failed to delete role knowledge' });
  }
};

// ============================================
// 4.3.3 - INTERVIEW PLAYBOOKS
// ============================================

// Create interview playbook
export const createPlaybook = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      roleTitle,
      department,
      seniorityLevel,
      interviewType,
      duration,
      sections,
      questionSequence,
      requiredQuestions,
      optionalQuestions,
      followUpBank,
      evaluationCriteria,
      scoringGuide,
      mustPassCriteria,
      redFlagIndicators,
      greenFlagIndicators,
      interviewerTips,
      openingScript,
      closingScript,
      transitionPhrases,
      timeBreakdown,
      paceGuidance,
      notesTakingTemplate,
      feedbackFormTemplate,
      isTemplate,
    } = req.body;

    const userId = (req as any).user?.id;

    const playbook = await prisma.interviewPlaybook.create({
      data: {
        name,
        description,
        roleTitle,
        department,
        seniorityLevel,
        interviewType,
        duration: duration || 60,
        sections: sections || [],
        questionSequence: questionSequence || [],
        requiredQuestions,
        optionalQuestions,
        followUpBank,
        evaluationCriteria: evaluationCriteria || {},
        scoringGuide,
        mustPassCriteria: mustPassCriteria || [],
        redFlagIndicators: redFlagIndicators || [],
        greenFlagIndicators: greenFlagIndicators || [],
        interviewerTips: interviewerTips || [],
        openingScript,
        closingScript,
        transitionPhrases: transitionPhrases || [],
        timeBreakdown,
        paceGuidance,
        notesTakingTemplate,
        feedbackFormTemplate,
        isTemplate: isTemplate || false,
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'Interview playbook created',
      playbook,
    });
  } catch (error) {
    console.error('Error creating playbook:', error);
    res.status(500).json({ error: 'Failed to create interview playbook' });
  }
};

// Get playbooks
export const getPlaybooks = async (req: Request, res: Response) => {
  try {
    const { roleTitle, interviewType, seniorityLevel, isTemplate } = req.query;

    const where: any = { isActive: true };
    if (roleTitle) where.roleTitle = { contains: roleTitle as string, mode: 'insensitive' };
    if (interviewType) where.interviewType = interviewType;
    if (seniorityLevel) where.seniorityLevel = seniorityLevel;
    if (isTemplate !== undefined) where.isTemplate = isTemplate === 'true';

    const playbooks = await prisma.interviewPlaybook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ playbooks });
  } catch (error) {
    console.error('Error fetching playbooks:', error);
    res.status(500).json({ error: 'Failed to fetch playbooks' });
  }
};

// Get playbook by ID
export const getPlaybookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const playbook = await prisma.interviewPlaybook.findUnique({
      where: { id },
    });

    if (!playbook) {
      return res.status(404).json({ error: 'Playbook not found' });
    }

    // Increment usage count
    await prisma.interviewPlaybook.update({
      where: { id },
      data: { timesUsed: { increment: 1 } },
    });

    res.json({ playbook });
  } catch (error) {
    console.error('Error fetching playbook:', error);
    res.status(500).json({ error: 'Failed to fetch playbook' });
  }
};

// Update playbook
export const updatePlaybook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const playbook = await prisma.interviewPlaybook.update({
      where: { id },
      data: updates,
    });

    res.json({ message: 'Playbook updated', playbook });
  } catch (error) {
    console.error('Error updating playbook:', error);
    res.status(500).json({ error: 'Failed to update playbook' });
  }
};

// Clone playbook
export const clonePlaybook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = (req as any).user?.id;

    const original = await prisma.interviewPlaybook.findUnique({
      where: { id },
    });

    if (!original) {
      return res.status(404).json({ error: 'Playbook not found' });
    }

    const { id: _, createdAt, updatedAt, timesUsed, averageRating, ...rest } = original as any;

    const clone = await prisma.interviewPlaybook.create({
      data: {
        ...rest,
        name: name || `${original.name} (Copy)`,
        isTemplate: false,
        createdById: userId,
      },
    });

    res.status(201).json({ message: 'Playbook cloned', playbook: clone });
  } catch (error) {
    console.error('Error cloning playbook:', error);
    res.status(500).json({ error: 'Failed to clone playbook' });
  }
};

// Delete playbook
export const deletePlaybook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.interviewPlaybook.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Playbook deleted' });
  } catch (error) {
    console.error('Error deleting playbook:', error);
    res.status(500).json({ error: 'Failed to delete playbook' });
  }
};

// ============================================
// 4.3.4 - BEST PRACTICES LIBRARY
// ============================================

// Create best practice
export const createBestPractice = async (req: Request, res: Response) => {
  try {
    const {
      practiceType,
      category,
      subcategory,
      title,
      description,
      detailedExplanation,
      exampleScenario,
      goodExample,
      badExample,
      applicableRoles,
      applicableSeniorityLevels,
      applicableInterviewTypes,
      dosList,
      dontsList,
      commonMistakes,
      sourceReference,
      tags,
      keywords,
    } = req.body;

    const userId = (req as any).user?.id;

    const practice = await prisma.bestPractice.create({
      data: {
        practiceType,
        category,
        subcategory,
        title,
        description,
        detailedExplanation,
        exampleScenario,
        goodExample,
        badExample,
        applicableRoles: applicableRoles || [],
        applicableSeniorityLevels: applicableSeniorityLevels || [],
        applicableInterviewTypes: applicableInterviewTypes || [],
        dosList: dosList || [],
        dontsList: dontsList || [],
        commonMistakes: commonMistakes || [],
        sourceReference,
        tags: tags || [],
        keywords: keywords || [],
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'Best practice created',
      practice,
    });
  } catch (error) {
    console.error('Error creating best practice:', error);
    res.status(500).json({ error: 'Failed to create best practice' });
  }
};

// Get best practices
export const getBestPractices = async (req: Request, res: Response) => {
  try {
    const { practiceType, category, isVerified } = req.query;

    const where: any = { isActive: true };
    if (practiceType) where.practiceType = practiceType;
    if (category) where.category = category;
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';

    const practices = await prisma.bestPractice.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ practices });
  } catch (error) {
    console.error('Error fetching best practices:', error);
    res.status(500).json({ error: 'Failed to fetch best practices' });
  }
};

// Get best practice by ID
export const getBestPracticeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const practice = await prisma.bestPractice.findUnique({
      where: { id },
    });

    if (!practice) {
      return res.status(404).json({ error: 'Best practice not found' });
    }

    // Increment usage count
    await prisma.bestPractice.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    res.json({ practice });
  } catch (error) {
    console.error('Error fetching best practice:', error);
    res.status(500).json({ error: 'Failed to fetch best practice' });
  }
};

// Update best practice
export const updateBestPractice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const practice = await prisma.bestPractice.update({
      where: { id },
      data: updates,
    });

    res.json({ message: 'Best practice updated', practice });
  } catch (error) {
    console.error('Error updating best practice:', error);
    res.status(500).json({ error: 'Failed to update best practice' });
  }
};

// Rate best practice
export const rateBestPractice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const practice = await prisma.bestPractice.findUnique({
      where: { id },
    });

    if (!practice) {
      return res.status(404).json({ error: 'Best practice not found' });
    }

    // Calculate new average rating
    const newRatingsCount = practice.ratingsCount + 1;
    const newRating = ((practice.rating * practice.ratingsCount) + rating) / newRatingsCount;

    const updated = await prisma.bestPractice.update({
      where: { id },
      data: {
        rating: newRating,
        ratingsCount: newRatingsCount,
      },
    });

    res.json({ message: 'Rating submitted', practice: updated });
  } catch (error) {
    console.error('Error rating best practice:', error);
    res.status(500).json({ error: 'Failed to rate best practice' });
  }
};

// Verify best practice
export const verifyBestPractice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const practice = await prisma.bestPractice.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedById: userId,
      },
    });

    res.json({ message: 'Best practice verified', practice });
  } catch (error) {
    console.error('Error verifying best practice:', error);
    res.status(500).json({ error: 'Failed to verify best practice' });
  }
};

// Delete best practice
export const deleteBestPractice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.bestPractice.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Best practice deleted' });
  } catch (error) {
    console.error('Error deleting best practice:', error);
    res.status(500).json({ error: 'Failed to delete best practice' });
  }
};

// ============================================
// 4.3.5 - COMPETITOR INTELLIGENCE
// ============================================

// Create competitor intelligence
export const createCompetitorIntel = async (req: Request, res: Response) => {
  try {
    const {
      competitorName,
      competitorWebsite,
      industry,
      ourCompany,
      competitorSize,
      marketPosition,
      intelligenceType,
      salaryRanges,
      bonusStructure,
      equityOfferings,
      benefitsOffered,
      uniquePerks,
      benefitComparison,
      cultureHighlights,
      workArrangement,
      glassdoorRating,
      reviewSummary,
      techStackUsed,
      recentTechAdoptions,
      hiringVelocity,
      openPositionsCount,
      talentFocusAreas,
      hiringChallenges,
      talentPoolOverlap,
      poachingRisk,
      retentionStrategies,
      strengthsVsUs,
      weaknessesVsUs,
      opportunities,
      threats,
      dataSource,
      dataConfidence,
    } = req.body;

    const userId = (req as any).user?.id;

    const intel = await prisma.competitorIntelligence.create({
      data: {
        competitorName,
        competitorWebsite,
        industry,
        ourCompany,
        competitorSize,
        marketPosition,
        intelligenceType,
        salaryRanges,
        bonusStructure,
        equityOfferings,
        benefitsOffered: benefitsOffered || [],
        uniquePerks: uniquePerks || [],
        benefitComparison,
        cultureHighlights: cultureHighlights || [],
        workArrangement,
        glassdoorRating,
        reviewSummary,
        techStackUsed: techStackUsed || [],
        recentTechAdoptions: recentTechAdoptions || [],
        hiringVelocity,
        openPositionsCount,
        talentFocusAreas: talentFocusAreas || [],
        hiringChallenges: hiringChallenges || [],
        talentPoolOverlap,
        poachingRisk,
        retentionStrategies: retentionStrategies || [],
        strengthsVsUs: strengthsVsUs || [],
        weaknessesVsUs: weaknessesVsUs || [],
        opportunities: opportunities || [],
        threats: threats || [],
        dataSource,
        dataConfidence: dataConfidence || 'MEDIUM',
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'Competitor intelligence created',
      intel,
    });
  } catch (error) {
    console.error('Error creating competitor intel:', error);
    res.status(500).json({ error: 'Failed to create competitor intelligence' });
  }
};

// Get competitor intelligence
export const getCompetitorIntel = async (req: Request, res: Response) => {
  try {
    const { competitorName, industry, intelligenceType } = req.query;

    const where: any = { isActive: true };
    if (competitorName) where.competitorName = { contains: competitorName as string, mode: 'insensitive' };
    if (industry) where.industry = industry;
    if (intelligenceType) where.intelligenceType = intelligenceType;

    const intel = await prisma.competitorIntelligence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ intel });
  } catch (error) {
    console.error('Error fetching competitor intel:', error);
    res.status(500).json({ error: 'Failed to fetch competitor intelligence' });
  }
};

// Get competitor intel by ID
export const getCompetitorIntelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const intel = await prisma.competitorIntelligence.findUnique({
      where: { id },
    });

    if (!intel) {
      return res.status(404).json({ error: 'Competitor intelligence not found' });
    }

    res.json({ intel });
  } catch (error) {
    console.error('Error fetching competitor intel:', error);
    res.status(500).json({ error: 'Failed to fetch competitor intelligence' });
  }
};

// Update competitor intel
export const updateCompetitorIntel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const intel = await prisma.competitorIntelligence.update({
      where: { id },
      data: {
        ...updates,
        lastVerified: new Date(),
      },
    });

    res.json({ message: 'Competitor intelligence updated', intel });
  } catch (error) {
    console.error('Error updating competitor intel:', error);
    res.status(500).json({ error: 'Failed to update competitor intelligence' });
  }
};

// Delete competitor intel
export const deleteCompetitorIntel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.competitorIntelligence.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Competitor intelligence deleted' });
  } catch (error) {
    console.error('Error deleting competitor intel:', error);
    res.status(500).json({ error: 'Failed to delete competitor intelligence' });
  }
};

// ============================================
// 4.3.6 - DYNAMIC FAQ ANSWERS
// ============================================

// Create FAQ
export const createFAQ = async (req: Request, res: Response) => {
  try {
    const {
      question,
      questionVariants,
      questionCategory,
      answer,
      shortAnswer,
      detailedAnswer,
      applicableRoles,
      applicableDepartments,
      applicableJobIds,
      useAIGeneration,
      sourceType,
      sourceReference,
      relatedFAQIds,
      relatedTopics,
      showToCandidates,
      showToInterviewers,
    } = req.body;

    const userId = (req as any).user?.id;

    const faq = await prisma.dynamicFAQ.create({
      data: {
        question,
        questionVariants: questionVariants || [],
        questionCategory,
        answer,
        shortAnswer,
        detailedAnswer,
        applicableRoles: applicableRoles || [],
        applicableDepartments: applicableDepartments || [],
        applicableJobIds: applicableJobIds || [],
        useAIGeneration: useAIGeneration || false,
        sourceType: sourceType || 'MANUAL',
        sourceReference,
        relatedFAQIds: relatedFAQIds || [],
        relatedTopics: relatedTopics || [],
        showToCandidates: showToCandidates !== false,
        showToInterviewers: showToInterviewers !== false,
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'FAQ created',
      faq,
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
};

// Get FAQs
export const getFAQs = async (req: Request, res: Response) => {
  try {
    const { questionCategory, showToCandidates, showToInterviewers } = req.query;

    const where: any = { isActive: true };
    if (questionCategory) where.questionCategory = questionCategory;
    if (showToCandidates !== undefined) where.showToCandidates = showToCandidates === 'true';
    if (showToInterviewers !== undefined) where.showToInterviewers = showToInterviewers === 'true';

    const faqs = await prisma.dynamicFAQ.findMany({
      where,
      orderBy: [{ timesAsked: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
};

// Get FAQ by ID
export const getFAQById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const faq = await prisma.dynamicFAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({ faq });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ' });
  }
};

// Search FAQs (semantic search simulation)
export const searchFAQs = async (req: Request, res: Response) => {
  try {
    const { query, category, jobId } = req.query;

    const where: any = { isActive: true };
    if (category) where.questionCategory = category;
    if (jobId) where.applicableJobIds = { has: jobId as string };

    const faqs = await prisma.dynamicFAQ.findMany({
      where: {
        ...where,
        OR: [
          { question: { contains: query as string, mode: 'insensitive' } },
          { answer: { contains: query as string, mode: 'insensitive' } },
          { questionVariants: { hasSome: [query as string] } },
        ],
      },
      orderBy: { timesAsked: 'desc' },
      take: 10,
    });

    // Increment times asked for found FAQs
    for (const faq of faqs) {
      await prisma.dynamicFAQ.update({
        where: { id: faq.id },
        data: { timesAsked: { increment: 1 } },
      });
    }

    res.json({ faqs });
  } catch (error) {
    console.error('Error searching FAQs:', error);
    res.status(500).json({ error: 'Failed to search FAQs' });
  }
};

// Update FAQ
export const updateFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const faq = await prisma.dynamicFAQ.update({
      where: { id },
      data: updates,
    });

    res.json({ message: 'FAQ updated', faq });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
};

// Rate FAQ helpfulness
export const rateFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    const faq = await prisma.dynamicFAQ.update({
      where: { id },
      data: helpful
        ? { helpfulCount: { increment: 1 } }
        : { notHelpfulCount: { increment: 1 } },
    });

    res.json({ message: 'Feedback recorded', faq });
  } catch (error) {
    console.error('Error rating FAQ:', error);
    res.status(500).json({ error: 'Failed to rate FAQ' });
  }
};

// Verify FAQ
export const verifyFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const faq = await prisma.dynamicFAQ.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedById: userId,
      },
    });

    res.json({ message: 'FAQ verified', faq });
  } catch (error) {
    console.error('Error verifying FAQ:', error);
    res.status(500).json({ error: 'Failed to verify FAQ' });
  }
};

// Delete FAQ
export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.dynamicFAQ.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
};

// ============================================
// 4.3.7 - CONTINUOUS LEARNING (AI FEEDBACK)
// ============================================

// Submit AI feedback
export const submitAIFeedback = async (req: Request, res: Response) => {
  try {
    const {
      feedbackType,
      sourceEntityType,
      sourceEntityId,
      originalAIOutput,
      aiConfidence,
      feedbackRating,
      isAccurate,
      accuracyPercentage,
      corrections,
      correctedFields,
      correctionNotes,
      errorType,
      impactLevel,
      shouldTrainOn,
      relatedPatterns,
      suggestedImprovement,
    } = req.body;

    const userId = (req as any).user?.id;

    const feedback = await prisma.aIFeedbackLearning.create({
      data: {
        feedbackType,
        sourceEntityType,
        sourceEntityId,
        originalAIOutput,
        aiConfidence,
        feedbackById: userId,
        feedbackRating,
        isAccurate,
        accuracyPercentage,
        corrections,
        correctedFields: correctedFields || [],
        correctionNotes,
        errorType,
        impactLevel: impactLevel || 'MEDIUM',
        shouldTrainOn: shouldTrainOn !== false,
        relatedPatterns: relatedPatterns || [],
        suggestedImprovement,
      },
    });

    res.status(201).json({
      message: 'AI feedback submitted',
      feedback,
    });
  } catch (error) {
    console.error('Error submitting AI feedback:', error);
    res.status(500).json({ error: 'Failed to submit AI feedback' });
  }
};

// Get AI feedback
export const getAIFeedback = async (req: Request, res: Response) => {
  try {
    const { feedbackType, sourceEntityType, isProcessedForTraining } = req.query;

    const where: any = {};
    if (feedbackType) where.feedbackType = feedbackType;
    if (sourceEntityType) where.sourceEntityType = sourceEntityType;
    if (isProcessedForTraining !== undefined) {
      where.isProcessedForTraining = isProcessedForTraining === 'true';
    }

    const feedback = await prisma.aIFeedbackLearning.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching AI feedback:', error);
    res.status(500).json({ error: 'Failed to fetch AI feedback' });
  }
};

// Get feedback by ID
export const getAIFeedbackById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.aIFeedbackLearning.findUnique({
      where: { id },
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching AI feedback:', error);
    res.status(500).json({ error: 'Failed to fetch AI feedback' });
  }
};

// Mark feedback as processed for training
export const markFeedbackProcessed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.aIFeedbackLearning.update({
      where: { id },
      data: {
        isProcessedForTraining: true,
        processedAt: new Date(),
      },
    });

    res.json({ message: 'Feedback marked as processed', feedback });
  } catch (error) {
    console.error('Error marking feedback processed:', error);
    res.status(500).json({ error: 'Failed to mark feedback as processed' });
  }
};

// Address feedback
export const addressFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const feedback = await prisma.aIFeedbackLearning.update({
      where: { id },
      data: {
        wasAddressed: true,
        addressedAt: new Date(),
        addressedNotes: notes,
      },
    });

    res.json({ message: 'Feedback addressed', feedback });
  } catch (error) {
    console.error('Error addressing feedback:', error);
    res.status(500).json({ error: 'Failed to address feedback' });
  }
};

// Get feedback analytics
export const getFeedbackAnalytics = async (req: Request, res: Response) => {
  try {
    const totalFeedback = await prisma.aIFeedbackLearning.count();
    const processedCount = await prisma.aIFeedbackLearning.count({
      where: { isProcessedForTraining: true },
    });
    const addressedCount = await prisma.aIFeedbackLearning.count({
      where: { wasAddressed: true },
    });

    const byType = await prisma.aIFeedbackLearning.groupBy({
      by: ['feedbackType'],
      _count: { id: true },
      _avg: { feedbackRating: true },
    });

    const byEntityType = await prisma.aIFeedbackLearning.groupBy({
      by: ['sourceEntityType'],
      _count: { id: true },
    });

    const averageAccuracy = await prisma.aIFeedbackLearning.aggregate({
      _avg: { accuracyPercentage: true },
    });

    res.json({
      analytics: {
        totalFeedback,
        processedCount,
        addressedCount,
        pendingProcessing: totalFeedback - processedCount,
        byType,
        byEntityType,
        averageAccuracy: averageAccuracy._avg.accuracyPercentage || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    res.status(500).json({ error: 'Failed to fetch feedback analytics' });
  }
};

// ============================================
// 4.3.8 - CUSTOM EVALUATION CRITERIA
// ============================================

// Create evaluation criterion
export const createEvaluationCriterion = async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      department,
      roleTitle,
      jobId,
      criterionName,
      criterionCode,
      description,
      category,
      weight,
      isMandatory,
      isKnockout,
      scoringType,
      minScore,
      maxScore,
      passingScore,
      scoringRubric,
      behavioralIndicators,
      positiveIndicators,
      negativeIndicators,
      questionSuggestions,
      aiEvaluationPrompt,
      aiKeywords,
      aiIgnoreKeywords,
      industryBenchmark,
      internalBenchmark,
      topPerformerThreshold,
      idealResponse,
      acceptableResponse,
      poorResponse,
      isTemplate,
    } = req.body;

    const userId = (req as any).user?.id;

    const criterion = await prisma.customEvaluationCriteria.create({
      data: {
        companyName,
        department,
        roleTitle,
        jobId,
        criterionName,
        criterionCode,
        description,
        category,
        weight: weight || 1.0,
        isMandatory: isMandatory || false,
        isKnockout: isKnockout || false,
        scoringType: scoringType || 'NUMERIC',
        minScore: minScore || 0,
        maxScore: maxScore || 5,
        passingScore,
        scoringRubric,
        behavioralIndicators,
        positiveIndicators: positiveIndicators || [],
        negativeIndicators: negativeIndicators || [],
        questionSuggestions: questionSuggestions || [],
        aiEvaluationPrompt,
        aiKeywords: aiKeywords || [],
        aiIgnoreKeywords: aiIgnoreKeywords || [],
        industryBenchmark,
        internalBenchmark,
        topPerformerThreshold,
        idealResponse,
        acceptableResponse,
        poorResponse,
        isTemplate: isTemplate || false,
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'Evaluation criterion created',
      criterion,
    });
  } catch (error) {
    console.error('Error creating evaluation criterion:', error);
    res.status(500).json({ error: 'Failed to create evaluation criterion' });
  }
};

// Get evaluation criteria
export const getEvaluationCriteria = async (req: Request, res: Response) => {
  try {
    const { companyName, category, roleTitle, jobId, isTemplate } = req.query;

    const where: any = { isActive: true };
    if (companyName) where.companyName = companyName;
    if (category) where.category = category;
    if (roleTitle) where.roleTitle = { contains: roleTitle as string, mode: 'insensitive' };
    if (jobId) where.jobId = jobId;
    if (isTemplate !== undefined) where.isTemplate = isTemplate === 'true';

    const criteria = await prisma.customEvaluationCriteria.findMany({
      where,
      orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ criteria });
  } catch (error) {
    console.error('Error fetching evaluation criteria:', error);
    res.status(500).json({ error: 'Failed to fetch evaluation criteria' });
  }
};

// Get criterion by ID
export const getEvaluationCriterionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const criterion = await prisma.customEvaluationCriteria.findUnique({
      where: { id },
    });

    if (!criterion) {
      return res.status(404).json({ error: 'Evaluation criterion not found' });
    }

    res.json({ criterion });
  } catch (error) {
    console.error('Error fetching evaluation criterion:', error);
    res.status(500).json({ error: 'Failed to fetch evaluation criterion' });
  }
};

// Update criterion
export const updateEvaluationCriterion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const criterion = await prisma.customEvaluationCriteria.update({
      where: { id },
      data: updates,
    });

    res.json({ message: 'Evaluation criterion updated', criterion });
  } catch (error) {
    console.error('Error updating evaluation criterion:', error);
    res.status(500).json({ error: 'Failed to update evaluation criterion' });
  }
};

// Clone criterion
export const cloneEvaluationCriterion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { criterionName, criterionCode } = req.body;
    const userId = (req as any).user?.id;

    const original = await prisma.customEvaluationCriteria.findUnique({
      where: { id },
    });

    if (!original) {
      return res.status(404).json({ error: 'Criterion not found' });
    }

    const { id: _, createdAt, updatedAt, timesUsed, averageScore, ...rest } = original as any;

    const clone = await prisma.customEvaluationCriteria.create({
      data: {
        ...rest,
        criterionName: criterionName || `${original.criterionName} (Copy)`,
        criterionCode: criterionCode || `${original.criterionCode}_COPY`,
        isTemplate: false,
        createdById: userId,
      },
    });

    res.status(201).json({ message: 'Criterion cloned', criterion: clone });
  } catch (error) {
    console.error('Error cloning criterion:', error);
    res.status(500).json({ error: 'Failed to clone criterion' });
  }
};

// Record criterion usage
export const recordCriterionUsage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const criterion = await prisma.customEvaluationCriteria.findUnique({
      where: { id },
    });

    if (!criterion) {
      return res.status(404).json({ error: 'Criterion not found' });
    }

    // Calculate new average score
    const newTimesUsed = criterion.timesUsed + 1;
    const currentAvg = criterion.averageScore || 0;
    const newAverageScore = ((currentAvg * criterion.timesUsed) + score) / newTimesUsed;

    const updated = await prisma.customEvaluationCriteria.update({
      where: { id },
      data: {
        timesUsed: newTimesUsed,
        averageScore: newAverageScore,
      },
    });

    res.json({ message: 'Usage recorded', criterion: updated });
  } catch (error) {
    console.error('Error recording criterion usage:', error);
    res.status(500).json({ error: 'Failed to record criterion usage' });
  }
};

// Delete criterion
export const deleteEvaluationCriterion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.customEvaluationCriteria.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Evaluation criterion deleted' });
  } catch (error) {
    console.error('Error deleting evaluation criterion:', error);
    res.status(500).json({ error: 'Failed to delete evaluation criterion' });
  }
};

// ============================================
// KNOWLEDGE BASE OVERVIEW
// ============================================

// Get knowledge base stats
export const getKnowledgeBaseStats = async (req: Request, res: Response) => {
  try {
    const companyKnowledgeCount = await prisma.companyKnowledge.count({ where: { isActive: true } });
    const roleKnowledgeCount = await prisma.roleSpecificKnowledge.count({ where: { isActive: true } });
    const playbookCount = await prisma.interviewPlaybook.count({ where: { isActive: true } });
    const bestPracticeCount = await prisma.bestPractice.count({ where: { isActive: true } });
    const competitorIntelCount = await prisma.competitorIntelligence.count({ where: { isActive: true } });
    const faqCount = await prisma.dynamicFAQ.count({ where: { isActive: true } });
    const feedbackCount = await prisma.aIFeedbackLearning.count();
    const criteriaCount = await prisma.customEvaluationCriteria.count({ where: { isActive: true } });

    res.json({
      stats: {
        companyKnowledge: companyKnowledgeCount,
        roleKnowledge: roleKnowledgeCount,
        playbooks: playbookCount,
        bestPractices: bestPracticeCount,
        competitorIntel: competitorIntelCount,
        faqs: faqCount,
        aiFeedback: feedbackCount,
        evaluationCriteria: criteriaCount,
        total: companyKnowledgeCount + roleKnowledgeCount + playbookCount +
               bestPracticeCount + competitorIntelCount + faqCount + criteriaCount,
      },
    });
  } catch (error) {
    console.error('Error fetching knowledge base stats:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base stats' });
  }
};
