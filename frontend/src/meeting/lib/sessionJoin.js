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

// ── Interview join state ─────────────────────────────────────────────
// Returns { joinable, label, reason } so UIs can show/enable Join only
// for interviews that can be joined (and the backend still re-validates).
const JOINABLE_STATUSES = ['scheduled', 'rescheduled'];

export const interviewJoinState = (interview) => {
  if (!interview) return { joinable: false, label: null, reason: '' };
  if (interview.status === 'completed') return { joinable: false, label: 'Completed', reason: 'This interview has been completed' };
  if (interview.status === 'cancelled') return { joinable: false, label: 'Cancelled', reason: 'This interview has been cancelled' };
  if (!JOINABLE_STATUSES.includes(interview.status)) return { joinable: false, label: null, reason: '' };
  if (interview.interviewType !== 'Online') return { joinable: false, label: null, reason: 'Only online interviews can be joined live' };
  return { joinable: true, label: 'Join Interview', reason: '' };
};

export const canJoinInterview = (interview) => interviewJoinState(interview).joinable;
