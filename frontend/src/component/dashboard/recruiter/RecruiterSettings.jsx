import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, Save, Loader2, Lock, LogOut, Trash2, AlertTriangle, Eye, EyeOff, KeyRound, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const Field = ({ label, type = 'text', value, onChange, placeholder, error, showToggle }) => {
  const [show, setShow] = useState(false);
  const inputType = showToggle && show ? 'text' : type;
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-11 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
            error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
          }`}
        />
        {showToggle && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
};

const RecruiterSettings = () => {
  const { logout, user } = useAuth();

  // Password & Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState(false);

  // Account management
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const validatePasswordForm = () => {
    const errors = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    else if (!passwordRegex.test(newPassword)) {
      errors.newPassword = 'Password must be at least 8 characters with an uppercase letter, lowercase letter, and number';
    }
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPwErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess(false);
    if (!validatePasswordForm()) return;

    setSaving(true);
    try {
      await axios.put(`${API_URL}/users/change-password`, { currentPassword, newPassword }, { headers: authHeaders() });
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwErrors({});
      toast.success('Password updated successfully');
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
      setPwErrors({ server: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await axios.delete(`${API_URL}/users/account`, { headers: authHeaders(), data: { password: deletePassword } });
      toast.success('Your account has been deleted');
      setTimeout(() => logout(), 800);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account security and preferences.</p>
      </motion.div>

      {/* Password & Security */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Password &amp; Security</h3>
              <p className="text-xs text-gray-500 mt-0.5">Update your account password to keep it secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <Field label="Current Password" type="password" showToggle value={currentPassword}
              onChange={e => { setCurrentPassword(e.target.value); setPwErrors(p => ({ ...p, currentPassword: '' })); }}
              placeholder="Enter current password" error={pwErrors.currentPassword} />
            <Field label="New Password" type="password" showToggle value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setPwErrors(p => ({ ...p, newPassword: '', server: '' })); }}
              placeholder="Min. 8 characters with uppercase, lowercase & number" error={pwErrors.newPassword} />
            <Field label="Confirm New Password" type="password" showToggle value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setPwErrors(p => ({ ...p, confirmPassword: '' })); }}
              placeholder="Re-enter new password" error={pwErrors.confirmPassword} />

            <AnimatePresence>
              {pwSuccess && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Password updated successfully
                </motion.div>
              )}
              {pwErrors.server && !pwSuccess && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <XCircle className="w-4 h-4 shrink-0" />
                  {pwErrors.server}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Account Management */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0 shadow-lg shadow-slate-500/20">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Account Management</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.companyName ? `Signed in as ${user.companyName}` : 'Manage your account'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Logout</p>
                  <p className="text-xs text-gray-500">Sign out of your account on this device</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently deactivate your account and remove your data</p>
                </div>
              </div>
              <button onClick={() => { setShowDeleteDialog(true); setDeleteError(''); setDeletePassword(''); }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex items-center gap-1.5 text-xs text-gray-400 pl-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        Your password is encrypted and stored securely. All changes are saved to MongoDB.
      </motion.p>

      {/* Delete Account Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Account?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  This will permanently deactivate your account and you will not be able to log in again. This action cannot be undone.
                </p>

                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter your password to confirm</label>
                    <input type="password" value={deletePassword} onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                      placeholder="Your password" autoFocus
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-400" />
                    {deleteError && <p className="text-xs text-red-500 mt-1.5">{deleteError}</p>}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => setShowDeleteDialog(false)} disabled={deleting}
                      className="flex-1 px-5 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={deleting}
                      className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      {deleting ? 'Deleting...' : 'Delete Account'}
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
