/**
 * Email Templates
 *
 * Pre-built HTML email templates for common use cases
 * Uses Handlebars-style placeholders for dynamic content
 */

export interface TemplateVariables {
  [key: string]: string | number | boolean | undefined;
}

// Base layout wrapper
const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ManithPro</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 32px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #eee;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
    }
    .content {
      padding: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .button-secondary {
      background-color: #6b7280;
    }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #eee;
      margin-top: 24px;
      font-size: 12px;
      color: #6b7280;
    }
    .highlight {
      background-color: #f0f9ff;
      border-left: 4px solid #2563eb;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 4px 4px 0;
    }
    .info-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
      margin: 16px 0;
    }
    h1, h2, h3 {
      color: #1f2937;
      margin-top: 0;
    }
    .text-muted {
      color: #6b7280;
    }
    .text-success {
      color: #059669;
    }
    .text-warning {
      color: #d97706;
    }
    .text-danger {
      color: #dc2626;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">ManithPro</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; {{year}} ManithPro. All rights reserved.</p>
        <p>This email was sent to {{recipientEmail}}</p>
        <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Email Preferences</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Template definitions
export const EmailTemplates = {
  // Application submitted confirmation
  applicationSubmitted: {
    subject: 'Application Received - {{jobTitle}} at {{companyName}}',
    html: baseLayout(`
      <h2>Application Submitted Successfully!</h2>
      <p>Hi {{candidateName}},</p>
      <p>Thank you for applying to the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>

      <div class="info-box">
        <p><strong>Application ID:</strong> {{applicationId}}</p>
        <p><strong>Position:</strong> {{jobTitle}}</p>
        <p><strong>Department:</strong> {{department}}</p>
        <p><strong>Location:</strong> {{location}}</p>
        <p><strong>Submitted:</strong> {{submittedDate}}</p>
      </div>

      <p>Our team will review your application and get back to you within {{responseTime}}.</p>

      <p style="text-align: center;">
        <a href="{{applicationUrl}}" class="button">View Application Status</a>
      </p>

      <p class="text-muted">If you have any questions, please don't hesitate to reach out to our recruiting team.</p>
    `),
    text: `
Application Submitted Successfully!

Hi {{candidateName}},

Thank you for applying to the {{jobTitle}} position at {{companyName}}.

Application ID: {{applicationId}}
Position: {{jobTitle}}
Department: {{department}}
Location: {{location}}
Submitted: {{submittedDate}}

Our team will review your application and get back to you within {{responseTime}}.

View your application status: {{applicationUrl}}

If you have any questions, please don't hesitate to reach out to our recruiting team.
    `,
  },

  // Application status update
  applicationStatusUpdate: {
    subject: 'Application Update - {{jobTitle}} at {{companyName}}',
    html: baseLayout(`
      <h2>Application Status Update</h2>
      <p>Hi {{candidateName}},</p>
      <p>There's been an update to your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>

      <div class="highlight">
        <p style="margin: 0;"><strong>New Status:</strong> <span class="{{statusClass}}">{{status}}</span></p>
      </div>

      {{#if message}}
      <p>{{message}}</p>
      {{/if}}

      {{#if nextSteps}}
      <div class="info-box">
        <p><strong>Next Steps:</strong></p>
        <p>{{nextSteps}}</p>
      </div>
      {{/if}}

      <p style="text-align: center;">
        <a href="{{applicationUrl}}" class="button">View Full Details</a>
      </p>
    `),
    text: `
Application Status Update

Hi {{candidateName}},

There's been an update to your application for {{jobTitle}} at {{companyName}}.

New Status: {{status}}

{{message}}

{{#if nextSteps}}
Next Steps: {{nextSteps}}
{{/if}}

View full details: {{applicationUrl}}
    `,
  },

  // Interview invitation
  interviewInvitation: {
    subject: 'Interview Invitation - {{jobTitle}} at {{companyName}}',
    html: baseLayout(`
      <h2>You're Invited to Interview!</h2>
      <p>Hi {{candidateName}},</p>
      <p>Congratulations! We'd like to invite you to interview for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>

      <div class="info-box">
        <p><strong>Interview Type:</strong> {{interviewType}}</p>
        <p><strong>Date:</strong> {{interviewDate}}</p>
        <p><strong>Time:</strong> {{interviewTime}} ({{timezone}})</p>
        <p><strong>Duration:</strong> {{duration}}</p>
        {{#if location}}
        <p><strong>Location:</strong> {{location}}</p>
        {{/if}}
        {{#if meetingLink}}
        <p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">Join Meeting</a></p>
        {{/if}}
        <p><strong>Interviewer(s):</strong> {{interviewers}}</p>
      </div>

      {{#if instructions}}
      <div class="highlight">
        <p><strong>Instructions:</strong></p>
        <p>{{instructions}}</p>
      </div>
      {{/if}}

      <p style="text-align: center;">
        <a href="{{confirmUrl}}" class="button">Confirm Interview</a>
        <a href="{{rescheduleUrl}}" class="button button-secondary">Request Reschedule</a>
      </p>

      <p class="text-muted">Please confirm your attendance at least 24 hours before the scheduled time.</p>
    `),
    text: `
You're Invited to Interview!

Hi {{candidateName}},

Congratulations! We'd like to invite you to interview for the {{jobTitle}} position at {{companyName}}.

Interview Details:
- Type: {{interviewType}}
- Date: {{interviewDate}}
- Time: {{interviewTime}} ({{timezone}})
- Duration: {{duration}}
{{#if location}}- Location: {{location}}{{/if}}
{{#if meetingLink}}- Meeting Link: {{meetingLink}}{{/if}}
- Interviewer(s): {{interviewers}}

{{#if instructions}}
Instructions:
{{instructions}}
{{/if}}

Confirm interview: {{confirmUrl}}
Request reschedule: {{rescheduleUrl}}

Please confirm your attendance at least 24 hours before the scheduled time.
    `,
  },

  // Email verification
  emailVerification: {
    subject: 'Verify Your Email - ManithPro',
    html: baseLayout(`
      <h2>Verify Your Email Address</h2>
      <p>Hi {{userName}},</p>
      <p>Please verify your email address to complete your ManithPro account setup.</p>

      <div class="highlight">
        <p style="margin: 0; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px;">{{verificationCode}}</p>
      </div>

      <p>Or click the button below:</p>

      <p style="text-align: center;">
        <a href="{{verificationUrl}}" class="button">Verify Email</a>
      </p>

      <p class="text-muted">This code expires in {{expiresIn}}. If you didn't create an account, please ignore this email.</p>
    `),
    text: `
Verify Your Email Address

Hi {{userName}},

Please verify your email address to complete your ManithPro account setup.

Your verification code is: {{verificationCode}}

Or visit: {{verificationUrl}}

This code expires in {{expiresIn}}. If you didn't create an account, please ignore this email.
    `,
  },

  // Password reset
  passwordReset: {
    subject: 'Reset Your Password - ManithPro',
    html: baseLayout(`
      <h2>Password Reset Request</h2>
      <p>Hi {{userName}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <p style="text-align: center;">
        <a href="{{resetUrl}}" class="button">Reset Password</a>
      </p>

      <p class="text-muted">This link expires in {{expiresIn}}. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>

      <div class="info-box">
        <p><strong>Security Tip:</strong> Never share your password or this link with anyone. ManithPro will never ask for your password via email.</p>
      </div>
    `),
    text: `
Password Reset Request

Hi {{userName}},

We received a request to reset your password. Visit the link below to create a new password:

{{resetUrl}}

This link expires in {{expiresIn}}. If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Security Tip: Never share your password or this link with anyone. ManithPro will never ask for your password via email.
    `,
  },

  // Offer letter
  offerLetter: {
    subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
    html: baseLayout(`
      <h2>🎉 Congratulations!</h2>
      <p>Dear {{candidateName}},</p>
      <p>We are delighted to extend an offer for the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>

      <div class="info-box">
        <h3>Offer Details</h3>
        <p><strong>Position:</strong> {{jobTitle}}</p>
        <p><strong>Department:</strong> {{department}}</p>
        <p><strong>Start Date:</strong> {{startDate}}</p>
        <p><strong>Salary:</strong> {{salary}}</p>
        {{#if bonus}}
        <p><strong>Signing Bonus:</strong> {{bonus}}</p>
        {{/if}}
        <p><strong>Employment Type:</strong> {{employmentType}}</p>
        <p><strong>Location:</strong> {{location}}</p>
      </div>

      {{#if benefits}}
      <div class="highlight">
        <p><strong>Benefits Include:</strong></p>
        <p>{{benefits}}</p>
      </div>
      {{/if}}

      <p>Please review the attached offer letter for complete details. This offer is valid until <strong>{{expirationDate}}</strong>.</p>

      <p style="text-align: center;">
        <a href="{{acceptUrl}}" class="button">Accept Offer</a>
        <a href="{{negotiateUrl}}" class="button button-secondary">Discuss Terms</a>
      </p>

      <p>We're excited about the possibility of you joining our team!</p>
    `),
    text: `
Congratulations!

Dear {{candidateName}},

We are delighted to extend an offer for the position of {{jobTitle}} at {{companyName}}.

Offer Details:
- Position: {{jobTitle}}
- Department: {{department}}
- Start Date: {{startDate}}
- Salary: {{salary}}
{{#if bonus}}- Signing Bonus: {{bonus}}{{/if}}
- Employment Type: {{employmentType}}
- Location: {{location}}

{{#if benefits}}
Benefits Include:
{{benefits}}
{{/if}}

Please review the attached offer letter for complete details. This offer is valid until {{expirationDate}}.

Accept offer: {{acceptUrl}}
Discuss terms: {{negotiateUrl}}

We're excited about the possibility of you joining our team!
    `,
  },

  // Reference request
  referenceRequest: {
    subject: 'Reference Request for {{candidateName}}',
    html: baseLayout(`
      <h2>Reference Request</h2>
      <p>Dear {{referenceName}},</p>
      <p><strong>{{candidateName}}</strong> has listed you as a professional reference for their application to <strong>{{companyName}}</strong>.</p>

      <div class="info-box">
        <p><strong>Candidate:</strong> {{candidateName}}</p>
        <p><strong>Position Applied:</strong> {{jobTitle}}</p>
        <p><strong>Your Relationship:</strong> {{relationship}}</p>
      </div>

      <p>We would greatly appreciate if you could take a few minutes to provide your feedback on {{candidateName}}'s qualifications and work experience.</p>

      <p style="text-align: center;">
        <a href="{{referenceFormUrl}}" class="button">Provide Reference</a>
      </p>

      <p class="text-muted">This request expires in {{expiresIn}}. Your feedback is confidential and will only be used for hiring purposes.</p>
    `),
    text: `
Reference Request

Dear {{referenceName}},

{{candidateName}} has listed you as a professional reference for their application to {{companyName}}.

Candidate: {{candidateName}}
Position Applied: {{jobTitle}}
Your Relationship: {{relationship}}

We would greatly appreciate if you could take a few minutes to provide your feedback on {{candidateName}}'s qualifications and work experience.

Provide reference: {{referenceFormUrl}}

This request expires in {{expiresIn}}. Your feedback is confidential and will only be used for hiring purposes.
    `,
  },

  // Team invitation
  teamInvitation: {
    subject: "You're invited to join {{teamName}} on ManithPro",
    html: baseLayout(`
      <h2>Team Invitation</h2>
      <p>Hi there,</p>
      <p><strong>{{inviterName}}</strong> has invited you to join <strong>{{teamName}}</strong> on ManithPro.</p>

      <div class="info-box">
        <p><strong>Team:</strong> {{teamName}}</p>
        <p><strong>Your Role:</strong> {{role}}</p>
        <p><strong>Invited By:</strong> {{inviterName}}</p>
      </div>

      {{#if message}}
      <div class="highlight">
        <p><strong>Message from {{inviterName}}:</strong></p>
        <p>"{{message}}"</p>
      </div>
      {{/if}}

      <p style="text-align: center;">
        <a href="{{acceptUrl}}" class="button">Accept Invitation</a>
      </p>

      <p class="text-muted">This invitation expires in {{expiresIn}}.</p>
    `),
    text: `
Team Invitation

Hi there,

{{inviterName}} has invited you to join {{teamName}} on ManithPro.

Team: {{teamName}}
Your Role: {{role}}
Invited By: {{inviterName}}

{{#if message}}
Message from {{inviterName}}:
"{{message}}"
{{/if}}

Accept invitation: {{acceptUrl}}

This invitation expires in {{expiresIn}}.
    `,
  },
};

/**
 * Render a template with variables
 */
export function renderTemplate(
  template: { html: string; text: string },
  variables: TemplateVariables
): { html: string; text: string } {
  const render = (content: string): string => {
    let result = content;

    // Replace simple variables {{variable}}
    result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(variables[key] ?? '');
    });

    // Handle conditionals {{#if variable}}...{{/if}}
    result = result.replace(
      /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_, key, content) => {
        return variables[key] ? content : '';
      }
    );

    return result;
  };

  // Add default variables
  const enrichedVariables: TemplateVariables = {
    year: new Date().getFullYear(),
    unsubscribeUrl: process.env.FRONTEND_URL + '/unsubscribe',
    preferencesUrl: process.env.FRONTEND_URL + '/email-preferences',
    ...variables,
  };

  return {
    html: render(template.html),
    text: render(template.text),
  };
}

export default EmailTemplates;
