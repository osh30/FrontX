import { API_BASE } from '../../config/api';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Lock, Bell, Eye, Moon, Monitor, Sun, 
  ShieldAlert, Trash2, CheckCircle, Save
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = ({ user }) => {
  const { updateTheme, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const sections = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'privacy', label: 'Privacy & Visibility', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Settings
        </h2>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-md flex items-center gap-2"
        >
          {isSaving ? <span className="animate-pulse">Saving...</span> : saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white shadow-sm border border-gray-100 text-purple-700 font-semibold'
                    : 'text-gray-600 hover:bg-white/50 border border-transparent'
                }`}
              >
                <section.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-sm min-h-[500px]">
          
          {/* Account Settings */}
          {activeSection === 'account' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Registered Email</label>
                  <input type="email" disabled defaultValue={user?.email || "student@university.edu"} className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 cursor-not-allowed" />
                  <p className="text-xs text-gray-500 mt-1">University email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">Danger Zone</h4>
                <div className="p-4 border border-red-100 bg-red-50/50 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-red-700">Delete Account</h5>
                    <p className="text-xs text-red-500">Permanently remove your account and all data.</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy & Visibility */}
          {activeSection === 'privacy' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Privacy & Visibility</h3>
              
              <div className="space-y-4">
                {[
                  { title: "Public Profile", desc: "Allow other students and mentors to view your profile." },
                  { title: "Show Email", desc: "Display your university email on your public profile." },
                  { title: "Show Online Status", desc: "Let others see when you are active on the platform." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/50 border border-gray-100 rounded-xl">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { title: "Email Notifications", desc: "Receive daily digests and important updates via email." },
                  { title: "Mentorship Requests", desc: "Get notified when a mentor accepts or declines your request." },
                  { title: "New Job Matches", desc: "Alert me when a job matches my AI skill profile." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/50 border border-gray-100 rounded-xl">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Appearance</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'light', icon: Sun, label: "Light Mode" },
                  { id: 'dark', icon: Moon, label: "Dark Mode" },
                  { id: 'system', icon: Monitor, label: "System Default" }
                ].map(theme => {
                  const currentTheme = user?.themePreference || 'system';
                  const isActive = currentTheme === theme.id;
                  
                  return (
                    <button 
                      key={theme.id} 
                      onClick={() => updateTheme(theme.id)}
                      className={`p-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 transition-all ${
                        isActive 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}
                    >
                      <theme.icon className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${isActive ? 'text-purple-700' : 'text-gray-600'}`}>{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <PasswordUpdateForm logout={logout} />
          )}

        </div>
      </div>
    </div>
  );
};

const PasswordUpdateForm = ({ logout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/users/change-password`, 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Password updated successfully. Please log in with your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Force logout after 2 seconds
      setTimeout(() => {
        logout();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Security</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
        {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100">{success}</div>}
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Current Password</label>
          <input 
            type="password" 
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            placeholder="••••••••" 
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">New Password</label>
          <input 
            type="password" 
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            placeholder="••••••••" 
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••" 
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all" 
          />
        </div>
        <button 
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </motion.div>
  );
};

export default SettingsPage;
