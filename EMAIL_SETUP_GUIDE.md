# Email Service Setup Guide

## 🚨 Quick Fix for "Email service not configured" Error

**Problem:** Emails are being skipped because `SMTP_PASS` is empty in your `.env` file.

**Solution in 3 Steps:**
1. Go to https://myaccount.google.com/apppasswords
2. Sign in with **helloworld.use45@gmail.com**
3. Generate an App Password and paste it in `backend/.env` line 58:
   ```env
   SMTP_PASS="your-app-password-without-spaces"
   ```
4. Restart backend server

---

## Gmail SMTP Configuration

The email service is configured to use Gmail SMTP with **helloworld.use45@gmail.com**. Currently emails are being skipped because `SMTP_PASS` is empty.

### 🚨 Current Issue:
```
Email service not configured. Skipping email to: rupsadas.it.aec@gmail.com
```

This happens because `SMTP_PASS=""` is empty in your `.env` file. You need to generate a Gmail App Password.

### Step-by-Step Setup:

#### 1. Enable 2-Factor Authentication (REQUIRED)
- Go to [Google Account Security](https://myaccount.google.com/security)
- Sign in with: **helloworld.use45@gmail.com**
- Click on "2-Step Verification"
- Follow the steps to enable it (Gmail requires this for App Passwords)

#### 2. Generate App Password
- Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
- Sign in with: **helloworld.use45@gmail.com**
- If you don't see this option, make sure 2FA is enabled first
- Select "Mail" as the app
- Select "Other (Custom name)" as the device
- Enter: "KreupAI ManithPro Backend"
- Click "Generate"
- **Copy the 16-character password** (format: `abcd efgh ijkl mnop`)
- ⚠️ You won't be able to see it again!

#### 3. Update .env File
Open `backend/.env` (line 58) and paste your App Password:

```env
SMTP_PASS="abcdefghijklmnop"
```

**Important:** Remove spaces when pasting!
- Gmail shows: `abcd efgh ijkl mnop` (with spaces)
- You enter: `abcdefghijklmnop` (no spaces)

**Example:**
```env
SMTP_USER="helloworld.use45@gmail.com"
SMTP_PASS="xyzabcdefghijklm"
EMAIL_FROM="KreupAI ManithPro <helloworld.use45@gmail.com>"
```

#### 4. Restart Backend Server
After updating the .env file, restart your backend server:

```bash
cd backend
npm run dev
```

### What Emails Will Be Sent?

The system will automatically send emails in these scenarios:

#### 1. **Application Submission Confirmation** 📧
   - **Trigger:** When a candidate applies for a job
   - **Sent to:** Candidate's email
   - **From:** helloworld.use45@gmail.com
   - **Contains:** 
     - Job title
     - Confirmation that application was received
     - Message that it's being reviewed

#### 2. **Application Status Updates** 📬
   - **Trigger:** When recruiter changes the application status
   - **Sent to:** Candidate's email
   - **From:** helloworld.use45@gmail.com
   - **Status changes that trigger emails:**
     - ✅ PENDING → Any status
     - 🔍 UNDER_REVIEW → Any status
     - ⭐ SHORTLISTED → Candidate gets notified
     - 🎯 INTERVIEWED → Candidate gets notified
     - 🎉 OFFERED → Candidate gets notified
     - ❌ REJECTED → Candidate gets notified (professional message)
     - 🚫 WITHDRAWN → Candidate gets notified
   - **Contains:**
     - Job title
     - New status
     - Professional message based on status

### Testing the Email Service

#### Test 1: Application Submission
1. Login as a candidate
2. Apply for any open job
3. Check backend console - you should see:
   ```
   Email sent successfully to: candidate@email.com
   ```
4. Check candidate's Gmail inbox for confirmation email

#### Test 2: Status Change by Recruiter
1. Login as a recruiter
2. Go to Applications page
3. Change any application status (e.g., PENDING → SHORTLISTED)
4. Check backend console - you should see:
   ```
   Email sent successfully to: candidate@email.com
   ```
5. Candidate receives email: "Your application for [Job Title] has been updated. New Status: Shortlisted"

#### Expected Console Output (Success):
```
Email sent successfully to: candidate@example.com
```

#### Expected Console Output (If SMTP_PASS is empty):
```
Email service not configured. Skipping email to: candidate@example.com
```
👆 This means you need to add the App Password!

### Troubleshooting

#### Error: "Invalid login credentials"
- Make sure you're using the App Password, not your regular Gmail password
- App passwords don't have spaces when you enter them in the .env file
- Example: `abcdefghijklmnop` (no spaces)

#### Error: "Less secure app access"
- Gmail no longer supports "less secure apps"
- You MUST use App Passwords (requires 2FA enabled)

#### Email not received?
- Check spam/junk folder
- Check backend console for "Email sent successfully" message
- Verify SMTP_USER is correct: rupsadas.it.aec@gmail.com

### Alternative: Using Other Email Services

If you want to use a different email service:

#### **Outlook/Hotmail**
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

#### **SendGrid** (Recommended for production)
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

#### **Mailtrap** (For testing only)
```env
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"
```

## 📊 Email Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL NOTIFICATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1️⃣ CANDIDATE APPLIES FOR JOB:
   Candidate → [Apply Button] → Backend API
                                     ↓
                            Create Application
                                     ↓
                            ┌────────────────┐
                            │ Send Email     │
                            │ From: helloworld.use45@gmail.com │
                            │ To: candidate@email.com          │
                            │ Subject: "Application Submitted: [Job Title]" │
                            └────────────────┘
                                     ↓
                            Candidate's Inbox 📧

2️⃣ RECRUITER CHANGES STATUS:
   Recruiter → [Status Dropdown] → Select new status (e.g., SHORTLISTED)
                                           ↓
                                  Update Application Status
                                           ↓
                                  ┌────────────────┐
                                  │ Send Email     │
                                  │ From: helloworld.use45@gmail.com │
                                  │ To: candidate@email.com          │
                                  │ Subject: "Application Status Update: [Job Title]" │
                                  │ Body: "Your status changed to: SHORTLISTED" │
                                  └────────────────┘
                                           ↓
                                  Candidate's Inbox 📬

STATUS CHANGES THAT SEND EMAILS:
✅ PENDING → UNDER_REVIEW → Candidate notified
✅ UNDER_REVIEW → SHORTLISTED → Candidate notified
✅ SHORTLISTED → INTERVIEWED → Candidate notified
✅ INTERVIEWED → OFFERED → Candidate notified 🎉
✅ Any status → REJECTED → Candidate notified (politely)
✅ Any status → WITHDRAWN → Candidate notified
```

### Security Notes

⚠️ **Important Security Practices:**

1. **Never commit .env file to Git** - It's already in .gitignore
2. **Use App Passwords** - Never use your actual Gmail password
3. **Rotate passwords regularly** - Change App Password every few months
4. **For production** - Use professional email services like SendGrid, AWS SES, or Mailgun

### Email Templates Customization

Email templates are in: `backend/src/utils/email.ts`

You can customize:
- Email subject lines
- HTML templates
- Sender name
- Email content

Example customization:
```typescript
export const sendApplicationSubmittedEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string
): Promise<void> => {
  const subject = `✅ Application Received: ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Application Submitted Successfully! 🎉</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for applying for the position of <strong>${jobTitle}</strong>.</p>
      <!-- Add more custom content here -->
    </div>
  `;

  await sendEmail({ to: candidateEmail, subject, html });
};
```

---

**Need Help?** 
Check the backend console logs for detailed error messages when testing email functionality.
