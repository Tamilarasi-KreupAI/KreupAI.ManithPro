/**
 * Product Tour Service
 * Manages interactive onboarding tours for new users
 */

export interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  showSkip?: boolean;
  highlightPadding?: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  triggerCondition?: 'first_login' | 'manual' | 'feature_access';
  requiredRole?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
}

class TourService {
  private static instance: TourService;
  private currentTour: Tour | null = null;
  private currentStepIndex: number = 0;
  private tourCompletionKey = 'completed_tours';
  private onStepChangeCallbacks: ((step: TourStep | null, index: number) => void)[] = [];
  private onTourEndCallbacks: (() => void)[] = [];

  private constructor() {}

  static getInstance(): TourService {
    if (!TourService.instance) {
      TourService.instance = new TourService();
    }
    return TourService.instance;
  }

  /**
   * Predefined tours for different user journeys
   */
  private tours: Tour[] = [
    {
      id: 'candidate_welcome',
      name: 'Welcome Tour - Candidate',
      description: 'Get started with the recruitment platform',
      requiredRole: 'CANDIDATE',
      triggerCondition: 'first_login',
      steps: [
        {
          id: 'welcome',
          target: 'body',
          title: 'Welcome to the Platform! 🎉',
          content: 'Let\'s take a quick tour to help you get started. You can skip this tour anytime.',
          placement: 'center',
          showSkip: true,
        },
        {
          id: 'profile',
          target: '[data-tour="profile-menu"]',
          title: 'Your Profile',
          content: 'Complete your profile to attract recruiters. Add your skills, experience, and portfolio.',
          placement: 'bottom',
        },
        {
          id: 'jobs',
          target: '[data-tour="jobs-link"]',
          title: 'Browse Jobs',
          content: 'Explore thousands of job openings. Use filters to find positions that match your skills.',
          placement: 'bottom',
        },
        {
          id: 'applications',
          target: '[data-tour="applications-link"]',
          title: 'Track Applications',
          content: 'Monitor your job applications, view interview schedules, and receive notifications.',
          placement: 'bottom',
        },
        {
          id: 'messages',
          target: '[data-tour="messages-link"]',
          title: 'Messages',
          content: 'Communicate with recruiters, schedule interviews, and receive updates.',
          placement: 'bottom',
        },
        {
          id: 'verification',
          target: '[data-tour="verification-section"]',
          title: 'Build Trust',
          content: 'Verify your email, phone, and social profiles to build credibility with recruiters.',
          placement: 'left',
        },
        {
          id: 'complete',
          target: 'body',
          title: 'You\'re All Set! 🚀',
          content: 'You\'re ready to start your job search. Good luck!',
          placement: 'center',
        },
      ],
    },
    {
      id: 'recruiter_welcome',
      name: 'Welcome Tour - Recruiter',
      description: 'Learn how to find and hire top talent',
      requiredRole: 'RECRUITER',
      triggerCondition: 'first_login',
      steps: [
        {
          id: 'welcome',
          target: 'body',
          title: 'Welcome, Recruiter! 👔',
          content: 'Let\'s show you how to find and hire the best candidates.',
          placement: 'center',
          showSkip: true,
        },
        {
          id: 'post_job',
          target: '[data-tour="post-job-button"]',
          title: 'Post a Job',
          content: 'Create compelling job listings to attract qualified candidates.',
          placement: 'bottom',
        },
        {
          id: 'search_candidates',
          target: '[data-tour="candidates-link"]',
          title: 'Search Candidates',
          content: 'Search our database of verified candidates. Filter by skills, experience, and location.',
          placement: 'bottom',
        },
        {
          id: 'applications',
          target: '[data-tour="applications-link"]',
          title: 'Manage Applications',
          content: 'Review applications, schedule interviews, and track your hiring pipeline.',
          placement: 'bottom',
        },
        {
          id: 'messages',
          target: '[data-tour="messages-link"]',
          title: 'Communicate',
          content: 'Message candidates directly, share code snippets, and use templates.',
          placement: 'bottom',
        },
        {
          id: 'analytics',
          target: '[data-tour="analytics-section"]',
          title: 'Track Performance',
          content: 'Monitor your job post performance, response rates, and hiring metrics.',
          placement: 'left',
        },
        {
          id: 'complete',
          target: 'body',
          title: 'Start Hiring! 🎯',
          content: 'You\'re ready to find your next great hire. Happy recruiting!',
          placement: 'center',
        },
      ],
    },
    {
      id: 'messaging_feature',
      name: 'Messaging Features',
      description: 'Learn about advanced messaging capabilities',
      triggerCondition: 'manual',
      steps: [
        {
          id: 'templates',
          target: '[data-tour="message-templates"]',
          title: 'Message Templates',
          content: 'Save time with pre-built message templates for common scenarios.',
          placement: 'top',
        },
        {
          id: 'code_sharing',
          target: '[data-tour="code-snippet"]',
          title: 'Share Code',
          content: 'Share code snippets with syntax highlighting in 17+ languages.',
          placement: 'top',
        },
        {
          id: 'read_receipts',
          target: '[data-tour="message-status"]',
          title: 'Read Receipts',
          content: 'See when your messages are sent, delivered, and read.',
          placement: 'left',
        },
      ],
    },
  ];

  /**
   * Start a tour
   */
  startTour(tourId: string): boolean {
    const tour = this.tours.find(t => t.id === tourId);
    if (!tour) {
      console.error(`Tour ${tourId} not found`);
      return false;
    }

    // Check if tour was already completed
    if (this.isTourCompleted(tourId)) {
      return false;
    }

    this.currentTour = tour;
    this.currentStepIndex = 0;
    this.notifyStepChange();
    return true;
  }

  /**
   * Get current step
   */
  getCurrentStep(): TourStep | null {
    if (!this.currentTour || this.currentStepIndex >= this.currentTour.steps.length) {
      return null;
    }
    return this.currentTour.steps[this.currentStepIndex];
  }

  /**
   * Go to next step
   */
  nextStep(): void {
    if (!this.currentTour) return;

    if (this.currentStepIndex < this.currentTour.steps.length - 1) {
      this.currentStepIndex++;
      this.notifyStepChange();
    } else {
      this.completeTour();
    }
  }

  /**
   * Go to previous step
   */
  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.notifyStepChange();
    }
  }

  /**
   * Skip current tour
   */
  skipTour(): void {
    this.completeTour();
  }

  /**
   * Complete the current tour
   */
  private completeTour(): void {
    if (!this.currentTour) return;

    this.markTourCompleted(this.currentTour.id);
    const tourId = this.currentTour.id;
    this.currentTour = null;
    this.currentStepIndex = 0;
    this.notifyStepChange();
    this.notifyTourEnd();

    // Track completion
    this.trackTourCompletion(tourId);
  }

  /**
   * Mark tour as completed
   */
  private markTourCompleted(tourId: string): void {
    const completed = this.getCompletedTours();
    if (!completed.includes(tourId)) {
      completed.push(tourId);
      localStorage.setItem(this.tourCompletionKey, JSON.stringify(completed));
    }
  }

  /**
   * Check if tour is completed
   */
  isTourCompleted(tourId: string): boolean {
    return this.getCompletedTours().includes(tourId);
  }

  /**
   * Get list of completed tours
   */
  private getCompletedTours(): string[] {
    try {
      const stored = localStorage.getItem(this.tourCompletionKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Reset tour completion (for testing)
   */
  resetTour(tourId: string): void {
    const completed = this.getCompletedTours();
    const filtered = completed.filter(id => id !== tourId);
    localStorage.setItem(this.tourCompletionKey, JSON.stringify(filtered));
  }

  /**
   * Get all available tours
   */
  getAvailableTours(userRole?: string): Tour[] {
    return this.tours.filter(tour => {
      if (tour.requiredRole && tour.requiredRole !== userRole) {
        return false;
      }
      return true;
    });
  }

  /**
   * Subscribe to step changes
   */
  onStepChange(callback: (step: TourStep | null, index: number) => void): () => void {
    this.onStepChangeCallbacks.push(callback);
    return () => {
      this.onStepChangeCallbacks = this.onStepChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to tour end
   */
  onTourEnd(callback: () => void): () => void {
    this.onTourEndCallbacks.push(callback);
    return () => {
      this.onTourEndCallbacks = this.onTourEndCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify step change
   */
  private notifyStepChange(): void {
    const step = this.getCurrentStep();
    this.onStepChangeCallbacks.forEach(callback => {
      callback(step, this.currentStepIndex);
    });
  }

  /**
   * Notify tour end
   */
  private notifyTourEnd(): void {
    this.onTourEndCallbacks.forEach(callback => callback());
  }

  /**
   * Track tour completion (analytics)
   */
  private async trackTourCompletion(tourId: string): Promise<void> {
    try {
      await fetch('/api/analytics/tour-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tourId,
          completedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to track tour completion:', error);
    }
  }

  /**
   * Get current tour progress
   */
  getTourProgress(): { current: number; total: number; percentage: number } | null {
    if (!this.currentTour) return null;

    return {
      current: this.currentStepIndex + 1,
      total: this.currentTour.steps.length,
      percentage: ((this.currentStepIndex + 1) / this.currentTour.steps.length) * 100,
    };
  }
}

export const tourService = TourService.getInstance();
