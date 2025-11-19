import React, { useState, useEffect } from 'react';
import { applicationService, Application, ApplicationStatus, ApplicationFilters } from '../utils/applicationService';

interface ApplicationListProps {
  jobId?: string;
  onSelectApplication?: (application: Application) => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ jobId, onSelectApplication }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ApplicationFilters>({
    jobIds: jobId ? [jobId] : undefined,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'rating' | 'match'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    loadApplications();
  }, [filters, jobId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplications({
        ...filters,
        searchQuery,
        jobIds: jobId ? [jobId] : filters.jobIds,
      });
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setFilters({ ...filters, searchQuery });
  };

  const handleStatusFilter = (status: ApplicationStatus) => {
    const currentStatuses = filters.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    setFilters({ ...filters, statuses: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map(app => app.id)));
    }
  };

  const handleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await applicationService.toggleBookmark(id);
      await loadApplications();
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleBulkStatusChange = async (status: ApplicationStatus) => {
    if (selectedIds.size === 0) return;
    try {
      await applicationService.performBulkAction({
        applicationIds: Array.from(selectedIds),
        action: 'CHANGE_STATUS',
        data: { status },
      });
      setSelectedIds(new Set());
      await loadApplications();
    } catch (error) {
      alert('Failed to update applications');
    }
  };

  const sortedApplications = [...applications].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.candidateName.localeCompare(b.candidateName);
        break;
      case 'date':
        comparison = new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        break;
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      case 'match':
        comparison = (a.matchScore || 0) - (b.matchScore || 0);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const renderStarRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Applications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {applications.length} total applications
            {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name, email, or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(['APPLIED', 'SCREENING', 'PHONE_SCREEN', 'TECHNICAL_INTERVIEW', 'OFFER_EXTENDED', 'HIRED', 'REJECTED'] as ApplicationStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    filters.statuses?.includes(status)
                      ? applicationService.getStatusColor(status)
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {applicationService.getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="date">Date Applied</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="match">Match Score</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className={`w-5 h-5 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <label className="flex items-center gap-2 ml-auto">
              <input
                type="checkbox"
                checked={filters.isBookmarked}
                onChange={(e) => setFilters({ ...filters, isBookmarked: e.target.checked || undefined })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Bookmarked only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
              {selectedIds.size} application{selectedIds.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary-700 dark:text-primary-300">Move to:</span>
              {(['SCREENING', 'PHONE_SCREEN', 'REJECTED'] as ApplicationStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusChange(status)}
                  className="px-3 py-1 bg-white dark:bg-gray-800 border border-primary-300 dark:border-primary-700 rounded-lg text-sm hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors text-gray-900 dark:text-white"
                >
                  {applicationService.getStatusLabel(status)}
                </button>
              ))}
              <button
                onClick={() => setSelectedIds(new Set())}
                className="ml-2 p-1 text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-primary-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications List/Grid */}
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No applications found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or search criteria
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center gap-3 px-4">
            <input
              type="checkbox"
              checked={selectedIds.size === applications.length && applications.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Select all</span>
          </div>

          {sortedApplications.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelectApplication?.(app)}
              className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(app.id)}
                  onChange={() => handleToggleSelect(app.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />

                {/* Avatar */}
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {app.candidateName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {app.candidateName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {app.jobTitle} • Applied {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleBookmark(app.id, e)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      <svg className={`w-6 h-6 ${app.isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${applicationService.getStatusColor(app.status)}`}>
                      {applicationService.getStatusLabel(app.status)}
                    </span>
                    {app.rating && renderStarRating(app.rating)}
                    {app.matchScore && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Match: <strong className="text-primary-600 dark:text-primary-400">{app.matchScore}%</strong>
                      </span>
                    )}
                    {app.tags.length > 0 && (
                      <div className="flex gap-1">
                        {app.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {app.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                            +{app.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedApplications.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelectApplication?.(app)}
              className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <input
                  type="checkbox"
                  checked={selectedIds.has(app.id)}
                  onChange={() => handleToggleSelect(app.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <button
                  onClick={(e) => handleBookmark(app.id, e)}
                  className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  <svg className={`w-5 h-5 ${app.isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-3">
                  {app.candidateName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {app.candidateName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {app.jobTitle}
                </p>
                {app.rating && renderStarRating(app.rating)}
              </div>

              <div className="space-y-2">
                <span className={`block w-full text-center px-3 py-1 rounded-full text-xs font-medium border ${applicationService.getStatusColor(app.status)}`}>
                  {applicationService.getStatusLabel(app.status)}
                </span>
                {app.matchScore && (
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Match: <strong className="text-primary-600 dark:text-primary-400">{app.matchScore}%</strong>
                  </div>
                )}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Applied {new Date(app.appliedDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
