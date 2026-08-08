import { API_BASE } from '../../../config/api';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Building2, Globe, MapPin, Save, Loader2, Upload, X, CheckCircle,
  Phone, Mail, User, FileText, Briefcase, Shield, Camera
} from 'lucide-react';

const API_URL = API_BASE;

const INDUSTRIES = [
  'Software Development', 'Information Technology', 'Education', 'Healthcare',
  'Telecommunications', 'FinTech', 'E-commerce', 'Manufacturing',
  'Government', 'NGO', 'Other'
];

const CompanyProfile = ({ user }) => {
  const [form, setForm] = useState({
    companyName: '', industryType: '', companyWebsite: '',
    officeAddress: '', companyDescription: '', phoneNumber: '', contactPerson: ''
  });
  const [companyLogo, setCompanyLogo] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const [activeJobs, setActiveJobs] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/recruiter/company-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({
        companyName: data.companyName || '',
        industryType: data.industryType || '',
        companyWebsite: data.companyWebsite || '',
        officeAddress: data.officeAddress || '',
        companyDescription: data.companyDescription || '',
        phoneNumber: data.phoneNumber || '',
        contactPerson: data.contactPerson || ''
      });
      setCompanyLogo(data.companyLogo || '');
      setVerificationStatus(data.verificationStatus || 'unverified');
      setActiveJobs(data.activeJobs || 0);
      setHasChanges(false);
    } catch (err) {
      showToast('Failed to load company profile', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.industryType) errs.industryType = 'Industry is required';
    if (!form.companyDescription.trim()) errs.companyDescription = 'Description is required';
    else if (form.companyDescription.length > 1000) errs.companyDescription = 'Maximum 1000 characters';
    if (form.companyWebsite.trim()) {
      try { new URL(form.companyWebsite); }
      catch { errs.companyWebsite = 'Enter a valid URL'; }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/recruiter/company-profile`, {
        companyName: form.companyName.trim(),
        industryType: form.industryType,
        companyWebsite: form.companyWebsite.trim(),
        officeAddress: form.officeAddress.trim(),
        companyDescription: form.companyDescription.trim(),
        phoneNumber: form.phoneNumber.trim(),
        contactPerson: form.contactPerson.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      setHasChanges(false);
      showToast('Company profile updated successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a JPG, JPEG, PNG, or WEBP image', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('logo', file);
      const { data } = await axios.post(`${API_URL}/recruiter/company-profile/logo`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setCompanyLogo(data.companyLogo);
      showToast('Logo uploaded successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload logo', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    setRemovingLogo(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/recruiter/company-profile/logo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanyLogo('');
      showToast('Logo removed');
    } catch (err) {
      showToast('Failed to remove logo', 'error');
    } finally {
      setRemovingLogo(false);
    }
  };

  const inputClass = (field) =>
    `w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
      errors[field] ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
    }`;

  return (
    <div className="max-w-5xl space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700'
                : 'bg-red-50/90 border-red-200 text-red-700'
            }`}>
            {toast.type === 'success'
              ? <CheckCircle className="w-5 h-5 text-emerald-500" />
              : <X className="w-5 h-5 text-red-500" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#162a50] p-8 sm:p-10">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
          {/* Glitter dots */}
          {[...Array(20)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
          ))}
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Company Profile</h1>
          <p className="text-sm sm:text-base text-blue-200/70 mt-2 max-w-lg leading-relaxed">
            Manage your company information, branding, and public profile that will be visible to students.
          </p>
        </div>
      </motion.div>

      {/* Main Profile Card */}
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Company Logo Section */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
              {companyLogo ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-blue-100">
                  <img src={companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-dashed border-blue-200 flex items-center justify-center group-hover:border-blue-400 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-blue-300" />
                  )}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                {!uploading && <Upload className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleLogoUpload} className="hidden" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Company Logo</h3>
              <p className="text-sm text-gray-500 mt-1">Upload your company logo. Recommended size: 400x400px. Max 5MB.</p>
              <div className="flex items-center gap-3 mt-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {companyLogo ? 'Replace Logo' : 'Upload Logo'}
                </button>
                {companyLogo && (
                  <button type="button" onClick={handleRemoveLogo} disabled={removingLogo}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                    {removingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Company Information
            </h3>
            <p className="text-sm text-gray-500 mt-1">Basic details about your organization.</p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name *</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input name="companyName" value={form.companyName} onChange={handleChange}
                placeholder="Acme Corporation" className={inputClass('companyName')} />
            </div>
            {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry *</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select name="industryType" value={form.industryType} onChange={handleChange}
                className={`${inputClass('industryType')} appearance-none cursor-pointer`}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            {errors.industryType && <p className="text-xs text-red-500 mt-1">{errors.industryType}</p>}
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Official Website</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange}
                placeholder="https://www.example.com" className={inputClass('companyWebsite')} />
            </div>
            {errors.companyWebsite && <p className="text-xs text-red-500 mt-1">{errors.companyWebsite}</p>}
          </div>

          {/* Office Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Office Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input name="officeAddress" value={form.officeAddress} onChange={handleChange}
                placeholder="123 Tech Park, Dhaka, Bangladesh" className={inputClass('officeAddress')} />
            </div>
          </div>

          {/* Company Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Description *</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
              <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange}
                rows={5} maxLength={1000}
                placeholder="Tell students about your company, its mission, values, and what makes it a great place to work..."
                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 resize-none ${
                  errors.companyDescription ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'
                }`} />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              {errors.companyDescription && <p className="text-xs text-red-500">{errors.companyDescription}</p>}
              <p className={`text-xs ml-auto ${form.companyDescription.length > 900 ? 'text-amber-500' : 'text-gray-500'}`}>
                {form.companyDescription.length}/1000
              </p>
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="p-6 sm:p-8 border-t border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Contact Person
            </h3>
            <p className="text-sm text-gray-500 mt-1">Primary point of contact for this company profile.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Person Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input name="contactPerson" value={form.contactPerson} onChange={handleChange}
                  placeholder="John Doe" className={inputClass('contactPerson')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input value={user?.designation || 'Not specified'} disabled
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input value={user?.email || ''} disabled
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                  placeholder="+880 1XXXXXXXXX" className={inputClass('phoneNumber')} />
              </div>
            </div>
          </div>
        </div>

        {/* Status & Stats Bar */}
        <div className="p-6 sm:p-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Status:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  verificationStatus === 'verified'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    verificationStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  {verificationStatus === 'verified' ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Active Jobs:</span>
                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold ring-1 ring-blue-100">
                  {activeJobs}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={fetchCompanyProfile} disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg disabled:opacity-50 ${
                hasChanges
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                  : 'bg-gray-400 shadow-none cursor-not-allowed'
              }`}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default CompanyProfile;
