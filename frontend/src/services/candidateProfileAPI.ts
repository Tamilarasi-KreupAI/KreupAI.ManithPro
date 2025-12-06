import axios from 'axios';
import type {
  CandidateProfile,
  WorkExperience,
  Education,
  Certification,
  CandidateSkill,
  Project,
  ProfileCompleteness,
  SkillsMatrix,
  ExperienceTimelineSummary,
  PortfolioSummary,
  EmploymentType,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data for development
const USE_MOCK = true;

const mockDelay = <T>(data: T, ms = 500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

// Mock Profile Data
const mockProfile: CandidateProfile = {
  id: 'profile-1',
  userId: 'user-1',
  headline: 'Senior Full Stack Developer | React | Node.js | TypeScript',
  summary: 'Passionate software engineer with 8+ years of experience building scalable web applications. Expertise in modern JavaScript frameworks, cloud architecture, and agile methodologies. Strong background in leading development teams and delivering high-quality products.',
  dateOfBirth: '1990-05-15',
  nationality: 'American',
  languages: [
    { language: 'English', proficiency: 'Native' },
    { language: 'Spanish', proficiency: 'Intermediate' },
  ],
  city: 'San Francisco',
  state: 'CA',
  country: 'United States',
  preferredLocation: ['San Francisco', 'Remote', 'New York'],
  willingToRelocate: true,
  remotePreference: 'hybrid',
  expectedSalary: 180000,
  expectedSalaryCurrency: 'USD',
  noticePeriod: '2 weeks',
  jobTypes: ['FULL_TIME', 'CONTRACT'],
  industries: ['Technology', 'Finance', 'Healthcare'],
  completenessScore: 85,
  website: 'https://johndoe.dev',
  github: 'https://github.com/johndoe',
  linkedin: 'https://linkedin.com/in/johndoe',
  twitter: 'https://twitter.com/johndoe',
  isPublic: true,
  allowMessages: true,
  showSalaryExpectation: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  user: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 555-0123',
  },
};

const mockWorkExperiences: WorkExperience[] = [
  {
    id: 'exp-1',
    profileId: 'profile-1',
    companyName: 'Tech Corp',
    companyLogo: 'https://via.placeholder.com/100',
    companyWebsite: 'https://techcorp.com',
    companySize: '201-500',
    industry: 'Technology',
    title: 'Senior Software Engineer',
    employmentType: 'FULL_TIME' as EmploymentType,
    department: 'Engineering',
    location: 'San Francisco, CA',
    isRemote: false,
    startDate: '2020-01-15',
    isCurrent: true,
    description: 'Leading development of core platform features and mentoring junior developers.',
    responsibilities: [
      'Lead a team of 5 engineers in developing new product features',
      'Architect scalable microservices using Node.js and TypeScript',
      'Implement CI/CD pipelines and improve deployment processes',
    ],
    achievements: [
      'Reduced page load time by 40% through optimization',
      'Increased test coverage from 60% to 95%',
      'Mentored 3 junior developers to senior positions',
    ],
    technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
    skills: ['Leadership', 'System Design', 'Code Review'],
    verificationStatus: 'VERIFIED',
    teamSize: 5,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    profileId: 'profile-1',
    companyName: 'StartupXYZ',
    companyLogo: 'https://via.placeholder.com/100',
    companyWebsite: 'https://startupxyz.com',
    companySize: '11-50',
    industry: 'Technology',
    title: 'Full Stack Developer',
    employmentType: 'FULL_TIME' as EmploymentType,
    department: 'Product',
    location: 'San Francisco, CA',
    isRemote: false,
    startDate: '2017-03-01',
    endDate: '2020-01-10',
    isCurrent: false,
    description: 'Built and maintained customer-facing web applications.',
    responsibilities: [
      'Developed RESTful APIs and web applications',
      'Collaborated with product team on feature specifications',
      'Implemented automated testing strategies',
    ],
    achievements: [
      'Launched 3 major product features',
      'Built real-time notification system serving 100K+ users',
    ],
    technologies: ['React', 'Python', 'Django', 'MongoDB', 'Redis'],
    skills: ['Problem Solving', 'Agile'],
    verificationStatus: 'VERIFIED',
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockEducations: Education[] = [
  {
    id: 'edu-1',
    profileId: 'profile-1',
    institutionName: 'Stanford University',
    institutionType: 'university',
    institutionLocation: 'Stanford, CA',
    degree: 'Master of Science',
    fieldOfStudy: 'Computer Science',
    specialization: 'Artificial Intelligence',
    startDate: '2015-09-01',
    endDate: '2017-06-15',
    isOngoing: false,
    grade: '3.9',
    gradeScale: '4.0',
    activities: ['Computer Science Club', 'Hackathon Organizer'],
    achievements: ["Dean's List", 'Best Thesis Award'],
    thesis: 'Deep Learning for Natural Language Processing',
    verificationStatus: 'VERIFIED',
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'edu-2',
    profileId: 'profile-1',
    institutionName: 'UC Berkeley',
    institutionType: 'university',
    institutionLocation: 'Berkeley, CA',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    startDate: '2011-09-01',
    endDate: '2015-05-15',
    isOngoing: false,
    grade: '3.7',
    gradeScale: '4.0',
    activities: ['Programming Club', 'Robotics Team'],
    achievements: ['Summa Cum Laude'],
    verificationStatus: 'VERIFIED',
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockCertifications: Certification[] = [
  {
    id: 'cert-1',
    profileId: 'profile-1',
    name: 'AWS Solutions Architect Professional',
    issuingOrganization: 'Amazon Web Services',
    organizationLogo: 'https://via.placeholder.com/50',
    credentialId: 'AWS-SAP-123456',
    credentialUrl: 'https://aws.amazon.com/verification',
    issueDate: '2022-03-15',
    expirationDate: '2025-03-15',
    doesNotExpire: false,
    description: 'Advanced certification for designing distributed systems on AWS',
    skills: ['AWS', 'Cloud Architecture', 'System Design'],
    verificationStatus: 'VERIFIED',
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cert-2',
    profileId: 'profile-1',
    name: 'Google Cloud Professional Cloud Architect',
    issuingOrganization: 'Google Cloud',
    organizationLogo: 'https://via.placeholder.com/50',
    credentialId: 'GCP-PCA-789012',
    credentialUrl: 'https://cloud.google.com/certification',
    issueDate: '2021-08-20',
    doesNotExpire: true,
    description: 'Design and implement cloud solutions on Google Cloud Platform',
    skills: ['GCP', 'Cloud Architecture', 'Kubernetes'],
    verificationStatus: 'VERIFIED',
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockSkills: CandidateSkill[] = [
  {
    id: 'skill-1',
    profileId: 'profile-1',
    name: 'React',
    category: 'Frontend',
    subcategory: 'JavaScript Frameworks',
    proficiencyLevel: 9,
    proficiencyLabel: 'EXPERT',
    yearsOfExperience: 6,
    isVerified: true,
    endorsementCount: 15,
    tags: ['Frontend', 'UI', 'JavaScript'],
    isPrimary: true,
    displayOrder: 0,
    projects: [],
    certifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    endorsements: [
      {
        id: 'end-1',
        skillId: 'skill-1',
        endorserId: 'user-2',
        endorserName: 'Jane Smith',
        endorserTitle: 'Engineering Manager',
        endorserCompany: 'Tech Corp',
        relationship: 'manager',
        comment: 'Exceptional React skills, delivered multiple complex features.',
        rating: 5,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'skill-2',
    profileId: 'profile-1',
    name: 'TypeScript',
    category: 'Programming Languages',
    proficiencyLevel: 9,
    proficiencyLabel: 'EXPERT',
    yearsOfExperience: 5,
    isVerified: true,
    endorsementCount: 12,
    tags: ['TypeScript', 'JavaScript'],
    isPrimary: true,
    displayOrder: 1,
    projects: [],
    certifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-3',
    profileId: 'profile-1',
    name: 'Node.js',
    category: 'Backend',
    proficiencyLevel: 8,
    proficiencyLabel: 'ADVANCED',
    yearsOfExperience: 5,
    isVerified: true,
    endorsementCount: 10,
    tags: ['Backend', 'JavaScript', 'API'],
    isPrimary: true,
    displayOrder: 2,
    projects: [],
    certifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-4',
    profileId: 'profile-1',
    name: 'PostgreSQL',
    category: 'Databases',
    proficiencyLevel: 7,
    proficiencyLabel: 'ADVANCED',
    yearsOfExperience: 4,
    isVerified: false,
    endorsementCount: 5,
    tags: ['Database', 'SQL'],
    isPrimary: false,
    displayOrder: 3,
    projects: [],
    certifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-5',
    profileId: 'profile-1',
    name: 'AWS',
    category: 'Cloud',
    proficiencyLevel: 8,
    proficiencyLabel: 'ADVANCED',
    yearsOfExperience: 4,
    isVerified: true,
    endorsementCount: 8,
    tags: ['Cloud', 'DevOps'],
    isPrimary: true,
    displayOrder: 4,
    projects: [],
    certifications: ['cert-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    profileId: 'profile-1',
    title: 'E-Commerce Platform',
    shortDescription: 'Full-stack e-commerce solution with microservices architecture',
    description: 'Built a scalable e-commerce platform handling 100K+ daily transactions. Implemented microservices architecture with event-driven communication, real-time inventory management, and AI-powered product recommendations.',
    projectType: 'professional',
    status: 'completed',
    startDate: '2021-06-01',
    endDate: '2022-03-15',
    isOngoing: false,
    technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Kafka'],
    frameworks: ['Next.js', 'Express.js'],
    languages: ['TypeScript', 'Python'],
    tools: ['Docker', 'Kubernetes', 'AWS'],
    repositoryUrl: 'https://github.com/johndoe/ecommerce-platform',
    liveUrl: 'https://demo-ecommerce.example.com',
    thumbnailUrl: 'https://via.placeholder.com/400x200',
    images: ['https://via.placeholder.com/800x400'],
    videos: [],
    role: 'Lead Developer',
    teamSize: 5,
    contributions: [
      'Designed microservices architecture',
      'Implemented payment processing system',
      'Built real-time inventory tracking',
    ],
    impact: 'Increased conversion rate by 25% and reduced page load time by 50%',
    users: 50000,
    isPublic: true,
    isFeatured: true,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    profileId: 'profile-1',
    title: 'Open Source CLI Tool',
    shortDescription: 'Developer productivity CLI tool with 5K+ GitHub stars',
    description: 'Created an open-source CLI tool for automating common development tasks. Features include project scaffolding, dependency management, and integration with popular CI/CD platforms.',
    projectType: 'open-source',
    status: 'completed',
    startDate: '2020-01-10',
    isOngoing: true,
    technologies: ['Node.js', 'TypeScript'],
    frameworks: [],
    languages: ['TypeScript'],
    tools: ['npm', 'GitHub Actions'],
    repositoryUrl: 'https://github.com/johndoe/awesome-cli',
    documentationUrl: 'https://awesome-cli.dev/docs',
    thumbnailUrl: 'https://via.placeholder.com/400x200',
    images: [],
    videos: [],
    role: 'Creator & Maintainer',
    contributions: [
      'Designed the plugin architecture',
      'Wrote comprehensive documentation',
      'Managed community contributions',
    ],
    impact: 'Used by 10K+ developers worldwide',
    stars: 5200,
    forks: 450,
    downloads: 100000,
    isPublic: true,
    isFeatured: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================
// PROFILE API
// ============================================

export const candidateProfileAPI = {
  // Get current user's profile
  getProfile: async (): Promise<{ profile: CandidateProfile }> => {
    if (USE_MOCK) {
      return mockDelay({
        profile: {
          ...mockProfile,
          workExperiences: mockWorkExperiences,
          educations: mockEducations,
          certifications: mockCertifications,
          skills: mockSkills,
          projects: mockProjects,
        },
      });
    }
    return api.get('/candidate-profile').then((res) => res.data);
  },

  // Get profile by user ID
  getProfileByUserId: async (userId: string): Promise<{ profile: CandidateProfile }> => {
    if (USE_MOCK) {
      return mockDelay({
        profile: {
          ...mockProfile,
          userId,
          workExperiences: mockWorkExperiences,
          educations: mockEducations,
          certifications: mockCertifications,
          skills: mockSkills,
          projects: mockProjects,
        },
      });
    }
    return api.get(`/candidate-profile/user/${userId}`).then((res) => res.data);
  },

  // Update profile
  updateProfile: async (data: Partial<CandidateProfile>): Promise<{ message: string; profile: CandidateProfile }> => {
    if (USE_MOCK) {
      return mockDelay({
        message: 'Profile updated successfully',
        profile: { ...mockProfile, ...data },
      });
    }
    return api.put('/candidate-profile', data).then((res) => res.data);
  },

  // Get profile completeness
  getCompleteness: async (): Promise<ProfileCompleteness> => {
    if (USE_MOCK) {
      return mockDelay({
        score: 85,
        sections: {
          basicInfo: { completed: true, weight: 20, items: { headline: true, summary: true, location: true } },
          workExperience: { completed: true, weight: 25, count: 2 },
          education: { completed: true, weight: 15, count: 2 },
          skills: { completed: true, weight: 20, count: 5 },
          projects: { completed: true, weight: 10, count: 2 },
          certifications: { completed: true, weight: 5, count: 2 },
          socialLinks: { completed: true, weight: 5, items: { github: true, linkedin: true, website: true } },
        },
        suggestions: ['Add more skills to improve matching', 'Consider adding a portfolio video'],
      });
    }
    return api.get('/candidate-profile/completeness').then((res) => res.data);
  },
};

// ============================================
// WORK EXPERIENCE API
// ============================================

export const workExperienceAPI = {
  // Get experience timeline
  getTimeline: async (): Promise<ExperienceTimelineSummary> => {
    if (USE_MOCK) {
      return mockDelay({
        experiences: mockWorkExperiences,
        summary: {
          totalExperiences: 2,
          totalYears: 7,
          totalMonths: 2,
          totalExperienceString: '7 years 2 months',
        },
      });
    }
    return api.get('/candidate-profile/experiences/timeline').then((res) => res.data);
  },

  // Add work experience
  add: async (data: Partial<WorkExperience>): Promise<{ message: string; workExperience: WorkExperience }> => {
    if (USE_MOCK) {
      const newExp: WorkExperience = {
        ...data,
        id: `exp-${Date.now()}`,
        profileId: 'profile-1',
        verificationStatus: 'PENDING',
        displayOrder: mockWorkExperiences.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as WorkExperience;
      mockWorkExperiences.unshift(newExp);
      return mockDelay({
        message: 'Work experience added successfully',
        workExperience: newExp,
      });
    }
    return api.post('/candidate-profile/experiences', data).then((res) => res.data);
  },

  // Update work experience
  update: async (id: string, data: Partial<WorkExperience>): Promise<{ message: string; workExperience: WorkExperience }> => {
    if (USE_MOCK) {
      const index = mockWorkExperiences.findIndex((e) => e.id === id);
      if (index >= 0) {
        mockWorkExperiences[index] = { ...mockWorkExperiences[index], ...data };
      }
      return mockDelay({
        message: 'Work experience updated successfully',
        workExperience: mockWorkExperiences[index],
      });
    }
    return api.put(`/candidate-profile/experiences/${id}`, data).then((res) => res.data);
  },

  // Delete work experience
  delete: async (id: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      const index = mockWorkExperiences.findIndex((e) => e.id === id);
      if (index >= 0) {
        mockWorkExperiences.splice(index, 1);
      }
      return mockDelay({ message: 'Work experience deleted successfully' });
    }
    return api.delete(`/candidate-profile/experiences/${id}`).then((res) => res.data);
  },
};

// ============================================
// EDUCATION API
// ============================================

export const educationAPI = {
  // Add education
  add: async (data: Partial<Education>): Promise<{ message: string; education: Education }> => {
    if (USE_MOCK) {
      const newEdu: Education = {
        ...data,
        id: `edu-${Date.now()}`,
        profileId: 'profile-1',
        verificationStatus: 'PENDING',
        displayOrder: mockEducations.length,
        activities: data.activities || [],
        achievements: data.achievements || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Education;
      mockEducations.unshift(newEdu);
      return mockDelay({
        message: 'Education added successfully',
        education: newEdu,
      });
    }
    return api.post('/candidate-profile/educations', data).then((res) => res.data);
  },

  // Update education
  update: async (id: string, data: Partial<Education>): Promise<{ message: string; education: Education }> => {
    if (USE_MOCK) {
      const index = mockEducations.findIndex((e) => e.id === id);
      if (index >= 0) {
        mockEducations[index] = { ...mockEducations[index], ...data };
      }
      return mockDelay({
        message: 'Education updated successfully',
        education: mockEducations[index],
      });
    }
    return api.put(`/candidate-profile/educations/${id}`, data).then((res) => res.data);
  },

  // Delete education
  delete: async (id: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      const index = mockEducations.findIndex((e) => e.id === id);
      if (index >= 0) {
        mockEducations.splice(index, 1);
      }
      return mockDelay({ message: 'Education deleted successfully' });
    }
    return api.delete(`/candidate-profile/educations/${id}`).then((res) => res.data);
  },
};

// ============================================
// CERTIFICATION API
// ============================================

export const certificationAPI = {
  // Add certification
  add: async (data: Partial<Certification>): Promise<{ message: string; certification: Certification }> => {
    if (USE_MOCK) {
      const newCert: Certification = {
        ...data,
        id: `cert-${Date.now()}`,
        profileId: 'profile-1',
        verificationStatus: 'PENDING',
        displayOrder: mockCertifications.length,
        skills: data.skills || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Certification;
      mockCertifications.unshift(newCert);
      return mockDelay({
        message: 'Certification added successfully',
        certification: newCert,
      });
    }
    return api.post('/candidate-profile/certifications', data).then((res) => res.data);
  },

  // Update certification
  update: async (id: string, data: Partial<Certification>): Promise<{ message: string; certification: Certification }> => {
    if (USE_MOCK) {
      const index = mockCertifications.findIndex((c) => c.id === id);
      if (index >= 0) {
        mockCertifications[index] = { ...mockCertifications[index], ...data };
      }
      return mockDelay({
        message: 'Certification updated successfully',
        certification: mockCertifications[index],
      });
    }
    return api.put(`/candidate-profile/certifications/${id}`, data).then((res) => res.data);
  },

  // Delete certification
  delete: async (id: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      const index = mockCertifications.findIndex((c) => c.id === id);
      if (index >= 0) {
        mockCertifications.splice(index, 1);
      }
      return mockDelay({ message: 'Certification deleted successfully' });
    }
    return api.delete(`/candidate-profile/certifications/${id}`).then((res) => res.data);
  },
};

// ============================================
// SKILLS API
// ============================================

export const skillsAPI = {
  // Get skills matrix
  getMatrix: async (): Promise<SkillsMatrix> => {
    if (USE_MOCK) {
      const matrix: Record<string, CandidateSkill[]> = {};
      mockSkills.forEach((skill) => {
        const category = skill.category || 'Other';
        if (!matrix[category]) {
          matrix[category] = [];
        }
        matrix[category].push(skill);
      });

      return mockDelay({
        matrix,
        summary: {
          total: mockSkills.length,
          byProficiency: {
            beginner: 0,
            elementary: 0,
            intermediate: 0,
            advanced: 2,
            expert: 3,
          },
          primarySkills: mockSkills.filter((s) => s.isPrimary),
          totalEndorsements: mockSkills.reduce((sum, s) => sum + s.endorsementCount, 0),
        },
      });
    }
    return api.get('/candidate-profile/skills/matrix').then((res) => res.data);
  },

  // Add skill
  add: async (data: Partial<CandidateSkill>): Promise<{ message: string; skill: CandidateSkill }> => {
    if (USE_MOCK) {
      const newSkill: CandidateSkill = {
        ...data,
        id: `skill-${Date.now()}`,
        profileId: 'profile-1',
        proficiencyLevel: data.proficiencyLevel || 5,
        proficiencyLabel: data.proficiencyLabel || 'INTERMEDIATE',
        isVerified: false,
        endorsementCount: 0,
        isPrimary: data.isPrimary || false,
        displayOrder: mockSkills.length,
        tags: data.tags || [],
        projects: [],
        certifications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as CandidateSkill;
      mockSkills.push(newSkill);
      return mockDelay({
        message: 'Skill added successfully',
        skill: newSkill,
      });
    }
    return api.post('/candidate-profile/skills', data).then((res) => res.data);
  },

  // Bulk add skills
  bulkAdd: async (skills: Partial<CandidateSkill>[]): Promise<{ message: string; addedCount: number; skippedCount: number }> => {
    if (USE_MOCK) {
      const existingNames = new Set(mockSkills.map((s) => s.name.toLowerCase()));
      const newSkills = skills.filter((s) => s.name && !existingNames.has(s.name.toLowerCase()));

      newSkills.forEach((s) => {
        mockSkills.push({
          ...s,
          id: `skill-${Date.now()}-${Math.random()}`,
          profileId: 'profile-1',
          proficiencyLevel: s.proficiencyLevel || 5,
          proficiencyLabel: s.proficiencyLabel || 'INTERMEDIATE',
          isVerified: false,
          endorsementCount: 0,
          isPrimary: false,
          displayOrder: mockSkills.length,
          tags: [],
          projects: [],
          certifications: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as CandidateSkill);
      });

      return mockDelay({
        message: `${newSkills.length} skills added successfully`,
        addedCount: newSkills.length,
        skippedCount: skills.length - newSkills.length,
      });
    }
    return api.post('/candidate-profile/skills/bulk', { skills }).then((res) => res.data);
  },

  // Update skill
  update: async (id: string, data: Partial<CandidateSkill>): Promise<{ message: string; skill: CandidateSkill }> => {
    if (USE_MOCK) {
      const index = mockSkills.findIndex((s) => s.id === id);
      if (index >= 0) {
        mockSkills[index] = { ...mockSkills[index], ...data };
      }
      return mockDelay({
        message: 'Skill updated successfully',
        skill: mockSkills[index],
      });
    }
    return api.put(`/candidate-profile/skills/${id}`, data).then((res) => res.data);
  },

  // Delete skill
  delete: async (id: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      const index = mockSkills.findIndex((s) => s.id === id);
      if (index >= 0) {
        mockSkills.splice(index, 1);
      }
      return mockDelay({ message: 'Skill deleted successfully' });
    }
    return api.delete(`/candidate-profile/skills/${id}`).then((res) => res.data);
  },

  // Endorse skill
  endorse: async (skillId: string, data: { comment?: string; rating?: number; relationship?: string }): Promise<{ message: string }> => {
    if (USE_MOCK) {
      const skill = mockSkills.find((s) => s.id === skillId);
      if (skill) {
        skill.endorsementCount += 1;
      }
      return mockDelay({ message: 'Skill endorsed successfully' });
    }
    return api.post(`/candidate-profile/skills/${skillId}/endorse`, data).then((res) => res.data);
  },
};

// ============================================
// PROJECTS API
// ============================================

export const projectsAPI = {
  // Get portfolio
  getPortfolio: async (): Promise<PortfolioSummary> => {
    if (USE_MOCK) {
      const allTechnologies = new Set<string>();
      mockProjects.forEach((p) => {
        p.technologies.forEach((t) => allTechnologies.add(t));
        p.frameworks.forEach((f) => allTechnologies.add(f));
        p.languages.forEach((l) => allTechnologies.add(l));
      });

      return mockDelay({
        projects: mockProjects,
        summary: {
          total: mockProjects.length,
          featured: mockProjects.filter((p) => p.isFeatured).length,
          byType: {
            personal: mockProjects.filter((p) => p.projectType === 'personal').length,
            professional: mockProjects.filter((p) => p.projectType === 'professional').length,
            openSource: mockProjects.filter((p) => p.projectType === 'open-source').length,
            freelance: mockProjects.filter((p) => p.projectType === 'freelance').length,
            academic: mockProjects.filter((p) => p.projectType === 'academic').length,
          },
          technologies: Array.from(allTechnologies),
        },
      });
    }
    return api.get('/candidate-profile/projects/portfolio').then((res) => res.data);
  },

  // Add project
  add: async (data: Partial<Project>): Promise<{ message: string; project: Project }> => {
    if (USE_MOCK) {
      const newProject: Project = {
        ...data,
        id: `proj-${Date.now()}`,
        profileId: 'profile-1',
        isOngoing: data.isOngoing || false,
        technologies: data.technologies || [],
        frameworks: data.frameworks || [],
        languages: data.languages || [],
        tools: data.tools || [],
        images: data.images || [],
        videos: data.videos || [],
        contributions: data.contributions || [],
        isPublic: data.isPublic !== false,
        isFeatured: data.isFeatured || false,
        displayOrder: mockProjects.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Project;
      mockProjects.unshift(newProject);
      return mockDelay({
        message: 'Project added successfully',
        project: newProject,
      });
    }
    return api.post('/candidate-profile/projects', data).then((res) => res.data);
  },

  // Update project
  update: async (id: string, data: Partial<Project>): Promise<{ message: string; project: Project }> => {
    if (USE_MOCK) {
      const index = mockProjects.findIndex((p) => p.id === id);
      if (index >= 0) {
        mockProjects[index] = { ...mockProjects[index], ...data };
      }
      return mockDelay({
        message: 'Project updated successfully',
        project: mockProjects[index],
      });
    }
    return api.put(`/candidate-profile/projects/${id}`, data).then((res) => res.data);
  },

  // Delete project
  delete: async (id: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      const index = mockProjects.findIndex((p) => p.id === id);
      if (index >= 0) {
        mockProjects.splice(index, 1);
      }
      return mockDelay({ message: 'Project deleted successfully' });
    }
    return api.delete(`/candidate-profile/projects/${id}`).then((res) => res.data);
  },

  // Reorder projects
  reorder: async (projectIds: string[]): Promise<{ message: string }> => {
    if (USE_MOCK) {
      projectIds.forEach((id, index) => {
        const project = mockProjects.find((p) => p.id === id);
        if (project) {
          project.displayOrder = index;
        }
      });
      mockProjects.sort((a, b) => a.displayOrder - b.displayOrder);
      return mockDelay({ message: 'Projects reordered successfully' });
    }
    return api.put('/candidate-profile/projects/reorder', { projectIds }).then((res) => res.data);
  },
};
