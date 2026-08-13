import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Mail, Briefcase, Search, ShieldCheck, X,
  ExternalLink, Calendar, MapPin, Tag, CheckCircle2, ArrowRight
} from 'lucide-react';
import { API_BASE } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const RecruitersPage = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/recruiters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecruiters(data);
      }
    } catch (err) {
      console.error('Error fetching recruiters:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecruiters = recruiters.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.companyName?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.bio?.toLowerCase().includes(q)
    );
  });

  const handleCardClick = (recruiter) => {
    setSelectedRecruiter(recruiter);
    setShowDrawer(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ===== HERO BANNER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 md:p-10 border border-slate-700/50 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" /> Hiring Ecosystem
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Connected Recruiters</h1>
            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Explore verified company recruiters and hiring managers connected with FrontX. Click any card to view complete profile and active opportunities.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <p className="text-2xl font-black text-white">{recruiters.length}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Recruiters</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-black text-blue-400">100%</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Partners</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== SEARCH BAR ===== */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recruiters by name, company, or domain..."
          className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* ===== RECRUITER CARDS GRID ===== */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredRecruiters.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No recruiters found</h3>
          <p className="text-sm text-slate-500 mt-1">Try refining your search query.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecruiters.map((recruiter, idx) => (
            <motion.div
              key={recruiter._id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleCardClick(recruiter)}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-md overflow-hidden shrink-0">
                    {recruiter.companyLogo || recruiter.profilePicture ? (
                      <img
                        src={recruiter.companyLogo || recruiter.profilePicture}
                        alt={recruiter.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {recruiter.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Recruiter
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {recruiter.name}
                </h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {recruiter.companyName || 'Corporate Partner'}
                </p>

                <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                  {recruiter.bio || 'Talent Acquisition Partner connecting top tech candidates with career opportunities.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Briefcase className="w-3 h-3 text-slate-400" /> {recruiter.activeJobsCount || (recruiter.opportunities?.length || 0)} Active Jobs
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white text-xs font-bold transition-all shadow-sm">
                  View Profile <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ===== RECRUITER DETAILS DRAWER ===== */}
      <AnimatePresence>
        {showDrawer && selectedRecruiter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Recruiter Details</h3>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 flex-1">
                {/* Profile Card Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white p-0.5 shadow-md overflow-hidden shrink-0">
                      {selectedRecruiter.companyLogo || selectedRecruiter.profilePicture ? (
                        <img
                          src={selectedRecruiter.companyLogo || selectedRecruiter.profilePicture}
                          alt={selectedRecruiter.name}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-2xl">
                          {selectedRecruiter.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedRecruiter.name}</h2>
                      <p className="text-xs text-blue-400 font-semibold mt-0.5">{selectedRecruiter.companyName || 'Corporate Partner'}</p>
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Official Hiring Manager
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <a
                      href={`mailto:${selectedRecruiter.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email Recruiter
                    </a>
                    <span className="text-slate-400 text-[11px] truncate">{selectedRecruiter.email}</span>
                  </div>
                </div>

                {/* About / Bio Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About Recruiter</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    {selectedRecruiter.bio || 'Talent Acquisition Leader dedicated to connecting top tech candidates with growth opportunities.'}
                  </div>
                </div>

                {/* Active Job Opportunities */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Posted Opportunities</h4>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {selectedRecruiter.opportunities?.length || 0} Listed
                    </span>
                  </div>

                  {!selectedRecruiter.opportunities || selectedRecruiter.opportunities.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No active job posts directly listed right now</p>
                      <p className="text-[11px] text-slate-400 mt-1">Check back soon or contact recruiter directly.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedRecruiter.opportunities.map((opp, i) => (
                        <div
                          key={opp._id || i}
                          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{opp.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                              {opp.type && <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{opp.type}</span>}
                              {opp.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" />{opp.location}</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowDrawer(false);
                              navigate(`/dashboard/career?opp=${opp._id}`);
                            }}
                            className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all shrink-0"
                            title="View Job Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecruitersPage;
