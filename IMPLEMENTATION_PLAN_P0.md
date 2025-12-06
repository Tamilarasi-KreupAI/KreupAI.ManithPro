# KreupAI ManithPro - P0 Critical Features Implementation Plan

## Executive Summary

This document outlines the implementation plan for **119 P0 (Critical)** features required to transform KreupAI ManithPro into an enterprise-grade recruitment platform. Features are organized into **6 phases** with clear dependencies, milestones, and deliverables.

---

## Implementation Phases Overview

```
Phase 1: Technical Foundation          [Weeks 1-4]
    ↓
Phase 2: Core Profile & Matching       [Weeks 5-10]
    ↓
Phase 3: AI Engine & Scoring           [Weeks 11-16]
    ↓
Phase 4: Calendar & Scheduling         [Weeks 17-20]
    ↓
Phase 5: AI Interviews & Automation    [Weeks 21-26]
    ↓
Phase 6: Security & Enterprise         [Weeks 27-32]
```

---

## Phase 1: Technical Foundation
**Duration: Weeks 1-4**
**Goal: Build the infrastructure that all other features depend on**

### 1.1 Database & Caching Infrastructure
**Week 1**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 14.1.1 | Redis Caching | Install Redis, implement caching layer for API responses, sessions | 3 days |
| 14.1.3 | Database Optimization | Add indexes, optimize existing queries, connection pooling | 2 days |
| 14.1.8 | Connection Pooling | Configure PgBouncer or Prisma connection pool | 1 day |

**Deliverables:**
- [ ] Redis server running and connected
- [ ] Caching middleware for API routes
- [ ] Session storage migrated to Redis
- [ ] Database query performance improved by 50%+

### 1.2 Search Infrastructure
**Week 2**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 14.1.2 | Elasticsearch | Install ES, create indexes for candidates, jobs, skills | 5 days |

**Deliverables:**
- [ ] Elasticsearch cluster running
- [ ] Candidate index with mappings
- [ ] Job index with mappings
- [ ] Search API endpoints
- [ ] Data sync pipeline from PostgreSQL

### 1.3 Background Processing
**Week 3**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 14.2.1 | Job Queue (BullMQ) | Install BullMQ, create queue infrastructure | 3 days |
| 14.2.2 | Email Queue | Move email sending to background queue | 1 day |
| 14.2.5 | Scheduled Tasks (Cron) | Implement cron job system for recurring tasks | 1 day |

**Deliverables:**
- [ ] BullMQ configured with Redis
- [ ] Queue dashboard (Bull Board)
- [ ] Email queue processing
- [ ] Cron scheduler running
- [ ] Job retry and error handling

### 1.4 Monitoring & DevOps
**Week 4**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 14.3.1 | APM Integration | Set up DataDog/New Relic for performance monitoring | 2 days |
| 14.3.2 | Error Tracking (Sentry) | Integrate Sentry for error capture | 1 day |
| 14.3.3 | Structured Logging | Implement Winston/Pino with JSON logs | 1 day |
| 14.3.4 | Health Check Endpoints | Add /health, /ready endpoints | 0.5 day |
| 14.3.7 | Alerting Rules | Configure alerts for errors, latency, downtime | 0.5 day |
| 14.3.9 | Uptime Monitoring | Set up external monitoring (Pingdom/UptimeRobot) | 0.5 day |
| 14.4.1 | Docker Containerization | Dockerize all services | 2 days |
| 14.4.3 | CI/CD Pipeline | GitHub Actions for build, test, deploy | 2 days |
| 14.4.4 | Database Migrations | Automate Prisma migrations in CI/CD | 0.5 day |
| 14.4.5 | Environment Management | Dev, staging, production configurations | 1 day |
| 14.4.9 | Secrets Management | Implement HashiCorp Vault or AWS Secrets | 1 day |

**Deliverables:**
- [ ] All services containerized
- [ ] CI/CD pipeline running
- [ ] APM dashboard with metrics
- [ ] Error tracking active
- [ ] Centralized logging
- [ ] Automated deployments to staging

### Phase 1 Milestone Checklist
- [ ] Redis operational with 99.9% uptime
- [ ] Elasticsearch returning search results < 100ms
- [ ] Background jobs processing reliably
- [ ] Zero-downtime deployments working
- [ ] Monitoring dashboards live
- [ ] All P0 infrastructure features complete

---

## Phase 2: Core Profile & Matching System
**Duration: Weeks 5-10**
**Goal: Build CV-less profile system with basic matching**

### 2.1 Profile Data Model Extension
**Week 5**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 1.1.1 | Structured Profile Builder | Multi-section profile (work, education, skills, projects) | 4 days |
| 1.1.2 | Dynamic Skills Matrix | Skill categories with proficiency levels (1-10) | 2 days |
| 1.1.3 | Experience Timeline | Visual career progression data model | 2 days |
| 1.1.4 | Education & Certifications Hub | Degrees, certifications storage | 1 day |

**Database Schema Changes:**
```prisma
model UserProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  headline      String?
  summary       String?
  location      String?
  website       String?
  socialLinks   Json?
  preferences   Json?
  completeness  Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WorkExperience {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  company       String
  title         String
  location      String?
  startDate     DateTime
  endDate       DateTime?
  current       Boolean   @default(false)
  description   String?
  achievements  String[]
  skills        String[]
  verified      Boolean   @default(false)
  verifiedAt    DateTime?
  order         Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Education {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  institution   String
  degree        String
  field         String?
  startDate     DateTime?
  endDate       DateTime?
  gpa           Float?
  description   String?
  verified      Boolean   @default(false)
  order         Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model UserSkill {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  skillId       String
  skill         Skill    @relation(fields: [skillId], references: [id])
  proficiency   Int      @default(5) // 1-10
  yearsExp      Float?
  endorsed      Int      @default(0)
  verified      Boolean  @default(false)
  lastUsed      DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, skillId])
}

model Skill {
  id            String      @id @default(uuid())
  name          String      @unique
  category      String
  aliases       String[]
  parentId      String?
  parent        Skill?      @relation("SkillHierarchy", fields: [parentId], references: [id])
  children      Skill[]     @relation("SkillHierarchy")
  userSkills    UserSkill[]
  createdAt     DateTime    @default(now())
}

model Certification {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  name          String
  issuer        String
  issueDate     DateTime?
  expiryDate    DateTime?
  credentialId  String?
  credentialUrl String?
  verified      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  title         String
  description   String?
  url           String?
  repoUrl       String?
  imageUrls     String[]
  skills        String[]
  startDate     DateTime?
  endDate       DateTime?
  highlights    String[]
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Deliverables:**
- [ ] Database schema migrated
- [ ] Profile CRUD APIs
- [ ] Work experience CRUD APIs
- [ ] Education CRUD APIs
- [ ] Skills CRUD APIs
- [ ] Certifications CRUD APIs

### 2.2 Profile Frontend
**Week 6-7**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 1.1.1 | Profile Builder UI | Multi-step profile creation wizard | 5 days |
| 1.1.7 | Profile Completeness Score | Real-time completeness calculation | 2 days |
| 1.1.5 | Project Portfolio | Project showcase section | 3 days |

**Deliverables:**
- [ ] Profile builder wizard (5+ steps)
- [ ] Experience timeline component
- [ ] Skills matrix with drag-and-drop
- [ ] Education section
- [ ] Certifications section
- [ ] Projects gallery
- [ ] Profile completeness indicator
- [ ] Profile preview mode

### 2.3 External Platform Integrations
**Week 8-9**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 1.2.1 | GitHub Integration | OAuth, import repos, contributions, languages | 5 days |
| 1.2.2 | LinkedIn Profile Sync | OAuth, import work history, skills | 5 days |

**GitHub Integration Implementation:**
```typescript
// Backend: /src/services/integrations/github.service.ts
interface GitHubProfile {
  username: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
  contributions: number;
  topLanguages: { name: string; percentage: number }[];
  pinnedRepos: GitHubRepo[];
}

interface GitHubRepo {
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
}
```

**Deliverables:**
- [ ] GitHub OAuth flow
- [ ] GitHub data import service
- [ ] Repository display component
- [ ] Contribution graph component
- [ ] LinkedIn OAuth flow
- [ ] LinkedIn data import service
- [ ] Work history sync
- [ ] Skills sync from LinkedIn
- [ ] Integration settings page

### 2.4 Resume Parsing & NLP
**Week 10**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 2.4.1 | Resume/Profile Parser | Extract structured data from uploaded documents | 4 days |
| 2.4.2 | Skill Extraction NLP | Identify skills from any text | 3 days |
| 2.4.3 | Semantic Search | Find candidates/jobs by meaning | 3 days |

**Implementation Approach:**
- Use OpenAI/Claude API for NLP tasks
- PDF parsing with pdf-parse library
- DOCX parsing with mammoth library
- Store extracted data in structured format

**Deliverables:**
- [ ] PDF/DOCX parser service
- [ ] Skill extraction API
- [ ] Semantic search endpoint
- [ ] Auto-fill profile from resume
- [ ] Skill suggestions from text

### Phase 2 Milestone Checklist
- [ ] Complete profile builder working
- [ ] GitHub integration live
- [ ] LinkedIn integration live
- [ ] Resume parsing functional
- [ ] Semantic search returning results
- [ ] Profile completeness tracking

---

## Phase 3: AI Engine & Scoring
**Duration: Weeks 11-16**
**Goal: Build AI-powered scoring, matching, and content generation**

### 3.1 AI Infrastructure Setup
**Week 11**

| Task | Description | Effort |
|------|-------------|--------|
| AI Service Architecture | Create AI service layer with provider abstraction | 2 days |
| OpenAI/Claude Integration | API integration with rate limiting, caching | 2 days |
| Prompt Management | Centralized prompt templates system | 1 day |

**AI Service Architecture:**
```typescript
// Backend: /src/services/ai/ai.service.ts
interface AIProvider {
  complete(prompt: string, options?: AIOptions): Promise<string>;
  embed(text: string): Promise<number[]>;
  analyze(content: string, schema: JSONSchema): Promise<object>;
}

interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

// Prompt templates
const PROMPTS = {
  SCORE_CANDIDATE: 'prompts/score-candidate.txt',
  GENERATE_JD: 'prompts/generate-jd.txt',
  ANALYZE_RESUME: 'prompts/analyze-resume.txt',
  INTERVIEW_QUESTIONS: 'prompts/interview-questions.txt',
};
```

**Deliverables:**
- [ ] AI service abstraction layer
- [ ] OpenAI integration
- [ ] Claude integration
- [ ] Prompt template system
- [ ] Token usage tracking
- [ ] Cost monitoring dashboard

### 3.2 Candidate Scoring Engine
**Week 12-13**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 2.1.1 | AI Profile Scorer | Overall candidate score based on profile | 4 days |
| 2.1.2 | Job-Fit Score | AI-calculated match score for specific job | 4 days |
| 2.1.11 | Explainable AI Scores | Show reasoning behind each score | 2 days |

**Scoring Algorithm:**
```typescript
interface CandidateScore {
  overall: number; // 0-100
  breakdown: {
    profileCompleteness: number;
    skillMatch: number;
    experienceRelevance: number;
    educationFit: number;
    cultureFit: number;
  };
  explanations: {
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  confidence: number; // 0-1
}

interface JobFitScore {
  score: number; // 0-100
  breakdown: {
    requiredSkills: { skill: string; match: number }[];
    preferredSkills: { skill: string; match: number }[];
    experienceLevel: number;
    industryFit: number;
    locationMatch: number;
    salaryAlignment: number;
  };
  missingRequirements: string[];
  strongMatches: string[];
}
```

**Deliverables:**
- [ ] Profile scoring API
- [ ] Job-fit scoring API
- [ ] Score explanation generator
- [ ] Batch scoring for job applicants
- [ ] Score caching and invalidation
- [ ] Score history tracking

### 3.3 Content Generation for Recruiters
**Week 14**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 2.2.1 | AI Job Description Generator | Generate JDs from role requirements | 3 days |
| 2.2.4 | Inclusive Language Checker | Flag biased language, suggest alternatives | 2 days |
| 2.2.6 | Interview Questions Generator | Role-specific questions | 2 days |
| 2.2.8 | Candidate Summary Generator | AI-written candidate summaries | 2 days |

**Deliverables:**
- [ ] JD generator UI
- [ ] JD templates library
- [ ] Bias checker integration
- [ ] Interview question bank
- [ ] Question generator API
- [ ] Candidate summary API
- [ ] Bulk summary generation

### 3.4 Content Generation for Candidates
**Week 15**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 2.3.1 | AI Profile Enhancer | Suggestions to improve profile sections | 3 days |
| 2.3.3 | Skills Gap Identifier | Identify missing skills for target roles | 2 days |

**Deliverables:**
- [ ] Profile enhancement suggestions
- [ ] Section-by-section recommendations
- [ ] Skills gap analysis
- [ ] Learning recommendations
- [ ] Profile preview with suggestions

### 3.5 Advanced Matching
**Week 16**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 5.1.1 | Vector Embeddings for Skills | ML-based skill similarity | 3 days |
| 5.1.2 | Experience Level Inference | Understand seniority from context | 2 days |
| 5.3.1 | Job Recommendations for Candidates | Personalized job suggestions | 2 days |
| 5.3.2 | Candidate Recommendations for Recruiters | Suggested profiles for roles | 2 days |

**Vector Search Implementation:**
```typescript
// Store embeddings in PostgreSQL with pgvector
// or use Pinecone/Weaviate for vector storage

interface SkillEmbedding {
  skillId: string;
  vector: number[]; // 1536 dimensions for OpenAI
  metadata: {
    name: string;
    category: string;
    aliases: string[];
  };
}

// Similarity search
async function findSimilarSkills(skillId: string, limit: number = 10) {
  const embedding = await getSkillEmbedding(skillId);
  return vectorStore.similaritySearch(embedding, limit);
}
```

**Deliverables:**
- [ ] Skill embeddings generated
- [ ] Vector similarity search
- [ ] Experience level inference
- [ ] Job recommendation API
- [ ] Candidate recommendation API
- [ ] Recommendation UI components

### Phase 3 Milestone Checklist
- [ ] AI infrastructure operational
- [ ] Candidate scoring working
- [ ] Job-fit scoring working
- [ ] JD generator live
- [ ] Interview questions generator live
- [ ] Profile enhancer live
- [ ] Recommendations engine live

---

## Phase 4: Calendar & Scheduling
**Duration: Weeks 17-20**
**Goal: Implement smart scheduling with calendar integrations**

### 4.1 Calendar Integration Infrastructure
**Week 17**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 3.1.1 | Google Calendar Integration | OAuth, read/write events | 4 days |
| 3.1.2 | Outlook/Office 365 Integration | OAuth, read/write events | 4 days |

**Calendar Service Architecture:**
```typescript
// Backend: /src/services/calendar/calendar.service.ts
interface CalendarProvider {
  name: 'google' | 'outlook' | 'ical';
  connect(userId: string, authCode: string): Promise<CalendarConnection>;
  disconnect(connectionId: string): Promise<void>;
  getEvents(connectionId: string, range: DateRange): Promise<CalendarEvent[]>;
  createEvent(connectionId: string, event: CreateEventInput): Promise<CalendarEvent>;
  updateEvent(connectionId: string, eventId: string, updates: UpdateEventInput): Promise<CalendarEvent>;
  deleteEvent(connectionId: string, eventId: string): Promise<void>;
  getFreeBusy(connectionId: string, range: DateRange): Promise<FreeBusySlot[]>;
}

interface CalendarConnection {
  id: string;
  userId: string;
  provider: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  calendarIds: string[];
  isActive: boolean;
}

interface FreeBusySlot {
  start: Date;
  end: Date;
  status: 'busy' | 'tentative' | 'free';
}
```

**Database Schema:**
```prisma
model CalendarConnection {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  provider      String   // google, outlook
  email         String
  accessToken   String
  refreshToken  String
  expiresAt     DateTime
  calendarIds   String[]
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, provider, email])
}

model SchedulingPreferences {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  timezone          String   @default("UTC")
  workingHours      Json     // { mon: { start: "09:00", end: "17:00" }, ... }
  bufferBefore      Int      @default(15) // minutes
  bufferAfter       Int      @default(15)
  minNotice         Int      @default(24) // hours
  maxAdvance        Int      @default(30) // days
  preferredDurations Int[]   @default([30, 60])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Deliverables:**
- [ ] Google Calendar OAuth flow
- [ ] Google Calendar API integration
- [ ] Outlook OAuth flow
- [ ] Outlook Calendar API integration
- [ ] Calendar connection management UI
- [ ] Event sync service

### 4.2 Availability Management
**Week 18**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 3.1.5 | Multi-Calendar Aggregation | Combine availability from multiple calendars | 3 days |
| 3.1.6 | Calendar Conflict Detection | Real-time conflict checking | 2 days |
| 3.2.2 | Auto-Availability Detection | Scan calendars for optimal slots | 3 days |

**Availability Algorithm:**
```typescript
interface AvailabilityRequest {
  userIds: string[];
  dateRange: DateRange;
  duration: number; // minutes
  preferences?: {
    preferredTimes?: TimeRange[];
    excludeDays?: number[]; // 0-6
  };
}

interface AvailabilitySlot {
  start: Date;
  end: Date;
  score: number; // 0-100 preference score
  conflicts: string[]; // any soft conflicts
}

async function findAvailableSlots(
  request: AvailabilityRequest
): Promise<AvailabilitySlot[]> {
  // 1. Fetch busy times from all connected calendars
  // 2. Merge and dedupe busy periods
  // 3. Apply working hours constraints
  // 4. Apply buffer times
  // 5. Find gaps that fit the duration
  // 6. Score slots based on preferences
  // 7. Return sorted by score
}
```

**Deliverables:**
- [ ] Multi-calendar aggregation service
- [ ] Conflict detection API
- [ ] Availability finder API
- [ ] Working hours configuration UI
- [ ] Buffer time settings

### 4.3 Smart Scheduling
**Week 19**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 3.2.1 | Self-Scheduling Links | Candidates pick from available slots | 4 days |
| 3.2.3 | Panel Interview Coordinator | Find slots when all interviewers are free | 3 days |
| 3.2.4 | Timezone Intelligence | Auto-detect and convert timezones | 2 days |

**Self-Scheduling Implementation:**
```typescript
interface SchedulingLink {
  id: string;
  jobId?: string;
  applicationId?: string;
  interviewType: string;
  duration: number;
  hostUserIds: string[];
  expiresAt?: Date;
  maxBookings?: number;
  bookedCount: number;
  settings: {
    timezone: string;
    dateRange: DateRange;
    bufferBefore: number;
    bufferAfter: number;
  };
  isActive: boolean;
}

// Public endpoint for candidates
// GET /api/schedule/:linkId/slots
// Returns available time slots

// POST /api/schedule/:linkId/book
// Books a specific slot
```

**Deliverables:**
- [ ] Scheduling link generator
- [ ] Public scheduling page
- [ ] Available slots display
- [ ] Slot booking flow
- [ ] Panel scheduling coordinator
- [ ] Timezone detection and display
- [ ] Calendar invites sent on booking

### 4.4 Reminders & Notifications
**Week 20**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 3.3.1 | Email Reminders | Configurable reminder schedule | 2 days |
| 3.3.5 | Calendar Event Updates | Auto-update calendar events on changes | 2 days |
| 3.2.10 | Rescheduling Assistant | Smart suggestions for rescheduling | 3 days |

**Reminder System:**
```typescript
interface ReminderConfig {
  interviewId: string;
  reminders: {
    type: 'email' | 'sms' | 'push';
    beforeMinutes: number;
    sent: boolean;
    sentAt?: Date;
  }[];
}

// Default reminder schedule
const DEFAULT_REMINDERS = [
  { beforeMinutes: 1440, type: 'email' }, // 24 hours
  { beforeMinutes: 60, type: 'email' },   // 1 hour
  { beforeMinutes: 15, type: 'push' },    // 15 minutes
];
```

**Deliverables:**
- [ ] Reminder queue processor
- [ ] Reminder preference settings
- [ ] Email reminder templates
- [ ] Calendar event sync on changes
- [ ] Rescheduling flow
- [ ] Alternative slot suggestions

### Phase 4 Milestone Checklist
- [ ] Google Calendar integration working
- [ ] Outlook Calendar integration working
- [ ] Self-scheduling links functional
- [ ] Panel scheduling working
- [ ] Automatic reminders sending
- [ ] Calendar sync operational

---

## Phase 5: AI Interviews & Automation
**Duration: Weeks 21-26**
**Goal: Implement AI-powered screening and interview capabilities**

### 5.1 AI Screening Chat Bot
**Week 21-22**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 4.1.3 | Chat-Based Screening | Text-based AI interviewer for initial screening | 5 days |
| 4.1.4 | Structured Question Flow | Configurable question sequences by role | 3 days |
| 4.3.1 | Company Knowledge Import | Upload company docs, values, culture info | 2 days |

**Chat Bot Architecture:**
```typescript
interface ScreeningSession {
  id: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  startedAt?: Date;
  completedAt?: Date;
  messages: ScreeningMessage[];
  analysis?: ScreeningAnalysis;
}

interface ScreeningMessage {
  id: string;
  role: 'system' | 'assistant' | 'candidate';
  content: string;
  timestamp: Date;
  metadata?: {
    questionId?: string;
    questionType?: string;
  };
}

interface ScreeningConfig {
  jobId: string;
  questions: ScreeningQuestion[];
  maxDuration: number; // minutes
  passingScore: number;
  followUpEnabled: boolean;
}

interface ScreeningQuestion {
  id: string;
  type: 'knockout' | 'experience' | 'technical' | 'behavioral' | 'custom';
  question: string;
  followUps?: string[];
  scoringCriteria?: string;
  weight: number;
  required: boolean;
}
```

**Deliverables:**
- [ ] Screening bot service
- [ ] Question configuration UI
- [ ] Candidate chat interface
- [ ] Company knowledge base upload
- [ ] Knowledge base indexing
- [ ] Context-aware responses

### 5.2 Async Video Interviews
**Week 23-24**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 4.1.1 | Async Video Interview Bot | Pre-recorded questions with video responses | 5 days |
| 4.4.12 | One-Way Video Interview | Candidate records responses to questions | 3 days |
| 4.4.5 | Interview Recording | Auto-record with consent | 2 days |

**Video Interview System:**
```typescript
interface VideoInterview {
  id: string;
  applicationId: string;
  type: 'async' | 'live';
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  questions: VideoQuestion[];
  responses: VideoResponse[];
  dueDate?: Date;
  completedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

interface VideoQuestion {
  id: string;
  order: number;
  questionText: string;
  questionVideoUrl?: string;
  thinkTime: number; // seconds
  maxDuration: number; // seconds
  retakes: number; // allowed retakes
}

interface VideoResponse {
  questionId: string;
  videoUrl: string;
  duration: number;
  recordedAt: Date;
  transcription?: string;
  analysis?: ResponseAnalysis;
}
```

**Technical Components:**
- Video recording: MediaRecorder API
- Video storage: S3/GCS with signed URLs
- Transcription: Deepgram/AssemblyAI
- Video playback: Custom player with speed controls

**Deliverables:**
- [ ] Video recording component
- [ ] Video upload service
- [ ] Question sequencer
- [ ] Candidate video interview UI
- [ ] Recruiter review interface
- [ ] Video storage and CDN

### 5.3 AI Interview Analysis
**Week 25**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 4.2.1 | Speech-to-Text Transcription | Accurate transcription of all interviews | 3 days |
| 4.2.2 | Answer Quality Scoring | AI evaluation of response quality | 3 days |
| 4.2.8 | Summary Generation | Auto-generate interview summaries | 2 days |

**Analysis Pipeline:**
```typescript
interface InterviewAnalysis {
  interviewId: string;
  transcription: TranscriptionResult;
  scores: {
    overall: number;
    communication: number;
    technicalAccuracy: number;
    relevance: number;
    confidence: number;
  };
  summary: string;
  keyPoints: string[];
  concerns: string[];
  recommendations: string[];
  sentimentTimeline: SentimentPoint[];
}

async function analyzeInterview(interviewId: string): Promise<InterviewAnalysis> {
  // 1. Transcribe all video responses
  // 2. Analyze each response for quality
  // 3. Score against job requirements
  // 4. Generate summary
  // 5. Extract key points
  // 6. Flag concerns
  // 7. Store results
}
```

**Deliverables:**
- [ ] Transcription service integration
- [ ] Answer scoring algorithm
- [ ] Summary generator
- [ ] Analysis dashboard
- [ ] Exportable reports

### 5.4 Workflow Automation Engine
**Week 26**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 11.1.1 | Trigger-Based Automation | Event-driven workflows | 3 days |
| 11.1.3 | Conditional Logic | If/then/else branching | 2 days |
| 11.2.1 | Auto-Advance Candidates | Move based on criteria | 1 day |
| 11.2.2 | Auto-Reject | Filter out unqualified candidates | 1 day |
| 11.2.3 | Auto-Schedule Interviews | Book based on availability | 2 days |
| 11.2.7 | Auto-Notify Stakeholders | Alert on key events | 1 day |

**Automation Engine:**
```typescript
interface AutomationRule {
  id: string;
  name: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdBy: string;
}

interface AutomationTrigger {
  type: 'application_submitted' | 'status_changed' | 'score_calculated' |
        'interview_completed' | 'time_elapsed' | 'manual';
  config: Record<string, any>;
}

interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logic: 'and' | 'or';
}

interface AutomationAction {
  type: 'change_status' | 'send_email' | 'send_notification' | 'schedule_interview' |
        'assign_reviewer' | 'add_tag' | 'webhook';
  config: Record<string, any>;
  delay?: number; // minutes
}
```

**Deliverables:**
- [ ] Automation engine service
- [ ] Rule builder UI
- [ ] Trigger handlers
- [ ] Condition evaluator
- [ ] Action executors
- [ ] Automation logs and history

### 5.5 Approval Workflows
**Week 26 (continued)**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 11.3.1 | Job Requisition Approval | Multi-level job approval | 2 days |
| 11.3.2 | Offer Approval Workflow | Approval chain for offers | 2 days |

**Deliverables:**
- [ ] Approval workflow engine
- [ ] Job requisition approval flow
- [ ] Offer approval flow
- [ ] Approval notification system
- [ ] Approval dashboard

### Phase 5 Milestone Checklist
- [ ] AI screening chat bot operational
- [ ] Async video interviews working
- [ ] Transcription pipeline functional
- [ ] AI analysis generating insights
- [ ] Automation engine processing rules
- [ ] Approval workflows active

---

## Phase 6: Security & Enterprise
**Duration: Weeks 27-32**
**Goal: Implement enterprise security, compliance, and collaboration features**

### 6.1 Authentication Enhancement
**Week 27**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 8.1.1 | Two-Factor Authentication (2FA) | TOTP and SMS options | 3 days |
| 8.1.2 | SSO Integration (SAML) | Enterprise single sign-on | 4 days |
| 8.1.3 | SSO Integration (OAuth2/OIDC) | Google, Microsoft, Okta | 3 days |

**2FA Implementation:**
```typescript
interface TwoFactorConfig {
  userId: string;
  method: 'totp' | 'sms' | 'email';
  secret?: string; // TOTP secret
  phoneNumber?: string;
  backupCodes: string[];
  isEnabled: boolean;
  verifiedAt?: Date;
}

// TOTP libraries: otplib, speakeasy
// Generate QR code for authenticator apps
```

**SSO Implementation:**
```typescript
interface SSOConfig {
  organizationId: string;
  provider: 'saml' | 'oidc';
  issuer: string;
  ssoUrl: string;
  certificate?: string;
  clientId?: string;
  clientSecret?: string;
  allowedDomains: string[];
  autoProvision: boolean;
  defaultRole: string;
}
```

**Deliverables:**
- [ ] TOTP 2FA setup flow
- [ ] SMS 2FA option
- [ ] Backup codes generation
- [ ] SAML SSO integration
- [ ] OAuth2/OIDC integration
- [ ] SSO configuration UI
- [ ] Auto-provisioning

### 6.2 Access Control
**Week 28**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 8.1.4 | Password Policies | Complexity, rotation, history rules | 2 days |
| 8.1.5 | Session Management | Timeout, concurrent session limits | 2 days |
| 8.1.10 | Role-Based Access Control (RBAC) | Granular permissions | 4 days |

**RBAC System:**
```typescript
interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // built-in vs custom
}

// Example permissions
const PERMISSIONS = [
  { resource: 'jobs', action: 'create', name: 'jobs:create' },
  { resource: 'jobs', action: 'read', name: 'jobs:read' },
  { resource: 'candidates', action: 'read', name: 'candidates:read' },
  { resource: 'candidates', action: 'manage', name: 'candidates:manage' },
  { resource: 'interviews', action: 'schedule', name: 'interviews:schedule' },
  { resource: 'analytics', action: 'view', name: 'analytics:view' },
  { resource: 'settings', action: 'manage', name: 'settings:manage' },
];
```

**Deliverables:**
- [ ] Password policy configuration
- [ ] Session management
- [ ] Concurrent session limits
- [ ] Permission system
- [ ] Role management UI
- [ ] Permission checking middleware

### 6.3 Data Protection
**Week 29**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 8.2.1 | Encryption at Rest | AES-256 for stored data | 3 days |
| 8.2.2 | Encryption in Transit | TLS 1.3 everywhere | 1 day |
| 8.2.5 | Secure File Storage | Encrypted resume and document storage | 2 days |
| 8.2.7 | Backup & Recovery | Automated encrypted backups | 2 days |

**Deliverables:**
- [ ] Database encryption enabled
- [ ] File encryption service
- [ ] Secure file upload/download
- [ ] Automated backup system
- [ ] Recovery procedures documented

### 6.4 Compliance Features
**Week 30**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 8.3.1 | GDPR Compliance Suite | Consent, data export, deletion | 4 days |
| 8.3.4 | Data Retention Policies | Configurable retention periods | 2 days |
| 8.3.5 | Right to be Forgotten | Complete data deletion workflows | 2 days |
| 8.3.6 | Consent Management | Track and manage user consents | 2 days |
| 8.3.7 | Data Subject Access Requests (DSAR) | Automated data export | 2 days |
| 8.3.8 | Audit Trail | Complete history of data access and changes | 2 days |

**GDPR Implementation:**
```typescript
interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'ready' | 'downloaded' | 'expired';
  exportUrl?: string;
  expiresAt?: Date;
}

interface DataDeletionRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedAt?: Date;
  retainedData?: string[]; // legal holds
}

interface ConsentRecord {
  id: string;
  userId: string;
  type: 'privacy_policy' | 'marketing' | 'data_processing' | 'cookies';
  version: string;
  granted: boolean;
  grantedAt: Date;
  ipAddress: string;
  userAgent: string;
}
```

**Deliverables:**
- [ ] Consent management system
- [ ] Data export service
- [ ] Data deletion service
- [ ] Retention policy engine
- [ ] DSAR portal
- [ ] Audit logging

### 6.5 Collaborative Hiring
**Week 31**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 6.1.1 | Hiring Team Creation | Assign recruiters, HMs, interviewers to jobs | 2 days |
| 6.1.2 | Role-Based Permissions | Different access levels | 2 days |
| 6.1.3 | Interview Panel Setup | Define interview rounds and assignees | 2 days |
| 6.2.1 | Scorecard Templates | Standardized evaluation criteria per role | 2 days |
| 6.2.2 | Interview Feedback Forms | Structured feedback with ratings | 2 days |
| 6.2.4 | Feedback Aggregation | Combine ratings with weighted scoring | 2 days |
| 6.3.1 | Candidate Discussion Threads | Comment threads on candidate profiles | 2 days |
| 6.3.2 | @Mentions | Tag team members in comments | 1 day |
| 6.3.4 | Team Notes | Shared notes visible to hiring team | 1 day |

**Scorecard System:**
```typescript
interface Scorecard {
  id: string;
  jobId: string;
  name: string;
  sections: ScorecardSection[];
  isDefault: boolean;
}

interface ScorecardSection {
  id: string;
  name: string;
  weight: number;
  criteria: ScorecardCriterion[];
}

interface ScorecardCriterion {
  id: string;
  name: string;
  description: string;
  ratingScale: 1 | 4 | 5 | 10;
  required: boolean;
}

interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  scorecardId: string;
  ratings: { criterionId: string; rating: number; notes?: string }[];
  overallRating: number;
  recommendation: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
  notes: string;
  submittedAt: Date;
}
```

**Deliverables:**
- [ ] Hiring team management
- [ ] Interview panel configuration
- [ ] Scorecard builder
- [ ] Feedback form UI
- [ ] Feedback aggregation dashboard
- [ ] Discussion threads
- [ ] @mention system
- [ ] Team notes

### 6.6 Real-Time & Communication
**Week 32**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 7.1.1 | Socket.io Integration | Real-time bidirectional communication | 3 days |
| 7.1.3 | Real-Time Notifications | Instant in-app notifications | 2 days |
| 10.2.1 | Slack Integration | Notifications, approvals, updates | 3 days |

**WebSocket Implementation:**
```typescript
// Backend: /src/services/realtime/socket.service.ts
interface SocketEvents {
  // Server -> Client
  'notification:new': (notification: Notification) => void;
  'application:updated': (application: Application) => void;
  'message:received': (message: Message) => void;
  'interview:reminder': (interview: Interview) => void;

  // Client -> Server
  'notification:read': (notificationId: string) => void;
  'message:send': (message: CreateMessageInput) => void;
  'presence:update': (status: 'online' | 'away' | 'offline') => void;
}
```

**Deliverables:**
- [ ] Socket.io server setup
- [ ] Real-time notification delivery
- [ ] Notification center UI
- [ ] Slack OAuth integration
- [ ] Slack notification channels
- [ ] Slack commands

### 6.7 Core Analytics
**Week 32 (continued)**

| ID | Feature | Description | Effort |
|----|---------|-------------|--------|
| 9.1.1 | Funnel Analytics | Conversion rates at each stage | 2 days |
| 9.1.2 | Time-to-Hire Tracking | By role, department, recruiter | 2 days |
| 9.1.4 | Source Effectiveness | ROI by sourcing channel | 2 days |
| 9.1.5 | Recruiter Performance | Individual and team metrics | 2 days |
| 9.1.9 | Diversity Analytics | DEI metrics and trends | 2 days |
| 9.2.1 | Executive Summary Dashboard | Key KPIs at a glance | 2 days |

**Deliverables:**
- [ ] Funnel visualization
- [ ] Time-to-hire reports
- [ ] Source tracking
- [ ] Recruiter dashboards
- [ ] DEI analytics
- [ ] Executive dashboard

### Phase 6 Milestone Checklist
- [ ] 2FA working for all users
- [ ] SSO integration complete
- [ ] RBAC enforced
- [ ] GDPR compliance features live
- [ ] Collaborative hiring tools operational
- [ ] Real-time notifications working
- [ ] Slack integration active
- [ ] Analytics dashboards live

---

## Resource Requirements

### Team Structure (Recommended)

| Role | Count | Focus Area |
|------|-------|------------|
| Tech Lead | 1 | Architecture, code review, technical decisions |
| Backend Engineers | 3 | API development, integrations, AI services |
| Frontend Engineers | 2 | UI components, user experience |
| Full-Stack Engineer | 1 | Cross-cutting features |
| DevOps Engineer | 1 | Infrastructure, CI/CD, monitoring |
| QA Engineer | 1 | Testing, quality assurance |
| Product Manager | 1 | Requirements, prioritization |
| UI/UX Designer | 1 | Design system, user flows |

### Technology Stack Additions

| Category | Technology | Purpose |
|----------|------------|---------|
| Caching | Redis | Session, API cache, queues |
| Search | Elasticsearch | Full-text search |
| Queue | BullMQ | Background jobs |
| AI | OpenAI/Claude API | Content generation, analysis |
| Video | Deepgram/AssemblyAI | Transcription |
| Calendar | Google/Microsoft APIs | Calendar sync |
| Realtime | Socket.io | WebSocket communication |
| Monitoring | DataDog/Sentry | APM, errors |
| Auth | Passport.js | SSO strategies |

### Third-Party Services

| Service | Purpose | Estimated Cost |
|---------|---------|----------------|
| OpenAI API | AI features | $500-2000/month |
| Deepgram | Transcription | $200-500/month |
| SendGrid | Transactional email | $50-200/month |
| Twilio | SMS | $100-300/month |
| AWS S3/GCS | File storage | $100-500/month |
| DataDog | Monitoring | $200-500/month |

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI API rate limits | High | Implement caching, queue requests, fallback providers |
| Calendar API quota | Medium | Rate limiting, sync optimization |
| Video storage costs | Medium | Compression, retention policies, CDN |
| Search performance | High | Index optimization, query caching |
| Real-time scaling | Medium | Redis pub/sub, horizontal scaling |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Compliance violations | Critical | Legal review, automated auditing |
| Data breaches | Critical | Encryption, access controls, auditing |
| Feature creep | Medium | Strict prioritization, MVP focus |
| Integration failures | Medium | Fallback mechanisms, error handling |

---

## Success Metrics

### Phase Completion Criteria

| Phase | Key Metrics |
|-------|-------------|
| Phase 1 | API response time < 200ms, 99.9% uptime |
| Phase 2 | Profile completion rate > 60%, Search relevance > 80% |
| Phase 3 | AI scoring accuracy > 85%, Content generation satisfaction > 4/5 |
| Phase 4 | Scheduling success rate > 95%, Calendar sync latency < 5min |
| Phase 5 | Screening completion rate > 70%, Analysis accuracy > 80% |
| Phase 6 | Security audit pass, GDPR compliance certified |

### Overall Platform KPIs

- Time-to-hire reduction: 30%+
- Recruiter productivity increase: 40%+
- Candidate satisfaction: 4.5/5+
- Platform uptime: 99.9%+
- AI feature adoption: 70%+

---

## Appendix A: Database Schema Changes Summary

```prisma
// New models to add across phases

// Phase 2: Profile System
model UserProfile { ... }
model WorkExperience { ... }
model Education { ... }
model UserSkill { ... }
model Skill { ... }
model Certification { ... }
model Project { ... }
model ExternalIntegration { ... }

// Phase 4: Calendar
model CalendarConnection { ... }
model SchedulingPreferences { ... }
model SchedulingLink { ... }
model InterviewSlot { ... }

// Phase 5: AI Interviews
model ScreeningSession { ... }
model ScreeningMessage { ... }
model VideoInterview { ... }
model VideoResponse { ... }
model InterviewAnalysis { ... }
model AutomationRule { ... }
model AutomationExecution { ... }

// Phase 6: Security & Collaboration
model TwoFactorAuth { ... }
model SSOConfig { ... }
model Permission { ... }
model RolePermission { ... }
model ConsentRecord { ... }
model DataExportRequest { ... }
model DataDeletionRequest { ... }
model HiringTeam { ... }
model Scorecard { ... }
model InterviewFeedback { ... }
model CandidateComment { ... }
```

---

## Appendix B: API Endpoints Summary

### New API Routes by Phase

**Phase 2:**
- `POST /api/profile` - Create/update profile
- `GET /api/profile/:userId` - Get profile
- `POST /api/integrations/github/connect` - Connect GitHub
- `POST /api/integrations/linkedin/connect` - Connect LinkedIn
- `POST /api/resume/parse` - Parse resume

**Phase 3:**
- `POST /api/ai/score-candidate` - Score candidate
- `POST /api/ai/job-fit` - Calculate job fit
- `POST /api/ai/generate-jd` - Generate job description
- `POST /api/ai/interview-questions` - Generate questions
- `GET /api/recommendations/jobs` - Job recommendations
- `GET /api/recommendations/candidates` - Candidate recommendations

**Phase 4:**
- `POST /api/calendar/connect` - Connect calendar
- `GET /api/calendar/availability` - Get availability
- `POST /api/scheduling/links` - Create scheduling link
- `GET /api/scheduling/:linkId/slots` - Get available slots
- `POST /api/scheduling/:linkId/book` - Book slot

**Phase 5:**
- `POST /api/screening/start` - Start screening session
- `POST /api/screening/:id/message` - Send message
- `POST /api/video-interview/create` - Create video interview
- `POST /api/video-interview/:id/response` - Submit response
- `GET /api/video-interview/:id/analysis` - Get analysis
- `POST /api/automation/rules` - Create automation rule

**Phase 6:**
- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/sso/config` - Configure SSO
- `GET /api/compliance/export` - Export user data
- `POST /api/compliance/delete` - Request deletion
- `POST /api/teams/:jobId/members` - Add team member
- `POST /api/feedback/:interviewId` - Submit feedback

---

*Document Version: 1.0*
*Total P0 Features: 119*
*Estimated Duration: 32 weeks*
