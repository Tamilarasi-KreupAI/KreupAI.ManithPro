import React, { useState, useEffect } from 'react';
import {
  getComprehensiveAnalytics,
  getRecruiterPerformance,
  getTimeToHireAnalytics,
  getSourceAnalytics,
  getSkillsDemandAnalytics,
  getIndustryAnalytics,
  getEngagementMetrics,
} from '../services/admin.service';

interface ComprehensiveAnalytics {
  userGrowth: { date: string; count: number }[];
  jobTrends: { date: string; count: number }[];
  applicationTrends: { date: string; count: number }[];
  interviewTrends: { date: string; count: number }[];
  conversionRates: {
    applicationToInterview: number;
    interviewToHire: number;
    overallConversion: number;
  };
  topPerformers: {
    recruiters: any[];
    jobs: any[];
  };
}

interface RecruiterPerformance {
  recruiters: {
    id: string;
    name: string;
    jobsPosted: number;
    totalApplications: number;
    interviewsScheduled: number;
    hires: number;
    averageTimeToHire: number;
  }[];
}

interface TimeToHire {
  averageDays: number;
  distribution: { range: string; count: number }[];
}

interface SourceAnalytics {
  sources: { source: string; count: number; percentage: number }[];
}

interface SkillsDemand {
  skills: { skill: string; count: number }[];
}

interface IndustryAnalytics {
  industries: {
    industry: string;
    jobs: number;
    applications: number;
  }[];
}

interface EngagementMetrics {
  activeUsers: number;
  savedJobs: number;
  averageSessions: number;
  averageTimeOnSite: number;
}

const AdminAdvancedAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveAnalytics | null>(null);
  const [recruiterData, setRecruiterData] = useState<RecruiterPerformance | null>(null);
  const [timeToHireData, setTimeToHireData] = useState<TimeToHire | null>(null);
  const [sourceData, setSourceData] = useState<SourceAnalytics | null>(null);
  const [skillsData, setSkillsData] = useState<SkillsDemand | null>(null);
  const [industryData, setIndustryData] = useState<IndustryAnalytics | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementMetrics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [
        comprehensive,
        recruiter,
        timeToHire,
        source,
        skills,
        industry,
        engagement,
      ] = await Promise.all([
        getComprehensiveAnalytics(period),
        getRecruiterPerformance(),
        getTimeToHireAnalytics(),
        getSourceAnalytics(),
        getSkillsDemandAnalytics(),
        getIndustryAnalytics(),
        getEngagementMetrics(),
      ]);

      setComprehensiveData(comprehensive);
      setRecruiterData(recruiter);
      setTimeToHireData(timeToHire);
      setSourceData(source);
      setSkillsData(skills);
      setIndustryData(industry);
      setEngagementData(engagement);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="365d">Last Year</option>
        </select>
      </div>

      {/* Engagement Metrics */}
      {engagementData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Active Users</div>
              <div className="text-2xl font-bold">{engagementData.activeUsers}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Saved Jobs</div>
              <div className="text-2xl font-bold">{engagementData.savedJobs}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Avg Sessions/User</div>
              <div className="text-2xl font-bold">{engagementData.averageSessions.toFixed(1)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Avg Time on Site</div>
              <div className="text-2xl font-bold">{engagementData.averageTimeOnSite.toFixed(0)} min</div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Rates */}
      {comprehensiveData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Application → Interview</div>
                <div className="text-4xl font-bold text-blue-600">
                  {comprehensiveData.conversionRates.applicationToInterview.toFixed(1)}%
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-600 rounded"
                    style={{ width: `${comprehensiveData.conversionRates.applicationToInterview}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Interview → Hire</div>
                <div className="text-4xl font-bold text-green-600">
                  {comprehensiveData.conversionRates.interviewToHire.toFixed(1)}%
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-green-600 rounded"
                    style={{ width: `${comprehensiveData.conversionRates.interviewToHire}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Overall Conversion</div>
                <div className="text-4xl font-bold text-purple-600">
                  {comprehensiveData.conversionRates.overallConversion.toFixed(1)}%
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-purple-600 rounded"
                    style={{ width: `${comprehensiveData.conversionRates.overallConversion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Growth Trends */}
      {comprehensiveData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Growth Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Growth */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">User Growth</h3>
              <div className="space-y-2">
                {comprehensiveData.userGrowth.slice(-10).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                    <div className="flex items-center">
                      <div className="w-32 h-4 bg-gray-200 rounded mr-2">
                        <div
                          className="h-4 bg-blue-600 rounded"
                          style={{ width: `${(item.count / Math.max(...comprehensiveData.userGrowth.map(u => u.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Job Postings Trend</h3>
              <div className="space-y-2">
                {comprehensiveData.jobTrends.slice(-10).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                    <div className="flex items-center">
                      <div className="w-32 h-4 bg-gray-200 rounded mr-2">
                        <div
                          className="h-4 bg-green-600 rounded"
                          style={{ width: `${(item.count / Math.max(...comprehensiveData.jobTrends.map(j => j.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Applications Trend</h3>
              <div className="space-y-2">
                {comprehensiveData.applicationTrends.slice(-10).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                    <div className="flex items-center">
                      <div className="w-32 h-4 bg-gray-200 rounded mr-2">
                        <div
                          className="h-4 bg-purple-600 rounded"
                          style={{ width: `${(item.count / Math.max(...comprehensiveData.applicationTrends.map(a => a.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Interviews Trend</h3>
              <div className="space-y-2">
                {comprehensiveData.interviewTrends.slice(-10).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                    <div className="flex items-center">
                      <div className="w-32 h-4 bg-gray-200 rounded mr-2">
                        <div
                          className="h-4 bg-orange-600 rounded"
                          style={{ width: `${(item.count / Math.max(...comprehensiveData.interviewTrends.map(i => i.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time to Hire */}
      {timeToHireData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Time to Hire Analytics</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6 text-center">
              <div className="text-sm text-gray-600">Average Time to Hire</div>
              <div className="text-4xl font-bold text-blue-600">{timeToHireData.averageDays} days</div>
            </div>
            <div className="space-y-2">
              {timeToHireData.distribution.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.range}</span>
                  <div className="flex items-center flex-1 ml-4">
                    <div className="w-full h-6 bg-gray-200 rounded">
                      <div
                        className="h-6 bg-blue-600 rounded flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / Math.max(...timeToHireData.distribution.map(d => d.count))) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">{item.count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recruiter Performance */}
      {recruiterData && recruiterData.recruiters.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recruiter Performance</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recruiter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interviews</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time to Hire</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recruiterData.recruiters.map((recruiter) => (
                    <tr key={recruiter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{recruiter.name}</td>
                      <td className="px-6 py-4">{recruiter.jobsPosted}</td>
                      <td className="px-6 py-4">{recruiter.totalApplications}</td>
                      <td className="px-6 py-4">{recruiter.interviewsScheduled}</td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-semibold">{recruiter.hires}</span>
                      </td>
                      <td className="px-6 py-4">{recruiter.averageTimeToHire} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Source Analytics and Skills Demand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Source Analytics */}
        {sourceData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Candidate Sources</h2>
            <div className="space-y-3">
              {sourceData.sources.map((source, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{source.source || 'Direct'}</span>
                    <span className="text-sm text-gray-600">{source.count} ({source.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded">
                    <div
                      className="h-3 bg-indigo-600 rounded"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Skills in Demand */}
        {skillsData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Top Skills in Demand</h2>
            <div className="space-y-3">
              {skillsData.skills.slice(0, 10).map((skill, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm text-gray-600">{skill.count} jobs</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded">
                    <div
                      className="h-3 bg-teal-600 rounded"
                      style={{ width: `${(skill.count / skillsData.skills[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Industry Analytics */}
      {industryData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Industry Breakdown</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Applications/Job</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {industryData.industries.map((industry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{industry.industry}</td>
                      <td className="px-6 py-4">{industry.jobs}</td>
                      <td className="px-6 py-4">{industry.applications}</td>
                      <td className="px-6 py-4">
                        <span className="text-blue-600 font-semibold">
                          {industry.jobs > 0 ? (industry.applications / industry.jobs).toFixed(1) : 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdvancedAnalytics;
