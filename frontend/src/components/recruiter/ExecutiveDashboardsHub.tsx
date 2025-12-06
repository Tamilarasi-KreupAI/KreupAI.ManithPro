// Batch 31: Executive Dashboards Hub Component (9.2.1-9.2.8)
import React, { useState, useEffect } from 'react';
import {
  ExecutiveDashboard,
  ExecutiveSummary,
  TrendAnalysis,
  ForecastResult,
  IndustryBenchmark,
  BenchmarkComparison,
  DashboardWidget,
  WidgetTemplate,
  ScheduledReport,
  ReportExecution,
  BIExportConfig,
  BIExportLog,
  HiringGoal,
  GoalProgress,
  DepartmentView,
  TeamHiringMetrics,
  DepartmentComparison,
} from '../../types';
import {
  dashboardAPI,
  trendAPI,
  benchmarkAPI,
  widgetAPI,
  reportAPI,
  biExportAPI,
  goalAPI,
  departmentAPI,
  teamAPI,
} from '../../services/batch31ExecutiveDashboardsAPI';

// ==========================================
// Tab Components
// ==========================================

// 9.2.1 Executive Summary Dashboard Tab
const ExecutiveSummaryTab: React.FC = () => {
  const [dashboards, setDashboards] = useState<ExecutiveDashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<ExecutiveDashboard | null>(null);
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardsRes, summaryRes] = await Promise.all([
        dashboardAPI.getDashboards(),
        dashboardAPI.getExecutiveSummary(),
      ]);
      setDashboards(dashboardsRes.dashboards || []);
      setSummary(summaryRes.summary || null);
    } catch (error) {
      console.error('Error loading executive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDashboard = async (data: any) => {
    try {
      await dashboardAPI.createDashboard(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating dashboard:', error);
    }
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;
    try {
      await dashboardAPI.deleteDashboard(dashboardId);
      await loadData();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading executive summary...</div>;
  }

  return (
    <div className="executive-summary-tab">
      <div className="tab-header">
        <h2>Executive Summary Dashboard</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          Create Dashboard
        </button>
      </div>

      {summary && (
        <div className="summary-overview">
          <div className="kpi-grid">
            <div className="kpi-card">
              <h4>Total Hires</h4>
              <span className="kpi-value">{summary.totalHires}</span>
              <span className={`kpi-change ${summary.hiresChange >= 0 ? 'positive' : 'negative'}`}>
                {summary.hiresChange >= 0 ? '+' : ''}{summary.hiresChange}%
              </span>
            </div>
            <div className="kpi-card">
              <h4>Open Positions</h4>
              <span className="kpi-value">{summary.openPositions}</span>
            </div>
            <div className="kpi-card">
              <h4>Avg Time to Hire</h4>
              <span className="kpi-value">{summary.avgTimeToHire} days</span>
            </div>
            <div className="kpi-card">
              <h4>Avg Cost per Hire</h4>
              <span className="kpi-value">${summary.avgCostPerHire?.toLocaleString()}</span>
            </div>
            <div className="kpi-card">
              <h4>Offer Acceptance Rate</h4>
              <span className="kpi-value">{summary.offerAcceptanceRate}%</span>
            </div>
            <div className="kpi-card">
              <h4>Pipeline Health</h4>
              <span className="kpi-value">{summary.pipelineHealth}</span>
            </div>
          </div>
        </div>
      )}

      <div className="dashboards-section">
        <h3>My Dashboards</h3>
        <div className="dashboards-grid">
          {dashboards.map((dashboard) => (
            <div key={dashboard.id} className="dashboard-card">
              <div className="dashboard-header">
                <h4>{dashboard.name}</h4>
                {dashboard.isDefault && <span className="badge default">Default</span>}
              </div>
              <p className="dashboard-description">{dashboard.description}</p>
              <div className="dashboard-meta">
                <span>Type: {dashboard.type}</span>
                <span>{dashboard.widgets?.length || 0} widgets</span>
              </div>
              <div className="dashboard-actions">
                <button onClick={() => setSelectedDashboard(dashboard)} className="btn-secondary">
                  View
                </button>
                <button onClick={() => handleDeleteDashboard(dashboard.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Dashboard</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateDashboard({
                name: formData.get('name'),
                type: formData.get('type'),
                description: formData.get('description'),
                isDefault: formData.get('isDefault') === 'true',
              });
            }}>
              <div className="form-group">
                <label>Name</label>
                <input name="name" type="text" required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" required>
                  <option value="executive">Executive</option>
                  <option value="department">Department</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={3} />
              </div>
              <div className="form-group">
                <label>
                  <input name="isDefault" type="checkbox" value="true" />
                  Set as default dashboard
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.2.2 Trend Analysis Tab
const TrendAnalysisTab: React.FC = () => {
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('hires');
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    loadData();
  }, [selectedMetric, period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trendsRes, forecastRes] = await Promise.all([
        trendAPI.getTrendAnalyses({ metricType: selectedMetric, period }),
        trendAPI.getForecast({ metricType: selectedMetric }),
      ]);
      setTrends(trendsRes.trends || []);
      setForecast(forecastRes.forecast || null);
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnalysis = async () => {
    try {
      await trendAPI.createTrendAnalysis({
        metricType: selectedMetric,
        period,
        dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo: new Date().toISOString(),
      });
      await loadData();
    } catch (error) {
      console.error('Error creating analysis:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading trend analysis...</div>;
  }

  return (
    <div className="trend-analysis-tab">
      <div className="tab-header">
        <h2>Trend Analysis</h2>
        <div className="controls">
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
            <option value="hires">Hires</option>
            <option value="applications">Applications</option>
            <option value="time_to_hire">Time to Hire</option>
            <option value="cost_per_hire">Cost per Hire</option>
            <option value="offer_acceptance">Offer Acceptance</option>
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <button onClick={handleCreateAnalysis} className="btn-primary">
            Run Analysis
          </button>
        </div>
      </div>

      <div className="trends-chart-section">
        <h3>Historical Trends</h3>
        <div className="chart-placeholder">
          {trends.length > 0 ? (
            <div className="trend-data">
              {trends.map((trend, index) => (
                <div key={index} className="trend-point">
                  <span>{trend.period}</span>
                  <span>{trend.trendData?.length || 0} data points</span>
                  <span>Direction: {trend.trendDirection}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No trend data available. Run an analysis to generate trends.</p>
          )}
        </div>
      </div>

      {forecast && (
        <div className="forecast-section">
          <h3>Forecast</h3>
          <div className="forecast-summary">
            <div className="forecast-metric">
              <span className="label">Metric</span>
              <span className="value">{forecast.metricType}</span>
            </div>
            <div className="forecast-metric">
              <span className="label">Forecast Period</span>
              <span className="value">{forecast.forecastPeriod} {forecast.forecastUnit}</span>
            </div>
            <div className="forecast-metric">
              <span className="label">Confidence</span>
              <span className="value">{forecast.confidence}%</span>
            </div>
          </div>
          <div className="forecast-predictions">
            <h4>Predictions</h4>
            {forecast.predictions?.map((pred, index) => (
              <div key={index} className="prediction-item">
                <span>{pred.date}</span>
                <span>{pred.value}</span>
                <span>{pred.lowerBound} - {pred.upperBound}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 9.2.3 Benchmark Comparisons Tab
const BenchmarkComparisonsTab: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<IndustryBenchmark[]>([]);
  const [comparisons, setComparisons] = useState<BenchmarkComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedIndustry]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [benchmarksRes, comparisonsRes] = await Promise.all([
        benchmarkAPI.getIndustryBenchmarks({ industry: selectedIndustry }),
        benchmarkAPI.getBenchmarkComparisons(),
      ]);
      setBenchmarks(benchmarksRes.benchmarks || []);
      setComparisons(comparisonsRes.comparisons || []);
    } catch (error) {
      console.error('Error loading benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunComparison = async (benchmarkId: string) => {
    try {
      await benchmarkAPI.runBenchmarkComparison({
        benchmarkId,
        metrics: ['time_to_hire', 'cost_per_hire', 'offer_acceptance'],
        includeHistorical: true,
      });
      await loadData();
    } catch (error) {
      console.error('Error running comparison:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading benchmarks...</div>;
  }

  return (
    <div className="benchmark-comparisons-tab">
      <div className="tab-header">
        <h2>Industry Benchmarks</h2>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          <option value="">All Industries</option>
          <option value="technology">Technology</option>
          <option value="healthcare">Healthcare</option>
          <option value="finance">Finance</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="retail">Retail</option>
        </select>
      </div>

      <div className="benchmarks-grid">
        {benchmarks.map((benchmark) => (
          <div key={benchmark.id} className="benchmark-card">
            <h4>{benchmark.industry}</h4>
            <p className="company-size">Company Size: {benchmark.companySize}</p>
            <div className="benchmark-metrics">
              <div className="metric">
                <span>Time to Hire</span>
                <span>{benchmark.avgTimeToHire} days</span>
              </div>
              <div className="metric">
                <span>Cost per Hire</span>
                <span>${benchmark.avgCostPerHire?.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span>Offer Acceptance</span>
                <span>{benchmark.offerAcceptanceRate}%</span>
              </div>
              <div className="metric">
                <span>Quality of Hire</span>
                <span>{benchmark.qualityOfHireScore}</span>
              </div>
            </div>
            <button
              onClick={() => handleRunComparison(benchmark.id)}
              className="btn-secondary"
            >
              Compare to Our Metrics
            </button>
          </div>
        ))}
      </div>

      <div className="comparisons-section">
        <h3>Recent Comparisons</h3>
        <div className="comparisons-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Benchmark</th>
                <th>Our Performance</th>
                <th>Variance</th>
                <th>Recommendations</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comparison) => (
                <tr key={comparison.id}>
                  <td>{new Date(comparison.comparisonDate).toLocaleDateString()}</td>
                  <td>{comparison.benchmarkId}</td>
                  <td>
                    {Object.entries(comparison.organizationMetrics || {}).map(([key, value]) => (
                      <div key={key}>{key}: {String(value)}</div>
                    ))}
                  </td>
                  <td>
                    {Object.entries(comparison.variance || {}).map(([key, value]) => (
                      <div key={key} className={Number(value) >= 0 ? 'positive' : 'negative'}>
                        {key}: {Number(value) >= 0 ? '+' : ''}{String(value)}%
                      </div>
                    ))}
                  </td>
                  <td>
                    {comparison.recommendations?.slice(0, 2).map((rec, i) => (
                      <div key={i}>{rec}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 9.2.4 Custom Dashboard Builder Tab
const DashboardBuilderTab: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [templates, setTemplates] = useState<WidgetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWidget, setShowAddWidget] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [widgetsRes, templatesRes] = await Promise.all([
        widgetAPI.getWidgets(),
        widgetAPI.getWidgetTemplates(),
      ]);
      setWidgets(widgetsRes.widgets || []);
      setTemplates(templatesRes.templates || []);
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWidget = async (template: WidgetTemplate) => {
    try {
      await widgetAPI.createWidget({
        dashboardId: 'default',
        name: template.name,
        type: template.type,
        config: template.defaultConfig,
      });
      await loadData();
      setShowAddWidget(false);
    } catch (error) {
      console.error('Error adding widget:', error);
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('Delete this widget?')) return;
    try {
      await widgetAPI.deleteWidget(widgetId);
      await loadData();
    } catch (error) {
      console.error('Error deleting widget:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard builder...</div>;
  }

  return (
    <div className="dashboard-builder-tab">
      <div className="tab-header">
        <h2>Custom Dashboard Builder</h2>
        <button onClick={() => setShowAddWidget(true)} className="btn-primary">
          Add Widget
        </button>
      </div>

      <div className="widgets-canvas">
        <h3>Dashboard Widgets</h3>
        <div className="widgets-grid">
          {widgets.map((widget) => (
            <div key={widget.id} className="widget-card" style={{
              gridColumn: `span ${widget.size?.width || 1}`,
              gridRow: `span ${widget.size?.height || 1}`,
            }}>
              <div className="widget-header">
                <h4>{widget.name}</h4>
                <div className="widget-actions">
                  <button onClick={() => handleDeleteWidget(widget.id)}>×</button>
                </div>
              </div>
              <div className="widget-content">
                <span className="widget-type">{widget.type}</span>
                <p>Data Source: {widget.config?.dataSource || 'Default'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddWidget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Widget</h3>
            <div className="templates-grid">
              {templates.map((template) => (
                <div key={template.id} className="template-card">
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <span className="template-category">{template.category}</span>
                  <button
                    onClick={() => handleAddWidget(template)}
                    className="btn-primary"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAddWidget(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.2.5 Scheduled Reports Tab
const ScheduledReportsTab: React.FC = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const reportsRes = await reportAPI.getScheduledReports();
      setReports(reportsRes.reports || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewExecutions = async (reportId: string) => {
    try {
      const res = await reportAPI.getReportExecutions(reportId);
      setExecutions(res.executions || []);
      const report = reports.find(r => r.id === reportId);
      setSelectedReport(report || null);
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  };

  const handleRunNow = async (reportId: string) => {
    try {
      await reportAPI.runReportNow(reportId);
      alert('Report execution started');
      if (selectedReport?.id === reportId) {
        await handleViewExecutions(reportId);
      }
    } catch (error) {
      console.error('Error running report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Delete this scheduled report?')) return;
    try {
      await reportAPI.deleteScheduledReport(reportId);
      await loadData();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleCreateReport = async (data: any) => {
    try {
      await reportAPI.createScheduledReport(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading scheduled reports...</div>;
  }

  return (
    <div className="scheduled-reports-tab">
      <div className="tab-header">
        <h2>Scheduled Reports</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          Create Report
        </button>
      </div>

      <div className="reports-list">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <h4>{report.name}</h4>
              <span className={`status-badge ${report.isActive ? 'active' : 'inactive'}`}>
                {report.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="report-description">{report.description}</p>
            <div className="report-details">
              <span>Type: {report.reportType}</span>
              <span>Frequency: {report.frequency}</span>
              <span>Format: {report.format}</span>
              <span>Recipients: {report.recipients?.length || 0}</span>
              {report.lastRunAt && (
                <span>Last Run: {new Date(report.lastRunAt).toLocaleString()}</span>
              )}
              {report.nextRunAt && (
                <span>Next Run: {new Date(report.nextRunAt).toLocaleString()}</span>
              )}
            </div>
            <div className="report-actions">
              <button onClick={() => handleRunNow(report.id)} className="btn-secondary">
                Run Now
              </button>
              <button onClick={() => handleViewExecutions(report.id)} className="btn-secondary">
                View History
              </button>
              <button onClick={() => handleDeleteReport(report.id)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="executions-section">
          <h3>Execution History: {selectedReport.name}</h3>
          <button onClick={() => setSelectedReport(null)}>Close</button>
          <table className="executions-table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Completed</th>
                <th>Status</th>
                <th>Duration</th>
                <th>File Size</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((exec) => (
                <tr key={exec.id}>
                  <td>{new Date(exec.startedAt).toLocaleString()}</td>
                  <td>{exec.completedAt ? new Date(exec.completedAt).toLocaleString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${exec.status}`}>{exec.status}</span>
                  </td>
                  <td>{exec.executionTime ? `${exec.executionTime}s` : '-'}</td>
                  <td>{exec.fileSize ? `${(exec.fileSize / 1024).toFixed(1)} KB` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Scheduled Report</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateReport({
                name: formData.get('name'),
                reportType: formData.get('reportType'),
                frequency: formData.get('frequency'),
                format: formData.get('format'),
                description: formData.get('description'),
                recipients: [{ email: formData.get('recipientEmail'), type: 'to' }],
                schedule: { time: formData.get('scheduleTime') },
              });
            }}>
              <div className="form-group">
                <label>Report Name</label>
                <input name="name" type="text" required />
              </div>
              <div className="form-group">
                <label>Report Type</label>
                <select name="reportType" required>
                  <option value="executive_summary">Executive Summary</option>
                  <option value="recruitment_metrics">Recruitment Metrics</option>
                  <option value="pipeline_status">Pipeline Status</option>
                  <option value="diversity_report">Diversity Report</option>
                </select>
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select name="frequency" required>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Format</label>
                <select name="format" required>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="form-group">
                <label>Recipient Email</label>
                <input name="recipientEmail" type="email" required />
              </div>
              <div className="form-group">
                <label>Schedule Time</label>
                <input name="scheduleTime" type="time" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={2} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.2.6 BI Tool Export Tab
const BIToolExportTab: React.FC = () => {
  const [configs, setConfigs] = useState<BIExportConfig[]>([]);
  const [logs, setLogs] = useState<BIExportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<BIExportConfig | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await biExportAPI.getBIConfigs();
      setConfigs(res.configs || []);
    } catch (error) {
      console.error('Error loading BI configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (configId: string) => {
    try {
      const res = await biExportAPI.testBIConnection(configId);
      alert(res.success ? 'Connection successful!' : `Connection failed: ${res.error}`);
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Connection test failed');
    }
  };

  const handleTriggerExport = async (configId: string) => {
    try {
      await biExportAPI.triggerBIExport(configId);
      alert('Export triggered successfully');
    } catch (error) {
      console.error('Error triggering export:', error);
    }
  };

  const handleViewLogs = async (configId: string) => {
    try {
      const res = await biExportAPI.getBIExportLogs(configId);
      setLogs(res.logs || []);
      const config = configs.find(c => c.id === configId);
      setSelectedConfig(config || null);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Delete this BI configuration?')) return;
    try {
      await biExportAPI.deleteBIConfig(configId);
      await loadData();
    } catch (error) {
      console.error('Error deleting config:', error);
    }
  };

  const handleCreateConfig = async (data: any) => {
    try {
      await biExportAPI.createBIConfig(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating config:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading BI configurations...</div>;
  }

  return (
    <div className="bi-export-tab">
      <div className="tab-header">
        <h2>BI Tool Integrations</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          Add Integration
        </button>
      </div>

      <div className="bi-configs-grid">
        {configs.map((config) => (
          <div key={config.id} className="bi-config-card">
            <div className="config-header">
              <h4>{config.name}</h4>
              <span className={`status-badge ${config.isActive ? 'active' : 'inactive'}`}>
                {config.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="config-tool">
              <span className="tool-type">{config.toolType}</span>
            </div>
            <div className="config-details">
              <span>Sync: {config.syncFrequency || 'Manual'}</span>
              {config.lastSyncAt && (
                <span>Last Sync: {new Date(config.lastSyncAt).toLocaleString()}</span>
              )}
              {config.lastSyncStatus && (
                <span>Status: {config.lastSyncStatus}</span>
              )}
            </div>
            <div className="config-actions">
              <button onClick={() => handleTestConnection(config.id)} className="btn-secondary">
                Test Connection
              </button>
              <button onClick={() => handleTriggerExport(config.id)} className="btn-secondary">
                Sync Now
              </button>
              <button onClick={() => handleViewLogs(config.id)} className="btn-secondary">
                View Logs
              </button>
              <button onClick={() => handleDeleteConfig(config.id)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedConfig && (
        <div className="logs-section">
          <h3>Export Logs: {selectedConfig.name}</h3>
          <button onClick={() => setSelectedConfig(null)}>Close</button>
          <table className="logs-table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Completed</th>
                <th>Status</th>
                <th>Records</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.startedAt).toLocaleString()}</td>
                  <td>{log.completedAt ? new Date(log.completedAt).toLocaleString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${log.status}`}>{log.status}</span>
                  </td>
                  <td>{log.recordsExported || 0}</td>
                  <td>{log.errorMessage || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add BI Integration</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateConfig({
                name: formData.get('name'),
                toolType: formData.get('toolType'),
                syncFrequency: formData.get('syncFrequency'),
                connectionSettings: {
                  host: formData.get('host'),
                  apiKey: formData.get('apiKey'),
                },
              });
            }}>
              <div className="form-group">
                <label>Integration Name</label>
                <input name="name" type="text" required />
              </div>
              <div className="form-group">
                <label>BI Tool</label>
                <select name="toolType" required>
                  <option value="tableau">Tableau</option>
                  <option value="looker">Looker</option>
                  <option value="power_bi">Power BI</option>
                  <option value="metabase">Metabase</option>
                </select>
              </div>
              <div className="form-group">
                <label>Host/URL</label>
                <input name="host" type="text" required />
              </div>
              <div className="form-group">
                <label>API Key</label>
                <input name="apiKey" type="password" required />
              </div>
              <div className="form-group">
                <label>Sync Frequency</label>
                <select name="syncFrequency">
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.2.7 Goal Tracking Tab
const GoalTrackingTab: React.FC = () => {
  const [goals, setGoals] = useState<HiringGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<HiringGoal | null>(null);
  const [progress, setProgress] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await goalAPI.getHiringGoals();
      setGoals(res.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgress = async (goalId: string) => {
    try {
      const res = await goalAPI.getGoalProgress(goalId);
      setProgress(res.progress || []);
      const goal = goals.find(g => g.id === goalId);
      setSelectedGoal(goal || null);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleRecordProgress = async (goalId: string, value: number, notes: string) => {
    try {
      await goalAPI.recordGoalProgress(goalId, { value, notes });
      await handleViewProgress(goalId);
      await loadData();
    } catch (error) {
      console.error('Error recording progress:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await goalAPI.deleteHiringGoal(goalId);
      await loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleCreateGoal = async (data: any) => {
    try {
      await goalAPI.createHiringGoal(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const calculateProgress = (goal: HiringGoal) => {
    if (!goal.targetValue) return 0;
    return Math.round((goal.currentValue / goal.targetValue) * 100);
  };

  if (loading) {
    return <div className="loading-spinner">Loading goals...</div>;
  }

  return (
    <div className="goal-tracking-tab">
      <div className="tab-header">
        <h2>Hiring Goals</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          Create Goal
        </button>
      </div>

      <div className="goals-grid">
        {goals.map((goal) => (
          <div key={goal.id} className="goal-card">
            <div className="goal-header">
              <h4>{goal.name}</h4>
              <span className={`status-badge ${goal.status}`}>{goal.status}</span>
            </div>
            <p className="goal-description">{goal.description}</p>
            <div className="goal-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${calculateProgress(goal)}%` }}
                />
              </div>
              <span className="progress-text">
                {goal.currentValue} / {goal.targetValue} ({calculateProgress(goal)}%)
              </span>
            </div>
            <div className="goal-details">
              <span>Type: {goal.type}</span>
              <span>Start: {new Date(goal.startDate).toLocaleDateString()}</span>
              <span>End: {new Date(goal.endDate).toLocaleDateString()}</span>
            </div>
            {goal.milestones && goal.milestones.length > 0 && (
              <div className="goal-milestones">
                <h5>Milestones</h5>
                {goal.milestones.map((milestone: any, index: number) => (
                  <div key={index} className={`milestone ${milestone.achieved ? 'achieved' : ''}`}>
                    <span>{milestone.name}</span>
                    <span>{milestone.targetValue}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="goal-actions">
              <button onClick={() => handleViewProgress(goal.id)} className="btn-secondary">
                View Progress
              </button>
              <button onClick={() => handleDeleteGoal(goal.id)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedGoal && (
        <div className="progress-section">
          <h3>Progress History: {selectedGoal.name}</h3>
          <button onClick={() => setSelectedGoal(null)}>Close</button>
          <div className="record-progress">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleRecordProgress(
                selectedGoal.id,
                Number(formData.get('value')),
                formData.get('notes') as string
              );
              e.currentTarget.reset();
            }}>
              <input name="value" type="number" placeholder="Value" required />
              <input name="notes" type="text" placeholder="Notes" />
              <button type="submit" className="btn-primary">Record Progress</button>
            </form>
          </div>
          <table className="progress-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Value</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.recordedAt).toLocaleString()}</td>
                  <td>{p.value}</td>
                  <td>{p.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Hiring Goal</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateGoal({
                name: formData.get('name'),
                type: formData.get('type'),
                targetValue: Number(formData.get('targetValue')),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                description: formData.get('description'),
              });
            }}>
              <div className="form-group">
                <label>Goal Name</label>
                <input name="name" type="text" required />
              </div>
              <div className="form-group">
                <label>Goal Type</label>
                <select name="type" required>
                  <option value="hiring_count">Hiring Count</option>
                  <option value="time_to_hire">Time to Hire</option>
                  <option value="cost_per_hire">Cost per Hire</option>
                  <option value="diversity">Diversity</option>
                  <option value="quality">Quality of Hire</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Value</label>
                <input name="targetValue" type="number" required />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input name="startDate" type="date" required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input name="endDate" type="date" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={2} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.2.8 Department/Team Views Tab
const DepartmentTeamViewsTab: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentView[]>([]);
  const [teams, setTeams] = useState<TeamHiringMetrics[]>([]);
  const [comparison, setComparison] = useState<DepartmentComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptRes, teamRes] = await Promise.all([
        departmentAPI.getDepartmentViews({ includeMetrics: true }),
        teamAPI.getTeamMetrics(),
      ]);
      setDepartments(deptRes.departments || []);
      setTeams(teamRes.teams || []);
    } catch (error) {
      console.error('Error loading department data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareDepartments = async () => {
    if (selectedDepartments.length < 2) {
      alert('Select at least 2 departments to compare');
      return;
    }
    try {
      const res = await departmentAPI.compareDepartments({
        departmentIds: selectedDepartments,
        metrics: ['hires', 'time_to_hire', 'cost_per_hire', 'pipeline'],
      });
      setComparison(res.comparison || null);
    } catch (error) {
      console.error('Error comparing departments:', error);
    }
  };

  const toggleDepartmentSelection = (deptId: string) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  if (loading) {
    return <div className="loading-spinner">Loading department views...</div>;
  }

  return (
    <div className="department-team-views-tab">
      <div className="tab-header">
        <h2>Department & Team Views</h2>
        <button
          onClick={handleCompareDepartments}
          className="btn-primary"
          disabled={selectedDepartments.length < 2}
        >
          Compare Selected ({selectedDepartments.length})
        </button>
      </div>

      <div className="departments-section">
        <h3>Departments</h3>
        <div className="departments-grid">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className={`department-card ${selectedDepartments.includes(dept.id) ? 'selected' : ''}`}
              onClick={() => toggleDepartmentSelection(dept.id)}
            >
              <div className="dept-header">
                <h4>{dept.name}</h4>
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(dept.id)}
                  onChange={() => {}}
                />
              </div>
              <div className="dept-metrics">
                <div className="metric">
                  <span>Total Hires</span>
                  <span>{dept.totalHires}</span>
                </div>
                <div className="metric">
                  <span>Open Positions</span>
                  <span>{dept.openPositions}</span>
                </div>
                <div className="metric">
                  <span>Avg Time to Hire</span>
                  <span>{dept.avgTimeToHire} days</span>
                </div>
                <div className="metric">
                  <span>Avg Cost per Hire</span>
                  <span>${dept.avgCostPerHire?.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span>Active Candidates</span>
                  <span>{dept.activeCandidates}</span>
                </div>
                <div className="metric">
                  <span>Fill Rate</span>
                  <span>{dept.fillRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {comparison && (
        <div className="comparison-section">
          <h3>Department Comparison</h3>
          <button onClick={() => setComparison(null)}>Close</button>
          <div className="comparison-chart">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  {comparison.departments?.map((dept: any) => (
                    <th key={dept.id}>{dept.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.metrics?.map((metric: any) => (
                  <tr key={metric.name}>
                    <td>{metric.name}</td>
                    {metric.values?.map((value: any, index: number) => (
                      <td key={index}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {comparison.insights && (
            <div className="comparison-insights">
              <h4>Insights</h4>
              <ul>
                {comparison.insights.map((insight: string, index: number) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="teams-section">
        <h3>Team Metrics</h3>
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <h4>{team.teamName}</h4>
              <div className="team-metrics">
                <div className="metric">
                  <span>Team Lead</span>
                  <span>{team.teamLead || 'N/A'}</span>
                </div>
                <div className="metric">
                  <span>Total Hires</span>
                  <span>{team.totalHires}</span>
                </div>
                <div className="metric">
                  <span>Open Positions</span>
                  <span>{team.openPositions}</span>
                </div>
                <div className="metric">
                  <span>Avg Time to Hire</span>
                  <span>{team.avgTimeToHire} days</span>
                </div>
                <div className="metric">
                  <span>Active Candidates</span>
                  <span>{team.activeCandidates}</span>
                </div>
                <div className="metric">
                  <span>Pending Interviews</span>
                  <span>{team.pendingInterviews}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Main Hub Component
// ==========================================

const ExecutiveDashboardsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = [
    { id: 'summary', label: 'Executive Summary', component: ExecutiveSummaryTab },
    { id: 'trends', label: 'Trend Analysis', component: TrendAnalysisTab },
    { id: 'benchmarks', label: 'Benchmarks', component: BenchmarkComparisonsTab },
    { id: 'builder', label: 'Dashboard Builder', component: DashboardBuilderTab },
    { id: 'reports', label: 'Scheduled Reports', component: ScheduledReportsTab },
    { id: 'bi-export', label: 'BI Integrations', component: BIToolExportTab },
    { id: 'goals', label: 'Goal Tracking', component: GoalTrackingTab },
    { id: 'departments', label: 'Departments & Teams', component: DepartmentTeamViewsTab },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ExecutiveSummaryTab;

  return (
    <div className="executive-dashboards-hub">
      <div className="hub-header">
        <h1>Executive Dashboards</h1>
        <p>Comprehensive executive-level analytics, insights, and reporting</p>
      </div>

      <div className="hub-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default ExecutiveDashboardsHub;
