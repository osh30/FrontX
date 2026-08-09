import axios from 'axios';

import { API_BASE } from '../../config/api';
const post = (endpoint) => async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE}${endpoint}/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({})
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const err = new Error(errorData.message || 'Server error');
      err.response = { data: { message: errorData.message || `HTTP ${res.status} Error` } };
      throw err;
    }
    
    const data = await res.json();
    return data;
  } catch (err) {
    if (!err.response) {
      err.response = { data: { message: err.message || 'Network Error' } };
    }
    throw err;
  }
};

export const joinSessionMeeting = post('/meetings/session');
export const joinMentorshipMeeting = post('/meetings/mentorship-session');
export const joinInterviewMeeting = post('/meetings/interview');

export const openMeeting = (data) => {
  if (data && data.meetingType === 'external' && data.externalUrl) {
    window.open(data.externalUrl, '_blank', 'noopener,noreferrer');
    return true;
  }
  if (data && data.roomId) {
    window.dispatchEvent(new CustomEvent('open-live-meeting', { 
      detail: { 
        roomId: data.roomId, 
        token: data.token, 
        serverUrl: data.serverUrl 
      } 
    }));
    return true;
  }
  return false;
};

export const isFrontxMeeting = (item) => item && item.meetingType === 'frontx';

export const meetingPlatformLabel = (item) =>
  isFrontxMeeting(item) ? 'FrontX Live Meeting' : (item?.platform || item?.meetingPlatform || 'Online');

// ── Shared schedule-window helpers ───────────────────────────────────
const MINUTE_MS = 60 * 1000;

export const parseTimeOfDay = (timeStr) => {
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

// Calendar parts via UTC getters so "2026-08-10" stays the picked calendar date.
const toCalendarParts = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
};

export const computeScheduleWindow = ({ date, time, duration }) => {
  if (!date || !time) return null;
  const parts = toCalendarParts(date);
  const tod = parseTimeOfDay(time);
  if (!parts || !tod) return null;
  const durationMs = (Number(duration) || 0) * MINUTE_MS;
  const start = new Date(Date.UTC(parts.year, parts.month, parts.day, tod.hour, tod.minute, 0, 0));
  const end = durationMs > 0 ? new Date(start.getTime() + durationMs) : null;
  return { start, end };
};

// Resolves the schedule window for Session, MentorshipSession, or Interview docs.
export const meetingWindow = (item) => {
  if (!item) return null;
  if (item.scheduleStart && item.scheduleEnd) {
    return { start: new Date(item.scheduleStart), end: new Date(item.scheduleEnd) };
  }
  if (item.sessionDate != null && item.sessionTime) {
    return computeScheduleWindow({ date: item.sessionDate, time: item.sessionTime, duration: item.sessionDuration });
  }
  if (item.date != null && item.time) {
    return computeScheduleWindow({ date: item.date, time: item.time, duration: item.duration });
  }
  return null;
};

// Returns { phase: 'upcoming' | 'active' | 'ended' | 'unknown', inside: boolean }
export const meetingPhase = (item, now = new Date()) => {
  const window = meetingWindow(item);
  if (!window || !window.start) return { phase: 'unknown', inside: false, window };
  const t = now.getTime();
  const start = window.start.getTime();
  if (t < start) return { phase: 'upcoming', inside: false, window };
  if (!window.end) return { phase: 'active', inside: true, window };
  const end = window.end.getTime();
  if (t >= end) return { phase: 'ended', inside: false, window };
  return { phase: 'active', inside: true, window };
};

export const canJoinInTimeWindow = (item, now = new Date()) => meetingPhase(item, now).inside;

// ── Interview join state ─────────────────────────────────────────────
export const interviewJoinState = (interview, now = new Date()) => {
  if (!interview) return { joinable: false, label: null, reason: '' };
  if (interview.status === 'completed') return { joinable: false, label: 'Completed', reason: 'This interview has been completed' };
  if (interview.status === 'cancelled' || interview.status === 'canceled') return { joinable: false, label: 'Cancelled', reason: 'This interview has been cancelled' };
  if (interview.interviewType !== 'Online') return { joinable: false, label: null, reason: 'Only online interviews can be joined live' };

  const phaseResult = meetingPhase(interview, now);
  if (phaseResult.phase === 'upcoming') return { joinable: false, label: 'Upcoming', reason: 'This interview has not started yet' };
  if (phaseResult.phase === 'ended') return { joinable: false, label: 'Ended', reason: 'This interview can no longer be joined' };
  return { joinable: true, label: 'Join Interview', reason: '' };
};

export const canJoinInterview = (interview, now = new Date()) => interviewJoinState(interview, now).joinable;

// ── Session / MentorshipSession join state ───────────────────────────
export const sessionJoinState = (session, now = new Date()) => {
  if (!session) return { joinable: false, label: null, reason: '' };
  if (session.status === 'Completed') return { joinable: false, label: 'Completed', reason: 'This session has been completed' };
  if (session.status === 'Past Session') return { joinable: false, label: 'Past Session', reason: 'This session has ended and was not attended' };
  if (session.status === 'Cancelled') return { joinable: false, label: 'Cancelled', reason: 'This session has been cancelled' };
  if (!isFrontxMeeting(session)) return { joinable: false, label: null, reason: '' };

  const phaseResult = meetingPhase(session, now);
  if (phaseResult.phase === 'upcoming') return { joinable: false, label: 'Upcoming', reason: 'This session has not started yet' };
  if (phaseResult.phase === 'ended') return { joinable: false, label: 'Ended', reason: 'This session can no longer be joined' };
  return { joinable: true, label: 'Join Session', reason: '' };
};

export const canJoinSession = (session, now = new Date()) => sessionJoinState(session, now).joinable;
