import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, MessageSquare, FileText,
  BookOpen, Briefcase, Megaphone, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, Zap, GraduationCap, Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo/frontx-logo.svg';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Community', icon: MessageSquare, path: '/admin/community' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Blogs', icon: FileText, path: '/admin/blogs' },
  { label: 'Resources', icon: BookOpen, path: '/admin/resources' },
  { label: 'Opportunities', icon: Briefcase, path: '/admin/opportunities' },
  { label: 'Opportunity Requests', icon: FileText, path: '/admin/opportunity-requests' },
  { label: 'Announcements', icon: Megaphone, path: '/admin/announcements' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Placement', icon: GraduationCap, path: '/admin/placement-statistics' },
  { label: 'Review Moderation', icon: Star, path: '/admin/review-moderation' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 280 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 h-screen flex flex-col overflow-hidden shrink-0 border-r border-white/[0.04] z-50"
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
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <img src={logo} alt="Frontx" className="w-8 h-8 object-contain shrink-0" />
                <h1 className="text-[18px] font-extrabold text-white tracking-tight leading-tight">FrontX Admin</h1>
              </div>
              <p className="text-[13px] text-slate-400/80 mt-1.5 font-medium tracking-wide">Management Console</p>
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
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group ${
                active
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.12) 100%)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    boxShadow: '0 0 20px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-400 to-indigo-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              )}
              {!active && (
                <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              )}
              <item.icon className={`w-[18px] h-[18px] shrink-0 relative z-10 transition-colors duration-200 ${active ? 'text-blue-400' : ''}`} />
              <AnimatePresence>
                {!collapsed && (
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
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-[18px] h-[18px] shrink-0" />
          ) : (
            <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
          )}
          <AnimatePresence>
            {!collapsed && (
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
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 relative">
            <Zap className="w-4 h-4 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0F172A] shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap min-w-0 flex-1"
              >
                <p className="text-[12px] font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500/70 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 group ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 transition-colors duration-200 group-hover:text-red-400" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <style>{`
        @keyframes shimmerSweep {
          0%, 100% { background-position: -250% 0; }
          50% { background-position: 250% 0; }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
      `}</style>
    </motion.aside>
  );
};

export default AdminSidebar;
