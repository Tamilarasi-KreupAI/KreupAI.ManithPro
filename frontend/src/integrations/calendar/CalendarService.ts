// ============================================================
// CALENDAR SERVICE - Base calendar integration service
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  CalendarEvent,
  CalendarAvailability,
  CalendarSyncResult,
  CalendarAttendee,
  CalendarReminder,
  CalendarProvider,
} from '../types';

// ============================================
// Calendar Service Interface
// ============================================
export interface ICalendarService {
  // Events
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  getEvent(eventId: string): Promise<CalendarEvent | null>;
  createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;

  // Availability
  getAvailability(startDate: Date, endDate: Date, userIds?: string[]): Promise<CalendarAvailability[]>;
  findAvailableSlots(
    duration: number,
    startDate: Date,
    endDate: Date,
    attendeeEmails: string[]
  ): Promise<Array<{ start: Date; end: Date }>>;

  // Sync
  syncEvents(): Promise<CalendarSyncResult>;
}

// ============================================
// Base Calendar Service
// ============================================
export abstract class CalendarService
  extends BaseIntegrationService
  implements ICalendarService
{
  protected provider: CalendarProvider;
  protected calendarId: string = 'primary';
  protected syncToken: string | null = null;

  constructor(
    config: Partial<IntegrationConfig>,
    provider: CalendarProvider
  ) {
    super({
      ...config,
      category: 'calendar',
    });
    this.provider = provider;
  }

  // ============================================
  // Abstract Methods
  // ============================================

  abstract getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  abstract getEvent(eventId: string): Promise<CalendarEvent | null>;
  abstract createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  abstract updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  abstract deleteEvent(eventId: string): Promise<void>;
  abstract getAvailability(
    startDate: Date,
    endDate: Date,
    userIds?: string[]
  ): Promise<CalendarAvailability[]>;
  abstract syncEvents(): Promise<CalendarSyncResult>;

  // ============================================
  // Common Methods
  // ============================================

  async findAvailableSlots(
    durationMinutes: number,
    startDate: Date,
    endDate: Date,
    attendeeEmails: string[]
  ): Promise<Array<{ start: Date; end: Date }>> {
    // Get busy times for all attendees
    const busyTimes = await this.getAvailability(startDate, endDate, attendeeEmails);

    // Find free slots
    const slots: Array<{ start: Date; end: Date }> = [];
    const duration = durationMinutes * 60 * 1000; // Convert to ms

    // Sort busy times
    const sortedBusy = busyTimes
      .filter((b) => b.busy)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let currentStart = startDate;

    for (const busy of sortedBusy) {
      // Check if there's a gap before this busy period
      const gap = busy.start.getTime() - currentStart.getTime();

      if (gap >= duration) {
        // Split gap into slots
        let slotStart = currentStart;
        while (slotStart.getTime() + duration <= busy.start.getTime()) {
          slots.push({
            start: new Date(slotStart),
            end: new Date(slotStart.getTime() + duration),
          });
          slotStart = new Date(slotStart.getTime() + duration);
        }
      }

      // Move current start past busy period
      if (busy.end > currentStart) {
        currentStart = busy.end;
      }
    }

    // Check for slots after last busy period
    if (currentStart.getTime() + duration <= endDate.getTime()) {
      let slotStart = currentStart;
      while (slotStart.getTime() + duration <= endDate.getTime()) {
        slots.push({
          start: new Date(slotStart),
          end: new Date(slotStart.getTime() + duration),
        });
        slotStart = new Date(slotStart.getTime() + duration);
      }
    }

    return slots;
  }

  // Set which calendar to use
  setCalendarId(calendarId: string): void {
    this.calendarId = calendarId;
  }

  getCalendarId(): string {
    return this.calendarId;
  }

  // ============================================
  // Helper Methods
  // ============================================

  protected formatEventForApi(event: Omit<CalendarEvent, 'id'>): Record<string, unknown> {
    return {
      title: event.title,
      description: event.description,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      timezone: event.timezone,
      location: event.location,
      attendees: event.attendees.map((a) => ({
        email: a.email,
        name: a.name,
        required: a.required,
      })),
      conferenceType: event.conferenceType,
      reminders: event.reminders,
      metadata: event.metadata,
    };
  }

  protected parseEventFromApi(data: Record<string, unknown>): CalendarEvent {
    return {
      id: String(data.id || ''),
      title: String(data.title || data.summary || ''),
      description: String(data.description || ''),
      start: new Date(data.start as string),
      end: new Date(data.end as string),
      timezone: String(data.timezone || 'UTC'),
      location: data.location as string | undefined,
      attendees: this.parseAttendees(data.attendees),
      conferenceLink: data.conferenceLink as string | undefined,
      conferenceType: data.conferenceType as CalendarEvent['conferenceType'],
      status: (data.status as CalendarEvent['status']) || 'confirmed',
      reminders: this.parseReminders(data.reminders),
      metadata: data.metadata as Record<string, unknown> | undefined,
    };
  }

  protected parseAttendees(attendees: unknown): CalendarAttendee[] {
    if (!Array.isArray(attendees)) return [];

    return attendees.map((a: Record<string, unknown>) => ({
      email: String(a.email || ''),
      name: a.name as string | undefined,
      status: (a.responseStatus || a.status || 'pending') as CalendarAttendee['status'],
      required: Boolean(a.optional !== true),
    }));
  }

  protected parseReminders(reminders: unknown): CalendarReminder[] | undefined {
    if (!reminders || !Array.isArray(reminders)) return undefined;

    return reminders.map((r: Record<string, unknown>) => ({
      method: (r.method || 'popup') as CalendarReminder['method'],
      minutes: Number(r.minutes || 15),
    }));
  }
}

// ============================================
// Interview Scheduling Helpers
// ============================================
export interface ScheduleInterviewOptions {
  title: string;
  description?: string;
  durationMinutes: number;
  candidateEmail: string;
  candidateName: string;
  interviewerEmails: string[];
  preferredTimes?: Array<{ start: Date; end: Date }>;
  timezone?: string;
  createConference?: boolean;
  conferenceType?: 'zoom' | 'meet' | 'teams';
  reminderMinutes?: number[];
}

export interface ScheduledInterview extends CalendarEvent {
  candidateEmail: string;
  interviewerEmails: string[];
}

export const createInterviewEvent = (
  options: ScheduleInterviewOptions,
  selectedSlot: { start: Date; end: Date }
): Omit<CalendarEvent, 'id'> => {
  const attendees: CalendarAttendee[] = [
    {
      email: options.candidateEmail,
      name: options.candidateName,
      status: 'pending',
      required: true,
    },
    ...options.interviewerEmails.map((email) => ({
      email,
      status: 'pending' as const,
      required: true,
    })),
  ];

  const reminders: CalendarReminder[] = (options.reminderMinutes || [15, 60]).map(
    (minutes) => ({
      method: 'email' as const,
      minutes,
    })
  );

  return {
    title: options.title,
    description: options.description,
    start: selectedSlot.start,
    end: selectedSlot.end,
    timezone: options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    attendees,
    conferenceType: options.createConference ? options.conferenceType : undefined,
    status: 'confirmed',
    reminders,
    metadata: {
      type: 'interview',
      candidateEmail: options.candidateEmail,
      interviewerEmails: options.interviewerEmails,
    },
  };
};

export default CalendarService;
