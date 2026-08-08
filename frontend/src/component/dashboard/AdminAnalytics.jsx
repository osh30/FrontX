import { API_BASE } from '../../config/api';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import axios from 'axios';
import {
  BarChart3, Users, MessageSquare, FileText, BookOpen, Briefcase,
  TrendingUp, Download, Calendar, Clock, RefreshCw, Filter,
  ChevronDown, ArrowUpRight, ArrowDownRight, Brain, AlertTriangle,
  CheckCircle, Info, GraduationCap, Award, Target,
  Megaphone, Zap, Eye, Heart, FileDown,
  Activity, Layers, Star, BookMarked, Video, UserCheck, Upload,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from 'recharts';

const API_URL = API_BASE;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
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

const DarkGlassCard = ({ children, className = '', delay = 0, hoverEffect = true }) => (
  <motion.div
    variants={fadeUp}
    custom={delay}
    whileHover={hoverEffect ? { y: -2 } : undefined}
    className={`relative overflow-hidden rounded-2xl p-[1px] ${className}`}
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.07] transition-all duration-300" />
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
      <div className="relative z-10 h-full">{children}</div>
    </div>
  </motion.div>
);

const SectionHeading = ({ children, subtitle, delay = 0 }) => (
  <motion.div variants={fadeUp} custom={delay}>
    <h2 className="text-[34px] font-extrabold tracking-[-0.025em] leading-tight" style={{ color: '#1E293B' }}>{children}</h2>
    {subtitle && <p className="text-[17px] font-medium mt-2.5 leading-[1.6]" style={{ color: '#475569' }}>{subtitle}</p>}
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, subtext, color, glow, trend, trendUp, delay }) => (
  <DarkGlassCard delay={delay}>
    <div className="flex items-start justify-between">
      <div className="space-y-2.5 flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-[34px] font-bold text-white tracking-tight leading-none">
          <CountUp value={value} />
        </p>
        {subtext && <p className="text-[13px] text-slate-500 leading-relaxed">{subtext}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative ${color}`}>
        <Icon className="w-5 h-5 text-white relative z-10" />
        <div className={`absolute inset-0 rounded-xl blur-md opacity-40 ${glow}`} />
      </div>
    </div>
    {(trend !== undefined) && (
      <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-2">
        {trendUp !== false ? (
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
        )}
        <span className={`text-[12px] font-bold ${trendUp !== false ? 'text-emerald-400' : 'text-red-400'}`}>
          {trendUp !== false ? '+' : ''}{trend}
        </span>
        <span className="text-[12px] text-slate-500">this period</span>
      </div>
    )}
  </DarkGlassCard>
);

const MiniStat = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] text-slate-400 font-medium">{label}</p>
      <p className="text-[17px] font-bold text-white"><CountUp value={value} /></p>
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, children, delay = 0, className = '' }) => (
  <DarkGlassCard delay={delay} hoverEffect={false} className={className}>
    <div className="mb-5">
      <h3 className="text-[17px] font-bold text-white">{title}</h3>
      {subtitle && <p className="text-[13px] text-slate-500 mt-1.5">{subtitle}</p>}
    </div>
    <div className="h-[280px]">
      {children}
    </div>
  </DarkGlassCard>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3.5 py-2.5 text-xs border border-white/[0.08] shadow-xl"
      style={{ background: 'rgba(11,17,32,0.95)', backdropFilter: 'blur(20px)' }}>
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const FILTER_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Last Year', value: '1y' },
  { label: 'Custom', value: 'custom' },
];

const LiveIndicator = () => null;

const exportPDF = async (data) => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      doc.setFillColor(11, 17, 32);
      doc.rect(0, 0, pageWidth, 50, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.text('FrontX Platform Analytics', pageWidth / 2, 22, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 32, { align: 'center' });
      doc.text(`Period: ${data.meta?.range === '30d' ? 'Last 30 Days' : data.meta?.range === '7d' ? 'Last 7 Days' : data.meta?.range === '1y' ? 'Last Year' : data.meta?.range === '6m' ? 'Last 6 Months' : data.meta?.range === 'today' ? 'Today' : 'Custom Range'}`, pageWidth / 2, 40, { align: 'center' });

      y = 60;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('User Overview', 14, y);
      y += 8;
      doc.autoTable({
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Total Users', String(data.overview?.totalUsers || 0)],
          ['Total Students', String(data.overview?.totalStudents || 0)],
          ['Total Alumni', String(data.overview?.totalAlumni || 0)],
          ['New Registrations Today', String(data.overview?.todayRegistrations || 0)],
          ['New Registrations This Week', String(data.overview?.weekRegistrations || 0)],
          ['New Registrations This Month', String(data.overview?.monthRegistrations || 0)],
          ['Daily Logins', String(data.overview?.dailyLogins || 0)],
          ['Weekly Logins', String(data.overview?.weeklyLogins || 0)],
          ['Monthly Logins', String(data.overview?.monthlyLogins || 0)],
          ['Active Users Today', String(data.overview?.activeUsersToday || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      });
      y = doc.lastAutoTable.finalY + 12;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Community & Blog Analytics', 14, y);
      y += 8;
      doc.autoTable({
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Total Community Posts', String(data.community?.totalPosts || 0)],
          ['Total Blogs', String(data.blogs?.totalBlogs || 0)],
          ['Blog Likes', String(data.blogs?.totalBlogLikes || 0)],
          ['Blog Comments', String(data.blogs?.totalBlogComments || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
      });
      y = doc.lastAutoTable.finalY + 12;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Opportunity Analytics', 14, y);
      y += 8;
      doc.autoTable({
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Total Opportunities', String(data.opportunities?.total || 0)],
          ['Government Jobs', String(data.opportunities?.governmentJobs || 0)],
          ['Private Jobs', String(data.opportunities?.privateJobs || 0)],
          ['Scholarships', String(data.opportunities?.scholarships || 0)],
          ['Competitions', String(data.opportunities?.competitions || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
      });
      y = doc.lastAutoTable.finalY + 12;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Resource & Mentorship Analytics', 14, y);
      y += 8;
      doc.autoTable({
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Total Resources', String(data.resources?.total || 0)],
          ['Total Class Notes', String(data.resources?.totalClassNotes || 0)],
          ['Total Downloads', String(data.resources?.totalDownloads || 0)],
          ['Most Downloaded Resource', data.resources?.mostDownloaded?.title || 'N/A'],
          ['Total Mentorship Sessions', String(data.mentorship?.totalSessions || 0)],
          ['Completed Sessions', String(data.mentorship?.completedSessions || 0)],
          ['Upcoming Sessions', String(data.mentorship?.upcomingSessions || 0)],
          ['Active Mentors', String(data.mentorship?.activeMentors || 0)],
          ['Students Mentored', String(data.mentorship?.studentsMentored || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
      });
      y = doc.lastAutoTable.finalY + 12;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Study Planner Analytics', 14, y);
      y += 8;
      doc.autoTable({
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Students Using Planner', String(data.studyPlanner?.totalStudents || 0)],
          ['Total Courses', String(data.studyPlanner?.totalCourses || 0)],
          ['Completion Rate', `${data.studyPlanner?.weeklyCompletionRate || 0}%`],
          ['Completed Weeks', String(data.studyPlanner?.completedWeeks || 0)],
          ['Pending Weeks', String(data.studyPlanner?.pendingWeeks || 0)],
          ['Missed Weeks', String(data.studyPlanner?.missedWeeks || 0)],
          ['Notes Uploaded This Week', String(data.studyPlanner?.notesUploadedThisWeek || 0)],
          ['Most Active Course', data.studyPlanner?.mostActiveCourse || 'N/A'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
      });

      if (data.insights?.length > 0) {
        const finalY = doc.lastAutoTable.finalY + 12;
        if (finalY > 240) { doc.addPage(); y = 20; } else { y = finalY; }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('AI Platform Insights', 14, y);
        y += 8;
        doc.autoTable({
          startY: y,
          head: [['Type', 'Title', 'Insight']],
          body: data.insights.map(ins => [
            ins.type?.toUpperCase() || 'INFO',
            ins.title || '',
            ins.message || '',
          ]),
          theme: 'grid',
          headStyles: { fillColor: [168, 85, 247] },
          columnStyles: { 2: { cellWidth: 100 } },
        });
      }

      doc.save('FrontX-Analytics-Report.pdf');
  }
};

const exportCSV = (data) => {
  const rows = [
    ['FrontX Platform Analytics Report'],
    [`Generated: ${new Date().toLocaleString()}`],
    [''],
    ['SECTION', 'METRIC', 'VALUE'],
    ['Overview', 'Total Users', data.overview?.totalUsers || 0],
    ['Overview', 'Total Students', data.overview?.totalStudents || 0],
    ['Overview', 'Total Alumni', data.overview?.totalAlumni || 0],
    ['Overview', 'Today Registrations', data.overview?.todayRegistrations || 0],
    ['Overview', 'Week Registrations', data.overview?.weekRegistrations || 0],
    ['Overview', 'Month Registrations', data.overview?.monthRegistrations || 0],
    ['Overview', 'Daily Logins', data.overview?.dailyLogins || 0],
    ['Overview', 'Weekly Logins', data.overview?.weeklyLogins || 0],
    ['Overview', 'Monthly Logins', data.overview?.monthlyLogins || 0],
    ['Overview', 'Active Users Today', data.overview?.activeUsersToday || 0],
    ['Community', 'Total Posts', data.community?.totalPosts || 0],
    ['Community', 'Most Active Student', data.community?.mostActiveStudent?.name || 'N/A'],
    ['Community', 'Most Active Alumni', data.community?.mostActiveAlumni?.name || 'N/A'],
    ['Blogs', 'Total Blogs', data.blogs?.totalBlogs || 0],
    ['Blogs', 'Blog Likes', data.blogs?.totalBlogLikes || 0],
    ['Blogs', 'Blog Comments', data.blogs?.totalBlogComments || 0],
    ['Opportunities', 'Total', data.opportunities?.total || 0],
    ['Opportunities', 'Government Jobs', data.opportunities?.governmentJobs || 0],
    ['Opportunities', 'Private Jobs', data.opportunities?.privateJobs || 0],
    ['Opportunities', 'Scholarships', data.opportunities?.scholarships || 0],
    ['Opportunities', 'Competitions', data.opportunities?.competitions || 0],
    ['Resources', 'Total Resources', data.resources?.total || 0],
    ['Resources', 'Total Class Notes', data.resources?.totalClassNotes || 0],
    ['Resources', 'Total Downloads', data.resources?.totalDownloads || 0],
    ['Resources', 'Most Downloaded', data.resources?.mostDownloaded?.title || 'N/A'],
    ['Mentorship', 'Total Sessions', data.mentorship?.totalSessions || 0],
    ['Mentorship', 'Completed', data.mentorship?.completedSessions || 0],
    ['Mentorship', 'Upcoming', data.mentorship?.upcomingSessions || 0],
    ['Mentorship', 'Active Mentors', data.mentorship?.activeMentors || 0],
    ['Mentorship', 'Students Mentored', data.mentorship?.studentsMentored || 0],
    ['Study Planner', 'Students Using Planner', data.studyPlanner?.totalStudents || 0],
    ['Study Planner', 'Completion Rate', `${data.studyPlanner?.weeklyCompletionRate || 0}%`],
    ['Study Planner', 'Completed Weeks', data.studyPlanner?.completedWeeks || 0],
    ['Study Planner', 'Pending Weeks', data.studyPlanner?.pendingWeeks || 0],
    ['Study Planner', 'Missed Weeks', data.studyPlanner?.missedWeeks || 0],
    ['Study Planner', 'Notes Uploaded This Week', data.studyPlanner?.notesUploadedThisWeek || 0],
    ['Study Planner', 'Most Active Course', data.studyPlanner?.mostActiveCourse || 'N/A'],
    ['Collaboration', 'Total Posts', data.collaboration?.totalPosts || 0],
    ['Collaboration', 'Active Projects', data.collaboration?.active || 0],
    ['Collaboration', 'Completed Projects', data.collaboration?.completed || 0],
    ['Notifications', 'Total', data.notifications?.total || 0],
    ['Notifications', 'Read', data.notifications?.read || 0],
    ['Notifications', 'Unread', data.notifications?.unread || 0],
    ['Notifications', 'Read Rate', `${data.notifications?.readRate || 0}%`],
    ['Announcements', 'Total', data.announcements?.total || 0],
    ['Announcements', 'Active', data.announcements?.active || 0],
    ['Announcements', 'Expired', data.announcements?.expired || 0],
    [''],
    ['AI INSIGHTS'],
    ['Type', 'Title', 'Message'],
    ...(data.insights || []).map(ins => [ins.type, ins.title, ins.message]),
  ];

  const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `FrontX-Analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefreshIcon = false) => {
    try {
      if (showRefreshIcon) setRefreshing(true);
      const params = { range: filter };
      if (filter === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      const res = await axios.get(`${API_URL}/admin/analytics`, { params });
      setData(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, customStart, customEnd]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleExport = (type) => {
    if (!data) return;
    if (type === 'pdf') exportPDF(data);
    if (type === 'csv') exportCSV(data);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const o = data?.overview || {};
  const c = data?.community || {};
  const b = data?.blogs || {};
  const op = data?.opportunities || {};
  const r = data?.resources || {};
  const m = data?.mentorship || {};
  const sp = data?.studyPlanner || {};
  const charts = data?.charts || {};
  const collab = data?.collaboration || {};
  const notif = data?.notifications || {};
  const ann = data?.announcements || {};

  const formatShortDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${names[parseInt(month) - 1]} '${year.slice(2)}`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-14">

        {/* Hero Banner */}
        <motion.div variants={fadeUp}>
          <HeroCard>
            <div className="px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-1 space-y-5">
                <h1 className="text-[36px] sm:text-[44px] font-extrabold text-white tracking-[-0.03em] leading-[1.1]">
                  Platform Analytics
                </h1>
                <p className="text-[18px] text-slate-400 leading-[1.7] max-w-2xl mt-1 font-normal">
                  Monitor real-time platform growth, engagement, user activity, and system performance across the entire FrontX ecosystem.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-[13px] text-slate-500 font-medium">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/15 border border-blue-500/15 flex items-center justify-center relative">
                  <BarChart3 className="w-14 h-14 sm:w-16 sm:h-16 text-blue-400 relative z-10" />
                  <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-2xl" />
                  <div className="absolute -inset-4 rounded-[2rem] bg-blue-500/[0.04] blur-3xl" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </HeroCard>
        </motion.div>

        {/* Filter Bar + Export */}
        <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_OPTIONS.filter(f => f.value !== 'custom').map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setFilter(opt.value); }}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                    filter === opt.value
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => { setFilter('custom'); setShowFilters(true); }}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                  filter === 'custom'
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-purple-200 hover:text-purple-600'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all duration-200 shadow-md shadow-red-500/25"
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all duration-200 shadow-md shadow-emerald-500/25"
            >
              <FileDown className="w-4 h-4" />
              CSV
            </button>
          </div>
        </motion.div>

        {/* Custom Date Range */}
        {filter === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">From:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">To:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            {customStart && customEnd && (
              <button
                onClick={() => fetchData(true)}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all"
              >
                Apply Range
              </button>
            )}
          </motion.div>
        )}

        {/* User Analytics */}
        <div>
          <SectionHeading subtitle="Real-time user metrics from MongoDB" delay={2}>User Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard icon={GraduationCap} label="Total Students" value={o.totalStudents || 0} subtext={`${o.todayStudents || 0} registered today`} color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={3} />
            <StatCard icon={Award} label="Total Alumni" value={o.totalAlumni || 0} subtext={`${o.todayAlumni || 0} registered today`} color="bg-gradient-to-br from-purple-500 to-purple-600" glow="bg-purple-500" delay={4} />
            <StatCard icon={Users} label="Total Users" value={o.totalUsers || 0} subtext={`${o.totalAdmins || 0} admin accounts`} color="bg-gradient-to-br from-indigo-500 to-indigo-600" glow="bg-indigo-500" delay={5} />
            <StatCard icon={UserCheck} label="New Registrations Today" value={o.todayRegistrations || 0} subtext={`${o.weekRegistrations || 0} this week`} color="bg-gradient-to-br from-cyan-500 to-cyan-600" glow="bg-cyan-500" delay={6} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <StatCard icon={TrendingUp} label="Weekly Registrations" value={o.weekRegistrations || 0} subtext={`${o.todayRegistrations || 0} today`} color="bg-gradient-to-br from-emerald-500 to-emerald-600" glow="bg-emerald-500" delay={7} />
            <StatCard icon={Activity} label="Monthly Registrations" value={o.monthRegistrations || 0} subtext="Last 30 days" color="bg-gradient-to-br from-amber-500 to-orange-500" glow="bg-amber-500" delay={8} />
            <StatCard icon={Target} label="Active Users Today" value={o.activeUsersToday || 0} subtext={`${o.dailyLogins || 0} logins today`} color="bg-gradient-to-br from-rose-500 to-rose-600" glow="bg-rose-500" delay={9} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <StatCard icon={Clock} label="Daily Logins" value={o.dailyLogins || 0} subtext="Today" color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={10} />
            <StatCard icon={Clock} label="Weekly Logins" value={o.weeklyLogins || 0} subtext="Last 7 days" color="bg-gradient-to-br from-purple-500 to-purple-600" glow="bg-purple-500" delay={11} />
            <StatCard icon={Clock} label="Monthly Logins" value={o.monthlyLogins || 0} subtext="Last 30 days" color="bg-gradient-to-br from-indigo-500 to-indigo-600" glow="bg-indigo-500" delay={12} />
          </div>
        </div>

        {/* Community & Blog Analytics */}
        <div>
          <SectionHeading subtitle="Content creation and engagement metrics" delay={13}>Community & Blog Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard icon={MessageSquare} label="Community Posts" value={c.totalPosts || 0} subtext={`${c.todayPosts || 0} today`} color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={14} />
            <StatCard icon={FileText} label="Total Blogs" value={b.totalBlogs || 0} subtext={`${b.totalBlogLikes || 0} likes · ${b.totalBlogComments || 0} comments`} color="bg-gradient-to-br from-cyan-500 to-cyan-600" glow="bg-cyan-500" delay={15} />
          </div>

        </div>

        {/* Opportunity Analytics */}
        <div>
          <SectionHeading subtitle="Job and scholarship posting metrics" delay={16}>Opportunity Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard icon={Briefcase} label="Government Jobs" value={op.governmentJobs || 0} color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={17} />
            <StatCard icon={Briefcase} label="Private Jobs" value={op.privateJobs || 0} color="bg-gradient-to-br from-purple-500 to-purple-600" glow="bg-purple-500" delay={18} />
            <StatCard icon={BookMarked} label="Scholarships" value={op.scholarships || 0} color="bg-gradient-to-br from-emerald-500 to-emerald-600" glow="bg-emerald-500" delay={19} />
            <StatCard icon={Award} label="Competitions" value={op.competitions || 0} color="bg-gradient-to-br from-amber-500 to-orange-500" glow="bg-amber-500" delay={20} />
          </div>
        </div>

        {/* Resource Analytics */}
        <div>
          <SectionHeading subtitle="Shared learning materials and downloads" delay={21}>Resource Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard icon={BookOpen} label="Total Resources" value={r.total || 0} subtext="Uploaded materials" color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={22} />
            <StatCard icon={FileText} label="Total Class Notes" value={r.totalClassNotes || 0} subtext="Student shared notes" color="bg-gradient-to-br from-indigo-500 to-indigo-600" glow="bg-indigo-500" delay={23} />
            <StatCard icon={Download} label="Total Downloads" value={r.totalDownloads || 0} subtext={`${r.totalViews || 0} total views`} color="bg-gradient-to-br from-emerald-500 to-emerald-600" glow="bg-emerald-500" delay={24} />
            <StatCard icon={Upload} label="Recent Uploads" value={r.recentUploads || 0} subtext="This week" color="bg-gradient-to-br from-purple-500 to-purple-600" glow="bg-purple-500" delay={25} />
          </div>
          {r.mostDownloaded && (
            <div className="mt-4">
              <DarkGlassCard delay={26} hoverEffect={false}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/15 border border-emerald-500/15 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[13px] text-slate-400 uppercase tracking-wider font-semibold">Most Downloaded Resource</p>
                    <p className="text-[17px] font-bold text-white mt-1">{r.mostDownloaded.title}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{r.mostDownloaded.downloads} downloads · {r.mostDownloaded.uploadType} · {r.mostDownloaded.category}</p>
                  </div>
                </div>
              </DarkGlassCard>
            </div>
          )}
        </div>

        {/* Mentorship Analytics */}
        <div>
          <SectionHeading subtitle="Mentorship sessions and engagement" delay={27}>Mentorship Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard icon={Video} label="Total Sessions" value={m.totalSessions || 0} subtext="1-on-1 + group" color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={28} />
            <StatCard icon={CheckCircle} label="Completed Sessions" value={m.completedSessions || 0} color="bg-gradient-to-br from-emerald-500 to-emerald-600" glow="bg-emerald-500" delay={29} />
            <StatCard icon={Calendar} label="Upcoming Sessions" value={m.upcomingSessions || 0} color="bg-gradient-to-br from-amber-500 to-orange-500" glow="bg-amber-500" delay={30} />
            <StatCard icon={Users} label="Active Mentors" value={m.activeMentors || 0} subtext={`${m.studentsMentored || 0} students mentored`} color="bg-gradient-to-br from-purple-500 to-purple-600" glow="bg-purple-500" delay={31} />
          </div>
        </div>

        {/* Study Planner Analytics */}
        <div>
          <SectionHeading subtitle="Study planner usage and completion metrics" delay={32}>Study Planner Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard icon={Layers} label="Students Using Planner" value={sp.totalStudents || 0} color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={33} />
            <StatCard icon={Target} label="Weekly Completion Rate" value={sp.weeklyCompletionRate || 0} suffix="%" color="bg-gradient-to-br from-emerald-500 to-emerald-600" glow="bg-emerald-500" delay={34} />
            <StatCard icon={Upload} label="Notes Uploaded This Week" value={sp.notesUploadedThisWeek || 0} color="bg-gradient-to-br from-purple-500 to-purple-600" glow="bg-purple-500" delay={35} />
            <StatCard icon={AlertTriangle} label="Missed Weekly Uploads" value={sp.missedWeeks || 0} color="bg-gradient-to-br from-red-500 to-red-600" glow="bg-red-500" delay={36} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <DarkGlassCard delay={37} hoverEffect={false}>
              <MiniStat label="Completed Weeks" value={sp.completedWeeks || 0} icon={CheckCircle} color="bg-emerald-500/20" />
              <div className="border-t border-white/[0.05] mt-2 pt-2">
                <MiniStat label="Pending Weeks" value={sp.pendingWeeks || 0} icon={Clock} color="bg-blue-500/20" />
              </div>
            </DarkGlassCard>
            <DarkGlassCard delay={38} hoverEffect={false}>
              <MiniStat label="Total Courses" value={sp.totalCourses || 0} icon={BookOpen} color="bg-indigo-500/20" />
              <div className="border-t border-white/[0.05] mt-2 pt-2">
                <MiniStat label="Total Weeks" value={sp.totalWeeks || 0} icon={Layers} color="bg-purple-500/20" />
              </div>
            </DarkGlassCard>
            <DarkGlassCard delay={39} hoverEffect={false}>
              <p className="text-[13px] text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Most Active Course</p>
              <p className="text-[17px] font-bold text-white">{sp.mostActiveCourse || 'N/A'}</p>
              <p className="text-[13px] text-slate-500 mt-1">Highest weekly completion count</p>
            </DarkGlassCard>
          </div>
        </div>

        {/* Collaboration Analytics */}
        <div>
          <SectionHeading subtitle="Research collaboration and project metrics" delay={40}>Collaboration Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <StatCard icon={Users} label="Total Collaborations" value={collab.totalPosts || 0} subtext="Research topics" color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={41} />
            <StatCard icon={CheckCircle} label="Active Projects" value={collab.activePosts || 0} subtext="Currently ongoing" color="bg-gradient-to-br from-emerald-500 to-emerald-600" glow="bg-emerald-500" delay={42} />
            <StatCard icon={Award} label="Completed Projects" value={collab.closedPosts || 0} subtext="Successfully closed" color="bg-gradient-to-br from-purple-500 to-purple-600" glow="bg-purple-500" delay={43} />
          </div>
        </div>

        {/* Notification Analytics */}
        <div>
          <SectionHeading subtitle="Notification delivery and engagement" delay={44}>Notification Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard icon={Megaphone} label="Total Notifications" value={notif.total || 0} subtext="All time" color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={45} />
            <StatCard icon={CheckCircle} label="Read Notifications" value={notif.read || 0} subtext={`${notif.readRate || 0}% read rate`} color="bg-gradient-to-br from-emerald-500 to-emerald-600" glow="bg-emerald-500" delay={46} />
            <StatCard icon={AlertTriangle} label="Unread Notifications" value={notif.unread || 0} subtext="Pending attention" color="bg-gradient-to-br from-amber-500 to-orange-500" glow="bg-amber-500" delay={47} />
            <StatCard icon={Target} label="Read Rate" value={notif.readRate || 0} suffix="%" subtext="Engagement metric" color="bg-gradient-to-br from-purple-500 to-purple-600" glow="bg-purple-500" delay={48} />
          </div>
        </div>

        {/* Announcement Analytics */}
        <div>
          <SectionHeading subtitle="Platform announcement metrics" delay={49}>Announcement Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <StatCard icon={Megaphone} label="Total Announcements" value={ann.total || 0} subtext="All time" color="bg-gradient-to-br from-blue-500 to-blue-600" glow="bg-blue-500" delay={50} />
            <StatCard icon={CheckCircle} label="Active Announcements" value={ann.active || 0} subtext="Currently visible" color="bg-gradient-to-br from-emerald-500 to-emerald-600" glow="bg-emerald-500" delay={51} />
            <StatCard icon={Clock} label="Expired Announcements" value={ann.expired || 0} subtext="Past expiry" color="bg-gradient-to-br from-slate-500 to-slate-600" glow="bg-slate-500" delay={52} />
          </div>
        </div>

        {/* Charts Section */}
        <div>
          <SectionHeading subtitle="Visual analytics powered by real platform data" delay={53}>Charts & Visualizations</SectionHeading>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Daily Activity Line Chart */}
            <ChartCard title="Daily Activity" subtitle="Login activity over 30 days" delay={54}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(charts.dailyActivity || charts.communityActivity || []).map(d => ({ ...d, label: formatShortDate(d.date) }))}>
                  <defs>
                    <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Logins" stroke="#3B82F6" fill="url(#postsGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Monthly Registrations Bar Chart */}
            <ChartCard title="Monthly Registrations" subtitle="New student and alumni signups by month" delay={55}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(charts.monthlyRegistrations || []).map(d => ({ ...d, label: formatMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                  <Bar dataKey="students" name="Students" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alumni" name="Alumni" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* User Distribution Pie Chart */}
            <ChartCard title="User Distribution" subtitle="Student vs Alumni ratio" delay={56}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.userDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(charts.userDistribution || []).map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Opportunity Distribution Bar Chart */}
            <ChartCard title="Opportunity Distribution" subtitle="Jobs, scholarships, and competitions" delay={57}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.opportunityDistribution || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                    {(charts.opportunityDistribution || []).map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Community Activity Line Chart */}
            <ChartCard title="Community Activity" subtitle="Daily posts and comments trends" delay={58}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(charts.communityActivity || []).map(d => ({ ...d, label: formatShortDate(d.date) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                  <Line type="monotone" dataKey="posts" name="Posts" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
                  <Line type="monotone" dataKey="comments" name="Comments" stroke="#22C55E" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Study Planner Completion Doughnut */}
            <ChartCard title="Study Planner Completion" subtitle="Completed vs pending vs missed weeks" delay={59}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.studyPlannerCompletion || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(charts.studyPlannerCompletion || []).map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <SectionHeading subtitle="Automated insights generated from real platform data" delay={60}>AI Platform Insights</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {(data?.insights || []).map((insight, i) => {
              const iconMap = {
                'warning': AlertTriangle,
                'positive': CheckCircle,
                'info': Info,
              };
              const colorMap = {
                'warning': { bg: 'from-amber-500/15 to-amber-600/10', border: 'border-amber-500/15', icon: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400' },
                'positive': { bg: 'from-emerald-500/15 to-emerald-600/10', border: 'border-emerald-500/15', icon: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400' },
                'info': { bg: 'from-blue-500/15 to-blue-600/10', border: 'border-blue-500/15', icon: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400' },
              };
              const Icon = iconMap[insight.type] || Info;
              const colors = colorMap[insight.type] || colorMap.info;

              return (
                <DarkGlassCard key={i} delay={61 + i}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
                        <Icon className={`w-5 h-5 ${colors.icon}`} />
                      </div>
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {insight.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white">{insight.title}</p>
                      <p className="text-[14px] text-slate-400 mt-1.5 leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                </DarkGlassCard>
              );
            })}
            {(!data?.insights || data.insights.length === 0) && (
              <DarkGlassCard delay={61} hoverEffect={false} className="sm:col-span-2 lg:col-span-3">
                <div className="text-center py-8">
                  <Brain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-[14px] text-slate-400 font-medium">No insights available yet. More data needed.</p>
                </div>
              </DarkGlassCard>
            )}
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
      `}</style>
    </motion.div>
  );
};

export default AdminAnalytics;
