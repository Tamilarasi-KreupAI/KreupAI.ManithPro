/**
 * Email Integration Module
 *
 * Unified email service supporting multiple providers
 * Automatically selects provider based on configuration
 */

import SendGridService, { getSendGrid, initSendGrid } from './sendgrid';
import SESService, { getSES, initSES } from './ses';
import { EmailTemplates, renderTemplate, TemplateVariables } from './templates';

export type EmailProvider = 'sendgrid' | 'ses' | 'smtp';

export interface UnifiedEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  templateName?: keyof typeof EmailTemplates;
  templateData?: TemplateVariables;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: EmailProvider;
}

/**
 * Unified Email Service
 * Automatically selects the best available provider
 */
class EmailService {
  private provider: EmailProvider;

  constructor() {
    // Determine provider from environment
    if (process.env.SENDGRID_API_KEY) {
      this.provider = 'sendgrid';
    } else if (process.env.AWS_SES_REGION || process.env.AWS_REGION) {
      this.provider = 'ses';
    } else {
      this.provider = 'smtp';
    }
  }

  /**
   * Send an email using the configured provider
   */
  async send(options: UnifiedEmailOptions): Promise<EmailResult> {
    // Handle template rendering
    let subject = options.subject;
    let text = options.text;
    let html = options.html;

    if (options.templateName && options.templateData) {
      const template = EmailTemplates[options.templateName];
      if (template) {
        const rendered = renderTemplate(
          { html: template.html, text: template.text },
          { ...options.templateData, recipientEmail: Array.isArray(options.to) ? options.to[0] : options.to }
        );
        html = rendered.html;
        text = rendered.text;

        // Also render subject with template data
        subject = renderTemplate(
          { html: template.subject, text: template.subject },
          options.templateData
        ).text;
      }
    }

    try {
      switch (this.provider) {
        case 'sendgrid': {
          const sendgrid = getSendGrid();
          const result = await sendgrid.sendEmail({
            to: Array.isArray(options.to)
              ? options.to.map(email => ({ email }))
              : { email: options.to },
            subject,
            text,
            html,
            cc: options.cc?.map(email => ({ email })),
            bcc: options.bcc?.map(email => ({ email })),
            replyTo: options.replyTo ? { email: options.replyTo } : undefined,
          });
          return { ...result, provider: 'sendgrid' };
        }

        case 'ses': {
          const ses = getSES();
          const result = await ses.sendEmail({
            to: options.to,
            subject,
            text,
            html,
            cc: options.cc,
            bcc: options.bcc,
            replyTo: options.replyTo ? [options.replyTo] : undefined,
          });
          return { ...result, provider: 'ses' };
        }

        case 'smtp':
        default: {
          // Fall back to existing nodemailer implementation
          const { sendEmail } = await import('../../utils/email');
          await sendEmail({
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject,
            text,
            html,
          });
          return { success: true, provider: 'smtp' };
        }
      }
    } catch (error: any) {
      console.error(`Email send error (${this.provider}):`, error.message);
      return {
        success: false,
        error: error.message,
        provider: this.provider,
      };
    }
  }

  /**
   * Send application submitted email
   */
  async sendApplicationSubmitted(data: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationId: string;
    department?: string;
    location?: string;
    applicationUrl: string;
  }): Promise<EmailResult> {
    return this.send({
      to: data.candidateEmail,
      subject: `Application Received - ${data.jobTitle} at ${data.companyName}`,
      templateName: 'applicationSubmitted',
      templateData: {
        ...data,
        submittedDate: new Date().toLocaleDateString(),
        responseTime: '5-7 business days',
      },
    });
  }

  /**
   * Send application status update email
   */
  async sendApplicationStatusUpdate(data: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    status: string;
    statusClass?: string;
    message?: string;
    nextSteps?: string;
    applicationUrl: string;
  }): Promise<EmailResult> {
    return this.send({
      to: data.candidateEmail,
      subject: `Application Update - ${data.jobTitle} at ${data.companyName}`,
      templateName: 'applicationStatusUpdate',
      templateData: data,
    });
  }

  /**
   * Send interview invitation email
   */
  async sendInterviewInvitation(data: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    interviewType: string;
    interviewDate: string;
    interviewTime: string;
    timezone: string;
    duration: string;
    location?: string;
    meetingLink?: string;
    interviewers: string;
    instructions?: string;
    confirmUrl: string;
    rescheduleUrl: string;
  }): Promise<EmailResult> {
    return this.send({
      to: data.candidateEmail,
      subject: `Interview Invitation - ${data.jobTitle} at ${data.companyName}`,
      templateName: 'interviewInvitation',
      templateData: data,
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(data: {
    email: string;
    userName: string;
    verificationCode: string;
    verificationUrl: string;
    expiresIn?: string;
  }): Promise<EmailResult> {
    return this.send({
      to: data.email,
      subject: 'Verify Your Email - ManithPro',
      templateName: 'emailVerification',
      templateData: {
        ...data,
        expiresIn: data.expiresIn || '24 hours',
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(data: {
    email: string;
    userName: string;
    resetUrl: string;
    expiresIn?: string;
  }): Promise<EmailResult> {
    return this.send({
      to: data.email,
      subject: 'Reset Your Password - ManithPro',
      templateName: 'passwordReset',
      templateData: {
        ...data,
        expiresIn: data.expiresIn || '1 hour',
      },
    });
  }

  /**
   * Send offer letter email
   */
  async sendOfferLetter(data: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    department: string;
    startDate: string;
    salary: string;
    bonus?: string;
    employmentType: string;
    location: string;
    benefits?: string;
    expirationDate: string;
    acceptUrl: string;
    negotiateUrl: string;
  }): Promise<EmailResult> {
    return this.send({
      to: data.candidateEmail,
      subject: `Job Offer - ${data.jobTitle} at ${data.companyName}`,
      templateName: 'offerLetter',
      templateData: data,
    });
  }

  /**
   * Send reference request email
   */
  async sendReferenceRequest(data: {
    referenceEmail: string;
    referenceName: string;
    candidateName: string;
    companyName: string;
    jobTitle: string;
    relationship: string;
    referenceFormUrl: string;
    expiresIn?: string;
  }): Promise<EmailResult> {
    return this.send({
      to: data.referenceEmail,
      subject: `Reference Request for ${data.candidateName}`,
      templateName: 'referenceRequest',
      templateData: {
        ...data,
        expiresIn: data.expiresIn || '7 days',
      },
    });
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitation(data: {
    email: string;
    teamName: string;
    role: string;
    inviterName: string;
    message?: string;
    acceptUrl: string;
    expiresIn?: string;
  }): Promise<EmailResult> {
    return this.send({
      to: data.email,
      subject: `You're invited to join ${data.teamName} on ManithPro`,
      templateName: 'teamInvitation',
      templateData: {
        ...data,
        expiresIn: data.expiresIn || '7 days',
      },
    });
  }

  /**
   * Get current provider
   */
  getProvider(): EmailProvider {
    return this.provider;
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}

// Re-exports
export { SendGridService, SESService, EmailTemplates, renderTemplate };
export { initSendGrid, getSendGrid } from './sendgrid';
export { initSES, getSES } from './ses';

export default EmailService;
