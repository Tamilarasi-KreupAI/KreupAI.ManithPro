// Batch 32: Market Intelligence Hub Component (9.3.1-9.3.6)
import React, { useState, useEffect } from 'react';
import {
  SalaryMarketData,
  SalaryComparison,
  SalaryTrend,
  TalentPoolAnalysis,
  CompetitorInsight,
  SkillDemandTrend,
  EmergingSkill,
  LocationIntelligence,
  RemoteWorkTrends,
  IndustryTrend,
  MarketIntelligenceDashboard,
} from '../../types';
import {
  salaryAPI,
  talentPoolAPI,
  competitorAPI,
  skillsAPI,
  locationAPI,
  industryAPI,
  dashboardAPI,
} from '../../services/batch32MarketIntelligenceAPI';

// ==========================================
// Tab Components
// ==========================================

// 9.3.1 Salary Market Data Tab
const SalaryMarketDataTab: React.FC = () => {
  const [salaryData, setSalaryData] = useState<SalaryMarketData[]>([]);
  const [comparison, setComparison] = useState<SalaryComparison | null>(null);
  const [trends, setTrends] = useState<SalaryTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salaryRes, comparisonRes, trendsRes] = await Promise.all([
        salaryAPI.getSalaryMarketData(),
        salaryAPI.getSalaryComparison(),
        salaryAPI.getSalaryTrends(),
      ]);
      setSalaryData(salaryRes.salaryData || []);
      setComparison(comparisonRes.comparison || null);
      setTrends(trendsRes.trends || null);
    } catch (error) {
      console.error('Error loading salary data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading salary data...</div>;
  }

  return (
    <div className="salary-market-data-tab">
      <div className="tab-header">
        <h2>Salary Market Data</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Job Title"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          />
          <button onClick={loadData} className="btn-primary">Search</button>
        </div>
      </div>

      <div className="salary-cards-grid">
        {salaryData.map((salary) => (
          <div key={salary.id} className="salary-card">
            <div className="salary-header">
              <h4>{salary.jobTitle}</h4>
              <span className="level-badge">{salary.level}</span>
            </div>
            <p className="location">{salary.location}</p>
            <div className="salary-range">
              <div className="range-bar">
                <span className="min">${(salary.minSalary / 1000).toFixed(0)}K</span>
                <span className="median">${(salary.medianSalary / 1000).toFixed(0)}K</span>
                <span className="max">${(salary.maxSalary / 1000).toFixed(0)}K</span>
              </div>
            </div>
            <div className="salary-details">
              <div className="detail">
                <span>25th Percentile</span>
                <span>${salary.percentile25?.toLocaleString()}</span>
              </div>
              <div className="detail">
                <span>75th Percentile</span>
                <span>${salary.percentile75?.toLocaleString()}</span>
              </div>
              {salary.bonusMedian && (
                <div className="detail">
                  <span>Bonus (Median)</span>
                  <span>${salary.bonusMedian?.toLocaleString()}</span>
                </div>
              )}
              {salary.equityMedian && (
                <div className="detail">
                  <span>Equity (Median)</span>
                  <span>${salary.equityMedian?.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="salary-meta">
              <span>Source: {salary.dataSource}</span>
              <span>Sample: {salary.sampleSize?.toLocaleString()}</span>
              {salary.trendDirection && (
                <span className={`trend ${salary.trendDirection}`}>
                  {salary.trendDirection === 'increasing' ? '↑' : salary.trendDirection === 'decreasing' ? '↓' : '→'}
                  {salary.trendPercentage}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {comparison && (
        <div className="comparison-section">
          <h3>Your Compensation vs Market</h3>
          <div className="comparison-grid">
            <div className="comparison-column">
              <h4>Your Range</h4>
              <p>Min: ${comparison.organizationSalary.min.toLocaleString()}</p>
              <p>Median: ${comparison.organizationSalary.median.toLocaleString()}</p>
              <p>Max: ${comparison.organizationSalary.max.toLocaleString()}</p>
            </div>
            <div className="comparison-column">
              <h4>Market Range</h4>
              <p>Min: ${comparison.marketSalary.min.toLocaleString()}</p>
              <p>Median: ${comparison.marketSalary.median.toLocaleString()}</p>
              <p>Max: ${comparison.marketSalary.max.toLocaleString()}</p>
            </div>
            <div className="comparison-column variance">
              <h4>Variance</h4>
              <p className={comparison.variance.minVariance >= 0 ? 'positive' : 'negative'}>
                Min: {comparison.variance.minVariance}%
              </p>
              <p className={comparison.variance.medianVariance >= 0 ? 'positive' : 'negative'}>
                Median: {comparison.variance.medianVariance}%
              </p>
              <p className={comparison.variance.maxVariance >= 0 ? 'positive' : 'negative'}>
                Max: {comparison.variance.maxVariance}%
              </p>
            </div>
          </div>
          <div className="recommendations">
            <h4>Recommendations</h4>
            <ul>
              {comparison.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {trends && (
        <div className="trends-section">
          <h3>Salary Trends - {trends.jobTitle}</h3>
          <div className="trends-summary">
            <span>Overall Change: {trends.overallChange}%</span>
            <span>Avg Monthly: {trends.averageMonthlyChange}%</span>
          </div>
          <div className="forecast">
            <h4>Forecast</h4>
            <p>Next Quarter: ${trends.forecast.nextQuarter.toLocaleString()}</p>
            <p>Next Year: ${trends.forecast.nextYear.toLocaleString()}</p>
            <p>Confidence: {(trends.forecast.confidence * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.3.2 Talent Pool Analysis Tab
const TalentPoolAnalysisTab: React.FC = () => {
  const [analyses, setAnalyses] = useState<TalentPoolAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<TalentPoolAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await talentPoolAPI.getTalentPoolAnalyses();
      setAnalyses(res.analyses || []);
    } catch (error) {
      console.error('Error loading talent pool analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnalysis = async (data: any) => {
    try {
      await talentPoolAPI.createTalentPoolAnalysis(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating analysis:', error);
    }
  };

  const handleViewDetails = async (analysisId: string) => {
    try {
      const res = await talentPoolAPI.getTalentPoolAnalysis(analysisId);
      setSelectedAnalysis(res.analysis || null);
    } catch (error) {
      console.error('Error loading analysis details:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading talent pool analyses...</div>;
  }

  return (
    <div className="talent-pool-analysis-tab">
      <div className="tab-header">
        <h2>Talent Pool Analysis</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          New Analysis
        </button>
      </div>

      <div className="analyses-grid">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="analysis-card">
            <div className="analysis-header">
              <h4>{analysis.analysisName}</h4>
              <span className={`status-badge ${analysis.status}`}>{analysis.status}</span>
            </div>
            <p className="analysis-type">Type: {analysis.analysisType}</p>
            <div className="analysis-criteria">
              {analysis.targetSkills && (
                <div className="criteria">
                  <span>Skills:</span>
                  <span>{analysis.targetSkills.join(', ')}</span>
                </div>
              )}
              {analysis.targetLocations && (
                <div className="criteria">
                  <span>Locations:</span>
                  <span>{analysis.targetLocations.join(', ')}</span>
                </div>
              )}
            </div>
            {analysis.status === 'completed' && (
              <div className="analysis-results">
                <div className="result">
                  <span>Total Candidates</span>
                  <span>{analysis.totalCandidates?.toLocaleString()}</span>
                </div>
                <div className="result">
                  <span>Qualified</span>
                  <span>{analysis.qualifiedCandidates?.toLocaleString()}</span>
                </div>
                <div className="result">
                  <span>Active Seekers</span>
                  <span>{analysis.activeJobSeekers?.toLocaleString()}</span>
                </div>
                <div className="result">
                  <span>Availability Score</span>
                  <span>{analysis.availabilityScore}</span>
                </div>
                <div className="result">
                  <span>Competition</span>
                  <span>{analysis.competitionLevel}</span>
                </div>
              </div>
            )}
            <button onClick={() => handleViewDetails(analysis.id)} className="btn-secondary">
              View Details
            </button>
          </div>
        ))}
      </div>

      {selectedAnalysis && (
        <div className="analysis-details-modal">
          <div className="modal-content large">
            <h3>{selectedAnalysis.analysisName}</h3>
            <button onClick={() => setSelectedAnalysis(null)}>Close</button>

            {selectedAnalysis.skillDistribution && (
              <div className="distribution-section">
                <h4>Skill Distribution</h4>
                <div className="distribution-bars">
                  {Object.entries(selectedAnalysis.skillDistribution).map(([skill, count]) => (
                    <div key={skill} className="bar-item">
                      <span>{skill}</span>
                      <div className="bar" style={{ width: `${(count / Math.max(...Object.values(selectedAnalysis.skillDistribution!))) * 100}%` }} />
                      <span>{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAnalysis.recommendations && (
              <div className="recommendations-section">
                <h4>Recommendations</h4>
                <ul>
                  {selectedAnalysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Talent Pool Analysis</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateAnalysis({
                analysisName: formData.get('analysisName'),
                analysisType: formData.get('analysisType'),
                targetSkills: (formData.get('targetSkills') as string)?.split(',').map(s => s.trim()),
                targetLocations: (formData.get('targetLocations') as string)?.split(',').map(s => s.trim()),
                experienceRange: {
                  min: Number(formData.get('expMin')),
                  max: Number(formData.get('expMax')),
                },
              });
            }}>
              <div className="form-group">
                <label>Analysis Name</label>
                <input name="analysisName" type="text" required />
              </div>
              <div className="form-group">
                <label>Analysis Type</label>
                <select name="analysisType" required>
                  <option value="skill_based">Skill Based</option>
                  <option value="location_based">Location Based</option>
                  <option value="experience_based">Experience Based</option>
                  <option value="combined">Combined</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Skills (comma-separated)</label>
                <input name="targetSkills" type="text" placeholder="React, TypeScript, Node.js" />
              </div>
              <div className="form-group">
                <label>Target Locations (comma-separated)</label>
                <input name="targetLocations" type="text" placeholder="San Francisco, Remote" />
              </div>
              <div className="form-group form-row">
                <div>
                  <label>Min Experience</label>
                  <input name="expMin" type="number" placeholder="3" />
                </div>
                <div>
                  <label>Max Experience</label>
                  <input name="expMax" type="number" placeholder="8" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Analysis</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.3.3 Competitor Insights Tab
const CompetitorInsightsTab: React.FC = () => {
  const [competitors, setCompetitors] = useState<CompetitorInsight[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await competitorAPI.getCompetitorInsights();
      setCompetitors(res.competitors || []);
    } catch (error) {
      console.error('Error loading competitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async (data: any) => {
    try {
      await competitorAPI.addCompetitor(data);
      await loadData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding competitor:', error);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    if (!confirm('Stop tracking this competitor?')) return;
    try {
      await competitorAPI.deleteCompetitor(competitorId);
      await loadData();
    } catch (error) {
      console.error('Error deleting competitor:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading competitor insights...</div>;
  }

  return (
    <div className="competitor-insights-tab">
      <div className="tab-header">
        <h2>Competitor Hiring Insights</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          Add Competitor
        </button>
      </div>

      <div className="competitors-grid">
        {competitors.map((competitor) => (
          <div key={competitor.id} className="competitor-card">
            <div className="competitor-header">
              <h4>{competitor.competitorName}</h4>
              <span className={`velocity-badge ${competitor.hiringVelocity}`}>
                {competitor.hiringVelocity}
              </span>
            </div>
            <p className="domain">{competitor.competitorDomain}</p>

            <div className="job-breakdown">
              <h5>Job Postings</h5>
              <div className="job-stats">
                <div className="stat">
                  <span>Total</span>
                  <span>{competitor.totalJobPostings}</span>
                </div>
                <div className="stat">
                  <span>Active</span>
                  <span>{competitor.activeJobPostings}</span>
                </div>
                <div className="stat">
                  <span>Closed</span>
                  <span>{competitor.closedJobPostings}</span>
                </div>
              </div>
              <div className="department-breakdown">
                <div className="dept">Engineering: {competitor.engineeringJobs}</div>
                <div className="dept">Sales: {competitor.salesJobs}</div>
                <div className="dept">Marketing: {competitor.marketingJobs}</div>
                <div className="dept">Operations: {competitor.operationsJobs}</div>
              </div>
            </div>

            <div className="skills-section">
              <h5>Top Skills</h5>
              <div className="skills-tags">
                {competitor.topSkills?.slice(0, 5).map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
              {competitor.emergingSkills && competitor.emergingSkills.length > 0 && (
                <>
                  <h5>Emerging Skills</h5>
                  <div className="skills-tags emerging">
                    {competitor.emergingSkills.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="competitor-meta">
              <span>Remote: {competitor.remoteRatio}%</span>
              <span className={`growth ${competitor.growthTrend}`}>
                Growth: {competitor.growthTrend} ({competitor.growthRate}%)
              </span>
            </div>

            <div className="competitor-actions">
              <button onClick={() => setSelectedCompetitor(competitor)} className="btn-secondary">
                View Details
              </button>
              <button onClick={() => handleDeleteCompetitor(competitor.id)} className="btn-danger">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Competitor to Track</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddCompetitor({
                competitorName: formData.get('competitorName'),
                competitorDomain: formData.get('competitorDomain'),
                industry: formData.get('industry'),
                companySize: formData.get('companySize'),
              });
            }}>
              <div className="form-group">
                <label>Company Name</label>
                <input name="competitorName" type="text" required />
              </div>
              <div className="form-group">
                <label>Domain</label>
                <input name="competitorDomain" type="text" placeholder="company.com" />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <select name="industry">
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail">Retail</option>
                </select>
              </div>
              <div className="form-group">
                <label>Company Size</label>
                <select name="companySize">
                  <option value="startup">Startup</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Competitor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.3.4 Skills Demand Trends Tab
const SkillsDemandTrendsTab: React.FC = () => {
  const [trends, setTrends] = useState<SkillDemandTrend[]>([]);
  const [emergingSkills, setEmergingSkills] = useState<EmergingSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trendsRes, emergingRes] = await Promise.all([
        skillsAPI.getSkillsDemandTrends({ skillCategory: selectedCategory }),
        skillsAPI.getEmergingSkills({ limit: 10 }),
      ]);
      setTrends(trendsRes.trends || []);
      setEmergingSkills(emergingRes.emergingSkills || []);
    } catch (error) {
      console.error('Error loading skills trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading skills demand trends...</div>;
  }

  return (
    <div className="skills-demand-trends-tab">
      <div className="tab-header">
        <h2>Skills Demand Trends</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="technical">Technical</option>
          <option value="soft">Soft Skills</option>
          <option value="industry_specific">Industry Specific</option>
          <option value="certification">Certifications</option>
        </select>
      </div>

      <div className="emerging-skills-section">
        <h3>Emerging Skills</h3>
        <div className="emerging-skills-grid">
          {emergingSkills.map((skill, index) => (
            <div key={skill.skillName} className="emerging-skill-card">
              <span className="rank">#{index + 1}</span>
              <h4>{skill.skillName}</h4>
              <div className="skill-stats">
                <span className="growth">↑ {skill.growthRate}%</span>
                <span className="demand">Demand: {skill.demandScore}</span>
              </div>
              <span className="category">{skill.category}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="skills-trends-list">
        <h3>All Skills Trends</h3>
        <div className="trends-grid">
          {trends.map((trend) => (
            <div key={trend.id} className="trend-card">
              <div className="trend-header">
                <h4>{trend.skillName}</h4>
                <span className={`trend-direction ${trend.trendDirection}`}>
                  {trend.trendDirection}
                </span>
              </div>
              <div className="trend-metrics">
                <div className="metric">
                  <span>Demand Score</span>
                  <span className="value">{trend.demandScore}</span>
                </div>
                <div className="metric">
                  <span>Growth Rate</span>
                  <span className="value">{trend.growthRate}%</span>
                </div>
                <div className="metric">
                  <span>Job Postings</span>
                  <span className="value">{trend.jobPostingCount?.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span>Salary Premium</span>
                  <span className="value">+{trend.salaryPremium}%</span>
                </div>
              </div>
              {trend.relatedSkills && (
                <div className="related-skills">
                  <span>Related:</span>
                  {trend.relatedSkills.slice(0, 3).map((skill) => (
                    <span key={skill} className="related-skill">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 9.3.5 Location Intelligence Tab
const LocationIntelligenceTab: React.FC = () => {
  const [locations, setLocations] = useState<LocationIntelligence[]>([]);
  const [remoteTrends, setRemoteTrends] = useState<RemoteWorkTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locationsRes, remoteRes] = await Promise.all([
        locationAPI.getLocationIntelligence(),
        locationAPI.getRemoteWorkTrends(),
      ]);
      setLocations(locationsRes.locations || []);
      setRemoteTrends(remoteRes.trends || null);
    } catch (error) {
      console.error('Error loading location intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLocation = (locationName: string) => {
    setSelectedLocations(prev =>
      prev.includes(locationName)
        ? prev.filter(l => l !== locationName)
        : [...prev, locationName]
    );
  };

  const handleCompare = async () => {
    if (selectedLocations.length < 2) {
      alert('Select at least 2 locations to compare');
      return;
    }
    try {
      const res = await locationAPI.compareLocations({ locations: selectedLocations });
      console.log('Comparison:', res.comparison);
    } catch (error) {
      console.error('Error comparing locations:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading location intelligence...</div>;
  }

  return (
    <div className="location-intelligence-tab">
      <div className="tab-header">
        <h2>Location Intelligence</h2>
        <button
          onClick={handleCompare}
          className="btn-primary"
          disabled={selectedLocations.length < 2}
        >
          Compare ({selectedLocations.length})
        </button>
      </div>

      <div className="locations-grid">
        {locations.map((location) => (
          <div
            key={location.id}
            className={`location-card ${selectedLocations.includes(location.locationName) ? 'selected' : ''}`}
            onClick={() => toggleLocation(location.locationName)}
          >
            <div className="location-header">
              <h4>{location.locationName}</h4>
              <input
                type="checkbox"
                checked={selectedLocations.includes(location.locationName)}
                onChange={() => {}}
              />
            </div>
            <span className="location-type">{location.locationType} • {location.country}</span>

            <div className="location-metrics">
              <div className="metric">
                <span>Talent Pool</span>
                <span>{location.totalTalentPool?.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span>Avg Salary</span>
                <span>${location.avgSalary?.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span>Cost of Living</span>
                <span>{location.costOfLiving}</span>
              </div>
              <div className="metric">
                <span>Remote %</span>
                <span>{location.remoteRatio}%</span>
              </div>
              <div className="metric">
                <span>Competition</span>
                <span>{location.hiringActivity}</span>
              </div>
              <div className="metric">
                <span>Tech Growth</span>
                <span>{location.techJobGrowth}%</span>
              </div>
            </div>

            {location.recommendations && (
              <div className="location-recommendations">
                <ul>
                  {location.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {remoteTrends && (
        <div className="remote-trends-section">
          <h3>Remote Work Trends</h3>
          <div className="work-mode-distribution">
            <div className="mode">
              <span className="label">Remote</span>
              <div className="bar" style={{ width: `${remoteTrends.overallRemoteAdoption}%` }} />
              <span className="value">{remoteTrends.overallRemoteAdoption}%</span>
            </div>
            <div className="mode">
              <span className="label">Hybrid</span>
              <div className="bar" style={{ width: `${remoteTrends.hybridAdoption}%` }} />
              <span className="value">{remoteTrends.hybridAdoption}%</span>
            </div>
            <div className="mode">
              <span className="label">On-site</span>
              <div className="bar" style={{ width: `${remoteTrends.onsiteOnly}%` }} />
              <span className="value">{remoteTrends.onsiteOnly}%</span>
            </div>
          </div>
          <div className="yoy-change">
            <h4>Year-over-Year Change</h4>
            <span className={remoteTrends.yearOverYearChange.remote >= 0 ? 'positive' : 'negative'}>
              Remote: {remoteTrends.yearOverYearChange.remote > 0 ? '+' : ''}{remoteTrends.yearOverYearChange.remote}%
            </span>
            <span className={remoteTrends.yearOverYearChange.hybrid >= 0 ? 'positive' : 'negative'}>
              Hybrid: {remoteTrends.yearOverYearChange.hybrid > 0 ? '+' : ''}{remoteTrends.yearOverYearChange.hybrid}%
            </span>
            <span className={remoteTrends.yearOverYearChange.onsite >= 0 ? 'positive' : 'negative'}>
              On-site: {remoteTrends.yearOverYearChange.onsite > 0 ? '+' : ''}{remoteTrends.yearOverYearChange.onsite}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 9.3.6 Industry Trends Tab
const IndustryTrendsTab: React.FC = () => {
  const [trends, setTrends] = useState<IndustryTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedIndustry]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await industryAPI.getIndustryTrends({ industry: selectedIndustry });
      setTrends(res.trends || []);
    } catch (error) {
      console.error('Error loading industry trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading industry trends...</div>;
  }

  return (
    <div className="industry-trends-tab">
      <div className="tab-header">
        <h2>Industry Trends</h2>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          <option value="">All Industries</option>
          <option value="technology">Technology</option>
          <option value="healthcare">Healthcare</option>
          <option value="finance">Finance</option>
          <option value="retail">Retail</option>
          <option value="manufacturing">Manufacturing</option>
        </select>
      </div>

      <div className="industries-grid">
        {trends.map((trend) => (
          <div key={trend.id} className="industry-card">
            <div className="industry-header">
              <h4>{trend.industryName}</h4>
              <span className={`outlook ${trend.outlook}`}>{trend.outlook}</span>
            </div>

            <div className="industry-metrics">
              <div className="metric">
                <span>Total Hiring</span>
                <span>{trend.totalHiring?.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span>Hiring Growth</span>
                <span>{trend.hiringGrowth}%</span>
              </div>
              <div className="metric">
                <span>Salary Growth</span>
                <span>{trend.avgSalaryGrowth}%</span>
              </div>
              <div className="metric">
                <span>Remote Adoption</span>
                <span>{trend.remoteAdoption}%</span>
              </div>
            </div>

            {trend.topRoles && (
              <div className="top-roles">
                <h5>Top Roles</h5>
                {trend.topRoles.slice(0, 3).map((role) => (
                  <div key={role.role} className="role-item">
                    <span>{role.role}</span>
                    <span>{role.percentage}%</span>
                    <span className={role.growth >= 0 ? 'positive' : 'negative'}>
                      {role.growth > 0 ? '+' : ''}{role.growth}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {trend.skillGaps && (
              <div className="skill-gaps">
                <h5>Skill Gaps</h5>
                <div className="gap-tags">
                  {trend.skillGaps.map((skill) => (
                    <span key={skill} className="gap-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {trend.emergingRoles && (
              <div className="emerging-roles">
                <h5>Emerging Roles</h5>
                <div className="role-tags">
                  {trend.emergingRoles.map((role) => (
                    <span key={role} className="role-tag">{role}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Overview Tab
const DashboardOverviewTab: React.FC = () => {
  const [dashboard, setDashboard] = useState<MarketIntelligenceDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getMarketIntelligenceDashboard();
      setDashboard(res.dashboard || null);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      await dashboardAPI.exportMarketIntelligenceReport({
        format: 'pdf',
        sections: ['salary', 'talent', 'competitors', 'skills', 'locations', 'industry'],
      });
      alert('Report generation started');
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading market intelligence dashboard...</div>;
  }

  if (!dashboard) {
    return <div>No dashboard data available</div>;
  }

  return (
    <div className="dashboard-overview-tab">
      <div className="tab-header">
        <h2>Market Intelligence Overview</h2>
        <button onClick={handleExportReport} className="btn-primary">
          Export Report
        </button>
      </div>

      <div className="snapshot-section">
        <div className="snapshot-metrics">
          <div className="metric-card">
            <h4>Market Health</h4>
            <span className="score">{dashboard.snapshot.marketHealthScore}</span>
          </div>
          <div className="metric-card">
            <h4>Salary Index Change</h4>
            <span className="score">{dashboard.snapshot.salaryIndexChange}%</span>
          </div>
          <div className="metric-card">
            <h4>Talent Availability</h4>
            <span className="score">{dashboard.snapshot.talentAvailabilityScore}</span>
          </div>
          <div className="metric-card">
            <h4>Competitor Activity</h4>
            <span className="score">{dashboard.snapshot.competitorActivityScore}</span>
          </div>
          <div className="metric-card">
            <h4>Skill Demand Shift</h4>
            <span className="score">{dashboard.snapshot.skillDemandShift}%</span>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Top Insights</h3>
        <div className="insights-list">
          {dashboard.topInsights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type} ${insight.severity}`}>
              <span className="insight-type">{insight.type}</span>
              <h4>{insight.title}</h4>
              <p>{insight.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-stats-section">
        <h3>Quick Stats</h3>
        <div className="stats-grid">
          <div className="stat">
            <span className="value">{dashboard.quickStats.trackedCompetitors}</span>
            <span className="label">Tracked Competitors</span>
          </div>
          <div className="stat">
            <span className="value">{dashboard.quickStats.salaryDataPoints.toLocaleString()}</span>
            <span className="label">Salary Data Points</span>
          </div>
          <div className="stat">
            <span className="value">{dashboard.quickStats.talentPoolAnalyses}</span>
            <span className="label">Talent Analyses</span>
          </div>
          <div className="stat">
            <span className="value">{dashboard.quickStats.skillsTracked}</span>
            <span className="label">Skills Tracked</span>
          </div>
          <div className="stat">
            <span className="value">{dashboard.quickStats.locationsMonitored}</span>
            <span className="label">Locations Monitored</span>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {dashboard.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="action">{activity.action}</span>
              <span className="target">{activity.target}</span>
              <span className="time">{activity.time}</span>
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

const MarketIntelligenceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Overview', component: DashboardOverviewTab },
    { id: 'salary', label: 'Salary Data', component: SalaryMarketDataTab },
    { id: 'talent', label: 'Talent Pool', component: TalentPoolAnalysisTab },
    { id: 'competitors', label: 'Competitors', component: CompetitorInsightsTab },
    { id: 'skills', label: 'Skills Trends', component: SkillsDemandTrendsTab },
    { id: 'locations', label: 'Location Intel', component: LocationIntelligenceTab },
    { id: 'industries', label: 'Industry Trends', component: IndustryTrendsTab },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || DashboardOverviewTab;

  return (
    <div className="market-intelligence-hub">
      <div className="hub-header">
        <h1>Market Intelligence</h1>
        <p>Real-time market data, talent insights, and competitive intelligence</p>
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

export default MarketIntelligenceHub;
