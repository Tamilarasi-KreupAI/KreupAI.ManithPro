import {
  computeCultureFitScore,
  computeGrowthPotentialScore,
  computeTechnicalDepthScore,
  computeCommunicationScore,
  computeReliabilityScore,
  type CandidateScoringData,
} from './advancedScoring.service';

describe('AI-12 Advanced Candidate Scoring', () => {
  const baseData = (): CandidateScoringData => ({
    user: {
      id: 'user-001',
      firstName: 'Test',
      lastName: 'Candidate',
      bio: 'Experienced software developer with strong communication skills. I build reliable web applications.',
      skills: ['TypeScript', 'Python', 'SQL'],
      experience: 3,
      education: 'MCA',
    },

    profile: {
      id: 'profile-001',
      userId: 'user-001',
      headline: 'Software Developer',
      summary:
        'Software developer with experience building web applications and data-driven projects.',
      preferredLocation: ['Chennai'],
      willingToRelocate: true,
      remotePreference: 'HYBRID',
      expectedSalary: null,
      jobTypes: ['FULL_TIME'],
      industries: ['Technology'],
      completenessScore: 90,
      languages: ['English'],
    },

    workExperiences: [
      {
        id: 'experience-001',
        profileId: 'profile-001',
        companyName: 'Tech Company',
        title: 'Software Developer',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2024-01-01'),
        isCurrent: false,
        description:
          'Developed web applications and APIs using TypeScript and Python.',
        responsibilities: [
          'Develop REST APIs',
          'Maintain database systems',
        ],
        achievements: [
          'Improved application performance',
        ],
        technologies: ['TypeScript', 'Node.js'],
        skills: ['Backend Development', 'SQL'],
      },
    ],

    educations: [
      {
        id: 'education-001',
        profileId: 'profile-001',
        institutionName: 'Test University',
        degree: 'MCA',
        fieldOfStudy: 'Computer Applications',
        specialization: 'Software Engineering',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2024-01-01'),
        isOngoing: false,
        grade: '8.0',
      },
    ],

    skills: [
      {
        id: 'skill-001',
        profileId: 'profile-001',
        name: 'TypeScript',
        category: 'Programming',
        proficiencyLevel: 8,
        proficiencyLabel: 'ADVANCED',
        yearsOfExperience: 3,
        isVerified: true,
      },
      {
        id: 'skill-002',
        profileId: 'profile-001',
        name: 'Python',
        category: 'Programming',
        proficiencyLevel: 7,
        proficiencyLabel: 'ADVANCED',
        yearsOfExperience: 2,
        isVerified: true,
      },
      {
        id: 'skill-003',
        profileId: 'profile-001',
        name: 'SQL',
        category: 'Database',
        proficiencyLevel: 7,
        proficiencyLabel: 'ADVANCED',
        yearsOfExperience: 2,
        isVerified: false,
      },
    ],

    certifications: [
      {
        id: 'certification-001',
        profileId: 'profile-001',
        name: 'Cloud Fundamentals',
        issuingOrganization: 'Test Organization',
        skills: ['Cloud Computing'],
        verificationStatus: 'VERIFIED',
      },
    ],

    projects: [
      {
        id: 'project-001',
        profileId: 'profile-001',
        title: 'Candidate Scoring Platform',
        shortDescription:
          'A platform for analysing candidate profiles.',
        description:
          'Built a candidate scoring platform using TypeScript and database technologies.',
        technologies: ['TypeScript', 'PostgreSQL'],
        frameworks: ['Node.js'],
        languages: ['TypeScript'],
        tools: ['Git'],
        contributions: [
          'Designed backend services',
          'Implemented scoring logic',
        ],
        impact: 'Improved candidate evaluation workflow.',
        isFeatured: true,
      },
    ],

    achievements: [
      {
        id: 'achievement-001',
        profileId: 'profile-001',
        title: 'Project Completion',
        description: 'Completed major software project.',
        type: 'PROJECT',
        points: 20,
        isCompleted: true,
      },
    ],

    applications: [
      {
        id: 'application-001',
        candidateId: 'user-001',
        jobId: 'job-001',
        resume: 'resume.pdf',
        coverLetter:
          'I am interested in this software development opportunity.',
        status: 'SUBMITTED',
        appliedAt: new Date('2024-01-10'),
      },
    ],

    interviews: [
      {
        id: 'interview-001',
        candidateId: 'user-001',
        applicationId: 'application-001',
        status: 'COMPLETED',
        scheduledAt: new Date('2024-01-15'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        feedback:
          'Candidate communicated clearly and explained technical concepts well.',
        notes:
          'Good technical discussion and professional interaction.',
      },
    ],

    messages: [
      {
        id: 'message-001',
        senderId: 'user-001',
        receiverId: 'recruiter-001',
        content:
          'Thank you for arranging the interview. I look forward to the discussion.',
        createdAt: new Date('2024-01-14'),
      },
      {
        id: 'message-002',
        senderId: 'recruiter-001',
        receiverId: 'user-001',
        content:
          'Thank you for your response. We will confirm the next steps.',
        createdAt: new Date('2024-01-14'),
      },
    ],

    job: {
      id: 'job-001',
      title: 'Software Developer',
      description: 'Software development role.',
      requirements: [
        'TypeScript',
        'Python',
        'SQL',
      ],
      responsibilities: [
        'Develop applications',
        'Maintain APIs',
      ],
      location: 'Chennai',
      type: 'FULL_TIME',
      skills: [
        'TypeScript',
        'Python',
        'SQL',
      ],
      experience: '2 years',
      education: 'MCA',
      companyName: 'Technology Company',
      companyDescription:
        'Technology company building software products.',
      companyIndustry: 'Technology',
      companySize: 'MEDIUM',
    },
  });

  // ============================================================
  // Culture Fit
  // ============================================================

  it('computes culture fit from stored candidate and job data', () => {
    const data = baseData();

    const result = computeCultureFitScore(data);

    expect(result.status).toBe('COMPLETE');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.scoringVersion).toBe('2.0');

    expect(result.inputs).toHaveProperty('candidate');
    expect(result.inputs).toHaveProperty('job');
    expect(result.components).toHaveProperty('skillMatch');
    expect(result.components).toHaveProperty('industryMatch');
    expect(result.components).toHaveProperty('locationMatch');
  });

  // ============================================================
  // Growth Potential
  // ============================================================

  it('computes growth potential from stored experience, education, skills, projects and achievements', () => {
    const data = baseData();

    const result = computeGrowthPotentialScore(data);

    expect(result.status).toBe('COMPLETE');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.scoringVersion).toBe('2.0');

    expect(result.inputs).toHaveProperty('experience');
    expect(result.inputs).toHaveProperty('education');
    expect(result.inputs).toHaveProperty('skills');
    expect(result.inputs).toHaveProperty('projects');
    expect(result.inputs).toHaveProperty('achievements');
  });

  // ============================================================
  // Technical Depth
  // ============================================================

  it('computes technical depth from stored skills, experience, projects and certifications', () => {
    const data = baseData();

    const result = computeTechnicalDepthScore(data);

    expect(result.status).toBe('COMPLETE');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.scoringVersion).toBe('2.0');

    expect(result.inputs).toHaveProperty('skills');
    expect(result.inputs).toHaveProperty('experience');
    expect(result.inputs).toHaveProperty('projects');
    expect(result.inputs).toHaveProperty('certifications');
  });

  // ============================================================
  // Communication
  // ============================================================

  it('computes communication from stored profile, experience, project, application, interview and message text', () => {
    const data = baseData();

    const result = computeCommunicationScore(data);

    expect(result.status).toBe('COMPLETE');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.scoringVersion).toBe('2.0');

    expect(result.inputs).toHaveProperty('profileText');
    expect(result.inputs).toHaveProperty('experienceText');
    expect(result.inputs).toHaveProperty('projectText');
    expect(result.inputs).toHaveProperty('applicationText');
    expect(result.inputs).toHaveProperty('interviewText');
    expect(result.inputs).toHaveProperty('messageText');
  });

  // ============================================================
  // Reliability
  // ============================================================

  it('computes reliability from stored application, interview and engagement records', () => {
    const data = baseData();

    const result = computeReliabilityScore(data);

    expect(result.status).toBe('COMPLETE');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.scoringVersion).toBe('2.0');

    expect(result.inputs).toHaveProperty('applicationHistory');
    expect(result.inputs).toHaveProperty('interviewHistory');
    expect(result.inputs).toHaveProperty('engagement');
  });

  // ============================================================
  // Missing data
  // ============================================================

  it('returns INCOMPLETE when culture fit has no job data', () => {
    const data = baseData();

    data.job = null;

    const result = computeCultureFitScore(data);

    expect(result.status).toBe('INCOMPLETE');
    expect(result.score).toBeNull();
    expect(result.reason).toContain('Job data is required');
  });

  it('returns INCOMPLETE when growth potential has insufficient input groups', () => {
    const data = baseData();

    data.workExperiences = [];
    data.educations = [];
    data.skills = [];
    data.projects = [];
    data.achievements = [];

    const result = computeGrowthPotentialScore(data);

    expect(result.status).toBe('INCOMPLETE');
    expect(result.score).toBeNull();
    expect(result.reason).toContain(
      'At least two approved growth-input groups',
    );
  });

  it('returns INCOMPLETE when technical depth has insufficient input groups', () => {
    const data = baseData();

    data.skills = [];
    data.workExperiences = [];
    data.projects = [];
    data.certifications = [];

    const result = computeTechnicalDepthScore(data);

    expect(result.status).toBe('INCOMPLETE');
    expect(result.score).toBeNull();
    expect(result.reason).toContain(
      'At least two approved technical-input groups',
    );
  });

  it('returns INCOMPLETE when communication has insufficient text groups', () => {
    const data = baseData();

    data.user.bio = '';
    data.profile = {
      id: 'profile-001',
      userId: 'user-001',
      headline: '',
      summary: '',
      preferredLocation: [],
      willingToRelocate: false,
      remotePreference: null,
      expectedSalary: null,
      jobTypes: [],
      industries: [],
      completenessScore: 0,
      languages: [],
    };

    data.workExperiences = [];
    data.projects = [];
    data.applications = [];
    data.interviews = [];
    data.messages = [];

    const result = computeCommunicationScore(data);

    expect(result.status).toBe('INCOMPLETE');
    expect(result.score).toBeNull();
    expect(result.reason).toContain(
      'At least two communication-input groups',
    );
  });

  it('returns INCOMPLETE when reliability has insufficient activity data', () => {
    const data = baseData();

    data.applications = [];
    data.interviews = [];
    data.messages = [];

    data.profile = {
      ...data.profile,
      completenessScore: 0,
    };

    const result = computeReliabilityScore(data);

    expect(result.status).toBe('INCOMPLETE');
    expect(result.score).toBeNull();
    expect(result.reason).toContain(
      'At least two reliability-input groups',
    );
  });

  // ============================================================
  // Reproducibility
  // ============================================================

  it('produces the same score for unchanged candidate data', () => {
    const data1 = baseData();
    const data2 = baseData();

    const culture1 = computeCultureFitScore(data1);
    const culture2 = computeCultureFitScore(data2);

    const growth1 = computeGrowthPotentialScore(data1);
    const growth2 = computeGrowthPotentialScore(data2);

    const technical1 = computeTechnicalDepthScore(data1);
    const technical2 = computeTechnicalDepthScore(data2);

    const communication1 = computeCommunicationScore(data1);
    const communication2 = computeCommunicationScore(data2);

    const reliability1 = computeReliabilityScore(data1);
    const reliability2 = computeReliabilityScore(data2);

    expect(culture1.score).toBe(culture2.score);
    expect(growth1.score).toBe(growth2.score);
    expect(technical1.score).toBe(technical2.score);
    expect(communication1.score).toBe(communication2.score);
    expect(reliability1.score).toBe(reliability2.score);
  });
});