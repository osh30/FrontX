import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, Plus, Trash2, XCircle, CheckCircle,
  Loader2, ChevronLeft, ChevronRight, MapPin, Users, Link as LinkIcon,
  AlertTriangle, Edit3, Eye, Filter, X, CalendarDays, TrendingUp,
  User, Briefcase, Building2, MessageSquare, Star, Sparkles
} from 'lucide-react';
import { joinInterviewMeeting, openMeeting, meetingPlatformLabel } from '../../../meeting/lib/sessionJoin';
import { MeetingTypeSelector } from '../MeetingTypeSelector';

const API_URL = 'http://localhost:5000/api';

const INTERVIEW_TYPES = [
  { value: 'Online', subtypes: ['FrontX Video'] },
  { value: 'Offline', subtypes: ['In-Person', 'Phone'] }
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ scheduled: 0, today: 0, completed: 0, cancelled: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('table');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    studentId: '', opportunityId: '', applicationId: '', title: '',
    date: '', time: '', duration: '30', interviewType: 'Online',
    meetingType: 'frontx', platform: 'FrontX Video', meetingLink: '', interviewLocation: '',
    panelMembers: '', notes: ''
  });

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '', duration: '30', meetingType: 'frontx', platform: 'FrontX Video', meetingLink: '', interviewLocation: '', notes: '' });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [completeForm, setCompleteForm] = useState({ feedback: '', rating: 0 });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoinInterview = async (interview) => {
    setJoining(true);
    try {
      const data = await joinInterviewMeeting(interview._id);
      openMeeting(data, navigate);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to open interview room', 'error');
    } finally {
      setJoining(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => { fetchInterviews(); }, [statusFilter, page]);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/recruiter/applicants`, {
        params: { status: 'shortlisted', limit: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(res.data.applicants || res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch applicants', err);
    }
  };

  useEffect(() => {
    if (showScheduleModal) fetchApplicants();
  }, [showScheduleModal]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/recruiter/interviews`, {
        params: { status: statusFilter, page, limit: 20 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(res.data.interviews);
      setTotalPages(res.data.pages);
      if (res.data.stats) setStats(res.data.stats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const statusColors = {
    scheduled: 'bg-blue-50 text-blue-600 border border-blue-100',
    completed: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    cancelled: 'bg-red-50 text-red-500 border border-red-100',
    rescheduled: 'bg-amber-50 text-amber-600 border border-amber-100'
  };

  const statusDots = {
    scheduled: 'bg-blue-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-red-400',
    rescheduled: 'bg-amber-500'
  };

  // ── Calendar logic ──
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calendarDate]);

  const interviewsByDate = useMemo(() => {
    const map = {};
    interviews.forEach(int => {
      const d = new Date(int.date).toISOString().split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(int);
    });
    return map;
  }, [interviews]);

  const isToday = (day) => {
    if (!day) return false;
    const now = new Date();
    return day === now.getDate() && calendarDate.getMonth() === now.getMonth() && calendarDate.getFullYear() === now.getFullYear();
  };

  const handleCalendarClick = (day) => {
    if (!day) return;
    const dateStr = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toISOString().split('T')[0];
    const dayInterviews = interviewsByDate[dateStr];
    if (dayInterviews && dayInterviews.length > 0) {
      setSelectedInterview(dayInterviews[0]);
      setShowDetail(true);
    }
  };

  // ── Schedule interview ──
  const handleSchedule = async () => {
    if (!scheduleForm.title || !scheduleForm.date || !scheduleForm.time) {
      showToast('Title, date and time are required', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const panelMembers = scheduleForm.panelMembers
        ? scheduleForm.panelMembers.split(',').map(n => ({ name: n.trim() })).filter(m => m.name)
        : [];
      await axios.post(`${API_URL}/recruiter/interviews`, {
        ...scheduleForm,
        duration: parseInt(scheduleForm.duration) || 30,
        panelMembers
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Interview scheduled successfully!');
      setShowScheduleModal(false);
      setScheduleForm({
        studentId: '', opportunityId: '', applicationId: '', title: '',
        date: '', time: '', duration: '30', interviewType: 'Online',
        meetingType: 'frontx', platform: 'FrontX Video', meetingLink: '', interviewLocation: '',
        panelMembers: '', notes: ''
      });
      fetchInterviews();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule', 'error');
    }
  };

  // ── Reschedule ──
  const handleReschedule = async () => {
    if (!rescheduleForm.date || !rescheduleForm.time) {
      showToast('Date and time are required', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/recruiter/interviews/${rescheduleTarget._id}/reschedule`, {
        ...rescheduleForm,
        duration: parseInt(rescheduleForm.duration) || 30
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Interview rescheduled successfully!');
      setShowRescheduleModal(false);
      setRescheduleTarget(null);
      fetchInterviews();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reschedule', 'error');
    }
  };

  // ── Cancel ──
  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/recruiter/interviews/${cancelTarget._id}/cancel`, { cancelReason }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Interview cancelled');
      setShowCancelModal(false);
      setCancelTarget(null);
      setCancelReason('');
      fetchInterviews();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    }
  };

  // ── Complete ──
  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/recruiter/interviews/${completeTarget._id}/complete`, completeForm, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Interview marked as completed');
      setShowCompleteModal(false);
      setCompleteTarget(null);
      setCompleteForm({ feedback: '', rating: 0 });
      fetchInterviews();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete', 'error');
    }
  };

  const deleteInterview = async (id) => {
    if (!confirm('Delete this interview?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/recruiter/interviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Interview deleted');
      fetchInterviews();
    } catch (err) { showToast('Failed to delete', 'error'); }
  };

  const statCards = [
    { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
    { label: "Today's", value: stats.today, icon: Clock, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'from-red-400 to-rose-600', bg: 'bg-red-50' }
  ];

  return (
    <div className="space-y-6">
      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] p-8 md:p-10"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Interview Management</h1>
            <p className="text-blue-200/80 text-sm md:text-base max-w-xl">
              Schedule, manage, and track interviews with students from one professional dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setView(view === 'table' ? 'calendar' : 'table'); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all"
            >
              <CalendarDays className="w-4 h-4" />
              {view === 'table' ? 'Calendar View' : 'Table View'}
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Schedule Interview
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${s.bg} rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white rounded-xl border border-gray-200 p-1">
          {['all', 'scheduled', 'completed', 'cancelled', 'rescheduled'].map(f => (
            <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── CALENDAR VIEW ── */}
      {view === 'calendar' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-bold text-gray-900">
              {MONTHS[calendarDate.getMonth()]} {calendarDate.getFullYear()}
            </h3>
            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden">
            {DAYS.map(d => (
              <div key={d} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
            ))}
            {calendarDays.map((day, idx) => {
              const dateStr = day ? new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toISOString().split('T')[0] : null;
              const dayInterviews = dateStr ? (interviewsByDate[dateStr] || []) : [];
              const today = isToday(day);
              return (
                <div key={idx} onClick={() => handleCalendarClick(day)}
                  className={`bg-white min-h-[80px] md:min-h-[100px] p-2 cursor-pointer hover:bg-blue-50/50 transition-colors ${today ? 'ring-2 ring-blue-500 ring-inset' : ''}`}>
                  {day && (
                    <>
                      <span className={`text-xs font-semibold ${today ? 'text-blue-600' : 'text-gray-700'}`}>{day}</span>
                      <div className="mt-1 space-y-1">
                        {dayInterviews.slice(0, 3).map(int => (
                          <div key={int._id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate ${statusColors[int.status] || 'bg-gray-100 text-gray-600'}`}>
                            {int.student?.name || 'Student'}
                          </div>
                        ))}
                        {dayInterviews.length > 3 && (
                          <span className="text-[10px] text-gray-400 font-medium">+{dayInterviews.length - 3} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── TABLE VIEW ── */}
      {view === 'table' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr_100px] gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-100">
            {['Student', 'Position', 'Date & Time', 'Type', 'Duration', 'Platform/Location', 'Status', 'Actions'].map(h => (
              <span key={h} className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : interviews.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold text-lg">No interviews found</p>
              <p className="text-sm text-gray-400 mt-1">Schedule interviews from the Applicants tab or click "Schedule Interview" above.</p>
            </div>
          ) : interviews.map((int, idx) => (
            <motion.div
              key={int._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr_100px] gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors items-center cursor-pointer"
              onClick={() => { setSelectedInterview(int); setShowDetail(true); }}
            >
              {/* Student */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                  {int.student?.profilePicture ? (
                    <img src={int.student.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">{int.student?.name?.charAt(0) || 'S'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{int.student?.name || 'Student'}</p>
                  <p className="text-xs text-gray-400 truncate">{int.student?.email || ''}</p>
                </div>
              </div>

              {/* Position */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{int.opportunity?.title || int.title}</p>
                <p className="text-xs text-gray-400">{int.companyName || ''}</p>
              </div>

              {/* Date & Time */}
              <div>
                <p className="text-sm font-medium text-gray-800">{new Date(int.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{int.time}</p>
              </div>

              {/* Type */}
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${int.interviewType === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                  {int.interviewType === 'Online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {int.interviewType}
                </span>
              </div>

              {/* Duration */}
              <span className="text-sm text-gray-600">{int.duration} min</span>

              {/* Platform/Location */}
              <div className="min-w-0">
                {int.interviewType === 'Online' ? (
                  <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <LinkIcon className="w-3 h-3 shrink-0" />{meetingPlatformLabel(int)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />{int.interviewLocation || 'Not set'}
                  </span>
                )}
              </div>

              {/* Status */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit ${statusColors[int.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDots[int.status]}`} />
                {int.status.charAt(0).toUpperCase() + int.status.slice(1)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                {int.status === 'scheduled' && (
                  <>
                    <button onClick={() => { setCompleteTarget(int); setShowCompleteModal(true); }}
                      className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Complete">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => {
                      setRescheduleTarget(int);
                      setRescheduleForm({ date: new Date(int.date).toISOString().split('T')[0], time: int.time, duration: String(int.duration), meetingType: int.meetingType || 'frontx', platform: int.platform, meetingLink: int.meetingLink || '', interviewLocation: int.interviewLocation || '', notes: int.notes || '' });
                      setShowRescheduleModal(true);
                    }}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Reschedule">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setCancelTarget(int); setShowCancelModal(true); }}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={() => deleteInterview(int._id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page + i - 2;
            if (p < 1 || p > totalPages) return null;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── DETAIL DRAWER ── */}
      <AnimatePresence>
        {showDetail && selectedInterview && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowDetail(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-gray-900">Interview Details</h3>
                <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                {/* Status banner */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${statusColors[selectedInterview.status]}`}>
                  <span className={`w-2 h-2 rounded-full ${statusDots[selectedInterview.status]}`} />
                  <span className="text-sm font-semibold capitalize">{selectedInterview.status}</span>
                </div>

                {selectedInterview.status === 'scheduled' && selectedInterview.interviewType === 'Online' && (
                  <button
                    onClick={() => handleJoinInterview(selectedInterview)}
                    disabled={joining}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-60"
                  >
                    <Video className="w-4 h-4" /> {joining ? 'Opening room…' : 'Join Interview'}
                  </button>
                )}

                {/* Student info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                    {selectedInterview.student?.profilePicture ? (
                      <img src={selectedInterview.student.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedInterview.student?.name}</p>
                    <p className="text-sm text-gray-500">{selectedInterview.student?.email}</p>
                    {selectedInterview.student?.department && (
                      <p className="text-xs text-gray-400">{selectedInterview.student.department} &middot; {selectedInterview.student.graduationYear || ''}</p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem icon={Briefcase} label="Position" value={selectedInterview.opportunity?.title || selectedInterview.title} />
                  <DetailItem icon={Building2} label="Company" value={selectedInterview.companyName || selectedInterview.opportunity?.companyName || ''} />
                  <DetailItem icon={Calendar} label="Date" value={new Date(selectedInterview.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                  <DetailItem icon={Clock} label="Time" value={`${selectedInterview.time} (${selectedInterview.duration} min)`} />
                  <DetailItem icon={selectedInterview.interviewType === 'Online' ? Video : MapPin} label="Type" value={selectedInterview.interviewType} />
                  {selectedInterview.interviewType === 'Online' ? (
                    <DetailItem icon={LinkIcon} label="Platform" value={meetingPlatformLabel(selectedInterview)} />
                  ) : (
                    <DetailItem icon={MapPin} label="Location" value={selectedInterview.interviewLocation || 'Not specified'} />
                  )}
                </div>

                {/* Panel members */}
                {selectedInterview.panelMembers?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Panel Members</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedInterview.panelMembers.map((p, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                          {p.name}{p.role ? ` (${p.role})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedInterview.notes && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-line">{selectedInterview.notes}</p>
                  </div>
                )}

                {/* Previous date if rescheduled */}
                {selectedInterview.previousDate && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 mb-1">Previous Schedule</p>
                    <p className="text-sm text-amber-800">
                      {new Date(selectedInterview.previousDate).toLocaleDateString()} at {selectedInterview.previousTime}
                    </p>
                  </div>
                )}

                {/* Cancel reason */}
                {selectedInterview.cancelReason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-700 mb-1">Cancel Reason</p>
                    <p className="text-sm text-red-800">{selectedInterview.cancelReason}</p>
                  </div>
                )}

                {/* Feedback */}
                {selectedInterview.feedback && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Feedback</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-line">{selectedInterview.feedback}</p>
                    {selectedInterview.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= selectedInterview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SCHEDULE MODAL ── */}
      <AnimatePresence>
        {showScheduleModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowScheduleModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-gray-900 text-lg">Schedule Interview</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Candidate</label>
                  <select
                    value={scheduleForm.studentId}
                    onChange={e => {
                      const app = applicants.find(a => a.student?._id === e.target.value || a.student === e.target.value);
                      if (app) {
                        setScheduleForm({
                          ...scheduleForm,
                          studentId: app.student?._id || app.student,
                          opportunityId: app.opportunity?._id || app.opportunity || '',
                          applicationId: app._id || '',
                          title: app.opportunity?.title || scheduleForm.title
                        });
                      } else {
                        setScheduleForm({ ...scheduleForm, studentId: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select a shortlisted candidate...</option>
                    {applicants.map(app => (
                      <option key={app._id} value={app.student?._id || app.student}>
                        {app.student?.name || 'Student'} - {app.opportunity?.title || 'Opportunity'}
                      </option>
                    ))}
                  </select>
                </div>

                <FormInput label="Interview Title" value={scheduleForm.title} onChange={v => setScheduleForm({ ...scheduleForm, title: v })} placeholder="e.g. Technical Interview Round 1" required />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Interview Date" type="date" value={scheduleForm.date} onChange={v => setScheduleForm({ ...scheduleForm, date: v })} required />
                  <FormInput label="Interview Time" type="time" value={scheduleForm.time} onChange={v => setScheduleForm({ ...scheduleForm, time: v })} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Interview Type</label>
                    <select value={scheduleForm.interviewType}
                      onChange={e => setScheduleForm({ ...scheduleForm, interviewType: e.target.value, platform: INTERVIEW_TYPES.find(t => t.value === e.target.value)?.subtypes[0] || '' })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                      {INTERVIEW_TYPES.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
                    </select>
                  </div>
                  <FormInput label="Duration (min)" type="number" value={scheduleForm.duration} onChange={v => setScheduleForm({ ...scheduleForm, duration: v })} />
                </div>

                {scheduleForm.interviewType === 'Online' ? (
                  <>
                    <MeetingTypeSelector
                      value={scheduleForm.meetingType}
                      onChange={meetingType => setScheduleForm({ ...scheduleForm, meetingType })}
                      accent="blue"
                    />
                    <AnimatePresence initial={false}>
                      {scheduleForm.meetingType === 'frontx' ? (
                        <motion.div
                          key="frontx-info"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-700">FrontX Live Interview</p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                A secure FrontX video room is created automatically when the interview is scheduled. The candidate joins instantly from the app — no external link needed.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="external-fields"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Platform</label>
                              <select value={scheduleForm.platform}
                                onChange={e => setScheduleForm({ ...scheduleForm, platform: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                                {['Google Meet', 'Zoom', 'Microsoft Teams', 'Other'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <FormInput label="Meeting Link" value={scheduleForm.meetingLink} onChange={v => setScheduleForm({ ...scheduleForm, meetingLink: v })} placeholder="https://meet.google.com/..." />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <FormInput label="Interview Location" value={scheduleForm.interviewLocation} onChange={v => setScheduleForm({ ...scheduleForm, interviewLocation: v })} placeholder="Office address or meeting room" />
                )}

                <FormInput label="Panel Members (comma-separated)" value={scheduleForm.panelMembers} onChange={v => setScheduleForm({ ...scheduleForm, panelMembers: v })} placeholder="e.g. John Doe, Jane Smith" />

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Additional Instructions</label>
                  <textarea rows={3} value={scheduleForm.notes} onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Any preparation instructions, documents to bring, etc." />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                <button onClick={() => setShowScheduleModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                <button onClick={handleSchedule}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Schedule Interview
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── RESCHEDULE MODAL ── */}
      <AnimatePresence>
        {showRescheduleModal && rescheduleTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowRescheduleModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-gray-900 text-lg">Reschedule Interview</h3>
                <button onClick={() => setShowRescheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Rescheduling "{rescheduleTarget.title}"</p>
                    <p className="text-xs text-amber-600 mt-1">The student will be notified of the schedule change.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="New Date" type="date" value={rescheduleForm.date} onChange={v => setRescheduleForm({ ...rescheduleForm, date: v })} required />
                  <FormInput label="New Time" type="time" value={rescheduleForm.time} onChange={v => setRescheduleForm({ ...rescheduleForm, time: v })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Duration (min)" type="number" value={rescheduleForm.duration} onChange={v => setRescheduleForm({ ...rescheduleForm, duration: v })} />
                  {rescheduleTarget.interviewType === 'Offline' ? (
                    <FormInput label="Location" value={rescheduleForm.interviewLocation} onChange={v => setRescheduleForm({ ...rescheduleForm, interviewLocation: v })} />
                  ) : null}
                </div>
                {rescheduleTarget.interviewType === 'Online' ? (
                  <>
                    <MeetingTypeSelector
                      value={rescheduleForm.meetingType}
                      onChange={meetingType => setRescheduleForm({ ...rescheduleForm, meetingType })}
                      accent="blue"
                    />
                    <AnimatePresence initial={false}>
                      {rescheduleForm.meetingType === 'frontx' ? (
                        <motion.div
                          key="frontx-info"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-700">FrontX Live Interview</p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                A secure FrontX video room is created automatically when rescheduled. The candidate joins instantly from the app — no external link needed.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="external-fields"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Platform</label>
                              <select value={rescheduleForm.platform} onChange={e => setRescheduleForm({ ...rescheduleForm, platform: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                                {['Google Meet', 'Zoom', 'Microsoft Teams', 'Other'].map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                            <FormInput label="Meeting Link" value={rescheduleForm.meetingLink} onChange={v => setRescheduleForm({ ...rescheduleForm, meetingLink: v })} placeholder="https://meet.google.com/..." />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : null}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Notes</label>
                  <textarea rows={2} value={rescheduleForm.notes} onChange={e => setRescheduleForm({ ...rescheduleForm, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                <button onClick={() => setShowRescheduleModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={handleReschedule}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Reschedule
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CANCEL MODAL ── */}
      <AnimatePresence>
        {showCancelModal && cancelTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowCancelModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Cancel Interview</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel the interview with <span className="font-semibold">{cancelTarget.student?.name}</span> for <span className="font-semibold">{cancelTarget.title}</span>?
              </p>
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Reason (optional)</label>
                <textarea rows={2} value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                  placeholder="Provide a reason for cancellation..." />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowCancelModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">Keep Interview</button>
                <button onClick={handleCancel}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all">
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── COMPLETE MODAL ── */}
      <AnimatePresence>
        {showCompleteModal && completeTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowCompleteModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-2xl shadow-2xl z-50"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-gray-900 text-lg">Complete Interview</h3>
                <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-sm text-gray-600">
                  Mark interview with <span className="font-semibold">{completeTarget.student?.name}</span> as completed?
                </p>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Feedback (optional)</label>
                  <textarea rows={3} value={completeForm.feedback} onChange={e => setCompleteForm({ ...completeForm, feedback: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    placeholder="Share feedback about the interview..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setCompleteForm({ ...completeForm, rating: completeForm.rating === star ? 0 : star })}>
                        <Star className={`w-7 h-7 transition-colors ${star <= completeForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                <button onClick={() => setShowCompleteModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={handleComplete}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Mark Complete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800">{value || '-'}</p>
    </div>
  </div>
);

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
  </div>
);

export default Interviews;
