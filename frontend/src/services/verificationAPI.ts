import axios from 'axios';
import type {
  EmailDomainVerification,
  LinkedInEmploymentVerification,
  PeerEndorsement,
  ManagerReference,
  CertificationVerification,
  TrustScore,
  VerificationStatusSummary,
  RequestEmailVerificationPayload,
  RequestPeerEndorsementPayload,
  SubmitPeerEndorsementPayload,
  RequestManagerReferencePayload,
  SubmitManagerReferencePayload,
  RequestCertificationVerificationPayload,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USE_MOCK = true; // Toggle for development

// Mock data for development
const mockEmailVerifications: EmailDomainVerification[] = [
  {
    id: 'ev1',
    profileId: 'profile1',
    workExperienceId: 'we1',
    workEmail: 'john.doe@techcorp.com',
    emailDomain: 'techcorp.com',
    companyName: 'TechCorp Inc.',
    verificationStatus: 'COMPLETED',
    isVerified: true,
    verifiedAt: '2024-01-15T10:00:00Z',
    verificationMethod: 'code',
    verificationAttempts: 1,
    maxAttempts: 3,
    mxRecordValid: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ev2',
    profileId: 'profile1',
    workEmail: 'john@startup.io',
    emailDomain: 'startup.io',
    companyName: 'StartupCo',
    verificationStatus: 'SENT',
    isVerified: false,
    verificationAttempts: 0,
    maxAttempts: 3,
    expiresAt: '2024-02-20T08:00:00Z',
    codeSentAt: '2024-01-19T08:00:00Z',
    createdAt: '2024-01-19T08:00:00Z',
    updatedAt: '2024-01-19T08:00:00Z',
  },
];

const mockLinkedInVerifications: LinkedInEmploymentVerification[] = [
  {
    id: 'lv1',
    profileId: 'profile1',
    workExperienceId: 'we1',
    linkedInProfileId: 'li1',
    claimedCompanyName: 'TechCorp Inc.',
    claimedTitle: 'Senior Software Engineer',
    claimedStartDate: '2022-01-01',
    claimedIsCurrent: true,
    linkedInCompanyName: 'TechCorp Inc.',
    linkedInTitle: 'Senior Software Engineer',
    linkedInStartDate: '2022-01-01',
    linkedInIsCurrent: true,
    companyNameMatch: 'exact',
    titleMatch: 'exact',
    dateMatch: 'exact',
    overallMatch: 'verified',
    matchScore: 100,
    verificationStatus: 'COMPLETED',
    isVerified: true,
    verifiedAt: '2024-01-15T10:00:00Z',
    needsManualReview: false,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockPeerEndorsements: PeerEndorsement[] = [
  {
    id: 'pe1',
    profileId: 'profile1',
    requestId: 'req1',
    requestStatus: 'ACCEPTED',
    requestSentAt: '2024-01-10T08:00:00Z',
    endorserEmail: 'sarah.smith@techcorp.com',
    endorserName: 'Sarah Smith',
    endorserTitle: 'Engineering Manager',
    endorserCompany: 'TechCorp Inc.',
    relationship: 'manager',
    workedTogetherFrom: '2022-01-01',
    workedTogetherTo: '2023-12-31',
    workedAtCompany: 'TechCorp Inc.',
    sharedProjects: ['Project Alpha', 'API Gateway'],
    endorsementTitle: 'Exceptional Technical Leader',
    endorsementText: 'John is an outstanding engineer with excellent problem-solving skills and great leadership potential. He consistently delivers high-quality work and mentors junior team members effectively.',
    strengths: ['Problem Solving', 'Technical Leadership', 'Communication'],
    areasOfExpertise: ['Backend Development', 'System Design', 'API Development'],
    skillEndorsements: [
      { skillName: 'TypeScript', rating: 5, comment: 'Expert level' },
      { skillName: 'Node.js', rating: 5, comment: 'Very strong' },
      { skillName: 'System Design', rating: 4, comment: 'Solid skills' },
    ],
    overallRating: 5,
    workQualityRating: 5,
    collaborationRating: 5,
    communicationRating: 4,
    leadershipRating: 4,
    technicalSkillsRating: 5,
    reliabilityRating: 5,
    wouldWorkAgain: true,
    wouldRecommend: true,
    isVerified: true,
    verifiedAt: '2024-01-12T14:00:00Z',
    verificationMethod: 'email',
    isPublic: true,
    showOnProfile: true,
    anonymizeEndorser: false,
    endorsedAt: '2024-01-12T14:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'pe2',
    profileId: 'profile1',
    requestId: 'req2',
    requestStatus: 'SENT',
    requestSentAt: '2024-01-18T08:00:00Z',
    requestExpiresAt: '2024-02-01T08:00:00Z',
    endorserEmail: 'mike.johnson@gmail.com',
    endorserName: 'Mike Johnson',
    endorserTitle: 'Senior Developer',
    endorserCompany: 'TechCorp Inc.',
    relationship: 'colleague',
    workedAtCompany: 'TechCorp Inc.',
    sharedProjects: [],
    strengths: [],
    areasOfExpertise: [],
    isVerified: false,
    isPublic: true,
    showOnProfile: true,
    anonymizeEndorser: false,
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-18T08:00:00Z',
  },
];

const mockManagerReferences: ManagerReference[] = [
  {
    id: 'mr1',
    profileId: 'profile1',
    workExperienceId: 'we1',
    requestId: 'mreq1',
    requestStatus: 'COMPLETED',
    requestSentAt: '2024-01-05T08:00:00Z',
    reminderCount: 0,
    referenceEmail: 'david.wilson@techcorp.com',
    referenceName: 'David Wilson',
    referenceTitle: 'VP of Engineering',
    referenceCompany: 'TechCorp Inc.',
    referenceRelationship: 'skip_level_manager',
    companyName: 'TechCorp Inc.',
    candidateTitle: 'Senior Software Engineer',
    employmentStartDate: '2022-01-01',
    wasDirectReport: false,
    reportingDuration: '2 years',
    overallPerformance: 5,
    technicalCompetence: 5,
    communicationSkills: 4,
    teamworkCollaboration: 5,
    problemSolving: 5,
    leadership: 4,
    initiative: 5,
    reliability: 5,
    adaptability: 4,
    keyStrengths: 'Exceptional problem-solving abilities, strong technical leadership, and excellent communication with stakeholders.',
    areasForImprovement: 'Could benefit from more experience in people management and cross-functional leadership.',
    majorAccomplishments: 'Led the successful migration of our legacy system to microservices, reducing system downtime by 75%.',
    reasonForLeaving: 'N/A - Still employed',
    additionalComments: 'John is a highly valuable team member and has been instrumental in our engineering success.',
    eligibleForRehire: 'yes',
    overallRecommendation: 'highly_recommend',
    recommendationText: 'I highly recommend John for any senior engineering position. His technical skills, leadership abilities, and work ethic are exceptional.',
    isVerified: true,
    verifiedAt: '2024-01-08T10:00:00Z',
    verificationMethod: 'email',
    isPublic: false,
    showOnProfile: true,
    anonymizeReference: false,
    shareWithEmployers: true,
    completedAt: '2024-01-08T10:00:00Z',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
  },
];

const mockCertificationVerifications: CertificationVerification[] = [
  {
    id: 'cv1',
    profileId: 'profile1',
    certificationId: 'cert1',
    certificationName: 'AWS Solutions Architect Professional',
    issuingOrganization: 'Amazon Web Services',
    credentialId: 'AWS-SAP-123456',
    credentialUrl: 'https://aws.amazon.com/verification/AWS-SAP-123456',
    issueDate: '2023-06-15',
    expirationDate: '2026-06-15',
    verificationProvider: 'credly',
    verificationStatus: 'COMPLETED',
    isVerified: true,
    verifiedAt: '2023-06-15T12:00:00Z',
    verificationMethod: 'api',
    verifiedName: 'AWS Certified Solutions Architect - Professional',
    verifiedIssuingOrg: 'Amazon Web Services',
    verifiedCredentialId: 'AWS-SAP-123456',
    verifiedIssueDate: '2023-06-15',
    verifiedExpirationDate: '2026-06-15',
    verifiedHolderName: 'John Doe',
    verifiedSkills: ['AWS', 'Cloud Architecture', 'System Design'],
    nameMatch: 'exact',
    dateMatch: 'exact',
    holderMatch: 'exact',
    overallMatch: 'verified',
    matchScore: 100,
    credentialStatus: 'active',
    statusCheckedAt: '2024-01-15T08:00:00Z',
    badgeImageUrl: 'https://images.credly.com/aws-sap-badge.png',
    verificationAttempts: 1,
    needsManualReview: false,
    autoReverify: true,
    nextReverificationAt: '2024-04-15T08:00:00Z',
    createdAt: '2023-06-15T12:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

const mockTrustScore: TrustScore = {
  id: 'ts1',
  profileId: 'profile1',
  overallScore: 72,
  tier: 'gold',
  emailVerificationScore: 20,
  linkedInVerificationScore: 15,
  endorsementScore: 15,
  referenceScore: 12,
  certificationScore: 10,
  profileCompletenessScore: 0,
  activityScore: 0,
  verifiedEmails: 2,
  verifiedEmployments: 1,
  endorsementsReceived: 1,
  referencesReceived: 1,
  verifiedCertifications: 1,
  hasVerifiedIdentity: true,
  hasVerifiedEmployment: true,
  hasEndorsements: true,
  hasReferences: true,
  hasVerifiedCerts: true,
  lastCalculatedAt: '2024-01-20T08:00:00Z',
  createdAt: '2024-01-01T08:00:00Z',
  updatedAt: '2024-01-20T08:00:00Z',
};

const mockVerificationStatus: VerificationStatusSummary = {
  emailVerifications: {
    total: 2,
    verified: 1,
    pending: 1,
  },
  linkedInVerifications: {
    total: 1,
    verified: 1,
    pending: 0,
  },
  peerEndorsements: {
    total: 2,
    received: 1,
    pending: 1,
  },
  managerReferences: {
    total: 1,
    completed: 1,
    pending: 0,
  },
  certificationVerifications: {
    total: 1,
    verified: 1,
    pending: 0,
  },
  trustScore: mockTrustScore,
};

// API client
const api = axios.create({
  baseURL: `${API_BASE}/api/verification`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// EMAIL DOMAIN VERIFICATION API
// ============================================

export const emailVerificationAPI = {
  request: async (payload: RequestEmailVerificationPayload): Promise<{ success: boolean; verification: EmailDomainVerification }> => {
    if (USE_MOCK) {
      const newVerification: EmailDomainVerification = {
        id: `ev${Date.now()}`,
        profileId: 'profile1',
        workEmail: payload.workEmail,
        emailDomain: payload.workEmail.split('@')[1],
        companyName: payload.companyName,
        workExperienceId: payload.workExperienceId,
        verificationStatus: 'SENT',
        isVerified: false,
        verificationAttempts: 0,
        maxAttempts: 3,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        codeSentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, verification: newVerification };
    }
    const { data } = await api.post('/email/request', payload);
    return data;
  },

  verify: async (verificationId: string, code: string): Promise<{ success: boolean; verification: EmailDomainVerification }> => {
    if (USE_MOCK) {
      const verification = mockEmailVerifications.find((v) => v.id === verificationId);
      if (!verification) throw new Error('Verification not found');
      return {
        success: true,
        verification: {
          ...verification,
          verificationStatus: 'COMPLETED',
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        },
      };
    }
    const { data } = await api.post('/email/verify', { verificationId, code });
    return data;
  },

  getAll: async (): Promise<{ verifications: EmailDomainVerification[] }> => {
    if (USE_MOCK) {
      return { verifications: mockEmailVerifications };
    }
    const { data } = await api.get('/email');
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      return { success: true };
    }
    const { data } = await api.delete(`/email/${id}`);
    return data;
  },
};

// ============================================
// LINKEDIN EMPLOYMENT VERIFICATION API
// ============================================

export const linkedInVerificationAPI = {
  request: async (workExperienceId: string): Promise<{ success: boolean; verification: LinkedInEmploymentVerification }> => {
    if (USE_MOCK) {
      const newVerification: LinkedInEmploymentVerification = {
        id: `lv${Date.now()}`,
        profileId: 'profile1',
        workExperienceId,
        claimedCompanyName: 'Company Name',
        claimedTitle: 'Job Title',
        claimedStartDate: '2022-01-01',
        claimedIsCurrent: true,
        verificationStatus: 'PENDING',
        isVerified: false,
        needsManualReview: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, verification: newVerification };
    }
    const { data } = await api.post('/linkedin/request', { workExperienceId });
    return data;
  },

  getAll: async (): Promise<{ verifications: LinkedInEmploymentVerification[] }> => {
    if (USE_MOCK) {
      return { verifications: mockLinkedInVerifications };
    }
    const { data } = await api.get('/linkedin');
    return data;
  },
};

// ============================================
// PEER ENDORSEMENTS API
// ============================================

export const peerEndorsementAPI = {
  request: async (payload: RequestPeerEndorsementPayload): Promise<{ success: boolean; endorsement: PeerEndorsement }> => {
    if (USE_MOCK) {
      const newEndorsement: PeerEndorsement = {
        id: `pe${Date.now()}`,
        profileId: 'profile1',
        requestId: `req${Date.now()}`,
        requestStatus: 'SENT',
        requestSentAt: new Date().toISOString(),
        requestExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        requestMessage: payload.requestMessage,
        endorserEmail: payload.endorserEmail,
        endorserName: payload.endorserName,
        endorserTitle: payload.endorserTitle,
        endorserCompany: payload.endorserCompany,
        relationship: payload.relationship,
        workedAtCompany: payload.workedAtCompany,
        workedTogetherFrom: payload.workedTogetherFrom,
        workedTogetherTo: payload.workedTogetherTo,
        sharedProjects: [],
        strengths: [],
        areasOfExpertise: [],
        isVerified: false,
        isPublic: true,
        showOnProfile: true,
        anonymizeEndorser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, endorsement: newEndorsement };
    }
    const { data } = await api.post('/endorsements/request', payload);
    return data;
  },

  submit: async (token: string, payload: SubmitPeerEndorsementPayload): Promise<{ success: boolean; endorsement: PeerEndorsement }> => {
    if (USE_MOCK) {
      const endorsement = mockPeerEndorsements[0];
      return { success: true, endorsement };
    }
    const { data } = await api.post(`/endorsements/submit/${token}`, payload);
    return data;
  },

  getAll: async (): Promise<{ endorsements: PeerEndorsement[] }> => {
    if (USE_MOCK) {
      return { endorsements: mockPeerEndorsements };
    }
    const { data } = await api.get('/endorsements');
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      return { success: true };
    }
    const { data } = await api.delete(`/endorsements/${id}`);
    return data;
  },
};

// ============================================
// MANAGER REFERENCES API
// ============================================

export const managerReferenceAPI = {
  request: async (payload: RequestManagerReferencePayload): Promise<{ success: boolean; reference: ManagerReference }> => {
    if (USE_MOCK) {
      const newReference: ManagerReference = {
        id: `mr${Date.now()}`,
        profileId: 'profile1',
        workExperienceId: payload.workExperienceId,
        requestId: `mreq${Date.now()}`,
        requestStatus: 'SENT',
        requestSentAt: new Date().toISOString(),
        requestExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        requestMessage: payload.requestMessage,
        reminderCount: 0,
        referenceEmail: payload.referenceEmail,
        referenceName: payload.referenceName,
        referenceTitle: payload.referenceTitle,
        referenceCompany: payload.referenceCompany,
        referencePhone: payload.referencePhone,
        referenceLinkedIn: payload.referenceLinkedIn,
        referenceRelationship: payload.referenceRelationship,
        companyName: payload.companyName,
        candidateTitle: payload.candidateTitle,
        employmentStartDate: payload.employmentStartDate,
        employmentEndDate: payload.employmentEndDate,
        isVerified: false,
        isPublic: false,
        showOnProfile: true,
        anonymizeReference: false,
        shareWithEmployers: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, reference: newReference };
    }
    const { data } = await api.post('/references/request', payload);
    return data;
  },

  submit: async (token: string, payload: SubmitManagerReferencePayload): Promise<{ success: boolean; reference: ManagerReference }> => {
    if (USE_MOCK) {
      const reference = mockManagerReferences[0];
      return { success: true, reference };
    }
    const { data } = await api.post(`/references/submit/${token}`, payload);
    return data;
  },

  getAll: async (): Promise<{ references: ManagerReference[] }> => {
    if (USE_MOCK) {
      return { references: mockManagerReferences };
    }
    const { data } = await api.get('/references');
    return data;
  },

  sendReminder: async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      return { success: true };
    }
    const { data } = await api.post(`/references/${id}/remind`);
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      return { success: true };
    }
    const { data } = await api.delete(`/references/${id}`);
    return data;
  },
};

// ============================================
// CERTIFICATION VERIFICATION API
// ============================================

export const certificationVerificationAPI = {
  request: async (payload: RequestCertificationVerificationPayload): Promise<{ success: boolean; verification: CertificationVerification }> => {
    if (USE_MOCK) {
      const newVerification: CertificationVerification = {
        id: `cv${Date.now()}`,
        profileId: 'profile1',
        certificationId: payload.certificationId,
        certificationName: payload.certificationName,
        issuingOrganization: payload.issuingOrganization,
        credentialId: payload.credentialId,
        credentialUrl: payload.credentialUrl,
        issueDate: payload.issueDate,
        expirationDate: payload.expirationDate,
        verificationStatus: 'PENDING',
        isVerified: false,
        verifiedSkills: [],
        verificationAttempts: 0,
        needsManualReview: false,
        autoReverify: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, verification: newVerification };
    }
    const { data } = await api.post('/certifications/request', payload);
    return data;
  },

  getAll: async (): Promise<{ verifications: CertificationVerification[] }> => {
    if (USE_MOCK) {
      return { verifications: mockCertificationVerifications };
    }
    const { data } = await api.get('/certifications');
    return data;
  },
};

// ============================================
// TRUST SCORE API
// ============================================

export const trustScoreAPI = {
  get: async (): Promise<{ trustScore: TrustScore }> => {
    if (USE_MOCK) {
      return { trustScore: mockTrustScore };
    }
    const { data } = await api.get('/trust-score');
    return data;
  },

  refresh: async (): Promise<{ success: boolean; trustScore: TrustScore }> => {
    if (USE_MOCK) {
      return { success: true, trustScore: mockTrustScore };
    }
    const { data } = await api.post('/trust-score/refresh');
    return data;
  },
};

// ============================================
// VERIFICATION STATUS API
// ============================================

export const verificationStatusAPI = {
  get: async (): Promise<{ status: VerificationStatusSummary }> => {
    if (USE_MOCK) {
      return { status: mockVerificationStatus };
    }
    const { data } = await api.get('/status');
    return data;
  },
};

export default {
  email: emailVerificationAPI,
  linkedIn: linkedInVerificationAPI,
  endorsements: peerEndorsementAPI,
  references: managerReferenceAPI,
  certifications: certificationVerificationAPI,
  trustScore: trustScoreAPI,
  status: verificationStatusAPI,
};
