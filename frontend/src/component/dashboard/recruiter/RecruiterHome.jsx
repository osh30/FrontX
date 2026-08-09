import { API_BASE } from '../../../config/api';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Briefcase, Users, Calendar, TrendingUp,
  Clock, FileText, Bell, Building2, Video
} from 'lucide-react';
import { joinInterviewMeeting, openMeeting, canJoinInterview } from '../../../meeting/lib/sessionJoin';
import { useMeetingClock } from '../../../meeting/hooks/useMeetingClock';

const API_URL = API_BASE;

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const incrementTime = duration / end;
    const step = Math.max(1, Math.floor(end / 100));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, incrementTime * step);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span ref={ref}>{count}</span>;
};

const RecruiterHome = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const meetingNow = useMeetingClock();

  const handleJoinInterview = async (int) => {
    setJoining(true);
    try {
      const data = await joinInterviewMeeting(int._id);
      openMeeting(data);
    } catch (err) {
      console.error('Failed to open interview room', err);
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/recruiter/dashboard`);
      setStats(res.data.stats);
      setRecentApps(res.data.recentApplications || []);
      setUpcomingInterviews(res.data.upcomingInterviews || []);
      setNotifications(res.data.recentNotifications || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Opportunities', value: stats?.totalOpportunities || 0, icon: Briefcase, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Total Applicants', value: stats?.totalApplicants || 0, icon: Users, color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Interviews Scheduled', value: stats?.scheduledInterviews || 0, icon: Calendar, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', textColor: 'text-emerald-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200/60 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200/60 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200/60 rounded-2xl" />
          <div className="h-64 bg-gray-200/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 50%, rgba(15,23,42,0.97) 100%)',
        }}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: 'linear-gradient(110deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSweep 6s ease-in-out infinite',
          }} />

        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,1), transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-8 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,1), transparent 70%)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Manage your company's hiring activities, connect with talented students, and track recruitment progress from one place.
            </p>
          </div>
          {user?.companyName && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center backdrop-blur-sm shrink-0">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
            </div>
          )}
        </div>

        <style>{`
          @keyframes shimmerSweep {
            0%, 100% { background-position: -200% 0; }
            50% { background-position: 200% 0; }
          }
        `}</style>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <TrendingUp className={`w-4 h-4 ${card.textColor} opacity-40`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={card.value} />
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Recent Applications</h3>
            <FileText className="w-4 h-4 text-gray-500" />
          </div>
          <div className="divide-y divide-gray-50">
            {recentApps.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No applications yet</p>
                <p className="text-xs text-gray-300 mt-1">Applications will appear here when students apply</p>
              </div>
            ) : (
              recentApps.map((app, idx) => (
                <div key={app._id || idx} className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">
                      {app.student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{app.student?.name || 'Student'}</p>
                    <p className="text-xs text-gray-500 truncate">{app.opportunity?.title || 'Opportunity'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    app.status === 'shortlisted' ? 'bg-amber-50 text-amber-600' :
                    app.status === 'rejected' ? 'bg-red-50 text-red-500' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Upcoming Interviews</h3>
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingInterviews.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No upcoming interviews</p>
                <p className="text-xs text-gray-300 mt-1">Scheduled interviews will appear here</p>
              </div>
            ) : (
              upcomingInterviews.map((int, idx) => (
                <div key={int._id || idx} className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{int.title}</p>
                    <p className="text-xs text-gray-500">{int.student?.name || 'Student'} &middot; {new Date(int.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium shrink-0">{int.time}</span>
                  {canJoinInterview(int, meetingNow) && (
                    <button onClick={() => handleJoinInterview(int)} disabled={joining}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-60 shrink-0">
                      <Video className="w-3 h-3" /> {joining ? 'Opening…' : 'Join'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Latest Notifications</h3>
            <Bell className="w-4 h-4 text-gray-500" />
          </div>
          <div className="divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No notifications</p>
                <p className="text-xs text-gray-300 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div key={n._id || idx} className={`px-6 py-3.5 flex items-center gap-3 transition-colors ${n.isRead ? '' : 'bg-blue-50/30'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 truncate">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecruiterHome;
