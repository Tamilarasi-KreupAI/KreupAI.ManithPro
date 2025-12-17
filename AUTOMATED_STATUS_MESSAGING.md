# Automated Status Update Messaging System

## Overview
The Automated Status Update Messaging System sends automatic messages to candidates whenever a recruiter changes their application status. This ensures candidates are immediately informed about their application progress through the in-app messaging system, in addition to email notifications.

## How It Works

### Automatic Message Flow

```
Recruiter Updates Status → System Sends Email → System Creates Message → Candidate Notified
```

1. **Recruiter Action**: Recruiter updates application status (e.g., to "Shortlisted")
2. **Email Sent**: Candidate receives professional email notification
3. **Message Created**: Automated message appears in candidate's Messages inbox
4. **Notification**: Candidate gets in-app notification about new message
5. **Special Badge**: Message displays with "Status Update" badge to indicate it's automated

### Status-Specific Messages

The system sends different messages based on the application status:

#### 1. **UNDER_REVIEW**
```
Great news! Your application for the [Job Title] position has been reviewed 
and is now under consideration. Our team is carefully evaluating your 
qualifications. We'll keep you updated on the next steps.
```

#### 2. **SHORTLISTED** ⭐
```
Congratulations! 🎉 You've been shortlisted for the [Job Title] position. 
Your profile stood out among many applicants. We'll be reaching out soon 
to schedule the next steps in our interview process. Please keep an eye 
on your email and phone.
```

#### 3. **INTERVIEWED**
```
Thank you for taking the time to interview for the [Job Title] position. 
We appreciate your interest in joining our team. We're currently reviewing 
all candidates and will get back to you with our decision soon.
```

#### 4. **OFFERED** 🎊
```
Congratulations! 🎊 We're thrilled to extend an offer for the [Job Title] 
position. You'll receive a formal offer letter via email shortly with all 
the details including compensation, benefits, and start date. We're excited 
about the possibility of you joining our team!
```

#### 5. **REJECTED**
```
Thank you for your interest in the [Job Title] position and for taking the 
time to apply. After careful consideration, we've decided to move forward 
with other candidates whose experience more closely matches our current needs. 
We appreciate your interest and encourage you to apply for future opportunities 
with us. We wish you all the best in your job search.
```

#### 6. **WITHDRAWN**
```
We've confirmed that your application for the [Job Title] position has been 
withdrawn as per your request. Thank you for considering our opportunity, 
and we hope to see you apply for other positions in the future.
```

## Technical Implementation

### Backend Components

#### 1. Application Controller Update
**File**: `backend/src/controllers/application.controller.ts`

**Key Changes**:
```typescript
// When status is updated
const updatedApplication = await prisma.application.update({
  where: { id },
  data: { status, notes },
  include: {
    job: {
      select: {
        title: true,
        postedBy: { select: { id: true, firstName: true, lastName: true } }
      }
    },
    candidate: {
      select: { id: true, firstName: true, lastName: true, email: true }
    }
  }
});

// Send email notification
await sendApplicationStatusEmail(...);

// Create automated message
await prisma.message.create({
  data: {
    content: statusMessages[status],
    senderId: updatedApplication.job.postedBy.id,
    receiverId: updatedApplication.candidate.id,
    applicationId: id,
  }
});

// Create in-app notification
await prisma.notification.create({
  data: {
    type: 'APPLICATION_STATUS_UPDATE',
    title: `Application Status Updated: ${status}`,
    message: `Your application for ${job.title} has been updated`,
    link: `/applications`,
    userId: candidate.id,
  }
});
```

**Features**:
- ✅ Sends status-specific messages
- ✅ Includes recruiter's optional notes
- ✅ Links message to application for context
- ✅ Creates notification for immediate alert
- ✅ Fault-tolerant (status update succeeds even if message fails)

#### 2. Recruiter Notes Integration
If the recruiter adds notes when updating status:

```typescript
const fullMessage = notes 
  ? `${statusMessage}\n\nRecruiter's Note: ${notes}`
  : statusMessage;
```

**Example**:
```
Congratulations! 🎉 You've been shortlisted for the Senior Developer position...

Recruiter's Note: Your React and Node.js experience really stood out. 
We'd like to schedule a technical interview next week. Please check your 
email for available time slots.
```

### Frontend Components

#### 1. MessageBubble Component
**File**: `frontend/src/components/MessageBubble.tsx`

**Automated Message Detection**:
```typescript
const isAutomatedMessage = applicationId && (
  content.includes('Congratulations') || 
  content.includes('shortlisted') || 
  content.includes('under consideration') ||
  content.includes('status has been updated') ||
  content.includes('offer letter') ||
  content.includes('Thank you for your interest')
);
```

**Visual Indicators**:
- **Purple Badge**: "Status Update" badge with lightning icon
- **Special Styling**: Gradient purple background for automated messages
- **Dark Mode Support**: Proper colors in both light and dark themes

#### 2. Messages Page
**File**: `frontend/src/pages/Messages.tsx`

**Updates**:
- Passes `applicationId` to MessageBubble component
- Full dark mode support added
- Displays automated messages with special styling

## User Experience

### Candidate View

#### Message List
```
┌─────────────────────────────────────────┐
│ Messages                                 │
├─────────────────────────────────────────┤
│ [!] John Recruiter                    2 │ ← Unread badge
│     Congratulations! You've been...     │
│                                         │
│     Sarah Manager                       │
│     Thank you for the interview...      │
└─────────────────────────────────────────┘
```

#### Message Thread
```
┌─────────────────────────────────────────┐
│ John Recruiter (john@company.com)       │
├─────────────────────────────────────────┤
│                                         │
│  John Recruiter [⚡ Status Update]      │ ← Special badge
│  ┌─────────────────────────────────┐   │
│  │ Congratulations! 🎉 You've been │   │ ← Purple gradient
│  │ shortlisted for the Senior      │   │   background
│  │ Developer position. Your profile│   │
│  │ stood out...                    │   │
│  │                                 │   │
│  │ Recruiter's Note: Your React    │   │ ← Optional notes
│  │ experience is impressive.       │   │
│  └─────────────────────────────────┘   │
│  2:45 PM                                │
│                                         │
└─────────────────────────────────────────┘
```

### Recruiter View
When recruiters update application status:

1. **Status Update Form**:
   ```
   ┌─────────────────────────────────────┐
   │ Update Application Status           │
   ├─────────────────────────────────────┤
   │ Status: [Shortlisted ▼]             │
   │                                     │
   │ Notes (Optional):                   │
   │ ┌─────────────────────────────────┐ │
   │ │ Your React experience stood out │ │
   │ │ among all applicants...         │ │
   │ └─────────────────────────────────┘ │
   │                                     │
   │ [Cancel]  [Update Status]           │
   └─────────────────────────────────────┘
   ```

2. **Automatic Actions**:
   - ✅ Email sent to candidate
   - ✅ Message created in their inbox (appears in recruiter's sent messages)
   - ✅ Notification sent
   - ✅ Status badge updated

## Database Schema

### Message Model
```prisma
model Message {
  id            String   @id @default(cuid())
  content       String
  status        MessageStatus @default(SENT)
  attachments   String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  senderId      String
  sender        User     @relation("SentMessages", fields: [senderId], references: [id])
  
  receiverId    String
  receiver      User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  
  applicationId String?  // Links message to application
  application   Application? @relation(fields: [applicationId], references: [id])
}
```

**Key Field**: `applicationId` - Links automated messages to their application context

## Benefits

### For Candidates
✅ **Immediate Updates**: Get notified instantly about status changes  
✅ **Persistent Record**: Messages stored in inbox for future reference  
✅ **Context Preservation**: Messages linked to specific applications  
✅ **Direct Communication**: Can reply to recruiter if they have questions  
✅ **Professional Format**: Clear, encouraging messages for all statuses  
✅ **Personalized Notes**: Receive additional context from recruiters

### For Recruiters
✅ **Automated Communication**: No manual messaging required  
✅ **Consistent Messaging**: Professional, standardized messages  
✅ **Optional Personalization**: Add custom notes for specific context  
✅ **Communication Trail**: All messages logged and traceable  
✅ **Reduced Workload**: System handles routine status updates  
✅ **Better Engagement**: Candidates stay informed and engaged

### For Platform
✅ **Enhanced User Experience**: Professional, timely communication  
✅ **Increased Engagement**: Messages keep users active on platform  
✅ **Transparency**: Clear audit trail of all communications  
✅ **Reduced Support**: Automated updates reduce "status check" inquiries  
✅ **Competitive Advantage**: Professional communication feature

## Message Characteristics

### Automated Messages
- **Sender**: Recruiter who owns the job posting
- **Recipient**: Candidate who applied
- **Type**: Automated (detected by keywords and applicationId)
- **Badge**: Purple "Status Update" badge with lightning icon
- **Style**: Purple gradient background (differentiates from regular messages)
- **Editable**: No (automated, not editable by recruiter)
- **Deletable**: No (system-generated, preserved for records)

### Regular Messages
- **Sender**: Any user (candidate or recruiter)
- **Recipient**: Any user
- **Type**: Manual
- **Badge**: None (or sender name only)
- **Style**: Blue gradient (own messages) or white/gray (received)
- **Editable**: No
- **Deletable**: Yes (own messages only)

## Error Handling

### Graceful Degradation
```typescript
try {
  // Create automated message
  await prisma.message.create({ ... });
  await prisma.notification.create({ ... });
} catch (messageError) {
  console.error('Failed to send automated message:', messageError);
  // Don't fail the status update if message sending fails
}
```

**Behavior**:
- Status update always succeeds
- Email sending is independent
- Message creation failure is logged but doesn't block
- System continues functioning even if messaging fails

## Testing Scenarios

### Test Case 1: Status Update to Shortlisted
1. Recruiter updates application status to "SHORTLISTED"
2. Verify email sent to candidate
3. Verify automated message created in Messages
4. Verify "Status Update" badge appears
5. Verify purple gradient styling
6. Verify notification created
7. Verify message links to application

### Test Case 2: Status Update with Notes
1. Recruiter updates status with additional notes
2. Verify automated message includes both template and notes
3. Verify proper formatting with "Recruiter's Note:" separator
4. Verify message appears correctly in UI

### Test Case 3: Multiple Status Changes
1. Update status to UNDER_REVIEW
2. Verify first automated message
3. Update status to SHORTLISTED
4. Verify second automated message
5. Verify both messages appear in chronological order
6. Verify each has proper status-specific content

### Test Case 4: Dark Mode Display
1. Enable dark mode
2. View automated messages
3. Verify purple gradient adjusts for dark theme
4. Verify badge colors are readable
5. Verify text contrast is sufficient

## Future Enhancements

### Potential Improvements
1. **Interview Scheduling**: Include calendar links in interview messages
2. **Document Attachments**: Auto-attach offer letters or interview guides
3. **Response Templates**: Quick reply options for candidates
4. **Message Threading**: Group related status updates together
5. **Read Receipts**: Track when candidates read important messages
6. **Reminder Messages**: Follow-up if candidate doesn't respond
7. **Multi-language**: Send messages in candidate's preferred language
8. **Rich Media**: Include company videos or virtual tour links
9. **Action Buttons**: Quick actions like "Accept Interview" or "View Offer"
10. **Status Timeline**: Visual timeline of all status changes in message

## Integration Points

### Email Notifications
- Automated messages complement email notifications
- Email provides external notification
- In-app message provides persistent record
- Both contain same core information

### Notifications System
- Creates in-app notification for immediate alert
- Notification links to Messages page
- Unread count updates in real-time
- Notification dismissed when message read

### Application Dashboard
- Messages linked to specific applications
- "View Messages" button on application details
- Message count badge on application card
- Direct navigation from application to messages

## Configuration

### Environment Variables
No additional configuration required. Uses existing:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Customization
To customize automated messages, edit status templates in:
`backend/src/controllers/application.controller.ts`

```typescript
const statusMessages: Record<string, string> = {
  SHORTLISTED: `Your custom message here...`,
  // Add more customizations
};
```

## Monitoring and Analytics

### Metrics to Track
- **Messages Sent**: Count of automated messages per status type
- **Response Rate**: How many candidates reply to automated messages
- **Read Rate**: Percentage of automated messages read by candidates
- **Time to Read**: Average time between message sent and read
- **Engagement**: Candidate actions after receiving messages

### Logging
```
Automated message sent: SHORTLISTED for candidate [ID] on application [ID]
Automated message failed: [Error] for application [ID]
```

## Security and Privacy

### Data Protection
- ✅ Messages only sent between authorized parties (recruiter and candidate)
- ✅ ApplicationId verified before message creation
- ✅ Only job owner can trigger automated messages
- ✅ Messages stored securely in database
- ✅ No sensitive data exposed in automated messages

### Access Control
- Candidates can view messages from recruiters for their applications
- Recruiters can view messages for applications on their job postings
- Messages linked to applications enforce proper access control
- Admins have full access for support purposes

## Troubleshooting

### Common Issues

**Issue**: Automated messages not appearing
- Check recruiter has permission to update application
- Verify applicationId is being passed correctly
- Check database for message creation errors
- Verify message creation isn't being blocked by permissions

**Issue**: Wrong message template used
- Verify status value matches template keys exactly
- Check for typos in status values (SHORTLISTED vs SHORTLIST)
- Review logs for template selection

**Issue**: Messages don't show badge
- Verify applicationId is present in message
- Check keyword detection logic in MessageBubble
- Ensure message content includes expected keywords

## Conclusion

The Automated Status Update Messaging System provides seamless, professional communication between recruiters and candidates throughout the application lifecycle. By automatically sending contextual messages when status changes, the system keeps candidates informed, engaged, and satisfied with their experience on the platform.

**Key Achievements**:
- ✅ Automated, professional status update messages
- ✅ Status-specific templates for all application states
- ✅ Special UI treatment for automated messages
- ✅ Integration with email notifications
- ✅ Fault-tolerant implementation
- ✅ Full dark mode support
- ✅ Comprehensive error handling

The system improves communication transparency, reduces recruiter workload, and enhances the overall candidate experience.
