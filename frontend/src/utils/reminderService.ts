// Reminder Service for scheduling and managing notifications

export interface ReminderConfig {
  id?: string;
  eventId: string;
  eventType: 'INTERVIEW' | 'APPLICATION_DEADLINE' | 'MEETING' | 'CUSTOM';
  eventTitle: string;
  eventTime: Date;
  reminderTimes: ReminderTime[];
  recipientId: string;
  notificationChannels: ('EMAIL' | 'PUSH' | 'IN_APP')[];
  isActive: boolean;
}

export interface ReminderTime {
  offset: number; // minutes before event
  label: string; // e.g., "24 hours before", "1 hour before"
}

export const COMMON_REMINDER_TIMES: ReminderTime[] = [
  { offset: 10080, label: '1 week before' }, // 7 days * 24 * 60
  { offset: 2880, label: '2 days before' }, // 2 * 24 * 60
  { offset: 1440, label: '1 day before' }, // 24 * 60
  { offset: 120, label: '2 hours before' },
  { offset: 60, label: '1 hour before' },
  { offset: 30, label: '30 minutes before' },
  { offset: 15, label: '15 minutes before' },
  { offset: 5, label: '5 minutes before' },
];

export class ReminderService {
  private static instance: ReminderService;
  private scheduledReminders: Map<string, NodeJS.Timeout>;

  private constructor() {
    this.scheduledReminders = new Map();
  }

  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  /**
   * Schedule a reminder
   */
  scheduleReminder(config: ReminderConfig): string {
    const reminderId = config.id || this.generateReminderId(config.eventId);

    // Cancel existing reminder if any
    this.cancelReminder(reminderId);

    // Schedule each reminder time
    config.reminderTimes.forEach((reminderTime, index) => {
      const triggerTime = new Date(config.eventTime);
      triggerTime.setMinutes(triggerTime.getMinutes() - reminderTime.offset);

      const now = new Date();
      const delay = triggerTime.getTime() - now.getTime();

      // Only schedule if the trigger time is in the future
      if (delay > 0) {
        const timeoutId = setTimeout(() => {
          this.triggerReminder(config, reminderTime);
        }, delay);

        this.scheduledReminders.set(`${reminderId}_${index}`, timeoutId);
      }
    });

    // Store reminder config in localStorage for persistence
    this.saveReminderConfig(reminderId, config);

    return reminderId;
  }

  /**
   * Cancel a reminder
   */
  cancelReminder(reminderId: string): void {
    // Cancel all scheduled timeouts for this reminder
    for (const [key, timeoutId] of this.scheduledReminders.entries()) {
      if (key.startsWith(reminderId)) {
        clearTimeout(timeoutId);
        this.scheduledReminders.delete(key);
      }
    }

    // Remove from localStorage
    this.removeReminderConfig(reminderId);
  }

  /**
   * Trigger a reminder (send notification)
   */
  private async triggerReminder(config: ReminderConfig, reminderTime: ReminderTime): Promise<void> {
    console.log(`Triggering reminder: ${config.eventTitle} - ${reminderTime.label}`);

    const notification = {
      title: `Reminder: ${config.eventTitle}`,
      body: `${config.eventTitle} is coming up ${reminderTime.label}`,
      eventType: config.eventType,
      eventId: config.eventId,
      eventTime: config.eventTime,
    };

    // Send notifications through configured channels
    const promises = config.notificationChannels.map(channel => {
      switch (channel) {
        case 'PUSH':
          return this.sendPushNotification(notification);
        case 'EMAIL':
          return this.sendEmailNotification(notification, config.recipientId);
        case 'IN_APP':
          return this.sendInAppNotification(notification, config.recipientId);
        default:
          return Promise.resolve();
      }
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error sending reminder notifications:', error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: any): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: `reminder-${notification.eventId}`,
          requireInteraction: true,
          data: notification,
          actions: [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' },
          ],
        });
      } catch (error) {
        console.error('Failed to show push notification:', error);
      }
    }
  }

  /**
   * Send email notification (via API)
   */
  private async sendEmailNotification(notification: any, recipientId: string): Promise<void> {
    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          subject: notification.title,
          body: notification.body,
          eventType: notification.eventType,
          eventId: notification.eventId,
        }),
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send in-app notification (via API)
   */
  private async sendInAppNotification(notification: any, recipientId: string): Promise<void> {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: recipientId,
          type: notification.eventType,
          message: `${notification.title}: ${notification.body}`,
          link: `/interviews/${notification.eventId}`,
        }),
      });
    } catch (error) {
      console.error('Failed to send in-app notification:', error);
    }
  }

  /**
   * Load reminders from localStorage and reschedule them
   */
  loadAndRescheduleReminders(): void {
    const reminders = this.getAllReminderConfigs();
    reminders.forEach(config => {
      // Only reschedule if event is in the future
      if (new Date(config.eventTime) > new Date()) {
        this.scheduleReminder(config);
      }
    });
  }

  /**
   * Get all active reminders
   */
  getActiveReminders(): ReminderConfig[] {
    return this.getAllReminderConfigs().filter(r => r.isActive);
  }

  /**
   * Helper: Generate reminder ID
   */
  private generateReminderId(eventId: string): string {
    return `reminder_${eventId}_${Date.now()}`;
  }

  /**
   * Helper: Save reminder config to localStorage
   */
  private saveReminderConfig(id: string, config: ReminderConfig): void {
    try {
      const key = `reminder_${id}`;
      localStorage.setItem(key, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save reminder config:', error);
    }
  }

  /**
   * Helper: Remove reminder config from localStorage
   */
  private removeReminderConfig(id: string): void {
    try {
      const key = `reminder_${id}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove reminder config:', error);
    }
  }

  /**
   * Helper: Get all reminder configs from localStorage
   */
  private getAllReminderConfigs(): ReminderConfig[] {
    const configs: ReminderConfig[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('reminder_')) {
          const value = localStorage.getItem(key);
          if (value) {
            const config = JSON.parse(value);
            config.eventTime = new Date(config.eventTime);
            configs.push(config);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load reminder configs:', error);
    }
    return configs;
  }
}

// Export singleton instance
export const reminderService = ReminderService.getInstance();

// Initialize reminders on app load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    reminderService.loadAndRescheduleReminders();
  });
}
