import { API_BASE, SOCKET_URL } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Microscope, Search, Clock, Users, Calendar, Tag, GraduationCap, 
  BookOpen, ChevronRight, MapPin, X, Filter, RotateCcw, Code, FilterX 
} from 'lucide-react';
import { io } from 'socket.io-client';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const RESEARCH_TYPES = [
  'All',
  'Research Paper',
  'Survey Research',
  'Review Paper',
  'Industrial Research',
  'Capstone Project',
  'Conference Paper',
  'Journal Publication',
  'Other'
];

const RESEARCH_DOMAINS = [
  'All',
  'Artificial Intelligence',
  'Machine Learning',
  'Cyber Security',
  'Data Science',
  'IoT',
  'Web Development',
  'Healthcare Technology',
  'Software Engineering',
  'Other'
];

const EXPERIENCE_LEVELS = [
  'All',
  'Beginner Friendly',
  'Intermediate',
  'Advanced'
];

const DURATIONS = [
  'All',
  '1 Month',
  '2 Months',
  '3 Months',
  '6 Months',
  'Flexible'
];

const AVAILABILITY_OPTIONS = [
  'All',
  'Application Open',
  'Deadline Passed'
];

export const CollaborationPage = ({ onViewProfile }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  useEffect(() => {
    fetchPosts();

    const socket = io(SOCKET_URL);
    socket.on('research:new', (post) => {
      setPosts(prev => [post, ...prev.filter(p => p._id !== post._id)]);
    });

    return () => socket.disconnect();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/collaboration`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    selectedType !== 'All' ||
    selectedDomain !== 'All' ||
    selectedExperience !== 'All' ||
    selectedDuration !== 'All' ||
    selectedSkill.trim() !== '' ||
    selectedAvailability !== 'All';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedDomain('All');
    setSelectedExperience('All');
    setSelectedDuration('All');
    setSelectedSkill('');
    setSelectedAvailability('All');
  };

  const filteredPosts = posts.filter(p => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = p.title?.toLowerCase().includes(q);
      const matchesType = p.type?.toLowerCase().includes(q);
      const matchesDomain = p.domain?.toLowerCase().includes(q);
      const matchesAlumniName = p.alumni?.name?.toLowerCase().includes(q);
      const matchesDepartment = p.alumni?.department?.toLowerCase().includes(q);
      const matchesOverview = p.overview?.toLowerCase().includes(q);
      const matchesSkills = p.requiredSkills?.some(s => s.toLowerCase().includes(q));

      if (!matchesTitle && !matchesType && !matchesDomain && !matchesAlumniName && !matchesDepartment && !matchesOverview && !matchesSkills) {
        return false;
      }
    }

    // 2. Research Type
    if (selectedType !== 'All') {
      if (selectedType === 'Other') {
        const knownTypes = [
          'Research Paper', 'Survey Research', 'Review Paper', 
          'Industrial Research', 'Capstone Project', 'Conference Paper', 
          'Journal Publication'
        ];
        if (knownTypes.includes(p.type)) return false;
      } else {
        if (p.type !== selectedType) return false;
      }
    }

    // 3. Research Domain
    if (selectedDomain !== 'All') {
      if (selectedDomain === 'Other') {
        const knownDomains = [
          'Artificial Intelligence', 'Machine Learning', 'Cyber Security',
          'Data Science', 'IoT', 'Web Development',
          'Healthcare Technology', 'Software Engineering'
        ];
        if (knownDomains.includes(p.domain)) return false;
      } else {
        if (p.domain !== selectedDomain) return false;
      }
    }

    // 4. Experience Level
    if (selectedExperience !== 'All') {
      if (p.experienceLevel !== selectedExperience) return false;
    }

    // 5. Expected Duration
    if (selectedDuration !== 'All') {
      if (p.duration) {
        const pDur = p.duration.toLowerCase();
        const sDur = selectedDuration.toLowerCase();
        if (!pDur.includes(sDur) && pDur !== sDur) return false;
      } else {
        return false;
      }
    }

    // 6. Student Requirement / Skills
    if (selectedSkill.trim()) {
      const qSkill = selectedSkill.toLowerCase().trim();
      const hasSkill = p.requiredSkills?.some(s => s.toLowerCase().includes(qSkill));
      if (!hasSkill) return false;
    }

    // 7. Availability
    const isExpired = p.isExpired || (p.deadline && new Date(p.deadline) < new Date());
    if (selectedAvailability === 'Application Open') {
      if (isExpired) return false;
    } else if (selectedAvailability === 'Deadline Passed') {
      if (!isExpired) return false;
    }

    return true;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-white/40">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-8">

        {/* Header Hero Section */}
        <motion.div variants={fadeInUp} className="relative rounded-3xl p-[1px] overflow-hidden shadow-xl">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.08]" />
          <div
            className="relative rounded-[calc(1.5rem-1px)] overflow-hidden"
            style={{
              background: 'linear-gradient(165deg, #0B1120 0%, #0F1B2D 25%, #111D33 50%, #0D1625 75%, #0A0F1E 100%)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  background: 'linear-gradient(115deg, transparent 15%, rgba(148,163,184,0.6) 35%, rgba(255,255,255,0.9) 50%, rgba(148,163,184,0.6) 65%, transparent 85%)',
                  backgroundSize: '250% 100%',
                  animation: 'shimmerSweep 8s ease-in-out infinite',
                }} />
              <div className="absolute inset-0 opacity-[0.02]"
                style={{
                  background: 'linear-gradient(210deg, transparent 25%, rgba(59,130,246,0.3) 45%, rgba(139,92,246,0.4) 50%, rgba(59,130,246,0.3) 55%, transparent 75%)',
                  backgroundSize: '300% 100%',
                  animation: 'shimmerSweep 12s ease-in-out infinite 2s',
                }} />
              {[
                { left: '8%', top: '20%', size: 2, delay: 0, dur: 8 },
                { left: '75%', top: '15%', size: 1.8, delay: 1.2, dur: 9 },
                { left: '45%', top: '80%', size: 2.2, delay: 2.5, dur: 7 },
                { left: '88%', top: '60%', size: 1.5, delay: 0.8, dur: 10 },
                { left: '25%', top: '55%', size: 2, delay: 3, dur: 7.5 },
                { left: '60%', top: '30%', size: 1.2, delay: 1.8, dur: 9.5 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: p.left, top: p.top,
                    width: p.size, height: p.size,
                    background: i % 3 === 0
                      ? 'radial-gradient(circle, rgba(148,163,184,0.8), transparent)'
                      : i % 3 === 1
                        ? 'radial-gradient(circle, rgba(96,165,250,0.7), transparent)'
                        : 'radial-gradient(circle, rgba(167,139,250,0.6), transparent)',
                    animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
                  }}
                />
              ))}
            </div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 p-8 md:p-12">
              <div className="max-w-2xl">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.08] backdrop-blur-md flex items-center justify-center mb-6 border border-white/[0.1]">
                  <Microscope className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-white">Collaboration</h1>
                <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">Collaborate with mentors and alumni on cutting-edge research papers and innovative projects to build your portfolio.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Container */}
        <div className="space-y-4">

          {/* Search Bar */}
          <motion.div variants={fadeInUp}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, domain, alumni name, department, or skill..."
                className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Filter Controls Panel */}
          <motion.div variants={fadeInUp} className="bg-white rounded-3xl border border-gray-200/80 p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Filter className="w-4 h-4 text-purple-600" />
                <span>Filter Opportunities</span>
                {hasActiveFilters && (
                  <span className="ml-1 text-[11px] font-semibold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {/* 1. Research Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Research Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                >
                  {RESEARCH_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* 2. Research Domain */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-500" /> Research Domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                >
                  {RESEARCH_DOMAINS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 3. Experience Level */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-green-500" /> Experience Level
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                >
                  {EXPERIENCE_LEVELS.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              {/* 4. Expected Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Expected Duration
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                >
                  {DURATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 5. Required Skills */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-500" /> Required Skill
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    placeholder="Filter by skill..."
                    className="w-full bg-slate-50 border border-gray-200 text-gray-800 placeholder-gray-400 text-xs font-medium rounded-xl pl-3 pr-7 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                  {selectedSkill && (
                    <button
                      onClick={() => setSelectedSkill('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 6. Availability */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-500" /> Availability
                </label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                >
                  {AVAILABILITY_OPTIONS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Result Indicator Header */}
        {!loading && (
          <div className="flex items-center justify-between text-sm text-gray-600 px-1 font-medium">
            <span>
              Showing <strong className="text-gray-900 font-bold">{filteredPosts.length}</strong> {filteredPosts.length === 1 ? 'collaboration' : 'collaborations'} found
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset all filters
              </button>
            )}
          </div>
        )}

        {/* Cards List or Loading / Empty State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div variants={fadeInUp} className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <FilterX className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No collaborations match your selected filters.</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Try adjusting your search query or filter options to explore available research opportunities.
              </p>
            </div>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => {
              const postExpired = post.isExpired || (post.deadline && new Date(post.deadline) < new Date());
              return (
                <motion.div
                  key={post._id}
                  variants={fadeInUp}
                  className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6 md:p-8">
                    {/* Top Row: Title + Type */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{post.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span className="font-semibold text-purple-600">{post.alumni?.name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{post.alumni?.department || 'Alumni'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDateTime(post.createdAt)}</span>
                        </div>
                      </div>
                      <span className="shrink-0 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase tracking-wide">{post.type}</span>
                    </div>

                    {/* Domain + Experience Level badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.domain && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                          <Tag className="w-3 h-3" />{post.domain}
                        </span>
                      )}
                      {post.experienceLevel && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                          <GraduationCap className="w-3 h-3" />{post.experienceLevel}
                        </span>
                      )}
                    </div>

                    {/* Overview */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{post.overview}</p>

                    {/* Required Skills */}
                    {post.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.requiredSkills.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-xs font-semibold">{skill}</span>
                        ))}
                      </div>
                    )}

                    {/* Meta Row: Seats + Deadline */}
                    <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 pt-4 border-t border-gray-100">
                      {post.studentCount && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span><strong className="text-gray-900">{post.studentCount}</strong> {post.studentCount === 1 ? 'seat' : 'seats'} available</span>
                        </span>
                      )}
                      {post.deadline && (
                        <span className={`flex items-center gap-1.5 font-medium ${postExpired ? 'text-red-500' : ''}`}>
                          <Calendar className="w-4 h-4 text-red-500" />
                          <span>Deadline: <strong className="text-gray-900">{formatDate(post.deadline)}</strong></span>
                          {postExpired && (
                            <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase">
                              <X className="w-3 h-3" /> Closed
                            </span>
                          )}
                        </span>
                      )}
                      {post.duration && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span><strong className="text-gray-900">{post.duration}</strong></span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 font-medium ml-auto">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span>{post.applicantCount || 0} applicant{(post.applicantCount || 0) !== 1 ? 's' : ''}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      {postExpired ? (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                          Application Deadline Passed
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                          Application Open
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/dashboard/collaboration/${post._id}`)}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes shimmerSweep {
          0%, 100% { background-position: -250% 0; }
          50% { background-position: 250% 0; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; }
          25% { transform: translateY(-14px) translateX(5px) scale(1.4); opacity: 0.65; }
          50% { transform: translateY(-7px) translateX(-4px) scale(0.85); opacity: 0.4; }
          75% { transform: translateY(-18px) translateX(7px) scale(1.15); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
};