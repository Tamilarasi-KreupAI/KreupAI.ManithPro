// User Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN' | 'B2B';
    phone?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experience?: number;
    education?: string;
    linkedIn?: string;
    portfolio?: string;
    company?: string;
    companySize?: string;
    createdAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'CANDIDATE' | 'RECRUITER' | 'B2B';
    phone?: string;
    location?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// Job Types
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type JobStatus = 'OPEN' | 'CLOSED' | 'PAUSED' | 'DRAFT';

export interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    location: string;
    type: JobType;
    salary?: string;
    salaryMin?: number;
    salaryMax?: number;
    benefits: string[];
    skills: string[];
    experience: string;
    education: string;
    status: JobStatus;
    positions: number;
    deadline?: string;
    companyName: string;
    companyDescription?: string;
    companyWebsite?: string;
    companyLogo?: string;
    companySize?: string;
    companyIndustry?: string;
    postedBy: string;
    createdAt: string;
    updatedAt: string;
}

// Application Types
export type ApplicationStatus =
    | 'PENDING'
    | 'UNDER_REVIEW'
    | 'SHORTLISTED'
    | 'INTERVIEW_SCHEDULED'
    | 'OFFER_EXTENDED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN';

export interface Application {
    id: string;
    job: Job;
    jobId: string;
    candidate: User;
    candidateId: string;
    status: ApplicationStatus;
    coverLetter?: string;
    resume?: string;
    appliedAt: string;
    updatedAt: string;
}

// Message Types
export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    sender?: User;
    recipientId: string;
    recipient?: User;
    content: string;
    type: 'TEXT' | 'FILE' | 'SYSTEM';
    metadata?: any;
    sentAt: string;
    readAt?: string;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}

// Interview Types
export interface Interview {
    id: string;
    application: Application;
    applicationId: string;
    scheduledAt: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    type: 'IN_PERSON' | 'VIDEO' | 'PHONE';
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
    notes?: string;
    feedback?: string;
    createdAt: string;
    updatedAt: string;
}

// B2B Types
export interface BulkRequirement {
    id: string;
    title: string;
    description: string;
    quantity: number;
    skills: string[];
    experience: string;
    location: string;
    budget?: number;
    deadline?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdBy: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Contract {
    id: string;
    title: string;
    description: string;
    clientId: string;
    vendorId: string;
    startDate: string;
    endDate?: string;
    amount: number;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    terms?: string;
    createdAt: string;
    updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Navigation Types
export type RootStackParamList = {
    Auth: undefined;
    Candidate: undefined;
    Recruiter: undefined;
    B2B: undefined;
    Admin: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

import { NavigatorScreenParams } from '@react-navigation/native';

export type CandidateStackParamList = {
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    JobDetail: { jobId: string; job?: Job }; // Allow passing full job object to avoid loading
    ApplicationDetail: { applicationId: string };
    MessageDetail: { conversationId: string };
    EditProfile: undefined;
    SavedJobs: undefined;
    Settings: undefined;
};

export type B2BStackParamList = {
    B2BTabs: NavigatorScreenParams<B2BTabParamList>;
    RequirementDetail: { requirementId: string };
    CreateRequirement: undefined;
    AddCandidate: undefined;
    DraftContract: undefined;
    ContractDetail: { contractId: string };
    InvoiceDetail: { invoiceId: string };
    Invoices: undefined;
    Settings: undefined;
};

export type B2BTabParamList = {
    Dashboard: undefined;
    Requirements: undefined;
    Supply: undefined;
    Contracts: undefined;
    Profile: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Search: undefined;
    Applications: undefined;
    Interviews: undefined;
    Messages: undefined;
    Profile: undefined;
};


export type RecruiterStackParamList = {
    RecruiterTabs: NavigatorScreenParams<RecruiterTabParamList>;
    PostJob: undefined;
    CandidateDetail: { candidateId: string };
    ApplicationDetail: { applicationId: string };
    ScheduleInterview: undefined;
    Analytics: undefined;
    Settings: undefined;
};

export type RecruiterTabParamList = {
    Dashboard: undefined;
    Jobs: undefined;
    Candidates: undefined;
    Applications: undefined;
    Messages: undefined;
};


export type AdminStackParamList = {
    AdminTabs: NavigatorScreenParams<AdminTabParamList>;
    UserDetail: { userId: string };
    JobApproval: { jobId: string };
    Settings: undefined;
};

export type AdminTabParamList = {
    Dashboard: undefined;
    Users: undefined;
    Jobs: undefined;
    Analytics: undefined;
};
