/**
 * Calendar Integration Module
 *
 * Unified calendar service supporting Google Calendar and Outlook
 */

import GoogleCalendarService, { getGoogleCalendar, initGoogleCalendar, CalendarEvent as GoogleEvent } from './google';
import OutlookCalendarService, { getOutlookCalendar, initOutlookCalendar, OutlookEvent } from './outlook';

// Re-export types
export * from './google';
export * from './outlook';

export type CalendarProvider = 'google' | 'outlook';

export interface UnifiedCalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  timeZone?: string;
  attendees?: Array<{
    email: string;
    name?: string;
    optional?: boolean;
  }>;
  createVideoMeeting?: boolean;
  reminders?: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
}

export interface CalendarEventResult {
  success: boolean;
  provider: CalendarProvider;
  eventId?: string;
  webLink?: string;
  meetingLink?: string;
  error?: string;
}

export interface AvailabilitySlot {
  start: Date;
  end: Date;
  available: boolean;
}

/**
 * Unified Calendar Service
 */
class CalendarService {
  /**
   * Create event on Google Calendar
   */
  async createGoogleEvent(
    accessToken: string,
    event: UnifiedCalendarEvent,
    calendarId: string = 'primary'
  ): Promise<CalendarEventResult> {
    try {
      const google = getGoogleCalendar();
      google.setCredentials({ accessToken });

      const result = await google.createEvent(
        {
          summary: event.summary,
          description: event.description,
          location: event.location,
          start: event.start,
          end: event.end,
          timeZone: event.timeZone,
          attendees: event.attendees?.map(a => ({
            email: a.email,
            displayName: a.name,
            optional: a.optional,
          })),
          conferenceData: event.createVideoMeeting ? {
            type: 'hangoutsMeet',
          } : undefined,
          reminders: event.reminders ? {
            useDefault: false,
            overrides: event.reminders,
          } : undefined,
        },
        calendarId
      );

      return {
        success: true,
        provider: 'google',
        eventId: result.id,
        webLink: result.htmlLink,
        meetingLink: result.meetLink,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'google',
        error: error.message,
      };
    }
  }

  /**
   * Create event on Outlook Calendar
   */
  async createOutlookEvent(
    accessToken: string,
    event: UnifiedCalendarEvent,
    calendarId?: string
  ): Promise<CalendarEventResult> {
    try {
      const outlook = getOutlookCalendar();
      outlook.setAccessToken(accessToken);

      const result = await outlook.createEvent(
        {
          subject: event.summary,
          body: event.description ? {
            contentType: 'text',
            content: event.description,
          } : undefined,
          location: event.location ? {
            displayName: event.location,
          } : undefined,
          start: event.start,
          end: event.end,
          timeZone: event.timeZone,
          attendees: event.attendees?.map(a => ({
            email: a.email,
            name: a.name,
            type: a.optional ? 'optional' : 'required',
          })),
          isOnlineMeeting: event.createVideoMeeting,
          onlineMeetingProvider: event.createVideoMeeting ? 'teamsForBusiness' : undefined,
          reminder: event.reminders?.[0]?.minutes,
        },
        calendarId
      );

      return {
        success: true,
        provider: 'outlook',
        eventId: result.id,
        webLink: result.webLink,
        meetingLink: result.onlineMeeting?.joinUrl,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'outlook',
        error: error.message,
      };
    }
  }

  /**
   * Schedule an interview
   */
  async scheduleInterview(
    provider: CalendarProvider,
    accessToken: string,
    interview: {
      title: string;
      description?: string;
      start: Date;
      end: Date;
      timeZone?: string;
      candidateEmail: string;
      candidateName?: string;
      interviewerEmails: string[];
      location?: string;
      createVideoMeeting?: boolean;
    }
  ): Promise<CalendarEventResult> {
    const event: UnifiedCalendarEvent = {
      summary: interview.title,
      description: interview.description,
      location: interview.location,
      start: interview.start,
      end: interview.end,
      timeZone: interview.timeZone,
      attendees: [
        {
          email: interview.candidateEmail,
          name: interview.candidateName,
        },
        ...interview.interviewerEmails.map(email => ({ email })),
      ],
      createVideoMeeting: interview.createVideoMeeting ?? true,
      reminders: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    };

    if (provider === 'google') {
      return this.createGoogleEvent(accessToken, event);
    } else {
      return this.createOutlookEvent(accessToken, event);
    }
  }

  /**
   * Get available time slots from Google Calendar
   */
  async getGoogleAvailability(
    accessToken: string,
    calendars: string[],
    startDate: Date,
    endDate: Date,
    slotDuration: number,
    options?: {
      workingHoursStart?: number;
      workingHoursEnd?: number;
      excludeWeekends?: boolean;
      timeZone?: string;
    }
  ): Promise<AvailabilitySlot[]> {
    const google = getGoogleCalendar();
    google.setCredentials({ accessToken });

    return google.findAvailableSlots(
      calendars,
      startDate,
      endDate,
      slotDuration,
      options
    );
  }

  /**
   * Get available time slots from Outlook Calendar
   */
  async getOutlookAvailability(
    accessToken: string,
    schedules: string[],
    startDate: Date,
    endDate: Date,
    slotDuration: number,
    options?: {
      workingHoursStart?: number;
      workingHoursEnd?: number;
      excludeWeekends?: boolean;
      timeZone?: string;
    }
  ): Promise<AvailabilitySlot[]> {
    const outlook = getOutlookCalendar();
    outlook.setAccessToken(accessToken);

    const scheduleInfo = await outlook.getSchedule(
      schedules,
      startDate,
      endDate,
      options?.timeZone
    );

    // Convert availability view to slots
    const slots: AvailabilitySlot[] = [];
    const slotMs = slotDuration * 60 * 1000;

    for (const schedule of scheduleInfo) {
      // Parse availability view (string of 0s and 1s)
      const view = schedule.availabilityView;
      let current = new Date(startDate);
      const intervalMs = 30 * 60 * 1000; // 30-minute intervals

      for (let i = 0; i < view.length; i++) {
        const status = view[i];
        const slotEnd = new Date(current.getTime() + slotMs);

        // Check working hours if specified
        const hour = current.getHours();
        const day = current.getDay();
        const isWeekend = day === 0 || day === 6;

        if (
          (options?.excludeWeekends && isWeekend) ||
          (options?.workingHoursStart !== undefined && hour < options.workingHoursStart) ||
          (options?.workingHoursEnd !== undefined && hour >= options.workingHoursEnd)
        ) {
          current = new Date(current.getTime() + intervalMs);
          continue;
        }

        // 0 = free, 1 = tentative, 2 = busy, 3 = out of office, 4 = working elsewhere
        const available = status === '0';

        slots.push({
          start: new Date(current),
          end: slotEnd,
          available,
        });

        current = new Date(current.getTime() + intervalMs);
      }
    }

    return slots;
  }

  /**
   * Cancel an event
   */
  async cancelEvent(
    provider: CalendarProvider,
    accessToken: string,
    eventId: string,
    calendarId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (provider === 'google') {
        const google = getGoogleCalendar();
        google.setCredentials({ accessToken });
        await google.deleteEvent(eventId, calendarId || 'primary');
      } else {
        const outlook = getOutlookCalendar();
        outlook.setAccessToken(accessToken);
        await outlook.deleteEvent(eventId, calendarId);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
let calendarService: CalendarService | null = null;

export function getCalendarService(): CalendarService {
  if (!calendarService) {
    calendarService = new CalendarService();
  }
  return calendarService;
}

// Re-exports
export { GoogleCalendarService, OutlookCalendarService };
export { getGoogleCalendar, initGoogleCalendar } from './google';
export { getOutlookCalendar, initOutlookCalendar } from './outlook';

export default CalendarService;
