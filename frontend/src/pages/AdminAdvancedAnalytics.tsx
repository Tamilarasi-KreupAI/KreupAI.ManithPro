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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden mt-20">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Advanced Analytics</h1>
            <p className="text-slate-500 mt-2">Deep dive into platform performance and metrics</p>
          </div>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-6 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="365d">Last Year</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
        </div>

        {/* Engagement Metrics */}
        {engagementData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Active Users</p>
              <p className="text-3xl font-bold text-slate-900">{engagementData.activeUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Saved Jobs</p>
              <p className="text-3xl font-bold text-slate-900">{engagementData.savedJobs}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avg Sessions/User</p>
              <p className="text-3xl font-bold text-slate-900">{engagementData.averageSessions.toFixed(1)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avg Time on Site</p>
              <p className="text-3xl font-bold text-slate-900">{engagementData.averageTimeOnSite.toFixed(0)} <span className="text-lg text-slate-500 font-medium">min</span></p>
            </div>
          </div>
        )}

        {/* Conversion Rates */}
        {comprehensiveData && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Conversion Funnel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-600 mb-3">Application → Interview</div>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  {comprehensiveData.conversionRates.applicationToInterview.toFixed(1)}%
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${comprehensiveData.conversionRates.applicationToInterview}%` }}
                  />
                </div>
              </div>

              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-600 mb-3">Interview → Hire</div>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  {comprehensiveData.conversionRates.interviewToHire.toFixed(1)}%
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${comprehensiveData.conversionRates.interviewToHire}%` }}
                  />
                </div>
              </div>

              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-600 mb-3">Overall Conversion</div>
                <div className="text-4xl font-bold text-purple-600 mb-4">
                  {comprehensiveData.conversionRates.overallConversion.toFixed(1)}%
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${comprehensiveData.conversionRates.overallConversion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Growth Trends */}
        {comprehensiveData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User Growth */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">User Growth</h3>
              <div className="space-y-4">
                {comprehensiveData.userGrowth.slice(-8).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500 w-24">{new Date(item.date).toLocaleDateString()}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.count / Math.max(...comprehensiveData.userGrowth.map(u => u.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-12 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Trends */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Job Postings Trend</h3>
              <div className="space-y-4">
                {comprehensiveData.jobTrends.slice(-8).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500 w-24">{new Date(item.date).toLocaleDateString()}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(item.count / Math.max(...comprehensiveData.jobTrends.map(j => j.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-12 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Time to Hire */}
        {timeToHireData && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Time to Hire Analytics</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="text-center md:text-left min-w-[200px]">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Average Time</div>
                <div className="text-5xl font-bold text-blue-600">{timeToHireData.averageDays} <span className="text-2xl text-slate-400 font-medium">days</span></div>
              </div>
              <div className="flex-1 w-full space-y-3">
                {timeToHireData.distribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 w-24">{item.range}</span>
                    <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-blue-100 rounded-lg absolute top-0 left-0"
                        style={{ width: `${(item.count / Math.max(...timeToHireData.distribution.map(d => d.count))) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-bold text-blue-800">{item.count} hires</span>
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Recruiter Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Recruiter</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jobs Posted</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applications</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Interviews</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hires</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Time to Hire</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {recruiterData.recruiters.map((recruiter) => (
                    <tr key={recruiter.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{recruiter.name}</td>
                      <td className="px-6 py-4 text-slate-600">{recruiter.jobsPosted}</td>
                      <td className="px-6 py-4 text-slate-600">{recruiter.totalApplications}</td>
                      <td className="px-6 py-4 text-slate-600">{recruiter.interviewsScheduled}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">
                          {recruiter.hires}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{recruiter.averageTimeToHire} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Source Analytics and Skills Demand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Source Analytics */}
          {sourceData && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Candidate Sources</h2>
              <div className="space-y-4">
                {sourceData.sources.map((source, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700">{source.source || 'Direct'}</span>
                      <span className="text-sm text-slate-500">{source.count} ({source.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
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
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Top Skills in Demand</h2>
              <div className="space-y-4">
                {skillsData.skills.slice(0, 10).map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700">{skill.skill}</span>
                      <span className="text-sm text-slate-500">{skill.count} jobs</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Industry Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jobs Posted</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applications</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Applications/Job</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {industryData.industries.map((industry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{industry.industry}</td>
                      <td className="px-6 py-4 text-slate-600">{industry.jobs}</td>
                      <td className="px-6 py-4 text-slate-600">{industry.applications}</td>
                      <td className="px-6 py-4">
                        <span className="text-blue-600 font-bold">
                          {industry.jobs > 0 ? (industry.applications / industry.jobs).toFixed(1) : 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAdvancedAnalytics;
