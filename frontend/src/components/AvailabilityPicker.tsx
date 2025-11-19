import React, { useState } from 'react';

interface TimeSlot {
  start: string; // HH:MM format
  end: string;
}

interface DayAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  slots: TimeSlot[];
  isAvailable: boolean;
}

interface AvailabilityPickerProps {
  onSave: (availability: DayAvailability[]) => void;
  initialAvailability?: DayAvailability[];
  timezone?: string;
}

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  onSave,
  initialAvailability,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
}) => {
  const daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' },
  ];

  const defaultAvailability: DayAvailability[] = daysOfWeek.map(day => ({
    dayOfWeek: day.value as DayAvailability['dayOfWeek'],
    slots: day.value >= 1 && day.value <= 5 ? [{ start: '09:00', end: '17:00' }] : [],
    isAvailable: day.value >= 1 && day.value <= 5,
  }));

  const [availability, setAvailability] = useState<DayAvailability[]>(
    initialAvailability || defaultAvailability
  );

  const toggleDayAvailability = (dayIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].isAvailable = !newAvailability[dayIndex].isAvailable;
    if (newAvailability[dayIndex].isAvailable && newAvailability[dayIndex].slots.length === 0) {
      newAvailability[dayIndex].slots = [{ start: '09:00', end: '17:00' }];
    }
    setAvailability(newAvailability);
  };

  const addTimeSlot = (dayIndex: number) => {
    const newAvailability = [...availability];
    const lastSlot = newAvailability[dayIndex].slots[newAvailability[dayIndex].slots.length - 1];
    const newStart = lastSlot ? lastSlot.end : '09:00';
    const newEnd = lastSlot ? addHours(lastSlot.end, 1) : '10:00';
    newAvailability[dayIndex].slots.push({ start: newStart, end: newEnd });
    setAvailability(newAvailability);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(newAvailability);
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots[slotIndex][field] = value;
    setAvailability(newAvailability);
  };

  const addHours = (time: string, hours: number): string => {
    const [h, m] = time.split(':').map(Number);
    const newHour = (h + hours) % 24;
    return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const applyToAllWeekdays = () => {
    const mondayAvailability = availability[1];
    const newAvailability = availability.map((day, index) => {
      if (index >= 1 && index <= 5) {
        return {
          ...day,
          isAvailable: mondayAvailability.isAvailable,
          slots: JSON.parse(JSON.stringify(mondayAvailability.slots)),
        };
      }
      return day;
    });
    setAvailability(newAvailability);
  };

  const handleSave = () => {
    onSave(availability);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set Your Availability</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Timezone: <span className="font-medium">{timezone}</span>
            </p>
          </div>
          <button
            onClick={applyToAllWeekdays}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Apply Monday's schedule to all weekdays"
          >
            Copy Mon to All Weekdays
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {availability.map((day, dayIndex) => {
          const dayInfo = daysOfWeek[dayIndex];
          return (
            <div
              key={dayIndex}
              className={`border-2 rounded-lg p-4 transition-all ${
                day.isAvailable
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDayAvailability(dayIndex)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      day.isAvailable ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={`Toggle ${dayInfo.label} availability`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        day.isAvailable ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">
                    {dayInfo.label}
                  </span>
                </div>
                {day.isAvailable && (
                  <button
                    onClick={() => addTimeSlot(dayIndex)}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Slot
                  </button>
                )}
              </div>

              {day.isAvailable && (
                <div className="space-y-2 ml-15">
                  {day.slots.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No time slots added. Click "Add Slot" to create one.
                    </p>
                  ) : (
                    day.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                          <span className="text-gray-500 dark:text-gray-400">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {calculateDuration(slot.start, slot.end)}
                          </span>
                        </div>
                        {day.slots.length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Remove time slot"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {!day.isAvailable && (
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-15">Unavailable</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <strong>{availability.filter(d => d.isAvailable).length}</strong> days available •{' '}
          <strong>{availability.reduce((sum, d) => sum + d.slots.length, 0)}</strong> time slots total
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          Save Availability
        </button>
      </div>
    </div>
  );
};

function calculateDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const diff = endMins - startMins;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export default AvailabilityPicker;
