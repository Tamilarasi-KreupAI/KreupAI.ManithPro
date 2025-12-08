import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import type { Application, User } from '../types';

interface CandidateProfile {
  user: User;
  applications: Application[];
  totalApplications: number;
  skills: string[];
}

const CandidateSearch: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    experience: '',
    location: '',
    education: '',
  });
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, candidates, sortBy]);

  const loadCandidates = async () => {
    try {
      const { applications } = await applicationAPI.getAll();

      // Group applications by candidate
      const candidateMap = new Map<string, CandidateProfile>();

      applications.forEach((app) => {
        if (app.candidate) {
          const userId = app.candidate.id;
          if (!candidateMap.has(userId)) {
            candidateMap.set(userId, {
              user: app.candidate,
              applications: [],
              totalApplications: 0,
              skills: app.candidate.skills || [],
            });
          }
          const profile = candidateMap.get(userId)!;
          profile.applications.push(app);
          profile.totalApplications++;
        }
      });

      const candidateList = Array.from(candidateMap.values());
      setCandidates(candidateList);
      setFilteredCandidates(candidateList);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((candidate) => {
        const name = `${candidate.user.firstName} ${candidate.user.lastName}`.toLowerCase();
        const email = candidate.user.email.toLowerCase();
        const bio = (candidate.user.bio || '').toLowerCase();
        return name.includes(searchLower) || email.includes(searchLower) || bio.includes(searchLower);
      });
    }

    // Skills filter
    if (filters.skills) {
      const requiredSkills = filters.skills.split(',').map((s) => s.trim().toLowerCase());
      filtered = filtered.filter((candidate) =>
        requiredSkills.some((rs) =>
          candidate.skills.some((cs) => cs.toLowerCase().includes(rs))
        )
      );
    }

    // Experience filter
    if (filters.experience) {
      const minExp = parseInt(filters.experience);
      filtered = filtered.filter(
        (candidate) => candidate.user.experience !== undefined && candidate.user.experience >= minExp
      );
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
      if (sortBy === 'recent') {
        const latestA = Math.max(...a.applications.map((app) => new Date(app.appliedAt).getTime()));
        const latestB = Math.max(...b.applications.map((app) => new Date(app.appliedAt).getTime()));
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
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Candidate Search</h1>
          <p className="text-slate-500 mt-1">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-full md:col-span-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, or bio..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
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
              className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />

            <input
              type="number"
              placeholder="Min. years of experience..."
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />

            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />

            <input
              type="text"
              placeholder="Education..."
              value={filters.education}
              onChange={(e) => setFilters({ ...filters, education: e.target.value })}
              className="col-span-full md:col-span-2 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-slate-500 hover:text-blue-600 underline transition-colors"
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
              <div key={candidate.user.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <span className="text-2xl font-bold text-blue-600">
                          {candidate.user.firstName.charAt(0)}
                          {candidate.user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {candidate.user.firstName} {candidate.user.lastName}
                        </h3>
                        <p className="text-sm text-slate-500">{candidate.user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {candidate.user.bio && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{candidate.user.bio}</p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    {candidate.user.location && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>📍</span>
                        <span>{candidate.user.location}</span>
                      </div>
                    )}
                    {candidate.user.experience !== undefined && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>💼</span>
                        <span>{candidate.user.experience} years experience</span>
                      </div>
                    )}
                    {candidate.user.education && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>🎓</span>
                        <span>{candidate.user.education}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>📄</span>
                      <span>{candidate.totalApplications} application{candidate.totalApplications !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 4 && (
                          <span className="text-xs text-slate-400 px-1">+{candidate.skills.length - 4}</span>
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
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        LinkedIn →
                      </a>
                    )}
                    {candidate.user.portfolio && (
                      <a
                        href={candidate.user.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 font-medium hover:underline"
                      >
                        Portfolio →
                      </a>
                    )}
                  </div>

                  {/* Applications */}
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Recent Applications</p>
                    <div className="space-y-2">
                      {candidate.applications.slice(0, 2).map((app) => (
                        <Link
                          key={app.id}
                          to={`/applications/${app.id}`}
                          className="block text-sm hover:bg-slate-50 p-2 rounded-lg transition-colors -mx-2"
                        >
                          <p className="font-medium text-slate-900">{app.job?.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-slate-500">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {app.status.replace('_', ' ')}
                            </span>
                          </div>
                        </Link>
                      ))}
                      {candidate.applications.length > 2 && (
                        <p className="text-xs text-slate-400 text-center">
                          +{candidate.applications.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={`mailto:${candidate.user.email}`}
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                    >
                      Contact Candidate
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Candidates Found</h2>
            <p className="text-slate-500 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search filters'
                : 'No candidates have applied to your jobs yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Tips */}
        {filteredCandidates.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span>💡</span> Search Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Use comma-separated skills to find candidates with specific expertise</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Filter by experience level to find candidates matching your requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Check their application history to see their interest in your company</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>View their portfolio or LinkedIn to learn more about their work</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSearch;
