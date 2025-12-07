import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApplicationStore, Application, ApplicationStatus, PipelineStage } from '../applicationStore';
import { act } from '@testing-library/react';

// Helper to reset store between tests
const resetStore = () => {
  act(() => {
    useApplicationStore.setState({
      applications: [],
      selectedIds: [],
      currentApplication: null,
      pipelineStages: [],
      pipelineJobId: null,
      filters: {},
      sortBy: 'appliedAt',
      sortOrder: 'desc',
      page: 1,
      pageSize: 20,
      totalCount: 0,
      isLoading: false,
      isUpdating: false,
    });
  });
};

// Mock application factory
const createMockApplication = (overrides: Partial<Application> = {}): Application => ({
  id: `app-${Math.random().toString(36).slice(2)}`,
  jobId: 'job-1',
  jobTitle: 'Software Engineer',
  candidateId: 'candidate-1',
  candidateName: 'John Doe',
  candidateEmail: 'john@example.com',
  status: 'new',
  score: 85,
  source: 'linkedin',
  appliedAt: '2024-12-01T00:00:00Z',
  updatedAt: '2024-12-01T00:00:00Z',
  tags: [],
  ...overrides,
});

describe('applicationStore', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useApplicationStore.getState();

      expect(state.applications).toEqual([]);
      expect(state.selectedIds).toEqual([]);
      expect(state.currentApplication).toBeNull();
      expect(state.pipelineStages).toEqual([]);
      expect(state.pipelineJobId).toBeNull();
      expect(state.filters).toEqual({});
      expect(state.sortBy).toBe('appliedAt');
      expect(state.sortOrder).toBe('desc');
      expect(state.page).toBe(1);
      expect(state.pageSize).toBe(20);
      expect(state.totalCount).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.isUpdating).toBe(false);
    });
  });

  describe('setApplications', () => {
    it('should set applications array', () => {
      const apps = [createMockApplication(), createMockApplication()];

      act(() => {
        useApplicationStore.getState().setApplications(apps);
      });

      expect(useApplicationStore.getState().applications).toEqual(apps);
    });
  });

  describe('addApplication', () => {
    it('should add application to beginning of list', () => {
      const existingApp = createMockApplication({ id: 'app-1' });
      const newApp = createMockApplication({ id: 'app-2' });

      act(() => {
        useApplicationStore.getState().setApplications([existingApp]);
        useApplicationStore.getState().addApplication(newApp);
      });

      const state = useApplicationStore.getState();
      expect(state.applications.length).toBe(2);
      expect(state.applications[0].id).toBe('app-2');
      expect(state.totalCount).toBe(1);
    });
  });

  describe('updateApplication', () => {
    it('should update application by id', () => {
      const app = createMockApplication({ id: 'app-1', status: 'new' });

      act(() => {
        useApplicationStore.getState().setApplications([app]);
        useApplicationStore.getState().updateApplication('app-1', { status: 'interview' });
      });

      expect(useApplicationStore.getState().applications[0].status).toBe('interview');
    });

    it('should also update currentApplication if it matches', () => {
      const app = createMockApplication({ id: 'app-1', status: 'new' });

      act(() => {
        useApplicationStore.getState().setApplications([app]);
        useApplicationStore.getState().setCurrentApplication(app);
        useApplicationStore.getState().updateApplication('app-1', { status: 'interview' });
      });

      expect(useApplicationStore.getState().currentApplication?.status).toBe('interview');
    });
  });

  describe('removeApplication', () => {
    it('should remove application by id', () => {
      const app1 = createMockApplication({ id: 'app-1' });
      const app2 = createMockApplication({ id: 'app-2' });

      act(() => {
        useApplicationStore.getState().setApplications([app1, app2]);
        useApplicationStore.setState({ totalCount: 2 });
        useApplicationStore.getState().removeApplication('app-1');
      });

      const state = useApplicationStore.getState();
      expect(state.applications.length).toBe(1);
      expect(state.applications[0].id).toBe('app-2');
      expect(state.totalCount).toBe(1);
    });

    it('should clear currentApplication if it was removed', () => {
      const app = createMockApplication({ id: 'app-1' });

      act(() => {
        useApplicationStore.getState().setApplications([app]);
        useApplicationStore.getState().setCurrentApplication(app);
        useApplicationStore.getState().removeApplication('app-1');
      });

      expect(useApplicationStore.getState().currentApplication).toBeNull();
    });

    it('should remove from selectedIds', () => {
      const app = createMockApplication({ id: 'app-1' });

      act(() => {
        useApplicationStore.getState().setApplications([app]);
        useApplicationStore.getState().selectApplication('app-1');
        useApplicationStore.getState().removeApplication('app-1');
      });

      expect(useApplicationStore.getState().selectedIds).not.toContain('app-1');
    });
  });

  describe('selection actions', () => {
    const apps = [
      createMockApplication({ id: 'app-1' }),
      createMockApplication({ id: 'app-2' }),
      createMockApplication({ id: 'app-3' }),
    ];

    beforeEach(() => {
      act(() => {
        useApplicationStore.getState().setApplications(apps);
      });
    });

    it('selectApplication should add id to selectedIds', () => {
      act(() => {
        useApplicationStore.getState().selectApplication('app-1');
      });

      expect(useApplicationStore.getState().selectedIds).toContain('app-1');
    });

    it('selectApplication should not duplicate ids', () => {
      act(() => {
        useApplicationStore.getState().selectApplication('app-1');
        useApplicationStore.getState().selectApplication('app-1');
      });

      expect(useApplicationStore.getState().selectedIds.filter(id => id === 'app-1').length).toBe(1);
    });

    it('deselectApplication should remove id from selectedIds', () => {
      act(() => {
        useApplicationStore.getState().selectApplication('app-1');
        useApplicationStore.getState().selectApplication('app-2');
        useApplicationStore.getState().deselectApplication('app-1');
      });

      const selectedIds = useApplicationStore.getState().selectedIds;
      expect(selectedIds).not.toContain('app-1');
      expect(selectedIds).toContain('app-2');
    });

    it('selectAll should select all applications', () => {
      act(() => {
        useApplicationStore.getState().selectAll();
      });

      expect(useApplicationStore.getState().selectedIds).toEqual(['app-1', 'app-2', 'app-3']);
    });

    it('deselectAll should clear selectedIds', () => {
      act(() => {
        useApplicationStore.getState().selectAll();
        useApplicationStore.getState().deselectAll();
      });

      expect(useApplicationStore.getState().selectedIds).toEqual([]);
    });

    it('toggleSelection should toggle selection state', () => {
      act(() => {
        useApplicationStore.getState().toggleSelection('app-1');
      });
      expect(useApplicationStore.getState().selectedIds).toContain('app-1');

      act(() => {
        useApplicationStore.getState().toggleSelection('app-1');
      });
      expect(useApplicationStore.getState().selectedIds).not.toContain('app-1');
    });
  });

  describe('pipeline actions', () => {
    it('setPipelineStages should set stages', () => {
      const stages: PipelineStage[] = [
        { id: 'stage-1', name: 'New', status: 'new', count: 5, applications: [] },
        { id: 'stage-2', name: 'Interview', status: 'interview', count: 3, applications: [] },
      ];

      act(() => {
        useApplicationStore.getState().setPipelineStages(stages);
      });

      expect(useApplicationStore.getState().pipelineStages).toEqual(stages);
    });

    it('setPipelineJobId should set job id', () => {
      act(() => {
        useApplicationStore.getState().setPipelineJobId('job-1');
      });

      expect(useApplicationStore.getState().pipelineJobId).toBe('job-1');
    });

    it('moveApplicationInPipeline should update application status and stages', () => {
      const app = createMockApplication({ id: 'app-1', status: 'new' });
      const stages: PipelineStage[] = [
        { id: 'stage-1', name: 'New', status: 'new', count: 1, applications: [app] },
        { id: 'stage-2', name: 'Interview', status: 'interview', count: 0, applications: [] },
      ];

      act(() => {
        useApplicationStore.getState().setApplications([app]);
        useApplicationStore.getState().setPipelineStages(stages);
        useApplicationStore.getState().moveApplicationInPipeline('app-1', 'new', 'interview');
      });

      const state = useApplicationStore.getState();
      expect(state.applications[0].status).toBe('interview');
      expect(state.pipelineStages[0].count).toBe(0);
      expect(state.pipelineStages[1].count).toBe(1);
    });
  });

  describe('filter actions', () => {
    it('setFilters should merge with existing filters', () => {
      act(() => {
        useApplicationStore.getState().setFilters({ status: ['new'] });
        useApplicationStore.getState().setFilters({ jobId: 'job-1' });
      });

      const filters = useApplicationStore.getState().filters;
      expect(filters.status).toEqual(['new']);
      expect(filters.jobId).toBe('job-1');
    });

    it('setFilters should reset page to 1', () => {
      act(() => {
        useApplicationStore.getState().setPage(5);
        useApplicationStore.getState().setFilters({ status: ['new'] });
      });

      expect(useApplicationStore.getState().page).toBe(1);
    });

    it('clearFilters should reset filters and page', () => {
      act(() => {
        useApplicationStore.getState().setFilters({ status: ['new'], jobId: 'job-1' });
        useApplicationStore.getState().setPage(3);
        useApplicationStore.getState().clearFilters();
      });

      expect(useApplicationStore.getState().filters).toEqual({});
      expect(useApplicationStore.getState().page).toBe(1);
    });

    it('setSearch should update search filter', () => {
      act(() => {
        useApplicationStore.getState().setSearch('john doe');
      });

      expect(useApplicationStore.getState().filters.search).toBe('john doe');
    });

    it('setSorting should update sort options', () => {
      act(() => {
        useApplicationStore.getState().setSorting('score', 'asc');
      });

      const state = useApplicationStore.getState();
      expect(state.sortBy).toBe('score');
      expect(state.sortOrder).toBe('asc');
    });
  });

  describe('pagination actions', () => {
    it('setPage should update page', () => {
      act(() => {
        useApplicationStore.getState().setPage(3);
      });

      expect(useApplicationStore.getState().page).toBe(3);
    });

    it('setPageSize should update pageSize and reset page', () => {
      act(() => {
        useApplicationStore.getState().setPage(5);
        useApplicationStore.getState().setPageSize(50);
      });

      const state = useApplicationStore.getState();
      expect(state.pageSize).toBe(50);
      expect(state.page).toBe(1);
    });

    it('setTotalCount should update totalCount', () => {
      act(() => {
        useApplicationStore.getState().setTotalCount(100);
      });

      expect(useApplicationStore.getState().totalCount).toBe(100);
    });
  });

  describe('loading actions', () => {
    it('setLoading should update isLoading', () => {
      act(() => {
        useApplicationStore.getState().setLoading(true);
      });

      expect(useApplicationStore.getState().isLoading).toBe(true);
    });

    it('setUpdating should update isUpdating', () => {
      act(() => {
        useApplicationStore.getState().setUpdating(true);
      });

      expect(useApplicationStore.getState().isUpdating).toBe(true);
    });
  });

  describe('bulk operations', () => {
    const apps = [
      createMockApplication({ id: 'app-1', status: 'new' }),
      createMockApplication({ id: 'app-2', status: 'new' }),
      createMockApplication({ id: 'app-3', status: 'interview' }),
    ];

    beforeEach(() => {
      act(() => {
        useApplicationStore.getState().setApplications(apps);
      });
    });

    it('bulkUpdateStatus should update status for multiple applications', () => {
      act(() => {
        useApplicationStore.getState().bulkUpdateStatus(['app-1', 'app-2'], 'interview');
      });

      const state = useApplicationStore.getState();
      expect(state.applications.find(a => a.id === 'app-1')?.status).toBe('interview');
      expect(state.applications.find(a => a.id === 'app-2')?.status).toBe('interview');
      expect(state.applications.find(a => a.id === 'app-3')?.status).toBe('interview'); // unchanged from before
    });

    it('bulkAssign should assign multiple applications', () => {
      act(() => {
        useApplicationStore.getState().bulkAssign(['app-1', 'app-2'], 'recruiter-1');
      });

      const state = useApplicationStore.getState();
      expect(state.applications.find(a => a.id === 'app-1')?.assignedTo).toBe('recruiter-1');
      expect(state.applications.find(a => a.id === 'app-2')?.assignedTo).toBe('recruiter-1');
    });

    it('bulkAddTags should add tags to multiple applications', () => {
      act(() => {
        useApplicationStore.getState().bulkAddTags(['app-1', 'app-2'], ['urgent', 'senior']);
      });

      const state = useApplicationStore.getState();
      expect(state.applications.find(a => a.id === 'app-1')?.tags).toContain('urgent');
      expect(state.applications.find(a => a.id === 'app-1')?.tags).toContain('senior');
    });

    it('bulkAddTags should not duplicate existing tags', () => {
      act(() => {
        const appWithTags = createMockApplication({ id: 'app-4', tags: ['existing'] });
        useApplicationStore.getState().setApplications([appWithTags]);
        useApplicationStore.getState().bulkAddTags(['app-4'], ['existing', 'new']);
      });

      const tags = useApplicationStore.getState().applications.find(a => a.id === 'app-4')?.tags;
      expect(tags?.filter(t => t === 'existing').length).toBe(1);
    });
  });

  describe('getters', () => {
    const apps = [
      createMockApplication({ id: 'app-1', status: 'new' }),
      createMockApplication({ id: 'app-2', status: 'interview' }),
      createMockApplication({ id: 'app-3', status: 'new' }),
    ];

    beforeEach(() => {
      act(() => {
        useApplicationStore.getState().setApplications(apps);
      });
    });

    it('getApplicationById should return application by id', () => {
      const app = useApplicationStore.getState().getApplicationById('app-2');
      expect(app?.id).toBe('app-2');
    });

    it('getApplicationById should return undefined for non-existent id', () => {
      const app = useApplicationStore.getState().getApplicationById('non-existent');
      expect(app).toBeUndefined();
    });

    it('getApplicationsByStatus should return applications with matching status', () => {
      const newApps = useApplicationStore.getState().getApplicationsByStatus('new');
      expect(newApps.length).toBe(2);
      expect(newApps.every(a => a.status === 'new')).toBe(true);
    });
  });

  describe('getFilteredApplications', () => {
    const apps = [
      createMockApplication({
        id: 'app-1',
        status: 'new',
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        jobId: 'job-1',
        jobTitle: 'Frontend Developer',
        score: 90,
        appliedAt: '2024-12-01T00:00:00Z',
        tags: ['urgent'],
        assignedTo: 'recruiter-1',
      }),
      createMockApplication({
        id: 'app-2',
        status: 'interview',
        candidateName: 'Jane Smith',
        candidateEmail: 'jane@example.com',
        jobId: 'job-2',
        jobTitle: 'Backend Developer',
        score: 75,
        appliedAt: '2024-11-15T00:00:00Z',
        tags: ['senior'],
        assignedTo: 'recruiter-2',
      }),
      createMockApplication({
        id: 'app-3',
        status: 'new',
        candidateName: 'Bob Johnson',
        candidateEmail: 'bob@example.com',
        jobId: 'job-1',
        jobTitle: 'Frontend Developer',
        score: 60,
        appliedAt: '2024-12-05T00:00:00Z',
        tags: ['urgent', 'referral'],
      }),
    ];

    beforeEach(() => {
      act(() => {
        useApplicationStore.getState().setApplications(apps);
      });
    });

    it('should filter by status', () => {
      act(() => {
        useApplicationStore.getState().setFilters({ status: ['new'] });
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(2);
      expect(filtered.every(a => a.status === 'new')).toBe(true);
    });

    it('should filter by jobId', () => {
      act(() => {
        useApplicationStore.getState().setFilters({ jobId: 'job-1' });
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(2);
      expect(filtered.every(a => a.jobId === 'job-1')).toBe(true);
    });

    it('should filter by search term in name', () => {
      act(() => {
        useApplicationStore.getState().setSearch('john');
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(2); // John Doe and Bob Johnson
    });

    it('should filter by search term in email', () => {
      act(() => {
        useApplicationStore.getState().setSearch('jane@');
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(1);
      expect(filtered[0].candidateEmail).toBe('jane@example.com');
    });

    it('should filter by search term in job title', () => {
      act(() => {
        useApplicationStore.getState().setSearch('frontend');
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(2);
    });

    it('should filter by assignedTo', () => {
      act(() => {
        useApplicationStore.getState().setFilters({ assignedTo: 'recruiter-1' });
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(1);
      expect(filtered[0].assignedTo).toBe('recruiter-1');
    });

    it('should filter by tags', () => {
      act(() => {
        useApplicationStore.getState().setFilters({ tags: ['urgent'] });
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(2);
    });

    it('should filter by score range', () => {
      act(() => {
        useApplicationStore.getState().setFilters({
          scoreRange: { min: 70, max: 100 }
        });
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(2);
      expect(filtered.every(a => a.score! >= 70 && a.score! <= 100)).toBe(true);
    });

    it('should filter by date range', () => {
      act(() => {
        useApplicationStore.getState().setFilters({
          dateRange: { start: '2024-12-01', end: '2024-12-31' }
        });
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(2);
    });

    it('should sort results by sortBy and sortOrder', () => {
      act(() => {
        useApplicationStore.getState().setSorting('score', 'desc');
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered[0].score).toBe(90);
      expect(filtered[2].score).toBe(60);
    });

    it('should combine multiple filters', () => {
      act(() => {
        useApplicationStore.getState().setFilters({
          status: ['new'],
          jobId: 'job-1',
        });
      });

      const filtered = useApplicationStore.getState().getFilteredApplications();
      expect(filtered.length).toBe(2);
      expect(filtered.every(a => a.status === 'new' && a.jobId === 'job-1')).toBe(true);
    });
  });

  describe('selectors', () => {
    it('selectApplications should return applications', () => {
      const apps = [createMockApplication()];

      act(() => {
        useApplicationStore.getState().setApplications(apps);
      });

      const { selectApplications } = require('../applicationStore');
      expect(selectApplications(useApplicationStore.getState())).toEqual(apps);
    });

    it('selectSelectedIds should return selected ids', () => {
      act(() => {
        useApplicationStore.setState({ selectedIds: ['app-1', 'app-2'] });
      });

      const { selectSelectedIds } = require('../applicationStore');
      expect(selectSelectedIds(useApplicationStore.getState())).toEqual(['app-1', 'app-2']);
    });

    it('selectPagination should return pagination info', () => {
      act(() => {
        useApplicationStore.getState().setPage(2);
        useApplicationStore.getState().setPageSize(50);
        useApplicationStore.getState().setTotalCount(100);
      });

      const { selectPagination } = require('../applicationStore');
      expect(selectPagination(useApplicationStore.getState())).toEqual({
        page: 2,
        pageSize: 50,
        totalCount: 100,
      });
    });
  });
});
