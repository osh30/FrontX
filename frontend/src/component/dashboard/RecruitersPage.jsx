import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Briefcase, Search, CheckCircle, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { API_BASE } from '../../config/api';

const RecruitersPage = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
              Explore and connect with verified company recruiters, hiring partners, and technical talent leads connected with FrontX.
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
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col justify-between group"
            >
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
                  <Briefcase className="w-3 h-3 text-slate-400" /> {recruiter.activeJobsCount || 3} Active Jobs
                </span>
                <a
                  href={`mailto:${recruiter.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" /> Contact Recruiter
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruitersPage;
