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
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      FAILED: 'bg-red-100 text-red-700 border-red-200',
      PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Reports Center</h1>
          <p className="text-slate-500 mt-2">Generate, manage, and schedule system reports</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="border-b border-slate-100">
            <div className="flex overflow-x-auto">
              {[
                { id: 'generate', label: 'Generate Report', icon: '📊' },
                { id: 'history', label: 'Report History', icon: '📁' },
                { id: 'scheduled', label: 'Scheduled Reports', icon: '⏰' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Generate Report Tab */}
            {activeTab === 'generate' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Generate New Report</h3>

                  {/* Report Type Selection */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Report Type</label>
                      <div className="relative">
                        <select
                          value={selectedReportType}
                          onChange={(e) => setSelectedReportType(e.target.value)}
                          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        >
                          <option value="users">User Report</option>
                          <option value="jobs">Job Listings Report</option>
                          <option value="applications">Applications Report</option>
                          <option value="interviews">Interviews Report</option>
                          <option value="recruiters">Recruiter Performance Report</option>
                          <option value="conversion">Conversion Funnel Report</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        />
                      </div>
                    </div>

                    {/* Export Format */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Export Format</label>
                      <div className="flex space-x-4">
                        {['csv', 'xlsx', 'pdf'].map((format) => (
                          <label key={format} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${reportFormat === format
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}>
                            <input
                              type="radio"
                              value={format}
                              checked={reportFormat === format}
                              onChange={(e) => setReportFormat(e.target.value as 'csv' | 'xlsx' | 'pdf')}
                              className="hidden"
                            />
                            <span className="uppercase font-bold text-sm">{format}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Filters Based on Report Type */}
                    <div className="border-t border-slate-200 pt-6">
                      <h4 className="font-bold text-slate-900 mb-4">Filters</h4>

                      {selectedReportType === 'users' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">User Role</label>
                            <div className="relative">
                              <select
                                value={reportFilters.role}
                                onChange={(e) => setReportFilters({ ...reportFilters, role: e.target.value })}
                                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                              >
                                <option value="all">All Roles</option>
                                <option value="CANDIDATE">Candidates</option>
                                <option value="RECRUITER">Recruiters</option>
                                <option value="ADMIN">Admins</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                          </div>
                          <div>
                            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                checked={reportFilters.includeInactive}
                                onChange={(e) => setReportFilters({ ...reportFilters, includeInactive: e.target.checked })}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                              />
                              <span className="text-sm font-medium text-slate-700">Include inactive users</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {selectedReportType === 'jobs' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Job Status</label>
                            <div className="relative">
                              <select
                                value={reportFilters.status}
                                onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                              >
                                <option value="all">All Status</option>
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                                <option value="DRAFT">Draft</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedReportType === 'applications' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Application Status</label>
                            <div className="relative">
                              <select
                                value={reportFilters.status}
                                onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                              >
                                <option value="all">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="REVIEWING">Reviewing</option>
                                <option value="SHORTLISTED">Shortlisted</option>
                                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="ACCEPTED">Accepted</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedReportType === 'interviews' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Interview Status</label>
                            <div className="relative">
                              <select
                                value={reportFilters.status}
                                onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                              >
                                <option value="all">All Status</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="NO_SHOW">No Show</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Report Description */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                      <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <span>ℹ️</span> About this Report
                      </h5>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {selectedReportType === 'users' && 'Comprehensive user data including profile information, registration dates, and activity metrics.'}
                        {selectedReportType === 'jobs' && 'Detailed job listing data including posting information, applications count, and current status.'}
                        {selectedReportType === 'applications' && 'Application tracking data with candidate information, status history, and timeline metrics.'}
                        {selectedReportType === 'interviews' && 'Interview schedule data including types, feedback, ratings, and completion status.'}
                        {selectedReportType === 'recruiters' && 'Recruiter performance metrics including job postings, application reviews, and hiring success rates.'}
                        {selectedReportType === 'conversion' && 'Funnel analysis showing conversion rates from application to hire across different stages.'}
                      </p>
                    </div>

                    {/* Generate Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                      >
                        {loading ? 'Generating Report...' : 'Generate Report'}
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
                  <h3 className="text-xl font-bold text-slate-900">Report History</h3>
                  <button
                    onClick={loadData}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-slate-600 transition-colors"
                  >
                    Refresh List
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Report Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Format</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Records</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Generated At</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {reportHistory.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                              <p className="text-lg font-medium mb-2">No reports generated yet</p>
                              <p className="text-sm">Generate your first report from the "Generate Report" tab.</p>
                            </td>
                          </tr>
                        ) : (
                          reportHistory.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-bold text-slate-900">{report.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{report.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="uppercase font-bold text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{report.format}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{report.recordsCount || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatDate(report.generatedAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {report.status === 'COMPLETED' && report.fileUrl && (
                                  <a
                                    href={report.fileUrl}
                                    download
                                    className="text-blue-600 hover:text-blue-800 font-bold"
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
              </div>
            )}

            {/* Scheduled Reports Tab */}
            {activeTab === 'scheduled' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Scheduled Reports</h3>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                    Schedule New Report
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Report Type</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Next Run</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Run</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Recipients</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {scheduledReports.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                              <p className="text-lg font-medium mb-2">No scheduled reports</p>
                              <p className="text-sm">Create a schedule to automate report generation.</p>
                            </td>
                          </tr>
                        ) : (
                          scheduledReports.map((scheduled) => (
                            <tr key={scheduled.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-bold text-slate-900">{scheduled.reportType}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{scheduled.frequency}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatDate(scheduled.nextRun)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                {scheduled.lastRun ? formatDate(scheduled.lastRun) : 'Never'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-slate-600">{scheduled.recipients.length} recipients</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {scheduled.isActive ? (
                                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button className="text-blue-600 hover:text-blue-800 font-bold mr-4">Edit</button>
                                <button className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
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
