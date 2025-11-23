import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';
import type { Job } from '../types';
import { JobCardSkeleton } from '../components/SkeletonLoader';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
  });

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    try {
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;

      const data = await jobAPI.getAll(params);
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden py-8">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Job Openings</h1>
          {user?.role !== 'CANDIDATE' && (
            <Link
              to="/jobs/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              Post New Job
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="rounded-lg border border-slate-200 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="rounded-lg border border-slate-200 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="REMOTE">Remote</option>
            </select>
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="rounded-lg border border-slate-200 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h2>
                        <div className="flex flex-wrap gap-4 text-slate-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {job.type.replace('_', ' ')}
                          </span>
                          {job.salary && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {job.salary}
                            </span>
                          )}
                          {job._count && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                              {job._count.applications} applicants
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${job.status === 'OPEN'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : job.status === 'CLOSED'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">{job.description}</p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {job.skills.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium border border-blue-100"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-slate-400 text-sm flex items-center">+{job.skills.length - 5} more</span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-sm text-slate-400">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        View Details <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No jobs found</h3>
                <p className="text-slate-500">Try adjusting your search criteria to find what you're looking for.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

};

export default Jobs;
