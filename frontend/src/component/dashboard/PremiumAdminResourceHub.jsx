import { API_BASE } from '../../config/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { BookOpen, Search, X, Loader2, FileText, Download, Calendar, Filter, Plus } from 'lucide-react';

const API = API_BASE;

const CATEGORIES = ['All', 'Resume Guide', 'Interview Preparation', 'Career Development', 'Programming', 'Research', 'Academic Notes', 'Study Material', 'Soft Skills', 'Portfolio Guide', 'Other'];

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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const HeroParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[
      { left: '10%', top: '20%', size: 3, delay: 0, dur: 8 },
      { left: '80%', top: '25%', size: 2, delay: 1.2, dur: 9 },
      { left: '25%', top: '70%', size: 2.5, delay: 0.6, dur: 7 },
      { left: '70%', top: '75%', size: 2, delay: 2, dur: 8.5 },
      { left: '50%', top: '10%', size: 1.5, delay: 2.5, dur: 10 },
    ].map((p, i) => (
      <div key={i} className="absolute rounded-full bg-white/[0.25]" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite` }} />
    ))}
  </div>
);

export default function PremiumAdminResourceHub({ fullPage = false, onCreateResource }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const debounceRef = useRef(null);

  const fetchResources = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      const res = await axios.get(`${API}/admin-resources/public?${params.toString()}`);
      setResources(res.data.resources || []);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchResources, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchResources]);

  const handleViewPdf = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (res) => {
    try {
      const { data } = await axios.get(`${API}/admin-resources/${res._id}/download`);
      setResources(prev => prev.map(r => r._id === res._id ? { ...r, downloadsCount: data.downloadsCount } : r));
      window.open(data.downloadUrl || data.pdfUrl, '_blank');
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="flex-1 overflow-y-auto">
      {/* Hero Banner */}
      {fullPage && (
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl mb-8 p-[1px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.07]" />
          <div className="relative rounded-[calc(1rem-1px)] overflow-hidden" style={{ background: 'linear-gradient(170deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)' }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.25) 45%, rgba(139,92,246,0.35) 50%, rgba(59,130,246,0.25) 55%, transparent 75%)', backgroundSize: '300% 100%', animation: 'shimmerSweep 12s ease-in-out infinite 2s' }} />
            </div>
            <HeroParticles />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              <div className="flex-1 space-y-4">
                <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">Resource<br />Hub</h1>
                <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-1">Access curated educational resources, guides, and study materials uploaded by the admin.</p>
              </div>
              {onCreateResource && (
                <button onClick={onCreateResource}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(56,189,248,0.4)] shrink-0"
                  style={{ background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)' }}>
                  <Plus className="w-4.5 h-4.5" /> Create Resource
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Search + Filter + Create */}
      <motion.div variants={fadeUp} custom={1} className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.slice(0, 6).map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${categoryFilter === cat ? 'bg-[#0f172a] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No resources available at the moment.</p>
          <p className="text-xs text-slate-400 mt-1">Check back later for new resources.</p>
        </div>
      ) : (
        <motion.div variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {resources.map((res, i) => (
            <ResourceCard key={res._id} resource={res} index={i} onViewPdf={handleViewPdf} onDownload={handleDownload} formatDate={formatDate} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function ResourceCard({ resource: res, index, onViewPdf, onDownload, formatDate }) {
  const cat = CATEGORY_COLORS[res.category] || CATEGORY_COLORS['Other'];

  return (
    <motion.div variants={fadeUp} custom={index} className="relative overflow-hidden rounded-[18px] p-[1px] group">
      <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07] group-hover:from-white/[0.14] group-hover:via-white/[0.07] group-hover:to-white/[0.12] transition-all duration-500" />
      <div className="relative rounded-[calc(18px-1px)] p-5 h-full flex flex-col" style={{ background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)' }}>
        {/* Shimmer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(18px-1px)]">
          <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'linear-gradient(115deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)', backgroundSize: '250% 100%', animation: 'shimmerSweep 8s ease-in-out infinite' }} />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
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

          {/* Date */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(res.createdAt)}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onViewPdf(res.pdfUrl)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #06B6D4 100%)' }}>
              View PDF
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onDownload(res)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-white/[0.06] text-slate-300 border border-white/[0.08] hover:bg-white/[0.1] transition-all">
              <Download className="w-3.5 h-3.5" /> Download
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
