import { User, Job, Application, ApplicationStatus, JobType, JobStatus, UserRole } from '../types';

export const mockUsers: User[] = [
    {
        id: '1',
        email: 'candidate@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CANDIDATE',
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: 5,
        location: 'New York, NY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        email: 'recruiter@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'RECRUITER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        email: 'client@manithpro.com',
        firstName: 'Business',
        lastName: 'Client',
        role: 'BUSINESS_CLIENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '4',
        email: 'vendor@manithpro.com',
        firstName: 'Business',
        lastName: 'Vendor',
        role: 'BUSINESS_VENDOR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const mockJobs: Job[] = [
    {
        id: '1',
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer to join our team.',
        requirements: ['5+ years experience', 'Strong TypeScript skills'],
        responsibilities: ['Build scalable frontend', 'Mentor juniors'],
        location: 'Remote',
        type: 'FULL_TIME',
        salaryMin: 120000,
        salaryMax: 160000,
        benefits: ['Health insurance', '401k'],
        skills: ['React', 'TypeScript', 'Redux'],
        experience: 'Senior Level',
        status: 'OPEN',
        positions: 1,
        companyName: 'TechCorp',
        postedById: '2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
            applications: 12
        }
    },
    {
        id: '2',
        title: 'Frontend Engineer',
        description: 'Join our fast-paced startup.',
        requirements: ['3+ years experience', 'React knowledge'],
        responsibilities: ['Develop UI components'],
        location: 'San Francisco, CA',
        type: 'FULL_TIME',
        salaryMin: 100000,
        salaryMax: 140000,
        benefits: ['Stock options', 'Free lunch'],
        skills: ['React', 'JavaScript', 'CSS'],
        experience: 'Mid Level',
        status: 'OPEN',
        positions: 2,
        companyName: 'StartupInc',
        postedById: '2',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        updatedAt: new Date().toISOString(),
        _count: {
            applications: 5
        }
    }
];

export const mockApplications: Application[] = [
    {
        id: '1',
        jobId: '1',
        candidateId: '1',
        resume: 'resume.pdf',
        status: 'PENDING',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        job: {
            id: '1',
            title: 'Senior React Developer',
            location: 'Remote',
            type: 'FULL_TIME'
        },
        candidate: mockUsers[0]
    }
];

export const mockMessages = [
    {
        id: '1',
        content: 'Hello, I am interested in this position.',
        status: 'READ',
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderId: '1',
        receiverId: '2',
        sender: mockUsers[0],
        receiver: mockUsers[1]
    },
    {
        id: '2',
        content: 'Great! Let\'s schedule an interview.',
        status: 'SENT',
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderId: '2',
        receiverId: '1',
        sender: mockUsers[1],
        receiver: mockUsers[0]
    }
];

export const mockInterviews = [
    {
        id: '1',
        type: 'TECHNICAL',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        applicationId: '1',
        scheduledById: '2',
        candidateId: '1',
        application: mockApplications[0],
        scheduledBy: mockUsers[1],
        candidate: mockUsers[0]
    }
];
