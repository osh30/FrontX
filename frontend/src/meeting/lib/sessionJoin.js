import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
