/**
 * Notifications Integration Module
 *
 * Unified notification service supporting Slack and other channels
 */

import SlackService, { getSlack, initSlack, SlackNotificationResult } from './slack';

// Re-export types
export * from './slack';

export type NotificationChannel = 'slack' | 'email' | 'sms' | 'push';

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
}

/**
 * Unified Notification Service
 */
class NotificationService {
  /**
   * Send notification to Slack
   */
  async sendSlackNotification(
    channel: string,
    message: string,
    options?: {
      blocks?: any[];
      threadTs?: string;
    }
  ): Promise<NotificationResult> {
    try {
      const slack = getSlack();
      const result = await slack.sendMessage({
        channel,
        text: message,
        blocks: options?.blocks,
        threadTs: options?.threadTs,
      });

      return {
        success: result.success,
        channel: 'slack',
        messageId: result.messageTs,
        error: result.error,
      };
    } catch (error: any) {
      return {
        success: false,
        channel: 'slack',
        error: error.message,
      };
    }
  }

  /**
   * Notify team about new application
   */
  async notifyNewApplication(data: {
    candidateName: string;
    jobTitle: string;
    department?: string;
    applicationUrl: string;
    resumeUrl?: string;
    source?: string;
    slackChannel?: string;
    emailRecipients?: string[];
  }): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Send Slack notification
    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const slack = getSlack();
        const slackResult = await slack.notifyNewApplication({
          channel: data.slackChannel,
          candidateName: data.candidateName,
          jobTitle: data.jobTitle,
          department: data.department,
          applicationUrl: data.applicationUrl,
          resumeUrl: data.resumeUrl,
          source: data.source,
        });

        results.push({
          success: slackResult.success,
          channel: 'slack',
          messageId: slackResult.messageTs,
          error: slackResult.error,
        });
      } catch (error: any) {
        results.push({
          success: false,
          channel: 'slack',
          error: error.message,
        });
      }
    }

    // Send email notifications if recipients specified
    if (data.emailRecipients && data.emailRecipients.length > 0) {
      try {
        const { getEmailService } = await import('../email');
        const emailService = getEmailService();

        for (const email of data.emailRecipients) {
          const emailResult = await emailService.send({
            to: email,
            subject: `New Application: ${data.candidateName} for ${data.jobTitle}`,
            text: `A new application has been received from ${data.candidateName} for the ${data.jobTitle} position.`,
            html: `
              <h2>New Application Received</h2>
              <p><strong>Candidate:</strong> ${data.candidateName}</p>
              <p><strong>Position:</strong> ${data.jobTitle}</p>
              ${data.department ? `<p><strong>Department:</strong> ${data.department}</p>` : ''}
              ${data.source ? `<p><strong>Source:</strong> ${data.source}</p>` : ''}
              <p><a href="${data.applicationUrl}">View Application</a></p>
            `,
          });

          results.push({
            success: emailResult.success,
            channel: 'email',
            messageId: emailResult.messageId,
            error: emailResult.error,
          });
        }
      } catch (error: any) {
        results.push({
          success: false,
          channel: 'email',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Notify about interview scheduled
   */
  async notifyInterviewScheduled(data: {
    candidateName: string;
    jobTitle: string;
    interviewType: string;
    scheduledAt: Date;
    duration: number;
    interviewers: string[];
    location?: string;
    meetingLink?: string;
    applicationUrl: string;
    slackChannel?: string;
  }): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const slack = getSlack();
        const slackResult = await slack.notifyInterviewScheduled({
          channel: data.slackChannel,
          candidateName: data.candidateName,
          jobTitle: data.jobTitle,
          interviewType: data.interviewType,
          scheduledAt: data.scheduledAt,
          duration: data.duration,
          interviewers: data.interviewers,
          location: data.location,
          meetingLink: data.meetingLink,
          applicationUrl: data.applicationUrl,
        });

        results.push({
          success: slackResult.success,
          channel: 'slack',
          messageId: slackResult.messageTs,
          error: slackResult.error,
        });
      } catch (error: any) {
        results.push({
          success: false,
          channel: 'slack',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Notify about offer extended
   */
  async notifyOfferExtended(data: {
    candidateName: string;
    jobTitle: string;
    department: string;
    salary?: string;
    startDate?: string;
    extendedBy: string;
    applicationUrl: string;
    slackChannel?: string;
  }): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const slack = getSlack();
        const slackResult = await slack.notifyOfferExtended({
          channel: data.slackChannel,
          candidateName: data.candidateName,
          jobTitle: data.jobTitle,
          department: data.department,
          salary: data.salary,
          startDate: data.startDate,
          extendedBy: data.extendedBy,
          applicationUrl: data.applicationUrl,
        });

        results.push({
          success: slackResult.success,
          channel: 'slack',
          messageId: slackResult.messageTs,
          error: slackResult.error,
        });
      } catch (error: any) {
        results.push({
          success: false,
          channel: 'slack',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Notify about new hire
   */
  async notifyNewHire(data: {
    employeeName: string;
    jobTitle: string;
    department: string;
    startDate: string;
    manager?: string;
    email?: string;
    slackChannel?: string;
  }): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const slack = getSlack();
        const slackResult = await slack.notifyNewHire({
          channel: data.slackChannel,
          employeeName: data.employeeName,
          jobTitle: data.jobTitle,
          department: data.department,
          startDate: data.startDate,
          manager: data.manager,
          email: data.email,
        });

        results.push({
          success: slackResult.success,
          channel: 'slack',
          messageId: slackResult.messageTs,
          error: slackResult.error,
        });
      } catch (error: any) {
        results.push({
          success: false,
          channel: 'slack',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send daily hiring summary
   */
  async sendDailyHiringSummary(data: {
    date: string;
    newApplications: number;
    interviewsScheduled: number;
    offersExtended: number;
    hiresMade: number;
    topJobs?: Array<{ title: string; applications: number }>;
    dashboardUrl: string;
    slackChannel?: string;
  }): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const slack = getSlack();
        const slackResult = await slack.sendHiringSummary({
          channel: data.slackChannel,
          date: data.date,
          newApplications: data.newApplications,
          interviewsScheduled: data.interviewsScheduled,
          offersExtended: data.offersExtended,
          hiresMade: data.hiresMade,
          topJobs: data.topJobs,
          dashboardUrl: data.dashboardUrl,
        });

        results.push({
          success: slackResult.success,
          channel: 'slack',
          messageId: slackResult.messageTs,
          error: slackResult.error,
        });
      } catch (error: any) {
        results.push({
          success: false,
          channel: 'slack',
          error: error.message,
        });
      }
    }

    return results;
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
}

// Re-exports
export { SlackService };
export { getSlack, initSlack } from './slack';

export default NotificationService;
