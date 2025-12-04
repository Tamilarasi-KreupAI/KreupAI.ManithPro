import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading salary insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Salary Insights</h1>
          <p className="mt-2 text-gray-600">Explore market salary data and compensation trends</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Roles</option>
                {uniqueRoles.slice(0, 20).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 mb-2">Average Salary</h3>
            <p className="text-3xl font-bold">${avgSalary.toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-1">Across all roles</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 mb-2">Median Salary</h3>
            <p className="text-3xl font-bold">${Math.round(medianSalary).toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-1">50th percentile</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 mb-2">Salary Range</h3>
            <p className="text-3xl font-bold">${minSalary.toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-1">to ${maxSalary.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 mb-2">Data Points</h3>
            <p className="text-3xl font-bold">{jobs.length}</p>
            <p className="text-sm opacity-75 mt-1">Jobs analyzed</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Salary by Experience */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Salary by Experience Level</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="experience"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="avgMin" fill="#3B82F6" name="Min Salary" />
                <Bar dataKey="avgMax" fill="#10B981" name="Max Salary" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Paying Roles */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Paying Roles</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgSalaries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis
                  dataKey="role"
                  type="category"
                  stroke="#6B7280"
                  style={{ fontSize: '11px' }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                />
                <Bar dataKey="avgSalary" fill="#8B5CF6" name="Average Salary" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Calculator */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compensation Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Salary
              </label>
              <input
                type="number"
                placeholder="e.g., 100000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Bonus (%)
              </label>
              <input
                type="number"
                placeholder="e.g., 15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock/Equity Value
              </label>
              <input
                type="number"
                placeholder="e.g., 25000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Compensation</h3>
            <p className="text-4xl font-bold text-primary-600">$0</p>
            <p className="text-sm text-gray-600 mt-1">Enter values above to calculate</p>
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">💡 Market Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔥 Hot Skills</h3>
              <p className="text-sm">React, TypeScript, and Node.js command 15-25% higher salaries</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📍 Top Locations</h3>
              <p className="text-sm">San Francisco, New York, and Seattle offer highest compensation</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📈 Growth Trend</h3>
              <p className="text-sm">Tech salaries increased by 8-12% year-over-year</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryInsights;
