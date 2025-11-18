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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading company profile...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Company Not Found</h2>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-800">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start gap-6 mb-6">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-24 h-24 object-contain rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-600">
                {company.name.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{company.name}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
              {company.industry && (
                <span className="flex items-center gap-1">
                  🏢 {company.industry}
                </span>
              )}
              {company.size && (
                <span className="flex items-center gap-1">
                  👥 {company.size} employees
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-800"
                >
                  🌐 Visit Website
                </a>
              )}
            </div>

            <div className="flex gap-6">
              <div>
                <span className="text-3xl font-bold text-primary-600">
                  {company.openJobs || 0}
                </span>
                <p className="text-gray-600">Open Positions</p>
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-700">
                  {company.totalJobs || 0}
                </span>
                <p className="text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>
        </div>

        {company.description && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-3">About {company.name}</h2>
            <p className="text-gray-700 whitespace-pre-line">{company.description}</p>
          </div>
        )}
      </div>

      {/* Job Listings */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Open Positions at {company.name} ({jobs.filter((j) => j.status === 'OPEN').length})
        </h2>

        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-gray-600">
                        <span className="flex items-center">
                          📍 {job.location}
                        </span>
                        <span className="flex items-center">
                          💼 {job.type.replace('_', ' ')}
                        </span>
                        {job.salary && (
                          <span className="flex items-center">
                            💰 {job.salary}
                          </span>
                        )}
                        {job._count && (
                          <span className="flex items-center">
                            👥 {job._count.applications} applicants
                          </span>
                        )}
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
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-gray-500 text-sm">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No job openings available at the moment
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;
