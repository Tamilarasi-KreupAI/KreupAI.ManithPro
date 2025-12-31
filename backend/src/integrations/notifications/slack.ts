// @ts-nocheck
/**
 * Slack Integration
 *
 * Integration with Slack for team notifications,
 * application updates, and hiring workflow alerts
 */

import { WebClient, ChatPostMessageResponse } from '@slack/web-api';

// Types
export interface SlackConfig {
  botToken: string;
  signingSecret?: string;
  defaultChannel?: string;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  threadTs?: string;
  unfurlLinks?: boolean;
  unfurlMedia?: boolean;
}

export interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'context' | 'actions' | 'image';
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
  };
  block_id?: string;
  accessory?: any;
  elements?: any[];
  fields?: Array<{
    type: 'plain_text' | 'mrkdwn';
    text: string;
  }>;
  image_url?: string;
  alt_text?: string;
}

export interface SlackAttachment {
  color?: string;
  fallback?: string;
  author_name?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

export interface SlackNotificationResult {
  success: boolean;
  messageTs?: string;
  channel?: string;
  error?: string;
}

class SlackService {
  private client: WebClient;
  private defaultChannel: string;

  constructor(config: SlackConfig) {
    this.client = new WebClient(config.botToken);
    this.defaultChannel = config.defaultChannel || '#general';
  }

  // ==================== CORE MESSAGING ====================

  /**
   * Send a message to a channel
   */
  async sendMessage(message: SlackMessage): Promise<SlackNotificationResult> {
    try {
      const result: ChatPostMessageResponse = await this.client.chat.postMessage({
        channel: message.channel,
        text: message.text,
        blocks: message.blocks as any,
        attachments: message.attachments as any,
        thread_ts: message.threadTs,
        unfurl_links: message.unfurlLinks ?? false,
        unfurl_media: message.unfurlMedia ?? true,
      });

      return {
        success: true,
        messageTs: result.ts,
        channel: result.channel,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send a simple text message
   */
  async sendText(channel: string, text: string): Promise<SlackNotificationResult> {
    return this.sendMessage({ channel, text });
  }

  /**
   * Reply to a thread
   */
  async replyToThread(
    channel: string,
    threadTs: string,
    text: string,
    blocks?: SlackBlock[]
  ): Promise<SlackNotificationResult> {
    return this.sendMessage({
      channel,
      text,
      blocks,
      threadTs,
    });
  }

  // ==================== APPLICATION NOTIFICATIONS ====================

  /**
   * Notify about new application
   */
  async notifyNewApplication(data: {
    channel?: string;
    candidateName: string;
    jobTitle: string;
    department?: string;
    applicationUrl: string;
    resumeUrl?: string;
    source?: string;
  }): Promise<SlackNotificationResult> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📥 New Application Received',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Candidate:*\n${data.candidateName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Position:*\n${data.jobTitle}`,
          },
        ],
      },
    ];

    if (data.department || data.source) {
      blocks.push({
        type: 'section',
        fields: [
          ...(data.department
            ? [{ type: 'mrkdwn' as const, text: `*Department:*\n${data.department}` }]
            : []),
          ...(data.source
            ? [{ type: 'mrkdwn' as const, text: `*Source:*\n${data.source}` }]
            : []),
        ],
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Application',
            emoji: true,
          },
          url: data.applicationUrl,
          style: 'primary',
        },
        ...(data.resumeUrl
          ? [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Resume',
                  emoji: true,
                },
                url: data.resumeUrl,
              },
            ]
          : []),
      ],
    });

    return this.sendMessage({
      channel: data.channel || this.defaultChannel,
      text: `New application from ${data.candidateName} for ${data.jobTitle}`,
      blocks,
    });
  }

  /**
   * Notify about application status change
   */
  async notifyStatusChange(data: {
    channel?: string;
    candidateName: string;
    jobTitle: string;
    previousStatus: string;
    newStatus: string;
    changedBy: string;
    applicationUrl: string;
    notes?: string;
  }): Promise<SlackNotificationResult> {
    const statusEmoji = this.getStatusEmoji(data.newStatus);

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji} Application Status Updated`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Candidate:*\n${data.candidateName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Position:*\n${data.jobTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n~${data.previousStatus}~ → *${data.newStatus}*`,
          },
          {
            type: 'mrkdwn',
            text: `*Updated by:*\n${data.changedBy}`,
          },
        ],
      },
    ];

    if (data.notes) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Notes:* ${data.notes}`,
        },
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Application',
            emoji: true,
          },
          url: data.applicationUrl,
        },
      ],
    });

    return this.sendMessage({
      channel: data.channel || this.defaultChannel,
      text: `${data.candidateName}'s application for ${data.jobTitle} moved to ${data.newStatus}`,
      blocks,
    });
  }

  /**
   * Notify about scheduled interview
   */
  async notifyInterviewScheduled(data: {
    channel?: string;
    candidateName: string;
    jobTitle: string;
    interviewType: string;
    scheduledAt: Date;
    duration: number;
    interviewers: string[];
    location?: string;
    meetingLink?: string;
    applicationUrl: string;
  }): Promise<SlackNotificationResult> {
    const formattedDate = data.scheduledAt.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedTime = data.scheduledAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📅 Interview Scheduled',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Candidate:*\n${data.candidateName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Position:*\n${data.jobTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Interview Type:*\n${data.interviewType}`,
          },
          {
            type: 'mrkdwn',
            text: `*Duration:*\n${data.duration} minutes`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Date:*\n${formattedDate}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${formattedTime}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Interviewers:*\n${data.interviewers.join(', ')}`,
        },
      },
    ];

    if (data.location || data.meetingLink) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: data.meetingLink
            ? `*Location:* <${data.meetingLink}|Join Meeting>`
            : `*Location:* ${data.location}`,
        },
      });
    }

    const actionButtons: any[] = [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View Application',
          emoji: true,
        },
        url: data.applicationUrl,
      },
    ];

    if (data.meetingLink) {
      actionButtons.push({
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Join Meeting',
          emoji: true,
        },
        url: data.meetingLink,
        style: 'primary',
      });
    }

    blocks.push({
      type: 'actions',
      elements: actionButtons,
    });

    return this.sendMessage({
      channel: data.channel || this.defaultChannel,
      text: `Interview scheduled with ${data.candidateName} for ${data.jobTitle} on ${formattedDate}`,
      blocks,
    });
  }

  /**
   * Notify about offer extended
   */
  async notifyOfferExtended(data: {
    channel?: string;
    candidateName: string;
    jobTitle: string;
    department: string;
    salary?: string;
    startDate?: string;
    extendedBy: string;
    applicationUrl: string;
  }): Promise<SlackNotificationResult> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 Offer Extended',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Candidate:*\n${data.candidateName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Position:*\n${data.jobTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Department:*\n${data.department}`,
          },
          {
            type: 'mrkdwn',
            text: `*Extended by:*\n${data.extendedBy}`,
          },
        ],
      },
    ];

    if (data.salary || data.startDate) {
      blocks.push({
        type: 'section',
        fields: [
          ...(data.salary
            ? [{ type: 'mrkdwn' as const, text: `*Salary:*\n${data.salary}` }]
            : []),
          ...(data.startDate
            ? [{ type: 'mrkdwn' as const, text: `*Start Date:*\n${data.startDate}` }]
            : []),
        ],
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Application',
            emoji: true,
          },
          url: data.applicationUrl,
        },
      ],
    });

    return this.sendMessage({
      channel: data.channel || this.defaultChannel,
      text: `Offer extended to ${data.candidateName} for ${data.jobTitle}!`,
      blocks,
    });
  }

  /**
   * Notify about new hire
   */
  async notifyNewHire(data: {
    channel?: string;
    employeeName: string;
    jobTitle: string;
    department: string;
    startDate: string;
    manager?: string;
    email?: string;
  }): Promise<SlackNotificationResult> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎊 Welcome New Team Member!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Please join us in welcoming *${data.employeeName}* to the team!`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Role:*\n${data.jobTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Department:*\n${data.department}`,
          },
          {
            type: 'mrkdwn',
            text: `*Start Date:*\n${data.startDate}`,
          },
          ...(data.manager
            ? [{ type: 'mrkdwn' as const, text: `*Manager:*\n${data.manager}` }]
            : []),
        ],
      },
    ];

    if (data.email) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📧 ${data.email}`,
          },
        ],
      });
    }

    return this.sendMessage({
      channel: data.channel || this.defaultChannel,
      text: `Welcome ${data.employeeName} to the team as ${data.jobTitle}!`,
      blocks,
    });
  }

  // ==================== SYSTEM NOTIFICATIONS ====================

  /**
   * Send daily hiring summary
   */
  async sendHiringSummary(data: {
    channel?: string;
    date: string;
    newApplications: number;
    interviewsScheduled: number;
    offersExtended: number;
    hiresMade: number;
    topJobs?: Array<{ title: string; applications: number }>;
    dashboardUrl: string;
  }): Promise<SlackNotificationResult> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Daily Hiring Summary',
          emoji: true,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*${data.date}*`,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*📥 New Applications:*\n${data.newApplications}`,
          },
          {
            type: 'mrkdwn',
            text: `*📅 Interviews Scheduled:*\n${data.interviewsScheduled}`,
          },
          {
            type: 'mrkdwn',
            text: `*📝 Offers Extended:*\n${data.offersExtended}`,
          },
          {
            type: 'mrkdwn',
            text: `*✅ Hires Made:*\n${data.hiresMade}`,
          },
        ],
      },
    ];

    if (data.topJobs && data.topJobs.length > 0) {
      blocks.push({
        type: 'divider',
      });
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            '*Top Positions by Applications:*\n' +
            data.topJobs.map((job, i) => `${i + 1}. ${job.title} (${job.applications})`).join('\n'),
        },
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Dashboard',
            emoji: true,
          },
          url: data.dashboardUrl,
          style: 'primary',
        },
      ],
    });

    return this.sendMessage({
      channel: data.channel || this.defaultChannel,
      text: `Daily Hiring Summary for ${data.date}: ${data.newApplications} new applications, ${data.hiresMade} hires`,
      blocks,
    });
  }

  // ==================== HELPER METHODS ====================

  private getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      applied: '📥',
      screening: '🔍',
      interview: '📅',
      assessment: '📝',
      offer: '📄',
      hired: '✅',
      rejected: '❌',
      withdrawn: '↩️',
    };
    return emojiMap[status.toLowerCase()] || '📋';
  }

  /**
   * Look up user by email
   */
  async findUserByEmail(email: string): Promise<{ id?: string; name?: string; error?: string }> {
    try {
      const result = await this.client.users.lookupByEmail({ email });
      return {
        id: result.user?.id,
        name: result.user?.name,
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * List channels the bot is a member of
   */
  async listChannels(): Promise<{
    channels?: Array<{ id: string; name: string }>;
    error?: string;
  }> {
    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel',
      });

      return {
        channels: result.channels?.map(ch => ({
          id: ch.id!,
          name: ch.name!,
        })),
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

// Singleton instance
let slackInstance: SlackService | null = null;

export function initSlack(config: SlackConfig): SlackService {
  slackInstance = new SlackService(config);
  return slackInstance;
}

export function getSlack(): SlackService {
  if (!slackInstance) {
    const botToken = process.env.SLACK_BOT_TOKEN;
    if (!botToken) {
      throw new Error('SLACK_BOT_TOKEN environment variable is required');
    }

    slackInstance = new SlackService({
      botToken,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || '#hiring',
    });
  }
  return slackInstance;
}

export default SlackService;
