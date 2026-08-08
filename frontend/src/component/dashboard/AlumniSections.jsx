import { API_BASE, SOCKET_URL } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, Share2, 
  BarChart3, Briefcase, MessageSquare, Award, 
  Clock, MapPin, Search, ChevronRight, 
  Download, Upload, Lightbulb, UserCheck, 
  Settings, Bell, Star, TrendingUp, 
  CheckCircle, XCircle, MoreVertical, FileText, Video, Eye, ShieldCheck, ThumbsUp, Heart, Info, ListFilter,
  ExternalLink, Tag, SlidersHorizontal, X, ArrowUpDown, Bookmark, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ScheduleSessionModal } from './ScheduleSessionModal';
import { SessionDetailsModal } from './SessionDetailsModal';
import { SessionFeedbackModal } from './SessionFeedbackModal';
import { MentorshipGroupSessionDetailsModal } from './MentorshipGroupSessionDetailsModal';
import { AlumniAnalyticsPage } from './AlumniAnalyticsPage';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { joinMentorshipMeeting, openMeeting, meetingPlatformLabel } from '../../meeting/lib/sessionJoin';

// Common Animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// 1. WELCOME SECTION
export const WelcomeSection = ({ userName }) => {
  const [stats, setStats] = useState({
    totalStudentsMentored: 0,
    activeMentorships: 0,
    upcomingSessions: 0,
    resourcesShared: 0
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/alumni/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();

    const socket = io(SOCKET_URL);
    
    // Listen for relevant updates to refresh stats
    socket.on('request_accepted', fetchStats);
    socket.on('request_updated', fetchStats);
    socket.on('mentorship:request', fetchStats);
    socket.on('mentorship:accepted', fetchStats);
    socket.on('session_updated', fetchStats);
    socket.on('new_resource', fetchStats);
    socket.on('resource:updated', fetchStats);
    socket.on('resource:deleted', fetchStats);
    socket.on('progress_updated', fetchStats);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white shadow-2xl shadow-slate-900/30" style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0F1B3D 25%, #162252 50%, #1E3A8A 75%, #0F172A 100%)' }}>
        {/* Glittering particle layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large ambient glow orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          {/* Floating glitter particles */}
          <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-[25%] right-[30%] w-1.5 h-1.5 bg-blue-300/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-[20%] left-[40%] w-1 h-1 bg-purple-300/30 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          <div className="absolute top-[40%] right-[15%] w-1 h-1 bg-cyan-300/25 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
          <div className="absolute top-[10%] left-[60%] w-0.5 h-0.5 bg-white/50 rounded-full animate-ping" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }} />
          <div className="absolute bottom-[30%] right-[25%] w-1 h-1 bg-blue-200/20 rounded-full animate-ping" style={{ animationDuration: '6s', animationDelay: '0.8s' }} />
          <div className="absolute top-[60%] left-[10%] w-0.5 h-0.5 bg-purple-200/25 rounded-full animate-ping" style={{ animationDuration: '3.8s', animationDelay: '2.5s' }} />
          <div className="absolute bottom-[10%] right-[50%] w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '5.5s', animationDelay: '1.2s' }} />
          {/* Soft animated light sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_8s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 drop-shadow-lg">Welcome back, {userName} 👋</h1>
            <p className="text-blue-100/80 text-lg max-w-xl leading-relaxed">
              Guide students, share knowledge, and build future innovators. Your mentorship is making a real difference.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students Mentored', value: stats.totalStudentsMentored, icon: Award, color: 'from-purple-500 to-indigo-500' },
          { label: 'Active Mentorships', value: stats.activeMentorships, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Upcoming Sessions', value: stats.upcomingSessions, icon: Calendar, color: 'from-emerald-500 to-teal-500' },
          { label: 'Resources Shared', value: stats.resourcesShared, icon: Share2, color: 'from-orange-500 to-amber-500' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// 2. STUDENT REQUESTS SECTION
export const StudentRequestsSection = ({ isPreview, onViewAll, onViewProfile, onViewChat }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulingStudent, setSchedulingStudent] = useState(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/mentorship/incoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.filter(r => r.status === 'pending'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const socket = io(SOCKET_URL);
    socket.on('request_updated', () => {
      fetchRequests();
    });
    socket.on('mentorship:request', () => {
      fetchRequests();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (req, status) => {
    // Optimistically update UI to instantly remove handled request
    setRequests(prev => prev.filter(r => r._id !== req._id));
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/mentorship/request/${req._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        if (status === 'accepted' && onViewChat) {
          onViewChat();
        }
      } else {
        // If it fails, we should ideally revert the optimistic update
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      // toast.error("An error occurred");
    }
  };

  const displayRequests = isPreview ? requests.slice(0, 3) : requests;

  if (loading) return null;
  if (requests.length === 0 && isPreview) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {isPreview ? (
        <motion.div variants={fadeInUp} className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Mentorship Requests</h2>
          <button onClick={onViewAll} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm transition-colors">
            View All Requests <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden rounded-[24px] p-8 md:p-12 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] shadow-2xl shadow-slate-900/30"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-cyan-400/5 rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Student Requests</h1>
              <p className="text-slate-300/80 max-w-xl leading-relaxed">
                Review mentorship requests from students, connect with aspiring learners, and help them achieve their academic and career goals.
              </p>
            </div>
            {requests.length > 0 && (
              <span className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-xl text-sm font-semibold shadow-lg shrink-0">
                {requests.length} Pending
              </span>
            )}
          </div>
        </motion.div>
      )}

      <div className={isPreview ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "grid grid-cols-1 xl:grid-cols-2 gap-6"}>
        {displayRequests.length === 0 && !isPreview && (
          <div className="p-8 text-center text-gray-500 bg-white/40 rounded-2xl border border-dashed border-gray-200">
            No pending student requests.
          </div>
        )}
        {displayRequests.map((req) => (
          <motion.div key={req._id} variants={fadeInUp} whileHover={{ y: -4 }} className={`bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6 items-start justify-between w-full`}>
            
            {/* Left Side: Student Info */}
            <div className="flex items-center gap-4 flex-1">
              <Avatar src={req.studentId?.profilePicture} alt="Student" size={64} className="border-2 border-white shadow-md" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{req.studentName}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {req.studentDepartment && <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{req.studentDepartment}</span>}
                  {req.studentSession && <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{req.studentSession}</span>}
                </div>
              </div>
            </div>
            
            {/* Middle Side: Request Info */}
            <div className={`w-full ${!isPreview ? 'border-t border-gray-100 pt-4' : 'pt-2'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{req.requestType}</span>
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!isPreview && (
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">"{req.message}"</p>
              )}
            </div>

            {/* Right Side: Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full border-t border-gray-100 pt-4 mt-auto">
              <button 
                onClick={() => onViewProfile && req.studentId && onViewProfile(req.studentId._id)}
                className="flex-1 lg:flex-none px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> View Profile
              </button>
              
              <button 
                onClick={() => handleUpdateStatus(req, 'accepted')} 
                className="flex-1 lg:flex-none px-4 py-2.5 bg-gray-900 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Accept
              </button>
              
              <button 
                onClick={() => handleUpdateStatus(req, 'rejected')} 
                className="flex-1 lg:flex-none px-4 py-2.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-100 hover:border-red-500 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Decline
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
    </motion.div>
  );
};

// 3. MENTORSHIP SESSIONS
export const MentorshipSessions = ({ isPreview, onViewAll }) => {
  const [tab, setTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [completingSession, setCompletingSession] = useState(null);
  const [joiningSession, setJoiningSession] = useState(null);
  const navigate = useNavigate();

  const handleJoin = async (session) => {
    setJoiningSession(session._id);
    try {
      const data = await joinMentorshipMeeting(session._id);
      openMeeting(data);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to open meeting. Please try again.');
    } finally {
      setJoiningSession(null);
    }
  };

  const isSessionEnded = (session) => {
    const dateStr = session.date || session.sessionDate;
    const timeStr = session.time || session.sessionTime;
    const duration = session.duration || session.sessionDuration || 30;
    if (!dateStr || !timeStr) return false;
    
    const dateObj = new Date(dateStr);
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeMatch) return false;
    
    let hours = parseInt(timeMatch[1], 10);
    const mins = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3];
    
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    
    dateObj.setHours(hours, mins, 0, 0);
    const endTime = new Date(dateObj.getTime() + duration * 60000);
    return new Date() > endTime;
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/mentorship-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSessions(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const socket = io(SOCKET_URL);
    socket.on('session_updated', fetchSessions);
    return () => socket.disconnect();
  }, []);

  const displaySessions = isPreview 
    ? sessions.filter(s => s.status === 'Upcoming').slice(0, 3) 
    : sessions.filter(s => s.status === (tab === 'upcoming' ? 'Upcoming' : 'Completed'));

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {!isPreview && (
        <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Mentorship Sessions</h1>
              <p className="text-blue-100/80 max-w-xl leading-relaxed">
                Manage your mentorship sessions, support students, and track every meeting in one place.
              </p>
            </div>
            <button onClick={() => navigate('/alumni/mentorship/create-session')} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0">
              + Create Session
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        {isPreview && <h2 className="text-2xl font-bold text-gray-800">Mentorship Sessions</h2>}
        {isPreview ? (
          <button onClick={onViewAll} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm transition-colors">
            View All Sessions <ChevronRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>

      {!isPreview && (
        <div className="flex gap-4 border-b border-gray-200 pb-2">
        {['upcoming', 'completed'].map((t) => (
          <button 
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 capitalize text-sm font-semibold transition-all relative ${tab === t ? 'text-purple-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {t} Sessions
            {tab === t && <motion.div layoutId="sessionTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />}
          </button>
        ))}
      </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className={isPreview ? "flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "space-y-4"}>
          {displaySessions.map(session => (
            <motion.div key={session._id} variants={fadeInUp} className={`bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex ${isPreview ? 'flex-col min-w-[320px] shrink-0 snap-start items-start justify-start gap-4' : 'items-center justify-between'} `}>
              <div className={`flex ${isPreview ? 'flex-col' : 'items-center'} gap-4 flex-1`}>
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shadow-inner shrink-0 ${session.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'} ${isPreview ? 'mb-2' : ''}`}>
                  <span className="text-xs uppercase">{new Date(session.sessionDate).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg leading-none">{new Date(session.sessionDate).getDate()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{session.sessionTitle}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">{session.sessionCategory}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.selectedStudents?.length || 0} Students</span>
                    <span>•</span>
                    <span>{session.sessionTime} ({session.sessionDuration}m)</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {meetingPlatformLabel(session)}</span>
                  </p>
                </div>
              </div>
              
              <div className={`flex gap-2 shrink-0 ${isPreview ? 'w-full mt-2' : ''}`}>
                <button onClick={() => setSelectedSession(session)} className="px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </button>
                {session.status === 'Upcoming' && (
                  <>
                    <button onClick={() => handleJoin(session)} disabled={joiningSession === session._id || isSessionEnded(session)} className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:bg-gray-100 disabled:text-gray-500">
                      <Video className="w-4 h-4" /> {isSessionEnded(session) ? 'Ended' : (joiningSession === session._id ? 'Opening...' : 'Join')}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
          {!isPreview && displaySessions.length === 0 && (
            <div className="p-8 text-center text-gray-500 bg-white/40 rounded-2xl border border-dashed border-gray-200">
              No {tab} sessions found.
            </div>
          )}
        </div>
      )}

      {selectedSession && (
        <MentorshipGroupSessionDetailsModal 
          isOpen={!!selectedSession} 
          onClose={() => setSelectedSession(null)} 
          session={selectedSession} 
          isAlumni={true}
          onRefresh={fetchSessions}
        />
      )}
    </motion.div>
  );
};

// 4. CAREER OPPORTUNITIES MANAGEMENT
export const CareerOpportunitiesManagement = ({ isPreview, onViewAll }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/jobs?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Failed to fetch opportunities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const displayJobs = isPreview ? jobs.slice(0, 3) : jobs;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Posted Opportunities</h2>
          {!isPreview && <p className="text-sm text-gray-500 mt-1">Manage jobs and internships you've shared with students.</p>}
        </div>
        {isPreview ? (
          <button onClick={onViewAll} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm transition-colors">
            View All Opportunities <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Post Opportunity
          </button>
        )}
      </div>

      <div className={isPreview ? "flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "grid md:grid-cols-2 gap-6"}>
        {loading && isPreview ? (
          [1, 2, 3].map(i => <div key={i} className="min-w-[300px] shrink-0 h-48 bg-gray-100 rounded-3xl animate-pulse" />)
        ) : displayJobs.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-gray-500 bg-white/80 rounded-3xl border border-dashed border-gray-200">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium">No opportunities posted yet</p>
            <p className="text-sm text-gray-500 mt-1">Post an opportunity to get started.</p>
          </div>
        ) : displayJobs.map(job => (
          <motion.div key={job._id} variants={fadeInUp} whileHover={{ y: -5 }} className={`bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden ${isPreview ? 'min-w-[300px] shrink-0 snap-start' : ''}`}>
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{job.title}</h3>
            <p className="text-purple-600 font-semibold text-sm mb-4">{job.company}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="font-bold text-gray-900">{job.jobType || 'Full-time'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Deadline</p>
                <p className="font-bold text-gray-900">{job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}</p>
              </div>
            </div>
            <button onClick={() => navigate('/dashboard/opportunities')} className="w-full py-2.5 bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl text-sm font-semibold transition-all border border-gray-200 hover:border-purple-200">
              View Details
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// 5. COLLABORATION & RESEARCH SECTION
export const CollaborationResearch = ({ isPreview, onViewAll }) => {
  const [topics, setTopics] = useState([]);
  const navigate = useNavigate();

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API_BASE}/collaboration/alumni`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const displayTopics = isPreview ? topics.slice(0, 2) : topics;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {isPreview ? (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Collaboration</h2>
          </div>
          <button onClick={onViewAll} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm transition-colors">
            Go to Collaboration <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden rounded-[24px] p-8 md:p-12 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] shadow-2xl shadow-slate-900/30"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-cyan-400/5 rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Collaboration</h1>
              <p className="text-slate-300/80 max-w-xl leading-relaxed">
                Discover innovative research ideas, collaborate with students and fellow alumni, and contribute to meaningful academic and industry-driven projects.
              </p>
            </div>
            <button onClick={() => navigate('/alumni/collaboration/create-topic')} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0">
              <Lightbulb className="w-4 h-4" /> Publish New Topic
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-8">
        {displayTopics.length === 0 && !isPreview && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium">No collaboration posts found</p>
            <p className="text-sm mt-1">Create your first collaboration topic to get started.</p>
          </div>
        )}
        {displayTopics.map(topic => (
          <motion.div
            key={topic._id}
            variants={fadeInUp}
            className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6 md:p-8">
              {/* Top Row: Title + Status */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#1E3A8A] transition-colors">{topic.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span className="font-semibold text-[#1E3A8A]">{topic.alumni?.name || 'You'}</span>
                    <span className="text-gray-300">|</span>
                    <span>{topic.alumni?.department || topic.type}</span>
                    <span className="text-gray-300">|</span>
                    <span>{topic.createdAt ? new Date(topic.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                  </div>
                </div>
                <span className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                  topic.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : topic.status === 'closed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-[#1E3A8A]/10 text-[#1E3A8A]'
                }`}>{topic.status}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{topic.overview || topic.description}</p>

              {/* Required Skills */}
              {topic.requiredSkills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {topic.requiredSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold">{skill}</span>
                  ))}
                </div>
              )}

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 pt-5 border-t border-gray-100">
                {topic.studentCount && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-[#1E3A8A]" />
                    <span><strong className="text-gray-900">{topic.studentCount}</strong> team size</span>
                  </span>
                )}
                {topic.applicantCount !== undefined && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span><strong className="text-gray-900">{topic.applicantCount || 0}</strong> applicant{(topic.applicantCount || 0) !== 1 ? 's' : ''}</span>
                  </span>
                )}
                {topic.deadline && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>Deadline: <strong className="text-gray-900">{new Date(topic.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                  </span>
                )}
                {topic.duration && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span><strong className="text-gray-900">{topic.duration}</strong></span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => isPreview ? onViewAll() : navigate(`/alumni/collaboration/${topic._id}/review`)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:shadow-[#1E3A8A]/30 transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Review Applications
                </button>
              </div>
              <button
                onClick={isPreview ? onViewAll : () => navigate(`/dashboard/collaboration/${topic._id}`)}
                className="px-4 py-2.5 text-[#1E3A8A] hover:bg-[#1E3A8A]/5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1"
              >
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// 6. COMMUNITY MANAGEMENT
export const CommunityManagement = ({ isPreview, onViewAll }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community-posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const socket = io(SOCKET_URL);
    socket.on('new_community_post', fetchPosts);
    socket.on('community_post_updated', fetchPosts);
    socket.on('new_community_comment', fetchPosts);
    return () => socket.disconnect();
  }, []);

  const displayPosts = isPreview ? posts.slice(0, 1) : posts;

  if (loading) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Community Interactions</h2>
        {isPreview ? (
          <button onClick={onViewAll} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm transition-colors">
            Go to Community <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => navigate('/create-community-post')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Write a Post
          </button>
        )}
      </div>

      <div className={isPreview ? "flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "space-y-4"}>
        {displayPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 w-full bg-white/40 rounded-2xl border border-dashed border-gray-200">
            No community posts available yet.
          </div>
        ) : (
          displayPosts.map(post => (
            <motion.div key={post._id} variants={fadeInUp} className={`bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 shadow-sm ${isPreview ? 'min-w-[300px] shrink-0 snap-start' : ''}`}>
              <div className="flex items-start gap-4 mb-4">
                <Avatar src={!post.isAnonymous ? post.originalAuthor?.profilePicture : null} alt={post.authorRole === 'alumni' ? 'Alumni' : 'Student'} size={40} className="border-2 border-white shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {post.authorRole === 'alumni' ? post.originalAuthor?.name || 'Registered Alumni' : (post.isAnonymous ? 'Anonymous Student' : post.originalAuthor?.name || 'Registered Student')}
                  </h4>
                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()} in {post.category}</p>
                </div>
              </div>
              {post.imageUrl && (
                <img src={post.imageUrl} alt="Post" className="w-full h-48 object-cover rounded-xl mb-4" />
              )}
              <p className="text-sm text-gray-600 mb-4">{post.content}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{post.totalReactions || 0} Likes</span>
                <span>{post.commentsCount || 0} Comments</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// 7. RESOURCE SHARING SECTION
export const ResourceSharingSection = ({ isPreview, onViewAll }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : (Array.isArray(data?.resources) ? data.resources : []));
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    const socket = io(SOCKET_URL);
    socket.on('new_resource', (resource) => {
      setFiles(prev => [resource, ...prev]);
    });
    socket.on('resource:updated', (resource) => {
      setFiles(prev => prev.map(f => f._id === resource._id ? resource : f));
    });
    socket.on('resource:deleted', ({ resourceId, _id }) => {
      const id = resourceId || _id;
      setFiles(prev => prev.filter(f => f._id !== id));
    });
    return () => socket.disconnect();
  }, []);

  const displayFiles = isPreview ? files.slice(0, 5) : files;

  if (loading) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {!isPreview && (
        <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] shadow-2xl shadow-slate-900/30">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-transparent to-white/[0.03] animate-[shimmer_8s_ease-in-out_infinite]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Resources</h1>
              <p className="text-blue-100/80 max-w-xl leading-relaxed">
                Share valuable learning materials, templates, guides, and educational resources to help students learn, grow, and succeed.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/alumni/resources/create')}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
              >
                <Upload className="w-4 h-4" /> Create
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/alumni/resources/upload')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0"
              >
                <Upload className="w-4 h-4" /> Upload
              </motion.button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Resource Sharing</h2>
          {!isPreview && <p className="text-sm text-gray-500 mt-1">Upload guides, templates, and materials for students.</p>}
        </div>
        {isPreview ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/alumni/resources/create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
            >
              <Upload className="w-3.5 h-3.5" /> Create
            </button>
            <button onClick={onViewAll} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm transition-colors">
              View All Resources <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/alumni/resources/create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
            >
              <Upload className="w-3.5 h-3.5" /> Create
            </button>
            <button
              onClick={() => navigate('/alumni/resources/upload')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-medium shadow-md transition-all flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        )}
      </div>

      {files.length === 0 ? (
        <div className="p-8 text-center text-gray-500 w-full bg-white/40 rounded-2xl border border-dashed border-gray-200">
          No resources shared yet.
        </div>
      ) : (
        <div className={isPreview ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {displayFiles.map((file, idx) => (
            <motion.div
              key={file._id || idx}
              variants={fadeInUp}
              onClick={() => navigate(`/dashboard/resources/${file._id}`, { state: { resource: file } })}
              className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{file.title}</h4>
                  <p className="text-xs text-gray-500">{file.category} • {new Date(file.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">by {file.alumniId?.name || 'Alumni'}</p>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors shrink-0">
                <Download className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// 8. ANALYTICS SECTION
export const AnalyticsSection = ({ isPreview, onViewAll }) => {
  if (isPreview) {
    // Return a simplified preview card for dashboard home
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Mentorship Impact</h2>
            <p className="text-sm text-gray-500 mt-1">Track your contribution to the student community.</p>
          </div>
          <button onClick={onViewAll} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm transition-colors">
            Detailed Analytics <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <h3 className="font-bold mb-8 opacity-90">Overall Rating</h3>
          <div className="text-center">
            <div className="text-6xl font-black mb-2 tracking-tighter">4.9<span className="text-2xl text-purple-200">/5</span></div>
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${i===5 ? 'text-purple-300' : 'text-yellow-400 fill-yellow-400'}`} />)}
            </div>
            <p className="text-sm text-purple-100 font-medium">Top 5% of Mentors</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render the full dedicated analytics page
  return <AlumniAnalyticsPage />;
};

// 9. COLLABORATION REVIEW
export const CollaborationReview = ({ onViewProfile }) => {
  const [toastMessage, setToastMessage] = useState('');
  
  const interestedStudents = [
    { id: 1, name: 'Alice Wang', dept: 'Computer Science', image: 'Alice Wang', session: '2023-24', studentId: 'CS1023', interests: ['Machine Learning', 'Systems'], about: 'Passionate about distributed systems.' },
    { id: 2, name: 'David Smith', dept: 'Software Engineering', image: 'David Smith', session: '2024-25', studentId: 'SE2024', interests: ['Cloud', 'DevOps'], about: 'Looking to optimize infrastructure.' },
    { id: 3, name: 'Fatima Noor', dept: 'Data Science', image: 'Fatima Noor', session: '2024-25', studentId: 'DS3042', interests: ['Deep Learning', 'NLP'], about: 'Interested in language models.' },
    { id: 4, name: 'Sarah Ahmed', dept: 'Computer Science', image: 'Sarah Ahmed', session: '2026', studentId: 'CS9982', interests: ['Web', 'AI'], about: 'Exploring tech.' },
    { id: 5, name: 'Rahul Patel', dept: 'Software Engineering', image: 'Rahul Patel', session: '2025', studentId: 'SE8831', interests: ['Full Stack'], about: 'Building products.' },
  ];

  const handleAccept = (name) => {
    setToastMessage(`Congratulations on being selected for the research collaboration on AI-Driven Optimization in Distributed Systems. This achievement reflects your dedication and potential. Wishing you great success in this exciting journey.`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 relative h-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl border border-green-200 p-5 rounded-2xl shadow-2xl max-w-lg w-full flex gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-green-800 font-bold mb-1">Collaboration Accepted!</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage('')} className="absolute top-4 right-4 text-gray-500 hover:text-gray-600">
              <XCircle className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Review Students</h2>
          <p className="text-sm text-gray-500 mt-1">Topic: AI-Driven Optimization in Distributed Systems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {interestedStudents.map(student => (
          <motion.div key={student.id} variants={fadeInUp} whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full justify-between hover:shadow-lg hover:border-purple-200 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <Avatar src={student.profilePicture} alt={student.name} size={56} className="border-2 border-white shadow-sm" />
              <div>
                <h3 className="font-bold text-gray-900 text-base">{student.name}</h3>
                <p className="text-xs font-semibold text-purple-600 mt-0.5">{student.dept}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-auto">
              <button 
                onClick={() => handleAccept(student.name)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" /> Accept
              </button>
              <button 
                onClick={() => onViewProfile(student)}
                className="w-full py-2 bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 rounded-xl text-sm font-semibold transition-all"
              >
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// 10. COMMUNITY RESOURCES SECTION
const FILE_TYPE_ICONS = {
  PDF: FileText, PPT: FileText, DOCX: FileText, ZIP: FileText, LINK: ExternalLink, FILE: FileText
};
const FILE_TYPE_COLORS = {
  PDF: 'text-red-600 bg-red-50', PPT: 'text-orange-600 bg-orange-50',
  DOCX: 'text-blue-600 bg-blue-50', ZIP: 'text-yellow-600 bg-yellow-50',
  LINK: 'text-green-600 bg-green-50', FILE: 'text-gray-600 bg-gray-50'
};

const categoryOptions = [
  'All', 'Career Guidance', 'Interview Preparation', 'Technical Skills',
  'Soft Skills', 'Academic Resources', 'Research', 'Industry Insights', 'Other'
];

const fileTypeOptions = ['All', 'PDF', 'PPT', 'DOCX', 'ZIP', 'LINK'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most-downloaded', label: 'Most Downloaded' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'popular', label: 'Popular' },
  { value: 'alphabetical', label: 'Alphabetical' }
];

export const CommunityResourcesSection = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [fileType, setFileType] = useState('All');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      if (fileType !== 'All') params.set('fileType', fileType);
      if (sort) params.set('sort', sort);

      const res = await fetch(`${API_BASE}/resources/community/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setResources(await res.json());
      }
    } catch (err) {
      console.error('Error fetching community resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    const socket = io(SOCKET_URL);
    socket.on('new_resource', fetchResources);
    socket.on('resource:updated', fetchResources);
    socket.on('resource:deleted', fetchResources);
    socket.on('resource_updated', fetchResources);
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResources(), 300);
    return () => clearTimeout(timer);
  }, [search, category, fileType, sort]);

  const getFileType = (r) => {
    if (r.fileType) return r.fileType;
    const url = r.fileUrl || r.externalLink || '';
    const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
    if (r.uploadType === 'ExternalLink') return 'LINK';
    if (['pdf'].includes(ext)) return 'PDF';
    if (['ppt', 'pptx'].includes(ext)) return 'PPT';
    if (['doc', 'docx'].includes(ext)) return 'DOCX';
    if (['zip', 'rar', '7z'].includes(ext)) return 'ZIP';
    return 'FILE';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDownload = async (e, r) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/resources/community/${r._id}/download`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.uploadType === 'ExternalLink' && r.externalLink) {
        window.open(r.externalLink, '_blank');
      } else if (r.fileUrl) {
        window.open(r.fileUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = async (r) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/resources/community/${r._id}/view`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
    navigate(`/dashboard/resources/${r._id}`, { state: { resource: r, readOnly: true } });
  };

  const FileTypeIcon = ({ type }) => {
    const Icon = FILE_TYPE_ICONS[type] || FileText;
    const colorClass = FILE_TYPE_COLORS[type] || 'text-gray-600 bg-gray-50';
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    );
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 pt-10 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Community Resources</h2>
          <p className="text-sm text-gray-500 mt-1">Discover learning materials shared by alumni across the university community.</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${showFilters ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white/80 text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, description, tags..."
          className="w-full pl-12 pr-10 py-3 bg-white/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-gray-100 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        category === c ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">File Type</p>
                <div className="flex flex-wrap gap-2">
                  {fileTypeOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFileType(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        fileType === f ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSort(s.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                        sort === s.value ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {sort === s.value && <ArrowUpDown className="w-3 h-3" />}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resource Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-1">No community resources have been shared yet.</h3>
          <p className="text-sm text-gray-500">Be the first to share a resource with the community!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {resources.map((r) => {
            const ft = getFileType(r);
            return (
              <motion.div
                key={r._id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col overflow-hidden group"
              >
                {/* Badges */}
                <div className="relative">
                  {r.badges && r.badges.length > 0 && (
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                      {r.badges.includes('NEW') && (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold rounded-md shadow-sm">NEW</span>
                      )}
                      {r.badges.includes('Most Downloaded') && (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-md shadow-sm flex items-center gap-1">
                          <Download className="w-3 h-3" /> Most Downloaded
                        </span>
                      )}

                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  {/* Top row: icon + type */}
                  <div className="flex items-start gap-3 mb-3">
                    <FileTypeIcon type={ft} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate text-base">{r.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{r.category}</span>
                        <span className="text-xs text-gray-500">{ft}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{r.description}</p>

                  {/* Tags */}
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {r.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-medium">{tag}</span>
                      ))}
                      {r.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-gray-500 text-[10px] font-medium">+{r.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Uploader Info */}
                  <div className="flex items-center gap-2.5 mb-3 pt-3 border-t border-gray-100">
                    <Avatar src={r.alumniId?.profilePicture} alt="Alumni" size={28} className="border border-gray-200 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{r.alumniId?.name || 'Alumni'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{r.alumniId?.department || ''}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 ml-auto shrink-0">{formatDate(r.createdAt)}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {r.downloads}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(r)}
                      className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-all"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, r)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-xs font-semibold hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> {ft === 'LINK' ? 'Open' : 'Download'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
