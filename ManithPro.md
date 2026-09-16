# ManithPro

### The AI-Native Recruitment Operating System

**Complete Feature Documentation — Landing Page Source of Truth**

> Product: **ManithPro** by KreupAI Technologies
> Repository: `KreupAI.ManithPro`
> Document purpose: authoritative, exhaustive feature inventory for building the public landing page, sales decks, and marketing site.

---

## Table of Contents

1. [Product Positioning](#1-product-positioning)
2. [Who It's For — Personas & Roles](#2-who-its-for--personas--roles)
3. [Platform at a Glance](#3-platform-at-a-glance)
4. [Module 1 — CV-Less Candidate Profiles](#module-1--cv-less-candidate-profiles)
5. [Module 2 — Profile Integrations & Portfolio Aggregation](#module-2--profile-integrations--portfolio-aggregation)
6. [Module 3 — Verification & Trust Engine](#module-3--verification--trust-engine)
7. [Module 4 — Assessments & Skill Testing](#module-4--assessments--skill-testing)
8. [Module 5 — AI Scoring & Candidate Intelligence](#module-5--ai-scoring--candidate-intelligence)
9. [Module 6 — AI Content Generation](#module-6--ai-content-generation)
10. [Module 7 — Candidate AI Career Assistant](#module-7--candidate-ai-career-assistant)
11. [Module 8 — NLP & Document Understanding](#module-8--nlp--document-understanding)
12. [Module 9 — Calendar & Interview Scheduling](#module-9--calendar--interview-scheduling)
13. [Module 10 — Reminders & Notification Orchestration](#module-10--reminders--notification-orchestration)
14. [Module 11 — AI Screening Interviews](#module-11--ai-screening-interviews)
15. [Module 12 — Interview Analysis & Intelligence](#module-12--interview-analysis--intelligence)
16. [Module 13 — AI Knowledge Base](#module-13--ai-knowledge-base)
17. [Module 14 — Video Interviewing Suite](#module-14--video-interviewing-suite)
18. [Module 15 — Semantic Matching Engine](#module-15--semantic-matching-engine)
19. [Module 16 — Predictive Analytics](#module-16--predictive-analytics)
20. [Module 17 — Smart Recommendations](#module-17--smart-recommendations)
21. [Module 18 — Hiring Team Management](#module-18--hiring-team-management)
22. [Module 19 — Collaborative Evaluation](#module-19--collaborative-evaluation)
23. [Module 20 — Real-Time Communication](#module-20--real-time-communication)
24. [Module 21 — Authentication & Access Control](#module-21--authentication--access-control)
25. [Module 22 — Data Protection](#module-22--data-protection)
26. [Module 23 — Compliance Suite](#module-23--compliance-suite)
27. [Module 24 — Recruitment Analytics](#module-24--recruitment-analytics)
28. [Module 25 — Executive Dashboards & BI](#module-25--executive-dashboards--bi)
29. [Module 26 — Market Intelligence](#module-26--market-intelligence)
30. [Module 27 — Integration Marketplace](#module-27--integration-marketplace)
31. [Module 28 — Developer Platform & API](#module-28--developer-platform--api)
32. [Module 29 — Workflow Automation](#module-29--workflow-automation)
33. [Module 30 — Mobile, PWA & Accessibility](#module-30--mobile-pwa--accessibility)
34. [Module 31 — Enterprise Administration](#module-31--enterprise-administration)
35. [Module 32 — Technical Infrastructure & DevOps](#module-32--technical-infrastructure--devops)
36. [Module 33 — B2B Vendor–Client Staffing Marketplace](#module-33--b2b-vendorclient-staffing-marketplace)
37. [Module 34 — Core ATS & Job Management](#module-34--core-ats--job-management)
38. [Module 35 — Platform Administration Console](#module-35--platform-administration-console)
39. [Module 36 — Gamification & Engagement](#module-36--gamification--engagement)
40. [Technology Stack](#technology-stack)
41. [Architecture](#architecture)
42. [Integration Directory](#integration-directory)
43. [Security & Compliance Summary](#security--compliance-summary)
44. [Deployment Options](#deployment-options)
45. [Landing Page Content Kit](#landing-page-content-kit)
46. [Implementation Status Notes](#implementation-status-notes)

---

## 1. Product Positioning

**ManithPro is an enterprise-grade, AI-native recruitment platform that replaces CV-based hiring with structured, verified, continuously-scored candidate profiles — and wraps them in a full ATS, interview suite, analytics stack, compliance layer, and B2B staffing marketplace.**

### The problem

| Pain | Cost to the business |
|------|----------------------|
| Recruiters spend ~6 seconds per resume | Qualified candidates are missed at the top of the funnel |
| Every CV has a different format | Apples-to-apples comparison is impossible |
| Hiring lives across 6–10 disconnected tools | Context switching slows every stage |
| Feedback is scattered across email and chat | Hiring committees can't converge on a decision |
| Manual processes leave audit gaps | GDPR / CCPA / EEOC exposure |
| Gut-feel decisions | Bad hires, poor retention, no way to improve |

### The ManithPro answer

- **Structured profiles, not PDFs.** Candidates present themselves through a live, interactive, section-based profile that recruiters can scan in seconds and compare side by side.
- **Verified by default.** Email domain, employment, education, certifications, references, peer endorsements and background checks roll up into a single **Trust Score**.
- **AI at every stage.** Semantic matching, 12-dimension scoring, generated job content, AI screening interviews, interview transcription and analysis, predictive hiring outcomes.
- **One workspace.** ATS pipeline, scheduling, video interviews, messaging, scorecards, analytics and billing in a single application.
- **Enterprise-ready from day one.** Multi-tenant, SSO, 2FA, RBAC + ABAC, encryption key management, data residency, GDPR/CCPA/EEOC/SOC 2 tooling, full audit trails.
- **Plus a B2B staffing marketplace.** Clients post bulk requirements; vendor agencies submit candidates; contracts, submissions and invoices are handled inside the platform.

---

## 2. Who It's For — Personas & Roles

ManithPro ships **five first-class user roles**, each with its own navigation, dashboards and permission surface.

| Role | What they get |
|------|---------------|
| **CANDIDATE** | CV-less profile builder, job search & recommendations, applications tracker, resume manager, interviews, messaging, AI career coach, assessments, achievements, salary insights |
| **RECRUITER** | Job posting & templates, candidate search, ATS Kanban pipeline, interview scheduling, AI screening, scorecards, 25+ recruiter "hubs" for AI/analytics/integrations, team collaboration |
| **ADMIN** | Full platform console — users, jobs, applications, interviews, configuration, communication, content, audit logs, billing, monitoring, reports, recruiter approvals |
| **CLIENT** (B2B) | Post bulk hiring requirements, review vendor submissions, manage contracts, pay invoices, vendor directory |
| **VENDOR** (B2B) | Candidate supply bench, bulk upload, submit candidates to open requirements, contracts, invoicing, payout settings |

**Recruiter approval workflow:** recruiters self-register with company details and enter a `PENDING → APPROVED / REJECTED` gate reviewed by an admin, so no unvetted party can post jobs or view candidate data.

---

## 3. Platform at a Glance

| Dimension | Scale |
|-----------|-------|
| Backend REST endpoints | **1,400+** |
| API route modules | **57** |
| Backend controllers | **69** |
| Database models (Prisma / PostgreSQL) | **294** |
| Typed enums | **33** |
| Web application pages | **59** |
| React components | **158** |
| Frontend API service clients | **46** |
| Mobile screens (iOS + Android) | **36** |
| First-class user roles | **5** |
| Major feature modules | **36** |

**Client surfaces:** Responsive web app · Installable PWA (offline-capable) · Native iOS & Android app (React Native) · Public REST API with API keys & webhooks.

---

## Module 1 — CV-Less Candidate Profiles

*Reimagining how candidates present themselves.*

**Profile canvas**
- Apple-inspired dashboard layout with Notion-style inline editing and auto-save
- Guided **Profile Builder** wizard plus an **Enhanced Profile** power view
- **Profile Completeness score** with prioritized, actionable suggestions
- Public/shareable candidate profile view for recruiters

**Structured sections**
- Professional overview & summary
- **Work Experience Timeline** — full CRUD, employment types, current-role handling
- **Education Hub** — degrees, institutions, fields, grades, dates
- **Certifications Hub** — issuers, credential IDs, expiry tracking
- **Dynamic Skills Matrix** — skills grouped by category with proficiency levels (bulk add supported)
- **Skill Endorsements** — peers endorse individual skills, endorsement counts surface on the profile
- **Project Portfolio** — rich project entries with drag-to-reorder ordering and portfolio summary
- **Portfolio Gallery**, **Video Introduction**, **Certifications Showcase**
- Availability, work preferences and location preferences

**Profile version control**
- Manual save points ("versions") plus an automatic version timeline
- Visual **timeline of profile evolution**
- **Diff two versions** side by side
- **Restore** any previous version; delete obsolete ones

**Recruiter profiles**
- Dedicated recruiter profile with company details, specializations and live recruiter performance stats

---

## Module 2 — Profile Integrations & Portfolio Aggregation

*Candidates connect the accounts that already prove their work.*

| Platform | What ManithPro pulls in |
|----------|-------------------------|
| **GitHub** | OAuth connect, full profile sync, repository list, per-repo "showcase on profile" toggle |
| **LinkedIn** | OAuth connect, profile sync, one-click import into the ManithPro profile |
| **GitLab** | Profile + project sync |
| **Stack Overflow** | Reputation, badges, top answers |
| **Kaggle** | Competition rankings, notebooks, datasets |
| **Notion** | Portfolio workspace embedding |
| **Behance / Dribbble** | Design portfolio aggregation |
| **Medium / Dev.to** | Technical writing and blog output |
| **Coding platforms** (LeetCode-class) | Ratings, problems solved, contest history |
| **Online course providers** | Completed courses and certificates |
| **Academic profiles** | Publications, citations, research output |
| **Custom portfolio links** | Any additional URL, typed and displayed |

Every integration supports connect → sync → view → disconnect, and a consolidated **Integration Status** endpoint shows which accounts are live.

---

## Module 3 — Verification & Trust Engine

*Stop taking claims at face value.*

**Verification types**
- **Email domain verification** — prove employment via corporate email
- **LinkedIn employment verification** — cross-check declared roles
- **Peer endorsements** — request and collect verified colleague endorsements
- **Manager references** — structured reference requests with request/response tracking
- **Certification verification** — validate credentials against issuers
- **Education verification** — institution and degree confirmation
- **Background checks** — third-party checks (Checkr) with typed check categories and status tracking
- **Verified badges** — visible trust markers on the profile

**Trust Score**
A single 0–100 composite with a tier label, computed from weighted sub-scores:

`email verification · LinkedIn verification · endorsements · references · certifications · profile completeness · activity`

Tracks counts (verified emails, verified employments, endorsements received, references received, verified certifications), boolean trust flags, per-factor explanations, and a **historical score trend**.

**UI:** Verification Hub, Verification Panel, Trust Score Badge, Reference Cards, Request Reference modal, Skills Endorsement widget.

---

## Module 4 — Assessments & Skill Testing

*Ten assessment formats, natively built in.*

| # | Assessment | Highlights |
|---|-----------|-----------|
| 1 | **Coding Challenges** | Public challenge catalog, timed submissions, status tracking, auto-grading |
| 2 | **Technical Quizzes** | Question banks, difficulty tiers, attempt history and scoring |
| 3 | **Live Coding Environment** | Real-time interviewer/candidate sessions with session lifecycle states |
| 4 | **Take-Home Projects** | Project briefs, deadlines, candidate submissions, reviewer workflow |
| 5 | **External Assessments** | HackerRank and Codility integration with result sync |
| 6 | **Soft Skills Assessment** | Category-based behavioural questions and scored attempts |
| 7 | **Language Proficiency Tests** | Multiple test types, per-question scoring, proficiency output |
| 8 | **Domain-Specific Assessments** | Industry/domain question sets across a typed domain taxonomy |
| 9 | **Assessment Analytics** | Difficulty calibration, completion rates, score distributions |
| 10 | **Skill Decay Tracking** | Flags skills going stale over time and prompts refresh |

---

## Module 5 — AI Scoring & Candidate Intelligence

*Twelve independent scoring dimensions, every one explainable.*

| Score | What it measures |
|-------|------------------|
| **AI Profile Score** | Overall profile strength and credibility |
| **Job-Fit Score** | Match between a specific candidate and a specific job |
| **Culture Fit Analysis** | Alignment with company values and working style |
| **Growth Potential Score** | Trajectory, learning velocity, upside |
| **Technical Depth Score** | Genuine depth vs. surface familiarity |
| **Communication Score** | Written and verbal communication quality |
| **Reliability Score** | Tenure patterns, responsiveness, follow-through |
| **Salary Expectation Alignment** | Candidate expectations vs. budgeted range |
| **Location Compatibility** | Location, relocation appetite, remote fit, timezone overlap |
| **Diversity & Inclusion Metrics** | D&I analytics at the pipeline level |
| **Explainable AI Scores** | Human-readable "why this score" breakdown for every dimension |
| **Score Calibration Tools** | Tune weights per role, per team, per company |

Plus a **Comprehensive Scoring Dashboard** that rolls all dimensions into one candidate view, and **Market Salary Data** grounding for compensation-linked scores.

---

## Module 6 — AI Content Generation

*Everything a recruiter has to write, drafted for them.*

| Generator | Output |
|-----------|--------|
| **AI Job Description Generator** | Complete, structured JD from a short brief |
| **Job Title Optimizer** | Higher-visibility, market-standard title suggestions |
| **Requirements Analyzer** | Flags unrealistic, redundant or over-specified requirements |
| **Inclusive Language Checker** | Detects biased/exclusionary phrasing and rewrites it |
| **Salary Range Suggester** | Market-grounded, role- and location-aware ranges |
| **Interview Questions Generator** | Role-specific question sets |
| **Screening Criteria Generator** | Auto-built knockout and scoring criteria |
| **Candidate Summary Generator** | One-paragraph digest of a full candidate profile |
| **Rejection Email Generator** | Respectful, personalised, compliant rejections |
| **Offer Letter Generator** | Structured offer letters from role + comp inputs |
| **Job Ad A/B Testing** | Multiple ad variants with performance comparison |
| **Competitor Job Analysis** | How rival postings for the same role are written and positioned |

---

## Module 7 — Candidate AI Career Assistant

*The AI works for the candidate too.*

- **AI Profile Enhancer** — rewrites and strengthens profile content
- **Experience Description Generator** — turns bullet points into impact statements
- **Skills Gap Identifier** — compares the candidate to target roles and names what's missing
- **Cover Letter Generator** — tailored per application
- **Interview Prep Coach** — role- and company-specific preparation
- **Salary Negotiation Advisor** — data-backed negotiation guidance
- **Career Path Advisor** — multi-step career trajectory planning
- **Learning Recommendations** — courses and resources mapped to identified gaps
- **Application Insights** — why applications succeed or stall
- **Portfolio Feedback** — AI critique of projects and portfolio presentation

Surfaced through the **Candidate AI Tools Hub** and **Extended AI/NLP Hub**.

---

## Module 8 — NLP & Document Understanding

- **Resume / Profile Parser** — extracts structured data from uploaded documents
- **Skill Extraction** — pulls normalized skills out of free text
- **Semantic Search Index** — meaning-based search across candidates and content
- **Entity Recognition** — identifies companies, institutions, technologies, titles and locations in unstructured text

---

## Module 9 — Calendar & Interview Scheduling

**Calendar integration**
- Google Calendar and Microsoft Outlook two-way sync
- Calendar events created, updated and cancelled from within ManithPro
- **Conflict detection** across connected calendars
- **Buffer time settings** — enforce gaps between interviews
- **Working hours** — per-user availability windows
- **Holiday calendars** — region-aware non-working days

**Smart scheduling**
- **Self-scheduling links** — candidates book from the interviewer's real availability
- **Auto-availability** — automatically computed open slots
- **Panel coordinator** — find a slot that works for an entire interview panel
- **Timezone intelligence** — per-user timezone preferences, correct display for everyone

**Interview management**
- Interview types: Phone Screen, Technical, HR, Final, Peer, Cultural Fit, Other
- Statuses: Scheduled, Completed, Cancelled, Rescheduled, No-Show
- Interview calendar view, upcoming-interview feeds, per-application interview history
- Reschedule flow, structured feedback submission, availability picker

---

## Module 10 — Reminders & Notification Orchestration

- **Reminder schedules** — configurable multi-stage reminder cadences
- **Notification channels** — in-app, email, SMS and web push, individually toggleable
- **Push subscriptions** — browser and mobile push registration
- **Confirmation requests** — ask candidates to confirm attendance and track responses
- **Prep materials** — attach preparation packs to an interview and track per-recipient delivery
- **Notification preferences** — granular per-user, per-event-type controls
- Notification types include: application status change, interview scheduled, interview reminder, message received, job posted, application received, offer made, offer accepted, offer rejected

---

## Module 11 — AI Screening Interviews

*Automate the first conversation.*

- **AI-conducted screening interviews** with full lifecycle: create → start → complete / cancel / extend deadline
- **Token-based candidate access** — candidates take screenings without needing a session
- **Question flows** — branching, ordered question sets that can be reused
- **Screening questions** — add, edit, delete, reorder within a flow
- **Follow-up rules** — conditional follow-up questions evaluated against candidate answers
- **Screening responses** — captured, scored and human-reviewable
- **Chat-based screening** — conversational message-by-message screening experience
- **Screening templates** — reusable configurations per role family
- **Candidate accessibility preferences** — screening adapts to accessibility needs
- **Screening statistics** — completion, pass-through and quality metrics

---

## Module 12 — Interview Analysis & Intelligence

*Every interview becomes structured data.*

| Capability | Detail |
|-----------|--------|
| **Transcription** | Full interview transcription |
| **Answer Analysis** | Per-answer quality and relevance evaluation |
| **Topic Detection** | What was actually covered — and what wasn't |
| **Sentiment Analysis** | Tone and engagement over the course of the interview |
| **Communication Score** | Objective communication rating |
| **Technical Verification** | Cross-checks claimed technical ability against interview evidence |
| **Red Flag Alerts** | Automatic flags for inconsistencies and risk signals |
| **Summary Generation** | Reviewable interview summary with reviewer sign-off |
| **Highlight Extraction** | Key moments clipped for the hiring team |
| **Comparative Analysis** | Structured candidate-vs-candidate comparison |
| **Full Analysis** | One call runs the entire analysis pipeline |

---

## Module 13 — AI Knowledge Base

*Teach the AI your company.*

- **Company knowledge import** — mission, values, benefits, process, culture
- **Role-specific knowledge** — what "good" looks like for each role
- **Interview playbooks** — codified interview structure per role
- **Best practices library** — internal hiring standards
- **Competitor intelligence** — how competitors hire and position roles
- **Dynamic FAQ answers** — candidate questions answered from company knowledge
- **Continuous learning** — AI feedback loop that improves outputs from recruiter corrections
- **Custom evaluation criteria** — define your own scoring rubric dimensions
- Knowledge base statistics and coverage reporting

---

## Module 14 — Video Interviewing Suite

- **Built-in video conferencing** — native rooms with participant management
- **Platform integrations** — Zoom, Microsoft Teams and Google Meet external meetings
- **Interview recording** — capture and store sessions
- **Live transcription** — real-time captions during the interview
- **Virtual backgrounds**
- **Collaborative whiteboard** — shared drawing for system-design rounds
- **Live code editor** — in-interview coding with syntax highlighting
- **In-call chat** — messages scoped to the video room
- **Interview timer** — keeps rounds on schedule
- **One-way video interviews** — asynchronous recorded responses with per-question response tracking

---

## Module 15 — Semantic Matching Engine

*Matching that understands meaning, not keywords.*

| Capability | What it does |
|-----------|--------------|
| **Skill Embeddings** | Vector representations of skills; batch embedding; company-scoped embeddings |
| **Skill Similarity** | Compute similarity between any two skills; find similar skills |
| **Experience Level Inference** | Rule-driven inference of a candidate's true seniority (with company-specific rules) |
| **Role Similarity Detection** | Maps equivalent roles across different titles and companies |
| **Skill Transferability** | Identifies which of a candidate's skills transfer to a target role |
| **Project Relevance Scoring** | Scores each portfolio project against a specific job |
| **Industry Crossover Intelligence** | Finds candidates whose industry background transfers |
| **Hidden Talent Discovery** | Surfaces strong candidates keyword search would never return |
| **Candidate Match Scoring** | Composite match score per candidate/job pair |
| **Matching Configuration** | Global, company and job-level tuning of matching behaviour |

---

## Module 16 — Predictive Analytics

*Forecast outcomes before you commit.*

| Prediction | Business question answered |
|-----------|---------------------------|
| **Hiring Success Prediction** | Will this hire work out? (with actual-outcome recording for model feedback) |
| **Time-to-Hire Forecast** | How long will this req actually take? |
| **Offer Acceptance Prediction** | Will they say yes? (decision recorded back for calibration) |
| **Retention Risk Score** | Who is likely to leave early? High-risk list surfaced |
| **Performance Prediction** | Predicted on-the-job performance; top-predicted-performers list per job |
| **Market Availability Analysis** | Does this talent even exist in this market? |
| **Salary Trend Prediction** | Where compensation for this role is heading |
| **Pipeline Health Prediction** | Which pipelines are unhealthy right now |

Supported by **prediction model configuration** per model type, a **prediction audit log**, and **accuracy statistics** measuring predictions against real outcomes.

---

## Module 17 — Smart Recommendations

| Recommendation | Audience |
|----------------|----------|
| **Job Recommendations** | Candidates — ranked matching roles, with interaction tracking |
| **Candidate Recommendations** | Recruiters — ranked candidates per job, with action tracking |
| **Similar Candidates Finder** | Recruiters — "more like this person" |
| **Passive Candidate Identification** | Recruiters — strong non-applicants, with outreach tracking |
| **Skill-Up Recommendations** | Candidates — targeted upskilling with progress tracking |
| **Re-Engagement Suggestions** | Recruiters — silver-medallists worth reviving per job |
| **Interview Panel Recommendations** | Recruiters — the right interviewers for this candidate/job |
| **Sourcing Channel Recommendations** | Recruiters — where to spend sourcing effort |

All recommendations accept explicit **feedback**, and each recommendation type has its own tunable **configuration**.

---

## Module 18 — Hiring Team Management

- **Hiring teams** — create, update, activate/deactivate, scoped per job or department
- **Team members & permissions** — add, remove and set granular per-member permissions
- **Interview panels** — build, reorder, update and delete structured panels
- **Workload dashboard** — per-member load, auto-calculated team workloads, workload summary
- **Coverage scheduling** — coverage windows, approval, and explicit handoff completion
- **Team performance** — per-team metrics, recomputation, and team-to-team comparison
- **Hiring manager dashboard** — configurable widgets, saved filters, live dashboard data
- **Team activity log** and hiring-team statistics

---

## Module 19 — Collaborative Evaluation

*Turn opinions into a decision.*

| Feature | Detail |
|---------|--------|
| **Scorecard Templates** | Build, version and clone structured evaluation templates |
| **Interview Feedback** | Structured submission, editing, and draft saving |
| **Blind Evaluation** | Configurable anonymisation of candidate data to reduce bias |
| **Feedback Aggregation** | Automatic roll-up of all interviewer scores |
| **Calibration Sessions** | Run sessions to align interviewer standards |
| **Decision Voting** | Voting rounds, individual votes, round summaries, formal close |
| **Evaluation Deadlines** | Deadline rules, per-instance tracking and status |
| **Disagreement Resolution** | Flag, resolve or escalate interviewer disagreements |
| **Historical Comparison** | Compare a candidate to past hires and hiring benchmarks |

Plus **Collaborative Notes**, **Team Discussion** threads and **Code Snippet Sharing** in the UI.

---

## Module 20 — Real-Time Communication

**Presence & connection**
- Live presence status with per-user presence preferences
- Bulk presence lookup, connection registration, channel subscriptions
- Connection status indicator in the UI

**Messaging**
- Conversations with participants, participant settings, add/remove members
- Send, edit, delete messages; mark read; emoji **reactions**
- **Typing indicators**
- **Message templates** — create, use, update, delete
- **Scheduled messages** — schedule, update, cancel
- **Message search** across conversations
- **Attachments** — upload and share files
- **Email fallback** — configurable delivery to email when a user is offline
- Application-scoped conversations, eligible-candidate lookup, unread counts
- Real-time notifications with mark-read, mark-all-read and dismiss

---

## Module 21 — Authentication & Access Control

| Feature | Detail |
|---------|--------|
| **Two-Factor Authentication** | Setup, verification, disable, backup code generation |
| **SSO Integration** | Multiple configurable SSO providers, public initiate + callback endpoints |
| **Password Policy** | Org-level policy definition and live password validation |
| **Session Management** | List active sessions, terminate one or all others, session settings |
| **IP Whitelisting** | Rule CRUD plus live access checks |
| **Trusted Devices** | Trust, revoke individually or revoke all |
| **Login Anomaly Detection** | Login attempt recording and configurable anomaly detection |
| **API Key Management** | Create, update, revoke, and per-key usage tracking |
| **RBAC** | Roles, permissions, role-permission assignment, user-role assignment, permission checks |
| **ABAC** | Attribute-based policies, attribute registry, live policy evaluation |
| **Audit Logging** | Security-scoped audit entries and a security overview dashboard |

**Baseline hardening:** JWT authentication, bcrypt password hashing, Helmet security headers, strict CORS, per-route rate limiting (API / auth / password-reset / upload), request slow-down, content-type validation, request IDs, SQL-injection protection and XSS protection middleware.

---

## Module 22 — Data Protection

- **Encryption key management** — create, update, rotate, revoke; rotation schedules
- **Key lifecycle** — lifecycle events, usage analytics, scheduled retirement, wrapped key export/import
- **TLS configuration** — inspect config, view certificate info, renew certificates
- **PII detection** — configurable detectors, content scanning, PII masking, detection logs
- **Data anonymization** — anonymization rules, batch anonymization jobs with status/cancel, inline anonymization
- **Secure file storage** — encrypted upload/download, metadata management, access logs, share and revoke share
- **Data residency** — per-region configuration, compliance validation, supported-region listing
- **Backup & recovery** — backup configs, scheduled and manual backups, integrity verification, download, restore jobs with status and cancel
- **Data protection dashboard**, audit logs, statistics and on-demand compliance checks

---

## Module 23 — Compliance Suite

| Regulation / Framework | Capabilities |
|------------------------|--------------|
| **GDPR** | Consent recording and revocation, consent history, full user data export |
| **CCPA** | Request intake, verification, progress updates, completion |
| **EEOC / OFCCP** | Report generation and submission |
| **Data Retention** | Policy definition and automated enforcement |
| **Right to be Forgotten** | Deletion requests with verification and execution |
| **Consent Management** | Consent policies, per-user consent state and updates |
| **DSAR** | Data Subject Access Request intake, tracking and formal response |
| **Audit Trail** | Compliance-scoped audit logs with export |
| **Compliance Dashboards** | Live compliance metrics and posture view |
| **Bias Auditing** | Generate and review algorithmic bias audit reports |
| **SOC 2 Readiness** | Control register, control updates, evidence attachment, audits, readiness score |

---

## Module 24 — Recruitment Analytics

Twelve analytics domains, each with trends, breakdowns and export:

1. **Funnel Analytics** — stage-by-stage conversion, snapshots, trends
2. **Time-to-Hire** — metrics, averages, per-hire recording
3. **Cost-per-Hire** — cost breakdown by category, per-hire cost recording
4. **Source Effectiveness** — channel performance, ROI, spend tracking
5. **Recruiter Performance** — per-recruiter metrics, leaderboard, goals
6. **Offer Acceptance** — acceptance rates, offer recording and status updates
7. **Pipeline Velocity** — velocity trends and **bottleneck analysis**
8. **Quality of Hire** — post-hire quality scoring and assessment recording
9. **Diversity Analytics** — diversity goals and stage-by-stage conversion equity
10. **Interview-to-Offer Ratio** — interview efficiency measurement
11. **Drop-off Analysis** — where candidates leave, with corrective recommendations
12. **SLA Tracking** — define SLAs, track compliance, surface breaches

Plus a unified **recruitment analytics dashboard**, platform stats, and **report export**.

---

## Module 25 — Executive Dashboards & BI

- **Executive summary dashboard** — organisation-level hiring health
- **Custom dashboard builder** — widget library, widget templates, full widget CRUD
- **Trend analysis & forecasting** — historical trends with forward projections
- **Benchmark comparisons** — industry benchmarks and org-vs-industry comparison runs
- **Scheduled reports** — recurring report definitions, run-now, execution history
- **BI tool export** — configurable export targets, connection testing, triggered exports, export logs
- **Goal tracking** — hiring goals with progress recording and progress history
- **Department & team views** — per-department dashboards, department comparison, team metrics

---

## Module 26 — Market Intelligence

| Feature | Detail |
|---------|--------|
| **Salary Market Data** | Market rates, role comparisons, salary trends |
| **Talent Pool Analysis** | Size and composition of the available talent pool |
| **Competitor Hiring Insights** | Track named competitors and their hiring activity |
| **Skills Demand Trends** | Current demand, **emerging skills**, forward skill forecasts |
| **Location Intelligence** | Location comparison and **remote work trends** |
| **Industry Trends** | Cross-industry comparison and industry forecasts |

Delivered through a market intelligence dashboard, point-in-time **market snapshots**, and exportable reports. Candidate-facing **Salary Insights** page is powered by the same data.

---

## Module 27 — Integration Marketplace

### HR & Payroll (HRIS)
Workday · BambooHR · ADP · Gusto · Deel · SAP SuccessFactors
Full integration CRUD, connection testing, triggered sync, sync logs with detail drill-down, **field mapping** editor, provider catalogue and dashboard.

### Communication platforms
Slack · Microsoft Teams · Gmail · Outlook · WhatsApp Business · SMS Gateway · Twilio · SendGrid · Amazon SES
Integration CRUD, connection test, test-message send, **message template** CRUD with preview, notification settings, platform catalogue and dashboard.

### Job boards & sourcing
LinkedIn Jobs · Indeed · Glassdoor · ZipRecruiter · Google Jobs
Board integration CRUD, connection test, **post / update / close / refresh** job postings, **application import & sync**, posting performance analytics, source comparison, board catalogue and dashboard.

### Calendar
Google Calendar · Microsoft Outlook

### Assessment
HackerRank · Codility

### Verification
Checkr (background checks) · LinkedIn (employment)

### Payments
Stripe · PayPal

### Video
Zoom · Microsoft Teams · Google Meet

### AI
OpenAI · Anthropic (via a pluggable AI service layer), plus a dedicated transcription service

### Automation
Zapier/Make-class automation integrations via the automation integration registry

---

## Module 28 — Developer Platform & API

- **API keys** — issue, scope, update, revoke, with per-key usage analytics
- **Webhooks** — endpoint CRUD, test delivery, delivery log, **retry failed deliveries**
- **Event catalogue** — list of all subscribable platform events
- **API scopes** — published permission scopes
- **API documentation** — OpenAPI 3 spec served with Swagger UI
- **Developer portal dashboard** — keys, usage, webhooks and errors in one view
- **Rate limiting & quota** controls exposed at the API-infrastructure layer

---

## Module 29 — Workflow Automation

- **Workflow automations** — trigger → condition → action rules across the hiring lifecycle
- **Workflow templates** — pre-built automations, clonable
- **Trigger events & actions** — catalogue of available triggers and actions
- **Workflow executions** — run history with status and error detail
- **Scheduled jobs** — cron-style recurring platform tasks
- **Bulk actions** — mass operations across candidates, jobs and applications
- **Approval workflows** — multi-step approval chains
- **Approval requests** — per-step records, approve/reject, escalation
- Automation analytics and a workflow automation dashboard

**Automated status messaging:** application status changes automatically trigger the right templated communication to the candidate.

---

## Module 30 — Mobile, PWA & Accessibility

### Native mobile app (iOS + Android, React Native)
Role-aware navigation stacks for **Candidate**, **Recruiter**, **Admin** and **B2B**:

- **Candidate:** Dashboard, Jobs, Job Detail, Applications, Application Detail, Saved Jobs, Interviews, Messages, Chat, Profile, Edit Profile
- **Recruiter:** Dashboard, Jobs, Post Job, Applications, Candidates, Schedule Interview, Analytics
- **Admin:** Dashboard, Users, Jobs, Analytics
- **B2B:** Dashboard, Requirements, Requirement Detail, Create Requirement, Supply, Add Candidate, Contracts, Draft Contract, Invoices, Invoice Detail, Profile
- **Auth:** Login, Register, Forgot Password

Backed by **device management**, **push notifications**, **remote app config** and an **offline sync queue**.

### Progressive Web App
- Installable with app manifest, maskable icons and app shortcuts (Browse Jobs, My Applications, …)
- Service worker with **offline page** and cached shell
- **Web push subscriptions**
- Install prompt component
- PWA configuration endpoints

### Accessibility (WCAG-oriented)
- Skip links, screen-reader-only content, ARIA live regions and an announcer
- **Focus trap / focus lock** for modals
- Keyboard navigation helpers and **roving tabindex**
- Focus-visible handling
- **Per-user accessibility settings** and preset profiles
- **Accessibility audits** with scoring and an accessibility dashboard
- Dark mode / light mode with a persisted theme toggle
- Responsive layout primitives across all breakpoints

### Internationalization
Seven locales out of the box — **English, Spanish, French, German, Portuguese, Japanese, Chinese** — with locale-aware number, date, currency and relative-time formatting.

---

## Module 31 — Enterprise Administration

**Multi-tenancy & org structure**
- **Tenants** — full multi-tenant isolation
- **Organizations** — org records under a tenant
- **Departments** — hierarchical (parent/child) department trees
- **Cost centers** — chargeback and budget attribution

**User & license management**
- **Licenses** and **license allocations** per user/seat
- **Role templates** and **custom roles**
- **Access reviews** — periodic entitlement recertification
- **User activity logs**

**Billing & subscriptions**
- Plans: **Free, Basic, Professional, Enterprise, Custom**
- Subscription lifecycle: Active, Cancelled, Expired, Suspended, Trial
- Payments with typed methods and statuses; invoice generation and mark-paid
- **Usage & quotas** enforcement
- **Enterprise contracts**
- Revenue analytics and billing data export

---

## Module 32 — Technical Infrastructure & DevOps

| Area | Capabilities |
|------|--------------|
| **API infrastructure** | API keys, rate limiting, cache management, API docs, webhooks |
| **Testing & quality** | Test suites, test runs, test cases, code quality metrics, CI pipelines |
| **Monitoring & logging** | System metrics, error logs, audit logs, performance traces, alert rules, alert incidents |
| **DevOps & deployment** | Deployments, environments, **feature flags**, service health, backups |

**Live platform monitoring** (admin console): system health, API usage, error logs and error statistics, database metrics, performance metrics, background job status, cache metrics, active sessions.

**Observability & performance:** Sentry error tracking, health-check endpoints, Redis caching layer, response compression, request logging, lazy-loaded routes, image optimization, client-side performance monitoring and a structured logger.

---

## Module 33 — B2B Vendor–Client Staffing Marketplace

*A complete staffing-agency marketplace built into the platform.*

### For CLIENTS
- **Post bulk hiring requirements** — title, description, headcount, primary/secondary skills, experience band, qualification, location, work mode, employment type, duration, budget & currency, billing frequency, notice period, deadline
- Requirement lifecycle management (create, edit, close, delete) and an open-requirements board
- **Review vendor submissions** — approve or reject candidates submitted against each requirement
- **Contracts** — draft creation, status transitions, in-browser view and PDF download
- **Invoices** — receive, review, pay, download
- **Vendor directory** — browse available supplier agencies
- Client dashboard with live stats, recent requirements, recent placements and pending contracts
- Client settings: default payment terms, preferred contract duration, auto-approve submissions, NDA requirement

### For VENDORS
- **Candidate supply bench** — add candidates individually or **bulk upload**, with skills, experience and resume
- **Submit candidates** to any open client requirement
- **Submission tracking** — Submitted → Shortlisted → Rejected → Placed
- **Placements** record with review timestamps and notes
- **Contracts** — view, download, respond
- **Invoicing** — raise invoices against contracts, track due/paid status
- Vendor dashboard with supply, submission and placement stats
- Vendor settings: banking details, minimum rate, service areas, specializations, availability for new projects

### Shared
- Company profile, contact person, address and website
- Notification preferences: new submissions, contract updates, invoice reminders, weekly digest
- B2B-specific navigation shell and dedicated mobile B2B navigator

---

## Module 34 — Core ATS & Job Management

**Job management**
- Create, edit, publish and delete jobs — Draft / Open / Closed
- Job types: Full-time, Part-time, Contract, Internship, Remote
- **Job templates** for fast repeat posting
- Company profiles and **Enhanced Company Profile** (culture, team gallery, social proof)
- Job detail pages with apply flow

**Search & discovery**
- Standard job browse with filters
- **Advanced Job Search**
- **Super Advanced Job Search** — multi-facet, saved-criteria search
- **Job recommendations** and **Smart Recommendations** for candidates
- **Candidate Search** and **Recruiter Recommendations** for recruiters
- **Saved jobs** with save/unsave and saved-state checks
- **Job alert preferences**

**Application pipeline**
- Statuses: Pending → Reviewing → Shortlisted → Interview Scheduled → Accepted / Rejected / Withdrawn
- **Kanban pipeline** with drag-and-drop stage movement
- Application detail, **application timeline/history**, review view, and pipeline visualisation
- Duplicate-application prevention, candidate withdrawal, recruiter status updates
- Resume attachment and download per application
- Bulk status updates, bulk delete and CSV export (admin)

**Resume management**
- Multiple resumes per candidate, default-resume selection, upload, download and delete

**Notifications & messaging**
- In-app notification centre with unread counts, mark-read, mark-all-read and delete
- Direct candidate–recruiter messaging with conversation list and unread badges

**Dashboards**
- Candidate Dashboard and **Enhanced Candidate Dashboard**
- Recruiter Dashboard and **Enhanced Recruiter Dashboard**
- Metric cards, line and bar charts, response-metrics cards

**Onboarding & help**
- Guided product **tour overlay**, help button, **FAQ panel**, video tutorials, contextual tooltips
- Skeleton loaders, empty states, toast notifications and global error boundaries

---

## Module 35 — Platform Administration Console

Fifteen dedicated admin screens:

| Console | What it does |
|---------|--------------|
| **Admin Dashboard** | Platform-wide KPIs and activity |
| **User Management** | Full user CRUD, role changes, password resets, bulk delete, user stats |
| **Recruiter Approvals** | Pending recruiter queue, approve/reject with reason, approval stats |
| **Job Management** | All jobs, per-job applications, status changes, bulk operations, job stats |
| **Application Management** | All applications, status and notes updates, bulk operations, **CSV export** |
| **Interview Management** | All interviews, calendar view, upcoming feed, bulk operations, export |
| **Configuration** | Site, jobs, applications, email, uploads and security settings, plus reset-to-default |
| **Communication** | Broadcast email, broadcast notification, test email, communication history, delivery stats |
| **Content Management** | FAQs (reorderable), email templates, notification templates, static pages, help articles (reorderable), content stats |
| **Advanced Analytics** | Comprehensive analytics, recruiter performance, time-to-hire, sources, skills demand, industry, engagement, revenue |
| **Audit Logs** | Full audit trail, per-user activity, statistics, export, retention cleanup |
| **Billing** | Subscriptions, payments, invoices, revenue analytics, billing export |
| **Monitoring** | Health, API usage, errors, database, performance, background jobs, cache, sessions |
| **Reports** | User, job, application, interview, recruiter and conversion reports; scheduled reports; report history |
| **Analytics** | Dashboard, users, jobs, applications, interviews, activity, conversion funnel |

Audit actions tracked: Create, Update, Delete, Login, Logout, Approve, Reject, Restore, Export, Import.

---

## Module 36 — Gamification & Engagement

- **Achievement definitions** — categorised, tiered achievements with criteria, target values, points, badge icon and colour
- **User achievements** — automatic detection and awarding as candidates progress
- **Achievement statistics** and a **leaderboard**
- **Achievement badges** displayed on candidate profiles
- Profile completeness gamified with prioritized next actions
- Social proof, team gallery and company culture showcases on employer profiles

---

## Technology Stack

### Frontend (Web)
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tooling & dev server |
| Tailwind CSS 3 | Design system & styling |
| React Router 6 | Routing |
| TanStack React Query 5 | Server state & caching |
| Zustand + Immer | Client state (auth, applications, notifications, UI) |
| React Hook Form + Zod | Forms & schema validation |
| TanStack React Table | Data grids |
| Recharts | Charts & visualisations |
| Headless UI + Lucide | Accessible primitives & icons |
| @hello-pangea/dnd | Kanban drag & drop |
| react-hot-toast | Toasts |
| react-syntax-highlighter | Code display |
| Socket.IO client | Real-time transport |
| Vitest + Testing Library + MSW | Unit/integration testing & API mocking |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express 4 | API server |
| TypeScript 5 | Type safety |
| Prisma 5 | ORM & migrations |
| PostgreSQL | Primary datastore |
| Redis (ioredis) | Cache & sessions |
| JWT + bcrypt | Authentication |
| Helmet, express-rate-limit, express-slow-down | Security hardening |
| express-validator | Input validation |
| Multer | File uploads |
| Nodemailer | Transactional email |
| PDFKit | PDF generation (contracts, invoices, reports) |
| Swagger UI + OpenAPI 3 | API documentation |
| Sentry | Error tracking |
| Compression | Response optimization |

### Mobile
React Native 0.82 · React 19 · React Navigation 7 (native stack + bottom tabs) · Axios · AsyncStorage · Vector Icons · Linear Gradient · Jest

### Infrastructure & DevOps
Docker & Docker Compose (dev / default / prod) · Nginx reverse proxy · Cloudflare CDN config · GitHub Actions (CI, staging CD, production CD, PR preview, mobile build, security scan) · database backup / restore / maintenance scripts · health-check and rollback scripts

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT SURFACES                             │
│   Web App (React/Vite)   │  PWA (offline)  │  Mobile (React Native)  │
└───────────────┬──────────────────┬───────────────────┬───────────────┘
                │                  │                   │
                └──────────────────┴───────────────────┘
                                   │
                     ┌─────────────▼─────────────┐
                     │   Nginx / CDN (Cloudflare) │
                     └─────────────┬─────────────┘
                                   │
        ┌──────────────────────────▼──────────────────────────┐
        │        Express API — 57 route modules, 1400+ endpoints│
        │  Helmet · CORS · Rate limit · Slow-down · Validation  │
        │  JWT auth · RBAC/ABAC · Request ID · SQLi/XSS guards  │
        └──────────────────────────┬──────────────────────────┘
                                   │
   ┌───────────────┬───────────────┼───────────────┬───────────────┐
   ▼               ▼               ▼               ▼               ▼
┌────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│  CORE  │   │    AI    │   │ SCHEDULING│   │ANALYTICS │   │   B2B    │
│ATS·Jobs│   │Scoring   │   │Calendar   │   │Recruiting│   │Marketplace│
│Profiles│   │Matching  │   │Interviews │   │Executive │   │Contracts │
│Messages│   │Screening │   │Reminders  │   │Market    │   │Invoices  │
└───┬────┘   └────┬─────┘   └─────┬─────┘   └────┬─────┘   └────┬─────┘
    │             │               │              │              │
    └─────────────┴───────────────┴──────────────┴──────────────┘
                                   │
        ┌──────────────────────────▼──────────────────────────┐
        │                 INTEGRATION LAYER                    │
        │ Calendar · HRIS · Comms · Job Boards · Assessments   │
        │ Verification · Payments · Video · AI · Automation    │
        └──────────────────────────┬──────────────────────────┘
                                   │
        ┌──────────────────────────▼──────────────────────────┐
        │  PostgreSQL (294 models) │ Redis │ File/Object store │
        └──────────────────────────────────────────────────────┘
```

**Layered backend:** Routes → Middleware (auth, validation, cache, compression, logging, security) → Controllers → Services → Prisma → PostgreSQL, with a dedicated cache layer, monitoring layer and integrations layer.

**Frontend organisation:** pages → feature hubs → shared UI kit (Button, Card, Input, Modal, Form, DataTable, Toast, Loading, Badge, EmptyState, Animation, Responsive, Accessibility) → typed API service clients → Zustand stores + React Query.

---

## Integration Directory

| Category | Providers |
|----------|-----------|
| **Calendar** | Google Calendar, Microsoft Outlook |
| **Video** | Zoom, Microsoft Teams, Google Meet, built-in WebRTC rooms |
| **HRIS / Payroll** | Workday, BambooHR, ADP, Gusto, Deel, SAP SuccessFactors |
| **Communication** | Slack, Microsoft Teams, Gmail, Outlook, WhatsApp Business, Twilio SMS, SendGrid, Amazon SES |
| **Job boards** | LinkedIn Jobs, Indeed, Glassdoor, ZipRecruiter, Google Jobs |
| **Assessments** | HackerRank, Codility |
| **Verification** | Checkr, LinkedIn |
| **Payments** | Stripe, PayPal |
| **AI** | OpenAI, Anthropic (pluggable provider layer) |
| **Developer profiles** | GitHub, GitLab, Stack Overflow, Kaggle, coding platforms |
| **Portfolio & content** | Notion, Behance, Dribbble, Medium, Dev.to, custom links |
| **Automation** | Zapier / Make-class automation registry |
| **Outbound** | Webhooks with retry, API keys with scopes, BI export connectors |

---

## Security & Compliance Summary

| Control | Implementation |
|---------|----------------|
| **Authentication** | JWT, bcrypt hashing, 2FA with backup codes, SSO |
| **Authorization** | 5 roles, RBAC (roles + permissions), ABAC policy engine, route-level guards |
| **Session security** | Active session listing, remote termination, trusted devices, session policy |
| **Network** | Helmet headers, strict CORS, TLS config & certificate renewal, IP whitelisting |
| **Abuse prevention** | Tiered rate limiting, request slow-down, login anomaly detection |
| **Input safety** | express-validator, Zod schemas, SQL-injection guard, XSS guard, content-type validation, upload restrictions |
| **Data at rest** | Encryption key management with rotation, wrapped key export/import, secure encrypted file storage |
| **Privacy** | PII detection & masking, anonymization rules and jobs, data residency configuration |
| **Resilience** | Backup configs, scheduled and manual backups, integrity verification, restore jobs |
| **Regulatory** | GDPR, CCPA, EEOC/OFCCP, DSAR, right-to-be-forgotten, consent management, retention policies |
| **Assurance** | SOC 2 control register with evidence and readiness scoring, bias auditing, full audit trails with export |
| **Observability** | Sentry, error logs, performance traces, alert rules and incidents, health endpoints |

---

## Deployment Options

| Option | Description |
|--------|-------------|
| **Cloud hosted (SaaS)** | Fully managed, auto-scaling, global CDN distribution, automatic updates |
| **Private cloud** | Dedicated infrastructure, custom security controls, VPN connectivity, tailored compliance |
| **On-premises** | Full data sovereignty, air-gapped deployment option, custom integration support |

**Containerised stack:** PostgreSQL · Redis · Backend API · Frontend · Nginx · Background worker — with separate `dev`, default and `prod` compose profiles, persistent volumes for database, cache, uploads and logs.

**CI/CD:** GitHub Actions pipelines for continuous integration, PR preview environments, staging deployment, production deployment, mobile builds and scheduled security scanning. Operational scripts cover build, deploy, rollback, health check, database backup, restore and maintenance.

---

## Landing Page Content Kit

### Suggested hero

> **The Future of Recruitment is Here**
> # Find your dream job — or your perfect candidate.
> ManithPro connects exceptional talent with world-class organizations using advanced AI matching, verified profiles, and a complete hiring workspace.
>
> `[ Get Started Free ]`  `[ Book a Demo ]`

### Alternate positioning lines
- *"CV-less hiring. Verified talent. AI that explains itself."*
- *"One platform: sourcing, screening, interviewing, deciding, reporting."*
- *"From requisition to offer — and every metric in between."*
- *"Enterprise-grade recruitment, without the enterprise tool sprawl."*

### Three-pillar feature grid (above the fold)

| Pillar | Headline | Supporting copy |
|--------|----------|-----------------|
| 🎯 **Smart Matching** | Matching that understands meaning | Semantic embeddings, skill transferability and hidden-talent discovery surface candidates keyword search would never find. |
| ✅ **Verified Profiles** | Trust, quantified | Email, employment, education, certifications, references and background checks roll into a single Trust Score. |
| 📊 **Real-Time Analytics** | Every hire, measured | Funnel, time-to-hire, cost-per-hire, source ROI, quality of hire, diversity and SLA compliance — live. |

### "How it works" (candidate flow)

1. **Create Account** — sign up in seconds
2. **Build Your Profile** — structured, CV-less, AI-enhanced
3. **Get Matched** — tailored job recommendations delivered to you
4. **Get Hired** — apply, interview and track everything in one place

### "How it works" (recruiter flow)

1. **Post a role** — AI drafts the JD, title, requirements and salary range
2. **Screen automatically** — AI screening interviews and 12-dimension scoring rank the pipeline
3. **Interview together** — scheduling, video, scorecards and calibration in one workspace
4. **Decide with data** — aggregated feedback, voting, predictive outcomes and full audit trail

### Proof-point stat strip
- **1,400+** API endpoints
- **36** feature modules
- **30+** third-party integrations
- **12** AI scoring dimensions
- **10** built-in assessment formats
- **7** supported languages
- **5** user roles, one platform

### Segment sections to build
1. **For Candidates** — CV-less profiles, AI career coach, verified credentials, achievements, salary insights
2. **For Recruiters** — AI content, screening, Kanban ATS, scorecards, 25+ recruiter hubs
3. **For Hiring Teams** — panels, workload balancing, blind evaluation, calibration, voting
4. **For Executives** — executive dashboards, benchmarks, forecasting, goal tracking, BI export
5. **For Staffing Agencies & Clients (B2B)** — requirements marketplace, candidate supply, contracts, invoicing
6. **For IT & Security** — SSO, 2FA, RBAC/ABAC, encryption, residency, SOC 2, GDPR/CCPA
7. **For Developers** — REST API, API keys, webhooks, OpenAPI docs, developer portal

### Trust & compliance badge row
`GDPR` · `CCPA` · `EEOC / OFCCP` · `SOC 2 Readiness` · `AES-256 at rest` · `TLS 1.3 in transit` · `Full audit trail` · `Bias auditing`

### Closing CTA

> ## Ready to start your journey?
> Join the organizations replacing resume triage with intelligent, verified, measurable hiring.
> `[ Get Started Free ]`  `[ Talk to Sales ]`

---

## Implementation Status Notes

*For internal accuracy when writing marketing copy — verify these before making public claims.*

- The **Data Protection** route module (`/api/data-protection`) is present in the codebase but currently **commented out** of the API entry point pending controller completion. All other 56 route modules are mounted and active.
- Several advanced AI modules are implemented as complete API + data-model surfaces with deterministic/heuristic scoring logic; live LLM provider wiring is handled through the pluggable AI service layer (OpenAI / Anthropic) and depends on configured credentials.
- The `frontend/src/services/mockData.ts` module supplies demo data for parts of the UI; confirm which surfaces are live before using them in screenshots.
- The repository `README.md` documents only the original core ATS scope and is significantly out of date relative to the current platform — this document supersedes it for feature claims.
- Public-facing performance and outcome claims (e.g. "50% faster hiring") currently originate from placeholder testimonial copy on the home page and are **not** backed by measured platform data. Replace with real customer data before publishing.

---

*Document generated from a full review of the `KreupAI.ManithPro` repository — backend routes and controllers, Prisma schema, frontend pages/components/services, mobile application, infrastructure and CI configuration.*

**© KreupAI Technologies · MIT Licensed**
