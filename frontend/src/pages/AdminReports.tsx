import { useEffect, useState } from 'react';
import {
  getReportTypes,
  generateUserReport,
  generateJobReport,
  generateApplicationReport,
  generateInterviewReport,
  generateRecruiterReport,
  generateConversionReport,
  getScheduledReports,
  getReportHistory,
} from '../services/admin.service';

interface ReportType {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Report {
  id: string;
  type: string;
  name: string;
  generatedAt: string;
  format: string;
  fileUrl?: string;
  status: string;
  recordsCount?: number;
}

interface ScheduledReport {
  id: string;
  reportType: string;
  frequency: string;
  nextRun: string;
  lastRun?: string;
  recipients: string[];
  isActive: boolean;
}

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);

  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [reportHistory, setReportHistory] = useState<Report[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  // Report Generation Form
  const [selectedReportType, setSelectedReportType] = useState('users');
  const [reportFormat, setReportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportFilters, setReportFilters] = useState<any>({
    status: 'all',
    role: 'all',
    includeInactive: false,
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'generate') {
        const types = await getReportTypes();
        setReportTypes(types);
      }

      if (activeTab === 'history') {
        const history = await getReportHistory(50);
        setReportHistory(history);
      }

      if (activeTab === 'scheduled') {
        const scheduled = await getScheduledReports();
        setScheduledReports(scheduled);
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      let result;
      const params = {
        format: reportFormat,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...reportFilters,
      };

      switch (selectedReportType) {
        case 'users':
          result = await generateUserReport(params);
          break;
        case 'jobs':
          result = await generateJobReport(params);
          break;
        case 'applications':
          result = await generateApplicationReport(params);
          break;
        case 'interviews':
          result = await generateInterviewReport(params);
          break;
        case 'recruiters':
          result = await generateRecruiterReport(params);
          break;
        case 'conversion':
          result = await generateConversionReport(params);
          break;
        default:
          throw new Error('Invalid report type');
      }

      alert(`Report generated successfully! ${result.recordsCount || ''} records included.`);
      setActiveTab('history');
      loadData();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and manage system reports</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'generate', label: 'Generate Report', icon: '📊' },
                { id: 'history', label: 'Report History', icon: '📁' },
                { id: 'scheduled', label: 'Scheduled Reports', icon: '⏰' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Generate Report Tab */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Generate New Report</h3>

                  {/* Report Type Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                      <select
                        value={selectedReportType}
                        onChange={(e) => setSelectedReportType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        <option value="users">User Report</option>
                        <option value="jobs">Job Listings Report</option>
                        <option value="applications">Applications Report</option>
                        <option value="interviews">Interviews Report</option>
                        <option value="recruiters">Recruiter Performance Report</option>
                        <option value="conversion">Conversion Funnel Report</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                    </div>

                    {/* Export Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                      <div className="flex space-x-4">
                        {['csv', 'xlsx', 'pdf'].map((format) => (
                          <label key={format} className="flex items-center">
                            <input
                              type="radio"
                              value={format}
                              checked={reportFormat === format}
                              onChange={(e) => setReportFormat(e.target.value as 'csv' | 'xlsx' | 'pdf')}
                              className="mr-2"
                            />
                            <span className="uppercase">{format}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Filters Based on Report Type */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Filters</h4>

                      {selectedReportType === 'users' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                            <select
                              value={reportFilters.role}
                              onChange={(e) => setReportFilters({ ...reportFilters, role: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                              <option value="all">All Roles</option>
                              <option value="CANDIDATE">Candidates</option>
                              <option value="RECRUITER">Recruiters</option>
                              <option value="ADMIN">Admins</option>
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={reportFilters.includeInactive}
                                onChange={(e) => setReportFilters({ ...reportFilters, includeInactive: e.target.checked })}
                                className="mr-2"
                              />
                              <span className="text-sm">Include inactive users</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {selectedReportType === 'jobs' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Status</label>
                            <select
                              value={reportFilters.status}
                              onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                              <option value="all">All Status</option>
                              <option value="OPEN">Open</option>
                              <option value="CLOSED">Closed</option>
                              <option value="DRAFT">Draft</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {selectedReportType === 'applications' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Application Status</label>
                            <select
                              value={reportFilters.status}
                              onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                              <option value="all">All Status</option>
                              <option value="PENDING">Pending</option>
                              <option value="REVIEWING">Reviewing</option>
                              <option value="SHORTLISTED">Shortlisted</option>
                              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                              <option value="REJECTED">Rejected</option>
                              <option value="ACCEPTED">Accepted</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {selectedReportType === 'interviews' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Interview Status</label>
                            <select
                              value={reportFilters.status}
                              onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                              <option value="all">All Status</option>
                              <option value="SCHEDULED">Scheduled</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                              <option value="NO_SHOW">No Show</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Report Description */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Report Description</h5>
                      <p className="text-sm text-blue-800">
                        {selectedReportType === 'users' && 'Comprehensive user data including profile information, registration dates, and activity metrics.'}
                        {selectedReportType === 'jobs' && 'Detailed job listing data including posting information, applications count, and current status.'}
                        {selectedReportType === 'applications' && 'Application tracking data with candidate information, status history, and timeline metrics.'}
                        {selectedReportType === 'interviews' && 'Interview schedule data including types, feedback, ratings, and completion status.'}
                        {selectedReportType === 'recruiters' && 'Recruiter performance metrics including job postings, application reviews, and hiring success rates.'}
                        {selectedReportType === 'conversion' && 'Funnel analysis showing conversion rates from application to hire across different stages.'}
                      </p>
                    </div>

                    {/* Generate Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Generating...' : 'Generate Report'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Report History</h3>
                  <button
                    onClick={loadData}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Refresh
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No reports generated yet. Generate your first report above.
                          </td>
                        </tr>
                      ) : (
                        reportHistory.map((report) => (
                          <tr key={report.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{report.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{report.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="uppercase text-gray-600">{report.format}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{report.recordsCount || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(report.generatedAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {report.status === 'COMPLETED' && report.fileUrl && (
                                <a
                                  href={report.fileUrl}
                                  download
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Download
                                </a>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scheduled Reports Tab */}
            {activeTab === 'scheduled' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Scheduled Reports</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Schedule New Report
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scheduledReports.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No scheduled reports. Create a schedule to automate report generation.
                          </td>
                        </tr>
                      ) : (
                        scheduledReports.map((scheduled) => (
                          <tr key={scheduled.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{scheduled.reportType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{scheduled.frequency}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(scheduled.nextRun)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {scheduled.lastRun ? formatDate(scheduled.lastRun) : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{scheduled.recipients.length} recipients</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {scheduled.isActive ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
