import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ============================================================
// APPLICATION STORE - Job Applications State Management
// ============================================================

export type ApplicationStatus =
  | 'new'
  | 'screening'
  | 'phone_screen'
  | 'interview'
  | 'assessment'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string;
  status: ApplicationStatus;
  score?: number;
  source: string;
  appliedAt: string;
  updatedAt: string;
  currentStage?: string;
  notes?: string;
  tags?: string[];
  assignedTo?: string;
  interviews?: string[];
  assessments?: string[];
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  jobId?: string;
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  tags?: string[];
  scoreRange?: {
    min: number;
    max: number;
  };
}

export interface PipelineStage {
  id: string;
  name: string;
  status: ApplicationStatus;
  count: number;
  applications: Application[];
}

interface ApplicationState {
  // Data
  applications: Application[];
  selectedIds: string[];
  currentApplication: Application | null;

  // Pipeline View
  pipelineStages: PipelineStage[];
  pipelineJobId: string | null;

  // Filters & Search
  filters: ApplicationFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  // Pagination
  page: number;
  pageSize: number;
  totalCount: number;

  // Loading States
  isLoading: boolean;
  isUpdating: boolean;

  // Actions - Data
  setApplications: (applications: Application[]) => void;
  addApplication: (application: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  removeApplication: (id: string) => void;
  setCurrentApplication: (application: Application | null) => void;

  // Actions - Selection
  selectApplication: (id: string) => void;
  deselectApplication: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelection: (id: string) => void;

  // Actions - Pipeline
  setPipelineStages: (stages: PipelineStage[]) => void;
  setPipelineJobId: (jobId: string | null) => void;
  moveApplicationInPipeline: (
    applicationId: string,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus
  ) => void;

  // Actions - Filters
  setFilters: (filters: ApplicationFilters) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;

  // Actions - Pagination
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalCount: (count: number) => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;
  setUpdating: (updating: boolean) => void;

  // Actions - Bulk Operations
  bulkUpdateStatus: (ids: string[], status: ApplicationStatus) => void;
  bulkAssign: (ids: string[], assignedTo: string) => void;
  bulkAddTags: (ids: string[], tags: string[]) => void;

  // Getters
  getApplicationById: (id: string) => Application | undefined;
  getApplicationsByStatus: (status: ApplicationStatus) => Application[];
  getFilteredApplications: () => Application[];
}

const initialFilters: ApplicationFilters = {};

const initialState = {
  applications: [],
  selectedIds: [],
  currentApplication: null,
  pipelineStages: [],
  pipelineJobId: null,
  filters: initialFilters,
  sortBy: 'appliedAt',
  sortOrder: 'desc' as const,
  page: 1,
  pageSize: 20,
  totalCount: 0,
  isLoading: false,
  isUpdating: false,
};

export const useApplicationStore = create<ApplicationState>()(
  immer((set, get) => ({
    ...initialState,

    // Data Actions
    setApplications: (applications) =>
      set((state) => {
        state.applications = applications;
      }),

    addApplication: (application) =>
      set((state) => {
        state.applications.unshift(application);
        state.totalCount += 1;
      }),

    updateApplication: (id, updates) =>
      set((state) => {
        const index = state.applications.findIndex((a) => a.id === id);
        if (index !== -1) {
          Object.assign(state.applications[index], updates);
        }
        if (state.currentApplication?.id === id) {
          Object.assign(state.currentApplication, updates);
        }
      }),

    removeApplication: (id) =>
      set((state) => {
        state.applications = state.applications.filter((a) => a.id !== id);
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
        if (state.currentApplication?.id === id) {
          state.currentApplication = null;
        }
        state.totalCount -= 1;
      }),

    setCurrentApplication: (application) =>
      set((state) => {
        state.currentApplication = application;
      }),

    // Selection Actions
    selectApplication: (id) =>
      set((state) => {
        if (!state.selectedIds.includes(id)) {
          state.selectedIds.push(id);
        }
      }),

    deselectApplication: (id) =>
      set((state) => {
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
      }),

    selectAll: () =>
      set((state) => {
        state.selectedIds = state.applications.map((a) => a.id);
      }),

    deselectAll: () =>
      set((state) => {
        state.selectedIds = [];
      }),

    toggleSelection: (id) =>
      set((state) => {
        if (state.selectedIds.includes(id)) {
          state.selectedIds = state.selectedIds.filter((i) => i !== id);
        } else {
          state.selectedIds.push(id);
        }
      }),

    // Pipeline Actions
    setPipelineStages: (stages) =>
      set((state) => {
        state.pipelineStages = stages;
      }),

    setPipelineJobId: (jobId) =>
      set((state) => {
        state.pipelineJobId = jobId;
      }),

    moveApplicationInPipeline: (applicationId, fromStatus, toStatus) =>
      set((state) => {
        // Update application status
        const app = state.applications.find((a) => a.id === applicationId);
        if (app) {
          app.status = toStatus;
          app.updatedAt = new Date().toISOString();
        }

        // Update pipeline stages
        const fromStage = state.pipelineStages.find(
          (s) => s.status === fromStatus
        );
        const toStage = state.pipelineStages.find((s) => s.status === toStatus);

        if (fromStage && toStage && app) {
          fromStage.applications = fromStage.applications.filter(
            (a) => a.id !== applicationId
          );
          fromStage.count -= 1;
          toStage.applications.push(app);
          toStage.count += 1;
        }
      }),

    // Filter Actions
    setFilters: (filters) =>
      set((state) => {
        state.filters = { ...state.filters, ...filters };
        state.page = 1;
      }),

    clearFilters: () =>
      set((state) => {
        state.filters = initialFilters;
        state.page = 1;
      }),

    setSearch: (search) =>
      set((state) => {
        state.filters.search = search;
        state.page = 1;
      }),

    setSorting: (sortBy, sortOrder) =>
      set((state) => {
        state.sortBy = sortBy;
        state.sortOrder = sortOrder;
      }),

    // Pagination Actions
    setPage: (page) =>
      set((state) => {
        state.page = page;
      }),

    setPageSize: (pageSize) =>
      set((state) => {
        state.pageSize = pageSize;
        state.page = 1;
      }),

    setTotalCount: (count) =>
      set((state) => {
        state.totalCount = count;
      }),

    // Loading Actions
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setUpdating: (updating) =>
      set((state) => {
        state.isUpdating = updating;
      }),

    // Bulk Operations
    bulkUpdateStatus: (ids, status) =>
      set((state) => {
        ids.forEach((id) => {
          const app = state.applications.find((a) => a.id === id);
          if (app) {
            app.status = status;
            app.updatedAt = new Date().toISOString();
          }
        });
      }),

    bulkAssign: (ids, assignedTo) =>
      set((state) => {
        ids.forEach((id) => {
          const app = state.applications.find((a) => a.id === id);
          if (app) {
            app.assignedTo = assignedTo;
            app.updatedAt = new Date().toISOString();
          }
        });
      }),

    bulkAddTags: (ids, tags) =>
      set((state) => {
        ids.forEach((id) => {
          const app = state.applications.find((a) => a.id === id);
          if (app) {
            app.tags = [...new Set([...(app.tags || []), ...tags])];
            app.updatedAt = new Date().toISOString();
          }
        });
      }),

    // Getters
    getApplicationById: (id) => get().applications.find((a) => a.id === id),

    getApplicationsByStatus: (status) =>
      get().applications.filter((a) => a.status === status),

    getFilteredApplications: () => {
      const { applications, filters, sortBy, sortOrder } = get();
      let filtered = [...applications];

      // Apply filters
      if (filters.status?.length) {
        filtered = filtered.filter((a) => filters.status!.includes(a.status));
      }
      if (filters.jobId) {
        filtered = filtered.filter((a) => a.jobId === filters.jobId);
      }
      if (filters.assignedTo) {
        filtered = filtered.filter((a) => a.assignedTo === filters.assignedTo);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.candidateName.toLowerCase().includes(search) ||
            a.candidateEmail.toLowerCase().includes(search) ||
            a.jobTitle.toLowerCase().includes(search)
        );
      }
      if (filters.tags?.length) {
        filtered = filtered.filter((a) =>
          filters.tags!.some((tag) => a.tags?.includes(tag))
        );
      }
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        filtered = filtered.filter((a) => {
          const date = new Date(a.appliedAt);
          return date >= start && date <= end;
        });
      }
      if (filters.scoreRange) {
        filtered = filtered.filter(
          (a) =>
            a.score !== undefined &&
            a.score >= filters.scoreRange!.min &&
            a.score <= filters.scoreRange!.max
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let comparison = 0;
        const aValue = a[sortBy as keyof Application];
        const bValue = b[sortBy as keyof Application];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    },
  }))
);

// Selectors
export const selectApplications = (state: ApplicationState) => state.applications;
export const selectSelectedIds = (state: ApplicationState) => state.selectedIds;
export const selectCurrentApplication = (state: ApplicationState) =>
  state.currentApplication;
export const selectFilters = (state: ApplicationState) => state.filters;
export const selectPagination = (state: ApplicationState) => ({
  page: state.page,
  pageSize: state.pageSize,
  totalCount: state.totalCount,
});
