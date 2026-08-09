import { API_BASE } from '../../config/api';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, Loader2, ChevronLeft, ChevronRight, MapPin,
  X, CheckCircle, AlertTriangle, Eye, CalendarDays, Briefcase,
  Building2, User, Link as LinkIcon, Star
} from 'lucide-react';
import { joinInterviewMeeting, openMeeting, meetingPlatformLabel, interviewJoinState, canJoinInterview } from '../../meeting/lib/sessionJoin';
import { useMeetingClock } from '../../meeting/hooks/useMeetingClock';

const API_URL = API_BASE;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const StudentInterviews = () => {
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
  const [joining, setJoining] = useState(false);
  const meetingNow = useMeetingClock();
  const navigate = useNavigate();

  const handleJoinInterview = async (interview) => {
    setJoining(true);
    try {
      const data = await joinInterviewMeeting(interview._id);
      openMeeting(data, navigate);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to open interview room. Please try again.');
    } finally {
      setJoining(false);
    }
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

  useEffect(() => { fetchInterviews(); }, [statusFilter, page]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/student/interviews`, {
        params: { status: statusFilter, page, limit: 20 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(res.data.interviews);
      setTotalPages(res.data.pages);
      if (res.data.stats) setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const statCards = [
    { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
    { label: "Today's", value: stats.today, icon: Clock, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50' },
    { label: 'Cancelled', value: stats.cancelled, icon: AlertTriangle, color: 'from-red-400 to-rose-600', bg: 'bg-red-50' }
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Interviews</h1>
            <p className="text-blue-200/80 text-sm md:text-base max-w-xl">
              View and track all your scheduled interviews, their status, and important details.
            </p>
          </div>
          <button
            onClick={() => setView(view === 'table' ? 'calendar' : 'table')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all"
          >
            <CalendarDays className="w-4 h-4" />
            {view === 'table' ? 'Calendar View' : 'Table View'}
          </button>
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
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === f ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
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
                  className={`bg-white min-h-[80px] md:min-h-[100px] p-2 cursor-pointer hover:bg-purple-50/50 transition-colors ${today ? 'ring-2 ring-purple-500 ring-inset' : ''}`}>
                  {day && (
                    <>
                      <span className={`text-xs font-semibold ${today ? 'text-purple-600' : 'text-gray-700'}`}>{day}</span>
                      <div className="mt-1 space-y-1">
                        {dayInterviews.slice(0, 3).map(int => (
                          <div key={int._id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate ${statusColors[int.status] || 'bg-gray-100 text-gray-600'}`}>
                            {int.recruiter?.companyName || int.companyName || 'Interview'}
                          </div>
                        ))}
                        {dayInterviews.length > 3 && (
                          <span className="text-[10px] text-gray-500 font-medium">+{dayInterviews.length - 3} more</span>
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
          <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_140px] gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-100">
            {['Position', 'Company', 'Date & Time', 'Type', 'Platform/Location', 'Status', 'Actions'].map(h => (
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
              <p className="text-sm text-gray-500 mt-1">Your interviews will appear here once a recruiter schedules one.</p>
            </div>
          ) : interviews.map((int, idx) => (
            <motion.div
              key={int._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_140px] gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors items-center cursor-pointer"
              onClick={() => { setSelectedInterview(int); setShowDetail(true); }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{int.opportunity?.title || int.title}</p>
                <p className="text-xs text-gray-500">{int.recruiter?.name || ''}</p>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                  {int.recruiter?.companyLogo ? (
                    <img src={int.recruiter.companyLogo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <p className="text-sm text-gray-700 truncate">{int.companyName || int.recruiter?.companyName || 'Company'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">{new Date(int.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{int.time}</p>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${int.interviewType === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                  {int.interviewType === 'Online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {int.interviewType}
                </span>
              </div>

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

              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit ${statusColors[int.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDots[int.status]}`} />
                {int.status.charAt(0).toUpperCase() + int.status.slice(1)}
              </span>

              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                {canJoinInterview(int, meetingNow) && (
                  <button onClick={() => handleJoinInterview(int)} disabled={joining}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-60">
                    <Video className="w-3 h-3" /> {joining ? 'Opening…' : 'Join'}
                  </button>
                )}
                <button onClick={() => { setSelectedInterview(int); setShowDetail(true); }}
                  className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="View Details">
                  <Eye className="w-4 h-4" />
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
                className={`w-9 h-9 rounded-xl text-sm font-semibold ${p === page ? 'bg-purple-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${statusColors[selectedInterview.status]}`}>
                  <span className={`w-2 h-2 rounded-full ${statusDots[selectedInterview.status]}`} />
                  <span className="text-sm font-semibold capitalize">{selectedInterview.status}</span>
                </div>

                {canJoinInterview(selectedInterview, meetingNow) && (
                  <button
                    onClick={() => handleJoinInterview(selectedInterview)}
                    disabled={joining}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60"
                  >
                    <Video className="w-4 h-4" /> {joining ? 'Opening room…' : interviewJoinState(selectedInterview, meetingNow).label}
                  </button>
                )}

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                    {selectedInterview.recruiter?.companyLogo ? (
                      <img src={selectedInterview.recruiter.companyLogo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedInterview.companyName || selectedInterview.recruiter?.companyName || 'Company'}</p>
                    <p className="text-sm text-gray-500">{selectedInterview.recruiter?.name}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

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

                {selectedInterview.notes && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Instructions</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-line">{selectedInterview.notes}</p>
                  </div>
                )}

                {selectedInterview.previousDate && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 mb-1">Previous Schedule</p>
                    <p className="text-sm text-amber-800">
                      {new Date(selectedInterview.previousDate).toLocaleDateString()} at {selectedInterview.previousTime}
                    </p>
                  </div>
                )}

                {selectedInterview.cancelReason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-700 mb-1">Cancel Reason</p>
                    <p className="text-sm text-red-800">{selectedInterview.cancelReason}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
    <div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800">{value || '-'}</p>
    </div>
  </div>
);

export default StudentInterviews;
