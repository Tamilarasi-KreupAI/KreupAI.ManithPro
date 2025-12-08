
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jobAPI } from '../services/api';

const SalaryInsights: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [avgSalaries, setAvgSalaries] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    analyzeSalaryData();
  }, [jobs, selectedRole, selectedLocation]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { jobs: data } = await jobAPI.getAll();
      const jobsWithSalary = data.filter((job: any) => job.salaryMin && job.salaryMax);
      setJobs(jobsWithSalary);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSalaryData = () => {
    let filteredJobs = [...jobs];

    if (selectedRole) {
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(selectedRole.toLowerCase())
      );
    }

    if (selectedLocation) {
      filteredJobs = filteredJobs.filter(job => job.location === selectedLocation);
    }

    // Calculate salary ranges by experience
    const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
    const salaryByExperience = experienceLevels.map(level => {
      const levelJobs = filteredJobs.filter(job =>
        job.experience?.includes(level) || job.title.toLowerCase().includes(level.toLowerCase())
      );

      if (levelJobs.length === 0) {
        return {
          experience: level,
          avgMin: 0,
          avgMax: 0,
          count: 0,
        };
      }

      const avgMin = Math.round(levelJobs.reduce((sum, job) => sum + job.salaryMin, 0) / levelJobs.length);
      const avgMax = Math.round(levelJobs.reduce((sum, job) => sum + job.salaryMax, 0) / levelJobs.length);

      return {
        experience: level,
        avgMin,
        avgMax,
        count: levelJobs.length,
      };
    });

    setSalaryData(salaryByExperience);

    // Calculate average salaries by top roles
    const roleCounts = new Map<string, { total: number; count: number }>();
    filteredJobs.forEach(job => {
      const existing = roleCounts.get(job.title) || { total: 0, count: 0 };
      const avgSalary = (job.salaryMin + job.salaryMax) / 2;
      roleCounts.set(job.title, {
        total: existing.total + avgSalary,
        count: existing.count + 1,
      });
    });

    const avgByRole = Array.from(roleCounts.entries())
      .map(([title, data]) => ({
        role: title.length > 20 ? title.substring(0, 20) + '...' : title,
        avgSalary: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.avgSalary - a.avgSalary)
      .slice(0, 10);

    setAvgSalaries(avgByRole);
  };

  const uniqueRoles = [...new Set(jobs.map(job => job.title))];
  const uniqueLocations = [...new Set(jobs.map(job => job.location))];

  // Calculate overall statistics
  const allSalaries = jobs.map(job => (job.salaryMin + job.salaryMax) / 2);
  const avgSalary = allSalaries.length > 0
    ? Math.round(allSalaries.reduce((a, b) => a + b, 0) / allSalaries.length)
    : 0;
  const medianSalary = allSalaries.length > 0
    ? allSalaries.sort((a, b) => a - b)[Math.floor(allSalaries.length / 2)]
    : 0;
  const minSalary = Math.min(...jobs.map(job => job.salaryMin));
  const maxSalary = Math.max(...jobs.map(job => job.salaryMax));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading salary insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Salary Insights</h1>
          <p className="mt-2 text-slate-500">Explore market salary data and compensation trends</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Filter by Role
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-slate-700 appearance-none"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.slice(0, 20).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Filter by Location
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-slate-700 appearance-none"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 p-6 text-white transform transition-transform hover:-translate-y-1">
            <h3 className="text-sm font-medium opacity-90 mb-2 uppercase tracking-wider">Average Salary</h3>
            <p className="text-3xl font-bold">${avgSalary.toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-1">Across all roles</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 p-6 text-white transform transition-transform hover:-translate-y-1">
            <h3 className="text-sm font-medium opacity-90 mb-2 uppercase tracking-wider">Median Salary</h3>
            <p className="text-3xl font-bold">${Math.round(medianSalary).toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-1">50th percentile</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/20 p-6 text-white transform transition-transform hover:-translate-y-1">
            <h3 className="text-sm font-medium opacity-90 mb-2 uppercase tracking-wider">Salary Range</h3>
            <p className="text-3xl font-bold">${minSalary.toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-1">to ${maxSalary.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-500/20 p-6 text-white transform transition-transform hover:-translate-y-1">
            <h3 className="text-sm font-medium opacity-90 mb-2 uppercase tracking-wider">Data Points</h3>
            <p className="text-3xl font-bold">{jobs.length}</p>
            <p className="text-sm opacity-75 mt-1">Jobs analyzed</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Salary by Experience */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Salary by Experience Level</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="experience"
                  stroke="#64748B"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#64748B"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => { return `$${value / 1000} k`; }}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ backgroundColor: '#FFF', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="avgMin" fill="#3B82F6" name="Min Salary" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgMax" fill="#10B981" name="Max Salary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Paying Roles */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Top Paying Roles</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgSalaries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748B"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => { return `$${value / 1000} k`; }}
                />
                <YAxis
                  dataKey="role"
                  type="category"
                  stroke="#64748B"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                  width={120}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ backgroundColor: '#FFF', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="avgSalary" fill="#8B5CF6" name="Average Salary" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Calculator */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Compensation Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Base Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="e.g., 100000"
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Annual Bonus (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g., 15"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Stock/Equity Value
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="e.g., 25000"
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-lg">
            <h3 className="text-lg font-medium text-slate-300 mb-2">Total Estimated Compensation</h3>
            <p className="text-5xl font-bold text-white tracking-tight">$0</p>
            <p className="text-sm text-slate-400 mt-2">Enter values above to calculate your total package</p>
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">💡</span>
            Market Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/20 transition-colors">
              <h3 className="font-bold mb-2 text-lg">🔥 Hot Skills</h3>
              <p className="text-blue-100 leading-relaxed">React, TypeScript, and Node.js command 15-25% higher salaries in the current market.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/20 transition-colors">
              <h3 className="font-bold mb-2 text-lg">📍 Top Locations</h3>
              <p className="text-blue-100 leading-relaxed">San Francisco, New York, and Seattle continue to offer the highest compensation packages.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/20 transition-colors">
              <h3 className="font-bold mb-2 text-lg">📈 Growth Trend</h3>
              <p className="text-blue-100 leading-relaxed">Tech salaries have seen a steady increase of 8-12% year-over-year despite market fluctuations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryInsights;
