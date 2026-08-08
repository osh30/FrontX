import { API_BASE } from '../../config/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Trash2, Edit3, Plus, Briefcase, Filter,
  ChevronLeft, ChevronRight, RefreshCw, AlertTriangle,
  Calendar, Building2, ExternalLink, Star, Clock,
  FileText, X, Upload, CheckCircle2, XCircle,
} from 'lucide-react';

const API_URL = API_BASE;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const TYPES = ['All', 'Government Job', 'Private Job', 'Scholarship', 'Competition'];
const STATUS_OPTIONS = ['All', 'Active', 'Expired'];

const TYPE_COLORS = {
  'Government Job': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/15', dot: 'bg-blue-400' },
  'Private Job': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/15', dot: 'bg-purple-400' },
  'Scholarship': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/15', dot: 'bg-emerald-400' },
  'Competition': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/15', dot: 'bg-amber-400' },
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
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
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
        ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
        : <XCircle className="w-4.5 h-4.5 text-red-400" />}
      <span className="text-sm font-medium text-white">{message}</span>
    </motion.div>
  );
};

const AdminOpportunities = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    type: 'Government Job', title: '', organization: '', description: '',
    eligibility: '', deadline: '', applyLink: '', attachment: '', featured: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewModal, setViewModal] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (typeFilter !== 'All') params.append('type', typeFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      const res = await axios.get(`${API_URL}/admin/opportunities?${params}`);
      setOpportunities(res.data.opportunities);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const res = await axios.put(`${API_URL}/admin/opportunities/${editing._id}`, form);
      setOpportunities(prev => prev.map(o => o._id === editing._id ? res.data : o));
      setEditing(null);
      setForm({ type: 'Government Job', title: '', organization: '', description: '', eligibility: '', deadline: '', applyLink: '', attachment: '', featured: false });
      showToast('Opportunity updated successfully');
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Failed to update opportunity', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/admin/opportunities/${deleteModal._id}`);
      setOpportunities(prev => prev.filter(o => o._id !== deleteModal._id));
      setTotal(prev => prev - 1);
      setDeleteModal(null);
      showToast('Opportunity deleted permanently');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete opportunity', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (opp) => {
    setEditing(opp);
    setForm({
      type: opp.type,
      title: opp.title,
      organization: opp.organization,
      description: opp.description,
      eligibility: opp.eligibility?.experienceRequired || (typeof opp.eligibility === 'string' ? opp.eligibility : ''),
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : '',
      applyLink: opp.applyLink || '',
      attachment: opp.attachment || '',
      featured: opp.featured || false,
    });
  };

  const closeModals = () => {
    setEditing(null);
    setForm({ type: 'Government Job', title: '', organization: '', description: '', eligibility: '', deadline: '', applyLink: '', attachment: '', featured: false });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isExpired = (deadline) => deadline && new Date(deadline) < new Date();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="flex-1 overflow-y-auto"
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

          <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">
                Opportunity<br />Management
              </h1>
              <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-1">
                Create, manage, and publish jobs, scholarships, and competitions for the FrontX community.
              </p>
            </div>
            <div className="shrink-0">
              <button
                onClick={() => navigate('/admin/opportunities/create')}
                className="group relative px-6 py-3.5 rounded-xl font-semibold text-[15px] text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <Plus className="w-4.5 h-4.5" />
                  Create Opportunity
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
        {/* Filters */}
        <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or organization..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer shadow-sm transition-all"
            >
              {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
          </div>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer shadow-sm transition-all"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div variants={fadeUp} custom={2} className="flex items-center justify-between">
          <p className="text-[15px] font-medium" style={{ color: '#475569' }}>
            <span className="font-bold" style={{ color: '#1E293B' }}>{total}</span> opportunities found
          </p>
          <button onClick={fetchOpportunities} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No opportunities found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {opportunities.map((opp, i) => {
              const tc = TYPE_COLORS[opp.type] || TYPE_COLORS['Government Job'];
              const expired = isExpired(opp.deadline);
              return (
                <motion.div
                  key={opp._id}
                  variants={fadeUp}
                  custom={i}
                  className="relative overflow-hidden rounded-2xl p-[1px] group"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07] group-hover:from-white/[0.12] group-hover:via-white/[0.06] group-hover:to-white/[0.1] transition-all duration-300" />
                  <div
                    className="relative rounded-[calc(1rem-1px)] p-5 h-full flex flex-col"
                    style={{
                      background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)',
                    }}
                  >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(1rem-1px)]">
                      <div className="absolute inset-0 opacity-[0.02]"
                        style={{
                          background: 'linear-gradient(115deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
                          backgroundSize: '250% 100%',
                          animation: 'shimmerSweep 8s ease-in-out infinite',
                        }} />
                    </div>

                    <div className="relative z-10 flex flex-col flex-1">
                      {/* Top row: type badge + featured + status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg tracking-wider border ${tc.bg} ${tc.text} ${tc.border}`}>
                            {opp.type}
                          </span>
                          {opp.featured && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/15 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          expired
                            ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                        }`}>
                          {expired ? 'Expired' : 'Active'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[15px] font-bold text-white leading-snug line-clamp-2 mb-1.5">{opp.title}</h3>

                      {/* Organization */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[13px] text-slate-400 font-medium truncate">{opp.organization}</span>
                      </div>

                      {/* Description */}
                      <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">{opp.description}</p>

                      {/* Deadline */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[11px] text-slate-500">
                          Deadline: <span className={`font-semibold ${expired ? 'text-red-400' : 'text-slate-300'}`}>{formatDate(opp.deadline)}</span>
                        </span>
                      </div>

                      {/* Divider + Actions */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] text-slate-600">{formatDate(opp.createdAt)}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(opp)}
                            className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/[0.08] rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(opp)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-500">Page <span className="font-bold text-slate-800">{page}</span> of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl p-[1px] overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-400/5 to-indigo-500/15" />
              <div className="relative rounded-[calc(1rem-1px)] p-6 bg-slate-900 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TYPE_COLORS[viewModal.type]?.bg || 'bg-blue-500/10'}`}>
                      <Briefcase className={`w-4 h-4 ${TYPE_COLORS[viewModal.type]?.text || 'text-blue-400'}`} />
                    </div>
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg tracking-wider border ${TYPE_COLORS[viewModal.type]?.bg} ${TYPE_COLORS[viewModal.type]?.text} ${TYPE_COLORS[viewModal.type]?.border}`}>
                      {viewModal.type}
                    </span>
                    {viewModal.featured && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/15 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <button onClick={() => setViewModal(null)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-white mb-1">{viewModal.title}</h2>
                <div className="flex items-center gap-1.5 mb-4">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm text-slate-400">{viewModal.organization}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</p>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{viewModal.description}</p>
                  </div>
                  {viewModal.eligibility && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Eligibility</p>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{viewModal.eligibility}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deadline</p>
                      <p className="text-sm text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(viewModal.deadline)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                        isExpired(viewModal.deadline) ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {isExpired(viewModal.deadline) ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  </div>
                  {viewModal.applyLink && (
                    <a
                      href={viewModal.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
                    >
                      <ExternalLink className="w-4 h-4" /> Apply Now
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-[1px]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-400/5 to-indigo-500/15" />
              <div className="relative rounded-[calc(1rem-1px)] p-6 bg-slate-900 border border-white/[0.06]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Edit Opportunity</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Update the opportunity details below.</p>
                  </div>
                  <button onClick={closeModals} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Opportunity Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                    >
                      {TYPES.slice(1).map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Opportunity Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Software Engineer Position"
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                    />
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Organization / Company</label>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={(e) => setForm({ ...form, organization: e.target.value })}
                      placeholder="e.g. Google, Ministry of Education"
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the opportunity in detail..."
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all resize-none"
                    />
                  </div>

                  {/* Eligibility */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Eligibility / Requirements</label>
                    <textarea
                      rows={3}
                      value={form.eligibility}
                      onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                      placeholder="Who is eligible? What are the requirements?"
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all resize-none"
                    />
                  </div>

                  {/* Deadline + Apply Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Application Deadline</label>
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Apply Link (URL)</label>
                      <input
                        type="url"
                        value={form.applyLink}
                        onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Attachment */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Attachment (Optional PDF/Image URL)</label>
                    <input
                      type="text"
                      value={form.attachment}
                      onChange={(e) => setForm({ ...form, attachment: e.target.value })}
                      placeholder="https://... (PDF or image link)"
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                    />
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center justify-between py-3 px-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Featured Opportunity</p>
                        <p className="text-[11px] text-slate-500">Highlight this opportunity on the platform</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, featured: !form.featured })}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.featured ? 'bg-blue-500' : 'bg-white/[0.08]'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${form.featured ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button onClick={closeModals} disabled={submitting}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all disabled:opacity-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={submitting || !form.title || !form.organization || !form.description || !form.deadline}
                    className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <>Update Opportunity</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl p-[1px] overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/30 via-red-400/10 to-red-500/20" />
              <div className="relative rounded-[calc(1rem-1px)] p-6 bg-slate-900 border border-red-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Opportunity?</h3>
                    <p className="text-xs text-slate-400">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-5">
                  <span className="font-semibold text-white">{deleteModal.title}</span> will be permanently removed from FrontX. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(null)} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete Forever</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default AdminOpportunities;
