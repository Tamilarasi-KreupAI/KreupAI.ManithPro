// ============================================================
// CALENDAR MODULE - Calendar integration exports
// ============================================================

export {
  CalendarService,
  createInterviewEvent,
  type ICalendarService,
  type ScheduleInterviewOptions,
  type ScheduledInterview,
} from './CalendarService';

export {
  GoogleCalendarService,
  OutlookCalendarService,
  calendarProviders,
} from './providers';
