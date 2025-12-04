import { jobAPI, applicationAPI } from './api';

interface SkillMatch {
  skill: string;
  matched: boolean;
}

interface JobRecommendation {
  job: any;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  salaryMatch: boolean;
  locationMatch: boolean;
  reasons: string[];
}

interface CandidateRecommendation {
  candidate: any;
  matchScore: number;
  matchedSkills: string[];
  experienceMatch: boolean;
  salaryMatch: boolean;
  reasons: string[];
}

interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  learningResources: string[];
}

class RecommendationService {
  // Calculate similarity between two skill sets
  private calculateSkillMatch(userSkills: string[], requiredSkills: string[]): number {
    if (!userSkills || !requiredSkills || requiredSkills.length === 0) return 0;

    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase());

    const matchedSkills = normalizedRequiredSkills.filter(skill =>
      normalizedUserSkills.includes(skill)
    );

    return (matchedSkills.length / normalizedRequiredSkills.length) * 100;
  }

  // Get job recommendations for a candidate
  async getJobRecommendations(user: any): Promise<JobRecommendation[]> {
    try {
      const { jobs: allJobs } = await jobAPI.getAll();
      const { applications: userApplications } = await applicationAPI.getAll();
      const appliedJobIds = new Set(userApplications.map((app: any) => app.jobId));

      // Filter out jobs already applied to
      const availableJobs = allJobs.filter((job: any) => !appliedJobIds.has(job.id));

      const recommendations: JobRecommendation[] = availableJobs.map((job: any) => {
        const userSkills = user?.skills || [];
        const jobSkills = job.skills || [];

        const skillMatchScore = this.calculateSkillMatch(userSkills, jobSkills);

        const matchedSkills = jobSkills.filter((skill: string) =>
          userSkills.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase())
        );

        const missingSkills = jobSkills.filter((skill: string) =>
          !userSkills.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase())
        );

        // Location match
        const locationMatch = user?.location?.toLowerCase() === job.location?.toLowerCase();

        // Salary match (if user has expected salary in profile)
        const salaryMatch = user?.expectedSalary
          ? job.salaryMax >= user.expectedSalary
          : true;

        // Calculate overall match score
        let matchScore = skillMatchScore * 0.6; // 60% weight on skills
        if (locationMatch) matchScore += 20; // 20% weight on location
        if (salaryMatch) matchScore += 20; // 20% weight on salary

        // Generate reasons
        const reasons: string[] = [];
        if (skillMatchScore >= 70) {
          reasons.push(`${Math.round(skillMatchScore)}% skill match`);
        }
        if (matchedSkills.length > 0) {
          reasons.push(`Matches ${matchedSkills.length} of your skills`);
        }
        if (locationMatch) {
          reasons.push('Location matches your preference');
        }
        if (salaryMatch && job.salaryMax) {
          reasons.push('Salary aligns with your expectations');
        }
        if (job.type === user?.preferredJobType) {
          reasons.push('Matches your preferred job type');
          matchScore += 10;
        }

        return {
          job,
          matchScore: Math.min(Math.round(matchScore), 100),
          matchedSkills,
          missingSkills,
          salaryMatch,
          locationMatch,
          reasons,
        };
      });

      // Sort by match score and return top matches
      return recommendations
        .filter(rec => rec.matchScore >= 30) // Only show decent matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20);
    } catch (error) {
      console.error('Failed to get job recommendations:', error);
      return [];
    }
  }

  // Get skill gap analysis
  async getSkillGapAnalysis(user: any): Promise<SkillGap[]> {
    try {
      const { jobs: allJobs } = await jobAPI.getAll();
      const userSkills = (user?.skills || []).map((s: string) => s.toLowerCase());

      // Aggregate all skills from jobs
      const skillFrequency = new Map<string, number>();
      allJobs.forEach((job: any) => {
        job.skills?.forEach((skill: string) => {
          const normalizedSkill = skill.toLowerCase();
          if (!userSkills.includes(normalizedSkill)) {
            skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
          }
        });
      });

      // Convert to array and sort by frequency
      const skillGaps: SkillGap[] = Array.from(skillFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, frequency]) => {
          const importance = frequency > 10 ? 'high' : frequency > 5 ? 'medium' : 'low';

          // Generate learning resources (mock data - in real app, use API)
          const learningResources = [
            `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
            `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
            `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial`,
          ];

          return {
            skill,
            importance,
            learningResources,
          };
        });

      return skillGaps;
    } catch (error) {
      console.error('Failed to get skill gap analysis:', error);
      return [];
    }
  }

  // Get career path suggestions
  async getCareerPathSuggestions(user: any): Promise<any[]> {
    try {
      const { jobs: allJobs } = await jobAPI.getAll();
      const userSkills = user?.skills || [];

      // Define career progression paths (mock data - in real app, use ML model)
      const careerPaths = [
        {
          currentRole: 'Junior Developer',
          nextRoles: ['Senior Developer', 'Full Stack Developer', 'Team Lead'],
          timeframe: '2-3 years',
          requiredSkills: ['Leadership', 'Architecture', 'Mentoring'],
        },
        {
          currentRole: 'Developer',
          nextRoles: ['Senior Developer', 'Tech Lead', 'Engineering Manager'],
          timeframe: '3-5 years',
          requiredSkills: ['Team Management', 'System Design', 'Project Management'],
        },
        {
          currentRole: 'Senior Developer',
          nextRoles: ['Principal Engineer', 'Engineering Manager', 'Architect'],
          timeframe: '4-6 years',
          requiredSkills: ['Strategic Planning', 'Cross-team Collaboration', 'Technical Vision'],
        },
      ];

      // Find relevant jobs for next career steps
      const suggestions = careerPaths.map(path => {
        const relevantJobs = allJobs.filter((job: any) =>
          path.nextRoles.some(role =>
            job.title.toLowerCase().includes(role.toLowerCase())
          )
        ).slice(0, 3);

        return {
          ...path,
          availablePositions: relevantJobs.length,
          jobs: relevantJobs,
        };
      });

      return suggestions;
    } catch (error) {
      console.error('Failed to get career path suggestions:', error);
      return [];
    }
  }

  // Get candidate recommendations for a job
  async getCandidateRecommendations(jobId: string, allCandidates: any[]): Promise<CandidateRecommendation[]> {
    try {
      const job = await jobAPI.getById(jobId);
      if (!job) return [];

      const jobSkills = job.skills || [];
      const { applications } = await applicationAPI.getAll({ jobId });
      const appliedCandidateIds = new Set(applications.map((app: any) => app.candidateId));

      // Filter out candidates who already applied
      const availableCandidates = allCandidates.filter(
        candidate => !appliedCandidateIds.has(candidate.id)
      );

      const recommendations: CandidateRecommendation[] = availableCandidates.map(candidate => {
        const candidateSkills = candidate.skills || [];

        const skillMatchScore = this.calculateSkillMatch(candidateSkills, jobSkills);

        const matchedSkills = jobSkills.filter((skill: string) =>
          candidateSkills.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase())
        );

        // Experience match
        const experienceMatch = candidate.experience
          ? candidate.experience.toLowerCase().includes(job.experience?.toLowerCase() || '')
          : false;

        // Salary match
        const salaryMatch = candidate.expectedSalary && job.salaryMax
          ? candidate.expectedSalary <= job.salaryMax
          : true;

        // Calculate overall match score
        let matchScore = skillMatchScore * 0.7; // 70% weight on skills
        if (experienceMatch) matchScore += 20; // 20% weight on experience
        if (salaryMatch) matchScore += 10; // 10% weight on salary

        // Generate reasons
        const reasons: string[] = [];
        if (skillMatchScore >= 70) {
          reasons.push(`${Math.round(skillMatchScore)}% skill match`);
        }
        if (matchedSkills.length > 0) {
          reasons.push(`Has ${matchedSkills.length} required skills`);
        }
        if (experienceMatch) {
          reasons.push('Experience level matches');
        }
        if (candidate.education) {
          reasons.push(`${candidate.education} education`);
        }

        return {
          candidate,
          matchScore: Math.min(Math.round(matchScore), 100),
          matchedSkills,
          experienceMatch,
          salaryMatch,
          reasons,
        };
      });

      // Sort by match score
      return recommendations
        .filter(rec => rec.matchScore >= 40)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 15);
    } catch (error) {
      console.error('Failed to get candidate recommendations:', error);
      return [];
    }
  }

  // Calculate candidate score for predictive ranking
  calculateCandidateScore(candidate: any, applications: any[]): number {
    let score = 50; // Base score

    // Profile completeness (0-20 points)
    let profileFields = 0;
    if (candidate.firstName) profileFields++;
    if (candidate.lastName) profileFields++;
    if (candidate.email) profileFields++;
    if (candidate.phone) profileFields++;
    if (candidate.bio) profileFields++;
    if (candidate.skills && candidate.skills.length > 0) profileFields++;
    if (candidate.experience) profileFields++;
    if (candidate.education) profileFields++;
    if (candidate.location) profileFields++;
    if (candidate.linkedIn) profileFields++;

    score += (profileFields / 10) * 20;

    // Skills count (0-15 points)
    const skillCount = candidate.skills?.length || 0;
    score += Math.min(skillCount, 15);

    // Application history (0-15 points)
    const candidateApps = applications.filter(app => app.candidateId === candidate.id);
    score += Math.min(candidateApps.length * 3, 15);

    return Math.min(Math.round(score), 100);
  }

  // Get diversity recommendations
  getDiversityInsights(candidates: any[]): any {
    // Mock diversity analysis - in real app, use proper demographic data with consent
    const locations = new Map<string, number>();
    const educationLevels = new Map<string, number>();

    candidates.forEach(candidate => {
      if (candidate.location) {
        locations.set(candidate.location, (locations.get(candidate.location) || 0) + 1);
      }
      if (candidate.education) {
        educationLevels.set(candidate.education, (educationLevels.get(candidate.education) || 0) + 1);
      }
    });

    return {
      totalCandidates: candidates.length,
      locationDiversity: locations.size,
      educationDiversity: educationLevels.size,
      suggestions: [
        'Consider candidates from underrepresented locations',
        'Review applicants with diverse educational backgrounds',
        'Look for candidates with unique skill combinations',
      ],
    };
  }
}

export const recommendationService = new RecommendationService();
