import { API_BASE } from '../../config/api';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Monitor, Settings, Lock, User, 
  CheckCircle2, Save, XCircle, Sliders, KeyRound, Sparkles, Check
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className="fixed top-6 left-1/2 z-[60] px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5"
      style={{
        background: type === 'success'
          ? 'linear-gradient(135deg, rgba(16,185,129,0.95) 0%, rgba(5,150,105,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(239,68,68,0.95) 0%, rgba(220,38,38,0.95) 100%)',
        borderColor: type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
      }}
    >
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 text-white" />
        : <XCircle className="w-4 h-4 text-white" />}
      <span className="text-sm font-medium text-white">{message}</span>
    </motion.div>
  );
};

const AdminSettings = () => {
  const { user, updateTheme, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Platform Administrator',
    email: user?.email || 'admin@uftb.ac.bd',
    department: user?.department || 'Educational Technology and Engineering',
    phone: user?.phone || '+880 1700-000000',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [systemRules, setSystemRules] = useState({
    autoApproveAlumni: true,
    requireStudyNoteForCareer: true,
    allowRecruiterOpportunities: true,
    emailNotifications: true,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || 'Platform Administrator',
        email: user.email || 'admin@uftb.ac.bd',
        department: user.department || 'Educational Technology and Engineering',
        phone: user.phone || '+880 1700-000000',
      });
    }
  }, [user]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const currentTheme = user?.themePreference || localStorage.getItem('landing-theme') || 'light';

  const handleThemeChange = (mode) => {
    updateTheme(mode);
    const themeNames = {
      light: 'Daylight Mode',
      dark: 'Dark Mode',
      system: 'System Default',
    };
    showToast(`Theme switched to ${themeNames[mode] || mode}`);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/users/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Admin settings saved successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/users/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Password changed successfully. Please log in again.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance & Theme', icon: Sun, desc: 'Daylight, Dark, & System theme controls' },
    { id: 'account', label: 'Admin Profile', icon: User, desc: 'Personal & department information' },
    { id: 'system', label: 'Portal Rules', icon: Sliders, desc: 'Platform rules & automated workflows' },
    { id: 'security', label: 'Security & Auth', icon: Lock, desc: 'Password & account security' },
  ];

  const themes = [
    {
      id: 'light',
      title: 'Daylight Mode',
      desc: 'Clean, high-contrast light theme optimized for daytime readability',
      icon: Sun,
      color: 'from-amber-400 to-orange-500',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      bgPreview: 'bg-slate-50 border-slate-200',
      cardPreview: 'bg-white border-slate-200 shadow-sm',
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      desc: 'Sleek, eye-friendly dark theme tailored for night & low-light environments',
      icon: Moon,
      color: 'from-indigo-500 to-purple-600',
      badgeBg: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
      bgPreview: 'bg-slate-950 border-slate-800',
      cardPreview: 'bg-slate-900 border-slate-800 shadow-md',
    },
    {
      id: 'system',
      title: 'System Default',
      desc: 'Automatically synchronizes with your device operating system theme',
      icon: Monitor,
      color: 'from-blue-500 to-cyan-500',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      bgPreview: 'bg-gradient-to-r from-slate-100 to-slate-900 border-slate-300',
      cardPreview: 'bg-gradient-to-r from-white to-slate-900 border-slate-300',
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="flex-1 overflow-y-auto min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Settings className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Admin Dashboard Settings
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
              Manage theme preferences, platform controls, admin account details, and system security.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={fadeUp} custom={1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-500 shadow-md ring-2 ring-blue-500/15'
                    : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  {isActive && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {t.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Contents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* 1. APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Theme & Display Settings</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Choose your preferred theme style for the FrontX Admin Portal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {themes.map((t) => {
                  const isActive = currentTheme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${t.color} text-white shadow-md`}>
                            <t.icon className="w-6 h-6" />
                          </div>
                          {isActive ? (
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                              <Check className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Click to select</span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{t.desc}</p>
                      </div>

                      {/* Live Mini Preview Box */}
                      <div className={`rounded-xl p-3 border ${t.bgPreview} transition-all`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="text-[10px] text-slate-400 font-mono ml-auto">Preview</span>
                        </div>
                        <div className={`rounded-lg p-2.5 ${t.cardPreview} flex items-center justify-between`}>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500 text-white">Select</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Current Active Preference: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{currentTheme.toUpperCase()}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Theme preferences are stored locally and synced across your admin user profile.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ADMIN PROFILE TAB */}
          {activeTab === 'account' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Profile Information</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Update your contact details and administrator information.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Official University Administrator email.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+880 1700-000000"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. PORTAL RULES TAB */}
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Portal Rules & Automated Workflows</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configure automated policies for opportunity approvals, student career access, and notifications.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  {
                    key: 'autoApproveAlumni',
                    title: 'Auto-Verify Alumni Accounts',
                    desc: 'Automatically approve alumni registrants with valid university email domains.',
                  },
                  {
                    key: 'requireStudyNoteForCareer',
                    title: 'Require Weekly Study Notes for Career Access',
                    desc: 'Lock Career Opportunities for students if required study planner note is missed.',
                  },
                  {
                    key: 'allowRecruiterOpportunities',
                    title: 'Recruiter Opportunity Approvals',
                    desc: 'Require admin review before publishing recruiter-created job & internship opportunities.',
                  },
                  {
                    key: 'emailNotifications',
                    title: 'Admin Email Notifications',
                    desc: 'Receive instant email alerts when new recruiter opportunities or user reports are filed.',
                  },
                ].map((rule) => (
                  <div
                    key={rule.key}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rule.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rule.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSystemRules({ ...systemRules, [rule.key]: !systemRules[rule.key] })}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
                        systemRules[rule.key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                          systemRules[rule.key] ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 4. SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Password Management</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Change your administrator password to maintain account security.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isSaving ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </motion.div>
          )}

        </div>

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminSettings;
