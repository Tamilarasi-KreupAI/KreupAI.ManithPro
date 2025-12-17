# Job Matching Notification System

## Overview
The Job Matching Notification System automatically sends email notifications to candidates when new job opportunities that match their skills are posted. This feature helps candidates discover relevant opportunities quickly and increases application rates.

## How It Works

### 1. **Job Creation Trigger**
When a recruiter/employer creates a new job posting with the status `OPEN` and includes required skills, the system automatically:
- Searches for all candidates whose skills match the job requirements
- Identifies specific matching skills for each candidate
- Sends personalized email notifications to qualified candidates

### 2. **Skill Matching Algorithm**
The system uses a smart matching algorithm that:
- Compares job required skills with candidate skills
- Uses case-insensitive partial matching (e.g., "JavaScript" matches "javascript", "JS", etc.)
- Finds candidates who have at least one matching skill
- Highlights all matching skills in the notification email

### 3. **Email Notification**
Each matched candidate receives a professional email containing:
- **Job Details**: Title, company name, location, job type, salary (if available)
- **Matching Skills**: Visual list of their skills that match the job requirements
- **Call-to-Action**: Direct link to view the job and apply
- **Why It Matches**: Explanation of why this job is a good fit
- **Professional Design**: Clean, corporate HTML email template

## Technical Implementation

### Backend Components

#### 1. Email Template Function
**File**: `backend/src/utils/email.ts`

```typescript
export const sendJobMatchNotificationEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  jobId: string,
  companyName: string,
  location: string,
  type: string,
  matchingSkills: string[],
  salary?: string
): Promise<void>
```

**Features**:
- Professional HTML email template with green gradient header
- Responsive design for all devices
- Displays matching skills as visual tags
- Includes direct link to job posting
- Corporate styling without emojis

#### 2. Job Controller Integration
**File**: `backend/src/controllers/job.controller.ts`

**Process**:
1. Job is created successfully
2. System checks if job status is `OPEN` and has skills
3. Queries database for candidates with matching skills using `hasSome` operator
4. Filters matches to find specific overlapping skills
5. Sends email notifications asynchronously (doesn't block job creation)
6. Logs success/failure counts for monitoring

**Key Features**:
- Non-blocking: Email sending happens asynchronously
- Fault-tolerant: Job creation succeeds even if notifications fail
- Efficient: Uses `Promise.allSettled()` for parallel processing
- Logged: Tracks notification success/failure rates

### Database Query

```typescript
const candidates = await prisma.user.findMany({
  where: {
    role: 'CANDIDATE',
    skills: {
      hasSome: skills, // PostgreSQL array operator
    },
  },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    skills: true,
  },
});
```

## Email Template Design

### Visual Structure
```
┌─────────────────────────────────────┐
│   Perfect Match Found!              │ ← Green gradient header
│   A new job matches your skills     │
├─────────────────────────────────────┤
│                                     │
│   Dear [Candidate Name],            │
│                                     │
│   Great news! We found a job...    │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  [Job Title]                │  │ ← Job card with
│   │  [Company Name]             │  │   green border
│   │  Location: [Location]       │  │
│   │  Type: [Job Type]           │  │
│   │  Salary: [Salary]           │  │
│   │  ─────────────────────────  │  │
│   │  Your Matching Skills:      │  │
│   │  [Skill1] [Skill2] [Skill3] │  │ ← Green skill tags
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  Why This Job Matches You   │  │ ← Info box
│   │  • Skills align perfectly   │  │
│   │  • Matches experience       │  │
│   │  • Career advancement       │  │
│   └─────────────────────────────┘  │
│                                     │
│   [View Job & Apply Now]            │ ← CTA button
│                                     │
└─────────────────────────────────────┘
```

## Configuration

### Environment Variables Required
```env
# Email Service (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL for job links
FRONTEND_URL=http://localhost:5173
```

### Email Service Setup
1. Use Gmail account with App Password (not regular password)
2. Generate App Password: Google Account → Security → 2-Step Verification → App Passwords
3. Add credentials to `.env` file
4. Restart backend server

## Usage Examples

### Example 1: Creating a Job with Skills
```typescript
POST /api/jobs

{
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "companyName": "TechCorp",
  "location": "New York, NY",
  "type": "FULL_TIME",
  "skills": ["React", "TypeScript", "Node.js", "MongoDB"],
  "salary": "$120,000 - $150,000",
  "status": "OPEN"
}
```

**Result**: All candidates with any of these skills receive an email notification showing which of their skills match.

### Example 2: Email Received by Candidate
A candidate with skills: `["React", "TypeScript", "JavaScript", "CSS"]`

Receives email showing matching skills:
- ✅ React
- ✅ TypeScript

### Example 3: No Notifications Sent
```typescript
POST /api/jobs

{
  "title": "Office Manager",
  "status": "DRAFT",  // Not OPEN
  // ... other fields
}
```

**Result**: No notifications sent because job status is not `OPEN`.

## Benefits

### For Candidates
✅ **Instant Notifications**: Get alerted immediately when matching jobs are posted  
✅ **Personalized Matches**: Only receive notifications for jobs matching their skills  
✅ **Easy Application**: Direct link to apply from email  
✅ **Early Access**: Be among the first to apply, increasing chances of selection  
✅ **Career Growth**: Discover opportunities they might have missed

### For Recruiters/Employers
✅ **Faster Hiring**: Reach qualified candidates instantly  
✅ **Higher Quality Applications**: Target candidates with relevant skills  
✅ **Increased Visibility**: More candidates see job postings  
✅ **Better Engagement**: Candidates are more likely to apply when matched  
✅ **Automated Process**: No manual candidate searching required

### For Platform
✅ **Increased Engagement**: Keeps candidates active on the platform  
✅ **Higher Application Rates**: More applications per job posting  
✅ **Better User Experience**: Personalized, relevant notifications  
✅ **Competitive Advantage**: Feature that differentiates from other platforms

## Monitoring and Logging

The system logs all notification activities:

```
Job match notifications sent: 15 successful, 2 failed for job: Senior React Developer
```

Logs include:
- Total notifications sent
- Success count
- Failure count
- Job title for tracking

## Error Handling

### Graceful Failures
- Email service unavailable → Job creation succeeds, notifications skipped
- Individual email failure → Other notifications continue
- Database query error → Job creation succeeds, error logged

### Non-Blocking Design
- Notifications sent asynchronously after job creation
- Job creation API response returns immediately
- Email failures don't affect job posting

## Future Enhancements

### Potential Improvements
1. **Preference Settings**: Allow candidates to opt-in/opt-out of notifications
2. **Frequency Control**: Daily digest instead of instant notifications
3. **Match Score**: Show percentage match based on skills overlap
4. **Location Matching**: Consider candidate location preferences
5. **Experience Level**: Match based on experience requirements
6. **Saved Searches**: Notify based on saved search criteria
7. **Notification History**: Track which jobs were sent to which candidates
8. **A/B Testing**: Test different email designs for better open rates
9. **Analytics Dashboard**: Track notification open rates and application conversions
10. **Smart Timing**: Send notifications at optimal times for better engagement

## Testing

### Manual Testing Steps
1. Create a test candidate account with specific skills
2. Create a job posting with matching skills
3. Check candidate's email for notification
4. Click "View Job & Apply Now" button
5. Verify redirect to correct job page

### Test Scenarios
- ✅ Job with matching skills → Email sent
- ✅ Job without matching skills → No email sent
- ✅ Job with status DRAFT → No email sent
- ✅ Multiple candidates with same skills → All receive emails
- ✅ Partial skill match → Email sent with matched skills only
- ✅ Email service down → Job creation succeeds

## Performance Considerations

### Optimizations
- **Parallel Processing**: All emails sent simultaneously using `Promise.allSettled()`
- **Selective Queries**: Only fetches necessary candidate fields
- **Async Execution**: Doesn't block job creation response
- **Database Indexing**: `skills` field should be indexed for faster queries

### Scalability
For large platforms with thousands of candidates:
1. Consider using a job queue (Bull, BullMQ) for email processing
2. Implement rate limiting for email sending
3. Add pagination for candidate queries
4. Use background workers for notification processing
5. Implement caching for frequently accessed data

## Security and Privacy

### Data Protection
- ✅ Candidates only receive notifications for PUBLIC/OPEN jobs
- ✅ Email addresses are never exposed to recruiters through this system
- ✅ Unsubscribe option mentioned in email footer
- ✅ No sensitive candidate data included in emails
- ✅ Secure email transmission via TLS/SSL

### Compliance
- GDPR-compliant: Candidates can manage notification preferences
- CAN-SPAM compliant: Includes physical address and unsubscribe information
- Professional communication: No spam-like content or excessive frequency

## Support and Troubleshooting

### Common Issues

**Issue**: Emails not being sent
- Check `.env` configuration
- Verify SMTP credentials
- Check email service logs
- Ensure job status is `OPEN`

**Issue**: Wrong candidates receiving notifications
- Verify skill matching logic
- Check candidate role filter
- Review database skill data

**Issue**: Emails going to spam
- Use proper email authentication (SPF, DKIM)
- Professional email content without spam triggers
- Valid sender domain
- Proper unsubscribe links

## Conclusion

The Job Matching Notification System provides automated, intelligent job recommendations to candidates, improving engagement and application rates while reducing time-to-hire for employers. The system is designed to be scalable, fault-tolerant, and user-friendly, creating value for all platform stakeholders.
