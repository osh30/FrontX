import { API_URL } from '../../config/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Search, MapPin, Clock, Calendar, Building2,
  ChevronDown, X, Loader2, CheckCircle, ExternalLink,
  Sparkles, Wifi, Home, Map, Tag
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = API_URL;

const JOB_TYPE_BADGES = {
  'full-time': { label: 'Full-Time', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'part-time': { label: 'Part-Time', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'internship': { label: 'Internship', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'remote': { label: 'Remote', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'hybrid': { label: 'Hybrid', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
};

const WORK_MODE_MAP = {
  'remote': 'Remote',
  'hybrid': 'Hybrid',
};

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

const CompanyLogo = ({ name, size = 48 }) => {
  const initial = (name || 'A').charAt(0).toUpperCase();
  const colors = [
    'from-blue-600 to-indigo-700',
    'from-purple-600 to-violet-700',
    'from-cyan-600 to-blue-700',
    'from-emerald-600 to-teal-700',
    'from-amber-600 to-orange-700',
    'from-rose-600 to-pink-700',
  ];
  const colorIndex = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  return (
    <div
      className={`shrink-0 rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center shadow-lg shadow-black/20 border border-white/10`}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>{initial}</span>
    </div>
  );
};

const OpportunityCard = ({ opp, index, appliedIds }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const badge = JOB_TYPE_BADGES[opp.jobType] || JOB_TYPE_BADGES['full-time'];
  const workMode = WORK_MODE_MAP[opp.jobType] || 'On-site';
  const isApplied = appliedIds.has(opp._id);
  const isExpired = opp.deadline && new Date(opp.deadline) < new Date();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No deadline';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const workModeIcon = workMode === 'Remote' ? Wifi : workMode === 'Hybrid' ? Home : Map;

  const handleViewDetails = () => {
    navigate(`${location.pathname}/${opp._id}`);
  };

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="relative overflow-hidden rounded-[18px] p-[1px] group"
    >
      <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07] group-hover:from-white/[0.14] group-hover:via-white/[0.07] group-hover:to-white/[0.12] transition-all duration-500" />
      <div
        className="relative rounded-[calc(18px-1px)] p-5 h-full flex flex-col"
        style={{
          background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)',
        }}
      >
        {/* Shimmer sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(18px-1px)]">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: 'linear-gradient(115deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
              backgroundSize: '250% 100%',
              animation: 'shimmerSweep 8s ease-in-out infinite',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          {/* Top: Company Logo + Type Badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <CompanyLogo name={opp.company} size={48} />
              <div className="min-w-0">
                <h3 className="text-white font-bold text-[15px] leading-snug line-clamp-1 mb-0.5">
                  {opp.title}
                </h3>
                <p className="text-slate-400 text-[13px] font-medium truncate flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  {opp.company}
                </p>
              </div>
            </div>
            <span className={`shrink-0 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
          </div>

          {/* Description */}
          {opp.description && (
            <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 mb-3">
              {opp.description}
            </p>
          )}

          {/* Info Row: Location + Work Mode + Deadline */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
            {opp.location && (
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{opp.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              {(() => { const Icon = workModeIcon; return <Icon className="w-3.5 h-3.5 shrink-0" />; })()}
              {workMode}
            </span>
            <span className={`flex items-center gap-1.5 text-[11px] ${isExpired ? 'text-red-400' : 'text-slate-500'}`}>
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {formatDate(opp.deadline)}
            </span>
          </div>

          {/* Skill Tags */}
          {opp.requirements && opp.requirements.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {opp.requirements.slice(0, 5).map((skill, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 border border-white/[0.06]"
                >
                  {skill}
                </span>
              ))}
              {opp.requirements.length > 5 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-600">
                  +{opp.requirements.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: Apply Button */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] text-slate-600">
              {opp.createdAt ? `Posted ${new Date(opp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
            </span>
            {isApplied ? (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4" />
                Applied ✓
              </span>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleViewDetails}
                disabled={isExpired}
                className="relative px-5 py-2 rounded-xl text-[13px] font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #06B6D4 100%)' }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  View Details
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PremiumCareerOpportunities = ({ limit = null, fullPage = false }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const debounceRef = useRef(null);

  const fetchJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (!fullPage) params.set('limit', '50');
      const res = await axios.get(`${API}/api/jobs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch opportunities', err);
    } finally {
      setLoading(false);
    }
  }, [search, fullPage]);

  const fetchApplied = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const ids = new Set();
      try {
        const res = await axios.get(`${API}/api/jobs/my-applications`, { headers });
        (res.data.applications || []).forEach(app => {
          if (app.job?.id) ids.add(app.job.id);
          if (app.linkedOpportunityId) ids.add(app.linkedOpportunityId);
        });
      } catch (e) {
        // silently fail — non-critical
      }
      try {
        const res = await axios.get(`${API}/api/opportunities/my-applications/me`, { headers });
        (res.data.applications || []).forEach(app => {
          if (app.opportunity?._id) ids.add(app.opportunity._id);
        });
      } catch (e) {
        // silently fail — non-critical
      }
      setAppliedIds(ids);
    } catch (err) {
      // silently fail — non-critical
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchJobs();
      fetchApplied();
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchJobs, fetchApplied]);

  const displayJobs = limit ? jobs.slice(0, limit) : jobs;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="flex-1 overflow-y-auto"
    >
      {/* Hero Banner */}
      {fullPage && (
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl mb-8 p-[1px]">
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
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400">Live</span>
                </div>
                <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">
                  Career<br />Opportunities
                </h1>
                <p className="text-[17px] text-slate-400 leading-[1.6] max-w-lg mt-1">
                  Explore internships, research opportunities, and career openings posted by the admin.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div variants={fadeUp} custom={1} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
        </div>
      ) : displayJobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No opportunities available at the moment.</p>
          <p className="text-xs text-slate-400 mt-1">Check back later for new opportunities.</p>
        </div>
      ) : (
        <motion.div
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {displayJobs.map((opp, i) => (
            <OpportunityCard
              key={opp._id}
              opp={opp}
              index={i}
              appliedIds={appliedIds}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PremiumCareerOpportunities;
