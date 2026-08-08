import { API_URL, API_BASE, SOCKET_URL } from '../../config/api';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Video, Users, FileText,
  ExternalLink, GraduationCap, Star, CheckCircle, Download,
  MessageCircle, Play, ChevronRight, BookOpen,
  Zap, Timer, X, Info, Pin, PinOff, Search, Filter,
  Plus, Edit3, Trash2, Send, Paperclip, Link2, ThumbsUp,
  Reply as ReplyIcon, CheckCircle2, Circle, AlertCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import Avatar from './Avatar';
import { joinSessionMeeting, openMeeting, meetingPlatformLabel } from '../../meeting/lib/sessionJoin';

const statusConfig = {
  'Upcoming': { bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  'Scheduled': { bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  'Ongoing': { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Play },
  'Completed': { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
  'Cancelled': { bg: 'bg-red-100 text-red-700 border-red-200', icon: X }
};

const StudentSessionDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const sessionId = pathParts[3];
  const searchParams = new URLSearchParams(location.search);
  const sessionType = searchParams.get('type') || 'one-on-one';

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);

  // Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [editingAnnounce, setEditingAnnounce] = useState(null);
  const [announceForm, setAnnounceForm] = useState({ title: '', description: '', attachments: [] });
  const [attachInput, setAttachInput] = useState({ name: '', url: '', type: 'link' });

  // Discussion
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionContent, setQuestionContent] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyContent, setReplyContent] = useState({});
  const [editingReply, setEditingReply] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setCurrentUser(JSON.parse(userData)); } catch {}
    }
  }, []);

  const isAlumni = currentUser && session && (
    (session.alumni?._id === currentUser._id) ||
    (session.alumniId?._id === currentUser._id) ||
    (session.alumni?.toString() === currentUser._id)
  );

  const fetchSession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const endpoint = sessionType === 'group'
        ? `/api/mentorship-sessions/${sessionId}`
        : `/api/sessions/${sessionId}`;
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (err) {
      console.error('Failed to fetch session', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/announcements/${sessionId}/${sessionType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAnnouncements(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/discussion/${sessionId}/${sessionType}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setQuestions(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchReplies = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/discussion/questions/${questionId}/replies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReplies(prev => ({ ...prev, [questionId]: data }));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSession(); }, [sessionId, sessionType]);
  useEffect(() => { if (!loading) { fetchAnnouncements(); fetchQuestions(); } }, [loading]);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Socket listeners
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('session_updated', fetchSession);
    socket.on('announcement:created', (d) => setAnnouncements(prev => [d, ...prev]));
    socket.on('announcement:updated', (d) => setAnnouncements(prev => prev.map(a => a._id === d._id ? d : a)));
    socket.on('announcement:deleted', (d) => setAnnouncements(prev => prev.filter(a => a._id !== d.id)));
    socket.on('question:created', (d) => setQuestions(prev => [d, ...prev]));
    socket.on('question:updated', (d) => setQuestions(prev => prev.map(q => q._id === d._id ? d : q)));
    socket.on('question:deleted', (d) => setQuestions(prev => prev.filter(q => q._id !== d.id)));
    socket.on('reply:created', (d) => {
      setReplies(prev => ({ ...prev, [d.questionId]: [...(prev[d.questionId] || []), d.reply] }));
      fetchQuestions();
    });
    socket.on('reply:updated', (d) => {
      setReplies(prev => ({
        ...prev,
        [d.questionId]: (prev[d.questionId] || []).map(r => r._id === d.reply._id ? d.reply : r)
      }));
    });
    socket.on('reply:deleted', (d) => {
      setReplies(prev => ({
        ...prev,
        [d.questionId]: (prev[d.questionId] || []).filter(r => r._id !== d.replyId)
      }));
    });
    return () => { socket.disconnect(); };
  }, []);

  const title = session?.title || session?.sessionTitle || '';
  const sesType = session?.type || session?.sessionCategory || 'Session';
  const alumni = session?.alumni || session?.alumniId;
  const sesDate = session?.date || session?.sessionDate;
  const sesTime = session?.time || session?.sessionTime;
  const sesDuration = session?.duration || session?.sessionDuration || 0;
  const platform = session?.platform || session?.meetingPlatform;
  const meetingLink = session?.meetingLink;
  const meetingType = session?.meetingType;
  const isGroup = !!session?.selectedStudents;
  const status = session?.status || '';

  const sessionStart = useMemo(() => {
    if (!sesDate || !sesTime) return null;
    const d = new Date(sesDate);
    const [h, m] = sesTime.split(':').map(Number);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }, [sesDate, sesTime]);

  const sessionEnd = useMemo(() => {
    if (!sessionStart) return null;
    const end = new Date(sessionStart);
    end.setMinutes(end.getMinutes() + sesDuration);
    return end;
  }, [sessionStart, sesDuration]);

  const countdown = useMemo(() => {
    if (!sessionStart) return null;
    const diff = sessionStart.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, [sessionStart, now]);

  const isLive = sessionStart && now >= sessionStart && sessionEnd && now < sessionEnd;
  const isPast = sessionEnd && now >= sessionEnd;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }) : '';

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString();
  };

  const generateGoogleCalLink = () => {
    if (!sessionStart || !title) return '#';
    const end = sessionEnd || new Date(sessionStart.getTime() + 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    const params = new URLSearchParams({
      action: 'TEMPLATE', text: title,
      dates: `${fmt(sessionStart)}/${fmt(end)}`,
      details: `Session with ${alumni?.name || 'Mentor'}\nPlatform: ${meetingType === 'frontx' ? 'FrontX Live Video' : (platform || 'Not specified')}\nMeeting Link: ${meetingType === 'frontx' ? 'Join via FrontX in-app' : (meetingLink || '')}`,
      location: meetingType === 'frontx' ? '' : (meetingLink || '')
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  };

  const handleViewProfile = (userId) => {
    if (userId) navigate(`/dashboard/profile?userId=${userId}`);
  };

  const [joiningMeeting, setJoiningMeeting] = useState(false);

  const handleJoinMeeting = async () => {
    if (!sessionId) return;
    setJoiningMeeting(true);
    try {
      const data = await joinSessionMeeting(sessionId);
      openMeeting(data, navigate);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to open meeting. Please try again.');
    } finally {
      setJoiningMeeting(false);
    }
  };

  // ---- Announcement Handlers ----
  const handleCreateAnnouncement = async () => {
    if (!announceForm.title.trim()) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, sessionType, ...announceForm })
    });
    if (res.ok) {
      setAnnounceForm({ title: '', description: '', attachments: [] });
      setShowAnnounceForm(false);
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!announceForm.title.trim() || !editingAnnounce) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/announcements/${editingAnnounce}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(announceForm)
    });
    if (res.ok) {
      setAnnounceForm({ title: '', description: '', attachments: [] });
      setEditingAnnounce(null);
      setShowAnnounceForm(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
  };

  const handlePinAnnouncement = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/announcements/${id}/pin`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    });
  };

  const startEditAnnounce = (ann) => {
    setEditingAnnounce(ann._id);
    setAnnounceForm({ title: ann.title, description: ann.description, attachments: ann.attachments || [] });
    setShowAnnounceForm(true);
  };

  const addAttachment = () => {
    if (attachInput.url.trim()) {
      setAnnounceForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, { ...attachInput, url: attachInput.url.trim() }]
      }));
      setAttachInput({ name: '', url: '', type: 'link' });
    }
  };

  const removeAttachment = (idx) => {
    setAnnounceForm(prev => ({
      ...prev, attachments: prev.attachments.filter((_, i) => i !== idx)
    }));
  };

  // ---- Question Handlers ----
  const handleCreateQuestion = async () => {
    if (!questionContent.trim()) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/discussion/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, sessionType, content: questionContent })
    });
    if (res.ok) {
      setQuestionContent('');
      setShowQuestionForm(false);
    }
  };

  const handleUpdateQuestion = async (id) => {
    if (!questionContent.trim()) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/discussion/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: questionContent })
    });
    setEditingQuestion(null);
    setQuestionContent('');
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/discussion/questions/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
  };

  const handleResolveQuestion = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/discussion/questions/${id}/resolve`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    });
  };

  const toggleExpandQuestion = (qId) => {
    if (expandedQuestion === qId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(qId);
      if (!replies[qId]) fetchReplies(qId);
    }
  };

  const handleCreateReply = async (questionId) => {
    const content = replyContent[questionId] || '';
    if (!content.trim()) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/discussion/questions/${questionId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content })
    });
    if (res.ok) {
      setReplyContent(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  const handleDeleteReply = async (questionId, replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/discussion/questions/${questionId}/replies/${replyId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
  };

  const handlePinReply = async (questionId, replyId) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/discussion/questions/${questionId}/replies/${replyId}/pin`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    });
  };

  // Filters
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !searchQuery || q.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    switch (filterTab) {
      case 'answered': return (replies[q._id] || []).length > 0;
      case 'unanswered': return (replies[q._id] || []).length === 0;
      case 'resolved': return q.isResolved;
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</p>
          <p className="text-gray-500 mb-8">This session may have been removed or the link is invalid.</p>
          <button onClick={() => navigate('/dashboard/sessions')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-md">
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Back Button */}
        <button onClick={() => navigate('/dashboard/sessions')}
          className="group flex items-center gap-2 text-gray-400 hover:text-purple-600 font-medium transition-all mb-6">
          <div className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm group-hover:border-purple-200 group-hover:bg-purple-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm">Back to Sessions</span>
        </button>

        {/* ===== HERO ===== */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 sm:px-10 py-8 sm:py-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {(() => { const cfg = statusConfig[status] || { bg: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock }; const Icon = cfg.icon; return (
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border shadow-sm ${cfg.bg}`}>
                    <Icon className="w-3.5 h-3.5" /> {status}
                  </span>
                ); })()}
                <span className="px-3.5 py-1.5 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10">{sesType}</span>
                {isGroup && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-500/20">
                    <Users className="w-3.5 h-3.5" /> Group Session
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">{title}</h1>
              {countdown && (status === 'Upcoming' || status === 'Scheduled') && (
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10 mb-4">
                  <Timer className="w-5 h-5 text-purple-300" />
                  <div className="text-white">
                    <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-0.5">Session starts in</p>
                    <p className="text-lg sm:text-xl font-bold tabular-nums">
                      {countdown.days > 0 && <span className="mr-2">{countdown.days}d</span>}
                      <span className="mr-2">{String(countdown.hours).padStart(2, '0')}h</span>
                      <span className="mr-2">{String(countdown.minutes).padStart(2, '0')}m</span>
                      <span>{String(countdown.seconds).padStart(2, '0')}s</span>
                    </p>
                  </div>
                </div>
              )}
              {(isLive || status === 'Ongoing') && (
                <div className="inline-flex items-center gap-3 bg-emerald-500/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-emerald-400/30 mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                  </span>
                  <div><p className="text-lg font-bold text-emerald-300">Session is Live</p><p className="text-xs text-emerald-400/80">The session is currently in progress</p></div>
                </div>
              )}
              {(isPast || status === 'Completed') && (
                <div className="inline-flex items-center gap-3 bg-blue-500/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-blue-400/30 mb-4">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                  <div><p className="text-lg font-bold text-blue-300">Session Completed</p><p className="text-xs text-blue-400/80">{formatDate(sesDate)} at {formatTime(sesTime)}</p></div>
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2 text-white/70"><Calendar className="w-4 h-4 text-purple-300" /><span className="text-sm font-medium">{formatDate(sesDate)}</span></div>
                <div className="flex items-center gap-2 text-white/70"><Clock className="w-4 h-4 text-blue-300" /><span className="text-sm font-medium">{formatTime(sesTime)}</span></div>
                <div className="flex items-center gap-2 text-white/70"><Timer className="w-4 h-4 text-amber-300" /><span className="text-sm font-medium">{sesDuration} mins</span></div>
                {(meetingType === 'frontx' || platform) && <div className="flex items-center gap-2 text-white/70"><Video className="w-4 h-4 text-emerald-300" /><span className="text-sm font-medium">{meetingPlatformLabel(session)}</span></div>}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {(meetingType === 'frontx' || meetingLink) && (status === 'Upcoming' || status === 'Scheduled' || isLive || status === 'Ongoing') && (
                  <button onClick={handleJoinMeeting} disabled={joiningMeeting}
                    className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 ${isLive || status === 'Ongoing' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'}`}>
                    <ExternalLink className="w-5 h-5" /> {joiningMeeting ? 'Opening…' : 'Join Meeting'}
                  </button>
                )}
                {sessionStart && (status === 'Upcoming' || status === 'Scheduled') && (
                  <a href={generateGoogleCalLink()} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    <Calendar className="w-5 h-5" /> Add to Calendar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT */}
          <div className="flex-1 space-y-6">

            {/* Session Overview */}
            {(session.description || session.goal) && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50"><BookOpen className="w-5 h-5 text-purple-600" /></div>
                  {isGroup ? 'Session Overview' : 'Goal & Objectives'}
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{session.description || session.goal}</p>
              </div>
            )}

            {/* Agenda */}
            {session.agenda && session.agenda.filter(a => a.trim()).length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50"><Star className="w-5 h-5 text-amber-600" /></div>
                  Agenda & Topics
                </h2>
                <div className="space-y-3">
                  {session.agenda.filter(a => a.trim()).map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50/50 to-transparent rounded-2xl border border-amber-100/50 group hover:border-amber-200 hover:shadow-sm transition-all">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">{i + 1}</div>
                      <p className="text-sm font-medium text-gray-700 pt-1">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes from Alumni */}
            {session.notes && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50"><FileText className="w-5 h-5 text-blue-600" /></div>
                  Notes from Alumni
                </h2>
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100/50">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">{session.notes}</p>
                </div>
              </div>
            )}

            {/* ===== SESSION RESOURCES & ANNOUNCEMENTS ===== */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50"><Megaphone className="w-5 h-5 text-indigo-600" /></div>
                  Session Resources & Announcements
                </h2>
                {isAlumni && (
                  <button onClick={() => { setEditingAnnounce(null); setAnnounceForm({ title: '', description: '', attachments: [] }); setShowAnnounceForm(!showAnnounceForm); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all">
                    <Plus className="w-4 h-4" /> New Announcement
                  </button>
                )}
              </div>

              {/* Announcement Form */}
              {showAnnounceForm && (
                <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                  <h3 className="font-bold text-gray-900 mb-3">{editingAnnounce ? 'Edit Announcement' : 'Create Announcement'}</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Announcement title..." value={announceForm.title}
                      onChange={e => setAnnounceForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    <textarea placeholder="Description (optional)..." rows={3} value={announceForm.description}
                      onChange={e => setAnnounceForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none" />
                    {/* Attachments */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attachments</p>
                      <div className="flex gap-2 mb-2">
                        <input placeholder="Link URL" value={attachInput.url} onChange={e => setAttachInput(prev => ({ ...prev, url: e.target.value }))} className="flex-1 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input placeholder="Name" value={attachInput.name} onChange={e => setAttachInput(prev => ({ ...prev, name: e.target.value }))} className="w-40 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button onClick={addAttachment} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-200 transition-all">Add</button>
                      </div>
                      {announceForm.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {announceForm.attachments.map((att, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border text-xs font-medium text-gray-700">
                              {att.type === 'link' ? <Link2 className="w-3 h-3 text-blue-500" /> : <Paperclip className="w-3 h-3 text-gray-500" />}
                              {att.name || att.url}
                              <button onClick={() => removeAttachment(i)} className="ml-1 text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={editingAnnounce ? handleUpdateAnnouncement : handleCreateAnnouncement}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm">
                        {editingAnnounce ? 'Save Changes' : 'Publish Announcement'}
                      </button>
                      <button onClick={() => { setShowAnnounceForm(false); setEditingAnnounce(null); setAnnounceForm({ title: '', description: '', attachments: [] }); }}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Announcements List */}
              {announcements.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No announcements yet</p>
                  <p className="text-xs text-gray-400 mt-1">{isAlumni ? 'Create an announcement to share resources with students.' : 'Check back later for updates from your mentor.'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map(ann => (
                    <div key={ann._id} className={`p-5 rounded-2xl border transition-all hover:shadow-sm ${ann.isPinned ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50/50 border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {ann.isPinned && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                <Pin className="w-3 h-3" /> Pinned
                              </span>
                            )}
                            <h3 className="font-bold text-gray-900 text-base">{ann.title}</h3>
                          </div>
                          {ann.description && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{ann.description}</p>}
                          {ann.attachments?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {ann.attachments.map((att, i) => (
                                <a key={i} href={att.url} target="_blank" rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border text-xs font-medium text-gray-700 hover:border-purple-300 hover:text-purple-700 transition-all shadow-sm">
                                  {att.type === 'link' ? <Link2 className="w-3.5 h-3.5 text-blue-500" /> : <Paperclip className="w-3.5 h-3.5 text-gray-500" />}
                                  {att.name || att.url}
                                </a>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Avatar src={ann.postedBy?.profilePicture} alt="Announcer" size={16} className="" />
                              {ann.postedBy?.name || 'Alumni'}
                            </span>
                            <span>{timeAgo(ann.createdAt)}</span>
                          </div>
                        </div>
                        {isAlumni && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handlePinAnnouncement(ann._id)} className="p-2 rounded-lg hover:bg-amber-100 text-gray-400 hover:text-amber-600 transition-all" title={ann.isPinned ? 'Unpin' : 'Pin'}>
                              {ann.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                            </button>
                            <button onClick={() => startEditAnnounce(ann)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteAnnouncement(ann._id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== DISCUSSION & Q&A ===== */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-50"><MessageCircle className="w-5 h-5 text-rose-600" /></div>
                  Discussion & Q&A
                  <span className="text-sm font-normal text-gray-400">({questions.length})</span>
                </h2>
                <button onClick={() => { setEditingQuestion(null); setQuestionContent(''); setShowQuestionForm(!showQuestionForm); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all">
                  <Plus className="w-4 h-4" /> Ask Question
                </button>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search questions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'answered', label: 'Answered' },
                    { key: 'unanswered', label: 'Unanswered' },
                    { key: 'resolved', label: 'Resolved' }
                  ].map(f => (
                    <button key={f.key} onClick={() => setFilterTab(f.key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterTab === f.key ? 'bg-rose-100 text-rose-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Form */}
              {showQuestionForm && (
                <div className="mb-6 p-5 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border border-rose-100">
                  <h3 className="font-bold text-gray-900 mb-3">{editingQuestion ? 'Edit Question' : 'Ask a Question'}</h3>
                  <textarea placeholder={editingQuestion ? 'Edit your question...' : 'Type your question here...'} rows={3} value={questionContent}
                    onChange={e => setQuestionContent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 outline-none text-sm resize-none" />
                  <div className="flex gap-2 mt-3">
                    <button onClick={editingQuestion ? () => handleUpdateQuestion(editingQuestion) : handleCreateQuestion}
                      className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-sm flex items-center gap-2">
                      <Send className="w-4 h-4" /> {editingQuestion ? 'Save' : 'Post Question'}
                    </button>
                    <button onClick={() => { setShowQuestionForm(false); setEditingQuestion(null); setQuestionContent(''); }}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">
                    {searchQuery ? 'No questions match your search.' : 'No questions yet'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{!searchQuery && 'Be the first to ask a question about this session.'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map(q => {
                    const qReplies = replies[q._id] || [];
                    const pinnedReply = qReplies.find(r => r.isPinned);
                    return (
                      <div key={q._id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm transition-all">
                        {/* Question Header */}
                        <div className="p-4 sm:p-5 cursor-pointer" onClick={() => toggleExpandQuestion(q._id)}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${q.isResolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {q.isResolved ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                  {q.isResolved ? 'Resolved' : 'Open'}
                                </span>
                                {qReplies.length > 0 && (
                                  <span className="text-xs text-gray-400">{qReplies.length} {qReplies.length === 1 ? 'reply' : 'replies'}</span>
                                )}
                              </div>
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">{q.content}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Avatar src={q.author?.profilePicture} alt={q.author?.name} size={16} className="" />
                                  {q.author?.name || 'Student'}
                                </span>
                                <span>{timeAgo(q.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {isAlumni && !q.isResolved && (
                                <button onClick={(e) => { e.stopPropagation(); handleResolveQuestion(q._id); }}
                                  className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all" title="Mark as resolved">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {currentUser && q.author?._id === currentUser._id && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingQuestion(q._id); setQuestionContent(q.content); setShowQuestionForm(true); }}
                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"><Edit3 className="w-4 h-4" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q._id); }}
                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </>
                              )}
                              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestion === q._id ? 'rotate-90' : ''}`} />
                            </div>
                          </div>
                          {pinnedReply && !expandedQuestion && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                              <Pin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-amber-700 mb-0.5">Pinned Reply</p>
                                <p className="text-sm text-gray-600 line-clamp-2">{pinnedReply.content}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expanded Replies */}
                        {expandedQuestion === q._id && (
                          <div className="border-t border-gray-100 bg-gray-50/50">
                            <div className="p-4 sm:p-5 space-y-4">
                              {qReplies.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No replies yet. Be the first to reply.</p>
                              ) : (
                                qReplies.map(reply => (
                                  <div key={reply._id} className={`p-4 rounded-2xl border ${reply.isPinned ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-gray-100'} transition-all`}>
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        {reply.isPinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2"><Pin className="w-3 h-3" /> Pinned</span>}
                                        <p className="text-sm text-gray-700">{reply.content}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                          <span className="flex items-center gap-1">
                                            <Avatar src={reply.author?.profilePicture} alt={reply.author?.name} size={16} className="" />
                                            {reply.author?.name || 'Student'}
                                          </span>
                                          <span>{timeAgo(reply.createdAt)}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {isAlumni && (
                                          <button onClick={() => handlePinReply(q._id, reply._id)}
                                            className="p-1.5 rounded-lg hover:bg-amber-100 text-gray-400 hover:text-amber-600 transition-all" title={reply.isPinned ? 'Unpin' : 'Pin'}>
                                            {reply.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                                          </button>
                                        )}
                                        {currentUser && reply.author?._id === currentUser._id && (
                                          <button onClick={() => handleDeleteReply(q._id, reply._id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Reply Form */}
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                              <div className="flex gap-2">
                                <input type="text" placeholder="Write a reply..." value={replyContent[q._id] || ''}
                                  onChange={e => setReplyContent(prev => ({ ...prev, [q._id]: e.target.value }))}
                                  onKeyDown={e => e.key === 'Enter' && handleCreateReply(q._id)}
                                  className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-rose-500" />
                                <button onClick={() => handleCreateReply(q._id)}
                                  className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-sm">
                                  <Send className="w-4 h-4" /> Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gray-50"><Zap className="w-5 h-5 text-gray-600" /></div>
                Session Timeline
              </h2>
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {[
                    { label: 'Scheduled', time: session.createdAt, done: true, icon: Calendar },
                    { label: 'Upcoming', time: sessionStart && sessionStart > now ? null : sessionStart, done: isLive || isPast || status === 'Ongoing' || status === 'Completed', icon: Clock },
                    { label: `${isLive || status === 'Ongoing' ? 'In Progress' : 'Started'}`, time: isLive || status === 'Ongoing' ? now : null, done: isLive || status === 'Ongoing', icon: Play, active: isLive || status === 'Ongoing' },
                    { label: 'Completed', time: isPast ? sessionEnd : null, done: isPast || status === 'Completed', icon: CheckCircle }
                  ].filter(t => !(t.label === 'Started' && !t.done && !t.time)).map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="relative flex items-start gap-4 pl-10">
                        <div className={`absolute left-0 w-[38px] h-[38px] rounded-full flex items-center justify-center z-10 border-2 transition-all ${item.active ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : item.done ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="pt-1.5">
                          <p className={`text-sm font-bold ${item.done ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</p>
                          {item.time && <p className="text-xs text-gray-500 mt-0.5">{new Date(item.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50"><Download className="w-5 h-5 text-indigo-600" /></div>
                Attachments & Resources
              </h2>
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Download className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No resources attached yet</p>
                <p className="text-xs text-gray-400 mt-1">Alumni can attach files, links, and resources here.</p>
              </div>
            </div>

          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-6">

            {/* Alumni Card */}
            {alumni && (
              <div onClick={() => handleViewProfile(alumni._id)}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group">
                <div className="flex flex-col items-center text-center">
                  <Avatar src={alumni.profilePicture} alt={alumni.name} size={80} className="border-2 border-white shadow-md mb-4 group-hover:scale-105 transition-transform" />
                  <h3 className="font-bold text-gray-900 text-lg">{alumni.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">{alumni.department || 'Alumni'}</p>
                  {alumni.careerInterest && <p className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{alumni.careerInterest}</p>}
                  <div className="mt-4 flex items-center gap-1 text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-3 h-3" /> View Full Profile</div>
                </div>
              </div>
            )}

            {/* Session Info */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-purple-600" /> Session Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Status', value: isLive || status === 'Ongoing' ? 'Live' : status, cls: status === 'Completed' ? 'bg-blue-100 text-blue-700' : status === 'Cancelled' ? 'bg-red-100 text-red-700' : isLive || status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700' },
                  { label: 'Date', value: formatDate(sesDate) },
                  { label: 'Time', value: formatTime(sesTime) },
                  { label: 'Duration', value: `${sesDuration} mins` },
                  ...(platform ? [{ label: 'Platform', value: platform }] : [])
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</span>
                    <span className={`text-sm font-medium text-gray-900 ${item.cls || ''} ${item.label === 'Status' ? 'px-2.5 py-0.5 rounded-full' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants */}
            {isGroup && session.selectedStudents?.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Participants ({session.selectedStudents.length})</h3>
                <div className="space-y-2">
                  {session.selectedStudents.map(student => (
                    <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Avatar src={student.profilePicture} alt={student.name} size={36} className="border-2 border-white shadow-sm" />
                      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p><p className="text-xs text-gray-500 truncate">{student.department || 'Student'}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-600" /> Quick Actions</h3>
              <div className="space-y-3">
                {(meetingType === 'frontx' || meetingLink) && (status === 'Upcoming' || status === 'Scheduled' || isLive || status === 'Ongoing') && (
                  <button onClick={handleJoinMeeting} disabled={joiningMeeting}
                    className={`flex items-center gap-3 w-full p-3.5 rounded-2xl text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-60 ${isLive || status === 'Ongoing' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                    <div className={`p-2 rounded-xl ${isLive || status === 'Ongoing' ? 'bg-emerald-200' : 'bg-purple-200'}`}><ExternalLink className="w-4 h-4" /></div>
                    {joiningMeeting ? 'Opening…' : 'Join Meeting'}
                  </button>
                )}
                {sessionStart && (status === 'Upcoming' || status === 'Scheduled') && (
                  <a href={generateGoogleCalLink()} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 w-full p-3.5 rounded-2xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all shadow-sm hover:shadow-md">
                    <div className="p-2 rounded-xl bg-blue-200"><Calendar className="w-4 h-4" /></div> Add to Calendar
                  </a>
                )}
                {alumni && (
                  <button onClick={() => handleViewProfile(alumni._id)}
                    className="flex items-center gap-3 w-full p-3.5 rounded-2xl text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all shadow-sm hover:shadow-md">
                    <div className="p-2 rounded-xl bg-gray-200"><GraduationCap className="w-4 h-4" /></div> View Mentor Profile
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

const Megaphone = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 15-5-8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l5 8v-8l5 2Z" />
    <line x1="18" y1="10" x2="22" y2="10" />
  </svg>
);

export default StudentSessionDetailsPage;
