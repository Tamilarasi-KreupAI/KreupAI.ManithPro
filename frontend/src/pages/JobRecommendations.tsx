import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, userAPI, savedJobAPI } from '../services/api';
import type { Job, User } from '../types';

const JobRecommendations: React.FC = () => {
  const { user: _authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
    loadSavedJobs();
  }, []);

  const loadRecommendations = async () => {
    try {
      // Load user profile
      const userData = await userAPI.getProfile();
      setUser(userData);

      // Load all jobs
      const jobsData = await jobAPI.getAll();
      const allJobs = jobsData.jobs.filter(j => j.status === 'OPEN');

      // Simple recommendation algorithm based on skills matching
      const scoredJobs = allJobs.map(job => {
        let score = 0;

        // Match skills
        if (userData.skills && job.skills) {
          const userSkills = userData.skills.map(s => s.toLowerCase());
          const jobSkills = job.skills.map(s => s.toLowerCase());

          const matchingSkills = jobSkills.filter(js => userSkills.includes(js));
          score += matchingSkills.length * 10; // 10 points per matching skill
        }

        // Match location
        if (userData.location && job.location) {
          if (job.location.toLowerCase().includes(userData.location.toLowerCase()) ||
            userData.location.toLowerCase().includes(job.location.toLowerCase())) {
            score += 5;
          }
        }

        // Prefer jobs with fewer applicants (better chances)
        if (job._count?.applications !== undefined) {
          const applicants = job._count.applications;
          if (applicants < 5) score += 3;
          else if (applicants < 10) score += 2;
          else if (applicants < 20) score += 1;
        }

        // Prefer recent jobs
        const daysOld = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysOld < 3) score += 3;
        else if (daysOld < 7) score += 2;
        else if (daysOld < 14) score += 1;

        return { job, score };
      });

      // Sort by score and take top 10
      const recommended = scoredJobs
        .filter(sj => sj.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(sj => sj.job);

      setRecommendedJobs(recommended);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const data = await savedJobAPI.getAll();
      const ids = new Set(data.savedJobs.map(sj => sj.jobId));
      setSavedJobIds(ids);
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    }
  };

  const handleToggleSave = async (jobId: string) => {
    try {
      if (savedJobIds.has(jobId)) {
        await savedJobAPI.unsave(jobId);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await savedJobAPI.save(jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
      }
    } catch (error: any) {
      console.error('Failed to toggle save:', error);
    }
  };

  const getMatchPercentage = (job: Job): number => {
    if (!user?.skills || !job.skills) return 0;

    const userSkills = user.skills.map(s => s.toLowerCase());
    const jobSkills = job.skills.map(s => s.toLowerCase());
    const matchingSkills = jobSkills.filter(js => userSkills.includes(js));

    return Math.round((matchingSkills.length / jobSkills.length) * 100);
  };

  const getMatchingSkills = (job: Job): string[] => {
    if (!user?.skills || !job.skills) return [];

    const userSkills = user.skills.map(s => s.toLowerCase());
    const jobSkills = job.skills.map(s => s.toLowerCase());

    return job.skills.filter(js => userSkills.includes(js.toLowerCase()));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.skills || user.skills.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-2xl w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💡</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Complete Your Profile to Get Recommendations
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Add your skills and preferences to your profile so we can recommend the best jobs for you.
          </p>
          <Link
            to="/profile"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Jobs For You</h1>
          <p className="text-slate-500">
            Based on your skills: <span className="font-medium text-slate-700">{user.skills.slice(0, 5).join(', ')}</span>
            {user.skills.length > 5 && <span className="text-slate-400"> +{user.skills.length - 5} more</span>}
          </p>
        </div>

        {/* Profile Completion Prompt */}
        {(!user.experience || !user.location) && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-sm">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">
                Get Better Recommendations
              </h3>
              <p className="text-sm text-blue-700 mb-3 font-medium">
                Complete your profile to get more accurate job matches
              </p>
              <Link
                to="/profile"
                className="inline-block text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold transition-colors"
              >
                Update Profile
              </Link>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendedJobs.length > 0 ? (
          <div className="grid gap-6">
            {recommendedJobs.map((job) => {
              const matchPercentage = getMatchPercentage(job);
              const matchingSkills = getMatchingSkills(job);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all hover:border-blue-200 group relative overflow-hidden"
                >
                  {/* Match Indicator Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${matchPercentage >= 70 ? 'bg-green-500' : matchPercentage >= 50 ? 'bg-blue-500' : 'bg-slate-300'
                    }`} />

                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 pl-2">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h2>
                          {matchPercentage > 0 && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${matchPercentage >= 70
                              ? 'bg-green-100 text-green-700'
                              : matchPercentage >= 50
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                              }`}>
                              {matchPercentage}% Match
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleSave(job.id)}
                          className={`text-2xl transition-colors ${savedJobIds.has(job.id) ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}
                          title={savedJobIds.has(job.id) ? 'Unsave job' : 'Save job'}
                        >
                          {savedJobIds.has(job.id) ? '★' : '☆'}
                        </button>
                      </div>

                      <Link
                        to={`/companies/${encodeURIComponent(job.companyName)}`}
                        className="text-lg text-slate-600 font-medium hover:text-blue-600 transition-colors mb-3 block"
                      >
                        {job.companyName}
                      </Link>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mb-4">
                        <span className="flex items-center gap-1"><span>📍</span> {job.location}</span>
                        <span className="flex items-center gap-1"><span>💼</span> {job.type.replace('_', ' ')}</span>
                        {job.salary && (
                          <span className="flex items-center gap-1 text-green-600 font-bold"><span>💰</span> {job.salary}</span>
                        )}
                        {job._count && (
                          <span className="flex items-center gap-1 text-blue-600"><span>👥</span> {job._count.applications} applicants</span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <span>📅</span> {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {matchingSkills.length > 0 && (
                        <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 mb-4">
                          <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                            <span>✨</span> You have {matchingSkills.length} matching skill{matchingSkills.length > 1 ? 's' : ''}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {matchingSkills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-white text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-100 shadow-sm"
                              >
                                ✓ {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-slate-600 mb-4 line-clamp-2">{job.description}</p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => {
                            const isMatch = matchingSkills.some(ms => ms.toLowerCase() === skill.toLowerCase());
                            if (isMatch) return null; // Already shown in matching skills
                            return (
                              <span
                                key={index}
                                className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200"
                              >
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch min-w-[160px] gap-4">
                      <div className="text-sm text-right">
                        {matchPercentage >= 70 ? (
                          <span className="text-green-600 font-bold flex items-center gap-1 justify-end">
                            <span>🎯</span> Great match!
                          </span>
                        ) : matchPercentage >= 50 ? (
                          <span className="text-blue-600 font-bold flex items-center gap-1 justify-end">
                            <span>👍</span> Good match
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Recommended</span>
                        )}
                      </div>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="w-full text-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5"
                      >
                        View & Apply
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              No Matching Jobs Right Now
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              We couldn't find jobs matching your skills at the moment.
              Try updating your profile or check back later!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/profile"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5"
              >
                Update Profile
              </Link>
              <Link
                to="/jobs"
                className="bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {recommendedJobs.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span>💡</span> Tips to Improve Your Matches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-blue-100/50">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-slate-700 font-medium">Keep your skills up to date in your profile</span>
              </div>
              <div className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-blue-100/50">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-slate-700 font-medium">Add more relevant skills to see more opportunities</span>
              </div>
              <div className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-blue-100/50">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-slate-700 font-medium">Update your location preferences for local opportunities</span>
              </div>
              <div className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-blue-100/50">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-slate-700 font-medium">Check back regularly - new jobs are posted daily!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
