import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Search, SlidersHorizontal, ChevronDown, X, Clock, MapPin,
  Building2, Edit3, Trash2,
  GraduationCap, Calendar, Users, ArrowRight, CheckCircle, Star, Award,
  Plus, Loader2, Send
} from 'lucide-react';
import Avatar from './Avatar';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const JOB_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const OPPORTUNITY_TYPES = ['full-time', 'part-time', 'internship', 'remote', 'hybrid'];

const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: Briefcase },
  { id: 'full-time', label: 'Jobs', icon: Building2 },
  { id: 'internship', label: 'Internships', icon: GraduationCap },
  { id: 'scholarship', label: 'Scholarships', icon: Star },
  { id: 'competition', label: 'Competitions', icon: Award },
];

const JOB_TYPE_COLORS = {
  'full-time': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'part-time': 'bg-blue-100 text-blue-700 border-blue-200',
  'internship': 'bg-orange-100 text-orange-700 border-orange-200',
  'remote': 'bg-purple-100 text-purple-700 border-purple-200',
  'hybrid': 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

const EmptyForm = {
  title: '',
  company: '',
  description: '',
  jobType: 'full-time',
  location: '',
  salaryMin: '',
  salaryMax: '',
  requirements: '',
  deadline: '',
};

const AlumniOpportunitiesPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [myJobs, setMyJobs] = useState([]);
  const debounceRef = useRef(null);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({ ...EmptyForm });
  const [publishing, setPublishing] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (jobTypeFilter !== 'all') params.set('jobType', jobTypeFilter);
      params.set('limit', '50');

      const res = await axios.get(`${API}/api/jobs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allJobs = res.data.jobs || [];
      setJobs(allJobs);
      setMyJobs(allJobs.filter(j => j.postedBy?._id === JSON.parse(atob(token.split('.')[1])).id || j.postedBy === JSON.parse(atob(token.split('.')[1])).id));
    } catch (err) {
      console.error('Failed to fetch opportunities', err);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [search, jobTypeFilter]);

  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchJobs(), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchJobs]);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Opportunity deleted');
      fetchJobs();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete opportunity';
      toast.error(msg);
    }
  };

  const handlePublishChange = (e) => {
    const { name, value } = e.target;
    setPublishForm(prev => ({ ...prev, [name]: value }));
  };

  const validatePublishForm = () => {
    if (!publishForm.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!publishForm.company.trim()) {
      toast.error('Company name is required');
      return false;
    }
    if (!publishForm.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validatePublishForm()) return;
    setPublishing(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: publishForm.title.trim(),
        company: publishForm.company.trim(),
        description: publishForm.description.trim(),
        jobType: publishForm.jobType,
        location: publishForm.location.trim() || undefined,
        salaryRange: {
          min: Number(publishForm.salaryMin) || 0,
          max: Number(publishForm.salaryMax) || 0,
          currency: 'BDT',
        },
        requirements: publishForm.requirements
          ? publishForm.requirements.split(',').map(r => r.trim()).filter(Boolean)
          : [],
        deadline: publishForm.deadline || undefined,
      };

      await axios.post(`${API}/api/jobs`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Opportunity published successfully!');
      setShowPublishModal(false);
      setPublishForm({ ...EmptyForm });
      fetchJobs();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to create opportunity';
      console.error('Publish opportunity error:', err.response?.data || err.message);
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  };

  const resetPublishForm = () => {
    setPublishForm({ ...EmptyForm });
  };

  const filteredJobs = jobs.filter(j => {
    if (activeTab === 'all') return true;
    if (activeTab === 'scholarship') return j.title?.toLowerCase().includes('scholarship') || j.description?.toLowerCase().includes('scholarship');
    if (activeTab === 'competition') return j.title?.toLowerCase().includes('competition') || j.description?.toLowerCase().includes('competition');
    return j.jobType === activeTab;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] shadow-2xl shadow-slate-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-5 shadow-lg shadow-blue-900/20">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Opportunities</h1>
            <p className="text-blue-100/80 max-w-xl leading-relaxed">
              Explore jobs, internships, scholarships, and competitions shared by the alumni network.
            </p>
          </div>
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-white/20 hover:shadow-xl transition-all shrink-0 self-start"
          >
            <Plus className="w-4 h-4" /> Publish Opportunity
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORY_TABS.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === 'all' ? jobs.length :
            tab.id === 'scholarship' ? jobs.filter(j => j.title?.toLowerCase().includes('scholarship') || j.description?.toLowerCase().includes('scholarship')).length :
            tab.id === 'competition' ? jobs.filter(j => j.title?.toLowerCase().includes('competition') || j.description?.toLowerCase().includes('competition')).length :
            jobs.filter(j => j.jobType === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0F172A] text-white shadow-md'
                  : 'bg-white/60 text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none appearance-none cursor-pointer min-w-[160px]"
            >
              {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No opportunities found</p>
          <p className="text-sm text-gray-500 mb-4">
            {search || jobTypeFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Be the first to post an opportunity!'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {(search || jobTypeFilter !== 'all') && (
              <button onClick={() => { setSearch(''); setJobTypeFilter('all'); setActiveTab('all'); }} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Clear all filters
              </button>
            )}
            {!search && jobTypeFilter === 'all' && (
              <button onClick={() => setShowPublishModal(true)} className="text-sm font-semibold text-white bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] px-4 py-2 rounded-xl hover:shadow-lg transition-all">
                Publish Opportunity
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredJobs.map((job, idx) => {
            const isOwner = myJobs.some(mj => mj._id === job._id);
            return (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-[#1E3A8A] transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-500 truncate">{job.company}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border shrink-0 ${JOB_TYPE_COLORS[j.jobType] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {job.jobType || 'Full-time'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                    {job.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {job.location}</span>
                    )}
                    {job.salaryRange?.min && (
                      <span className="flex items-center gap-1"><span className="text-sm font-semibold text-gray-400">৳</span> {job.salaryRange.min.toLocaleString()}{job.salaryRange.max ? ` - ${job.salaryRange.max.toLocaleString()}` : '+'}</span>
                    )}
                    {job.deadline && (
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-red-400" /> Closes {formatDate(job.deadline)}</span>
                    )}
                  </div>

                  {job.requirements?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.requirements.slice(0, 3).map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-[10px] font-medium">{r}</span>
                      ))}
                      {job.requirements.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[10px]">+{job.requirements.length - 3}</span>
                      )}
                    </div>
                  )}

                  {job.applications?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span><strong className="text-gray-900">{job.applications.length}</strong> applicant{job.applications.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Avatar src={job.postedBy?.profilePicture} alt={job.postedBy?.name} size={20} className="border border-white" />
                    <span>{job.postedBy?.name || 'Alumni'}</span>
                    <span className="text-gray-300">|</span>
                    <span>{formatDate(job.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); toast('Edit functionality coming soon'); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(job._id); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/dashboard/opportunities/${job._id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Publish Opportunity Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-10 overflow-y-auto"
            onClick={() => !publishing && setShowPublishModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-blue-300" />
                      <span className="text-xs font-bold text-blue-300/80 uppercase tracking-wider">New Opportunity</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">Publish Opportunity</h2>
                    <p className="text-sm text-blue-200/70 mt-1">Share a job, internship, or scholarship with the community.</p>
                  </div>
                  <button
                    onClick={() => !publishing && setShowPublishModal(false)}
                    className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Opportunity Title *</label>
                  <input
                    name="title"
                    value={publishForm.title}
                    onChange={handlePublishChange}
                    placeholder="e.g. Frontend Developer, Marketing Intern"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company / Organization *</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="company"
                      value={publishForm.company}
                      onChange={handlePublishChange}
                      placeholder="e.g. Google, Ministry of Education"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                  <textarea
                    name="description"
                    value={publishForm.description}
                    onChange={handlePublishChange}
                    rows={4}
                    placeholder="Describe the opportunity in detail..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                {/* Job Type + Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="jobType"
                        value={publishForm.jobType}
                        onChange={handlePublishChange}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none cursor-pointer"
                      >
                        {OPPORTUNITY_TYPES.map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="location"
                        value={publishForm.location}
                        onChange={handlePublishChange}
                        placeholder="e.g. Dhaka, Remote"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Salary Range (BDT)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">৳</span>
                      <input
                        name="salaryMin"
                        type="number"
                        value={publishForm.salaryMin}
                        onChange={handlePublishChange}
                        placeholder="Min"
                        className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">৳</span>
                      <input
                        name="salaryMax"
                        type="number"
                        value={publishForm.salaryMax}
                        onChange={handlePublishChange}
                        placeholder="Max"
                        className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Requirements (comma-separated)</label>
                  <input
                    name="requirements"
                    value={publishForm.requirements}
                    onChange={handlePublishChange}
                    placeholder="e.g. React, Node.js, 2 years experience"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Deadline</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="deadline"
                      type="date"
                      value={publishForm.deadline}
                      onChange={handlePublishChange}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                <button
                  onClick={() => { resetPublishForm(); setShowPublishModal(false); }}
                  disabled={publishing}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] hover:from-[#1E293B] hover:to-[#2548A5] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publish Opportunity
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AlumniOpportunitiesPage;
