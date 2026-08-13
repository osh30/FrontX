import { API_BASE, SOCKET_URL } from '../../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { TrendingUp, Target, Award, Activity, Clock, Users, BookOpen, FileText, Calendar, Zap, Flame, Star, Crown, Lock, CheckCircle, AlertCircle, Sparkles, ArrowUp, ArrowDown, Trophy, Rocket, Microscope, MessageSquare, Briefcase, GraduationCap, Brain, Loader, ChevronRight, Eye, Download, Lightbulb, Map } from 'lucide-react';
import Avatar from './Avatar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const AnimatedCounter = ({ value, duration = 1500, suffix = '', prefix = '', className = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const startTime = Date.now();
        const timer = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          setCount(Math.floor(progress * value));
          if (progress >= 1) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref} className={className}>{prefix}{count}{suffix}</span>;
};

const CircularProgress = ({ value, max = 1000, size = 140, strokeWidth = 8, label, sublabel, color = '#8b5cf6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-gray-900">{value}</span>
        {sublabel && <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{sublabel}</span>}
      </div>
    </div>
  );
};

const GlowingRing = ({ value, max = 1000, size = 110, strokeWidth = 6, color = '#8b5cf6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white">{value}</span>
        <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
};

const AchievementIcon = ({ type, unlocked }) => {
  const baseClass = `w-10 h-10 ${unlocked ? '' : 'opacity-30 grayscale'}`;
  const icons = {
    trophy: <Trophy className={`${baseClass} text-yellow-400`} />,
    rocket: <Rocket className={`${baseClass} text-blue-400`} />,
    star: <Star className={`${baseClass} text-yellow-300`} />,
    flame: <Flame className={`${baseClass} text-orange-400`} />,
    target: <Target className={`${baseClass} text-emerald-400`} />,
    crown: <Crown className={`${baseClass} text-amber-400`} />,
    badge: <Award className={`${baseClass} text-purple-400`} />,
    handshake: <Users className={`${baseClass} text-pink-400`} />
  };
  return icons[type] || <Award className={`${baseClass} text-purple-400`} />;
};

const MilestoneIcon = ({ type, completed }) => {
  const color = completed ? 'text-emerald-400' : 'text-gray-500';
  const icons = {
    user: <Users className={`w-8 h-8 ${color}`} />,
    briefcase: <Briefcase className={`w-8 h-8 ${color}`} />,
    award: <Award className={`w-8 h-8 ${color}`} />,
    file: <FileText className={`w-8 h-8 ${color}`} />,
    microscope: <Microscope className={`w-8 h-8 ${color}`} />,
    message: <MessageSquare className={`w-8 h-8 ${color}`} />,
    target: <Target className={`w-8 h-8 ${color}`} />
  };
  return icons[type] || <CheckCircle className={`w-8 h-8 ${color}`} />;
};

const PremiumProgressPage = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE}/progress`, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch progress', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    const socket = io(SOCKET_URL);
    socket.on('progress_updated', fetchProgress);
    return () => socket.disconnect();
  }, []);

  const handleAction = (target) => {
    if (setActiveTab) setActiveTab(target);
    else navigate(target === 'dashboard' ? '/dashboard' : `/dashboard/${target}`);
  };

  if (loading) {
    return (
      <div className="mb-8 p-12 text-center text-gray-500 bg-white/40 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-600 font-medium">Loading your career progress...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mb-8 p-12 text-center bg-red-50/50 rounded-3xl border border-red-100 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-red-600 font-medium">Failed to load progress data</p>
      </div>
    );
  }

  const {
    careerScore, careerLevel, xp, rank, totalStudents, currentStreak,
    todaysProductivity, nextLevelXp, scores, growthTimeline, skillRadar,
    weeklyProductivity, monthlyActivity, careerScoreTrend, milestones,
    achievements, performanceBreakdown, aiInsights, learningAnalytics,
    thisMonth, growth, nextAction, heatmap, userProfile, longestStreak,
    productivityCalendar
  } = data;

  const nextLevelProgress = nextLevelXp > 0 ? Math.min(Math.round((xp / nextLevelXp) * 100), 100) : 100;
  const isTopRank = rank <= Math.ceil(totalStudents * 0.1);
  const scorePercent = Math.round((careerScore / 1000) * 100);

  const renderHeatmap = () => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = heatmap?.[dateStr] || 0;
      let colorClass = 'bg-gray-100';
      if (count === 1) colorClass = 'bg-emerald-200';
      else if (count === 2) colorClass = 'bg-emerald-300';
      else if (count === 3) colorClass = 'bg-emerald-400';
      else if (count > 3) colorClass = 'bg-emerald-500';
      days.push(<div key={dateStr} title={`${count} activities`} className={`w-[10px] h-[10px] rounded-sm ${colorClass} transition-colors hover:ring-1 ring-purple-300`} />);
    }
    return (
      <div>
        <div className="flex justify-between text-[10px] text-gray-500 font-medium mb-2">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
        <div className="flex flex-wrap gap-[3px]">{days}</div>
      </div>
    );
  };

  const renderCalendar = () => {
    if (!productivityCalendar) return null;
    const days = productivityCalendar;
    const firstDay = new Date(days[0]?.date).getDay();
    const blanks = Array(firstDay).fill(null);
    return (
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-[10px] text-gray-500 font-medium h-5">{d}</div>)}
        {blanks.map((_, i) => <div key={`b${i}`} className="h-8" />)}
        {days.map(d => {
          let color = 'bg-gray-50';
          if (d.count === 1) color = 'bg-purple-200';
          else if (d.count === 2) color = 'bg-purple-300';
          else if (d.count >= 3) color = 'bg-purple-400';
          return (
            <div key={d.date} className={`h-8 w-full rounded-md ${color} flex items-center justify-center text-[10px] font-medium ${d.count > 0 ? 'text-white' : 'text-gray-300'}`}>
              {d.day}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 max-w-7xl mx-auto w-full">
      {/* ===== PREMIUM ANALYTICS ===== */}
      <div className="grid xl:grid-cols-3 gap-6 mb-8">
        {/* Charts Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Gradient Line Chart — Career Growth Over Time */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50"><TrendingUp className="w-4 h-4 text-purple-600" /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Career Growth Over Time</h3>
                  <p className="text-[10px] text-gray-500 font-medium">Monthly activity trend</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                Total Activities
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTimeline} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                  <defs>
                    <linearGradient id="growthGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 8px 25px -5px rgba(0,0,0,0.08)', padding: '8px 14px' }}
                    cursor={{ stroke: '#ddd6fe', strokeWidth: 2, strokeDasharray: '4 4' }}
                    labelStyle={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="none" fill="url(#growthGrad2)" />
                  <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar + Bar — 2 column grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Radar — AI Skill Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-purple-50"><Brain className="w-4 h-4 text-purple-600" /></div>
                <h3 className="font-bold text-gray-900 text-sm">AI Skill Distribution</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={Object.entries(skillRadar || {}).map(([key, val]) => ({ skill: key.charAt(0).toUpperCase() + key.slice(1), value: val }))} outerRadius="80%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} animationDuration={1200} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Horizontal Bar — Weekly Productivity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-purple-50"><Zap className="w-4 h-4 text-purple-600" /></div>
                <h3 className="font-bold text-gray-900 text-sm">Weekly Productivity</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProductivity} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 5 }} barSize={10} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis type="category" dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={28} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 11 }} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="projects" stackId="a" fill="#8b5cf6" radius={[0, 2, 2, 0]} />
                    <Bar dataKey="sessions" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="research" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="resources" stackId="a" fill="#10b981" />
                    <Bar dataKey="applications" stackId="a" fill="#ec4899" />
                    <Bar dataKey="certificates" stackId="a" fill="#06b6d4" radius={[2, 0, 0, 2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {['Projects','Sessions','Research','Resources','Apps','Certs'].map((l, i) => (
                  <span key={i} className="flex items-center gap-1 text-[9px] font-medium text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${['bg-purple-500','bg-blue-500','bg-amber-500','bg-emerald-500','bg-pink-500','bg-cyan-500'][i]}`} />
                    {l}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Donut — Contribution Breakdown (centered, generous sizing) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-purple-50"><Award className="w-4 h-4 text-purple-600" /></div>
              <h3 className="font-bold text-gray-900 text-sm">Contribution Breakdown</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8 mt-2">
              <div className="h-56 w-56 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={performanceBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" animationDuration={1200}>
                      {performanceBreakdown?.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 11, padding: '6px 12px' }}
                      formatter={(value, name) => [`${value} pts`, name]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                {performanceBreakdown?.filter(p => p.value > 0).slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.value} pts &middot; {item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar — Heatmap + Career Score Ring + Next Action + Stats */}
        <div className="space-y-6">
          {/* GitHub-style Activity Heatmap */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-purple-50"><Activity className="w-3.5 h-3.5 text-purple-600" /></div>
              <h3 className="font-bold text-gray-900 text-xs">Daily Activity</h3>
            </div>
            {renderHeatmap()}
            <div className="flex items-center gap-1.5 mt-2.5 justify-end text-[9px] text-gray-500">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-gray-100" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-300" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>More</span>
            </div>
          </motion.div>

          {/* Animated Radial Progress Ring — Career Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1a2444] to-[#0F172A] rounded-3xl p-5 border border-white/5 shadow-xl text-center">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Career Score</span>
              <div className="flex justify-center mt-3 mb-2">
                <GlowingRing value={careerScore} max={1000} size={130} strokeWidth={8} color="#8b5cf6" />
              </div>
              <p className="text-xs text-white/50">out of 1,000 pts</p>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white font-black text-lg"><AnimatedCounter value={xp} /></p>
                  <p className="text-[9px] text-white/40 font-medium">XP</p>
                </div>
                <div>
                  <p className="text-white font-black text-lg">#{rank}</p>
                  <p className="text-[9px] text-white/40 font-medium">Rank</p>
                </div>
                <div>
                  <p className="text-white font-black text-lg">{scorePercent}%</p>
                  <p className="text-[9px] text-white/40 font-medium">Complete</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Recommended Action */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1a2444] to-[#0F172A] rounded-3xl p-5 border border-white/5 shadow-xl">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-white/10"><Target className="w-3.5 h-3.5 text-blue-400" /></div>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Next Action</span>
              </div>
              <h4 className="text-base font-bold text-white mt-2">{nextAction?.title}</h4>
              <p className="text-[11px] text-white/60 mt-1 mb-4">{nextAction?.desc}</p>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(nextAction?.target || 'dashboard')}
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {nextAction?.buttonText || 'Take Action'} <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-xs">Quick Stats</h3>
            <div className="space-y-2">
              {[
                { label: 'Longest Streak', value: longestStreak, icon: Flame, color: 'text-orange-500' },
                { label: 'Total XP', value: xp, icon: Zap, color: 'text-yellow-500' },
                { label: 'Career Score', value: careerScore, icon: Award, color: 'text-purple-500' },
                { label: 'Level', value: careerLevel, icon: GraduationCap, color: 'text-blue-500' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="text-[11px] font-medium text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {typeof item.value === 'number' ? <AnimatedCounter value={item.value} /> : item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== THIS MONTH ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-600" /> This Month</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Projects', value: thisMonth?.projects || 0, growth: growth?.projects || 0, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Certificates', value: thisMonth?.certificates || 0, growth: growth?.certificates || 0, icon: Award, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { label: 'Sessions', value: thisMonth?.sessions || 0, growth: growth?.sessions || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Research', value: thisMonth?.research || 0, growth: growth?.research || 0, icon: Microscope, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Notes', value: thisMonth?.notes || 0, growth: growth?.notes || 0, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Community', value: thisMonth?.community || 0, growth: growth?.community || 0, icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-50' }
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02, y: -2 }} className={`p-4 rounded-2xl border border-gray-100 ${item.bg} bg-opacity-40`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${item.bg}`}><item.icon className={`w-4 h-4 ${item.color}`} /></div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  item.growth > 0 ? 'bg-emerald-100 text-emerald-700' :
                  item.growth < 0 ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {item.growth > 0 ? <ArrowUp className="w-3 h-3" /> : item.growth < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                  {item.growth > 0 ? '+' : ''}{item.growth}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900"><AnimatedCounter value={item.value} /></p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== MILESTONES + JOURNEY ===== */}
      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        {/* Milestones */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-3 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Target className="w-4 h-4 text-purple-600" /> Career Milestones</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {milestones?.map((m, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border transition-all ${m.unlocked ? 'bg-gradient-to-br from-[#0F172A] to-[#1a2444] border-white/10 shadow-lg' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${m.unlocked ? 'bg-white/10' : 'bg-gray-50'}`}>
                    {m.unlocked ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${m.unlocked ? 'text-white' : 'text-gray-900'}`}>{m.title}</h4>
                    <p className={`text-[10px] font-semibold mt-0.5 ${m.unlocked ? 'text-emerald-300' : 'text-gray-500'}`}>{m.status}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Career Journey */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Map className="w-4 h-4 text-purple-600" /> Career Journey</h3>
          <div className="space-y-0">
            {[ 
              { level: 'Beginner', min: 0, icon: '🌟' },
              { level: 'Explorer', min: 500, icon: '🔍' },
              { level: 'Contributor', min: 1000, icon: '⚡' },
              { level: 'Researcher', min: 2000, icon: '🔬' },
              { level: 'Collaborator', min: 3500, icon: '🤝' },
              { level: 'Leader', min: 5000, icon: '👑' },
              { level: 'Mentor', min: 7500, icon: '🎯' }
            ].map((lvl, i) => {
              const completed = xp >= lvl.min;
              const isCurrent = careerLevel === lvl.level;
              return (
                <div key={i} className="flex items-center gap-3 py-2 relative">
                  {i < 6 && <div className={`absolute left-[11px] top-8 w-0.5 h-6 ${xp >= [0,500,1000,2000,3500,5000,7500][i+1] ? 'bg-purple-400' : 'bg-gray-200'}`} />}
                  <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                    isCurrent ? 'border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/30' :
                    completed ? 'border-purple-400 bg-purple-100' :
                    'border-gray-300 bg-white'
                  }`}>
                    {isCurrent && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    {completed && !isCurrent && <CheckCircle className="w-3.5 h-3.5 text-purple-500" />}
                  </div>
                  <div className={`flex-1 ${completed ? 'opacity-100' : 'opacity-40'}`}>
                    <p className={`text-sm font-bold ${isCurrent ? 'text-purple-700' : completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {lvl.level} {isCurrent && <span className="text-[10px] font-normal text-purple-500">(Current)</span>}
                    </p>
                    <p className="text-[10px] text-gray-500">{lvl.min.toLocaleString()} XP</p>
                  </div>
                  {isCurrent && <div className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full">Active</div>}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ===== ACHIEVEMENT GALLERY ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Star className="w-4 h-4 text-purple-600" /> Achievement Gallery</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {achievements?.map((ach, i) => (
            <motion.div
              key={i} whileHover={ach.unlocked ? { scale: 1.05, y: -4 } : {}}
              className={`relative p-4 rounded-2xl text-center transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-br from-gray-50 to-purple-50/50 border border-purple-100 shadow-sm hover:shadow-md'
                  : 'bg-gray-50/50 border border-dashed border-gray-200 opacity-50'
              }`}
            >
              {ach.unlocked && <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center shadow"><CheckCircle className="w-3.5 h-3.5 text-white" /></div>}
              {!ach.unlocked && <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-2xl backdrop-blur-[1px] z-10"><Lock className="w-5 h-5 text-gray-300" /></div>}
              <div className="flex justify-center mb-2">
                {ach.unlocked ? (
                  <div className="relative">
                    <AchievementIcon type={ach.icon} unlocked={ach.unlocked} />
                    {ach.unlocked && <motion.div className="absolute inset-0 rounded-full bg-purple-400/20" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />}
                  </div>
                ) : (
                  <AchievementIcon type={ach.icon} unlocked={false} />
                )}
              </div>
              <h4 className={`text-xs font-bold mt-1 ${ach.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>{ach.title}</h4>
              <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{ach.desc}</p>
              {ach.unlocked && ach.date && <p className="text-[8px] text-gray-300 mt-1">{new Date(ach.date).toLocaleDateString()}</p>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== AI CAREER INSIGHTS ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-purple-600" /> AI Career Insights</h3>
          <div className="space-y-3">
            {aiInsights?.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-100/50">
                <div className="p-1.5 rounded-lg bg-purple-100/50 shrink-0 mt-0.5">
                  {i === 0 ? <Eye className="w-3.5 h-3.5 text-purple-600" /> :
                   i === 1 ? <Rocket className="w-3.5 h-3.5 text-purple-600" /> :
                   i === 2 ? <Briefcase className="w-3.5 h-3.5 text-purple-600" /> :
                   i === 3 ? <Crown className="w-3.5 h-3.5 text-purple-600" /> :
                   <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      {/* ===== CALENDAR + LEARNING ANALYTICS ===== */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Productivity Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-600" /> This Month Calendar</h3>
          {renderCalendar()}
          <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 justify-end">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-gray-50" />
            <div className="w-3 h-3 rounded bg-purple-200" />
            <div className="w-3 h-3 rounded bg-purple-300" />
            <div className="w-3 h-3 rounded bg-purple-400" />
            <span>More</span>
          </div>
        </motion.div>

        {/* Learning Analytics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-600" /> Learning Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Hours Learned', value: learningAnalytics?.hoursLearned, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Resources Saved', value: learningAnalytics?.resourcesDownloaded, icon: Download, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Sessions Attended', value: learningAnalytics?.sessionsAttended, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Certificates', value: learningAnalytics?.certificatesEarned, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Research Done', value: learningAnalytics?.researchParticipation, icon: Microscope, color: 'text-rose-600', bg: 'bg-rose-50' }
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02, y: -2 }} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className={`p-2 rounded-xl ${item.bg} inline-flex mb-2`}><item.icon className={`w-4 h-4 ${item.color}`} /></div>
                <p className="text-xl font-black text-gray-900"><AnimatedCounter value={item.value || 0} /></p>
                <p className="text-[10px] font-medium text-gray-500 mt-0.5">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PremiumProgressPage;
