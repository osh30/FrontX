import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Briefcase, FileText, Users,
  Star, Calendar, BarChart3, Bell, Settings,
  User, LogOut, Menu, X, ChevronLeft, ChevronRight, ClipboardList
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo/frontx-logo.svg';

const SIDEBAR_KEY = 'frontx_recruiter_sidebar_collapsed';

const RecruiterSidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });

  const isCollapsed = internalCollapsed;
  const toggleCollapse = (v) => {
    setInternalCollapsed(v);
    try { localStorage.setItem(SIDEBAR_KEY, String(v)); } catch {}
  };

  const { logout, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'company-profile', label: 'Company Profile', icon: Building2 },
    { id: 'post-opportunity', label: 'Post Opportunity', icon: Briefcase },
    { id: 'my-opportunity-requests', label: 'My Opportunity Requests', icon: ClipboardList },
    { id: 'manage-opportunities', label: 'Manage Opportunities', icon: FileText },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'company-reviews', label: 'Company Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try { await logout(); }
    catch { window.location.href = '/login'; }
  };

  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'R';

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 text-gray-700">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 76 : 264 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex fixed top-0 left-0 h-screen flex-col overflow-hidden shrink-0 border-r border-gray-200/60 z-40 bg-white/70 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.05)]"
      >
        {/* Brand */}
        <div className="relative z-10 px-5 pt-7 pb-6">
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="Frontx" className="w-8 h-8 object-contain shrink-0" />
                  <span className="text-[18px] font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight block">
                    FrontX
                  </span>
                </div>
                <p className="text-[13px] text-gray-400 mt-1.5 font-medium tracking-wide">Recruiter Portal</p>
              </motion.div>
            ) : (
              <div className="flex justify-center">
                <img src={logo} alt="Frontx" className="w-9 h-9 object-contain" />
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 mx-4 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent" />

        {/* Navigation */}
        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-0.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button key={item.id} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.985 }}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group ${isCollapsed ? 'justify-center' : ''} ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-800'
                }`}>
                {isActive && (
                  <motion.div layoutId="activeRecruiterTab"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm border border-blue-100/50 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }} />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                )}
                <item.icon className={`w-[18px] h-[18px] shrink-0 relative z-10 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap relative z-10">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="relative z-10 border-t border-gray-200/50 px-3 py-4 space-y-2">
          <button onClick={() => toggleCollapse(!isCollapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}>
            {isCollapsed ? <ChevronRight className="w-[18px] h-[18px] shrink-0" /> : <ChevronLeft className="w-[18px] h-[18px] shrink-0" />}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Collapse</motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50/40 border border-blue-100/40 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 relative">
              <span className="text-[11px] font-bold text-white">{userInitials}</span>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{user?.name || 'Recruiter'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-[18px] h-[18px] shrink-0 transition-colors duration-200 group-hover:text-red-500" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Logout</motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full bg-white/90 backdrop-blur-xl border-r border-gray-200/60 w-64 shadow-[0_0_40px_rgba(0,0,0,0.08)]">
          <div className="px-5 pt-7 pb-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Frontx" className="w-9 h-9 object-contain shrink-0" />
              <span className="text-[20px] font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block leading-tight">FrontX</span>
            </div>
            <p className="text-[14px] text-gray-400 mt-1.5 font-medium tracking-wide">Recruiter Portal</p>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <motion.button key={item.id} whileTap={{ scale: 0.98 }}
                  onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                    isActive ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                  }`}>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                  <item.icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
          <div className="p-4 border-t border-gray-200/50">
            <motion.button onClick={handleLogout} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
      `}</style>
    </>
  );
};

export default RecruiterSidebar;
