export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';

export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  education?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  createdAt: string;
  updatedAt: string;
}

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
  experience?: string;
  education?: string;
  status: JobStatus;
  positions: number;
  deadline?: string;
  postedById: string;
  postedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  resume: string;
  coverLetter?: string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    location: string;
    type: JobType;
  };
  candidate?: User;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface DashboardStats {
  totalJobs?: number;
  openJobs?: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications?: number;
  recentApplications: Application[];
}
