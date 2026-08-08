import { API_BASE } from '../../config/api';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Users,
  Clock,
  Calendar,
  X,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UserCircle2,
  PlayCircle,
  Inbox,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Live' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ended', label: 'Ended' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

const STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  scheduled: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  ended: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
  cancelled: 'bg-red-500/15 text-red-600 border-red-500/30',
  expired: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
};

const STATUS_LABELS = {
  active: 'Live',
  scheduled: 'Scheduled',
  ended: 'Ended',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const formatDuration = (seconds) => {
  const total = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-200" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-slate-200 rounded-full w-1/2" />
        <div className="h-3 bg-slate-100 rounded-full w-1/3" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-6 bg-slate-100 rounded-full w-20" />
      <div className="h-6 bg-slate-100 rounded-full w-16" />
      <div className="h-6 bg-slate-100 rounded-full w-24" />
    </div>
  </div>
);

const AttendanceModal = ({ meeting, onClose }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    axios
      .get(`${API_BASE}/meetings/${meeting.roomId}/participants`)
      .then(({ data }) => {
        if (!cancelled) setRows(data.participants || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load attendance');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [meeting.roomId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Attendance
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{meeting.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close attendance"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-14 bg-slate-100 rounded-xl" />
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
              <p className="text-sm text-slate-600">{error}</p>
              <button
                onClick={() => onClose()}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Inbox className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">No participant records yet.</p>
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-3 font-semibold">Participant</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={String(row._id)} className="border-t border-slate-50">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          {row.userId?.profilePicture ? (
                            <img
                              src={row.userId.profilePicture}
                              alt={row.userId?.name || 'Participant'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                              <UserCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {row.userId?.name || 'Unknown'}
                              {row.role === 'host' && (
                                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-purple-600 bg-purple-100 rounded-full px-1.5 py-0.5">
                                  Host
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {row.userId?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-slate-600 capitalize">{row.role || 'participant'}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                            row.status === 'joined'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : row.status === 'invited'
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {row.durationSeconds > 0 ? formatDuration(row.durationSeconds) : '—'}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">
                          {row.joinedAt ? formatDateTime(row.joinedAt) : 'never joined'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const MeetingHistoryPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [attendanceMeeting, setAttendanceMeeting] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      const { data } = await axios.get(`${API_BASE}/meetings/history`, { params });
      setMeetings(data.meetings || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load meeting history');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleJoin = (meeting) => {
    if (meeting.status === 'active' || meeting.status === 'scheduled') {
      navigate(`/meeting/${meeting.roomId}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-[24px] p-6 md:p-8 mb-6 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-cyan-300" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Meetings</h1>
            </div>
            <p className="text-sm text-slate-300">
              History and attendance for every meeting you have hosted or joined.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusChange(f.value)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
              status === f.value
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No meetings found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            {status
              ? `There are no meetings with status "${STATUS_LABELS[status] || status}".`
              : 'You have not hosted or joined any meetings yet.'}
          </p>
          <div className="flex items-center gap-3 mt-6">
            {status && (
              <button
                onClick={() => handleStatusChange('')}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Clear filter
              </button>
            )}
            {!status && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Go to dashboard
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const canJoin = meeting.status === 'active' || meeting.status === 'scheduled';
            return (
              <motion.div
                key={String(meeting._id)}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <span
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        meeting.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'bg-gradient-to-br from-purple-500/15 to-blue-500/15 text-purple-600'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 truncate">{meeting.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">{meeting.roomId}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${STATUS_STYLES[meeting.status] || 'bg-slate-500/10 text-slate-600 border-slate-500/20'}`}
                        >
                          {STATUS_LABELS[meeting.status] || meeting.status}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {meeting.myRole === 'host' ? (
                            <span className="inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-purple-600" /> Host
                            </span>
                          ) : (
                            'Participant'
                          )}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 capitalize border border-slate-100">
                          {meeting.meetingType}
                        </span>
                        {meeting.recording && meeting.recording.url && (
                          <a
                            href={meeting.recording.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors inline-flex items-center gap-1"
                            title="Open recorded meeting video"
                          >
                            <ExternalLink className="w-3 h-3" /> Recording
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:w-auto lg:shrink-0 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs">{formatDateTime(meeting.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-xs">
                        {meeting.actualDurationSeconds != null
                          ? formatDuration(meeting.actualDurationSeconds)
                          : `${meeting.duration || 0}m planned`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-xs">
                        {meeting.joinedCount}/{meeting.participantCount} joined
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:shrink-0">
                    <button
                      onClick={() => setAttendanceMeeting(meeting)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Attendance
                    </button>
                    {canJoin && (
                      <button
                        onClick={() => handleJoin(meeting)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 hover:brightness-110 transition-all"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && pages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {total} meeting{total === 1 ? '' : 's'} · page {page} of {pages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {attendanceMeeting && (
          <AttendanceModal meeting={attendanceMeeting} onClose={() => setAttendanceMeeting(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingHistoryPage;
