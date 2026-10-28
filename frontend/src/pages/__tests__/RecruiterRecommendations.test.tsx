import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecruiterRecommendations from '../RecruiterRecommendations';
import Navbar from '../../components/Navbar';

// Mock shared API client and services
const mockJobAPI = {
  getAll: vi.fn(),
  getById: vi.fn(),
};

const mockApplicationAPI = {
  getAll: vi.fn(),
};

const mockCandidateRecommendationsAPI = {
  getForJob: vi.fn(),
  generate: vi.fn(),
  recordAction: vi.fn(),
};

vi.mock('../../services/api', () => ({
  jobAPI: {
    getAll: (params?: any) => mockJobAPI.getAll(params),
    getById: (id: string) => mockJobAPI.getById(id),
  },
  applicationAPI: {
    getAll: (params?: any) => mockApplicationAPI.getAll(params),
  },
  authAPI: {
    getCurrentUser: vi.fn().mockResolvedValue({ id: 'rec-1', role: 'RECRUITER' }),
  },
}));

vi.mock('../../services/batch23SmartRecommendationsAPI', () => ({
  candidateRecommendationsAPI: {
    getForJob: (jobId: string) => mockCandidateRecommendationsAPI.getForJob(jobId),
    generate: (params: any) => mockCandidateRecommendationsAPI.generate(params),
    recordAction: (id: string, params: any) => mockCandidateRecommendationsAPI.recordAction(id, params),
  },
}));

// Mock Auth Context for Navbar and Recruiter route testing
let mockCurrentUser: any = {
  id: 'rec-1',
  firstName: 'Sarah',
  lastName: 'Recruiter',
  role: 'RECRUITER',
  email: 'sarah@example.com',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    token: 'fake-jwt-token',
    logout: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    loading: false,
  }),
}));

const mockJobs = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    companyName: 'Tech Innovators',
    location: 'San Francisco, CA',
    type: 'FULL_TIME',
    salaryMin: 140000,
    salaryMax: 180000,
    skills: ['React', 'TypeScript', 'Tailwind'],
  },
  {
    id: 'job-2',
    title: 'Backend Developer',
    companyName: 'Cloud Systems',
    location: 'Remote',
    type: 'FULL_TIME',
    salaryMin: 130000,
    salaryMax: 170000,
    skills: ['Node.js', 'PostgreSQL', 'Docker'],
  },
];

const mockRecsJob1 = [
  {
    id: 'rec-1',
    jobId: 'job-1',
    candidateId: 'cand-1',
    recommendationScore: 95,
    recommendationRank: 1,
    recommendationType: 'TOP_PICK',
    overallMatch: 0.95,
    skillMatch: 0.95,
    experienceMatch: 1,
    candidateName: 'Alice Johnson',
    candidateTitle: 'Lead React Developer',
    candidateLocation: 'San Francisco, CA',
    candidateExperience: 7,
    candidateSkills: ['React', 'TypeScript', 'Tailwind', 'GraphQL'],
    matchReasons: [
      { reason: '95% skill match', importance: 'high' },
      { reason: 'Experience level matches', importance: 'medium' },
    ],
    standoutFactors: ['React', 'TypeScript'],
    candidate: {
      id: 'cand-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      location: 'San Francisco, CA',
      experience: '7 years',
      skills: ['React', 'TypeScript', 'Tailwind', 'GraphQL'],
      bio: 'Passionate frontend architect specializing in design systems.',
    },
  },
  {
    id: 'rec-2',
    jobId: 'job-1',
    candidateId: 'cand-2',
    recommendationScore: 78,
    recommendationRank: 2,
    recommendationType: 'GOOD_MATCH',
    overallMatch: 0.78,
    skillMatch: 0.75,
    experienceMatch: 1,
    candidateName: 'Bob Smith',
    candidateTitle: 'Software Engineer',
    candidateLocation: 'Oakland, CA',
    candidateExperience: 4,
    candidateSkills: ['React', 'JavaScript'],
    matchReasons: [{ reason: 'Matches required skills', importance: 'medium' }],
    standoutFactors: ['React'],
    candidate: {
      id: 'cand-2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      location: 'Oakland, CA',
      experience: '4 years',
      skills: ['React', 'JavaScript'],
      bio: 'Fullstack developer with strong React experience.',
    },
  },
];

describe('R-4: Recruiter Recommendations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = {
      id: 'rec-1',
      firstName: 'Sarah',
      lastName: 'Recruiter',
      role: 'RECRUITER',
      email: 'sarah@example.com',
    };
    mockJobAPI.getAll.mockResolvedValue({ jobs: mockJobs });
    mockApplicationAPI.getAll.mockResolvedValue({ applications: [] });
    mockCandidateRecommendationsAPI.getForJob.mockResolvedValue(mockRecsJob1);
    mockCandidateRecommendationsAPI.generate.mockResolvedValue(mockRecsJob1);
    mockCandidateRecommendationsAPI.recordAction.mockResolvedValue({ success: true });
  });

  it('successfully loads and renders candidate recommendations for the default job', async () => {
    render(
      <MemoryRouter>
        <RecruiterRecommendations />
      </MemoryRouter>
    );

    // Initial loading spinner disappears
    await waitFor(() => {
      expect(screen.getByText('Smart Candidate Recommendations')).toBeInTheDocument();
    });

    // Verifies getForJob was called with the first job ID
    expect(mockCandidateRecommendationsAPI.getForJob).toHaveBeenCalledWith('job-1');

    // Job selector displays first job
    const jobSelector = screen.getByLabelText(/select job/i);
    expect(jobSelector).toHaveValue('job-1');

    // Candidate details are rendered
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('95% Match')).toBeInTheDocument();
    expect(screen.getByText('⭐ Top Match')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('78% Match')).toBeInTheDocument();

    // Matching reasons and skills are rendered
    expect(screen.getByText('95% skill match')).toBeInTheDocument();
    expect(screen.getByText('Experience level matches')).toBeInTheDocument();

    // Action buttons are present
    expect(screen.getAllByRole('button', { name: /invite to apply/i }).length).toBe(2);
    expect(screen.getAllByRole('button', { name: /view profile/i }).length).toBe(2);
  });

  it('switches jobs and fetches recommendations for the selected job', async () => {
    mockCandidateRecommendationsAPI.getForJob.mockImplementation((jobId: string) => {
      if (jobId === 'job-2') {
        return Promise.resolve([
          {
            id: 'rec-3',
            jobId: 'job-2',
            candidateId: 'cand-3',
            recommendationScore: 88,
            recommendationRank: 1,
            recommendationType: 'TOP_PICK',
            overallMatch: 0.88,
            candidateName: 'Charlie Node',
            candidateSkills: ['Node.js', 'PostgreSQL'],
            matchReasons: [{ reason: 'Backend specialist', importance: 'high' }],
            standoutFactors: ['Node.js'],
            candidate: {
              id: 'cand-3',
              firstName: 'Charlie',
              lastName: 'Node',
              location: 'Remote',
              skills: ['Node.js', 'PostgreSQL'],
            },
          },
        ]);
      }
      return Promise.resolve(mockRecsJob1);
    });

    render(
      <MemoryRouter>
        <RecruiterRecommendations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    // Select second job
    const jobSelector = screen.getByLabelText(/select job/i);
    fireEvent.change(jobSelector, { target: { value: 'job-2' } });

    await waitFor(() => {
      expect(mockCandidateRecommendationsAPI.getForJob).toHaveBeenCalledWith('job-2');
      expect(screen.getByText('Charlie Node')).toBeInTheDocument();
    });
  });

  it('generates recommendations when Generate Recommendations button is clicked', async () => {
    const freshlyGenerated = [
      {
        id: 'rec-gen-1',
        jobId: 'job-1',
        candidateId: 'cand-gen-1',
        recommendationScore: 98,
        recommendationRank: 1,
        recommendationType: 'TOP_PICK',
        overallMatch: 0.98,
        candidateName: 'Diana Prince',
        candidateSkills: ['React', 'TypeScript'],
        matchReasons: [{ reason: 'Perfect skill alignment', importance: 'high' }],
        standoutFactors: ['React', 'TypeScript'],
        candidate: {
          id: 'cand-gen-1',
          firstName: 'Diana',
          lastName: 'Prince',
          email: 'diana@example.com',
          location: 'Themyscira',
          skills: ['React', 'TypeScript'],
        },
      },
    ];

    mockCandidateRecommendationsAPI.generate.mockResolvedValue(freshlyGenerated);

    render(
      <MemoryRouter>
        <RecruiterRecommendations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    // Click header Generate Recommendations button
    const generateBtn = screen.getByTestId('generate-recommendations-btn');
    expect(generateBtn).toBeInTheDocument();
    fireEvent.click(generateBtn);

    // Verify generate API was called with current selectedJob
    expect(mockCandidateRecommendationsAPI.generate).toHaveBeenCalledWith({ jobId: 'job-1' });

    // Verify recommendations update with the newly generated results
    await waitFor(() => {
      expect(screen.getByText('Diana Prince')).toBeInTheDocument();
      expect(screen.getByText('98% Match')).toBeInTheDocument();
      expect(screen.getByText(/successfully generated 1 recommendation/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when job has 0 recommendations and allows generating from empty state', async () => {
    mockCandidateRecommendationsAPI.getForJob.mockResolvedValue([]);
    mockCandidateRecommendationsAPI.generate.mockResolvedValue(mockRecsJob1);

    render(
      <MemoryRouter>
        <RecruiterRecommendations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No matching candidates found')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/try generating ai recommendations for this job/i)
    ).toBeInTheDocument();

    // Click generate button in empty state card
    const emptyStateGenerateBtn = screen.getAllByRole('button', {
      name: /generate recommendations/i,
    })[1]; // Index 1 is the one inside the empty state card

    fireEvent.click(emptyStateGenerateBtn);

    expect(mockCandidateRecommendationsAPI.generate).toHaveBeenCalledWith({ jobId: 'job-1' });

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('displays empty state when recruiter has no jobs posted', async () => {
    mockJobAPI.getAll.mockResolvedValue({ jobs: [] });

    render(
      <MemoryRouter>
        <RecruiterRecommendations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No jobs posted yet')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /post a new job/i })).toHaveAttribute(
      'href',
      '/jobs/new'
    );
  });

  it('handles API errors gracefully and allows retrying', async () => {
    mockCandidateRecommendationsAPI.getForJob.mockRejectedValueOnce(
      new Error('Failed to retrieve recommendations from server')
    );

    render(
      <MemoryRouter>
        <RecruiterRecommendations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to retrieve recommendations from server/i)).toBeInTheDocument();

    // Now mock resolves on retry
    mockCandidateRecommendationsAPI.getForJob.mockResolvedValueOnce(mockRecsJob1);

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('records actions when Invite to Apply and View Profile are clicked', async () => {
    render(
      <MemoryRouter>
        <RecruiterRecommendations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const inviteBtns = screen.getAllByRole('button', { name: /invite to apply/i });
    fireEvent.click(inviteBtns[0]);

    await waitFor(() => {
      expect(mockCandidateRecommendationsAPI.recordAction).toHaveBeenCalledWith('rec-1', {
        action: 'contact',
      });
      expect(screen.getByText(/invitation recorded for alice johnson/i)).toBeInTheDocument();
    });

    const viewBtns = screen.getAllByRole('button', { name: /view profile/i });
    fireEvent.click(viewBtns[0]);

    await waitFor(() => {
      expect(mockCandidateRecommendationsAPI.recordAction).toHaveBeenCalledWith('rec-1', {
        action: 'view',
      });
      expect(screen.getByText(/viewed profile for alice johnson/i)).toBeInTheDocument();
    });
  });

  it('renders Recommendations link in Navbar for recruiter and navigates to /recruiter/recommendations', async () => {
    render(
      <MemoryRouter initialEntries={['/recruiter/dashboard']}>
        <Navbar />
      </MemoryRouter>
    );

    // Desktop recruiter navigation contains "Recommendations" link pointing to /recruiter/recommendations
    const recLinks = screen.getAllByRole('link', { name: /recommendations/i });
    expect(recLinks.length).toBeGreaterThanOrEqual(1);

    const recommendationsDesktopLink = recLinks.find(
      (link) => link.getAttribute('href') === '/recruiter/recommendations'
    );
    expect(recommendationsDesktopLink).toBeInTheDocument();
    expect(recommendationsDesktopLink).toHaveAttribute('href', '/recruiter/recommendations');
  });

  it('does not render recruiter Recommendations link in Navbar desktop nav for candidate users', async () => {
    mockCurrentUser = {
      id: 'cand-1',
      firstName: 'Candidate',
      lastName: 'User',
      role: 'CANDIDATE',
      email: 'cand@example.com',
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    // Candidate gets AI Match instead of recruiter Recommendations
    const recLinks = screen.queryAllByRole('link', { name: /^recommendations$/i });
    expect(recLinks.length).toBe(0);

    expect(screen.getByRole('link', { name: /ai match/i })).toHaveAttribute(
      'href',
      '/smart-recommendations'
    );
  });

  it('verifies the route /recruiter/recommendations renders the RecruiterRecommendations component', async () => {
    render(
      <MemoryRouter initialEntries={['/recruiter/recommendations']}>
        <Routes>
          <Route path="/recruiter/recommendations" element={<RecruiterRecommendations />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Smart Candidate Recommendations')).toBeInTheDocument();
    });

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });
});
