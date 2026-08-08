import { API_BASE } from '../../../config/api';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Search, Users, Eye, Download, Star, Send, MessageCircle, Filter,
  X, CheckCircle, Loader2, Globe, FileText, Award, Briefcase,
  GraduationCap, Sparkles, ChevronDown, BookOpen, Mail, ExternalLink,
  UserPlus, Bookmark, XCircle
} from 'lucide-react';

const Github = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const API_URL = API_BASE;

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Software Engineering',
  'Electrical Engineering', 'Electronics & Communication', 'Civil Engineering',
  'Mechanical Engineering', 'Business Administration', 'Marketing',
  'Finance', 'Accounting', 'Human Resources', 'Law', 'Other'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Graduates' },
  { value: 'cgpahigh', label: 'Highest CGPA' },
  { value: 'skills', label: 'Most Skills' },
  { value: 'active', label: 'Recently Active' },
  { value: 'name', label: 'Name (A-Z)' }
];

const SearchCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [session, setSession] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [skills, setSkills] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillTags, setSkillTags] = useState([]);
  const [hasResume, setHasResume] = useState('');
  const [hasPortfolio, setHasPortfolio] = useState('');
  const [hasGithub, setHasGithub] = useState('');
  const [hasCertificates, setHasCertificates] = useState('');
  const [hasProjects, setHasProjects] = useState('');
  const [language, setLanguage] = useState('');
  const [availability, setAvailability] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Profile drawer
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageText, setMessageText] = useState('');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Opportunities for invite dropdown
  const [opportunities, setOpportunities] = useState([]);
  const [inviteOpp, setInviteOpp] = useState('');

  useEffect(() => { fetchCandidates(); }, [sort, page]);
  useEffect(() => { fetchOpportunities(); }, []);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/recruiter/opportunities`, {
        headers: { Authorization: `Bearer ${token}` }, params: { limit: 100, status: 'active' }
      });
      setOpportunities(res.data.opportunities || []);
    } catch (err) { /* silent */ }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (department) params.department = department;
      if (session) params.session = session;
      if (graduationYear) params.graduationYear = graduationYear;
      if (minCgpa) params.minCgpa = minCgpa;
      if (skillTags.length > 0) params.skills = skillTags.join(',');
      if (hasResume) params.hasResume = hasResume;
      if (hasPortfolio) params.hasPortfolio = hasPortfolio;
      if (hasGithub) params.hasGithub = hasGithub;
      if (hasCertificates) params.hasCertificates = hasCertificates;
      if (hasProjects) params.hasProjects = hasProjects;
      if (language) params.language = language;
      if (availability) params.availability = availability;

      const res = await axios.get(`${API_URL}/recruiter/search`, {
        headers: { Authorization: `Bearer ${token}` }, params
      });
      setCandidates(res.data.candidates || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) { showToast('Failed to search candidates', 'error'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !skillTags.includes(val)) {
      setSkillTags(prev => [...prev, val]);
      setSkillInput('');
    }
  };
  const removeSkill = (s) => setSkillTags(prev => prev.filter(x => x !== s));

  const clearFilters = () => {
    setSearch(''); setDepartment(''); setSession(''); setGraduationYear('');
    setMinCgpa(''); setSkillTags([]); setSkillInput('');
    setHasResume(''); setHasPortfolio(''); setHasGithub('');
    setHasCertificates(''); setHasProjects('');
    setLanguage(''); setAvailability(''); setSort('newest');
    setPage(1);
    setTimeout(fetchCandidates, 0);
  };

  const openCandidate = async (c) => {
    setSelectedCandidate(c);
    setCandidateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/recruiter/candidate/${c._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidateData(res.data);
    } catch (err) { showToast('Failed to load profile', 'error'); }
    finally { setCandidateLoading(false); }
  };

  const handleSave = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/recruiter/save-candidate`, { candidateId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Candidate saved!');
    } catch (err) { showToast('Failed to save candidate', 'error'); }
  };

  const handleInvite = async () => {
    if (!inviteTarget) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/recruiter/invite`, {
        candidateId: inviteTarget._id,
        opportunityId: inviteOpp || undefined,
        message: inviteMessage || undefined
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Invitation sent!');
      setShowInviteModal(false);
      setInviteTarget(null);
      setInviteMessage('');
      setInviteOpp('');
    } catch (err) { showToast('Failed to send invitation', 'error'); }
  };

  const handleMessage = async () => {
    if (!messageTarget || !messageText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/recruiter/message`, {
        candidateId: messageTarget._id,
        message: messageText.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Message sent!');
      setShowMessageModal(false);
      setMessageTarget(null);
      setMessageText('');
    } catch (err) { showToast('Failed to send message', 'error'); }
  };

  const hasActiveFilters = search || department || session || graduationYear || minCgpa || skillTags.length > 0 || hasResume || hasPortfolio || hasGithub || hasCertificates || hasProjects || language || availability;

  return (
    <div className="max-w-6xl space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 'bg-red-50/90 border-red-200 text-red-700'
            }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#162a50] p-8 sm:p-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl" />
          {[...Array(20)].map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Users className="w-5 h-5 text-blue-300" />
            </div>
            <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>
              <Sparkles className="w-5 h-5 text-blue-300/60" />
            </motion.div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Talent Search</h1>
          <p className="text-sm sm:text-base text-blue-200/70 mt-2 max-w-2xl leading-relaxed">
            Discover talented students and alumni using advanced filters to find the best candidates for your opportunities.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/10">
              <span className="text-blue-200 text-sm font-semibold">{total}</span>
              <span className="text-blue-300/60 text-sm ml-1.5">Candidates Found</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Sort Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department, or skill..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </form>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
              showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            <Filter className="w-4 h-4" /> Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
                {/* Academic */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Academic
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select value={department} onChange={(e) => setDepartment(e.target.value)}
                      className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                      <option value="">All Departments</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input value={session} onChange={(e) => setSession(e.target.value)}
                      placeholder="Session (e.g. 2020-24)" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="Graduation Year" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <input value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)}
                      placeholder="Min CGPA" type="number" step="0.01" min="0" max="4"
                      className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Skills
                  </h4>
                  <div className="flex gap-2">
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="Type skill and press Enter (e.g. React, Python)"
                      className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <button type="button" onClick={addSkill}
                      className="px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                      <span className="text-lg leading-none">+</span>
                    </button>
                  </div>
                  {skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skillTags.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Professional */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Professional
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                      { label: 'Resume', value: hasResume, set: setHasResume },
                      { label: 'Portfolio', value: hasPortfolio, set: setHasPortfolio },
                      { label: 'GitHub', value: hasGithub, set: setHasGithub },
                      { label: 'Certificates', value: hasCertificates, set: setHasCertificates },
                      { label: 'Projects', value: hasProjects, set: setHasProjects }
                    ].map(f => (
                      <select key={f.label} value={f.value} onChange={(e) => f.set(e.target.value)}
                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                        <option value="">{f.label}: Any</option>
                        <option value="true">Has {f.label}</option>
                        <option value="false">No {f.label}</option>
                      </select>
                    ))}
                  </div>
                </div>

                {/* Language & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Language
                    </h4>
                    <input value={language} onChange={(e) => setLanguage(e.target.value)}
                      placeholder="e.g. English, Bangla"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Availability
                    </h4>
                    <input value={availability} onChange={(e) => setAvailability(e.target.value)}
                      placeholder="e.g. Internship, Full-Time"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button onClick={() => { clearFilters(); setShowFilters(false); }}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                    Clear All Filters
                  </button>
                  <button onClick={() => { setPage(1); fetchCandidates(); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Candidate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        )) : candidates.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No candidates found</p>
            <p className="text-sm text-gray-500 mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Start searching for talent'}
            </p>
          </div>
        ) : candidates.map((c, idx) => (
          <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => openCandidate(c)}>
            <div className="flex items-start gap-3 mb-3">
              {c.profilePicture ? (
                <img src={c.profilePicture} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 ring-2 ring-gray-100">
                  <span className="text-sm font-bold text-white">
                    {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{c.name}</p>
                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.department && <span className="text-[10px] text-gray-500">{c.department}</span>}
                  {c.graduationYear && <span className="text-[10px] text-gray-500">&middot; {c.graduationYear}</span>}
                </div>
              </div>
            </div>

            {/* CGPA */}
            {c.academicInfo?.cgpa && (
              <div className="flex items-center gap-1.5 mb-3">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-gray-700">CGPA: {c.academicInfo.cgpa}</span>
              </div>
            )}

            {/* Skills */}
            {c.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {c.skills.slice(0, 4).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-semibold">{s}</span>
                ))}
                {c.skills.length > 4 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-semibold">+{c.skills.length - 4}</span>
                )}
              </div>
            )}

            {/* Status badges */}
            <div className="flex flex-wrap gap-1.5">
              {c.resumeUrl && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">
                  <FileText className="w-2.5 h-2.5" /> Resume
                </span>
              )}
              {c.portfolioLink && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-bold">
                  <Globe className="w-2.5 h-2.5" /> Portfolio
                </span>
              )}
              {c.githubLink && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                  <Github className="w-2.5 h-2.5" /> GitHub
                </span>
              )}
              {c.linkedinLink && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                  <ExternalLink className="w-2.5 h-2.5" /> LinkedIn
                </span>
              )}
              {c.certificates?.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">
                  <Award className="w-2.5 h-2.5" /> {c.certificates.length}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-all">
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  p === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-all">
            Next
          </button>
        </div>
      )}

      {/* Profile Drawer */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#162a50] p-6">
                <button onClick={() => { setSelectedCandidate(null); setCandidateData(null); }}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  {candidateData?.profilePicture ? (
                    <img src={candidateData.profilePicture} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <span className="text-xl font-bold text-white">
                        {candidateData?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{candidateData?.name || selectedCandidate.name}</h2>
                    <p className="text-sm text-blue-200/70">{candidateData?.email || selectedCandidate.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {candidateData?.department && (
                        <span className="text-xs text-blue-300/60">{candidateData.department}</span>
                      )}
                      {candidateData?.graduationYear && (
                        <span className="text-xs text-blue-300/60">&middot; Batch {candidateData.graduationYear}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {candidateLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : candidateData ? (
                <div className="p-6 space-y-6">
                  {/* Academic */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-blue-600" /> Academic Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Department</p><p className="text-sm font-semibold text-gray-800">{candidateData.department || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Session</p><p className="text-sm font-semibold text-gray-800">{candidateData.session || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Graduation Year</p><p className="text-sm font-semibold text-gray-800">{candidateData.graduationYear || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">CGPA</p><p className="text-sm font-semibold text-gray-800">{candidateData.academicInfo?.cgpa || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Student ID</p><p className="text-sm font-semibold text-gray-800">{candidateData.studentId || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Profile Views</p><p className="text-sm font-semibold text-gray-800">{candidateData.profileViews || 0}</p></div>
                    </div>
                  </div>

                  {/* Career Info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-blue-600" /> Career Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      {candidateData.resumeUrl ? (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">Resume</p>
                              <p className="text-xs text-gray-500">PDF Document</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={candidateData.resumeUrl} target="_blank" rel="noopener noreferrer"
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><ExternalLink className="w-4 h-4" /></a>
                            <a href={candidateData.resumeUrl} download
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Download className="w-4 h-4" /></a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                          <FileText className="w-5 h-5 text-gray-300" />
                          <p className="text-sm text-gray-500">No resume uploaded</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {candidateData.githubLink && (
                          <a href={candidateData.githubLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors">
                            <Github className="w-3.5 h-3.5" /> GitHub
                          </a>
                        )}
                        {candidateData.portfolioLink && (
                          <a href={candidateData.portfolioLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors">
                            <Globe className="w-3.5 h-3.5" /> Portfolio
                          </a>
                        )}
                        {candidateData.linkedinLink && (
                          <a href={candidateData.linkedinLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {candidateData.skills?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-blue-600" /> Skills
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateData.skills.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {candidateData.projects?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-blue-600" /> Projects ({candidateData.projects.length})
                      </h3>
                      <div className="space-y-2">
                        {candidateData.projects.slice(0, 3).map((p, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                            {p.desc && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.desc}</p>}
                            {p.tech && <p className="text-[10px] text-blue-500 mt-1.5 font-medium">{p.tech}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificates */}
                  {candidateData.certificates?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <Award className="w-4 h-4 text-blue-600" /> Certificates ({candidateData.certificates.length})
                      </h3>
                      <div className="space-y-2">
                        {candidateData.certificates.slice(0, 3).map((cert, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{cert.title}</p>
                              {cert.org && <p className="text-xs text-gray-500 mt-0.5">{cert.org}</p>}
                            </div>
                            {cert.link && (
                              <a href={cert.link} target="_blank" rel="noopener noreferrer"
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Career Interest */}
                  {candidateData.careerInterest && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-blue-600" /> Career Objective
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{candidateData.careerInterest}</p>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {candidateData.bio && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-blue-600" /> About
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{candidateData.bio}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 pb-2 -mx-6 px-6">
                    <div className="flex flex-wrap gap-2">
                      {candidateData.resumeUrl && (
                        <a href={candidateData.resumeUrl} download
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download Resume
                        </a>
                      )}
                      <button onClick={() => handleSave(candidateData._id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors">
                        <Bookmark className="w-3.5 h-3.5" /> Save Candidate
                      </button>
                      <button onClick={() => { setInviteTarget(candidateData); setShowInviteModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors">
                        <UserPlus className="w-3.5 h-3.5" /> Invite to Apply
                      </button>
                      <button onClick={() => { setMessageTarget(candidateData); setShowMessageModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" /> Send Message
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Invite to Apply</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Invite {inviteTarget?.name} to apply</p>
                </div>
                <button onClick={() => setShowInviteModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Opportunity (Optional)</label>
                  <select value={inviteOpp} onChange={(e) => setInviteOpp(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                    <option value="">General Invitation</option>
                    {opportunities.map(o => <option key={o._id} value={o._id}>{o.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message (Optional)</label>
                  <textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3} placeholder="Add a personal message..."
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleInvite}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                  <Send className="w-4 h-4" /> Send Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Send Message</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Message {messageTarget?.name}</p>
                </div>
                <button onClick={() => setShowMessageModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message *</label>
                <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)}
                  rows={4} placeholder="Write your message..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleMessage} disabled={!messageText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50">
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchCandidates;
