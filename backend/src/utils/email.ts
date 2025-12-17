import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email service not configured. Skipping email to:', options.to);
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent successfully to:', options.to);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw error to prevent email failures from breaking the application
  }
};

export const sendApplicationSubmittedEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string
): Promise<void> => {
  const subject = `Application Received: ${jobTitle} - KreupAI ManithPro`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 16px; color: #475569; margin-bottom: 15px; }
        .job-title { display: inline-block; background: #eff6ff; color: #2563eb; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .info-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0; border-radius: 6px; }
        .info-box h3 { margin: 0 0 10px 0; color: #1e293b; font-size: 16px; }
        .info-box ul { margin: 10px 0; padding-left: 20px; }
        .info-box li { color: #475569; margin: 8px 0; }
        .cta-button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; font-size: 14px; color: #64748b; }
        .social-links { margin: 15px 0; }
        .social-links a { color: #2563eb; text-decoration: none; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Received</h1>
          <p>Thank you for applying through KreupAI ManithPro</p>
        </div>

        <div class="content">
          <p class="greeting">Dear ${candidateName},</p>

          <p class="message">
            Thank you for your interest in joining our team! We're excited to inform you that your application has been successfully received.
          </p>

          <div style="text-align: center;">
            <span class="job-title">${jobTitle}</span>
          </div>

          <div class="info-box">
            <h3>What Happens Next?</h3>
            <ul>
              <li><strong>Review:</strong> Our recruitment team is carefully reviewing your application</li>
              <li><strong>Assessment:</strong> We'll evaluate your skills and experience against our requirements</li>
              <li><strong>Updates:</strong> You'll receive email notifications about any status changes</li>
              <li><strong>Timeline:</strong> We typically respond within 5-7 business days</li>
            </ul>
          </div>

          <p class="message">
            <strong>Track Your Application:</strong> You can view your application status anytime by logging into your KreupAI ManithPro dashboard.
          </p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/applications" class="cta-button">View Application Status</a>
          </div>

          <p class="message" style="margin-top: 30px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>

        <div class="footer">
          <p><strong>KreupAI ManithPro Recruitment Team</strong></p>
          <p>Building careers, connecting talent</p>
          <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: candidateEmail, subject, html });
};

export const sendApplicationStatusEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  status: string
): Promise<void> => {
  // Status-specific configurations
  const statusConfig: Record<string, { color: string; bgColor: string; title: string; message: string; nextSteps: string[] }> = {
    UNDER_REVIEW: {
      color: '#2563eb',
      bgColor: '#eff6ff',
      title: 'Application Under Review',
      message: 'Great news! Your application is currently being reviewed by our recruitment team. We\'re carefully evaluating your qualifications and experience.',
      nextSteps: [
        'Our team is reviewing your resume and cover letter',
        'We\'ll assess your fit for the position',
        'You\'ll hear from us within 3-5 business days'
      ]
    },
    SHORTLISTED: {
      color: '#059669',
      bgColor: '#d1fae5',
      title: 'Congratulations - You\'ve Been Shortlisted!',
      message: 'Excellent news! After careful review, we\'re impressed with your profile and have shortlisted you for the next stage of our recruitment process.',
      nextSteps: [
        'Expect a call or email from our HR team soon',
        'We may schedule an interview or assessment',
        'Keep an eye on your email and phone',
        'Prepare to discuss your experience and skills'
      ]
    },
    INTERVIEWED: {
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      title: 'Interview Scheduled',
      message: 'Your interview has been scheduled! This is an exciting opportunity to showcase your skills and learn more about our team.',
      nextSteps: [
        'Check your email for interview details',
        'Prepare for common interview questions',
        'Research our company and the role',
        'Arrive on time (or join the call on time)'
      ]
    },
    OFFERED: {
      color: '#059669',
      bgColor: '#d1fae5',
      title: 'Congratulations - Job Offer!',
      message: 'Fantastic news! We\'re thrilled to extend a job offer for the position. We believe you\'ll be a great addition to our team!',
      nextSteps: [
        'Check your email for the formal offer letter',
        'Review the compensation and benefits package',
        'Feel free to ask any questions',
        'We look forward to welcoming you aboard!'
      ]
    },
    REJECTED: {
      color: '#dc2626',
      bgColor: '#fee2e2',
      title: 'Application Status Update',
      message: 'Thank you for your interest and the time you invested in the application process. After careful consideration, we\'ve decided to move forward with other candidates whose experience more closely matches our current needs.',
      nextSteps: [
        'We appreciate your interest in our company',
        'Your resume will be kept on file for future opportunities',
        'We encourage you to apply for other suitable positions',
        'We wish you the very best in your job search'
      ]
    },
    WITHDRAWN: {
      color: '#64748b',
      bgColor: '#f1f5f9',
      title: 'Application Withdrawn',
      message: 'Your application has been withdrawn. If this was a mistake or if you\'d like to reapply, please feel free to submit a new application.',
      nextSteps: [
        'You can reapply for this or other positions anytime',
        'Check our job board for new opportunities',
        'Contact us if you have any questions'
      ]
    }
  };

  const config = statusConfig[status] || {
    color: '#2563eb',
    bgColor: '#eff6ff',
    title: 'Application Status Updated',
    message: `Your application status has been updated to: ${status.replace('_', ' ')}`,
    nextSteps: ['Please check your dashboard for more details']
  };

  const subject = `${config.title}: ${jobTitle} - KreupAI ManithPro`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 16px; color: #475569; margin-bottom: 20px; line-height: 1.8; }
        .status-badge { display: inline-block; background: ${config.bgColor}; color: ${config.color}; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 18px; margin: 20px 0; border: 2px solid ${config.color}33; }
        .job-title { font-size: 20px; color: #1e293b; font-weight: 700; text-align: center; margin: 25px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
        .info-box { background: #f8fafc; border-left: 4px solid ${config.color}; padding: 25px; margin: 25px 0; border-radius: 6px; }
        .info-box h3 { margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 700; }
        .info-box ul { margin: 10px 0; padding-left: 20px; }
        .info-box li { color: #475569; margin: 10px 0; line-height: 1.6; }
        .cta-button { display: inline-block; background: ${config.color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 6px ${config.color}33; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; font-size: 14px; color: #64748b; }
        .divider { height: 1px; background: #e2e8f0; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${config.title}</h1>
        </div>

        <div class="content">
          <p class="greeting">Dear ${candidateName},</p>

          <p class="message">${config.message}</p>

          <div class="job-title">
            ${jobTitle}
          </div>

          <div style="text-align: center;">
            <span class="status-badge">
              ${status === 'UNDER_REVIEW' ? 'UNDER REVIEW' : status.replace('_', ' ')}
            </span>
          </div>

          <div class="info-box">
            <h3>Next Steps</h3>
            <ul>
              ${config.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
          </div>

          <div class="divider"></div>

          <p class="message">
            <strong>Track Your Progress:</strong> You can view your complete application status and history by visiting your dashboard.
          </p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/applications" class="cta-button">View Application Dashboard</a>
          </div>

          <p class="message" style="margin-top: 30px; font-size: 14px; color: #64748b;">
            If you have any questions or concerns, please don't hesitate to reach out to our recruitment team.
          </p>
        </div>

        <div class="footer">
          <p><strong>KreupAI ManithPro Recruitment Team</strong></p>
          <p>Building careers, connecting talent</p>
          <p style="margin-top: 15px;">Email: support@kreupai.com | Website: kreupai.com</p>
          <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
            This is an automated notification. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: candidateEmail, subject, html });
};

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
): Promise<void> => {
  const subject = `New Job Match: ${jobTitle} at ${companyName} - KreupAI ManithPro`;
  const jobUrl = `${process.env.FRONTEND_URL}/jobs/${jobId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 16px; color: #475569; margin-bottom: 20px; line-height: 1.8; }
        .job-card { background: #f8fafc; border-left: 4px solid #059669; padding: 25px; margin: 25px 0; border-radius: 8px; }
        .job-title { font-size: 22px; color: #1e293b; font-weight: 700; margin-bottom: 10px; }
        .company-name { font-size: 18px; color: #059669; font-weight: 600; margin-bottom: 15px; }
        .job-details { margin: 15px 0; }
        .job-detail-item { display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 15px; color: #475569; }
        .job-detail-label { font-weight: 600; color: #1e293b; min-width: 80px; }
        .skills-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; }
        .skills-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
        .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #d1fae5; color: #059669; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600; border: 1px solid #a7f3d0; }
        .cta-button { display: inline-block; background: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3); }
        .cta-button:hover { background: #047857; }
        .info-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0; border-radius: 6px; }
        .info-box-title { font-weight: 700; color: #1e293b; margin-bottom: 10px; font-size: 16px; }
        .info-box ul { margin: 10px 0; padding-left: 20px; }
        .info-box li { color: #475569; margin: 8px 0; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; font-size: 14px; color: #64748b; }
        .divider { height: 1px; background: #e2e8f0; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Perfect Match Found!</h1>
          <p>A new job opportunity matches your skills</p>
        </div>

        <div class="content">
          <p class="greeting">Dear ${candidateName},</p>

          <p class="message">
            Great news! We found a job opportunity that matches your skills and experience.
            Based on your profile, we believe you'd be an excellent fit for this position.
          </p>

          <div class="job-card">
            <div class="job-title">${jobTitle}</div>
            <div class="company-name">${companyName}</div>

            <div class="job-details">
              <div class="job-detail-item">
                <span class="job-detail-label">Location:</span>
                <span>${location}</span>
              </div>
              <div class="job-detail-item">
                <span class="job-detail-label">Job Type:</span>
                <span>${type}</span>
              </div>
              ${salary ? `
              <div class="job-detail-item">
                <span class="job-detail-label">Salary:</span>
                <span>${salary}</span>
              </div>
              ` : ''}
            </div>

            ${matchingSkills.length > 0 ? `
            <div class="skills-section">
              <div class="skills-title">Your Matching Skills:</div>
              <div class="skills-container">
                ${matchingSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
            ` : ''}
          </div>

          <div class="info-box">
            <div class="info-box-title">Why This Job Matches You:</div>
            <ul>
              <li>Your skills align perfectly with the job requirements</li>
              <li>The position matches your experience level</li>
              <li>This is a great opportunity to advance your career</li>
              <li>Apply early to increase your chances of getting shortlisted</li>
            </ul>
          </div>

          <p class="message">
            <strong>Don't miss out!</strong> Review the complete job details and submit your application to get started.
          </p>

          <div style="text-align: center;">
            <a href="${jobUrl}" class="cta-button">View Job & Apply Now</a>
          </div>

          <div class="divider"></div>

          <p class="message" style="font-size: 14px; color: #64748b;">
            You're receiving this email because your skills match this job opportunity.
            You can manage your notification preferences in your dashboard settings.
          </p>
        </div>

        <div class="footer">
          <p><strong>KreupAI ManithPro Recruitment Team</strong></p>
          <p>Building careers, connecting talent</p>
          <p style="margin-top: 15px;">Email: support@kreupai.com | Website: kreupai.com</p>
          <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
            This is an automated job recommendation. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: candidateEmail, subject, html });
};
