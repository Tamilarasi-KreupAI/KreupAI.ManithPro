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
    <div className="w-full px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Search</h1>
          <p className="text-gray-600 mt-1">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          </p>
        </div>
        {user?.role !== 'CANDIDATE' && (
          <Link
            to="/jobs/new"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Post New Job
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Job title, keywords..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="col-span-2 rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
            >
              🔍 Search
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center gap-2"
            >
              {showAdvanced ? '▼' : '▶'} Advanced Filters
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all filters ×
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
              >
                <option value="">All Job Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>

              <select
                value={filters.postedWithin}
                onChange={(e) => setFilters({ ...filters, postedWithin: e.target.value })}
                className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
              >
                <option value="">Any time</option>
                <option value="1">Last 24 hours</option>
                <option value="3">Last 3 days</option>
                <option value="7">Last week</option>
                <option value="14">Last 2 weeks</option>
                <option value="30">Last month</option>
              </select>

              <input
                type="text"
                placeholder="Company name"
                value={filters.companyName}
                onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
                className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
              />

              <input
                type="number"
                placeholder="Min Salary ($)"
                value={filters.salaryMin}
                onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
              />

              <input
                type="number"
                placeholder="Max Salary ($)"
                value={filters.salaryMax}
                onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
              />

              <input
                type="text"
                placeholder="Skills (comma separated)"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
              />
            </div>
          )}

          {/* Sort Options */}
          <div className="flex items-center gap-4 pt-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:border-primary-500 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="salary-high">Highest Salary</option>
              <option value="salary-low">Lowest Salary</option>
              <option value="applicants">Fewest Applicants</option>
            </select>
            <button
              type="submit"
              className="ml-auto text-sm bg-primary-100 text-primary-700 px-4 py-1 rounded-md hover:bg-primary-200"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
                        {user?.role === 'CANDIDATE' && (
                          <button
                            onClick={() => handleToggleSave(job.id)}
                            className={`text-2xl ${
                              savedJobIds.has(job.id) ? 'text-yellow-500' : 'text-gray-300'
                            } hover:text-yellow-500`}
                            title={savedJobIds.has(job.id) ? 'Unsave job' : 'Save job'}
                          >
                            {savedJobIds.has(job.id) ? '★' : '☆'}
                          </button>
                        )}
                      </div>
                      <Link
                        to={`/companies/${encodeURIComponent(job.companyName)}`}
                        className="text-lg text-primary-600 hover:text-primary-800 font-semibold"
                      >
                        {job.companyName}
                      </Link>
                      <div className="flex flex-wrap gap-4 text-gray-600 mt-3">
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
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'CLOSED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 6 && (
                        <span className="text-gray-500 text-sm">+{job.skills.length - 6} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex gap-2">
                      {job.experience && (
                        <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                          {job.experience} exp
                        </span>
                      )}
                      {job.positions > 1 && (
                        <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                          {job.positions} positions
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No jobs found</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search criteria
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedJobSearch;
