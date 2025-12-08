import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { companyAPI } from '../services/api';
import type { Company, Job } from '../types';

const CompanyProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      loadCompany();
    }
  }, [name]);

  const loadCompany = async () => {
    try {
      const data = await companyAPI.getByName(decodeURIComponent(name!));
      setCompany(data.company);
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to load company:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Company Not Found</h2>
          <p className="text-slate-500 mb-6">The company you are looking for does not exist or has been removed.</p>
          <Link to="/jobs" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Company Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

          <div className="flex flex-col md:flex-row items-start gap-8">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="w-32 h-32 object-contain rounded-2xl border border-slate-100 shadow-sm bg-white p-2"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                <span className="text-5xl font-bold text-blue-600">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-slate-900">{company.name}</h1>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors border border-slate-200"
                  >
                    <span>🌐</span> Visit Website
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                {company.industry && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                    <span>🏢</span> {company.industry}
                  </span>
                )}
                {company.size && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                    <span>👥</span> {company.size} employees
                  </span>
                )}
                {company.location && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                    <span>📍</span> {company.location}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-slate-100 pt-6">
                <div>
                  <span className="text-3xl font-bold text-blue-600 block mb-1">
                    {company.openJobs || 0}
                  </span>
                  <p className="text-sm font-medium text-slate-500">Open Positions</p>
                </div>
                <div>
                  <span className="text-3xl font-bold text-slate-900 block mb-1">
                    {company.totalJobs || 0}
                  </span>
                  <p className="text-sm font-medium text-slate-500">Total Jobs</p>
                </div>
              </div>
            </div>
          </div>

          {company.description && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About {company.name}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{company.description}</p>
            </div>
          )}
        </div>

        {/* Job Listings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Open Positions <span className="text-slate-400 font-normal text-lg ml-2">({jobs.filter((j) => j.status === 'OPEN').length})</span>
            </h2>
          </div>

          {jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all hover:border-blue-200 group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
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

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mb-4">
                        <span className="flex items-center gap-1">
                          <span>📍</span> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>💼</span> {job.type.replace('_', ' ')}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1 text-green-600 font-bold">
                            <span>💰</span> {job.salary}
                          </span>
                        )}
                        {job._count && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <span>👥</span> {job._count.applications} applicants
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 mb-4 line-clamp-2">{job.description}</p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="text-slate-400 text-xs font-medium py-1 px-2">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch min-w-[140px]">
                      <span className="text-xs font-medium text-slate-400 mb-4">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="w-full text-center px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Open Positions</h3>
              <p className="text-slate-500">There are currently no job openings available at {company.name}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
