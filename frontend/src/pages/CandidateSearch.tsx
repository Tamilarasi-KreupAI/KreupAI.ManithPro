import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import type { Application, User } from '../types';
import { CandidateCardSkeleton } from '../components/SkeletonLoader';

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Candidate Search</h1>
          <p className="text-gray-600 mt-1">Loading candidates...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CandidateCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Candidate Search</h1>
        <p className="text-gray-600 mt-1">
          {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or bio..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="col-span-full md:col-span-2 border border-gray-300 rounded-md px-4 py-2"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
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
            className="border border-gray-300 rounded-md px-4 py-2"
          />

          <input
            type="number"
            placeholder="Min. years of experience..."
            value={filters.experience}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            className="border border-gray-300 rounded-md px-4 py-2"
          />

          <input
            type="text"
            placeholder="Location..."
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="border border-gray-300 rounded-md px-4 py-2"
          />

          <input
            type="text"
            placeholder="Education..."
            value={filters.education}
            onChange={(e) => setFilters({ ...filters, education: e.target.value })}
            className="col-span-full md:col-span-2 border border-gray-300 rounded-md px-4 py-2"
          />

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
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
            <div key={candidate.user.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-600">
                        {candidate.user.firstName.charAt(0)}
                        {candidate.user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {candidate.user.firstName} {candidate.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{candidate.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {candidate.user.bio && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{candidate.user.bio}</p>
                )}

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  {candidate.user.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📍</span>
                      <span>{candidate.user.location}</span>
                    </div>
                  )}
                  {candidate.user.experience !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>💼</span>
                      <span>{candidate.user.experience} years experience</span>
                    </div>
                  )}
                  {candidate.user.education && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>🎓</span>
                      <span>{candidate.user.education}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📄</span>
                    <span>{candidate.totalApplications} application{candidate.totalApplications !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Skills */}
                {candidate.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">SKILLS</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="text-xs text-gray-500">+{candidate.skills.length - 4}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2 mb-4 text-sm">
                  {candidate.user.linkedIn && (
                    <a
                      href={candidate.user.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn →
                    </a>
                  )}
                  {candidate.user.portfolio && (
                    <a
                      href={candidate.user.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Portfolio →
                    </a>
                  )}
                </div>

                {/* Applications */}
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">RECENT APPLICATIONS</p>
                  <div className="space-y-2">
                    {candidate.applications.slice(0, 2).map((app) => (
                      <Link
                        key={app.id}
                        to={`/applications/${app.id}`}
                        className="block text-sm hover:bg-gray-50 p-2 rounded"
                      >
                        <p className="font-medium text-gray-900">{app.job?.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {candidate.applications.length > 2 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{candidate.applications.length - 2} more
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`mailto:${candidate.user.email}`}
                    className="block w-full text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Contact Candidate
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Candidates Found</h2>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search filters'
              : 'No candidates have applied to your jobs yet'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      {filteredCandidates.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Search Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Use comma-separated skills to find candidates with specific expertise</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Filter by experience level to find candidates matching your requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Check their application history to see their interest in your company</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>View their portfolio or LinkedIn to learn more about their work</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;
