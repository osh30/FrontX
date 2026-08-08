import { API_BASE } from '../../config/api';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BookOpen, Plus, Search, X, Loader2, Trash2, Edit3, FileText, Download, Calendar, Tag, ExternalLink } from 'lucide-react';

const API_URL = API_BASE;

const CATEGORIES = ['All', 'Resume Guide', 'Interview Preparation', 'Career Development', 'Programming', 'Research', 'Academic Notes', 'Study Material', 'Soft Skills', 'Portfolio Guide', 'Other'];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const CATEGORY_COLORS = {
  'Resume Guide': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'Interview Preparation': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'Career Development': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'Programming': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'Research': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'Academic Notes': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  'Study Material': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  'Soft Skills': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  'Portfolio Guide': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  'Other': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export default function AdminResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 50 });
      if (search) params.append('search', search);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      const res = await axios.get(`${API_URL}/admin-resources?${params}`);
      setResources(res.data.resources || []);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleViewPdf = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (res) => {
    try {
      const { data } = await axios.get(`${API_URL}/admin-resources/${res._id}/download`);
      setResources(prev => prev.map(r => r._id === res._id ? { ...r, downloadsCount: data.downloadsCount } : r));
      window.open(data.downloadUrl || data.pdfUrl, '_blank');
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/admin-resources/${deleteModal._id}`);
      setResources(prev => prev.filter(r => r._id !== deleteModal._id));
      setDeleteModal(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="flex-1 overflow-y-auto">
      {/* Hero Banner */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl mx-8 mt-8 p-[1px]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.07]" />
        <div className="relative rounded-[calc(1rem-1px)] overflow-hidden" style={{ background: 'linear-gradient(170deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.25) 45%, rgba(139,92,246,0.35) 50%, rgba(59,130,246,0.25) 55%, transparent 75%)', backgroundSize: '300% 100%', animation: 'shimmerSweep 12s ease-in-out infinite 2s' }} />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">Resource<br />Management</h1>
              <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-1">Upload, manage, and share educational resources with students and alumni.</p>
            </div>
            <div className="shrink-0">
              <button onClick={() => navigate('/admin/resources/create')} className="group relative px-6 py-3.5 rounded-xl font-semibold text-[15px] text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                <span className="relative z-10 flex items-center gap-2.5"><Plus className="w-4.5 h-4.5" /> Create Resource</span>
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
            <input type="text" placeholder="Search by title or description..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="relative">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all appearance-none pr-10">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No resources found.</p>
          </div>
        ) : (
          <motion.div variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {resources.map((res, i) => (
              <ResourceCard key={res._id} resource={res} index={i} onEdit={() => navigate(`/admin/resources/edit/${res._id}`)} onDelete={() => setDeleteModal(res)} onViewPdf={handleViewPdf} onDownload={handleDownload} formatDate={formatDate} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Resource?</h3>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone. <strong>{deleteModal.title}</strong> will be permanently removed.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteModal(null)} disabled={deleting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResourceCard({ resource: res, index, onEdit, onDelete, onViewPdf, onDownload, formatDate }) {
  const cat = CATEGORY_COLORS[res.category] || CATEGORY_COLORS['Other'];

  return (
    <motion.div variants={fadeUp} custom={index} className="relative overflow-hidden rounded-[18px] p-[1px] group">
      <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07] group-hover:from-white/[0.14] group-hover:via-white/[0.07] group-hover:to-white/[0.12] transition-all duration-500" />
      <div className="relative rounded-[calc(18px-1px)] p-5 h-full flex flex-col" style={{ background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)' }}>
        {/* Cover Image */}
        {res.coverImage ? (
          <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-white/5">
            <img src={res.coverImage} alt={res.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-36 rounded-xl mb-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/[0.06] flex items-center justify-center">
            <FileText className="w-10 h-10 text-blue-400/40" />
          </div>
        )}

        {/* Category Badge */}
        <div className="mb-3">
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg tracking-wider border ${cat.bg} ${cat.text} ${cat.border}`}>
            {res.category}
          </span>
        </div>

        {/* Title + Role Badge */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-white font-bold text-[15px] leading-snug line-clamp-2 flex-1">{res.title}</h3>
          <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${res.uploadedByRole === 'alumni' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
            {res.uploadedByRole === 'alumni' ? 'Alumni' : 'Admin'}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 mb-3 flex-1">{res.shortDescription}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(res.createdAt)}</span>
          <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {res.downloadsCount || 0}</span>
        </div>

        {/* Tags */}
        {res.tags && res.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {res.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 border border-white/[0.06]">{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
          <button onClick={() => onViewPdf(res.pdfUrl)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:shadow-[0_0_16px_rgba(99,102,241,0.25)]"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #06B6D4 100%)' }}>
            <ExternalLink className="w-3 h-3" /> View PDF
          </button>
          <button onClick={() => onDownload(res)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-white/[0.06] text-slate-300 border border-white/[0.08] hover:bg-white/[0.1] transition-all">
            <Download className="w-3 h-3" /> Download
          </button>
          <div className="w-px h-6 bg-white/[0.06]" />
          <button onClick={onEdit} className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/[0.08] rounded-lg transition-all" title="Edit">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/[0.12] rounded-lg transition-all" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
