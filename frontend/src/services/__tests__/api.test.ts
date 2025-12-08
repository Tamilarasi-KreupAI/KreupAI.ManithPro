import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authAPI, jobAPI, applicationAPI, userAPI, savedJobAPI, companyAPI } from '../api';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const originalLocation = window.location;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Use fake timers to speed up mock delays
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('authAPI', () => {
    describe('register', () => {
      it('should return user and token on successful registration', async () => {
        const registerData = {
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        };

        const promise = authAPI.register(registerData);
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Registration successful');
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('token');
        expect(result.user.email).toBe(registerData.email);
      });
    });

    describe('login', () => {
      it('should return user and token on successful login', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123',
        };

        const promise = authAPI.login(loginData);
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Login successful');
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('token', 'mock-jwt-token');
      });

      it('should find user by email (case insensitive)', async () => {
        const loginData = {
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        };

        const promise = authAPI.login(loginData);
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result.user).toBeDefined();
      });
    });

    describe('getCurrentUser', () => {
      it('should return current user', async () => {
        const promise = authAPI.getCurrentUser();
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('firstName');
        expect(result).toHaveProperty('lastName');
      });
    });
  });

  describe('jobAPI', () => {
    describe('getAll', () => {
      it('should return jobs array with pagination', async () => {
        const promise = jobAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('jobs');
        expect(result).toHaveProperty('pagination');
        expect(Array.isArray(result.jobs)).toBe(true);
        expect(result.pagination).toHaveProperty('total');
        expect(result.pagination).toHaveProperty('pages');
      });

      it('should accept optional params', async () => {
        const params = { page: 1, limit: 10, status: 'open' };
        const promise = jobAPI.getAll(params);
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('jobs');
      });
    });

    describe('getById', () => {
      it('should return job by id', async () => {
        // First get all jobs to get a valid ID
        const allJobsPromise = jobAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const allJobs = await allJobsPromise;
        const jobId = allJobs.jobs[0]?.id;

        if (jobId) {
          const promise = jobAPI.getById(jobId);
          await vi.advanceTimersByTimeAsync(600);
          const result = await promise;

          expect(result).toHaveProperty('id', jobId);
          expect(result).toHaveProperty('title');
        }
      });

      it('should reject if job not found', async () => {
        const promise = jobAPI.getById('non-existent-id');
        await vi.advanceTimersByTimeAsync(600);

        await expect(promise).rejects.toThrow('Job not found');
      });
    });

    describe('create', () => {
      it('should create a new job', async () => {
        const jobData = {
          title: 'New Software Engineer',
          description: 'Build amazing things',
          department: 'Engineering',
        };

        const promise = jobAPI.create(jobData);
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Job created');
        expect(result).toHaveProperty('job');
        expect(result.job).toHaveProperty('id');
      });
    });

    describe('update', () => {
      it('should update an existing job', async () => {
        const allJobsPromise = jobAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const allJobs = await allJobsPromise;
        const jobId = allJobs.jobs[0]?.id;

        if (jobId) {
          const updateData = { title: 'Updated Title' };
          const promise = jobAPI.update(jobId, updateData);
          await vi.advanceTimersByTimeAsync(600);
          const result = await promise;

          expect(result).toHaveProperty('message', 'Job updated');
          expect(result).toHaveProperty('job');
        }
      });
    });

    describe('delete', () => {
      it('should delete a job', async () => {
        const promise = jobAPI.delete('some-id');
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Job deleted');
      });
    });
  });

  describe('applicationAPI', () => {
    describe('getAll', () => {
      it('should return applications array with pagination', async () => {
        const promise = applicationAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('applications');
        expect(result).toHaveProperty('pagination');
        expect(Array.isArray(result.applications)).toBe(true);
      });
    });

    describe('getById', () => {
      it('should return application by id', async () => {
        const allAppsPromise = applicationAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const allApps = await allAppsPromise;
        const appId = allApps.applications[0]?.id;

        if (appId) {
          const promise = applicationAPI.getById(appId);
          await vi.advanceTimersByTimeAsync(600);
          const result = await promise;

          expect(result).toHaveProperty('id', appId);
        }
      });

      it('should reject if application not found', async () => {
        const promise = applicationAPI.getById('non-existent-id');
        await vi.advanceTimersByTimeAsync(600);

        await expect(promise).rejects.toThrow('Application not found');
      });
    });

    describe('create', () => {
      it('should create a new application', async () => {
        const formData = new FormData();
        formData.append('jobId', 'job-1');
        formData.append('coverLetter', 'I am excited to apply...');

        const promise = applicationAPI.create(formData);
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Application submitted');
        expect(result).toHaveProperty('application');
      });
    });

    describe('updateStatus', () => {
      it('should update application status', async () => {
        const allAppsPromise = applicationAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const allApps = await allAppsPromise;
        const appId = allApps.applications[0]?.id;

        if (appId) {
          const promise = applicationAPI.updateStatus(appId, {
            status: 'INTERVIEW',
            notes: 'Moved to interview stage',
          });
          await vi.advanceTimersByTimeAsync(600);
          const result = await promise;

          expect(result).toHaveProperty('message', 'Status updated');
          expect(result).toHaveProperty('application');
        }
      });
    });

    describe('withdraw', () => {
      it('should withdraw an application', async () => {
        const allAppsPromise = applicationAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const allApps = await allAppsPromise;
        const appId = allApps.applications[0]?.id;

        if (appId) {
          const promise = applicationAPI.withdraw(appId);
          await vi.advanceTimersByTimeAsync(600);
          const result = await promise;

          expect(result).toHaveProperty('message', 'Application withdrawn');
          expect(result.application.status).toBe('WITHDRAWN');
        }
      });
    });
  });

  describe('userAPI', () => {
    describe('getProfile', () => {
      it('should return user profile', async () => {
        const promise = userAPI.getProfile();
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('firstName');
        expect(result).toHaveProperty('lastName');
      });
    });

    describe('updateProfile', () => {
      it('should update user profile', async () => {
        const updateData = { firstName: 'Updated', lastName: 'Name' };

        const promise = userAPI.updateProfile(updateData);
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Profile updated');
        expect(result).toHaveProperty('user');
      });
    });

    describe('changePassword', () => {
      it('should change user password', async () => {
        const passwordData = {
          currentPassword: 'oldPassword',
          newPassword: 'newPassword123',
        };

        const promise = userAPI.changePassword(passwordData);
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Password changed');
      });
    });

    describe('getDashboardStats', () => {
      it('should return dashboard statistics', async () => {
        const promise = userAPI.getDashboardStats();
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('totalJobs');
        expect(result).toHaveProperty('openJobs');
        expect(result).toHaveProperty('totalApplications');
        expect(result).toHaveProperty('pendingApplications');
        expect(result).toHaveProperty('acceptedApplications');
        expect(result).toHaveProperty('recentApplications');
      });
    });
  });

  describe('savedJobAPI', () => {
    describe('getAll', () => {
      it('should return saved jobs array with pagination', async () => {
        const promise = savedJobAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('savedJobs');
        expect(result).toHaveProperty('pagination');
        expect(Array.isArray(result.savedJobs)).toBe(true);
      });
    });

    describe('save', () => {
      it('should save a job', async () => {
        const promise = savedJobAPI.save('job-123');
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Job saved');
        expect(result).toHaveProperty('savedJob');
        expect(result.savedJob).toHaveProperty('jobId', 'job-123');
      });
    });

    describe('unsave', () => {
      it('should unsave a job', async () => {
        const promise = savedJobAPI.unsave('job-123');
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('message', 'Job unsaved');
      });
    });

    describe('checkIfSaved', () => {
      it('should check if job is saved', async () => {
        const promise = savedJobAPI.checkIfSaved('job-123');
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('isSaved');
        expect(typeof result.isSaved).toBe('boolean');
      });
    });
  });

  describe('companyAPI', () => {
    describe('getAll', () => {
      it('should return companies array with pagination', async () => {
        const promise = companyAPI.getAll();
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('companies');
        expect(result).toHaveProperty('pagination');
        expect(Array.isArray(result.companies)).toBe(true);
      });
    });

    describe('getByName', () => {
      it('should return company by name with jobs', async () => {
        const promise = companyAPI.getByName('TechCorp');
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result).toHaveProperty('company');
        expect(result).toHaveProperty('jobs');
        expect(result.company).toHaveProperty('name', 'TechCorp');
      });
    });
  });

  describe('API Response Structure', () => {
    it('job should have required fields', async () => {
      const promise = jobAPI.getAll();
      await vi.advanceTimersByTimeAsync(600);
      const result = await promise;

      if (result.jobs.length > 0) {
        const job = result.jobs[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('title');
      }
    });

    it('application should have required fields', async () => {
      const promise = applicationAPI.getAll();
      await vi.advanceTimersByTimeAsync(600);
      const result = await promise;

      if (result.applications.length > 0) {
        const app = result.applications[0];
        expect(app).toHaveProperty('id');
        expect(app).toHaveProperty('status');
      }
    });

    it('user should have required fields', async () => {
      const promise = userAPI.getProfile();
      await vi.advanceTimersByTimeAsync(600);
      const user = await promise;

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('role');
    });
  });
});
