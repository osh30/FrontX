import { API_BASE } from '../../../config/api';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import {
  User, Building2, Lock, Sun, Moon, Monitor, Bell,
  ShieldCheck, AlertTriangle, Save, Loader2, LogOut,
  Trash2, Eye, EyeOff, CheckCircle2, XCircle, Upload, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = API_BASE;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// Single Eye Password Field Component (Strictly 1 Eye Icon)
const PasswordInput = ({ label, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-11 bg-white dark:bg-slate-800 border rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
            error ? 'border-red-300 dark:border-red-500 focus:border-red-400' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          title={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
};

// Custom Toggle Switch
const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 rounded-xl">
    <div className="pr-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{label}</h4>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

const RecruiterSettings = () => {
  const { logout, user, updateTheme, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    designation: '',
    department: '',
    linkedinLink: '',
    bio: '',
    profilePicture: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Company Form State
  const [company, setCompany] = useState({
    companyName: '',
    industryType: '',
    companyWebsite: '',
    officeAddress: '',
    companyDescription: '',
    companyLogo: ''
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});

  // Appearance State
  const [selectedTheme, setSelectedTheme] = useState(user?.themePreference || 'system');

  // Notifications State
  const [notifications, setNotifications] = useState({
    inApp: {
      newApplication: true,
      applicationStatusUpdates: true,
      interviewScheduled: true,
      interviewReminder: true,
      opportunityUpdates: true,
      systemAnnouncements: true
    },
    email: {
      newApplication: true,
      interviewScheduled: true,
      interviewReminder: true,
      applicationUpdates: true,
      importantAccountNotifications: true
    }
  });

  // Privacy State
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showContactInfo: true,
    showCompanyInfo: true
  });

  // Danger Zone / Deactivate State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  // Load Settings from Backend
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/recruiter/settings`, { headers: authHeaders() });
      if (res.data) {
        if (res.data.profile) setProfile(res.data.profile);
        if (res.data.company) setCompany(res.data.company);
        if (res.data.themePreference) setSelectedTheme(res.data.themePreference);
        if (res.data.notificationSettings) setNotifications(res.data.notificationSettings);
        if (res.data.privacySettings) setPrivacy(res.data.privacySettings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Failed to load recruiter settings');
    } finally {
      setLoading(false);
    }
  };

  // 1. Profile Save Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return toast.error('Full Name is required');

    setSavingSection('profile');
    try {
      const res = await axios.put(`${API_URL}/recruiter/settings/profile`, profile, { headers: authHeaders() });
      toast.success('Account profile updated successfully');
      if (res.data.user && setUser) {
        setUser(prev => ({ ...prev, ...res.data.user }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...res.data.user }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingSection(null);
    }
  };

  // Upload Profile Photo via Cloudinary
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'profile-pictures');

    setUploadingPhoto(true);
    try {
      const res = await axios.post(`${API_URL}/users/upload`, formData, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' }
      });
      const photoUrl = res.data.url;
      setProfile(p => ({ ...p, profilePicture: photoUrl }));
      toast.success('Profile photo uploaded!');
    } catch (err) {
      toast.error('Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveProfilePhoto = async () => {
    setProfile(p => ({ ...p, profilePicture: '' }));
    try {
      await axios.delete(`${API_URL}/users/profile-picture`, { headers: authHeaders() });
      toast.success('Profile photo removed');
    } catch {
      toast.success('Photo removed');
    }
  };

  // 2. Company Save Handler
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!company.companyName.trim()) return toast.error('Company Name is required');

    setSavingSection('company');
    try {
      const res = await axios.put(`${API_URL}/recruiter/settings/company`, company, { headers: authHeaders() });
      toast.success('Company information updated successfully');
      if (res.data.user && setUser) {
        setUser(prev => ({ ...prev, ...res.data.user }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...res.data.user }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update company information');
    } finally {
      setSavingSection(null);
    }
  };

  // Upload Company Logo via Cloudinary
  const handleCompanyLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = await axios.post(`${API_URL}/recruiter/company-profile/logo`, formData, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' }
      });
      const logoUrl = res.data.companyLogo;
      setCompany(c => ({ ...c, companyLogo: logoUrl }));
      toast.success('Company logo uploaded!');
    } catch (err) {
      toast.error('Failed to upload company logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveCompanyLogo = async () => {
    setCompany(c => ({ ...c, companyLogo: '' }));
    try {
      await axios.delete(`${API_URL}/recruiter/company-profile/logo`, { headers: authHeaders() });
      toast.success('Company logo removed');
    } catch {
      toast.success('Logo removed');
    }
  };

  // 3. Password Save Handler
  const handleSavePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwords.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwords.newPassword) errors.newPassword = 'New password is required';
    else if (passwords.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (!passwords.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (passwords.newPassword !== passwords.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingSection('password');
    try {
      await axios.put(`${API_URL}/recruiter/settings/password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, { headers: authHeaders() });

      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingSection(null);
    }
  };

  // 4. Appearance Save Handler
  const handleSelectTheme = async (mode) => {
    setSelectedTheme(mode);
    try {
      if (updateTheme) updateTheme(mode);
      await axios.put(`${API_URL}/recruiter/settings/appearance`, { themePreference: mode }, { headers: authHeaders() });
      toast.success(`Theme updated to ${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    } catch (err) {
      toast.error('Failed to save theme preference');
    }
  };

  // 5. Notifications Save Handler
  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setSavingSection('notifications');
    try {
      await axios.put(`${API_URL}/recruiter/settings/notifications`, { notificationSettings: notifications }, { headers: authHeaders() });
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error('Failed to save notification preferences');
    } finally {
      setSavingSection(null);
    }
  };

  // 6. Privacy Save Handler
  const handleSavePrivacy = async (e) => {
    e.preventDefault();
    setSavingSection('privacy');
    try {
      await axios.put(`${API_URL}/recruiter/settings/privacy`, { privacySettings: privacy }, { headers: authHeaders() });
      toast.success('Privacy settings saved');
    } catch (err) {
      toast.error('Failed to save privacy settings');
    } finally {
      setSavingSection(null);
    }
  };

  // 7. Deactivate Account Handler
  const handleDeactivateAccount = async (e) => {
    e.preventDefault();
    if (!deactivatePassword) {
      setDeactivateError('Password is required');
      return;
    }
    setDeactivating(true);
    setDeactivateError('');
    try {
      await axios.post(`${API_URL}/recruiter/settings/deactivate`, { password: deactivatePassword }, { headers: authHeaders() });
      toast.success('Account deactivated');
      setTimeout(() => logout(), 800);
    } catch (err) {
      setDeactivateError(err.response?.data?.message || 'Deactivation failed. Check password.');
    } finally {
      setDeactivating(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Account & Profile', icon: User },
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'password', label: 'Password & Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Account', icon: ShieldCheck },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true }
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
          <div className="lg:col-span-3 h-96 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiter Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account details, company info, preferences, and security settings.
        </p>
      </motion.div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                  isActive
                    ? tab.danger
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-sm'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : tab.danger
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? (tab.danger ? 'text-red-600 dark:text-red-400' : 'text-white') : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* TAB 1: ACCOUNT & PROFILE */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Account &amp; Profile</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Update your personal account details</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Avatar Upload Area */}
                  <div className="flex items-center gap-5 pb-2">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                        {profile.profilePicture ? (
                          <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {uploadingPhoto ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                        <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                          <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                        </label>
                        {profile.profilePicture && (
                          <button
                            type="button"
                            onClick={handleRemoveProfilePhoto}
                            className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address (Read-only)</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">Registered university/corporate email cannot be changed directly.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={profile.phoneNumber}
                        onChange={e => setProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="+880 1700-000000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Job Title / Position</label>
                      <input
                        type="text"
                        value={profile.designation}
                        onChange={e => setProfile(p => ({ ...p, designation: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Lead Engineering Recruiter"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                      <input
                        type="text"
                        value={profile.department}
                        onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Human Resources / Engineering"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">LinkedIn Profile</label>
                      <input
                        type="text"
                        value={profile.linkedinLink}
                        onChange={e => setProfile(p => ({ ...p, linkedinLink: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bio / About</label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Brief overview of your recruiting role and focus areas..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSection === 'profile'}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50"
                    >
                      {savingSection === 'profile' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingSection === 'profile' ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 2: COMPANY INFO */}
            {activeTab === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Company Information</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your company branding and details</p>
                  </div>
                </div>

                <form onSubmit={handleSaveCompany} className="space-y-5">
                  {/* Logo Area */}
                  <div className="flex items-center gap-5 pb-2">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {company.companyLogo ? (
                        <img src={company.companyLogo} alt={company.companyName} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Building2 className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                          <input type="file" accept="image/*" onChange={handleCompanyLogoUpload} className="hidden" disabled={uploadingLogo} />
                        </label>
                        {company.companyLogo && (
                          <button
                            type="button"
                            onClick={handleRemoveCompanyLogo}
                            className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">Official company logo (PNG or SVG recommended).</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Company Name *</label>
                      <input
                        type="text"
                        value={company.companyName}
                        onChange={e => setCompany(c => ({ ...c, companyName: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Pathao Bangladesh"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Industry Type</label>
                      <input
                        type="text"
                        value={company.industryType}
                        onChange={e => setCompany(c => ({ ...c, industryType: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Logistics / Software / FinTech"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Official Website</label>
                      <input
                        type="text"
                        value={company.companyWebsite}
                        onChange={e => setCompany(c => ({ ...c, companyWebsite: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="https://company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Office Address</label>
                      <input
                        type="text"
                        value={company.officeAddress}
                        onChange={e => setCompany(c => ({ ...c, officeAddress: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Dhaka, Bangladesh"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Company Description</label>
                    <textarea
                      rows={4}
                      value={company.companyDescription}
                      onChange={e => setCompany(c => ({ ...c, companyDescription: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="About your company, mission, values, and work culture..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSection === 'company'}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white font-semibold text-sm rounded-xl hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50"
                    >
                      {savingSection === 'company' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingSection === 'company' ? 'Saving...' : 'Save Company Details'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 3: PASSWORD & SECURITY */}
            {activeTab === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Password &amp; Security</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password securely</p>
                  </div>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-4 max-w-lg">
                  <PasswordInput
                    label="Current Password *"
                    value={passwords.currentPassword}
                    onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    error={pwErrors.currentPassword}
                  />

                  <PasswordInput
                    label="New Password *"
                    value={passwords.newPassword}
                    onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min. 6 characters"
                    error={pwErrors.newPassword}
                  />

                  <PasswordInput
                    label="Confirm New Password *"
                    value={passwords.confirmPassword}
                    onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    error={pwErrors.confirmPassword}
                  />

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSection === 'password'}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50"
                    >
                      {savingSection === 'password' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingSection === 'password' ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 4: APPEARANCE */}
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Appearance &amp; Theme</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Customize the theme across your Recruiter Dashboard</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', icon: Sun, label: 'Light Mode', desc: 'Clean white UI' },
                    { id: 'dark', icon: Moon, label: 'Dark Mode', desc: 'Sleek dark theme' },
                    { id: 'system', icon: Monitor, label: 'System Default', desc: 'Match OS theme' }
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = selectedTheme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTheme(item.id)}
                        className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col items-start justify-between min-h-[120px] ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-md'
                            : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 5: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose how and when you want to be notified</p>
                  </div>
                </div>

                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  {/* In-App Notifications */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">In-App Notifications</h4>
                    <ToggleSwitch
                      label="New Application Received"
                      description="Notify inside dashboard when a student applies for your job"
                      checked={notifications.inApp.newApplication}
                      onChange={val => setNotifications(n => ({ ...n, inApp: { ...n.inApp, newApplication: val } }))}
                    />
                    <ToggleSwitch
                      label="Application Status Updates"
                      description="Notify when application status changes"
                      checked={notifications.inApp.applicationStatusUpdates}
                      onChange={val => setNotifications(n => ({ ...n, inApp: { ...n.inApp, applicationStatusUpdates: val } }))}
                    />
                    <ToggleSwitch
                      label="Interview Scheduled"
                      description="Notify when an interview is confirmed with a candidate"
                      checked={notifications.inApp.interviewScheduled}
                      onChange={val => setNotifications(n => ({ ...n, inApp: { ...n.inApp, interviewScheduled: val } }))}
                    />
                    <ToggleSwitch
                      label="Interview Reminders"
                      description="Receive upcoming interview reminders before the scheduled time"
                      checked={notifications.inApp.interviewReminder}
                      onChange={val => setNotifications(n => ({ ...n, inApp: { ...n.inApp, interviewReminder: val } }))}
                    />
                  </div>

                  {/* Email Notifications */}
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Notifications</h4>
                    <ToggleSwitch
                      label="New Application Email Alert"
                      description="Send instant email digest when new applicants apply"
                      checked={notifications.email.newApplication}
                      onChange={val => setNotifications(n => ({ ...n, email: { ...n.email, newApplication: val } }))}
                    />
                    <ToggleSwitch
                      label="Interview Calendar Invitations"
                      description="Email calendar meeting invites for scheduled candidate interviews"
                      checked={notifications.email.interviewScheduled}
                      onChange={val => setNotifications(n => ({ ...n, email: { ...n.email, interviewScheduled: val } }))}
                    />
                    <ToggleSwitch
                      label="Important Account Updates"
                      description="Receive system announcements and security alerts"
                      checked={notifications.email.importantAccountNotifications}
                      onChange={val => setNotifications(n => ({ ...n, email: { ...n.email, importantAccountNotifications: val } }))}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSection === 'notifications'}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-semibold text-sm rounded-xl hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200 disabled:opacity-50"
                    >
                      {savingSection === 'notifications' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingSection === 'notifications' ? 'Saving...' : 'Save Notification Settings'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 6: PRIVACY & ACCOUNT */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Privacy &amp; Visibility</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Control who can see your recruiter profile and contact info</p>
                  </div>
                </div>

                <form onSubmit={handleSavePrivacy} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Profile Visibility</label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={e => setPrivacy(p => ({ ...p, profileVisibility: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="public">Public (Visible to registered FrontX students &amp; alumni)</option>
                      <option value="limited">Limited (Visible only to candidates who applied to your jobs)</option>
                    </select>
                  </div>

                  <ToggleSwitch
                    label="Display Contact Phone Number"
                    description="Allow applicants to view your contact phone number in candidate communications"
                    checked={privacy.showContactInfo}
                    onChange={val => setPrivacy(p => ({ ...p, showContactInfo: val }))}
                  />

                  <ToggleSwitch
                    label="Display Detailed Company Overview"
                    description="Show full company address and description on public job posts"
                    checked={privacy.showCompanyInfo}
                    onChange={val => setPrivacy(p => ({ ...p, showCompanyInfo: val }))}
                  />

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSection === 'privacy'}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50"
                    >
                      {savingSection === 'privacy' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingSection === 'privacy' ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 7: DANGER ZONE & ACCOUNT MANAGEMENT */}
            {activeTab === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-950/50 shadow-sm p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-red-100 dark:border-red-950/50">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Danger Zone &amp; Account Management</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Actions here affect your account session and status</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Logout Box */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                        <LogOut className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Sign Out</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Log out of your recruiter account on this device</p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>

                  {/* Deactivate Account Box */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Deactivate Recruiter Account</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Deactivates your login access while preserving job history</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowDeactivateModal(true); setDeactivateError(''); setDeactivatePassword(''); }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deactivate Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Account Deactivation Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              <div className="p-6 sm:p-8">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Confirm Account Deactivation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Your account will be deactivated and you will be logged out immediately. Your job posts and candidate records will remain safely preserved in the database.
                </p>

                <form onSubmit={handleDeactivateAccount} className="space-y-4">
                  <PasswordInput
                    label="Enter your password to confirm deactivation"
                    value={deactivatePassword}
                    onChange={e => { setDeactivatePassword(e.target.value); setDeactivateError(''); }}
                    placeholder="Your password"
                    error={deactivateError}
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeactivateModal(false)}
                      disabled={deactivating}
                      className="flex-1 px-5 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={deactivating}
                      className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {deactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      {deactivating ? 'Deactivating...' : 'Deactivate Account'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecruiterSettings;
