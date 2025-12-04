import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { savedJobAPI } from '../services/api';
import type { SavedJob } from '../types';

const SavedJobs: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      const data = await savedJobAPI.getAll();
      setSavedJobs(data.savedJobs);
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      await savedJobAPI.unsave(jobId);
      setSavedJobs(savedJobs.filter((sj) => sj.jobId !== jobId));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to unsave job');
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">Loading saved jobs...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Saved Jobs</h1>

      {savedJobs.length > 0 ? (
        <div className="space-y-4">
          {savedJobs.map((savedJob) => (
            <div
              key={savedJob.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {savedJob.job.title}
                    </h2>
                    <Link
                      to={`/companies/${encodeURIComponent(savedJob.job.companyName)}`}
                      className="text-lg text-primary-600 hover:text-primary-800 font-semibold"
                    >
                      {savedJob.job.companyName}
                    </Link>
                    <div className="flex flex-wrap gap-4 text-gray-600 mt-3">
                      <span className="flex items-center">
                        📍 {savedJob.job.location}
                      </span>
                      <span className="flex items-center">
                        💼 {savedJob.job.type.replace('_', ' ')}
                      </span>
                      {savedJob.job.salary && (
                        <span className="flex items-center">
                          💰 {savedJob.job.salary}
                        </span>
                      )}
                      <span className="flex items-center text-sm">
                        Saved {new Date(savedJob.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        savedJob.job.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : savedJob.job.status === 'CLOSED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {savedJob.job.status}
                    </span>
                    {savedJob.job._count && (
                      <span className="text-gray-600 text-sm text-center">
                        {savedJob.job._count.applications} applicants
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {savedJob.job.description}
                </p>

                {savedJob.job.skills && savedJob.job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {savedJob.job.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {savedJob.job.skills.length > 5 && (
                      <span className="text-gray-500 text-sm">
                        +{savedJob.job.skills.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    to={`/jobs/${savedJob.job.id}`}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleUnsave(savedJob.jobId)}
                    className="bg-red-100 text-red-700 px-6 py-2 rounded-lg hover:bg-red-200 border border-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Saved Jobs</h2>
          <p className="text-gray-600 mb-6">
            You haven't saved any jobs yet. Browse jobs and save the ones you're interested in!
          </p>
          <Link
            to="/jobs"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
