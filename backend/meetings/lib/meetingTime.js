// Shared time helpers for the session/interview meeting lifecycle.
// All enforcement compares real Date values in Asia/Dhaka (UTC+6) timezone.

const MINUTE_MS = 60 * 1000;

const EXPIRED_MSG = 'This meeting is no longer available. The scheduled time has ended.';
const NOT_STARTED_MSG = 'This meeting has not started yet. Please use the Join button when the scheduled time arrives.';

// Parse "HH:MM" (24h) or "h:mm AM/PM" (12h) into { hour, minute }.
const parseTimeOfDay = (timeStr) => {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (meridiem) {
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
  } else if (hour === 24) {
    hour = 0;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
};

// Resolve calendar {year, month (0-indexed), day} in Asia/Dhaka (UTC+6) timezone.
const toCalendarParts = (dateLike) => {
  if (!dateLike) return null;
  if (typeof dateLike === 'string' && dateLike.match(/^\d{4}-\d{2}-\d{2}/)) {
    const [y, m, d] = dateLike.split('T')[0].split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  }
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  // Shift by 6 hours to get calendar parts in Asia/Dhaka (UTC+6)
  const bdDate = new Date(d.getTime() + (6 * 60 * 60 * 1000));
  return { year: bdDate.getUTCFullYear(), month: bdDate.getUTCMonth(), day: bdDate.getUTCDate() };
};

// Combine a calendar date + wall-clock time in Asia/Dhaka + duration into UTC start/end instants.
// Wall-clock time in Bangladesh (Asia/Dhaka) = UTC + 6 hours.
// Therefore, UTC Instant = Date.UTC(year, month, day, hour, minute) - 6 hours.
const computeScheduleWindow = ({ date, time, duration }) => {
  if (!date || !time) return null;
  const parts = toCalendarParts(date);
  const tod = parseTimeOfDay(time);
  if (!parts || !tod) return null;
  const durationMs = (Number(duration) || 60) * MINUTE_MS;
  const startMs = Date.UTC(parts.year, parts.month, parts.day, tod.hour, tod.minute, 0, 0) - (6 * 60 * 60 * 1000);
  const start = new Date(startMs);
  const end = new Date(start.getTime() + durationMs);
  return { start, end, durationMinutes: durationMs / MINUTE_MS };
};

// Derive the schedule window for each kind of scheduled session source.
const getScheduleInfo = (source) => {
  if (!source) return null;
  if (source.sessionDate != null && source.sessionTime) {
    return computeScheduleWindow({ date: source.sessionDate, time: source.sessionTime, duration: source.sessionDuration });
  }
  if (source.date != null && source.time) {
    return computeScheduleWindow({ date: source.date, time: source.time, duration: source.duration });
  }
  return null;
};

// Prefer deriving from date + time + duration (Asia/Dhaka wall-clock time), fall back to stored scheduleStart/scheduleEnd.
const effectiveWindow = (doc) => {
  if (!doc) return null;
  const derived = getScheduleInfo(doc);
  if (derived) return derived;
  if (doc.scheduleStart && doc.scheduleEnd) {
    return { start: new Date(doc.scheduleStart), end: new Date(doc.scheduleEnd) };
  }
  return null;
};

// Classify a time instant against the schedule window.
//   window: { start, end }   now: Date (defaults to current time)
// Returns { phase: 'upcoming' | 'active' | 'ended' | 'unknown', inside: boolean }
const getMeetingPhase = (window, now = new Date()) => {
  if (!window || !window.start) return { phase: 'unknown', inside: false };
  const t = now.getTime();
  const start = window.start.getTime();
  if (t < start) return { phase: 'upcoming', inside: false };
  if (!window.end) return { phase: 'active', inside: true };
  const end = window.end.getTime();
  if (t >= end) return { phase: 'ended', inside: false };
  return { phase: 'active', inside: true };
};

const isActivePhase = (window, now = new Date()) => getMeetingPhase(window, now).inside;

// Throws an Error (with statusCode) if `now` is outside the meeting's join window.
const assertJoinableWindow = (window, now = new Date()) => {
  const phaseResult = getMeetingPhase(window, now);
  if (phaseResult.inside) return true;
  const err = new Error(phaseResult.phase === 'upcoming' ? NOT_STARTED_MSG : EXPIRED_MSG);
  err.statusCode = 403;
  throw err;
};

// Determine whether a doc has seen actual room participation (someone connected to LiveKit).
const hasParticipated = (doc) => Boolean(doc && doc.hasStarted);

// Suggested next source status when a FrontX/X-forwarded meeting window ends.
const finalStatusFor = (kind, hasStarted) => {
  if (kind === 'interview') return hasStarted ? 'completed' : 'canceled';
  return hasStarted ? 'Completed' : 'Past Session';
};

// Derive the effective status for a scheduled session from its real schedule window compared against `now`.
const deriveSessionStatus = (source, now = new Date()) => {
  if (!source) return null;
  const current = source.status;
  if (!current || current === 'Completed' || current === 'Cancelled' || current === 'Past Session') {
    return current || 'Scheduled';
  }
  const phase = getMeetingPhase(effectiveWindow(source), now).phase;
  if (phase === 'active') return 'Ongoing';
  if (phase === 'ended') return hasParticipated(source) ? 'Completed' : 'Past Session';
  if (phase === 'upcoming') return (current === 'Upcoming' || current === 'Scheduled') ? current : 'Scheduled';
  return current;
};

module.exports = {
  MINUTE_MS,
  EXPIRED_MSG,
  NOT_STARTED_MSG,
  parseTimeOfDay,
  toCalendarParts,
  computeScheduleWindow,
  getScheduleInfo,
  effectiveWindow,
  getMeetingPhase,
  isActivePhase,
  hasParticipated,
  assertJoinableWindow,
  finalStatusFor,
  deriveSessionStatus,
};