import { API_URL } from '../../config/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Search, MapPin, Clock, Calendar, Building2,
  ChevronDown, X, Loader2, CheckCircle, ExternalLink,
  Wifi, Home, Map, Tag, AlertTriangle, BookOpen, Lock, Upload,
  GraduationCap, Trophy, ShieldCheck, Sparkles, Filter
} from 'lucide-react';
import axios from 'axios';

const API = API_URL;

const TYPE_CONFIG = {
  'Government Job': { label: 'Govt Job', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/25', icon: ShieldCheck },
  'Private Job': { label: 'Private Job', bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/25', icon: Briefcase },
  'Scholarship': { label: 'Scholarship', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', icon: GraduationCap },
  'Competition': { label: 'Competition', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25', icon: Trophy },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const CompanyLogo = ({ name, size = 42 }) => {
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
      <span className="text-white font-extrabold" style={{ fontSize: size * 0.42 }}>{initial}</span>
    </div>
  );
};

const OpportunityCard = ({ opp, index, appliedIds }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleApply = (e) => {
    e.stopPropagation();
    if (opp.applicationUrl) {
      window.open(opp.applicationUrl, '_blank', 'noopener,noreferrer');
      return;
    }
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
  const typeKey = opp.opportunityType || (opp.company?.toLowerCase().includes('govt') ? 'Government Job' : 'Private Job');
  const typeStyle = TYPE_CONFIG[typeKey] || { label: typeKey || 'Opportunity', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/25', icon: Tag };
  const TypeIcon = typeStyle.icon;

  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formattedDeadline = formatDate(opp.deadline);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      onClick={handleView}
      className="group relative bg-[#0D1527] border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/30 flex flex-col justify-between"
    >
      <div>
        {/* Header: Company Logo + Title + Type Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo name={opp.companyName || opp.company} size={42} />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                {opp.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 truncate">
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate font-medium">{opp.companyName || opp.company}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Badges & Meta Pills */}
        <div className="flex flex-wrap items-center gap-2 my-3">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
            <TypeIcon className="w-3 h-3" />
            {typeStyle.label}
          </span>

          {opp.location && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">{opp.location}</span>
            </span>
          )}

          {formattedDeadline && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formattedDeadline}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Salary/Free + Apply Button */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3">
        <div className="min-w-0 pr-2">
          {typeKey === 'Scholarship' || typeKey === 'Competition' ? (
            <span className="text-xs font-bold text-emerald-400">Official Portal</span>
          ) : opp.salary ? (
            <span className="text-xs font-bold text-emerald-400 truncate block">{opp.salary}</span>
          ) : (
            <span className="text-xs text-slate-500">Negotiable</span>
          )}
        </div>

        <button
          onClick={handleApply}
          disabled={isApplied}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            isApplied
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 active:scale-95'
          }`}
        >
          {isApplied ? (
            <><CheckCircle className="w-3.5 h-3.5" /> Applied</>
          ) : opp.applicationUrl ? (
            <><ExternalLink className="w-3.5 h-3.5" /> Apply Now</>
          ) : (
            'Apply Now'
          )}
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
  const [selectedType, setSelectedType] = useState('All');
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
      params.set('limit', limit ? String(limit) : '100');
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
  }, [search, limit]);

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
      } catch (e) {}
      try {
        const res = await axios.get(`${API}/api/opportunities/my-applications/me`, { headers });
        (res.data.applications || []).forEach(app => {
          if (app.opportunity?._id) ids.add(app.opportunity._id);
        });
      } catch (e) {}
      setAppliedIds(ids);
    } catch (err) {}
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

  const getOppType = (job) => {
    if (job.opportunityType) return job.opportunityType;
    const title = (job.title || '').toLowerCase();
    const comp = (job.companyName || job.company || '').toLowerCase();
    if (title.includes('scholarship') || comp.includes('scholarship') || comp.includes('daad') || comp.includes('fulbright') || comp.includes('chevening') || comp.includes('mext') || comp.includes('eiffel') || comp.includes('erasmus') || comp.includes('turkey') || comp.includes('korea') || comp.includes('swiss') || comp.includes('vanier') || comp.includes('gates') || comp.includes('aga khan')) {
      return 'Scholarship';
    }
    if (comp.includes('govt') || title.includes('govt')) return 'Government Job';
    return 'Private Job';
  };

  // Filter jobs by selected opportunity type
  const filteredJobs = jobs.filter((job) => {
    if (selectedType === 'All') return true;
    const oppType = getOppType(job);
    if (selectedType === 'Government Job') return oppType === 'Government Job';
    if (selectedType === 'Private Job') return oppType === 'Private Job' || (oppType !== 'Scholarship' && oppType !== 'Competition' && oppType !== 'Government Job');
    if (selectedType === 'Scholarship') return oppType === 'Scholarship';
    if (selectedType === 'Competition') return oppType === 'Competition';
    return oppType === selectedType;
  });

  const displayJobs = limit ? filteredJobs.slice(0, limit) : filteredJobs;

  const filterTabs = [
    { id: 'All', label: 'All Opportunities', count: jobs.length },
    {
      id: 'Government Job',
      label: 'Govt Jobs',
      count: jobs.filter(j => getOppType(j) === 'Government Job').length
    },
    {
      id: 'Private Job',
      label: 'Non-Govt / Private Jobs',
      count: jobs.filter(j => {
        const t = getOppType(j);
        return t === 'Private Job' || (t !== 'Scholarship' && t !== 'Competition' && t !== 'Government Job');
      }).length
    },
    {
      id: 'Scholarship',
      label: 'Scholarships',
      count: jobs.filter(j => getOppType(j) === 'Scholarship').length
    },
    {
      id: 'Competition',
      label: 'Competitions',
      count: jobs.filter(j => getOppType(j) === 'Competition').length
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="flex-1 overflow-y-auto"
    >
      {/* Hero Banner */}
      {fullPage && (
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl mb-6 p-[1px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.07]" />
          <div
            className="relative rounded-[calc(1rem-1px)] overflow-hidden"
            style={{
              background: 'linear-gradient(170deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

            <div className="relative z-10 px-8 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 space-y-2">
                <h1 className="text-[30px] sm:text-[36px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">
                  Career Opportunities
                </h1>
                <p className="text-[15px] text-slate-400 leading-[1.6] max-w-xl">
                  Explore government & private jobs, fully-funded scholarships, and national competitions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search & Filter Bar */}
      {!restricted && (
        <motion.div variants={fadeUp} custom={1} className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, provider, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const isActive = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Main Content Area — 3 Grids per Row */}
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
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-base">No opportunities found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {selectedType !== 'All'
              ? `No ${selectedType} entries matched your criteria. Try selecting "All Opportunities".`
              : 'Check back later for new opportunities.'}
          </p>
          {selectedType !== 'All' && (
            <button
              onClick={() => setSelectedType('All')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-500 transition-all"
            >
              Show All Opportunities
            </button>
          )}
        </div>
      ) : (
        /* 3 CARDS FIT IN ONE ROW ON LG & XL SCREENS */
        <motion.div
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5"
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
