import { API_BASE } from '../../config/api';
﻿import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import axios from 'axios';
import {
  Users, MessageSquare, FileText, BookOpen, TrendingUp,
  Shield, AlertTriangle, LogIn, Activity, Clock,
  ChevronRight, Zap,
} from 'lucide-react';

const API_URL = API_BASE;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const CountUp = ({ value, duration = 1400, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (!inView || value === undefined || value === null) return;
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (num === 0) { setDisplay(0); return; }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Number.isInteger(num) ? Math.floor(eased * num) : parseFloat((eased * num).toFixed(1)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
};

const HeroParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[
      { left: '8%', top: '18%', size: 3, delay: 0, dur: 8 },
      { left: '85%', top: '22%', size: 2, delay: 1.2, dur: 9 },
      { left: '22%', top: '75%', size: 2.5, delay: 0.6, dur: 7 },
      { left: '72%', top: '80%', size: 2, delay: 2, dur: 8.5 },
      { left: '50%', top: '8%', size: 1.5, delay: 2.5, dur: 10 },
      { left: '12%', top: '55%', size: 2, delay: 0.8, dur: 7.5 },
      { left: '90%', top: '50%', size: 1.8, delay: 1.8, dur: 9 },
      { left: '35%', top: '88%', size: 2.2, delay: 3, dur: 6.5 },
      { left: '65%', top: '35%', size: 1.5, delay: 1.5, dur: 9.5 },
      { left: '45%', top: '62%', size: 2, delay: 3.2, dur: 7 },
      { left: '78%', top: '12%', size: 1.2, delay: 0.3, dur: 11 },
      { left: '18%', top: '40%', size: 1.8, delay: 2.8, dur: 8 },
    ].map((p, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          left: p.left, top: p.top,
          width: p.size, height: p.size,
          background: i % 3 === 0
            ? 'radial-gradient(circle, rgba(148,163,184,0.8), transparent)'
            : i % 3 === 1
              ? 'radial-gradient(circle, rgba(96,165,250,0.7), transparent)'
              : 'radial-gradient(circle, rgba(167,139,250,0.6), transparent)',
          animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }}
      />
    ))}
  </div>
);

const HeroCard = ({ children, className = '' }) => (
  <div className={`relative overflow-hidden rounded-3xl p-[1px] ${className}`}>
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.08]" />
    <div
      className="relative rounded-[calc(1.5rem-1px)] overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            background: 'linear-gradient(115deg, transparent 15%, rgba(148,163,184,0.6) 35%, rgba(255,255,255,0.9) 50%, rgba(148,163,184,0.6) 65%, transparent 85%)',
            backgroundSize: '250% 100%',
            animation: 'shimmerSweep 8s ease-in-out infinite',
          }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.3) 45%, rgba(139,92,246,0.4) 50%, rgba(59,130,246,0.3) 55%, transparent 75%)',
            backgroundSize: '300% 100%',
            animation: 'shimmerSweep 12s ease-in-out infinite 2s',
          }} />
      </div>
      <HeroParticles />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  </div>
);

const DarkGlassCard = ({ children, className = '', onClick, hoverEffect = true, delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    custom={delay}
    whileHover={hoverEffect && onClick ? { scale: 1.012, y: -3 } : hoverEffect ? { y: -2 } : undefined}
    whileTap={onClick ? { scale: 0.99 } : undefined}
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-[1px] ${onClick ? 'cursor-pointer group' : ''} ${className}`}
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.07] transition-all duration-300 group-hover:from-white/[0.12] group-hover:via-white/[0.06] group-hover:to-white/[0.1]" />
    <div
      className="relative rounded-[calc(1rem-1px)] p-6 h-full transition-all duration-300"
      style={{
        background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(1rem-1px)]">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            background: 'linear-gradient(115deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
            backgroundSize: '250% 100%',
            animation: 'shimmerSweep 8s ease-in-out infinite',
          }} />
      </div>
      {onClick && (
        <div className="absolute inset-0 rounded-[calc(1rem-1px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: '0 0 30px rgba(59,130,246,0.06), inset 0 1px 0 rgba(255,255,255,0.06)' }} />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  </motion.div>
);

const SectionHeading = ({ children, subtitle, delay = 0 }) => (
  <motion.div variants={fadeUp} custom={delay}>
    <h2 className="text-[30px] font-[800] tracking-[-0.025em] leading-tight" style={{ color: '#1E293B' }}>{children}</h2>
    {subtitle && <p className="text-[16px] font-normal mt-2 leading-[1.6]" style={{ color: '#475569' }}>{subtitle}</p>}
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, subtext, color, glow, trend, badge, delay }) => (
  <DarkGlassCard delay={delay}>
    <div className="flex items-start justify-between">
      <div className="space-y-2.5 flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-[32px] font-bold text-white tracking-tight leading-none">
          <CountUp value={value} />
        </p>
        {subtext && <p className="text-[11px] text-slate-500 leading-relaxed">{subtext}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative ${color}`}>
        <Icon className="w-5 h-5 text-white relative z-10" />
        <div className={`absolute inset-0 rounded-xl blur-md opacity-40 ${glow}`} />
      </div>
    </div>
    {(trend !== undefined || badge) && (
      <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-2">
        {trend !== undefined && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">+{trend}</span>
            <span className="text-[10px] text-slate-500">this month</span>
          </div>
        )}
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
            {badge}
          </span>
        )}
      </div>
    )}
  </DarkGlassCard>
);

const QuickAction = ({ icon: Icon, label, desc, path, navigate, delay }) => (
  <DarkGlassCard delay={delay} onClick={() => navigate(path)}>
    <div className="flex items-center gap-4 py-1">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/15 border border-blue-500/10 flex items-center justify-center shrink-0 group-hover:border-blue-400/20 transition-colors duration-300">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white group-hover:text-blue-50 transition-colors duration-200">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
    </div>
  </DarkGlassCard>
);

const LiveIndicator = () => (
  <span className="relative flex items-center gap-1.5">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
    </span>
    <span className="text-[11px] font-semibold text-emerald-400">Live</span>
  </span>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-10">

        {/* Hero Banner */}
        <motion.div variants={fadeUp}>
          <HeroCard>
            <div className="px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-2.5">
                  <LiveIndicator />
                </div>
                <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">
                  FrontX Administration<br />Dashboard
                </h1>
                <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-1">
                  Monitor, manage, and maintain the entire FrontX ecosystem from one intelligent control center.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-600/15 border border-blue-500/15 flex items-center justify-center relative">
                  <Shield className="w-14 h-14 sm:w-16 sm:h-16 text-blue-400 relative z-10" />
                  <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-2xl" />
                  <div className="absolute -inset-4 rounded-[2rem] bg-blue-500/[0.04] blur-3xl" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </HeroCard>
        </motion.div>

        {/* Live Quick Stats */}
        <div>
          <SectionHeading subtitle="Real-time platform metrics" delay={1}>Platform Overview</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard
              icon={Users}
              label="Active Users"
              value={stats?.users?.total || 0}
              subtext={`${stats?.users?.students || 0} students · ${stats?.users?.alumni || 0} alumni`}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              glow="bg-blue-500"
              trend={(stats?.growth?.newStudents30d || 0) + (stats?.growth?.newAlumni30d || 0)}
              delay={2}
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Reports"
              value={0}
              subtext="Community and blog reports"
              color="bg-gradient-to-br from-amber-500 to-orange-500"
              glow="bg-amber-500"
              badge="No Pending Reports"
              delay={3}
            />
            <StatCard
              icon={LogIn}
              label="Today's Logins"
              value={(stats?.growth?.postsLast7d || 0) + (stats?.growth?.blogsLast7d || 0)}
              subtext="Total users active today"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              glow="bg-purple-500"
              delay={4}
            />
            <StatCard
              icon={Activity}
              label="System Health"
              value={99.9}
              subtext="Platform uptime"
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              glow="bg-emerald-500"
              badge="99.9% Online"
              delay={5}
            />
          </div>
        </div>

        {/* Content Stats */}
        <div>
          <SectionHeading subtitle="Content and engagement metrics" delay={6}>Content Statistics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard
              icon={MessageSquare}
              label="Community Posts"
              value={stats?.content?.posts || 0}
              subtext={`${stats?.growth?.postsLast7d || 0} new this week`}
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
              glow="bg-indigo-500"
              trend={stats?.growth?.newPosts30d}
              delay={7}
            />
            <StatCard
              icon={FileText}
              label="Blog Articles"
              value={stats?.content?.blogs || 0}
              subtext={`${stats?.growth?.blogsLast7d || 0} new this week`}
              color="bg-gradient-to-br from-cyan-500 to-cyan-600"
              glow="bg-cyan-500"
              trend={stats?.growth?.newBlogs30d}
              delay={8}
            />
            <StatCard
              icon={BookOpen}
              label="Resources"
              value={stats?.content?.resources || 0}
              subtext="Shared learning materials"
              color="bg-gradient-to-br from-rose-500 to-rose-600"
              glow="bg-rose-500"
              delay={9}
            />
            <StatCard
              icon={MessageSquare}
              label="Total Comments"
              value={stats?.content?.comments || 0}
              subtext="Across all content"
              color="bg-gradient-to-br from-violet-500 to-violet-600"
              glow="bg-violet-500"
              delay={10}
            />
          </div>
        </div>

        {/* Quick Actions + Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SectionHeading subtitle="Navigate to management sections" delay={11}>Quick Actions</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <QuickAction icon={MessageSquare} label="Community Moderation" desc="Review and moderate posts" path="/admin/community" navigate={navigate} delay={12} />
              <QuickAction icon={Users} label="Manage Users" desc="View, edit, remove users" path="/admin/users" navigate={navigate} delay={13} />
              <QuickAction icon={FileText} label="Blog Management" desc="Review and manage articles" path="/admin/blogs" navigate={navigate} delay={14} />
              <QuickAction icon={BookOpen} label="Resource Hub" desc="Manage shared resources" path="/admin/resources" navigate={navigate} delay={15} />
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeading subtitle="Latest registered users" delay={16}>Recent Users</SectionHeading>
            <DarkGlassCard delay={17} hoverEffect={false}>
              <div className="space-y-0 max-h-[360px] overflow-y-auto scrollbar-thin">
                {!stats?.recentUsers?.length && (
                  <p className="text-xs text-slate-500 text-center py-6">No users yet.</p>
                )}
                {stats?.recentUsers?.map((u) => (
                  <div key={u._id} className="flex items-center gap-3.5 py-3.5 border-b border-white/[0.04] last:border-0 px-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 relative ${
                      u.role === 'alumni'
                        ? 'bg-gradient-to-br from-purple-500/25 to-purple-600/15 text-purple-300 border border-purple-500/15'
                        : u.role === 'admin'
                          ? 'bg-gradient-to-br from-red-500/25 to-red-600/15 text-red-300 border border-red-500/15'
                          : 'bg-gradient-to-br from-blue-500/25 to-blue-600/15 text-blue-300 border border-blue-500/15'
                    }`}>
                      {u.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                        u.role === 'alumni'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/10'
                          : u.role === 'admin'
                            ? 'bg-red-500/10 text-red-300 border border-red-500/10'
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/10'
                      }`}>{u.role}</span>
                      <p className="text-[10px] text-slate-600">{formatTime(u.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DarkGlassCard>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmerSweep {
          0%, 100% { background-position: -250% 0; }
          50% { background-position: 250% 0; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; }
          25% { transform: translateY(-14px) translateX(5px) scale(1.4); opacity: 0.65; }
          50% { transform: translateY(-7px) translateX(-4px) scale(0.85); opacity: 0.4; }
          75% { transform: translateY(-18px) translateX(7px) scale(1.15); opacity: 0.75; }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
      `}</style>
    </motion.div>
  );
};

export default AdminDashboard;
