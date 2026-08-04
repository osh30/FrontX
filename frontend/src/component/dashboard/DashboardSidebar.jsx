import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, BookOpen,
  Brain, TrendingUp, MessageCircle, User, Settings,
  LogOut, Menu, X, Inbox, Calendar, Lightbulb, Share2, BarChart3,
  Activity, PlayCircle, UserPlus, ClipboardList, PenTool,
  ChevronLeft, ChevronRight, CalendarCheck, Video,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';
import logo from '../../assets/logo/frontx-logo.svg';

const SIDEBAR_KEY = 'frontx_dashboard_sidebar_collapsed';

const DashboardSidebar = ({ activeTab, setActiveTab, userRole = 'student', collapsed, setCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });

  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const toggleCollapse = setCollapsed || ((v) => {
    setInternalCollapsed(v);
    try { localStorage.setItem(SIDEBAR_KEY, String(v)); } catch {}
  });

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collaboration', label: 'Collaboration', icon: Lightbulb },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'career', label: 'Career Opportunities', icon: Briefcase },
    { id: 'interviews', label: 'Interviews', icon: CalendarCheck },
    { id: 'skills', label: 'Analysis', icon: Brain },
    { id: 'study-planner', label: 'Study Planner', icon: ClipboardList },
    { id: 'progress', label: 'Progress', icon: Activity },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'learnings', label: 'Learnings', icon: PlayCircle },
    { id: 'blog', label: 'Blog', icon: PenTool },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const alumniNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-requests', label: 'Student Requests', icon: UserPlus },
    { id: 'collaboration', label: 'Collaboration', icon: Lightbulb },
    { id: 'mentorship-sessions', label: 'Sessions', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Share2 },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'blog', label: 'Blog', icon: PenTool },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'messages', label: 'Messages', icon: Inbox },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const { logout, user } = useAuth();
  const navItems = userRole === 'alumni' ? alumniNavItems : studentNavItems;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 text-gray-700"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        />
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 76 : 280 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex relative h-screen flex-col overflow-hidden shrink-0 border-r border-white/[0.04] z-40"
        style={{
          background: 'linear-gradient(170deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)',
        }}
      >
        {/* Shimmer layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              background: 'linear-gradient(115deg, transparent 15%, rgba(148,163,184,0.6) 35%, rgba(255,255,255,0.9) 50%, rgba(148,163,184,0.6) 65%, transparent 85%)',
              backgroundSize: '250% 100%',
              animation: 'shimmerSweep 9s ease-in-out infinite',
            }} />
          <div className="absolute inset-0 opacity-[0.015]"
            style={{
              background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.3) 45%, rgba(139,92,246,0.4) 50%, rgba(59,130,246,0.3) 55%, transparent 75%)',
              backgroundSize: '300% 100%',
              animation: 'shimmerSweep 14s ease-in-out infinite 3s',
            }} />
          {/* Subtle radial glow at top */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,1), transparent 70%)' }} />
        </div>

        {/* Top border glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* Brand */}
        <div className="relative z-10 px-5 pt-7 pb-6">
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <img src={logo} alt="Frontx" className="w-8 h-8 object-contain shrink-0" />
                <span className="text-[18px] font-extrabold text-white leading-tight block">
                  FrontX
                </span>
              </div>
              <p className="text-[13px] text-slate-400/80 mt-1.5 font-medium tracking-wide">
                {userRole === 'alumni' ? 'Alumni Portal' : 'Student Portal'}
              </p>
              </motion.div>
            ) : (
              <div className="flex justify-center">
                <img src={logo} alt="Frontx" className="w-9 h-9 object-contain" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <div className="relative z-10 mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Navigation */}
        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-0.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.08] -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-400 to-indigo-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
                <item.icon className={`w-[18px] h-[18px] shrink-0 relative z-10 transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-300'}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="relative z-10 border-t border-white/[0.05] px-3 py-4 space-y-2">
          {/* Collapse toggle */}
          <button
            onClick={() => toggleCollapse(!isCollapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
            )}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User card */}
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md shadow-purple-500/20 relative">
              <span className="text-[11px] font-bold text-white">{userInitials}</span>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap min-w-0 flex-1"
                >
                  <p className="text-[12px] font-semibold text-slate-100 truncate">{user?.name || 'Student'}</p>
                  <p className="text-[10px] text-slate-400/80 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0 transition-colors duration-200 group-hover:text-red-400" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar (slide-out, full width, non-collapsible) */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full w-64 border-r border-white/[0.04] shadow-[0_0_40px_rgba(0,0,0,0.2)]"
          style={{
            background: 'linear-gradient(170deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)',
          }}
        >
          <div className="px-5 pt-7 pb-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Frontx" className="w-8 h-8 object-contain shrink-0" />
              <span className="text-[20px] font-extrabold text-white block leading-tight">
                FrontX
              </span>
            </div>
            <p className="text-[14px] text-slate-400/80 mt-1.5 font-medium tracking-wide">
              {userRole === 'alumni' ? 'Alumni Portal' : 'Student Portal'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-semibold'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  )}
                  <item.icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-300'}`} />
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/[0.05]">
            <motion.button
              onClick={handleLogout}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/[0.08] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes shimmerSweep {
          0%, 100% { background-position: -250% 0; }
          50% { background-position: 250% 0; }
        }
      `}</style>
    </>
  );
};

export default DashboardSidebar;
