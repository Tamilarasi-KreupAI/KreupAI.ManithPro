import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findUnique, findMany, findFirst, create, update } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    user = { findUnique, findMany };
    job = { findUnique, findMany };
    application = { findMany };
    candidateRecommendation = { findMany, findFirst, create, update };
  },
}));

import {
  getCandidateRecommendations,
  getJobRecommendations,
  recordCandidateRecommendationAction,
} from './batch23SmartRecommendations.controller';

const response = () => {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
};

describe('AI-35 recommendation authorization and scoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a candidate attempting to read another candidate recommendation context', async () => {
    const res = response();
    await getJobRecommendations({ params: { candidateId: 'candidate-b' }, user: { userId: 'candidate-a', role: 'CANDIDATE' } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('rejects a recruiter requesting another recruiter job', async () => {
    findUnique.mockResolvedValueOnce({ id: 'job-b', postedById: 'recruiter-b' });
    const res = response();
    await getCandidateRecommendations({ params: { jobId: 'job-b' }, user: { userId: 'recruiter-a', role: 'RECRUITER' } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns a deterministic best job, excludes applied jobs, and changes after skills change', async () => {
    const jobs = [
      { id: 'job-react', status: 'OPEN', skills: ['React'], location: 'Pune', type: 'FULL_TIME', salaryMax: 100, title: 'React', companyName: 'A' },
      { id: 'job-python', status: 'OPEN', skills: ['Python'], location: 'Pune', type: 'FULL_TIME', salaryMax: 100, title: 'Python', companyName: 'B' },
    ];
    findUnique.mockResolvedValueOnce({ id: 'candidate-a', role: 'CANDIDATE', skills: ['React'], location: 'Pune', candidateProfile: { preferredLocation: [], jobTypes: [], expectedSalary: null } });
    findMany.mockResolvedValueOnce(jobs).mockResolvedValueOnce([]);
    const first = response();
    await getJobRecommendations({ params: { candidateId: 'candidate-a' }, user: { userId: 'candidate-a', role: 'CANDIDATE' } } as any, first as any);
    expect(first.json.mock.calls[0][0].data[0].jobId).toBe('job-react');
    findUnique.mockResolvedValueOnce({ id: 'candidate-a', role: 'CANDIDATE', skills: ['Python'], location: 'Pune', candidateProfile: { preferredLocation: [], jobTypes: [], expectedSalary: null } });
    findMany.mockResolvedValueOnce(jobs).mockResolvedValueOnce([{ jobId: 'job-react' }]);
    const second = response();
    await getJobRecommendations({ params: { candidateId: 'candidate-a' }, user: { userId: 'candidate-a', role: 'CANDIDATE' } } as any, second as any);
    expect(second.json.mock.calls[0][0].data.map((item: { jobId: string }) => item.jobId)).toEqual(['job-python']);
  });

  it('gives different candidates known best jobs from the same job dataset', async () => {
    const jobs = [
      { id: 'job-react', status: 'OPEN', skills: ['React'], location: 'Pune', type: 'FULL_TIME', salaryMax: 100, title: 'React', companyName: 'A' },
      { id: 'job-python', status: 'OPEN', skills: ['Python'], location: 'Pune', type: 'FULL_TIME', salaryMax: 100, title: 'Python', companyName: 'B' },
    ];
    findUnique.mockResolvedValueOnce({ id: 'candidate-a', role: 'CANDIDATE', skills: ['React'], location: 'Pune', candidateProfile: { preferredLocation: [], jobTypes: [], expectedSalary: null } });
    findMany.mockResolvedValueOnce(jobs).mockResolvedValueOnce([]);
    const first = response();
    await getJobRecommendations({ params: { candidateId: 'candidate-a' }, user: { userId: 'candidate-a', role: 'CANDIDATE' } } as any, first as any);
    findUnique.mockResolvedValueOnce({ id: 'candidate-b', role: 'CANDIDATE', skills: ['Python'], location: 'Pune', candidateProfile: { preferredLocation: [], jobTypes: [], expectedSalary: null } });
    findMany.mockResolvedValueOnce(jobs).mockResolvedValueOnce([]);
    const second = response();
    await getJobRecommendations({ params: { candidateId: 'candidate-b' }, user: { userId: 'candidate-b', role: 'CANDIDATE' } } as any, second as any);
    expect(first.json.mock.calls[0][0].data[0].jobId).toBe('job-react');
    expect(second.json.mock.calls[0][0].data[0].jobId).toBe('job-python');
  });

  it('changes candidate ranking by job and excludes candidates who already applied', async () => {
    const jobReact = { id: 'job-react', postedById: 'recruiter-a', skills: ['React'], experience: null, salaryMax: 100, title: 'React', companyName: 'A', location: 'Pune', type: 'FULL_TIME' };
    const jobPython = { ...jobReact, id: 'job-python', skills: ['Python'] };
    const candidates = [
      { id: 'candidate-react', firstName: 'React', lastName: 'Dev', role: 'CANDIDATE', skills: ['React'], experience: 3, education: null, location: 'Pune', candidateProfile: null },
      { id: 'candidate-python', firstName: 'Python', lastName: 'Dev', role: 'CANDIDATE', skills: ['Python'], experience: 3, education: null, location: 'Pune', candidateProfile: null },
    ];
    findUnique.mockResolvedValueOnce(jobReact).mockResolvedValueOnce(jobReact);
    findMany.mockResolvedValueOnce(candidates).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const first = response();
    await getCandidateRecommendations({ params: { jobId: 'job-react' }, user: { userId: 'recruiter-a', role: 'RECRUITER' } } as any, first as any);
    expect(first.json.mock.calls[0][0].data[0].candidateId).toBe('candidate-react');
    findUnique.mockResolvedValueOnce(jobPython).mockResolvedValueOnce(jobPython);
    findMany.mockResolvedValueOnce(candidates).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const second = response();
    await getCandidateRecommendations({ params: { jobId: 'job-python' }, user: { userId: 'recruiter-a', role: 'RECRUITER' } } as any, second as any);
    expect(second.json.mock.calls[0][0].data[0].candidateId).toBe('candidate-python');
    findUnique.mockResolvedValueOnce(jobReact).mockResolvedValueOnce(jobReact);
    findMany.mockResolvedValueOnce(candidates).mockResolvedValueOnce([{ candidateId: 'candidate-react' }]).mockResolvedValueOnce([]);
    const applied = response();
    await getCandidateRecommendations({ params: { jobId: 'job-react' }, user: { userId: 'recruiter-a', role: 'RECRUITER' } } as any, applied as any);
    expect(applied.json.mock.calls[0][0].data).toEqual([]);
  });

  // R-11 regression: invitation state must survive a page refresh
  describe('R-11 invitation persistence', () => {
    const job = {
      id: 'job-react', postedById: 'recruiter-a',
      skills: ['React'], experience: null, salaryMax: 100,
      title: 'React Dev', companyName: 'Acme', location: 'Pune', type: 'FULL_TIME',
    };
    const candidate = {
      id: 'candidate-react', firstName: 'Alice', lastName: 'Dev',
      role: 'CANDIDATE', skills: ['React'], experience: 3,
      education: null, location: 'Pune', candidateProfile: null,
    };
    const recruiter = { userId: 'recruiter-a', role: 'RECRUITER' };

    it('records the invitation with the correct jobId and recruiterId', async () => {
      findFirst.mockResolvedValueOnce(null); // no existing row
      const savedRow = {
        id: 'generated-uuid', candidateId: 'candidate-react',
        jobId: 'job-react', recruiterId: 'recruiter-a', contactedAt: new Date(),
      };
      create.mockResolvedValueOnce(savedRow);

      const res = response();
      await recordCandidateRecommendationAction(
        { params: { id: 'candidate-react' }, body: { action: 'contact', jobId: 'job-react' }, user: recruiter } as any,
        res as any,
      );

      expect(findFirst).toHaveBeenCalledWith({
        where: { candidateId: 'candidate-react', jobId: 'job-react', recruiterId: 'recruiter-a' },
      });
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            candidateId: 'candidate-react',
            jobId: 'job-react',
            recruiterId: 'recruiter-a',
            contactedAt: expect.any(Date),
          }),
        }),
      );
      // PK must NOT be set to candidateId — it must be auto-generated
      expect(create.mock.calls[0][0].data.id).toBeUndefined();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: expect.objectContaining({ contactedAt: expect.any(Date) }) }),
      );
    });

    it('updates an existing row when the same recruiter re-invites the same candidate for the same job', async () => {
      const existingRow = { id: 'existing-uuid', candidateId: 'candidate-react', jobId: 'job-react', recruiterId: 'recruiter-a' };
      findFirst.mockResolvedValueOnce(existingRow);
      const updatedRow = { ...existingRow, contactedAt: new Date() };
      update.mockResolvedValueOnce(updatedRow);

      const res = response();
      await recordCandidateRecommendationAction(
        { params: { id: 'candidate-react' }, body: { action: 'contact', jobId: 'job-react' }, user: recruiter } as any,
        res as any,
      );

      expect(update).toHaveBeenCalledWith({
        where: { id: 'existing-uuid' },
        data: expect.objectContaining({ contactedAt: expect.any(Date) }),
      });
      expect(create).not.toHaveBeenCalled();
    });

    it('getCandidateRecommendations merges contactedAt so refresh shows "Invited to Apply"', async () => {
      // Phase 1: recruiter loads candidates — no invitations yet
      // findUnique is called twice: once in getCandidateRecommendations for auth, once inside buildCandidateRecommendations
      findUnique.mockResolvedValueOnce(job).mockResolvedValueOnce(job);
      findMany
        .mockResolvedValueOnce([candidate])   // user.findMany inside buildCandidateRecommendations
        .mockResolvedValueOnce([])            // application.findMany inside buildCandidateRecommendations
        .mockResolvedValueOnce([]);           // candidateRecommendation.findMany for the contactedAt merge
      const beforeInvite = response();
      await getCandidateRecommendations(
        { params: { jobId: 'job-react' }, user: recruiter } as any, beforeInvite as any,
      );
      const beforeData = beforeInvite.json.mock.calls[0][0].data;
      expect(beforeData[0].contactedAt).toBeUndefined();

      vi.clearAllMocks();

      // Phase 2: simulate page refresh after invitation was recorded
      const contactedAt = new Date('2026-10-25T12:00:00Z');
      findUnique.mockResolvedValueOnce(job).mockResolvedValueOnce(job);
      findMany
        .mockResolvedValueOnce([candidate])  // user.findMany
        .mockResolvedValueOnce([])           // application.findMany
        .mockResolvedValueOnce([            // candidateRecommendation.findMany — persisted invitation
          { candidateId: 'candidate-react', contactedAt },
        ]);
      const afterRefresh = response();
      await getCandidateRecommendations(
        { params: { jobId: 'job-react' }, user: recruiter } as any, afterRefresh as any,
      );
      const afterData = afterRefresh.json.mock.calls[0][0].data;
      expect(afterData[0].contactedAt).toEqual(contactedAt);
    });

    it('returns 400 when jobId is missing from the request body', async () => {
      const res = response();
      await recordCandidateRecommendationAction(
        { params: { id: 'candidate-react' }, body: { action: 'contact' }, user: recruiter } as any,
        res as any,
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
