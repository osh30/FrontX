import { API_URL } from '../../config/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Search, MapPin, Clock, Calendar, Building2,
  ChevronDown, X, Loader2, CheckCircle, ExternalLink,
  Wifi, Home, Map, Tag, AlertTriangle, BookOpen, Lock, Upload
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

  const handleApply = (e) => {
    e.stopPropagation();
    const basePath = location.pathname.startsWith('/admin')
      ? '/admin/career'
      : location.pathname.startsWith('/recruiter')
      ? '/recruiter/career'
      : '/dashboard/career';
    navigate(`${basePath}/apply/${opp._id}`);
  };

  const handleView = () => {
    const basePath = location.pathname.startsWith('/admin')
      ? '/admin/career'
      : location.pathname.startsWith('/recruiter')
      ? '/recruiter/career'
      : '/dashboard/career';
    navigate(`${basePath}/${opp._id}`);
  };

  const isApplied = appliedIds.has(opp._id);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      onClick={handleView}
      className="group relative bg-[#0D1527] border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/20 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <CompanyLogo name={opp.companyName || opp.company} size={44} />
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                {opp.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-slate-500" />
                {opp.companyName || opp.company}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {opp.opportunityType && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {opp.opportunityType}
            </span>
          )}
          {opp.location && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {opp.location}
            </span>
          )}
          {opp.employmentMode && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {opp.employmentMode}
            </span>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-2">
        <div>
          {opp.salary ? (
            <span className="text-xs font-bold text-emerald-400">{opp.salary}</span>
          ) : (
            <span className="text-xs text-slate-500">Salary Negotiable</span>
          )}
        </div>
        <button
          onClick={handleApply}
          disabled={isApplied}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            isApplied
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
          }`}
        >
          {isApplied ? <><CheckCircle className="w-3.5 h-3.5" /> Applied</> : 'Apply Now'}
        </button>
      </div>
    </motion.div>
  );
};

const PremiumCareerOpportunities = ({ limit = null, fullPage = false }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [restricted, setRestricted] = useState(false);
  const [restrictionMsg, setRestrictionMsg] = useState('');
  const [primaryMissedWeek, setPrimaryMissedWeek] = useState(null);
  const [missedWeeks, setMissedWeeks] = useState([]);
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

      if (res.data.careerAccessRestricted) {
        setRestricted(true);
        setRestrictionMsg(res.data.restrictionMessage || 'Your Career Opportunities access is temporarily locked because your required study note has not been submitted.');
        setPrimaryMissedWeek(res.data.primaryMissedWeek || null);
        setMissedWeeks(res.data.missedWeeks || []);
        setJobs([]);
      } else {
        setRestricted(false);
        setRestrictionMsg('');
        setPrimaryMissedWeek(null);
        setMissedWeeks([]);
        setJobs(res.data.jobs || []);
      }
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
        // silently fail
      }
      try {
        const res = await axios.get(`${API}/api/opportunities/my-applications/me`, { headers });
        (res.data.applications || []).forEach(app => {
          if (app.opportunity?._id) ids.add(app.opportunity._id);
        });
      } catch (e) {
        // silently fail
      }
      setAppliedIds(ids);
    } catch (err) {
      // silently fail
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
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

            <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
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

      {!restricted && (
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
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
        </div>
      ) : restricted ? (
        <motion.div variants={fadeUp} className="max-w-xl mx-auto my-8 p-8 rounded-3xl bg-[#0D1527] border border-slate-800 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Career Opportunities Locked</h2>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            {restrictionMsg || 'Your Career Opportunities access is temporarily locked because your required study note has not been submitted.'}
          </p>

          {primaryMissedWeek && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200">
                  {primaryMissedWeek.courseCode ? `${primaryMissedWeek.courseCode} — Week ${primaryMissedWeek.weekNumber}` : `Week ${primaryMissedWeek.weekNumber}`}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {primaryMissedWeek.topic || 'Upload missing study note to unlock career access.'}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (primaryMissedWeek?.courseId) {
                navigate(`/dashboard/planner?courseId=${primaryMissedWeek.courseId}`);
              } else {
                navigate('/dashboard/planner');
              }
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {primaryMissedWeek ? `Upload Week ${primaryMissedWeek.weekNumber} Note` : 'Upload Missing Note'}
          </button>
        </motion.div>
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
