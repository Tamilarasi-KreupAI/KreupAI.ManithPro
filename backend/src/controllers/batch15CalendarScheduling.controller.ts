import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 3.1.1-3.1.5 - CALENDAR INTEGRATIONS
// ============================================

export const connectCalendar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { provider, name, email, accessToken, refreshToken, tokenExpiry, calendarUrl, timezone } = req.body;

    const integration = await prisma.calendarIntegration.create({
      data: {
        userId: userId!,
        provider,
        name,
        email,
        accessToken,
        refreshToken,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
        calendarUrl,
        timezone: timezone || 'UTC',
        syncStatus: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error connecting calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect calendar'
    });
  }
};

export const getCalendarIntegrations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const integrations = await prisma.calendarIntegration.findMany({
      where: { userId },
      include: {
        _count: { select: { events: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: integrations
    });
  } catch (error) {
    console.error('Error fetching calendar integrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar integrations'
    });
  }
};

export const updateCalendarIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const integration = await prisma.calendarIntegration.update({
      where: { id },
      data: updates
    });

    res.json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error updating calendar integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update calendar integration'
    });
  }
};

export const disconnectCalendar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.calendarIntegration.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Calendar disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect calendar'
    });
  }
};

export const syncCalendar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // In production, this would trigger actual calendar sync
    const integration = await prisma.calendarIntegration.update({
      where: { id },
      data: {
        syncStatus: 'SYNCING',
        lastSyncAt: new Date()
      }
    });

    // Simulate sync completion
    setTimeout(async () => {
      await prisma.calendarIntegration.update({
        where: { id },
        data: { syncStatus: 'SYNCED' }
      });
    }, 2000);

    res.json({
      success: true,
      data: integration,
      message: 'Calendar sync initiated'
    });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync calendar'
    });
  }
};

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, calendarId } = req.query;

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        ...(calendarId && { calendarId: calendarId as string }),
        startTime: {
          gte: startDate ? new Date(startDate as string) : new Date(),
          lte: endDate ? new Date(endDate as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        calendar: { select: { name: true, provider: true, color: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events'
    });
  }
};

export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { calendarId, title, description, location, startTime, endTime, timezone, attendees } = req.body;

    const event = await prisma.calendarEvent.create({
      data: {
        userId: userId!,
        calendarId,
        title,
        description,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timezone: timezone || 'UTC',
        attendees,
        syncStatus: 'PENDING_SYNC'
      }
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create calendar event'
    });
  }
};

// ============================================
// 3.1.6 - CALENDAR CONFLICT DETECTION
// ============================================

export const detectConflicts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        startTime: { gte: start },
        endTime: { lte: end }
      },
      orderBy: { startTime: 'asc' }
    });

    const conflicts: any[] = [];

    // Check for overlapping events
    for (let i = 0; i < events.length - 1; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        if (event1.endTime > event2.startTime && event1.startTime < event2.endTime) {
          const overlapStart = new Date(Math.max(event1.startTime.getTime(), event2.startTime.getTime()));
          const overlapEnd = new Date(Math.min(event1.endTime.getTime(), event2.endTime.getTime()));
          const overlapMinutes = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / 60000);

          conflicts.push({
            event1Id: event1.id,
            event2Id: event2.id,
            event1Title: event1.title,
            event2Title: event2.title,
            event1Start: event1.startTime,
            event1End: event1.endTime,
            event2Start: event2.startTime,
            event2End: event2.endTime,
            conflictType: 'OVERLAP',
            overlapMinutes,
            severity: overlapMinutes > 30 ? 'HIGH' : overlapMinutes > 15 ? 'MEDIUM' : 'LOW'
          });
        }
      }
    }

    // Store detected conflicts
    for (const conflict of conflicts) {
      await prisma.calendarConflict.create({
        data: {
          userId: userId!,
          ...conflict
        }
      });
    }

    res.json({
      success: true,
      data: {
        conflicts,
        totalConflicts: conflicts.length
      }
    });
  } catch (error) {
    console.error('Error detecting conflicts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect conflicts'
    });
  }
};

export const getConflicts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    const conflicts = await prisma.calendarConflict.findMany({
      where: {
        userId,
        ...(status && { status: status as string })
      },
      orderBy: { detectedAt: 'desc' }
    });

    res.json({
      success: true,
      data: conflicts
    });
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conflicts'
    });
  }
};

export const resolveConflict = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const userId = req.user?.id;

    const conflict = await prisma.calendarConflict.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution,
        resolvedAt: new Date(),
        resolvedBy: userId
      }
    });

    res.json({
      success: true,
      data: conflict
    });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve conflict'
    });
  }
};

// ============================================
// 3.1.7 - BUFFER TIME SETTINGS
// ============================================

export const getBufferSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    let settings = await prisma.bufferTimeSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.bufferTimeSettings.create({
        data: {
          userId: userId!,
          beforeMeeting: 0,
          afterMeeting: 0,
          beforeInterview: 15,
          afterInterview: 10
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching buffer settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buffer settings'
    });
  }
};

export const updateBufferSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    const settings = await prisma.bufferTimeSettings.upsert({
      where: { userId },
      create: {
        userId: userId!,
        ...updates
      },
      update: updates
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating buffer settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update buffer settings'
    });
  }
};

// ============================================
// 3.1.8 - WORKING HOURS CONFIGURATION
// ============================================

export const getWorkingHours = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const workingHours = await prisma.workingHours.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });

    res.json({
      success: true,
      data: workingHours
    });
  } catch (error) {
    console.error('Error fetching working hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch working hours'
    });
  }
};

export const createWorkingHours = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const data = req.body;

    const workingHours = await prisma.workingHours.create({
      data: {
        userId: userId!,
        name: data.name || 'Default',
        timezone: data.timezone || 'UTC',
        isDefault: data.isDefault || false,
        monday: data.monday || { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        tuesday: data.tuesday || { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        wednesday: data.wednesday || { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        thursday: data.thursday || { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        friday: data.friday || { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        saturday: data.saturday || { enabled: false, slots: [] },
        sunday: data.sunday || { enabled: false, slots: [] },
        minNoticeHours: data.minNoticeHours || 24,
        maxAdvanceDays: data.maxAdvanceDays || 30,
        slotDuration: data.slotDuration || 30,
        slotIncrement: data.slotIncrement || 15,
        lunchStart: data.lunchStart,
        lunchEnd: data.lunchEnd,
        excludeLunch: data.excludeLunch !== false
      }
    });

    res.status(201).json({
      success: true,
      data: workingHours
    });
  } catch (error) {
    console.error('Error creating working hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create working hours'
    });
  }
};

export const updateWorkingHours = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const workingHours = await prisma.workingHours.update({
      where: { id },
      data: updates
    });

    res.json({
      success: true,
      data: workingHours
    });
  } catch (error) {
    console.error('Error updating working hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update working hours'
    });
  }
};

// ============================================
// 3.1.9 - HOLIDAY CALENDAR
// ============================================

export const getHolidays = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { country, year } = req.query;

    const startOfYear = year ? new Date(`${year}-01-01`) : new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = year ? new Date(`${year}-12-31`) : new Date(new Date().getFullYear(), 11, 31);

    const holidays = await prisma.holidayCalendar.findMany({
      where: {
        OR: [
          { userId },
          { scope: 'GLOBAL' },
          { scope: 'COMPANY' }
        ],
        ...(country && { country: country as string }),
        date: { gte: startOfYear, lte: endOfYear }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      success: true,
      data: holidays
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays'
    });
  }
};

export const addHoliday = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, date, endDate, type, country, region, blockEntireDay } = req.body;

    const holiday = await prisma.holidayCalendar.create({
      data: {
        userId,
        name,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        type,
        country,
        region,
        blockEntireDay: blockEntireDay !== false
      }
    });

    res.status(201).json({
      success: true,
      data: holiday
    });
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add holiday'
    });
  }
};

export const importHolidaysForRegion = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { country, year } = req.body;

    // In production, this would fetch from a holidays API
    // For now, create some sample holidays
    const sampleHolidays = [
      { name: 'New Year\'s Day', date: `${year}-01-01`, type: 'PUBLIC' },
      { name: 'Independence Day', date: `${year}-07-04`, type: 'PUBLIC' },
      { name: 'Thanksgiving', date: `${year}-11-28`, type: 'PUBLIC' },
      { name: 'Christmas Day', date: `${year}-12-25`, type: 'PUBLIC' }
    ];

    const created = [];
    for (const holiday of sampleHolidays) {
      const h = await prisma.holidayCalendar.create({
        data: {
          userId,
          name: holiday.name,
          date: new Date(holiday.date),
          type: holiday.type,
          country,
          isOfficial: true,
          source: 'IMPORT'
        }
      });
      created.push(h);
    }

    res.status(201).json({
      success: true,
      data: created,
      message: `Imported ${created.length} holidays`
    });
  } catch (error) {
    console.error('Error importing holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import holidays'
    });
  }
};

// ============================================
// 3.2.1 - SELF-SCHEDULING LINKS
// ============================================

export const createSchedulingLink = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const data = req.body;

    const link = await prisma.schedulingLink.create({
      data: {
        userId: userId!,
        slug: data.slug || `meeting-${Date.now()}`,
        name: data.name,
        description: data.description,
        meetingType: data.meetingType,
        duration: data.duration,
        location: data.location,
        bufferBefore: data.bufferBefore || 0,
        bufferAfter: data.bufferAfter || 0,
        minNotice: data.minNotice || 24,
        maxAdvance: data.maxAdvance || 30,
        maxBookingsPerDay: data.maxBookingsPerDay,
        maxBookingsPerWeek: data.maxBookingsPerWeek,
        requireConfirmation: data.requireConfirmation || false,
        autoConfirm: data.autoConfirm !== false,
        questions: data.questions,
        notifyOnBooking: data.notifyOnBooking !== false,
        brandColor: data.brandColor,
        welcomeMessage: data.welcomeMessage,
        jobId: data.jobId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      }
    });

    res.status(201).json({
      success: true,
      data: link
    });
  } catch (error) {
    console.error('Error creating scheduling link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scheduling link'
    });
  }
};

export const getSchedulingLinks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const links = await prisma.schedulingLink.findMany({
      where: { userId },
      include: {
        _count: { select: { bookings: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error fetching scheduling links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduling links'
    });
  }
};

export const getSchedulingLinkBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const link = await prisma.schedulingLink.findUnique({
      where: { slug },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Scheduling link not found'
      });
    }

    // Increment view count
    await prisma.schedulingLink.update({
      where: { id: link.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: link
    });
  } catch (error) {
    console.error('Error fetching scheduling link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduling link'
    });
  }
};

export const getAvailableSlotsForLink = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { date, timezone } = req.query;

    const link = await prisma.schedulingLink.findUnique({
      where: { slug },
      include: {
        user: {
          include: {
            workingHours: { where: { isDefault: true } },
            bufferTimeSettings: true
          }
        }
      }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Scheduling link not found'
      });
    }

    // Generate available slots (simplified)
    const targetDate = date ? new Date(date as string) : new Date();
    const slots = [];
    const workingHours = link.user.workingHours[0];

    if (workingHours) {
      const daySchedule = (workingHours as any)[targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()];
      if (daySchedule?.enabled) {
        for (const slot of daySchedule.slots || []) {
          const [startHour, startMin] = slot.start.split(':').map(Number);
          const [endHour, endMin] = slot.end.split(':').map(Number);

          let currentTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;

          while (currentTime + link.duration <= endTime) {
            const slotStart = new Date(targetDate);
            slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + link.duration);

            slots.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              available: true
            });

            currentTime += link.duration + (link.bufferAfter || 0);
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        timezone: timezone || 'UTC',
        slots
      }
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots'
    });
  }
};

export const bookSlot = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { bookerEmail, bookerName, bookerPhone, bookerTimezone, startTime, responses } = req.body;

    const link = await prisma.schedulingLink.findUnique({
      where: { slug }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Scheduling link not found'
      });
    }

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + link.duration);

    const booking = await prisma.schedulingBooking.create({
      data: {
        linkId: link.id,
        bookerEmail,
        bookerName,
        bookerPhone,
        bookerTimezone,
        startTime: start,
        endTime: end,
        status: link.autoConfirm ? 'CONFIRMED' : 'PENDING',
        responses,
        confirmationToken: link.requireConfirmation ? `confirm-${Date.now()}` : null,
        confirmedAt: link.autoConfirm ? new Date() : null
      }
    });

    // Update booking count
    await prisma.schedulingLink.update({
      where: { id: link.id },
      data: { bookingCount: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book slot'
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, startDate, endDate } = req.query;

    const bookings = await prisma.schedulingBooking.findMany({
      where: {
        link: { userId },
        ...(status && { status: status as string }),
        ...(startDate && { startTime: { gte: new Date(startDate as string) } }),
        ...(endDate && { endTime: { lte: new Date(endDate as string) } })
      },
      include: {
        link: { select: { name: true, meetingType: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// ============================================
// 3.2.2 - AUTO-AVAILABILITY DETECTION
// ============================================

export const generateAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, duration } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get working hours and existing events
    const [workingHours, events, bufferSettings] = await Promise.all([
      prisma.workingHours.findFirst({ where: { userId, isDefault: true } }),
      prisma.calendarEvent.findMany({
        where: {
          userId,
          startTime: { gte: start },
          endTime: { lte: end }
        }
      }),
      prisma.bufferTimeSettings.findUnique({ where: { userId } })
    ]);

    const slots: any[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = workingHours ? (workingHours as any)[dayName] : null;

      if (daySchedule?.enabled) {
        for (const timeSlot of daySchedule.slots || []) {
          const [startHour, startMin] = timeSlot.start.split(':').map(Number);
          const [endHour, endMin] = timeSlot.end.split(':').map(Number);

          let currentMinute = startHour * 60 + startMin;
          const endMinute = endHour * 60 + endMin;
          const slotDuration = duration || 30;

          while (currentMinute + slotDuration <= endMinute) {
            const slotStart = new Date(currentDate);
            slotStart.setHours(Math.floor(currentMinute / 60), currentMinute % 60, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

            // Check for conflicts
            const hasConflict = events.some(event =>
              (slotStart < event.endTime && slotEnd > event.startTime)
            );

            slots.push({
              date: currentDate.toISOString().split('T')[0],
              startTime: slotStart,
              endTime: slotEnd,
              status: hasConflict ? 'BUSY' : 'AVAILABLE',
              source: 'WORKING_HOURS',
              hasConflict
            });

            currentMinute += slotDuration;
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Store availability slots
    const created = await Promise.all(
      slots.slice(0, 100).map(slot =>
        prisma.availabilitySlot.create({
          data: {
            userId: userId!,
            date: new Date(slot.date),
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status,
            source: slot.source,
            hasConflict: slot.hasConflict,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        })
      )
    );

    res.status(201).json({
      success: true,
      data: {
        slots: created,
        totalSlots: created.length,
        availableSlots: created.filter(s => s.status === 'AVAILABLE').length
      }
    });
  } catch (error) {
    console.error('Error generating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate availability'
    });
  }
};

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, status } = req.query;

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        userId,
        ...(status && { status: status as string }),
        date: {
          gte: startDate ? new Date(startDate as string) : new Date(),
          lte: endDate ? new Date(endDate as string) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability'
    });
  }
};

// ============================================
// 3.2.3 - PANEL INTERVIEW COORDINATOR
// ============================================

export const createPanelSession = async (req: Request, res: Response) => {
  try {
    const organizerId = req.user?.id;
    const { name, description, duration, jobId, applicationId, candidateName, candidateEmail, panelists, preferredDates } = req.body;

    const session = await prisma.panelSession.create({
      data: {
        organizerId: organizerId!,
        name,
        description,
        duration,
        jobId,
        applicationId,
        candidateName,
        candidateEmail,
        preferredDates,
        status: 'SCHEDULING'
      }
    });

    // Add panelists
    if (panelists && panelists.length > 0) {
      for (const panelist of panelists) {
        await prisma.panelMember.create({
          data: {
            sessionId: session.id,
            userId: panelist.userId,
            role: panelist.role || 'PANELIST',
            isRequired: panelist.isRequired !== false
          }
        });
      }
    }

    const sessionWithPanelists = await prisma.panelSession.findUnique({
      where: { id: session.id },
      include: {
        panelists: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: sessionWithPanelists
    });
  } catch (error) {
    console.error('Error creating panel session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create panel session'
    });
  }
};

export const getPanelSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    const sessions = await prisma.panelSession.findMany({
      where: {
        OR: [
          { organizerId: userId },
          { panelists: { some: { userId } } }
        ],
        ...(status && { status: status as string })
      },
      include: {
        panelists: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } }
        },
        organizer: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching panel sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch panel sessions'
    });
  }
};

export const submitPanelAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const { availableSlots, preferredSlots, unavailableDates } = req.body;

    const member = await prisma.panelMember.update({
      where: {
        sessionId_userId: { sessionId, userId: userId! }
      },
      data: {
        availabilitySubmitted: true,
        availableSlots,
        preferredSlots,
        unavailableDates,
        responseStatus: 'ACCEPTED',
        respondedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error submitting panel availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit panel availability'
    });
  }
};

export const findOptimalPanelTime = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.panelSession.findUnique({
      where: { id: sessionId },
      include: {
        panelists: true
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Panel session not found'
      });
    }

    // Find common availability (simplified)
    const allSlots: any[] = [];
    for (const member of session.panelists) {
      if (member.availableSlots) {
        allSlots.push(...(member.availableSlots as any[]));
      }
    }

    // Find overlapping slots
    const slotCounts = new Map();
    for (const slot of allSlots) {
      const key = `${slot.startTime}-${slot.endTime}`;
      slotCounts.set(key, (slotCounts.get(key) || 0) + 1);
    }

    const optimalSlots = [...slotCounts.entries()]
      .filter(([_, count]) => count >= session.minPanelistsRequired)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const [startTime, endTime] = key.split('-');
        return { startTime, endTime, panelistsAvailable: count };
      });

    res.json({
      success: true,
      data: {
        sessionId,
        optimalSlots,
        totalPanelists: session.panelists.length,
        minRequired: session.minPanelistsRequired
      }
    });
  } catch (error) {
    console.error('Error finding optimal panel time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find optimal panel time'
    });
  }
};

export const schedulePanelSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { startTime, endTime, meetingLink, location } = req.body;

    const session = await prisma.panelSession.update({
      where: { id: sessionId },
      data: {
        scheduledStartTime: new Date(startTime),
        scheduledEndTime: new Date(endTime),
        meetingLink,
        location,
        status: 'SCHEDULED',
        invitesSentAt: new Date()
      },
      include: {
        panelists: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } }
        }
      }
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error scheduling panel session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule panel session'
    });
  }
};

// ============================================
// 3.2.4 - TIMEZONE INTELLIGENCE
// ============================================

export const getTimezonePreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    let prefs = await prisma.timezonePreference.findUnique({
      where: { userId }
    });

    if (!prefs) {
      prefs = await prisma.timezonePreference.create({
        data: {
          userId: userId!,
          primaryTimezone: 'UTC',
          autoDetect: true
        }
      });
    }

    res.json({
      success: true,
      data: prefs
    });
  } catch (error) {
    console.error('Error fetching timezone preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timezone preferences'
    });
  }
};

export const updateTimezonePreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    const prefs = await prisma.timezonePreference.upsert({
      where: { userId },
      create: {
        userId: userId!,
        ...updates
      },
      update: updates
    });

    res.json({
      success: true,
      data: prefs
    });
  } catch (error) {
    console.error('Error updating timezone preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timezone preferences'
    });
  }
};

export const detectTimezone = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { detectedTimezone } = req.body;

    const prefs = await prisma.timezonePreference.upsert({
      where: { userId },
      create: {
        userId: userId!,
        primaryTimezone: detectedTimezone,
        lastDetectedTimezone: detectedTimezone,
        lastDetectedAt: new Date()
      },
      update: {
        lastDetectedTimezone: detectedTimezone,
        lastDetectedAt: new Date(),
        ...(await prisma.timezonePreference.findUnique({ where: { userId } })?.then(p => p?.autoDetect ? { primaryTimezone: detectedTimezone } : {}))
      }
    });

    res.json({
      success: true,
      data: prefs
    });
  } catch (error) {
    console.error('Error detecting timezone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect timezone'
    });
  }
};

export const convertTimezone = async (req: Request, res: Response) => {
  try {
    const { dateTime, fromTimezone, toTimezone } = req.body;

    // In production, use a proper timezone library like luxon or moment-timezone
    const date = new Date(dateTime);

    res.json({
      success: true,
      data: {
        original: {
          dateTime,
          timezone: fromTimezone
        },
        converted: {
          dateTime: date.toISOString(),
          timezone: toTimezone,
          formatted: date.toLocaleString('en-US', { timeZone: toTimezone })
        }
      }
    });
  } catch (error) {
    console.error('Error converting timezone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert timezone'
    });
  }
};
