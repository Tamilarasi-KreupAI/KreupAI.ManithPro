/**
 * Reference and Recommendation Service
 * Handles professional references and recommendations for candidates
 */

export interface Reference {
  id: string;
  candidateId: string;
  referenceProviderId?: string; // If they registered on the platform
  referenceName: string;
  referenceEmail: string;
  referencePhone?: string;
  company: string;
  jobTitle: string;
  relationship: 'MANAGER' | 'COLLEAGUE' | 'CLIENT' | 'MENTOR' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  requestedAt: Date;
  respondedAt?: Date;
  recommendation?: string;
  ratings?: {
    technicalSkills: number; // 1-5
    communication: number; // 1-5
    teamwork: number; // 1-5
    reliability: number; // 1-5
    leadership: number; // 1-5
  };
  isPublic: boolean;
}

export interface ReferenceRequest {
  referenceName: string;
  referenceEmail: string;
  referencePhone?: string;
  company: string;
  jobTitle: string;
  relationship: Reference['relationship'];
  personalMessage?: string;
}

export interface ReferenceStats {
  total: number;
  approved: number;
  pending: number;
  declined: number;
  averageRating: number;
}

class ReferenceService {
  private static instance: ReferenceService;
  private referencesCache: Map<string, Reference[]> = new Map();

  private constructor() {}

  static getInstance(): ReferenceService {
    if (!ReferenceService.instance) {
      ReferenceService.instance = new ReferenceService();
    }
    return ReferenceService.instance;
  }

  /**
   * Request a reference from someone
   */
  async requestReference(request: ReferenceRequest): Promise<{ success: boolean; message: string; referenceId?: string }> {
    try {
      const response = await fetch('/api/references/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok) {
        this.invalidateCache();
      }

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Reference request sent successfully' : 'Failed to send request'),
        referenceId: data.referenceId,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send reference request',
      };
    }
  }

  /**
   * Get all references for a candidate
   */
  async getCandidateReferences(candidateId: string, includePrivate: boolean = false): Promise<Reference[]> {
    const cacheKey = `${candidateId}-${includePrivate}`;

    // Check cache
    if (this.referencesCache.has(cacheKey)) {
      return this.referencesCache.get(cacheKey)!;
    }

    try {
      const response = await fetch(
        `/api/references/candidate/${candidateId}?includePrivate=${includePrivate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const references: Reference[] = data.map((ref: any) => ({
        id: ref.id,
        candidateId: ref.candidateId,
        referenceProviderId: ref.referenceProviderId,
        referenceName: ref.referenceName,
        referenceEmail: ref.referenceEmail,
        referencePhone: ref.referencePhone,
        company: ref.company,
        jobTitle: ref.jobTitle,
        relationship: ref.relationship,
        status: ref.status,
        requestedAt: new Date(ref.requestedAt),
        respondedAt: ref.respondedAt ? new Date(ref.respondedAt) : undefined,
        recommendation: ref.recommendation,
        ratings: ref.ratings,
        isPublic: ref.isPublic,
      }));

      // Cache the result
      this.referencesCache.set(cacheKey, references);

      return references;
    } catch (error) {
      console.error('Failed to fetch references:', error);
      return [];
    }
  }

  /**
   * Get reference statistics
   */
  async getReferenceStats(candidateId: string): Promise<ReferenceStats> {
    const references = await this.getCandidateReferences(candidateId, true);

    const stats: ReferenceStats = {
      total: references.length,
      approved: references.filter(r => r.status === 'APPROVED').length,
      pending: references.filter(r => r.status === 'PENDING').length,
      declined: references.filter(r => r.status === 'DECLINED').length,
      averageRating: 0,
    };

    // Calculate average rating
    const approvedWithRatings = references.filter(
      r => r.status === 'APPROVED' && r.ratings
    );

    if (approvedWithRatings.length > 0) {
      const totalRating = approvedWithRatings.reduce((sum, ref) => {
        if (!ref.ratings) return sum;
        const avgRating = (
          ref.ratings.technicalSkills +
          ref.ratings.communication +
          ref.ratings.teamwork +
          ref.ratings.reliability +
          ref.ratings.leadership
        ) / 5;
        return sum + avgRating;
      }, 0);

      stats.averageRating = totalRating / approvedWithRatings.length;
    }

    return stats;
  }

  /**
   * Provide a reference (for reference providers)
   */
  async provideReference(
    referenceId: string,
    data: {
      recommendation: string;
      ratings: Reference['ratings'];
      isPublic: boolean;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/references/${referenceId}/provide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        this.invalidateCache();
      }

      return {
        success: response.ok,
        message: responseData.message || (response.ok ? 'Reference submitted successfully' : 'Failed to submit reference'),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit reference',
      };
    }
  }

  /**
   * Decline a reference request
   */
  async declineReference(referenceId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/references/${referenceId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (response.ok) {
        this.invalidateCache();
      }

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Reference declined' : 'Failed to decline reference'),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to decline reference',
      };
    }
  }

  /**
   * Cancel a reference request
   */
  async cancelReference(referenceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/references/${referenceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        this.invalidateCache();
      }

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Reference request cancelled' : 'Failed to cancel request'),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to cancel reference request',
      };
    }
  }

  /**
   * Send reminder for pending reference
   */
  async sendReminder(referenceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/references/${referenceId}/remind`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Reminder sent successfully' : 'Failed to send reminder'),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send reminder',
      };
    }
  }

  /**
   * Clear cache
   */
  private invalidateCache(): void {
    this.referencesCache.clear();
  }
}

export const referenceService = ReferenceService.getInstance();
