import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, userAPI, savedJobAPI } from '../services/api';
import type { Job, User } from '../types';

const JobRecommendations: React.FC = () => {
  const { user: authUser } = useAuth();
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
      const scored Jobs = allJobs.map(job => {
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Finding jobs for you...</p>
        </div>
      </div>
    );
  }

  if (!user?.skills || user.skills.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Complete Your Profile to Get Recommendations
            </h2>
            <p className="text-gray-600 mb-8">
              Add your skills and preferences to your profile so we can recommend the best jobs for you.
            </p>
            <Link
              to="/profile"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Jobs For You</h1>
        <p className="text-gray-600">
          Based on your skills: {user.skills.slice(0, 5).join(', ')}
          {user.skills.length > 5 && ` +${user.skills.length - 5} more`}
        </p>
      </div>

      {/* Profile Completion Prompt */}
      {(!user.experience || !user.location) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                Get Better Recommendations
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Complete your profile to get more accurate job matches
              </p>
              <Link
                to="/profile"
                className="inline-block text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendedJobs.length > 0 ? (
        <div className="space-y-4">
          {recommendedJobs.map((job) => {
            const matchPercentage = getMatchPercentage(job);
            const matchingSkills = getMatchingSkills(job);

            return (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
                            {matchPercentage > 0 && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                {matchPercentage}% Match
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/companies/${encodeURIComponent(job.companyName)}`}
                            className="text-lg text-primary-600 hover:text-primary-800 font-semibold"
                          >
                            {job.companyName}
                          </Link>
                        </div>
                        <button
                          onClick={() => handleToggleSave(job.id)}
                          className={`text-2xl ${
                            savedJobIds.has(job.id) ? 'text-yellow-500' : 'text-gray-300'
                          } hover:text-yellow-500`}
                          title={savedJobIds.has(job.id) ? 'Unsave job' : 'Save job'}
                        >
                          {savedJobIds.has(job.id) ? '★' : '☆'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-4 text-gray-600 mb-3">
                        <span className="flex items-center">📍 {job.location}</span>
                        <span className="flex items-center">💼 {job.type.replace('_', ' ')}</span>
                        {job.salary && (
                          <span className="flex items-center">💰 {job.salary}</span>
                        )}
                        {job._count && (
                          <span className="flex items-center">👥 {job._count.applications} applicants</span>
                        )}
                        <span className="flex items-center text-sm">
                          📅 {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {matchingSkills.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-green-900 mb-2">
                            ✨ You have {matchingSkills.length} matching skill{matchingSkills.length > 1 ? 's' : ''}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {matchingSkills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                ✓ {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, index) => {
                        const isMatch = matchingSkills.some(ms => ms.toLowerCase() === skill.toLowerCase());
                        return (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm ${
                              isMatch
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isMatch && '✓ '}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {matchPercentage >= 70 ? (
                        <span className="text-green-600 font-medium">🎯 Great match!</span>
                      ) : matchPercentage >= 50 ? (
                        <span className="text-blue-600 font-medium">👍 Good match</span>
                      ) : (
                        <span className="text-gray-600">Recommended for you</span>
                      )}
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
                    >
                      View Details & Apply
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Matching Jobs Right Now
          </h2>
          <p className="text-gray-600 mb-8">
            We couldn't find jobs matching your skills at the moment.
            Try updating your profile or check back later!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/profile"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Update Profile
            </Link>
            <Link
              to="/jobs"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {recommendedJobs.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips to Improve Your Matches</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Keep your skills up to date in your profile</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Add more relevant skills to see more opportunities</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Update your location preferences for local opportunities</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Check back regularly - new jobs are posted daily!</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;
