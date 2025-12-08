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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Saved Jobs</h1>
          <p className="text-slate-500 mt-2">Keep track of jobs you're interested in</p>
        </div>

        {savedJobs.length > 0 ? (
          <div className="space-y-4">
            {savedJobs.map((savedJob) => (
              <div
                key={savedJob.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group hover:-translate-y-0.5"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {savedJob.job.title}
                        </h2>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${savedJob.job.status === 'OPEN'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : savedJob.job.status === 'CLOSED'
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                        >
                          {savedJob.job.status}
                        </span>
                      </div>

                      <Link
                        to={`/companies/${encodeURIComponent(savedJob.job.companyName)}`}
                        className="text-lg text-slate-600 hover:text-blue-600 font-medium transition-colors"
                      >
                        {savedJob.job.companyName}
                      </Link>

                      <div className="flex flex-wrap gap-4 text-slate-500 mt-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>📍</span> {savedJob.job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>💼</span> {savedJob.job.type.replace('_', ' ')}
                        </div>
                        {savedJob.job.salary && (
                          <div className="flex items-center gap-1.5">
                            <span>💰</span> {savedJob.job.salary}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>🕒</span> Saved {new Date(savedJob.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {savedJob.job._count && (
                        <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          <span>👥</span>
                          <span className="font-medium">{savedJob.job._count.applications} applicants</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                    {savedJob.job.description}
                  </p>

                  {savedJob.job.skills && savedJob.job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {savedJob.job.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {savedJob.job.skills.length > 5 && (
                        <span className="text-slate-400 text-sm py-1 px-2">
                          +{savedJob.job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Link
                      to={`/jobs/${savedJob.job.id}`}
                      className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 text-center"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleUnsave(savedJob.jobId)}
                      className="px-6 py-2.5 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl opacity-50">📌</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Saved Jobs</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              You haven't saved any jobs yet. Browse jobs and save the ones you're interested in!
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              <span>🔍</span> Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
