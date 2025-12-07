// ============================================================
// AI SERVICE - OpenAI and AI/ML integration service
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  AICompletionRequest,
  AICompletionResponse,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
} from '../types';

// ============================================
// AI Model Types
// ============================================
export type AIModel =
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-4o'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet';

export type EmbeddingModel =
  | 'text-embedding-3-small'
  | 'text-embedding-3-large'
  | 'text-embedding-ada-002';

// ============================================
// AI Prompt Templates
// ============================================
export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  model: AIModel;
  temperature?: number;
  maxTokens?: number;
}

export const AI_PROMPT_TEMPLATES: Record<string, AIPromptTemplate> = {
  JOB_DESCRIPTION_GENERATOR: {
    id: 'job_description_generator',
    name: 'Job Description Generator',
    description: 'Generate professional job descriptions',
    systemPrompt: `You are an expert HR professional and technical writer. Generate compelling, inclusive job descriptions that attract top talent. Include:
- Clear role overview
- Key responsibilities (5-7 bullet points)
- Required qualifications
- Preferred qualifications
- Benefits highlights
Use inclusive language and avoid jargon where possible.`,
    userPromptTemplate: `Generate a job description for a {{jobTitle}} position at {{companyName}}.

Company industry: {{industry}}
Team size: {{teamSize}}
Location: {{location}}
Employment type: {{employmentType}}
Experience level: {{experienceLevel}}

Key focus areas: {{focusAreas}}

Additional context: {{additionalContext}}`,
    variables: [
      'jobTitle',
      'companyName',
      'industry',
      'teamSize',
      'location',
      'employmentType',
      'experienceLevel',
      'focusAreas',
      'additionalContext',
    ],
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  },

  RESUME_ANALYZER: {
    id: 'resume_analyzer',
    name: 'Resume Analyzer',
    description: 'Analyze resumes and extract key information',
    systemPrompt: `You are an expert recruiter and resume analyst. Analyze the provided resume and extract structured information. Be objective and thorough. Return a JSON object with the following structure:
{
  "summary": "Brief professional summary",
  "skills": ["skill1", "skill2"],
  "experience_years": number,
  "education_level": "Bachelor's/Master's/PhD/etc",
  "strengths": ["strength1", "strength2"],
  "areas_for_improvement": ["area1", "area2"],
  "overall_score": 1-10,
  "fit_for_role": "Good/Moderate/Poor fit analysis"
}`,
    userPromptTemplate: `Analyze this resume for the {{jobTitle}} position:

Resume:
{{resumeText}}

Job Requirements:
{{jobRequirements}}

Return a detailed JSON analysis.`,
    variables: ['jobTitle', 'resumeText', 'jobRequirements'],
    model: 'gpt-4',
    temperature: 0.3,
    maxTokens: 1500,
  },

  INTERVIEW_QUESTIONS_GENERATOR: {
    id: 'interview_questions_generator',
    name: 'Interview Questions Generator',
    description: 'Generate role-specific interview questions',
    systemPrompt: `You are an expert interviewer and hiring manager. Generate thoughtful, role-specific interview questions that assess both technical skills and cultural fit. Include a mix of:
- Technical/skill-based questions
- Behavioral questions (STAR format)
- Situational questions
- Culture fit questions
Provide follow-up questions and what to look for in answers.`,
    userPromptTemplate: `Generate interview questions for a {{jobTitle}} candidate.

Job level: {{level}}
Key skills to assess: {{skills}}
Interview stage: {{stage}}
Interview duration: {{duration}} minutes
Number of questions: {{questionCount}}

Company values: {{companyValues}}
Team dynamics: {{teamDynamics}}`,
    variables: [
      'jobTitle',
      'level',
      'skills',
      'stage',
      'duration',
      'questionCount',
      'companyValues',
      'teamDynamics',
    ],
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2500,
  },

  FEEDBACK_SUMMARIZER: {
    id: 'feedback_summarizer',
    name: 'Interview Feedback Summarizer',
    description: 'Summarize multiple interview feedback into a cohesive report',
    systemPrompt: `You are an HR analyst specializing in interview feedback synthesis. Summarize multiple interviewer feedback into a cohesive, actionable report. Include:
- Overall recommendation (Strong Hire, Hire, No Hire, Strong No Hire)
- Consensus areas
- Divergent opinions
- Key strengths highlighted
- Concerns raised
- Suggested next steps
Be balanced and objective.`,
    userPromptTemplate: `Summarize the following interview feedback for {{candidateName}} applying for {{jobTitle}}:

{{feedbackEntries}}

Provide a comprehensive summary with a clear recommendation.`,
    variables: ['candidateName', 'jobTitle', 'feedbackEntries'],
    model: 'gpt-4',
    temperature: 0.3,
    maxTokens: 1500,
  },

  CANDIDATE_OUTREACH: {
    id: 'candidate_outreach',
    name: 'Candidate Outreach Message',
    description: 'Generate personalized outreach messages',
    systemPrompt: `You are an expert recruiter known for personalized, engaging outreach. Write compelling messages that:
- Reference specific candidate achievements/experience
- Explain why they're a good fit
- Highlight exciting aspects of the opportunity
- Include a clear call to action
Keep it concise (under 200 words) and professional yet warm.`,
    userPromptTemplate: `Write a personalized outreach message for {{candidateName}}.

Candidate background: {{candidateBackground}}
Current role: {{currentRole}}
Notable achievements: {{achievements}}

Job opportunity: {{jobTitle}} at {{companyName}}
Why they're a fit: {{fitReasons}}
Unique selling points: {{sellingPoints}}`,
    variables: [
      'candidateName',
      'candidateBackground',
      'currentRole',
      'achievements',
      'jobTitle',
      'companyName',
      'fitReasons',
      'sellingPoints',
    ],
    model: 'gpt-4',
    temperature: 0.8,
    maxTokens: 500,
  },

  SKILLS_EXTRACTOR: {
    id: 'skills_extractor',
    name: 'Skills Extractor',
    description: 'Extract and categorize skills from text',
    systemPrompt: `You are an expert at analyzing professional profiles and extracting skills. Extract skills from the provided text and categorize them. Return a JSON object:
{
  "technical_skills": [{"name": "skill", "proficiency": "Expert/Advanced/Intermediate/Beginner"}],
  "soft_skills": ["skill1", "skill2"],
  "tools_and_technologies": ["tool1", "tool2"],
  "certifications": ["cert1", "cert2"],
  "languages": [{"name": "English", "proficiency": "Native/Fluent/Intermediate/Basic"}]
}`,
    userPromptTemplate: `Extract and categorize skills from this text:

{{text}}`,
    variables: ['text'],
    model: 'gpt-4',
    temperature: 0.2,
    maxTokens: 1000,
  },
};

// ============================================
// AI Service
// ============================================
export class AIService extends BaseIntegrationService {
  private defaultModel: AIModel = 'gpt-4';
  private defaultEmbeddingModel: EmbeddingModel = 'text-embedding-3-small';

  constructor(config?: Partial<IntegrationConfig>) {
    super({
      id: 'ai',
      name: 'AI Service',
      description: 'AI-powered features using OpenAI',
      icon: 'brain',
      category: 'ai',
      ...config,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.request('/ai/verify', { method: 'POST' });
      this.setStatus('connected');
      this.config.connectedAt = new Date();

      integrationEvents.emit('connected', {
        integrationId: this.config.id,
        status: 'connected',
      });
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.setStatus('disconnected');
    integrationEvents.emit('disconnected', {
      integrationId: this.config.id,
      status: 'disconnected',
    });
  }

  isConnected(): boolean {
    return this.config.status === 'connected';
  }

  async refresh(): Promise<void> {
    await this.connect();
  }

  // ============================================
  // Completion Methods
  // ============================================

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await this.request<{
      id: string;
      choices: Array<{ message: { content: string }; finish_reason: string }>;
      model: string;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    }>('/ai/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: request.model || this.defaultModel,
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system', content: request.systemPrompt }]
            : []),
          { role: 'user', content: request.prompt },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stop,
      }),
    });

    return {
      id: response.id,
      text: response.choices[0]?.message.content || '',
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
      finishReason: response.choices[0]?.finish_reason as AICompletionResponse['finishReason'],
    };
  }

  async completeWithTemplate(
    templateId: string,
    variables: Record<string, unknown>
  ): Promise<AICompletionResponse> {
    const template = AI_PROMPT_TEMPLATES[templateId];

    if (!template) {
      throw this.createError(
        'TEMPLATE_NOT_FOUND',
        `Template ${templateId} not found`,
        false
      );
    }

    const prompt = this.renderTemplate(template.userPromptTemplate, variables);

    return this.complete({
      prompt,
      systemPrompt: template.systemPrompt,
      model: template.model,
      temperature: template.temperature,
      maxTokens: template.maxTokens,
    });
  }

  // ============================================
  // Embedding Methods
  // ============================================

  async createEmbedding(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    const inputs = Array.isArray(request.input) ? request.input : [request.input];

    const response = await this.request<{
      data: Array<{ embedding: number[]; index: number }>;
      model: string;
      usage: { prompt_tokens: number; total_tokens: number };
    }>('/ai/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: request.model || this.defaultEmbeddingModel,
        input: inputs,
      }),
    });

    return {
      embeddings: response.data
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding),
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }

  // ============================================
  // Template Methods
  // ============================================

  getTemplate(templateId: string): AIPromptTemplate | null {
    return AI_PROMPT_TEMPLATES[templateId] || null;
  }

  getTemplates(): AIPromptTemplate[] {
    return Object.values(AI_PROMPT_TEMPLATES);
  }

  private renderTemplate(template: string, data: Record<string, unknown>): string {
    let rendered = template;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(value ?? ''));
    });

    return rendered;
  }

  // ============================================
  // Recruitment-Specific AI Features
  // ============================================

  async generateJobDescription(params: {
    jobTitle: string;
    companyName: string;
    industry: string;
    teamSize?: string;
    location: string;
    employmentType: string;
    experienceLevel: string;
    focusAreas: string;
    additionalContext?: string;
  }): Promise<string> {
    const response = await this.completeWithTemplate('JOB_DESCRIPTION_GENERATOR', {
      ...params,
      teamSize: params.teamSize || 'Not specified',
      additionalContext: params.additionalContext || 'None',
    });

    return response.text;
  }

  async analyzeResume(params: {
    jobTitle: string;
    resumeText: string;
    jobRequirements: string;
  }): Promise<{
    summary: string;
    skills: string[];
    experienceYears: number;
    educationLevel: string;
    strengths: string[];
    areasForImprovement: string[];
    overallScore: number;
    fitForRole: string;
  }> {
    const response = await this.completeWithTemplate('RESUME_ANALYZER', params);

    try {
      const parsed = JSON.parse(response.text);
      return {
        summary: parsed.summary,
        skills: parsed.skills,
        experienceYears: parsed.experience_years,
        educationLevel: parsed.education_level,
        strengths: parsed.strengths,
        areasForImprovement: parsed.areas_for_improvement,
        overallScore: parsed.overall_score,
        fitForRole: parsed.fit_for_role,
      };
    } catch {
      throw this.createError(
        'PARSE_ERROR',
        'Failed to parse AI response',
        true
      );
    }
  }

  async generateInterviewQuestions(params: {
    jobTitle: string;
    level: string;
    skills: string;
    stage: string;
    duration: number;
    questionCount: number;
    companyValues?: string;
    teamDynamics?: string;
  }): Promise<string> {
    const response = await this.completeWithTemplate('INTERVIEW_QUESTIONS_GENERATOR', {
      ...params,
      companyValues: params.companyValues || 'Not specified',
      teamDynamics: params.teamDynamics || 'Not specified',
    });

    return response.text;
  }

  async summarizeFeedback(params: {
    candidateName: string;
    jobTitle: string;
    feedbackEntries: string;
  }): Promise<string> {
    const response = await this.completeWithTemplate('FEEDBACK_SUMMARIZER', params);
    return response.text;
  }

  async generateOutreachMessage(params: {
    candidateName: string;
    candidateBackground: string;
    currentRole: string;
    achievements: string;
    jobTitle: string;
    companyName: string;
    fitReasons: string;
    sellingPoints: string;
  }): Promise<string> {
    const response = await this.completeWithTemplate('CANDIDATE_OUTREACH', params);
    return response.text;
  }

  async extractSkills(text: string): Promise<{
    technicalSkills: Array<{ name: string; proficiency: string }>;
    softSkills: string[];
    toolsAndTechnologies: string[];
    certifications: string[];
    languages: Array<{ name: string; proficiency: string }>;
  }> {
    const response = await this.completeWithTemplate('SKILLS_EXTRACTOR', { text });

    try {
      const parsed = JSON.parse(response.text);
      return {
        technicalSkills: parsed.technical_skills,
        softSkills: parsed.soft_skills,
        toolsAndTechnologies: parsed.tools_and_technologies,
        certifications: parsed.certifications,
        languages: parsed.languages,
      };
    } catch {
      throw this.createError(
        'PARSE_ERROR',
        'Failed to parse AI response',
        true
      );
    }
  }

  // ============================================
  // Semantic Search
  // ============================================

  async searchCandidates(
    query: string,
    candidateEmbeddings: Array<{ id: string; embedding: number[] }>,
    topK = 10
  ): Promise<Array<{ id: string; score: number }>> {
    // Get embedding for query
    const queryEmbedding = await this.createEmbedding({ input: query });
    const queryVector = queryEmbedding.embeddings[0];

    // Calculate cosine similarity
    const scores = candidateEmbeddings.map((candidate) => ({
      id: candidate.id,
      score: this.cosineSimilarity(queryVector, candidate.embedding),
    }));

    // Sort by score and return top K
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // ============================================
  // Model Configuration
  // ============================================

  setDefaultModel(model: AIModel): void {
    this.defaultModel = model;
  }

  setDefaultEmbeddingModel(model: EmbeddingModel): void {
    this.defaultEmbeddingModel = model;
  }
}

export default AIService;
