import { API_BASE, SOCKET_URL } from '../../config/api';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Users, GraduationCap, ExternalLink } from 'lucide-react';
import { io } from 'socket.io-client';
import { joinSessionMeeting, joinMentorshipMeeting, openMeeting, meetingPlatformLabel } from '../../meeting/lib/sessionJoin';

const normalizeSession = (s, type) => {
  if (type === 'group') {
    return {
      _id: s._id,
      title: s.sessionTitle,
      type: s.sessionCategory || 'Group Session',
      alumni: s.alumniId,
      studentCount: s.selectedStudents?.length || 0,
      meetingType: s.meetingType,
      platform: s.meetingPlatform,
      meetingLink: s.meetingLink,
      date: s.sessionDate,
      time: s.sessionTime,
      duration: s.sessionDuration,
      status: s.status,
      description: s.sessionDescription,
      agenda: s.agenda,
      students: s.selectedStudents,
      _sessionType: 'group'
    };
  }
  return { ...s, _sessionType: 'one-on-one' };
};

const SessionsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const handleJoin = async (session) => {
    setJoiningId(session._id);
    try {
      const data = session._sessionType === 'group'
        ? await joinMentorshipMeeting(session._id)
        : await joinSessionMeeting(session._id);
      openMeeting(data, navigate);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to open meeting. Please try again.');
    } finally {
      setJoiningId(null);
    }
  };

  const fetchAllSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [oneOnOneRes, groupRes] = await Promise.all([
        fetch(`${API_BASE}/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/mentorship-sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      let all = [];
      if (oneOnOneRes.ok) {
        const data = await oneOnOneRes.json();
        all = all.concat(data.map(s => normalizeSession(s, 'one-on-one')));
      }
      if (groupRes.ok) {
        const data = await groupRes.json();
        all = all.concat(data.map(s => normalizeSession(s, 'group')));
      }

      all.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setSessions(all);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('session_updated', fetchAllSessions);
    return () => { socket.disconnect(); };
  }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const upcoming = sessions.filter(s => s.status === 'Scheduled' || s.status === 'Upcoming');
  const past = sessions.filter(s => s.status === 'Completed' || s.status === 'Cancelled');

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/10 shadow-[0_0_80px_40px_rgba(255,255,255,0.05)]" />
        </div>
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/20"
          >
            <Calendar className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">My Sessions</h1>
          <p className="text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            View and join your scheduled mentorship sessions. Stay connected with your mentors, track upcoming meetings, and continue your learning journey.
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-1">No sessions yet</p>
          <p className="text-sm text-gray-500">When an alumni schedules a session with you, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> Upcoming Sessions ({upcoming.length})
              </h2>
              <div className="space-y-4">
                {upcoming.map((session, idx) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -2 }}
                    id={highlightId === session._id ? 'highlighted-session' : undefined}
                    className={`bg-white/60 backdrop-blur-md rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer ${
                      highlightId === session._id ? 'border-purple-400 ring-2 ring-purple-200' : 'border-white/50'
                    }`}
                    onClick={() => navigate(`/dashboard/sessions/${session._id}?type=${session._sessionType}`)}
                  >
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 shadow-sm font-bold flex-col shrink-0">
                        <span className="text-[10px] uppercase">{new Date(session.date || session.sessionDate).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg leading-none">{new Date(session.date || session.sessionDate).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 truncate">{session.title}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">{session.type}</span>
                          {session._sessionType === 'group' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center gap-1">
                              <Users className="w-3 h-3" /> Group
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" /> {session.alumni?.name || session.alumniId?.name || 'Mentor'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {session.time || session.sessionTime}
                          </span>
                          {session.meetingType || session.platform || session.meetingPlatform ? (
                            <span className="flex items-center gap-1">
                              <Video className="w-3.5 h-3.5" /> {meetingPlatformLabel(session)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/dashboard/sessions/${session._id}?type=${session._sessionType}`)}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
                        >
                          View Details
                        </button>
                        {(session.meetingType === 'frontx' || session.meetingLink) && (
                          <button
                            onClick={() => handleJoin(session)}
                            disabled={joiningId === session._id}
                            className="px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-sm bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg flex items-center gap-1.5 disabled:opacity-60"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> {joiningId === session._id ? 'Opening…' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" /> Past Sessions ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((session, idx) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="bg-white/40 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/dashboard/sessions/${session._id}?type=${session._sessionType}`)}
                  >
                    <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold flex-col shrink-0">
                        <span className="text-[10px] uppercase">{new Date(session.date || session.sessionDate).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-base leading-none">{new Date(session.date || session.sessionDate).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-gray-800 truncate">{session.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            session.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                          }`}>{session.status}</span>
                        </div>
                        <p className="text-sm text-gray-500">{session.alumni?.name || session.alumniId?.name || 'Mentor'} &bull; {formatDate(session.date || session.sessionDate)}</p>
                      </div>
                      <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
