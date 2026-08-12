import { API_BASE } from '../../config/api';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Briefcase, CheckCircle2, XCircle,
} from 'lucide-react';

const API_URL = API_BASE;

const TYPES = ['Government Job', 'Private Job', 'Scholarship', 'Competition'];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const HeroParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[
      { left: '10%', top: '20%', size: 3, delay: 0, dur: 8 },
      { left: '80%', top: '25%', size: 2, delay: 1.2, dur: 9 },
      { left: '25%', top: '70%', size: 2.5, delay: 0.6, dur: 7 },
      { left: '70%', top: '75%', size: 2, delay: 2, dur: 8.5 },
      { left: '50%', top: '10%', size: 1.5, delay: 2.5, dur: 10 },
      { left: '15%', top: '50%', size: 2, delay: 0.8, dur: 7.5 },
      { left: '88%', top: '55%', size: 1.8, delay: 1.8, dur: 9 },
      { left: '40%', top: '85%', size: 2.2, delay: 3, dur: 6.5 },
      { left: '60%', top: '30%', size: 1.5, delay: 1.5, dur: 9.5 },
      { left: '35%', top: '58%', size: 2, delay: 3.2, dur: 7 },
    ].map((p, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white/[0.25]"
        style={{
          left: p.left, top: p.top, width: p.size, height: p.size,
          animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }}
      />
    ))}
  </div>
);

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
          ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.1) 100%)',
        borderColor: type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        : <XCircle className="w-4 h-4 text-red-400" />}
      <span className="text-sm font-medium text-white">{message}</span>
    </motion.div>
  );
};

const EmptyForm = {
  type: 'Government Job',
  title: '',
  organization: '',
  description: '',
  eligibility: '',
  deadline: '',
  applyLink: '',
  attachment: '',
  featured: false,
};

const AdminOpportunityCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...EmptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const getLabel = (field) => {
    if (form.type === 'Scholarship') {
      switch (field) {
        case 'title': return 'Scholarship Title';
        case 'organization': return 'Organization / Provider';
        case 'description': return 'Short Description';
        case 'eligibility': return 'Eligibility';
        case 'deadline': return 'Application Deadline';
        case 'applyLink': return 'Apply Link (URL)';
        default: return field;
      }
    } else if (form.type === 'Competition') {
      switch (field) {
        case 'title': return 'Competition Title';
        case 'organization': return 'Organizer';
        case 'description': return 'Short Description';
        case 'eligibility': return 'Eligibility / Who Can Participate';
        case 'deadline': return 'Registration Deadline';
        case 'applyLink': return 'Registration Link (URL)';
        default: return field;
      }
    } else {
      switch (field) {
        case 'title': return 'Opportunity Title';
        case 'organization': return 'Organization / Company';
        case 'description': return 'Description';
        case 'eligibility': return 'Eligibility / Requirements';
        case 'deadline': return 'Application Deadline';
        case 'applyLink': return 'Apply Link (URL)';
        default: return field;
      }
    }
  };

  const getPlaceholder = (field) => {
    if (form.type === 'Scholarship') {
      switch (field) {
        case 'title': return 'e.g. Full-Bright Postgraduate Scholarship';
        case 'organization': return 'e.g. DAAD, Commonwealth Foundation';
        case 'description': return 'Provide a brief summary of funding, benefits, and coverage...';
        case 'eligibility': return 'Who is eligible? (e.g. ETE Seniors with CGPA >= 3.5)';
        case 'applyLink': return 'https://scholarship-provider.org/apply';
        default: return '';
      }
    } else if (form.type === 'Competition') {
      switch (field) {
        case 'title': return 'e.g. National EdTech Hackathon 2026';
        case 'organization': return 'e.g. IEEE UFTB Student Branch, BASIS';
        case 'description': return 'Provide a brief summary of competition tracks, prizes, and rules...';
        case 'eligibility': return 'Who can participate? (e.g. Open to all undergraduate engineering students)';
        case 'applyLink': return 'https://competition.org/register';
        default: return '';
      }
    } else {
      switch (field) {
        case 'title': return 'e.g. Software Engineer Position';
        case 'organization': return 'e.g. Google, Ministry of Education';
        case 'description': return 'Describe the opportunity in detail...';
        case 'eligibility': return 'Who is eligible? What are the requirements?';
        case 'applyLink': return 'https://...';
        default: return '';
      }
    }
  };

  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      const parsed = new URL(url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`);
      return Boolean(parsed.hostname);
    } catch {
      return false;
    }
  };

  const handlePublish = async () => {
    const isScholarshipOrComp = form.type === 'Scholarship' || form.type === 'Competition';

    if (!form.title.trim()) {
      showToast(`Missing required field: ${getLabel('title')}`, 'error');
      return;
    }
    if (!form.organization.trim()) {
      showToast(`Missing required field: ${getLabel('organization')}`, 'error');
      return;
    }
    if (!form.description.trim()) {
      showToast(`Missing required field: ${getLabel('description')}`, 'error');
      return;
    }
    if (!form.eligibility.trim()) {
      showToast(`Missing required field: ${getLabel('eligibility')}`, 'error');
      return;
    }
    if (!form.deadline) {
      showToast(`Missing required field: ${getLabel('deadline')}`, 'error');
      return;
    }
    if (isNaN(new Date(form.deadline).getTime())) {
      showToast('Invalid date format for deadline', 'error');
      return;
    }

    if (isScholarshipOrComp) {
      if (!form.applyLink || !form.applyLink.trim()) {
        showToast(`Missing required field: ${getLabel('applyLink')}`, 'error');
        return;
      }
    }

    if (form.applyLink && form.applyLink.trim() && !isValidUrl(form.applyLink)) {
      showToast('Please enter a valid URL (e.g. https://example.com)', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/admin/opportunities`, form);
      showToast('Opportunity published successfully');
      setTimeout(() => navigate('/admin/opportunities'), 1200);
    } catch (err) {
      console.error('Create failed:', err);
      showToast(err.response?.data?.message || 'Failed to create opportunity', 'error');
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    const isScholarshipOrComp = form.type === 'Scholarship' || form.type === 'Competition';
    if (!form.title.trim() || !form.organization.trim() || !form.description.trim() || !form.eligibility.trim() || !form.deadline) {
      return false;
    }
    if (isScholarshipOrComp && !form.applyLink.trim()) {
      return false;
    }
    return true;
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all";
  const labelClass = "block text-[13px] font-semibold mb-1.5";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="flex-1 overflow-y-auto"
      style={{ background: '#F8FAFC' }}
    >
      {/* Hero */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl mx-8 mt-8 p-[1px]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.07]" />
        <div
          className="relative rounded-[calc(1rem-1px)] overflow-hidden"
          style={{
            background: 'linear-gradient(170deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.25) 45%, rgba(139,92,246,0.35) 50%, rgba(59,130,246,0.25) 55%, transparent 75%)',
                backgroundSize: '300% 100%',
                animation: 'shimmerSweep 12s ease-in-out infinite 2s',
              }}
            />
          </div>
          <HeroParticles />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

          <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12">
            <button
              onClick={() => navigate('/admin/opportunities')}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Opportunities
            </button>
            <h1 className="text-[32px] sm:text-[38px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">
              Create Opportunity
            </h1>
            <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-2">
              Publish jobs, scholarships, and competitions for the FrontX community.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <div className="max-w-[900px] mx-auto px-8 py-8">
        <motion.div variants={fadeUp} custom={1}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-8 sm:p-10 space-y-6">
              {/* Type */}
              <div>
                <label className="label-class text-slate-700" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Opportunity Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={inputClass}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-slate-700" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  {getLabel('title')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={getPlaceholder('title')}
                  className={inputClass}
                />
              </div>

              {/* Organization */}
              <div>
                <label className="text-slate-700" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  {getLabel('organization')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder={getPlaceholder('organization')}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-700" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  {getLabel('description')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={form.type === 'Scholarship' || form.type === 'Competition' ? 4 : 5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={getPlaceholder('description')}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Eligibility */}
              <div>
                <label className="text-slate-700" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  {getLabel('eligibility')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.eligibility}
                  onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                  placeholder={getPlaceholder('eligibility')}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Deadline + Apply Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-700" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                    {getLabel('deadline')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-slate-700" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                    {getLabel('applyLink')} {(form.type === 'Scholarship' || form.type === 'Competition') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="url"
                    value={form.applyLink}
                    onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
                    placeholder={getPlaceholder('applyLink')}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Attachment - Optional only for Jobs */}
              {form.type !== 'Scholarship' && form.type !== 'Competition' && (
                <div>
                  <label className="text-slate-700" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Attachment (Optional PDF/Image URL)</label>
                  <input
                    type="text"
                    value={form.attachment}
                    onChange={(e) => setForm({ ...form, attachment: e.target.value })}
                    placeholder="https://... (PDF or image link)"
                    className={inputClass}
                  />
                </div>
              )}

            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Actions */}
            <div className="px-8 sm:px-10 py-5 flex items-center justify-between">
              <button
                onClick={() => navigate('/admin/opportunities')}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={submitting || !isFormValid()}
                className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</>
                ) : (
                  <><Briefcase className="w-4 h-4" /> Publish Opportunity</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <style>{`
        @keyframes shimmerSweep {
          0%, 100% { background-position: -250% 0; }
          50% { background-position: 250% 0; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; }
          25% { transform: translateY(-14px) translateX(5px) scale(1.4); opacity: 0.65; }
          50% { transform: translateY(-7px) translateX(-4px) scale(0.85); opacity: 0.4; }
          75% { transform: translateY(-18px) translateX(7px) scale(1.15); opacity: 0.75; }
        }
      `}</style>
    </motion.div>
  );
};

export default AdminOpportunityCreate;
