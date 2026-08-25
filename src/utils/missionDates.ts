/**
 * Mission 148 Timeline Constants & Utilities
 * Mission Start: 25 August 2026 (Day 1)
 * Mission End: 19 January 2027 (Day 148)
 * Target JEE Main: 21 January 2027
 */

export const MISSION_START_DATE_STR = '2026-08-25';
export const MISSION_END_DATE_STR = '2027-01-19';
export const JEE_MAIN_EXAM_DATE_STR = '2027-01-21';
export const TOTAL_MISSION_DAYS = 148;

// Create clean UTC/Local midnight date instances
export const MISSION_START_DATE = new Date(2026, 7, 25); // Aug 25, 2026 (month is 0-indexed: 7 is August)
export const MISSION_END_DATE = new Date(2027, 0, 19); // Jan 19, 2027
export const JEE_MAIN_EXAM_DATE = new Date(2027, 0, 21); // Jan 21, 2027

export interface MissionDayInfo {
  dayNumber: number;
  dateStr: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "25 August 2026"
  shortDate: string; // e.g. "25 Aug"
  dayOfWeek: string; // e.g. "Tuesday"
  daysRemainingInMission: number;
}

/**
 * Returns date object for dayNumber (1-148)
 */
export function getDateForDayNumber(dayNumber: number): Date {
  const clampedDay = Math.max(1, Math.min(TOTAL_MISSION_DAYS, dayNumber));
  const date = new Date(2026, 7, 25); // August 25, 2026 as Day 1
  date.setDate(date.getDate() + (clampedDay - 1));
  return date;
}

/**
 * Formats a Date to YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a date string (YYYY-MM-DD) or Date to readable format
 */
export function formatReadableDate(input: string | Date, options?: { includeYear?: boolean; includeDay?: boolean }): string {
  let date: Date;
  if (typeof input === 'string') {
    const parts = input.split('-');
    if (parts.length === 3) {
      date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      date = new Date(input);
    }
  } else {
    date = input;
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  if (options?.includeDay) {
    return `${dayName}, ${day} ${monthName} ${year}`;
  }
  return `${day} ${monthName} ${year}`;
}

/**
 * Get comprehensive info for a dayNumber (1 to 148)
 */
export function getMissionDayInfo(dayNumber: number): MissionDayInfo {
  const date = getDateForDayNumber(dayNumber);
  const dateStr = formatDateToISO(date);
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    dayNumber,
    dateStr,
    formattedDate: `${date.getDate()} ${fullMonths[date.getMonth()]} ${date.getFullYear()}`,
    shortDate: `${date.getDate()} ${shortMonths[date.getMonth()]}`,
    dayOfWeek: days[date.getDay()],
    daysRemainingInMission: TOTAL_MISSION_DAYS - dayNumber,
  };
}

/**
 * Get days remaining to JEE Main Exam (21 Jan 2027) relative to a specific mission day
 */
export function getExamCountdownDays(currentMissionDay: number): number {
  const dayDate = getDateForDayNumber(currentMissionDay);
  const examDate = new Date(2027, 0, 21);
  const diffTime = examDate.getTime() - dayDate.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Generates all 148 mission day objects for the calendar grid
 */
export function getAll148Days(): MissionDayInfo[] {
  const days: MissionDayInfo[] = [];
  for (let i = 1; i <= TOTAL_MISSION_DAYS; i++) {
    days.push(getMissionDayInfo(i));
  }
  return days;
}
