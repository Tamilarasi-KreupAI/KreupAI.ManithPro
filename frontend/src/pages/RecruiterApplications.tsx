import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI, jobAPI } from '../services/api';
import type { Application, Job } from '../types';

const RecruiterApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState({
    status: '',
    jobId: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('recent');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsData, jobsData] = await Promise.all([
        applicationAPI.getAll(),
        jobAPI.getAll(),
      ]);
      setApplications(appsData.applications);
      setJobs(jobsData.jobs);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter.status && app.status !== filter.status) return false;
    if (filter.jobId && app.jobId !== filter.jobId) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const candidateName = `${app.candidate?.firstName} ${app.candidate?.lastName}`.toLowerCase();
      const jobTitle = app.job?.title?.toLowerCase() || '';
      if (!candidateName.includes(searchLower) && !jobTitle.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
    } else if (sortBy === 'name') {
      const nameA = `${a.candidate?.firstName} ${a.candidate?.lastName}`;
      const nameB = `${b.candidate?.firstName} ${b.candidate?.lastName}`;
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedApplications);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedApplications(newSet);
  };

  const selectAll = () => {
    if (selectedApplications.size === sortedApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(sortedApplications.map((app) => app.id)));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedApplications.size === 0) {
      alert('Please select applications and a status');
      return;
    }

    if (!window.confirm(`Update ${selectedApplications.size} applications to ${bulkStatus}?`)) {
      return;
    }

    setBulkProcessing(true);
    try {
      const promises = Array.from(selectedApplications).map((appId) =>
        applicationAPI.updateStatus(appId, { status: bulkStatus })
      );
      await Promise.all(promises);
      alert('Applications updated successfully!');
      setSelectedApplications(new Set());
      setShowBulkActions(false);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update applications');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleDownloadResumes = async () => {
    const selected = sortedApplications.filter((app) => selectedApplications.has(app.id));
    selected.forEach((app) => {
      window.open(`http://localhost:5000/${app.resume}`, '_blank');
    });
    alert(`Opening ${selected.length} resumes in new tabs`);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      REVIEWING: 'bg-blue-50 text-blue-700 border border-blue-200',
      SHORTLISTED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      INTERVIEW_SCHEDULED: 'bg-purple-50 text-purple-700 border border-purple-200',
      ACCEPTED: 'bg-green-50 text-green-700 border border-green-200',
      REJECTED: 'bg-red-50 text-red-700 border border-red-200',
      WITHDRAWN: 'bg-slate-100 text-slate-600 border border-slate-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-600 border border-slate-200';
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Application Manager</h1>
            <p className="text-slate-500 mt-1">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
              {selectedApplications.size > 0 && ` (${selectedApplications.size} selected)`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search candidates or jobs..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={filter.jobId}
              onChange={(e) => setFilter({ ...filter, jobId: e.target.value })}
              className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedApplications.size === sortedApplications.length && sortedApplications.length > 0}
                onChange={selectAll}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Select All</span>
            </label>

            {selectedApplications.size > 0 && (
              <>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 font-medium transition-colors"
                >
                  Bulk Actions ({selectedApplications.size})
                </button>

                {showBulkActions && (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Status</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <button
                      onClick={handleBulkStatusUpdate}
                      disabled={bulkProcessing}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
                    >
                      {bulkProcessing ? 'Updating...' : 'Update Status'}
                    </button>
                    <button
                      onClick={handleDownloadResumes}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all"
                    >
                      Download Resumes
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Applications Table */}
        {sortedApplications.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedApplications.size === sortedApplications.length}
                      onChange={selectAll}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.has(application.id)}
                        onChange={() => toggleSelect(application.id)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {application.candidate?.firstName} {application.candidate?.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{application.candidate?.email}</p>
                        {application.candidate?.skills && application.candidate.skills.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {application.candidate.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                              >
                                {skill}
                              </span>
                            ))}
                            {application.candidate.skills.length > 3 && (
                              <span className="text-xs text-slate-400 px-1">
                                +{application.candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/jobs/${application.jobId}`}
                        className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                      >
                        {application.job?.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/applications/${application.id}`}
                          className="text-sm bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm"
                        >
                          View
                        </Link>
                        <a
                          href={`http://localhost:5000/${application.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 hover:border-blue-200 transition-all font-medium"
                        >
                          Resume
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Applications Found</h2>
            <p className="text-slate-500">
              {filter.status || filter.jobId || filter.search
                ? 'Try adjusting your filters'
                : 'Post jobs to start receiving applications'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterApplications;
