import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Megaphone, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const CATEGORIES = ['Academic', 'Career', 'Internship', 'Scholarship', 'Competition', 'Event', 'Maintenance', 'General Notice'];
const PRIORITIES = ['Normal', 'Important', 'Urgent'];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const HeroParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[{ left: '10%', top: '20%', size: 3, delay: 0, dur: 8 }, { left: '80%', top: '25%', size: 2, delay: 1.2, dur: 9 }, { left: '25%', top: '70%', size: 2.5, delay: 0.6, dur: 7 }, { left: '70%', top: '75%', size: 2, delay: 2, dur: 8.5 }, { left: '50%', top: '10%', size: 1.5, delay: 2.5, dur: 10 }, { left: '15%', top: '50%', size: 2, delay: 0.8, dur: 7.5 }].map((p, i) => (
      <div key={i} className="absolute rounded-full bg-white/[0.25]" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite` }} />
    ))}
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
      className="fixed top-6 left-1/2 z-[60] px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5"
      style={{ background: type === 'success' ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))' : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1))', borderColor: type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)', backdropFilter: 'blur(20px)' }}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
      <span className="text-sm font-medium text-white">{message}</span>
    </motion.div>
  );
};

const AdminAnnouncementCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: 'Academic', priority: 'Normal', description: '',
    publishDate: new Date().toISOString().slice(0, 16),
    expiryDate: '', attachment: '', isPinned: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.expiryDate) payload.expiryDate = null;
      await axios.post(`${API_URL}/admin/announcements`, payload);
      showToast('Announcement published successfully');
      setTimeout(() => navigate('/admin/announcements'), 1200);
    } catch (err) {
      console.error('Create failed:', err);
      showToast('Failed to publish announcement', 'error');
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all";

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="flex-1 overflow-y-auto" style={{ background: '#F8FAFC' }}>
      {/* Hero */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl mx-8 mt-8 p-[1px]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.07]" />
        <div className="relative rounded-[calc(1rem-1px)] overflow-hidden" style={{ background: 'linear-gradient(170deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.25) 45%, rgba(139,92,246,0.35) 50%, rgba(59,130,246,0.25) 55%, transparent 75%)', backgroundSize: '300% 100%', animation: 'shimmerSweep 12s ease-in-out infinite 2s' }} />
          </div>
          <HeroParticles />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12">
            <button onClick={() => navigate('/admin/announcements')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Announcements
            </button>
            <h1 className="text-[32px] sm:text-[38px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">Create Announcement</h1>
            <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-2">Create and manage official announcements for the entire FrontX platform.</p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <div className="max-w-[900px] mx-auto px-8 py-8">
        <motion.div variants={fadeUp} custom={1}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-8 sm:p-10 space-y-6">
              {/* Title */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#334155' }}>Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Announcement title" className={inputClass} />
              </div>

              {/* Category + Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#334155' }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#334155' }}>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#334155' }}>Description</label>
                <textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Write the full announcement details..." className={`${inputClass} resize-none`} />
              </div>

              {/* Publish Date + Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#334155' }}>Publish Date & Time</label>
                  <input type="datetime-local" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#334155' }}>Expiry Date & Time (Optional)</label>
                  <input type="datetime-local" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Attachment */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#334155' }}>Attachment (Optional PDF/Image URL)</label>
                <input type="text" value={form.attachment} onChange={(e) => setForm({ ...form, attachment: e.target.value })}
                  placeholder="https://... (PDF or image link)" className={inputClass} />
              </div>

              {/* Pin Toggle */}
              <div className="flex items-center justify-between py-4 px-5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Pin Announcement</p>
                    <p className="text-[12px] text-slate-500">Pinned announcements always appear first</p>
                  </div>
                </div>
                <button type="button" onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.isPinned ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${form.isPinned ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100" />
            <div className="px-8 sm:px-10 py-5 flex items-center justify-between">
              <button onClick={() => navigate('/admin/announcements')} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
              <button onClick={handlePublish} disabled={submitting || !form.title || !form.description}
                className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}>
                {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</> : <><Megaphone className="w-4 h-4" /> Publish Announcement</>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
      <style>{`@keyframes shimmerSweep { 0%, 100% { background-position: -250% 0; } 50% { background-position: 250% 0; } } @keyframes particleFloat { 0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; } 25% { transform: translateY(-14px) translateX(5px) scale(1.4); opacity: 0.65; } 50% { transform: translateY(-7px) translateX(-4px) scale(0.85); opacity: 0.4; } 75% { transform: translateY(-18px) translateX(7px) scale(1.15); opacity: 0.75; } }`}</style>
    </motion.div>
  );
};

export default AdminAnnouncementCreate;
