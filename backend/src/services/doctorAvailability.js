const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FULL_TO_SHORT_DAY = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const SHORT_TO_FULL_DAY = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

function createEmptySchedule() {
  return Object.fromEntries(DAY_ORDER.map((day) => [day, []]));
}

function normalizeDayKey(value) {
  if (!value) return null;
  if (FULL_TO_SHORT_DAY[value]) return FULL_TO_SHORT_DAY[value];
  if (SHORT_TO_FULL_DAY[value]) return value;

  const matched = DAY_ORDER.find((day) => day.toLowerCase() === String(value).slice(0, 3).toLowerCase());
  return matched || null;
}

function parseTimeToMinutes(label) {
  const match = String(label).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM') hours += 12;
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function slotsFromRange(rangeLabel) {
  const [rawStart, rawEnd] = String(rangeLabel).split('-').map((part) => part.trim());
  const start = parseTimeToMinutes(rawStart);
  const end = parseTimeToMinutes(rawEnd);
  if (start === null || end === null || end <= start) return [];

  const slots = [];
  for (let current = start; current < end; current += 30) {
    slots.push(formatMinutesToTime(current));
  }
  return slots;
}

function deriveSlotsFromOpdTimings(opdTimings) {
  const timing = String(opdTimings || '').trim();
  if (!timing) return [];

  return timing
    .split('&')
    .flatMap((segment) => slotsFromRange(segment.trim()))
    .filter(Boolean);
}

function normalizeScheduleShape(rawSchedule) {
  const normalized = createEmptySchedule();
  if (!rawSchedule) return normalized;

  let scheduleSource = rawSchedule;
  if (typeof rawSchedule === 'string') {
    try {
      scheduleSource = JSON.parse(rawSchedule);
    } catch {
      return normalized;
    }
  }

  if (typeof scheduleSource !== 'object') return normalized;

  for (const [dayKey, slots] of Object.entries(scheduleSource)) {
    const shortDay = normalizeDayKey(dayKey);
    if (!shortDay) continue;

    normalized[shortDay] = Array.isArray(slots)
      ? [...new Set(slots.map((slot) => String(slot).trim()).filter(Boolean))]
      : [];
  }

  return normalized;
}

function buildAvailabilitySchedule({ availability = [], availabilitySchedule = null, opdTimings = '' }) {
  const normalized = normalizeScheduleShape(availabilitySchedule);
  const activeDays = [...new Set((availability || []).map(normalizeDayKey).filter(Boolean))];
  const fallbackSlots = deriveSlotsFromOpdTimings(opdTimings);

  for (const day of DAY_ORDER) {
    if (normalized[day].length > 0) continue;
    if (activeDays.includes(day)) {
      normalized[day] = [...fallbackSlots];
    }
  }

  return normalized;
}

function getDateDayKey(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return DAY_ORDER[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

function deriveOpdTimingsFromSchedule(schedule) {
  const uniqueSlots = [...new Set(Object.values(schedule || {}).flat())]
    .map((slot) => ({ slot, mins: parseTimeToMinutes(slot) }))
    .filter((item) => item.mins !== null)
    .sort((a, b) => a.mins - b.mins);

  if (!uniqueSlots.length) return '';

  return `${uniqueSlots[0].slot} - ${uniqueSlots[uniqueSlots.length - 1].slot}`;
}

module.exports = {
  DAY_ORDER,
  FULL_TO_SHORT_DAY,
  SHORT_TO_FULL_DAY,
  buildAvailabilitySchedule,
  createEmptySchedule,
  deriveOpdTimingsFromSchedule,
  deriveSlotsFromOpdTimings,
  getDateDayKey,
  normalizeDayKey,
};
