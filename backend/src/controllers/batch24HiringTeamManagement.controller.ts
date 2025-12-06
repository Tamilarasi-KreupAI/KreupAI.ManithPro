import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// 6.1.1 HIRING TEAM CREATION
// ============================================================================

// Create a new hiring team
export const createHiringTeam = async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      jobId,
      name,
      description,
      teamType,
      leadRecruiterId,
      hiringManagerId,
      settings,
      notificationPrefs,
    } = req.body;

    const team = await prisma.hiringTeam.create({
      data: {
        companyId,
        jobId,
        name,
        description,
        teamType: teamType || 'STANDARD',
        leadRecruiterId,
        hiringManagerId,
        settings,
        notificationPrefs,
        createdById: (req as any).user.id,
      },
    });

    // Automatically add lead recruiter as team member
    await prisma.hiringTeamMember.create({
      data: {
        teamId: team.id,
        userId: leadRecruiterId,
        companyId,
        role: 'LEAD_RECRUITER',
        permissionLevel: 'ADMIN',
        canViewCandidates: true,
        canEditCandidates: true,
        canScheduleInterviews: true,
        canSubmitFeedback: true,
        canMakeDecisions: true,
        canManageTeam: true,
        canAccessReports: true,
        addedById: (req as any).user.id,
      },
    });

    // Add hiring manager if specified
    if (hiringManagerId) {
      await prisma.hiringTeamMember.create({
        data: {
          teamId: team.id,
          userId: hiringManagerId,
          companyId,
          role: 'HIRING_MANAGER',
          permissionLevel: 'EDITOR',
          canViewCandidates: true,
          canEditCandidates: true,
          canScheduleInterviews: true,
          canSubmitFeedback: true,
          canMakeDecisions: true,
          canManageTeam: false,
          canAccessReports: true,
          addedById: (req as any).user.id,
        },
      });
    }

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating hiring team:', error);
    res.status(500).json({ error: 'Failed to create hiring team' });
  }
};

// Get hiring teams
export const getHiringTeams = async (req: Request, res: Response) => {
  try {
    const { companyId, jobId, status, leadRecruiterId } = req.query;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;
    if (leadRecruiterId) where.leadRecruiterId = leadRecruiterId;

    const teams = await prisma.hiringTeam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(teams);
  } catch (error) {
    console.error('Error fetching hiring teams:', error);
    res.status(500).json({ error: 'Failed to fetch hiring teams' });
  }
};

// Get hiring team by ID
export const getHiringTeamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await prisma.hiringTeam.findUnique({
      where: { id },
    });

    if (!team) {
      return res.status(404).json({ error: 'Hiring team not found' });
    }

    // Get team members
    const members = await prisma.hiringTeamMember.findMany({
      where: { teamId: id },
    });

    res.json({ ...team, members });
  } catch (error) {
    console.error('Error fetching hiring team:', error);
    res.status(500).json({ error: 'Failed to fetch hiring team' });
  }
};

// Update hiring team
export const updateHiringTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const team = await prisma.hiringTeam.update({
      where: { id },
      data: updates,
    });

    res.json(team);
  } catch (error) {
    console.error('Error updating hiring team:', error);
    res.status(500).json({ error: 'Failed to update hiring team' });
  }
};

// Update team status
export const updateTeamStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData: any = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const team = await prisma.hiringTeam.update({
      where: { id },
      data: updateData,
    });

    res.json(team);
  } catch (error) {
    console.error('Error updating team status:', error);
    res.status(500).json({ error: 'Failed to update team status' });
  }
};

// ============================================================================
// 6.1.2 ROLE-BASED PERMISSIONS
// ============================================================================

// Add team member
export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const {
      userId,
      companyId,
      role,
      title,
      permissionLevel,
      canViewCandidates,
      canEditCandidates,
      canScheduleInterviews,
      canSubmitFeedback,
      canMakeDecisions,
      canManageTeam,
      canAccessReports,
      customPermissions,
      expertiseAreas,
      interviewTypes,
      maxInterviewsPerWeek,
    } = req.body;

    const member = await prisma.hiringTeamMember.create({
      data: {
        teamId,
        userId,
        companyId,
        role,
        title,
        permissionLevel: permissionLevel || 'VIEWER',
        canViewCandidates: canViewCandidates ?? true,
        canEditCandidates: canEditCandidates ?? false,
        canScheduleInterviews: canScheduleInterviews ?? false,
        canSubmitFeedback: canSubmitFeedback ?? true,
        canMakeDecisions: canMakeDecisions ?? false,
        canManageTeam: canManageTeam ?? false,
        canAccessReports: canAccessReports ?? false,
        customPermissions,
        expertiseAreas,
        interviewTypes,
        maxInterviewsPerWeek,
        addedById: (req as any).user.id,
      },
    });

    // Log activity
    await prisma.teamActivityLog.create({
      data: {
        companyId,
        teamId,
        userId: (req as any).user.id,
        activityType: 'MEMBER_ADDED',
        entityType: 'MEMBER',
        entityId: member.id,
        description: `Added ${role} to team`,
        newState: member as any,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
};

// Get team members
export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    const members = await prisma.hiringTeamMember.findMany({
      where: { teamId },
      orderBy: { joinedAt: 'asc' },
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

// Update team member permissions
export const updateMemberPermissions = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const updates = req.body;

    const previousMember = await prisma.hiringTeamMember.findUnique({
      where: { id: memberId },
    });

    const member = await prisma.hiringTeamMember.update({
      where: { id: memberId },
      data: updates,
    });

    // Log activity
    if (previousMember) {
      await prisma.teamActivityLog.create({
        data: {
          companyId: member.companyId,
          teamId: member.teamId,
          userId: (req as any).user.id,
          activityType: 'PERMISSIONS_CHANGED',
          entityType: 'MEMBER',
          entityId: memberId,
          description: `Updated permissions for team member`,
          previousState: previousMember as any,
          newState: member as any,
        },
      });
    }

    res.json(member);
  } catch (error) {
    console.error('Error updating member permissions:', error);
    res.status(500).json({ error: 'Failed to update member permissions' });
  }
};

// Remove team member
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    const member = await prisma.hiringTeamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await prisma.hiringTeamMember.delete({
      where: { id: memberId },
    });

    // Log activity
    await prisma.teamActivityLog.create({
      data: {
        companyId: member.companyId,
        teamId: member.teamId,
        userId: (req as any).user.id,
        activityType: 'MEMBER_REMOVED',
        entityType: 'MEMBER',
        entityId: memberId,
        description: `Removed ${member.role} from team`,
        previousState: member as any,
      },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
};

// ============================================================================
// 6.1.3 INTERVIEW PANEL SETUP
// ============================================================================

// Create interview panel
export const createInterviewPanel = async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      teamId,
      jobId,
      name,
      roundNumber,
      roundType,
      panelMembers,
      minPanelSize,
      maxPanelSize,
      duration,
      format,
      location,
      videoLink,
      scorecardTemplateId,
      passingScore,
      requireUnanimous,
      schedulingMode,
      bufferTime,
      allowWeekends,
      timeSlotPreferences,
      order,
    } = req.body;

    const panel = await prisma.interviewPanel.create({
      data: {
        companyId,
        teamId,
        jobId,
        name,
        roundNumber,
        roundType,
        panelMembers,
        minPanelSize: minPanelSize || 1,
        maxPanelSize: maxPanelSize || 5,
        duration: duration || 60,
        format: format || 'VIDEO',
        location,
        videoLink,
        scorecardTemplateId,
        passingScore,
        requireUnanimous: requireUnanimous ?? false,
        schedulingMode: schedulingMode || 'MANUAL',
        bufferTime: bufferTime || 15,
        allowWeekends: allowWeekends ?? false,
        timeSlotPreferences,
        order,
        createdById: (req as any).user.id,
      },
    });

    res.status(201).json(panel);
  } catch (error) {
    console.error('Error creating interview panel:', error);
    res.status(500).json({ error: 'Failed to create interview panel' });
  }
};

// Get interview panels
export const getInterviewPanels = async (req: Request, res: Response) => {
  try {
    const { teamId, jobId, roundType } = req.query;

    const where: any = {};
    if (teamId) where.teamId = teamId;
    if (jobId) where.jobId = jobId;
    if (roundType) where.roundType = roundType;

    const panels = await prisma.interviewPanel.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json(panels);
  } catch (error) {
    console.error('Error fetching interview panels:', error);
    res.status(500).json({ error: 'Failed to fetch interview panels' });
  }
};

// Update interview panel
export const updateInterviewPanel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const panel = await prisma.interviewPanel.update({
      where: { id },
      data: updates,
    });

    res.json(panel);
  } catch (error) {
    console.error('Error updating interview panel:', error);
    res.status(500).json({ error: 'Failed to update interview panel' });
  }
};

// Delete interview panel
export const deleteInterviewPanel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.interviewPanel.delete({
      where: { id },
    });

    res.json({ message: 'Panel deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview panel:', error);
    res.status(500).json({ error: 'Failed to delete interview panel' });
  }
};

// Reorder interview panels
export const reorderInterviewPanels = async (req: Request, res: Response) => {
  try {
    const { panels } = req.body; // Array of { id, order }

    await Promise.all(
      panels.map((p: { id: string; order: number }) =>
        prisma.interviewPanel.update({
          where: { id: p.id },
          data: { order: p.order },
        })
      )
    );

    res.json({ message: 'Panels reordered successfully' });
  } catch (error) {
    console.error('Error reordering panels:', error);
    res.status(500).json({ error: 'Failed to reorder panels' });
  }
};

// ============================================================================
// 6.1.4 WORKLOAD DASHBOARD
// ============================================================================

// Get team workload
export const getTeamWorkload = async (req: Request, res: Response) => {
  try {
    const { teamId, userId, periodStart, periodEnd } = req.query;

    const where: any = {};
    if (teamId) where.teamId = teamId;
    if (userId) where.userId = userId;
    if (periodStart && periodEnd) {
      where.periodStart = { gte: new Date(periodStart as string) };
      where.periodEnd = { lte: new Date(periodEnd as string) };
    }

    const workloads = await prisma.teamWorkload.findMany({
      where,
      orderBy: { periodStart: 'desc' },
    });

    res.json(workloads);
  } catch (error) {
    console.error('Error fetching team workload:', error);
    res.status(500).json({ error: 'Failed to fetch team workload' });
  }
};

// Update member workload
export const updateMemberWorkload = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const workload = await prisma.teamWorkload.update({
      where: { id },
      data: updates,
    });

    res.json(workload);
  } catch (error) {
    console.error('Error updating workload:', error);
    res.status(500).json({ error: 'Failed to update workload' });
  }
};

// Calculate and update workloads for a team
export const calculateTeamWorkloads = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { periodStart, periodEnd } = req.body;

    const team = await prisma.hiringTeam.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const members = await prisma.hiringTeamMember.findMany({
      where: { teamId, isActive: true },
    });

    // Calculate workload for each member
    const workloads = await Promise.all(
      members.map(async (member) => {
        // This would typically query interviews, feedback, etc.
        // For now, we'll create/update with placeholder data
        return prisma.teamWorkload.upsert({
          where: {
            teamId_userId_periodStart_periodEnd: {
              teamId,
              userId: member.userId,
              periodStart: new Date(periodStart),
              periodEnd: new Date(periodEnd),
            },
          },
          create: {
            companyId: team.companyId,
            teamId,
            userId: member.userId,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
            maxCapacity: member.maxInterviewsPerWeek || 10,
            currentLoad: member.currentInterviewLoad,
            availableCapacity: (member.maxInterviewsPerWeek || 10) - member.currentInterviewLoad,
          },
          update: {
            currentLoad: member.currentInterviewLoad,
            availableCapacity: (member.maxInterviewsPerWeek || 10) - member.currentInterviewLoad,
            calculatedAt: new Date(),
          },
        });
      })
    );

    res.json(workloads);
  } catch (error) {
    console.error('Error calculating workloads:', error);
    res.status(500).json({ error: 'Failed to calculate workloads' });
  }
};

// Get workload summary
export const getWorkloadSummary = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    const members = await prisma.hiringTeamMember.findMany({
      where: { teamId, isActive: true },
    });

    const summary = {
      totalMembers: members.length,
      totalCapacity: members.reduce((sum, m) => sum + (m.maxInterviewsPerWeek || 10), 0),
      currentLoad: members.reduce((sum, m) => sum + m.currentInterviewLoad, 0),
      availableCapacity: 0,
      overloadedMembers: 0,
      byRole: {} as Record<string, { count: number; load: number; capacity: number }>,
    };

    summary.availableCapacity = summary.totalCapacity - summary.currentLoad;

    members.forEach((m) => {
      const capacity = m.maxInterviewsPerWeek || 10;
      if (m.currentInterviewLoad > capacity) {
        summary.overloadedMembers++;
      }

      if (!summary.byRole[m.role]) {
        summary.byRole[m.role] = { count: 0, load: 0, capacity: 0 };
      }
      summary.byRole[m.role].count++;
      summary.byRole[m.role].load += m.currentInterviewLoad;
      summary.byRole[m.role].capacity += capacity;
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching workload summary:', error);
    res.status(500).json({ error: 'Failed to fetch workload summary' });
  }
};

// ============================================================================
// 6.1.5 COVERAGE SCHEDULING
// ============================================================================

// Create coverage schedule
export const createCoverageSchedule = async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      teamId,
      primaryUserId,
      coveringUserId,
      startDate,
      endDate,
      reason,
      notes,
      coverageType,
      coveredResponsibilities,
      excludedResponsibilities,
      handoffNotes,
      handoffDocuments,
      notifyStakeholders,
    } = req.body;

    const coverage = await prisma.coverageSchedule.create({
      data: {
        companyId,
        teamId,
        primaryUserId,
        coveringUserId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        notes,
        coverageType: coverageType || 'FULL',
        coveredResponsibilities,
        excludedResponsibilities,
        handoffNotes,
        handoffDocuments,
        notifyStakeholders: notifyStakeholders ?? true,
        createdById: (req as any).user.id,
      },
    });

    res.status(201).json(coverage);
  } catch (error) {
    console.error('Error creating coverage schedule:', error);
    res.status(500).json({ error: 'Failed to create coverage schedule' });
  }
};

// Get coverage schedules
export const getCoverageSchedules = async (req: Request, res: Response) => {
  try {
    const { teamId, primaryUserId, coveringUserId, status, startDate, endDate } = req.query;

    const where: any = {};
    if (teamId) where.teamId = teamId;
    if (primaryUserId) where.primaryUserId = primaryUserId;
    if (coveringUserId) where.coveringUserId = coveringUserId;
    if (status) where.status = status;
    if (startDate) where.startDate = { gte: new Date(startDate as string) };
    if (endDate) where.endDate = { lte: new Date(endDate as string) };

    const coverages = await prisma.coverageSchedule.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    res.json(coverages);
  } catch (error) {
    console.error('Error fetching coverage schedules:', error);
    res.status(500).json({ error: 'Failed to fetch coverage schedules' });
  }
};

// Update coverage schedule
export const updateCoverageSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const coverage = await prisma.coverageSchedule.update({
      where: { id },
      data: updates,
    });

    res.json(coverage);
  } catch (error) {
    console.error('Error updating coverage schedule:', error);
    res.status(500).json({ error: 'Failed to update coverage schedule' });
  }
};

// Approve coverage schedule
export const approveCoverageSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const coverage = await prisma.coverageSchedule.update({
      where: { id },
      data: {
        approvalStatus: approved ? 'APPROVED' : 'REJECTED',
        approvedById: (req as any).user.id,
        approvedAt: new Date(),
      },
    });

    res.json(coverage);
  } catch (error) {
    console.error('Error approving coverage schedule:', error);
    res.status(500).json({ error: 'Failed to approve coverage schedule' });
  }
};

// Complete handoff
export const completeCoverageHandoff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { handoffNotes, handoffDocuments } = req.body;

    const coverage = await prisma.coverageSchedule.update({
      where: { id },
      data: {
        handoffNotes,
        handoffDocuments,
        handoffCompletedAt: new Date(),
      },
    });

    res.json(coverage);
  } catch (error) {
    console.error('Error completing handoff:', error);
    res.status(500).json({ error: 'Failed to complete handoff' });
  }
};

// ============================================================================
// 6.1.6 TEAM PERFORMANCE METRICS
// ============================================================================

// Get team performance
export const getTeamPerformance = async (req: Request, res: Response) => {
  try {
    const { teamId, periodType, periodStart, periodEnd } = req.query;

    const where: any = {};
    if (teamId) where.teamId = teamId;
    if (periodType) where.periodType = periodType;
    if (periodStart) where.periodStart = { gte: new Date(periodStart as string) };
    if (periodEnd) where.periodEnd = { lte: new Date(periodEnd as string) };

    const performance = await prisma.teamPerformance.findMany({
      where,
      orderBy: { periodStart: 'desc' },
    });

    res.json(performance);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    res.status(500).json({ error: 'Failed to fetch team performance' });
  }
};

// Calculate team performance metrics
export const calculateTeamPerformance = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { periodType, periodStart, periodEnd } = req.body;

    const team = await prisma.hiringTeam.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Calculate metrics (placeholder - would typically aggregate from actual data)
    const performance = await prisma.teamPerformance.upsert({
      where: {
        teamId_periodType_periodStart: {
          teamId,
          periodType,
          periodStart: new Date(periodStart),
        },
      },
      create: {
        companyId: team.companyId,
        teamId,
        periodType,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        candidatesSourced: team.totalCandidates,
        interviewsCompleted: team.totalInterviews,
        hiresMade: team.totalHires,
        avgTimeToHire: team.avgTimeToHire,
      },
      update: {
        periodEnd: new Date(periodEnd),
        candidatesSourced: team.totalCandidates,
        interviewsCompleted: team.totalInterviews,
        hiresMade: team.totalHires,
        avgTimeToHire: team.avgTimeToHire,
        calculatedAt: new Date(),
      },
    });

    res.json(performance);
  } catch (error) {
    console.error('Error calculating team performance:', error);
    res.status(500).json({ error: 'Failed to calculate team performance' });
  }
};

// Compare team performance
export const compareTeamPerformance = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { periodType, comparisonPeriods } = req.query;

    const performance = await prisma.teamPerformance.findMany({
      where: {
        teamId,
        periodType: periodType as string,
      },
      orderBy: { periodStart: 'desc' },
      take: Number(comparisonPeriods) || 4,
    });

    // Calculate trends
    const trends = {
      hires: calculateTrend(performance.map((p) => p.hiresMade)),
      interviews: calculateTrend(performance.map((p) => p.interviewsCompleted)),
      timeToHire: calculateTrend(performance.map((p) => p.avgTimeToHire || 0)),
    };

    res.json({ performance, trends });
  } catch (error) {
    console.error('Error comparing team performance:', error);
    res.status(500).json({ error: 'Failed to compare team performance' });
  }
};

function calculateTrend(values: number[]): { direction: string; percentage: number } {
  if (values.length < 2) return { direction: 'stable', percentage: 0 };
  const latest = values[0];
  const previous = values[1];
  if (previous === 0) return { direction: 'up', percentage: 100 };
  const change = ((latest - previous) / previous) * 100;
  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    percentage: Math.abs(change),
  };
}

// ============================================================================
// 6.1.7 HIRING MANAGER DASHBOARDS
// ============================================================================

// Get or create hiring manager dashboard
export const getHiringManagerDashboard = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { companyId } = req.query;

    let dashboard = await prisma.hiringManagerDashboard.findUnique({
      where: {
        companyId_userId: {
          companyId: companyId as string,
          userId,
        },
      },
    });

    if (!dashboard) {
      // Create default dashboard
      dashboard = await prisma.hiringManagerDashboard.create({
        data: {
          companyId: companyId as string,
          userId,
          widgets: [
            { type: 'PIPELINE_OVERVIEW', position: { x: 0, y: 0, w: 6, h: 4 } },
            { type: 'RECENT_CANDIDATES', position: { x: 6, y: 0, w: 6, h: 4 } },
            { type: 'INTERVIEWS_THIS_WEEK', position: { x: 0, y: 4, w: 4, h: 3 } },
            { type: 'PENDING_ACTIONS', position: { x: 4, y: 4, w: 4, h: 3 } },
            { type: 'TEAM_ACTIVITY', position: { x: 8, y: 4, w: 4, h: 3 } },
          ],
        },
      });
    }

    // Update last viewed
    await prisma.hiringManagerDashboard.update({
      where: { id: dashboard.id },
      data: { lastViewedAt: new Date() },
    });

    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching hiring manager dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

// Update dashboard configuration
export const updateDashboardConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const dashboard = await prisma.hiringManagerDashboard.update({
      where: { id },
      data: updates,
    });

    res.json(dashboard);
  } catch (error) {
    console.error('Error updating dashboard config:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
};

// Update dashboard widgets
export const updateDashboardWidgets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { widgets, layout } = req.body;

    const dashboard = await prisma.hiringManagerDashboard.update({
      where: { id },
      data: { widgets, layout },
    });

    res.json(dashboard);
  } catch (error) {
    console.error('Error updating dashboard widgets:', error);
    res.status(500).json({ error: 'Failed to update widgets' });
  }
};

// Save dashboard filter preset
export const saveDashboardFilter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { filterName, filterConfig } = req.body;

    const dashboard = await prisma.hiringManagerDashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const savedFilters = (dashboard.savedFilters as any[]) || [];
    savedFilters.push({
      id: `filter-${Date.now()}`,
      name: filterName,
      config: filterConfig,
      createdAt: new Date().toISOString(),
    });

    const updated = await prisma.hiringManagerDashboard.update({
      where: { id },
      data: { savedFilters },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error saving dashboard filter:', error);
    res.status(500).json({ error: 'Failed to save filter' });
  }
};

// Get dashboard data (aggregated data for widgets)
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { companyId, timeRange } = req.query;

    // Get teams where user is a member
    const memberships = await prisma.hiringTeamMember.findMany({
      where: { userId, companyId: companyId as string },
    });

    const teamIds = memberships.map((m) => m.teamId);

    // Get teams data
    const teams = await prisma.hiringTeam.findMany({
      where: { id: { in: teamIds }, status: 'ACTIVE' },
    });

    // Build dashboard data
    const data = {
      summary: {
        activeTeams: teams.length,
        totalCandidates: teams.reduce((sum, t) => sum + t.totalCandidates, 0),
        totalInterviews: teams.reduce((sum, t) => sum + t.totalInterviews, 0),
        totalHires: teams.reduce((sum, t) => sum + t.totalHires, 0),
      },
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name,
        candidates: t.totalCandidates,
        interviews: t.totalInterviews,
        hires: t.totalHires,
        status: t.status,
      })),
      recentActivity: [], // Would fetch from activity logs
      upcomingInterviews: [], // Would fetch from interviews
      pendingActions: {
        feedbackPending: 0,
        decisionsNeeded: 0,
        interviewsToSchedule: 0,
      },
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// ============================================================================
// TEAM ACTIVITY & STATS
// ============================================================================

// Get team activity log
export const getTeamActivityLog = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { activityType, userId, limit, offset } = req.query;

    const where: any = { teamId };
    if (activityType) where.activityType = activityType;
    if (userId) where.userId = userId;

    const activities = await prisma.teamActivityLog.findMany({
      where,
      orderBy: { performedAt: 'desc' },
      take: Number(limit) || 50,
      skip: Number(offset) || 0,
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching team activity:', error);
    res.status(500).json({ error: 'Failed to fetch team activity' });
  }
};

// Get hiring team management stats
export const getHiringTeamStats = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;

    const [teams, members, panels, coverages] = await Promise.all([
      prisma.hiringTeam.groupBy({
        by: ['status'],
        where: { companyId: companyId as string },
        _count: { id: true },
      }),
      prisma.hiringTeamMember.groupBy({
        by: ['role'],
        where: { companyId: companyId as string, isActive: true },
        _count: { id: true },
      }),
      prisma.interviewPanel.count({
        where: { companyId: companyId as string, isActive: true },
      }),
      prisma.coverageSchedule.count({
        where: { companyId: companyId as string, status: 'ACTIVE' },
      }),
    ]);

    res.json({
      teamsByStatus: teams.reduce((acc, t) => ({ ...acc, [t.status]: t._count.id }), {}),
      membersByRole: members.reduce((acc, m) => ({ ...acc, [m.role]: m._count.id }), {}),
      activePanels: panels,
      activeCoverages: coverages,
    });
  } catch (error) {
    console.error('Error fetching hiring team stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
