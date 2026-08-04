import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { User, Mail, Building2, Briefcase, Globe, MapPin, Edit3, Save, Loader2, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const RecruiterProfile = ({ user }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '', bio: '', companyName: '', designation: '',
    industryType: '', companyWebsite: '', companyAddress: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        companyName: user.companyName || '',
        designation: user.designation || '',
        industryType: user.industryType || '',
        companyWebsite: user.companyWebsite || '',
        companyAddress: user.companyAddress || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await axios.put(`${API_URL}/recruiter/profile`, form);
      setMessage('Profile updated successfully');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400";

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'R';

  return (
    <div className="max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Your recruiter profile information.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{initials}</span>
            </div>
          </div>
        </div>

        <div className="pt-14 p-6 space-y-5">
          {editing ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))} rows={3}
                  className={`${inputClass} resize-none`} placeholder="Tell us about yourself..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company</label>
                  <input value={form.companyName} onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation</label>
                  <input value={form.designation} onChange={(e) => setForm(prev => ({ ...prev, designation: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry</label>
                  <input value={form.industryType} onChange={(e) => setForm(prev => ({ ...prev, industryType: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                  <input value={form.companyWebsite} onChange={(e) => setForm(prev => ({ ...prev, companyWebsite: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                <input value={form.companyAddress} onChange={(e) => setForm(prev => ({ ...prev, companyAddress: e.target.value }))} className={inputClass} />
              </div>

              {message && (
                <p className={`text-sm font-medium ${message.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>{message}</p>
              )}

              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={user?.name} />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user?.email} />
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company" value={user?.companyName || 'Not set'} />
              <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Designation" value={user?.designation || 'Not set'} />
              <InfoRow icon={<Globe className="w-4 h-4" />} label="Industry" value={user?.industryType || 'Not set'} />
              <InfoRow icon={<Globe className="w-4 h-4" />} label="Website" value={user?.companyWebsite || 'Not set'} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={user?.companyAddress || 'Not set'} />
              {user?.bio && <InfoRow icon={<User className="w-4 h-4" />} label="Bio" value={user.bio} />}
              <div className="pt-3 border-t border-gray-100">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user?.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  Account {user?.status || 'approved'}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-gray-400">{icon}</span>
    </div>
    <div>
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  </div>
);

export default RecruiterProfile;
