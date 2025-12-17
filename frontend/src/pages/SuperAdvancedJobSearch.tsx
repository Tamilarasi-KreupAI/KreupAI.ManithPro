import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../services/api';

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  experience?: string;
  status: string;
  createdAt: string;
}

const SuperAdvancedJobSearch: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 200000]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Available filter options
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchTerm, selectedLocations, selectedTypes, selectedSkills, salaryRange, remoteOnly, experienceLevel, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { jobs: data } = await jobAPI.getAll();
      const openJobs = data.filter((job: any) => job.status === 'OPEN');
      setJobs(openJobs);

      // Extract unique locations and skills
      const locations = [...new Set(openJobs.map((job: any) => job.location))];
      const skills = [...new Set(openJobs.flatMap((job: any) => job.skills || []))];
      setAvailableLocations(locations);
      setAvailableSkills(skills);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.companyName.toLowerCase().includes(term) ||
        job.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Locations
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(job => selectedLocations.includes(job.location));
    }

    // Job types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(job => selectedTypes.includes(job.type));
    }

    // Skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(job =>
        selectedSkills.some(skill => job.skills.includes(skill))
      );
    }

    // Salary range
    filtered = filtered.filter(job => {
      if (!job.salaryMin || !job.salaryMax) return true;
      return job.salaryMax >= salaryRange[0] && job.salaryMin <= salaryRange[1];
    });

    // Remote only
    if (remoteOnly) {
      filtered = filtered.filter(job => job.type === 'REMOTE' || job.location.toLowerCase().includes('remote'));
    }

    // Experience level
    if (experienceLevel) {
      filtered = filtered.filter(job =>
        job.experience?.toLowerCase().includes(experienceLevel.toLowerCase())
      );
    }

    // Sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'salary-high':
        filtered.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
        break;
      case 'salary-low':
        filtered.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredJobs(filtered);
  };

  const toggleFilter = (value: string, filterArray: string[], setFilter: Function) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedLocations([]);
    setSelectedTypes([]);
    setSelectedSkills([]);
    setSalaryRange([0, 200000]);
    setRemoteOnly(false);
    setExperienceLevel('');
  };

  const activeFiltersCount = selectedLocations.length + selectedTypes.length + selectedSkills.length +
    (remoteOnly ? 1 : 0) + (experienceLevel ? 1 : 0) +
    (salaryRange[0] > 0 || salaryRange[1] < 200000 ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 overflow-hidden relative pt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Advanced Job Search</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Find your perfect opportunity with powerful filters</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, company, or skills..."
              className="w-full px-6 py-4 pl-12 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
            <svg className="absolute left-4 top-5 h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Clear All ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Remote Only Toggle */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-3 font-semibold text-gray-900 dark:text-white">Remote Jobs Only</span>
                </label>
              </div>

              {/* Salary Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Salary Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={salaryRange[0]}
                    onChange={(e) => setSalaryRange([parseInt(e.target.value), salaryRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={salaryRange[1]}
                    onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>${salaryRange[0].toLocaleString()}</span>
                    <span>${salaryRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Job Type</h3>
                <div className="space-y-2">
                  {jobTypes.map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                        className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Experience Level</h3>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Location</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableLocations.slice(0, 10).map(location => (
                    <label key={location} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location)}
                        onChange={() => toggleFilter(location, selectedLocations, setSelectedLocations)}
                        className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableSkills.slice(0, 15).map(skill => (
                    <label key={skill} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleFilter(skill, selectedSkills, setSelectedSkills)}
                        className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Job Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {filteredJobs.length} Jobs Found
                  </p>
                  {activeFiltersCount > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Filtered from {jobs.length} total jobs
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="salary-high">Highest Salary</option>
                    <option value="salary-low">Lowest Salary</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Cards */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg text-gray-600 dark:text-gray-400">No jobs match your criteria</p>
                <button onClick={clearAllFilters} className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  Clear filters and try again
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredJobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary-500 dark:hover:border-primary-400"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{job.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{job.companyName}</p>
                      </div>
                      <span className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                        {job.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </div>
                      {job.salaryMin && job.salaryMax && (
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdvancedJobSearch;
