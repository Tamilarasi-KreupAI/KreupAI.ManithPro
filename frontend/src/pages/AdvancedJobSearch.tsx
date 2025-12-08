import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, savedJobAPI } from '../services/api';
import type { Job } from '../types';

const AdvancedJobSearch: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    postedWithin: '',
    companyName: '',
    skills: '',
    experienceLevel: '',
  });

  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadJobs();
    if (user?.role === 'CANDIDATE') {
      loadSavedJobs();
    }
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.skills) params.skills = filters.skills;

      const data = await jobAPI.getAll(params);
      let filteredJobs = data.jobs;

      // Client-side filtering for advanced filters
      if (filters.salaryMin) {
        const minSalary = parseInt(filters.salaryMin);
        filteredJobs = filteredJobs.filter(job =>
          job.salaryMin && job.salaryMin >= minSalary
        );
      }

      if (filters.salaryMax) {
        const maxSalary = parseInt(filters.salaryMax);
        filteredJobs = filteredJobs.filter(job =>
          job.salaryMax && job.salaryMax <= maxSalary
        );
      }

      if (filters.companyName) {
        filteredJobs = filteredJobs.filter(job =>
          job.companyName.toLowerCase().includes(filters.companyName.toLowerCase())
        );
      }

      if (filters.postedWithin) {
        const daysAgo = parseInt(filters.postedWithin);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

        filteredJobs = filteredJobs.filter(job =>
          new Date(job.createdAt) >= cutoffDate
        );
      }

      // Sort jobs
      if (sortBy === 'recent') {
        filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'salary-high') {
        filteredJobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
      } else if (sortBy === 'salary-low') {
        filteredJobs.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
      } else if (sortBy === 'applicants') {
        filteredJobs.sort((a, b) => (a._count?.applications || 0) - (b._count?.applications || 0));
      }

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      postedWithin: '',
      companyName: '',
      skills: '',
      experienceLevel: '',
    });
    setTimeout(() => loadJobs(), 100);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Job Search</h1>
            <p className="text-slate-500 mt-1 font-medium">
              <span className="text-blue-600 font-bold">{jobs.length}</span> {jobs.length === 1 ? 'job' : 'jobs'} found
            </p>
          </div>
          {user?.role !== 'CANDIDATE' && (
            <Link
              to="/jobs/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              + Post New Job
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Basic Search */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Job title, keywords..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
                  <input
                    type="text"
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                >
                  Search Jobs
                </button>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center gap-2 transition-colors"
              >
                {showAdvanced ? '▼' : '▶'} Advanced Filters
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors"
                >
                  Clear all filters ×
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 animate-fadeIn">
                <div className="relative">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  >
                    <option value="">All Job Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>

                <div className="relative">
                  <select
                    value={filters.postedWithin}
                    onChange={(e) => setFilters({ ...filters, postedWithin: e.target.value })}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  >
                    <option value="">Any time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="3">Last 3 days</option>
                    <option value="7">Last week</option>
                    <option value="14">Last 2 weeks</option>
                    <option value="30">Last month</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>

                <input
                  type="text"
                  placeholder="Company name"
                  value={filters.companyName}
                  onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                />

                <input
                  type="number"
                  placeholder="Min Salary ($)"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                />

                <input
                  type="number"
                  placeholder="Max Salary ($)"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                />

                <input
                  type="text"
                  placeholder="Skills (comma separated)"
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                />
              </div>
            )}

            {/* Sort Options */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 mt-4">
              <label className="text-sm font-bold text-slate-700">Sort by:</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary-high">Highest Salary</option>
                  <option value="salary-low">Lowest Salary</option>
                  <option value="applicants">Fewest Applicants</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
              <button
                type="submit"
                className="ml-auto text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 font-bold transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all hover:border-blue-200 group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between md:justify-start gap-3 mb-2">
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h2>
                        {user?.role === 'CANDIDATE' && (
                          <button
                            onClick={() => handleToggleSave(job.id)}
                            className={`text-2xl transition-colors ${savedJobIds.has(job.id) ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'
                              }`}
                            title={savedJobIds.has(job.id) ? 'Unsave job' : 'Save job'}
                          >
                            {savedJobIds.has(job.id) ? '★' : '☆'}
                          </button>
                        )}
                      </div>
                      <Link
                        to={`/companies/${encodeURIComponent(job.companyName)}`}
                        className="text-lg text-slate-600 font-medium hover:text-blue-600 transition-colors mb-2 block"
                      >
                        {job.companyName}
                      </Link>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mt-3">
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
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${job.status === 'OPEN'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : job.status === 'CLOSED'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-2">{job.description}</p>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 6 && (
                        <span className="text-slate-400 text-xs font-medium py-1 px-2">+{job.skills.length - 6} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="flex gap-2">
                      {job.experience && (
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                          {job.experience} exp
                        </span>
                      )}
                      {job.positions > 1 && (
                        <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                          {job.positions} positions
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔍</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No jobs found</h2>
                <p className="text-slate-500 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedJobSearch;
