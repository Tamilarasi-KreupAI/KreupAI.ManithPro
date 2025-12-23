// ============================================================
// AI TOOLS TYPES
// ============================================================

export type ProfileSection = 'summary' | 'experience' | 'skills' | 'education' | 'all';
export type SeniorityLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type CareerLevel = 'junior' | 'intermediate' | 'senior' | 'principal' | 'executive';
export type Timeframe = 'immediate' | '6months' | '1year' | '2years' | '5years';
export type LearningGoal = 'career-switch' | 'upskilling' | 'certification' | 'general';
export type LearningFormat = 'video' | 'reading' | 'interactive' | 'project';
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type PortfolioType = 'github' | 'website' | 'behance' | 'dribbble' | 'medium';
export type DocumentType = 'resume' | 'cover-letter' | 'transcript' | 'portfolio';
export type SkillSourceType = 'resume' | 'linkedin' | 'github' | 'manual';
export type SearchEntityType = 'job' | 'company' | 'skill' | 'location';
export type EntitySourceType = 'text' | 'resume' | 'profile';

export interface ProfileEnhancement {
  section: ProfileSection;
  suggestions: any[];
  keywords: string[];
  impactScore: number;
  improvementPercentage: number;
  originalScore: number;
  potentialScore: number;
  enhancedContent?: string;
}

export interface ExperienceDescription {
  original: string;
  enhanced: string;
  keywords: string[];
  impactMetrics: string[];
  impactScore: number;
  clarityScore: number;
  atsScore: number;
  generatedSummary?: string;
  generatedBullets?: string[];
}

export interface SkillsGapAnalysis {
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  learningPath: string[];
  estimatedTime: string;
  overallReadiness: number;
  technicalReadiness: number;
  softSkillReadiness: number;
  experienceAlignment: number;
  criticalGaps?: any[];
  importantGaps?: any[];
}

export interface CoverLetter {
  jobTitle: string;
  companyName: string;
  content: string;
  tone: string;
  customization: string[];
}

export interface InterviewPrep {
  jobTitle: string;
  questions: Array<{
    question: string;
    category: string;
    difficulty: string;
    sampleAnswer: string;
  }>;
  tips: string[];
}

export interface SalaryNegotiationAdvice {
  role: string;
  experience: number;
  location: string;
  marketRange: { min: number; max: number };
  negotiationStrategies: string[];
  keyPoints: string[];
  minimumAcceptable: number;
  offeredSalary?: number;
  targetSalary: number;
  anchorNumber: number;
  percentilePosition: number;
  marketData: {
    minimum: number;
    maximum: number;
  };
  negotiationScript: Record<string, string>;
  leveragePoints: string[];
  riskLevel: string;
  offerRescindRisk: number;
}

export interface CareerPathAdvice {
  currentRole: string;
  targetRole: string;
  steps: string[];
  skills: string[];
  timeline: string;
}

export interface CareerPathAdviceRequest {
  currentRole: string;
  targetRole: string;
  experience: number;
  skills: string[];
}

export interface LearningRecommendation {
  courses: Array<{
    title: string;
    provider: string;
    duration: string;
    level: string;
  }>;
  roadmap: string[];
}

export interface LearningRecommendationRequest {
  goal: LearningGoal;
  currentSkills: string[];
  timeframe: Timeframe;
}

export interface ApplicationInsight {
  jobId: string;
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface PortfolioFeedback {
  type: PortfolioType;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export interface PortfolioFeedbackRequest {
  type: PortfolioType;
  url: string;
}

export interface ParsedDocument {
  type: DocumentType;
  extractedText: string;
  sections: Record<string, string>;
  skills: string[];
  experience: number;
}

export interface ParseDocumentRequest {
  type: DocumentType;
  fileUrl: string;
}

export interface SkillExtraction {
  skills: Array<{
    name: string;
    category: string;
    confidence: number;
  }>;
  source: SkillSourceType;
}

export interface ExtractSkillsRequest {
  text: string;
  source: SkillSourceType;
}

export interface SemanticSearchResponse {
  results: Array<{
    id: string;
    type: SearchEntityType;
    title: string;
    relevance: number;
    snippet: string;
  }>;
  totalResults: number;
}

export interface SemanticSearchRequest {
  query: string;
  type?: SearchEntityType;
  limit?: number;
}

export interface EntityRecognition {
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  source: EntitySourceType;
}

export interface RecognizeEntitiesRequest {
  text: string;
  source: EntitySourceType;
}
