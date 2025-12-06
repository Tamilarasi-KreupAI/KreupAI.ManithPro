import React, { useState, useEffect } from 'react';
import {
  hiringTeamsAPI,
  teamMembersAPI,
  interviewPanelsAPI,
  workloadAPI,
  coverageAPI,
  performanceAPI,
  dashboardAPI,
  statsAPI,
} from '../../services/batch24HiringTeamManagementAPI';
import type {
  HiringTeam,
  HiringTeamMember,
  InterviewPanel,
  WorkloadSummary,
  CoverageSchedule,
  TeamPerformance,
  DashboardData,
  HiringTeamStats,
} from '../../types';

type TabType =
  | 'overview'
  | 'teams'
  | 'members'
  | 'panels'
  | 'workload'
  | 'coverage'
  | 'performance'
  | 'dashboard';

const HiringTeamManagementHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for each feature
  const [stats, setStats] = useState<HiringTeamStats | null>(null);
  const [teams, setTeams] = useState<HiringTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<HiringTeam | null>(null);
  const [members, setMembers] = useState<HiringTeamMember[]>([]);
  const [panels, setPanels] = useState<InterviewPanel[]>([]);
  const [workloadSummary, setWorkloadSummary] = useState<WorkloadSummary | null>(null);
  const [coverages, setCoverages] = useState<CoverageSchedule[]>([]);
  const [performance, setPerformance] = useState<TeamPerformance[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'overview':
          const [statsData, teamsData] = await Promise.all([
            statsAPI.get('company-1'),
            hiringTeamsAPI.getAll(),
          ]);
          setStats(statsData);
          setTeams(teamsData);
          break;
        case 'teams':
          const allTeams = await hiringTeamsAPI.getAll();
          setTeams(allTeams);
          break;
        case 'members':
          if (!selectedTeam && teams.length > 0) {
            setSelectedTeam(teams[0]);
          }
          if (selectedTeam || teams.length > 0) {
            const teamId = selectedTeam?.id || teams[0]?.id || 'team-1';
            const membersData = await teamMembersAPI.getByTeam(teamId);
            setMembers(membersData);
          }
          break;
        case 'panels':
          const panelsData = await interviewPanelsAPI.getAll();
          setPanels(panelsData);
          break;
        case 'workload':
          const workload = await workloadAPI.getWorkloadSummary('team-1');
          setWorkloadSummary(workload);
          break;
        case 'coverage':
          const coverageData = await coverageAPI.getAll();
          setCoverages(coverageData);
          break;
        case 'performance':
          const perfData = await performanceAPI.get('team-1');
          setPerformance(perfData);
          break;
        case 'dashboard':
          const dashData = await dashboardAPI.getData('hm-1', 'company-1');
          setDashboardData(dashData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'teams', label: 'Hiring Teams' },
    { id: 'members', label: 'Team Members' },
    { id: 'panels', label: 'Interview Panels' },
    { id: 'workload', label: 'Workload' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'performance', label: 'Performance' },
    { id: 'dashboard', label: 'HM Dashboard' },
  ];

  const renderOverview = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Teams</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.teamsByStatus.ACTIVE || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {Object.values(stats.membersByRole).reduce((a, b) => a + b, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Panels</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activePanels}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Coverages</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.activeCoverages}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Teams by Status</h3>
            <div className="space-y-3">
              {Object.entries(stats.teamsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'ACTIVE' ? 'bg-green-500' :
                          status === 'COMPLETED' ? 'bg-blue-500' :
                          status === 'PAUSED' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${Math.min((count / 5) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Members by Role</h3>
            <div className="space-y-3">
              {Object.entries(stats.membersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{role.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Hiring Teams</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Candidates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Interviews</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hires</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{team.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{team.description}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{team.teamType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{team.totalCandidates}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{team.totalInterviews}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">{team.totalHires}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        team.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        team.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                        team.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {team.status}
                      </span>
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

  const renderTeams = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hiring Teams</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{team.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                team.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                team.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {team.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{team.totalCandidates}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Candidates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{team.totalInterviews}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{team.totalHires}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Hires</div>
              </div>
            </div>

            {team.avgTimeToHire && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Avg. Time to Hire: <span className="font-medium">{team.avgTimeToHire} days</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTeam(team)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                View Details
              </button>
              <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                Manage Team
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Members & Permissions</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Member
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Member</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Permission</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Workload</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expertise</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-white">{member.title || member.userId}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{member.userId}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.role === 'LEAD_RECRUITER' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'HIRING_MANAGER' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'INTERVIEWER' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.permissionLevel === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    member.permissionLevel === 'EDITOR' ? 'bg-orange-100 text-orange-800' :
                    member.permissionLevel === 'COMMENTER' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.permissionLevel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          member.currentInterviewLoad >= (member.maxInterviewsPerWeek || 10) ? 'bg-red-500' :
                          member.currentInterviewLoad >= (member.maxInterviewsPerWeek || 10) * 0.8 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(member.currentInterviewLoad / (member.maxInterviewsPerWeek || 10)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {member.currentInterviewLoad}/{member.maxInterviewsPerWeek || 10}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {member.expertiseAreas?.slice(0, 2).map((area) => (
                      <span key={area} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        {area}
                      </span>
                    ))}
                    {member.expertiseAreas && member.expertiseAreas.length > 2 && (
                      <span className="text-xs text-gray-500">+{member.expertiseAreas.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPanels = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interview Panels</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Panel
        </button>
      </div>

      <div className="space-y-4">
        {panels.map((panel) => (
          <div key={panel.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold">
                  {panel.roundNumber}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{panel.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {panel.roundType.replace(/_/g, ' ')} • {panel.duration} min • {panel.format}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                panel.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {panel.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Panel Size</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {panel.minPanelSize}-{panel.maxPanelSize} members
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Scheduling</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{panel.schedulingMode}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Buffer</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{panel.bufferTime} min</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Passing Score</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {panel.passingScore || 'N/A'}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-xs text-gray-500 dark:text-gray-400">Panel Members</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {panel.panelMembers.map((pm, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 text-xs rounded-full ${
                      pm.isRequired ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pm.role.replace(/_/g, ' ')} {pm.isRequired && '(Required)'}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                Edit Panel
              </button>
              <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                Manage Members
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorkload = () => {
    if (!workloadSummary) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Workload Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Members</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{workloadSummary.totalMembers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Capacity</h3>
            <p className="text-2xl font-bold text-blue-600">{workloadSummary.totalCapacity}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Current Load</h3>
            <p className="text-2xl font-bold text-purple-600">{workloadSummary.currentLoad}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Available</h3>
            <p className="text-2xl font-bold text-green-600">{workloadSummary.availableCapacity}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Overloaded</h3>
            <p className={`text-2xl font-bold ${workloadSummary.overloadedMembers > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {workloadSummary.overloadedMembers}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workload by Role</h3>
          <div className="space-y-4">
            {Object.entries(workloadSummary.byRole).map(([role, data]) => (
              <div key={role} className="flex items-center gap-4">
                <div className="w-40 text-sm text-gray-600 dark:text-gray-300">{role.replace(/_/g, ' ')}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${(data.load / data.capacity) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 w-20">
                      {data.load}/{data.capacity}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{data.count} members</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCoverage = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Coverage Scheduling</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Schedule Coverage
        </button>
      </div>

      <div className="space-y-4">
        {coverages.map((coverage) => (
          <div key={coverage.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {coverage.primaryUserId} → {coverage.coveringUserId}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(coverage.startDate).toLocaleDateString()} - {new Date(coverage.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  coverage.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  coverage.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                  coverage.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {coverage.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  coverage.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  coverage.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {coverage.approvalStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Reason</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{coverage.reason}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{coverage.coverageType}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Handoff</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {coverage.handoffCompletedAt ? 'Completed' : 'Pending'}
                </div>
              </div>
            </div>

            {coverage.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{coverage.notes}</p>
            )}

            <div className="flex gap-2">
              {coverage.approvalStatus === 'PENDING' && (
                <>
                  <button
                    onClick={() => coverageAPI.approve(coverage.id, true)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => coverageAPI.approve(coverage.id, false)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
              {!coverage.handoffCompletedAt && coverage.approvalStatus === 'APPROVED' && (
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Complete Handoff
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPerformance = () => {
    const perf = performance[0];
    if (!perf) return <div className="text-center py-8 text-gray-500">No performance data available</div>;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Performance Metrics</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Candidates Sourced</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{perf.candidatesSourced}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Interviews Completed</h3>
            <p className="text-2xl font-bold text-blue-600">{perf.interviewsCompleted}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Offers Extended</h3>
            <p className="text-2xl font-bold text-purple-600">{perf.offersExtended}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Hires Made</h3>
            <p className="text-2xl font-bold text-green-600">{perf.hiresMade}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Efficiency Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Avg. Time to Screen', value: `${perf.avgTimeToScreen || 0} days` },
                { label: 'Avg. Time to Interview', value: `${perf.avgTimeToInterview || 0} days` },
                { label: 'Avg. Time to Offer', value: `${perf.avgTimeToOffer || 0} days` },
                { label: 'Avg. Time to Hire', value: `${perf.avgTimeToHire || 0} days` },
                { label: 'Avg. Interviews per Hire', value: `${perf.avgInterviewsPerHire || 0}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quality Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Candidate Quality Score', value: perf.candidateQualityScore || 0, max: 5 },
                { label: 'Interview Quality Score', value: perf.interviewQualityScore || 0, max: 5 },
                { label: 'Offer Acceptance Rate', value: perf.offerAcceptanceRate || 0, max: 100, suffix: '%' },
                { label: 'Team Utilization', value: perf.teamUtilization || 0, max: 100, suffix: '%' },
                { label: 'Feedback Completion Rate', value: perf.feedbackCompletionRate || 0, max: 100, suffix: '%' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.value}{item.suffix || ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hiring Manager Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Active Teams</h3>
            <p className="text-2xl font-bold text-blue-600">{dashboardData.summary.activeTeams}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Candidates</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.summary.totalCandidates}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Interviews</h3>
            <p className="text-2xl font-bold text-purple-600">{dashboardData.summary.totalInterviews}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Hires</h3>
            <p className="text-2xl font-bold text-green-600">{dashboardData.summary.totalHires}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Actions</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <span className="text-gray-700 dark:text-gray-300">Feedback Pending</span>
                <span className="text-lg font-bold text-yellow-600">{dashboardData.pendingActions.feedbackPending}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                <span className="text-gray-700 dark:text-gray-300">Decisions Needed</span>
                <span className="text-lg font-bold text-orange-600">{dashboardData.pendingActions.decisionsNeeded}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <span className="text-gray-700 dark:text-gray-300">To Schedule</span>
                <span className="text-lg font-bold text-blue-600">{dashboardData.pendingActions.interviewsToSchedule}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Interviews</h3>
            <div className="space-y-3">
              {dashboardData.upcomingInterviews.map((interview) => (
                <div key={interview.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <div className="font-medium text-gray-900 dark:text-white">{interview.candidateName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{interview.jobTitle}</div>
                  <div className="text-xs text-blue-600">
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <div className="font-medium text-gray-900 dark:text-white">{activity.description}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.performedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadTabData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'teams':
        return renderTeams();
      case 'members':
        return renderMembers();
      case 'panels':
        return renderPanels();
      case 'workload':
        return renderWorkload();
      case 'coverage':
        return renderCoverage();
      case 'performance':
        return renderPerformance();
      case 'dashboard':
        return renderDashboard();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hiring Team Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage hiring teams, members, interview panels, workload, and performance
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
};

export default HiringTeamManagementHub;
