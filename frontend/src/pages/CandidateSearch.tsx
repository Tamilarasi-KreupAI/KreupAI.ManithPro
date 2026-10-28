import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationAPI, jobAPI } from '../services/api';
import { candidateRecommendationsAPI } from '../services/batch23SmartRecommendationsAPI';
import type { Application, Job, User } from '../types';
import type { RecommendationReason } from '../types/batch23SmartRecommendations.types';

interface CandidateProfile {
  user: User;
  applications: Application[];
  totalApplications: number;
  skills: string[];
  recommendationScore?: number;
  matchReasons?: RecommendationReason[];
  hasAppliedToCurrentJob?: boolean;
  jobId?: string;
}

const CandidateSearch: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [invitedCandidates, setInvitedCandidates] = useState<Set<string>>(new Set());
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    experience: '',
    location: '',
    education: '',
  });
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    loadJobsAndCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, candidates, sortBy]);

  const loadJobsAndCandidates = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let myJobs: Job[] = [];
      try {
        const jobsData = await jobAPI.getAll({ postedBy: 'me' });
        myJobs = jobsData?.jobs || [];
      } catch {
        const jobsData = await jobAPI.getAll();
        myJobs = jobsData?.jobs || [];
      }
      setJobs(myJobs);

      const initialJobId = myJobs.length > 0 ? myJobs[0].id : '';
      setSelectedJobId(initialJobId);

      await fetchCandidatesForJob(initialJobId);
    } catch (error: any) {
      console.error('Failed to load candidate search data:', error);
      setLoadError(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidatesForJob = async (jobId: string) => {
    try {
      setSearching(true);
      setLoadError(null);

      // Fetch existing applications to map history and detect candidates who applied to this job
      const appsData = await applicationAPI.getAll({ limit: 100 });
      const allApplications: Application[] = appsData?.applications || [];

      const appsByCandidate = new Map<string, Application[]>();
      const appliedToJobCandidateIds = new Set<string>();

      allApplications.forEach((app) => {
        if (app.candidate?.id) {
          const list = appsByCandidate.get(app.candidate.id) || [];
          list.push(app);
          appsByCandidate.set(app.candidate.id, list);

          if (jobId && app.jobId === jobId) {
            appliedToJobCandidateIds.add(app.candidate.id);
          }
        }
      });

      const candidateProfiles: CandidateProfile[] = [];

      // Sourcing candidate matching pool from the recommendation endpoint
      if (jobId) {
        try {
          const recs = await candidateRecommendationsAPI.getForJob(jobId);
          if (Array.isArray(recs)) {
            // Restore invitation state from persisted contactedAt returned by the backend
            const persistedInvited = new Set<string>();
            recs.forEach((rec) => {
              const candUser: User = (rec.candidate as User) || ({
                id: rec.candidateId || rec.id,
                firstName: rec.candidateName?.split(' ')[0] || 'Candidate',
                lastName: rec.candidateName?.split(' ').slice(1).join(' ') || '',
                email: (rec.candidate as any)?.email || '',
                role: 'CANDIDATE',
                skills: rec.candidateSkills || [],
                experience: rec.candidateExperience,
                location: rec.candidateLocation,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as User);

              // Mark as invited if the backend persisted a contactedAt timestamp
              if (rec.contactedAt) {
                persistedInvited.add(candUser.id);
              }

              const userApps = appsByCandidate.get(candUser.id) || [];
              const hasApplied = appliedToJobCandidateIds.has(candUser.id);

              candidateProfiles.push({
                user: candUser,
                applications: userApps,
                totalApplications: userApps.length,
                skills: candUser.skills || rec.candidateSkills || [],
                recommendationScore: rec.recommendationScore,
                matchReasons: rec.matchReasons,
                hasAppliedToCurrentJob: hasApplied,
                jobId,
              });
            });
            // Seed invitedCandidates from persisted DB state (job-scoped, per-recruiter)
            setInvitedCandidates(persistedInvited);
          }
        } catch (recError) {
          console.warn('Candidate recommendation API request failed, falling back:', recError);
        }
      }

      // Merge candidates who have applied to jobs so the recruiter can search the entire candidate universe
      const existingCandidateIds = new Set(candidateProfiles.map((c) => c.user.id));

      appsByCandidate.forEach((apps, candId) => {
        if (!existingCandidateIds.has(candId)) {
          const firstApp = apps[0];
          if (firstApp.candidate) {
            candidateProfiles.push({
              user: firstApp.candidate,
              applications: apps,
              totalApplications: apps.length,
              skills: firstApp.candidate.skills || [],
              hasAppliedToCurrentJob: appliedToJobCandidateIds.has(candId),
              jobId,
            });
            existingCandidateIds.add(candId);
          }
        }
      });

      setCandidates(candidateProfiles);
      setFilteredCandidates(candidateProfiles);
    } catch (error: any) {
      console.error('Failed to search candidates:', error);
      setLoadError(error?.response?.data?.error || error?.response?.data?.message || 'Failed to search candidates');
    } finally {
      setSearching(false);
    }
  };

  const handleJobChange = async (newJobId: string) => {
    setSelectedJobId(newJobId);
    await fetchCandidatesForJob(newJobId);
  };

  const handleInviteToApply = async (candidateId: string, candidateName: string) => {
    if (!selectedJobId) {
      alert('Please select a target job before sending invitations.');
      return;
    }

    if (invitedCandidates.has(candidateId)) {
      return;
    }

    setInvitingId(candidateId);
    try {
      await candidateRecommendationsAPI.recordAction(candidateId, {
        action: 'contact',
        jobId: selectedJobId,
      } as any);

      setInvitedCandidates((prev) => new Set(prev).add(candidateId));
      const targetJob = jobs.find((j) => j.id === selectedJobId);
      const jobTitle = targetJob?.title || 'the selected job';
      setInviteSuccessMessage(`Invitation to apply for "${jobTitle}" was successfully sent to ${candidateName}!`);
      setTimeout(() => setInviteSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Failed to invite candidate:', error);
      alert(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to send invitation. Please try again.'
      );
    } finally {
      setInvitingId(null);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((candidate) => {
        const name = `${candidate.user.firstName} ${candidate.user.lastName}`.toLowerCase();
        const email = (candidate.user.email || '').toLowerCase();
        const bio = (candidate.user.bio || '').toLowerCase();
        return name.includes(searchLower) || email.includes(searchLower) || bio.includes(searchLower);
      });
    }

    // Skills filter
    if (filters.skills) {
      const requiredSkills = filters.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (requiredSkills.length > 0) {
        filtered = filtered.filter((candidate) =>
          requiredSkills.some((rs) =>
            candidate.skills.some((cs) => cs.toLowerCase().includes(rs))
          )
        );
      }
    }

    // Experience filter
    if (filters.experience) {
      const minExp = parseInt(filters.experience);
      if (!isNaN(minExp)) {
        filtered = filtered.filter(
          (candidate) => candidate.user.experience !== undefined && candidate.user.experience >= minExp
        );
      }
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter((candidate) =>
        (candidate.user.location || '').toLowerCase().includes(locationLower)
      );
    }

    // Education filter
    if (filters.education) {
      const educationLower = filters.education.toLowerCase();
      filtered = filtered.filter((candidate) =>
        (candidate.user.education || '').toLowerCase().includes(educationLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'match') {
        return (b.recommendationScore || 0) - (a.recommendationScore || 0);
      } else if (sortBy === 'recent') {
        const latestA = a.applications.length > 0
          ? Math.max(...a.applications.map((app) => new Date(app.appliedAt).getTime()))
          : 0;
        const latestB = b.applications.length > 0
          ? Math.max(...b.applications.map((app) => new Date(app.appliedAt).getTime()))
          : 0;
        return latestB - latestA;
      } else if (sortBy === 'experience') {
        return (b.user.experience || 0) - (a.user.experience || 0);
      } else if (sortBy === 'name') {
        const nameA = `${a.user.firstName} ${a.user.lastName}`;
        const nameB = `${b.user.firstName} ${b.user.lastName}`;
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'applications') {
        return b.totalApplications - a.totalApplications;
      }
      return 0;
    });

    setFilteredCandidates(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      skills: '',
      experience: '',
      location: '',
      education: '',
    });
    setSortBy('match');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden pt-20">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-primary-900/20 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Candidate Search</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found in talent pool
          </p>
        </div>

        {/* Success Feedback Banner */}
        {inviteSuccessMessage && (
          <div
            role="status"
            className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm animate-fadeIn"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎉</span>
              <span className="text-sm font-medium">{inviteSuccessMessage}</span>
            </div>
            <button
              onClick={() => setInviteSuccessMessage(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-sm font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Banner */}
        {loadError && (
          <div
            role="alert"
            className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold">Failed to load candidate results</p>
                <p className="text-xs text-red-600 dark:text-red-400">{loadError}</p>
              </div>
            </div>
            <button
              onClick={() => fetchCandidatesForJob(selectedJobId)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 mb-8">
          {/* Target Job Selection */}
          {jobs.length > 0 && (
            <div className="mb-5 pb-5 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label htmlFor="target-job-select" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Target Job for Matching & Invitations
                </label>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Select a job to match candidate skills and invite sourced candidates to apply
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  id="target-job-select"
                  value={selectedJobId}
                  onChange={(e) => handleJobChange(e.target.value)}
                  className="border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} {job.companyName ? `(${job.companyName})` : ''}
                    </option>
                  ))}
                </select>
                {searching && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-primary-400" />
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-full md:col-span-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, or bio..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            >
              <option value="match">Highest Match Score</option>
              <option value="recent">Most Recent Activity</option>
              <option value="experience">Most Experience</option>
              <option value="name">Name (A-Z)</option>
              <option value="applications">Most Applications</option>
            </select>

            <input
              type="text"
              placeholder="Skills (comma separated)..."
              value={filters.skills}
              onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
              className="border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />

            <input
              type="number"
              placeholder="Min. years of experience..."
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />

            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />

            <input
              type="text"
              placeholder="Education..."
              value={filters.education}
              onChange={(e) => setFilters({ ...filters, education: e.target.value })}
              className="col-span-full md:col-span-2 border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-primary-400 underline transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.user.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col justify-between">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                        <span className="text-2xl font-bold text-blue-600 dark:text-primary-400">
                          {candidate.user.firstName ? candidate.user.firstName.charAt(0) : 'C'}
                          {candidate.user.lastName ? candidate.user.lastName.charAt(0) : ''}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-primary-400 transition-colors">
                          {candidate.user.firstName} {candidate.user.lastName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{candidate.user.email || 'Email hidden'}</p>
                      </div>
                    </div>
                    {candidate.recommendationScore !== undefined && (
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                        {candidate.recommendationScore}% match
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {candidate.user.bio && (
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 line-clamp-2">{candidate.user.bio}</p>
                  )}

                  {/* Match Insights */}
                  {candidate.matchReasons && candidate.matchReasons.length > 0 && (
                    <div className="mb-4 bg-slate-50 dark:bg-gray-700/40 rounded-xl p-3">
                      <p className="text-xs font-bold text-slate-400 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Match Insights</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.matchReasons.map((reasonObj, idx) => (
                          <span key={idx} className="text-xs bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-600 flex items-center gap-1">
                            <span className="text-emerald-500">✓</span> {typeof reasonObj === 'string' ? reasonObj : reasonObj.reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    {candidate.user.location && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                        <span>📍</span>
                        <span>{candidate.user.location}</span>
                      </div>
                    )}
                    {candidate.user.experience !== undefined && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                        <span>💼</span>
                        <span>{candidate.user.experience} years experience</span>
                      </div>
                    )}
                    {candidate.user.education && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                        <span>🎓</span>
                        <span>{candidate.user.education}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                      <span>📄</span>
                      <span>{candidate.totalApplications} application{candidate.totalApplications !== 1 ? 's' : ''} on record</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-slate-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-50 dark:bg-primary-900/30 text-blue-700 dark:text-primary-300 px-2 py-1 rounded-lg border border-blue-100 dark:border-primary-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 4 && (
                          <span className="text-xs text-slate-400 dark:text-gray-500 px-1">+{candidate.skills.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex gap-3 mb-6 text-sm">
                    {candidate.user.linkedIn && (
                      <a
                        href={candidate.user.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-primary-400 hover:text-blue-800 dark:hover:text-primary-300 font-medium hover:underline"
                      >
                        LinkedIn →
                      </a>
                    )}
                    {candidate.user.portfolio && (
                      <a
                        href={candidate.user.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium hover:underline"
                      >
                        Portfolio →
                      </a>
                    )}
                  </div>

                  {/* Applications History (if any) */}
                  {candidate.applications.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-gray-700 pt-4 mb-4">
                      <p className="text-xs font-bold text-slate-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Application History</p>
                      <div className="space-y-2">
                        {candidate.applications.slice(0, 2).map((app) => (
                          <Link
                            key={app.id}
                            to={`/applications/${app.id}`}
                            className="block text-sm hover:bg-slate-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors -mx-2"
                          >
                            <p className="font-medium text-slate-900 dark:text-white">{app.job?.title || 'Applied Position'}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-slate-500 dark:text-gray-400">
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-600">
                                {app.status.replace('_', ' ')}
                              </span>
                            </div>
                          </Link>
                        ))}
                        {candidate.applications.length > 2 && (
                          <p className="text-xs text-slate-400 dark:text-gray-500 text-center">
                            +{candidate.applications.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions & Sourcing Section */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 rounded-b-2xl">
                  {/* Invite to Apply */}
                  <div className="mb-3">
                    {candidate.hasAppliedToCurrentJob ? (
                      <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-gray-700/60 text-slate-600 dark:text-gray-300 text-xs font-semibold">
                        <span>✓</span> Already Applied to Target Job
                      </div>
                    ) : invitedCandidates.has(candidate.user.id) ? (
                      <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold cursor-not-allowed"
                      >
                        <span>✓</span> Invited to Apply
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleInviteToApply(candidate.user.id, `${candidate.user.firstName} ${candidate.user.lastName}`)}
                        disabled={invitingId === candidate.user.id}
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {invitingId === candidate.user.id ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Inviting...</span>
                          </>
                        ) : (
                          <>
                            <span>✉️</span>
                            <span>Invite to Apply</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/messages', { state: { startConversation: candidate.user } })}
                      className="flex items-center justify-center gap-1.5 bg-blue-600 dark:bg-primary-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 dark:hover:bg-primary-700 font-medium text-xs shadow-md shadow-blue-500/20 dark:shadow-primary-500/20 transition-all hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </button>
                    <a
                      href={candidate.user.email ? `mailto:${candidate.user.email}` : '#'}
                      onClick={(e) => {
                        if (!candidate.user.email) {
                          e.preventDefault();
                          alert('Email address not available for this candidate.');
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 bg-gray-600 dark:bg-gray-700 text-white px-3 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 font-medium text-xs transition-all hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Candidates Found</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search filters'
                : 'No matching candidates found for this target job. Post new jobs or adjust requirements to source candidates.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="bg-blue-600 dark:bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-primary-700 shadow-lg shadow-blue-500/30 dark:shadow-primary-500/30 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Tips */}
        {filteredCandidates.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-primary-900/20 dark:to-primary-800/20 border border-blue-100 dark:border-primary-800 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 dark:text-primary-300 mb-3 flex items-center gap-2">
              <span>💡</span> Search & Sourcing Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-primary-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-primary-400">•</span>
                <span>Select a Target Job above to see AI-powered candidate match scores and relevant candidates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-primary-400">•</span>
                <span>Click &quot;Invite to Apply&quot; to send an invitation to qualified candidates who haven&apos;t applied yet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-primary-400">•</span>
                <span>Use comma-separated skills to narrow down candidates with specific technical abilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-primary-400">•</span>
                <span>Click &quot;Message&quot; to initiate a direct conversation with any candidate on ManithPro</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSearch;
