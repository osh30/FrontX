import { API_BASE } from '../../config/api';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Megaphone, Pin, Calendar, Clock, Download, Shield, CheckCircle2,
} from 'lucide-react';

const API_URL = API_BASE;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const CATEGORY_COLORS = {
  'Academic': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'bg-blue-100' },
  'Career': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'bg-purple-100' },
  'Internship': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'bg-indigo-100' },
  'Scholarship': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-100' },
  'Competition': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'bg-amber-100' },
  'Event': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: 'bg-pink-100' },
  'Maintenance': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'bg-red-100' },
  'General Notice': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'bg-slate-100' },
};

const PRIORITY_COLORS = {
  'Normal': { bg: 'bg-slate-100', text: 'text-slate-600' },
  'Important': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Urgent': { bg: 'bg-red-100', text: 'text-red-700' },
};

const HeroParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[{ left: '10%', top: '20%', size: 3, delay: 0, dur: 8 }, { left: '80%', top: '25%', size: 2, delay: 1.2, dur: 9 }, { left: '25%', top: '70%', size: 2.5, delay: 0.6, dur: 7 }, { left: '70%', top: '75%', size: 2, delay: 2, dur: 8.5 }, { left: '50%', top: '10%', size: 1.5, delay: 2.5, dur: 10 }].map((p, i) => (
      <div key={i} className="absolute rounded-full bg-white/[0.25]" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite` }} />
    ))}
  </div>
);

const AnnouncementsView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_URL}/platform-announcements`);
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
            <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">Announcements</h1>
            <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-2">Stay updated with the latest from FrontX.</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1000px] mx-auto px-8 py-8 space-y-5">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" /></div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No announcements yet</p>
            <p className="text-sm text-slate-400 mt-1">Check back later for updates.</p>
          </div>
        ) : (
          announcements.map((a, i) => {
            const cc = CATEGORY_COLORS[a.category] || CATEGORY_COLORS['General Notice'];
            const pc = PRIORITY_COLORS[a.priority] || PRIORITY_COLORS['Normal'];
            return (
              <motion.div key={a._id} variants={fadeUp} custom={i}
                className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300">
                <div className="p-6 sm:p-7">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg ${cc.bg} ${cc.text} border ${cc.border}`}>{a.category}</span>
                      <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg ${pc.bg} ${pc.text}`}>{a.priority}</span>
                      {a.isPinned && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-[18px] font-bold text-slate-800 mb-2">{a.title}</h2>
                  <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">{a.description}</p>

                  {a.attachment && (
                    <a href={a.attachment} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mb-4 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}>
                      <Download className="w-4 h-4" /> Download Attachment
                    </a>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-[12px] text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(a.publishDate)}</span>
                      {a.expiryDate && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Expires: {formatDate(a.expiryDate)}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Posted by <span className="font-semibold text-slate-700">{a.postedBy?.name || 'Admin'}</span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <style>{`@keyframes shimmerSweep { 0%, 100% { background-position: -250% 0; } 50% { background-position: 250% 0; } } @keyframes particleFloat { 0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; } 25% { transform: translateY(-14px) translateX(5px) scale(1.4); opacity: 0.65; } 50% { transform: translateY(-7px) translateX(-4px) scale(0.85); opacity: 0.4; } 75% { transform: translateY(-18px) translateX(7px) scale(1.15); opacity: 0.75; } }`}</style>
    </motion.div>
  );
};

export default AnnouncementsView;
