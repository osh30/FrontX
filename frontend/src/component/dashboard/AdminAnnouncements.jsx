import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Trash2, Eye, Edit3, Plus, Megaphone, Filter,
  ChevronLeft, ChevronRight, RefreshCw, AlertTriangle,
  Calendar, Clock, Pin, PinOff, CheckCircle2, XCircle,
  ExternalLink, Download,
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const CATEGORIES = ['All', 'Academic', 'Career', 'Internship', 'Scholarship', 'Competition', 'Event', 'Maintenance', 'General Notice'];
const PRIORITIES = ['All', 'Normal', 'Important', 'Urgent'];
const STATUS_OPTIONS = ['All', 'Active', 'Scheduled', 'Expired', 'Pinned'];

const CATEGORY_COLORS = {
  'Academic': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/15' },
  'Career': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/15' },
  'Internship': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/15' },
  'Scholarship': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/15' },
  'Competition': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/15' },
  'Event': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/15' },
  'Maintenance': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/15' },
  'General Notice': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/15' },
};

const PRIORITY_COLORS = {
  'Normal': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/15' },
  'Important': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/15' },
  'Urgent': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/15' },
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
    ].map((p, i) => (
      <div key={i} className="absolute rounded-full bg-white/[0.25]"
        style={{ left: p.left, top: p.top, width: p.size, height: p.size, animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite` }} />
    ))}
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
      className="fixed top-6 left-1/2 z-[60] px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5"
      style={{
        background: type === 'success' ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))' : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1))',
        borderColor: type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
        backdropFilter: 'blur(20px)',
      }}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
      <span className="text-sm font-medium text-white">{message}</span>
    </motion.div>
  );
};

const AdminAnnouncements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (priorityFilter !== 'All') params.append('priority', priorityFilter);
      if (statusFilter !== 'All') {
        if (statusFilter === 'Pinned') params.append('pinned', 'true');
        else params.append('status', statusFilter);
      }
      const res = await axios.get(`${API_URL}/admin/announcements?${params}`);
      setAnnouncements(res.data.announcements);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, priorityFilter, statusFilter]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/admin/announcements/${deleteModal._id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== deleteModal._id));
      setTotal(prev => prev - 1);
      setDeleteModal(null);
      showToast('Announcement deleted permanently');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete announcement', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/admin/announcements/${id}/pin`);
      setAnnouncements(prev => prev.map(a => a._id === id ? res.data : a));
      showToast(res.data.isPinned ? 'Announcement pinned' : 'Announcement unpinned');
    } catch (err) {
      console.error('Pin failed:', err);
      showToast('Failed to toggle pin', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatus = (a) => {
    const now = new Date();
    if (a.publishDate && new Date(a.publishDate) > now) return 'Scheduled';
    if (a.expiryDate && new Date(a.expiryDate) <= now) return 'Expired';
    return 'Active';
  };

  const STATUS_BADGE = {
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
    'Scheduled': 'bg-blue-500/10 text-blue-400 border-blue-500/15',
    'Expired': 'bg-red-500/10 text-red-400 border-red-500/15',
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="flex-1 overflow-y-auto">
      {/* Hero */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl mx-8 mt-8 p-[1px]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.07]" />
        <div className="relative rounded-[calc(1rem-1px)] overflow-hidden"
          style={{ background: 'linear-gradient(170deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.25) 45%, rgba(139,92,246,0.35) 50%, rgba(59,130,246,0.25) 55%, transparent 75%)', backgroundSize: '300% 100%', animation: 'shimmerSweep 12s ease-in-out infinite 2s' }} />
          </div>
          <HeroParticles />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" /></span>
                <span className="text-[11px] font-semibold text-emerald-400">Live</span>
              </div>
              <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">Announcements</h1>
              <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-1">Create and manage official announcements for the entire FrontX platform.</p>
            </div>
            <div className="shrink-0">
              <button onClick={() => navigate('/admin/announcements/create')}
                className="group relative px-6 py-3.5 rounded-xl font-semibold text-[15px] text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                <span className="relative z-10 flex items-center gap-2.5"><Plus className="w-4 h-4" /> Create Announcement</span>
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
            <input type="text" placeholder="Search by title..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all" />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer shadow-sm transition-all">
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer shadow-sm transition-all">
              {PRIORITIES.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>)}
            </select>
          </div>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer shadow-sm transition-all">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="flex items-center justify-between">
          <p className="text-[15px] font-medium" style={{ color: '#475569' }}>
            <span className="font-bold" style={{ color: '#1E293B' }}>{total}</span> announcements found
          </p>
          <button onClick={fetchAnnouncements} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" /></div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No announcements found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {announcements.map((a, i) => {
              const status = getStatus(a);
              const cc = CATEGORY_COLORS[a.category] || CATEGORY_COLORS['General Notice'];
              const pc = PRIORITY_COLORS[a.priority] || PRIORITY_COLORS['Normal'];
              return (
                <motion.div key={a._id} variants={fadeUp} custom={i} className="relative overflow-hidden rounded-2xl p-[1px] group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07] group-hover:from-white/[0.12] group-hover:via-white/[0.06] group-hover:to-white/[0.1] transition-all duration-300" />
                  <div className="relative rounded-[calc(1rem-1px)] p-5 h-full flex flex-col"
                    style={{ background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)' }}>
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(1rem-1px)]">
                      <div className="absolute inset-0 opacity-[0.02]" style={{ background: 'linear-gradient(115deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)', backgroundSize: '250% 100%', animation: 'shimmerSweep 8s ease-in-out infinite' }} />
                    </div>
                    <div className="relative z-10 flex flex-col flex-1">
                      {/* Top row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg tracking-wider border ${cc.bg} ${cc.text} ${cc.border}`}>{a.category}</span>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg tracking-wider border ${pc.bg} ${pc.text} ${pc.border}`}>{a.priority}</span>
                          {a.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${STATUS_BADGE[status]}`}>{status}</span>
                      </div>

                      <h3 className="text-[15px] font-bold text-white leading-snug line-clamp-2 mb-2">{a.title}</h3>
                      <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">{a.description}</p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(a.publishDate)}</span>
                        {a.expiryDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Exp: {formatDate(a.expiryDate)}</span>}
                        {a.attachment && <span className="flex items-center gap-1 text-blue-400"><Download className="w-3 h-3" /> Attachment</span>}
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] text-slate-600">{a.postedBy?.name || 'Admin'}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewModal(a)} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/[0.08] rounded-lg transition-all" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => navigate(`/admin/announcements/edit/${a._id}`)} className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/[0.08] rounded-lg transition-all" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleTogglePin(a._id)} className={`p-2 rounded-lg transition-all ${a.isPinned ? 'text-amber-400 hover:bg-amber-500/[0.08]' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/[0.08]'}`} title={a.isPinned ? 'Unpin' : 'Pin'}>
                            {a.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setDeleteModal(a)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm text-slate-500">Page <span className="font-bold text-slate-800">{page}</span> of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"><ChevronRight className="w-4 h-4" /></button>
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
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg tracking-wider border ${CATEGORY_COLORS[viewModal.category]?.bg} ${CATEGORY_COLORS[viewModal.category]?.text} ${CATEGORY_COLORS[viewModal.category]?.border}`}>{viewModal.category}</span>
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg tracking-wider border ${PRIORITY_COLORS[viewModal.priority]?.bg} ${PRIORITY_COLORS[viewModal.priority]?.text} ${PRIORITY_COLORS[viewModal.priority]?.border}`}>{viewModal.priority}</span>
                    {viewModal.isPinned && <Pin className="w-4 h-4 text-amber-400" />}
                  </div>
                  <button onClick={() => setViewModal(null)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"><XCircle className="w-4 h-4" /></button>
                </div>
                <h2 className="text-xl font-bold text-white mb-3">{viewModal.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-4">{viewModal.description}</p>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Published: {formatDate(viewModal.publishDate)}</span>
                  {viewModal.expiryDate && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Expires: {formatDate(viewModal.expiryDate)}</span>}
                </div>
                {viewModal.attachment && (
                  <a href={viewModal.attachment} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}>
                    <Download className="w-4 h-4" /> Download Attachment
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl p-[1px] overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/30 via-red-400/10 to-red-500/20" />
              <div className="relative rounded-[calc(1rem-1px)] p-6 bg-slate-900 border border-red-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Announcement?</h3>
                    <p className="text-xs text-slate-400">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-5">This announcement will be permanently deleted from FrontX.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(null)} disabled={deleting} className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all disabled:opacity-50">Cancel</button>
                  <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete Forever</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

      <style>{`
        @keyframes shimmerSweep { 0%, 100% { background-position: -250% 0; } 50% { background-position: 250% 0; } }
        @keyframes particleFloat { 0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; } 25% { transform: translateY(-14px) translateX(5px) scale(1.4); opacity: 0.65; } 50% { transform: translateY(-7px) translateX(-4px) scale(0.85); opacity: 0.4; } 75% { transform: translateY(-18px) translateX(7px) scale(1.15); opacity: 0.75; } }
      `}</style>
    </motion.div>
  );
};

export default AdminAnnouncements;
