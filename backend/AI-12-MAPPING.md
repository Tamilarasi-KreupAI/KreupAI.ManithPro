# AI-12 Scoring Input Mapping

## Purpose

AI-12 computes the five advanced candidate scores from stored candidate and job records.

All scores are deterministic and use scoring version `2.0`.

## 1. Culture Fit

### Approved stored inputs

Candidate:
- CandidateProfile.preferredLocation
- CandidateProfile.willingToRelocate
- CandidateProfile.remotePreference
- CandidateProfile.jobTypes
- CandidateProfile.industries
- CandidateSkill.name
- WorkExperience.industry

Job/company:
- Job.location
- Job.type
- Job.skills
- Job.experience
- Job.education
- Job.companyIndustry
- Job.companySize

### Calculation

- Skill match: 30%
- Industry match: 20%
- Location match: 20%
- Job type match: 10%
- Experience match: 20%

Final score is the weighted sum of these components.

## 2. Growth Potential

### Approved stored inputs

- WorkExperience
- Education
- CandidateSkill
- Project
- Achievement

### Calculation

- Experience: 25%
- Education: 15%
- Skills: 25%
- Projects: 20%
- Achievements: 15%

At least two approved input groups must be available.
Otherwise the result is `INCOMPLETE`.

## 3. Technical Depth

### Approved stored inputs

- CandidateSkill
- WorkExperience
- Project
- Certification

### Calculation

- Skill depth: 35%
- Experience depth: 25%
- Project depth: 25%
- Certification evidence: 15%

At least two approved input groups must be available.
Otherwise the result is `INCOMPLETE`.

## 4. Communication

### Approved stored inputs

- User.bio
- CandidateProfile.headline
- CandidateProfile.summary
- WorkExperience descriptions, responsibilities and achievements
- Project descriptions and contributions
- Application.coverLetter
- Interview.feedback
- Interview.notes
- Message.content

### Calculation

Communication text quality is calculated from the available stored text groups.

At least two communication-input groups must contain usable data.
Otherwise the result is `INCOMPLETE`.

## 5. Reliability

### Approved stored inputs

- Application history
- Interview attendance/history
- Candidate engagement/message records

### Calculation

The score uses available stored activity signals including:
- Application completion
- Interview attendance
- Response/engagement activity

At least two reliability-input groups must be available.
Otherwise the result is `INCOMPLETE`.

## Missing Data

Missing required input data never produces a fabricated numeric score.

The affected dimension returns:

- `status: INCOMPLETE`
- `score: null`
- a reason describing the missing/insufficient input

## Persistence

Complete AI-12 scores are persisted using the AI-11 scoring storage functions:

- `saveCultureFitScore`
- `saveGrowthPotentialScore`
- `saveTechnicalDepthScore`
- `saveCommunicationScore`
- `saveReliabilityScore`

The dashboard reads the persisted values through the AI-11 storage layer.

## Reproducibility

The same stored candidate/job inputs produce the same score under scoring version `2.0`.

## Test Coverage

The AI-12 test suite verifies:

- Culture Fit computation
- Growth Potential computation
- Technical Depth computation
- Communication computation
- Reliability computation
- Missing Culture Fit job data
- Missing Growth Potential inputs
- Missing Technical Depth inputs
- Missing Communication inputs
- Missing Reliability activity
- Reproducibility for unchanged candidate data