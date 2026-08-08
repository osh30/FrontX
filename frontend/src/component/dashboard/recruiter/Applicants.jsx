import { API_BASE } from '../../../config/api';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Users, Search, XCircle, CheckCircle, FileText, Calendar,
  Download, ExternalLink, Globe, Award, GraduationCap, Briefcase,
  ChevronDown, ChevronUp, Filter, X, Loader2, Clock, MapPin, Mail,
  Phone, Building2, AlertTriangle, Send, User, Upload, Sparkles
} from 'lucide-react';
import { MeetingTypeSelector } from '../MeetingTypeSelector';

const Github = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const API_URL = API_BASE;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'applied', label: 'Applied' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview Scheduled' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'accepted', label: 'Hired' }
];

const STATUS_COLORS = {
  applied: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  pending: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  reviewed: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  shortlisted: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  interview: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  rejected: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  accepted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
};

const STATUS_DOTS = {
  applied: 'bg-blue-500', pending: 'bg-gray-400', reviewed: 'bg-gray-400', shortlisted: 'bg-amber-500',
  interview: 'bg-purple-500', rejected: 'bg-red-500', accepted: 'bg-emerald-500'
};

const INTERVIEW_TYPES = [
  { value: 'Online', subtypes: ['Google Meet', 'Zoom', 'Microsoft Teams'] },
  { value: 'Offline', subtypes: ['In-Person', 'Phone'] }
];

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [opportunityFilter, setOpportunityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [gradYearFilter, setGradYearFilter] = useState('');
  const [cgpaFilter, setCgpaFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Profile drawer
  const [selectedApp, setSelectedApp] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewTarget, setInterviewTarget] = useState(null);

  // Interview form
  const [interviewForm, setInterviewForm] = useState({
    date: '', time: '', interviewType: 'Online', meetingType: 'frontx', platform: 'Google Meet',
    meetingLink: '', location: '', notes: '', duration: '30'
  });

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Opportunities list for filter dropdown
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => { fetchApplicants(); }, [statusFilter, opportunityFilter, page]);
  useEffect(() => { fetchOpportunities(); }, []);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/recruiter/opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });
      setOpportunities(res.data.opportunities || []);
    } catch (err) { /* silent */ }
  };

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit: 12 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (opportunityFilter) params.opportunity = opportunityFilter;
      if (search) params.search = search;
      if (departmentFilter) params.department = departmentFilter;
      if (gradYearFilter) params.graduationYear = gradYearFilter;
      if (cgpaFilter) params.cgpa = cgpaFilter;
      if (skillsFilter) params.skills = skillsFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await axios.get(`${API_URL}/recruiter/applicants`, {
        headers: { Authorization: `Bearer ${token}` }, params
      });
      setApplicants(res.data.applicants || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) { showToast('Failed to load applicants', 'error'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplicants();
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter('all'); setOpportunityFilter('');
    setDepartmentFilter(''); setGradYearFilter(''); setCgpaFilter('');
    setSkillsFilter(''); setDateFrom(''); setDateTo('');
    setPage(1);
    setTimeout(fetchApplicants, 0);
  };

  const openProfile = async (app) => {
    setSelectedApp(app);
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/recruiter/applicants/${app._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(res.data);
    } catch (err) { showToast('Failed to load profile', 'error'); }
    finally { setProfileLoading(false); }
  };

  const updateStatus = async (id, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/recruiter/applicants/${id}/status`, { status, notes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(status === 'shortlisted' ? 'Applicant shortlisted!' : status === 'rejected' ? 'Applicant rejected' : `Status updated to ${status}`);
      setSelectedApp(null);
      setShowRejectModal(false);
      setRejectTarget(null);
      fetchApplicants();
    } catch (err) { showToast('Failed to update status', 'error'); }
  };

  const handleReject = () => {
    if (rejectTarget) updateStatus(rejectTarget._id, 'rejected');
  };

  const openInterviewModal = (app) => {
    setInterviewTarget(app);
    setInterviewForm({
      date: '', time: '', interviewType: 'Online', meetingType: 'frontx', platform: 'Google Meet',
      meetingLink: '', location: '', notes: '', duration: '30'
    });
    setShowInterviewModal(true);
  };

  const scheduleInterview = async () => {
    if (!interviewForm.date || !interviewForm.time) {
      showToast('Date and time are required', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/recruiter/interviews`, {
        studentId: interviewTarget.student?._id || interviewTarget.student,
        opportunityId: interviewTarget.opportunity?._id || interviewTarget.opportunity,
        applicationId: interviewTarget._id,
        title: `Interview: ${interviewTarget.opportunity?.title || 'Opportunity'}`,
        date: interviewForm.date,
        time: interviewForm.time,
        duration: parseInt(interviewForm.duration) || 30,
        interviewType: interviewForm.interviewType,
        meetingType: interviewForm.meetingType,
        platform: interviewForm.platform,
        meetingLink: interviewForm.meetingLink,
        interviewLocation: interviewForm.location,
        notes: interviewForm.notes
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Interview scheduled successfully!');
      setShowInterviewModal(false);
      setInterviewTarget(null);
      setSelectedApp(null);
      setProfileData(null);
      fetchApplicants();
    } catch (err) { showToast('Failed to schedule interview', 'error'); }
  };

  const hasActiveFilters = search || statusFilter !== 'all' || opportunityFilter || departmentFilter || gradYearFilter || cgpaFilter || skillsFilter || dateFrom || dateTo;

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
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Applicant Management</h1>
          <p className="text-sm sm:text-base text-blue-200/70 mt-2 max-w-2xl leading-relaxed">
            Review applications, evaluate candidate profiles, shortlist top talent, and manage interviews efficiently.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/10">
              <span className="text-blue-200 text-sm font-semibold">{total}</span>
              <span className="text-blue-300/60 text-sm ml-1.5">Total Applicants</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </form>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
              showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Opportunity</label>
                    <select value={opportunityFilter} onChange={(e) => { setOpportunityFilter(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">All Opportunities</option>
                      {opportunities.map(o => <option key={o._id} value={o._id}>{o.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department</label>
                    <input value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Graduation Year</label>
                    <input value={gradYearFilter} onChange={(e) => setGradYearFilter(e.target.value)}
                      placeholder="e.g. 2024"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Min CGPA</label>
                    <input value={cgpaFilter} onChange={(e) => setCgpaFilter(e.target.value)}
                      placeholder="e.g. 3.5"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Skills (comma-separated)</label>
                    <input value={skillsFilter} onChange={(e) => setSkillsFilter(e.target.value)}
                      placeholder="e.g. React, Node.js"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">From Date</label>
                      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">To Date</label>
                      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button onClick={() => { clearFilters(); setShowFilters(false); }}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                    Clear All Filters
                  </button>
                  <button onClick={() => { setPage(1); fetchApplicants(); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Applicant List */}
      <div className="space-y-3">
        {loading ? [1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
          </div>
        )) : applicants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No applicants found</p>
            <p className="text-sm text-gray-500 mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Applications will appear when students apply'}
            </p>
          </div>
        ) : applicants.map((app, idx) => (
          <motion.div key={app._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => openProfile(app)}>
            <div className="flex items-center gap-4">
              {app.student?.profilePicture ? (
                <img src={app.student.profilePicture} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 ring-2 ring-gray-100">
                  <span className="text-sm font-bold text-white">
                    {app.student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{app.student?.name || 'Student'}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-gray-500">{app.student?.email}</p>
                  {app.student?.department && (
                    <span className="text-xs text-gray-500">&middot; {app.student.department}</span>
                  )}
                  {app.student?.graduationYear && (
                    <span className="text-xs text-gray-500">&middot; Batch {app.student.graduationYear}</span>
                  )}
                </div>
                <p className="text-xs text-blue-500 font-medium mt-0.5">{app.opportunity?.title || 'Opportunity'}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[app.status] || STATUS_DOTS.pending}`} />
                  {STATUS_OPTIONS.find(s => s.value === app.status)?.label || app.status}
                </span>
                <span className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="sm:hidden flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[app.status] || STATUS_DOTS.pending}`} />
                {STATUS_OPTIONS.find(s => s.value === app.status)?.label || app.status}
              </span>
              <span className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span>
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
        {selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
              {/* Drawer Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#162a50] p-6">
                <button onClick={() => { setSelectedApp(null); setProfileData(null); }}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  {profileData?.student?.profilePicture ? (
                    <img src={profileData.student.profilePicture} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <span className="text-xl font-bold text-white">
                        {profileData?.student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{profileData?.student?.name || selectedApp.student?.name || 'Student'}</h2>
                    <p className="text-sm text-blue-200/70">{profileData?.student?.email || selectedApp.student?.email}</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 ${
                      STATUS_COLORS[profileData?.status || selectedApp.status]
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[profileData?.status || selectedApp.status]}`} />
                      {STATUS_OPTIONS.find(s => s.value === (profileData?.status || selectedApp.status))?.label || selectedApp.status}
                    </span>
                  </div>
                </div>
              </div>

              {profileLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : profileData ? (
                <div className="p-6 space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-blue-600" /> Personal Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Department</p><p className="text-sm font-semibold text-gray-800">{profileData.student?.department || profileData.applicantDepartment || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Session</p><p className="text-sm font-semibold text-gray-800">{profileData.student?.session || profileData.applicantSession || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Graduation Year</p><p className="text-sm font-semibold text-gray-800">{profileData.student?.graduationYear || profileData.applicantGraduationYear || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Student ID</p><p className="text-sm font-semibold text-gray-800">{profileData.student?.studentId || profileData.applicantStudentId || 'N/A'}</p></div>
                      <div className="col-span-2"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Email</p><p className="text-sm font-semibold text-gray-800">{profileData.student?.email || profileData.applicantEmail}</p></div>
                    </div>
                  </div>

                  {/* Career Profile */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-blue-600" /> Career Profile
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      {/* Resume - use uploaded application resume first, fallback to profile resume */}
                      {(profileData.resumeFile?.url || profileData.student?.resumeUrl) ? (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">Resume</p>
                              <p className="text-xs text-gray-500">PDF Document</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={profileData.resumeFile?.url || profileData.student?.resumeUrl} target="_blank" rel="noopener noreferrer"
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a href={profileData.resumeFile?.url || profileData.student?.resumeUrl} download
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                          <FileText className="w-5 h-5 text-gray-300" />
                          <p className="text-sm text-gray-500">No resume uploaded</p>
                        </div>
                      )}

                      {/* Links */}
                      <div className="flex flex-wrap gap-2">
                        {profileData.student?.githubLink && (
                          <a href={profileData.student.githubLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors">
                            <Github className="w-3.5 h-3.5" /> GitHub
                          </a>
                        )}
                        {profileData.linkedinUrl && (
                          <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors">
                            <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                        )}
                        {profileData.student?.portfolioLink && (
                          <a href={profileData.student.portfolioLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors">
                            <Globe className="w-3.5 h-3.5" /> Portfolio
                          </a>
                        )}
                      </div>

                      {/* Skills */}
                      {profileData.student?.skills?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {profileData.student.skills.map((s, i) => (
                              <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-semibold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Career Interest */}
                      {profileData.student?.careerInterest && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Career Interest</p>
                          <p className="text-sm text-gray-700">{profileData.student.careerInterest}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  {profileData.student?.projects?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-blue-600" /> Projects
                      </h3>
                      <div className="space-y-2">
                        {profileData.student.projects.slice(0, 3).map((p, i) => (
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
                  {profileData.student?.certificates?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <Award className="w-4 h-4 text-blue-600" /> Certificates
                      </h3>
                      <div className="space-y-2">
                        {profileData.student.certificates.slice(0, 3).map((c, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm font-semibold text-gray-800">{c.title}</p>
                            {c.org && <p className="text-xs text-gray-500 mt-0.5">{c.org}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {profileData.coverLetter && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-blue-600" /> Cover Letter
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{profileData.coverLetter}</p>
                      </div>
                    </div>
                  )}

                  {/* Application Documents */}
                  {(profileData.resumeFile?.url || profileData.transcriptFile?.url || (profileData.certificates?.length > 0) || profileData.portfolioFile?.url) && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <Upload className="w-4 h-4 text-blue-600" /> Application Documents
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        {profileData.resumeFile?.url && (
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">Resume / CV</p>
                                <p className="text-xs text-gray-500">Uploaded with application</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a href={profileData.resumeFile.url} target="_blank" rel="noopener noreferrer"
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <a href={profileData.resumeFile.url} download
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                        {profileData.transcriptFile?.url && (
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-emerald-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">Transcript</p>
                                <p className="text-xs text-gray-500">Uploaded with application</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a href={profileData.transcriptFile.url} target="_blank" rel="noopener noreferrer"
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <a href={profileData.transcriptFile.url} download
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                        {profileData.portfolioFile?.url && (
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">Portfolio PDF</p>
                                <p className="text-xs text-gray-500">Uploaded with application</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a href={profileData.portfolioFile.url} target="_blank" rel="noopener noreferrer"
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <a href={profileData.portfolioFile.url} download
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                        {profileData.certificates?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1.5">Certificates ({profileData.certificates.length})</p>
                            <div className="space-y-1.5">
                              {profileData.certificates.map((cert, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-500" />
                                    <p className="text-xs font-medium text-gray-700">Certificate {i + 1}</p>
                                  </div>
                                  {cert.url && (
                                    <a href={cert.url} target="_blank" rel="noopener noreferrer"
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {profileData.linkedinUrl && (
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                              <LinkedinIcon className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">LinkedIn Profile</p>
                                <p className="text-xs text-gray-500">Provided in application</p>
                              </div>
                            </div>
                            <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer"
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Application Details */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-blue-600" /> Application Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Position</p><p className="text-sm font-semibold text-gray-800">{profileData.opportunity?.title}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Type</p><p className="text-sm font-semibold text-gray-800">{profileData.opportunity?.opportunityType}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Company</p><p className="text-sm font-semibold text-gray-800">{profileData.opportunity?.companyName}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Applied On</p><p className="text-sm font-semibold text-gray-800">{new Date(profileData.createdAt).toLocaleDateString()}</p></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 pb-2 -mx-6 px-6">
                    <div className="flex flex-wrap gap-2">
                      {(profileData.resumeFile?.url || profileData.student?.resumeUrl) && (
                        <a href={profileData.resumeFile?.url || profileData.student?.resumeUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Open Resume
                        </a>
                      )}
                      {(profileData.resumeFile?.url || profileData.student?.resumeUrl) && (
                        <a href={profileData.resumeFile?.url || profileData.student?.resumeUrl} download
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download Resume
                        </a>
                      )}
                      {profileData.status !== 'rejected' && profileData.status !== 'accepted' && (
                        <button onClick={() => { setRejectTarget(profileData); setShowRejectModal(true); }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                      {profileData.status !== 'rejected' && profileData.status !== 'accepted' && (
                        <button onClick={() => openInterviewModal(profileData)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-colors">
                          <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Confirmation Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Applicant?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to reject <span className="font-semibold text-gray-700">{rejectTarget?.student?.name || 'this applicant'}</span>?
                They will be notified about this decision.
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setShowRejectModal(false); setRejectTarget(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleReject}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {showInterviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Schedule Interview</h3>
                  <p className="text-sm text-gray-500 mt-0.5">for {interviewTarget?.student?.name || 'Applicant'}</p>
                </div>
                <button onClick={() => setShowInterviewModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Interview Date *</label>
                    <input type="date" value={interviewForm.date}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Interview Time *</label>
                    <input type="time" value={interviewForm.time}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Interview Type</label>
                    <select value={interviewForm.interviewType}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewType: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Duration (minutes)</label>
                    <select value={interviewForm.duration}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>
                </div>

                {interviewForm.interviewType === 'Online' && (
                  <>
                    <MeetingTypeSelector
                      value={interviewForm.meetingType}
                      onChange={(meetingType) => setInterviewForm(prev => ({ ...prev, meetingType }))}
                      accent="blue"
                    />
                    <AnimatePresence initial={false}>
                      {interviewForm.meetingType === 'frontx' ? (
                        <motion.div
                          key="frontx-info"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-700">FrontX Live Interview</p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                A secure FrontX video room will be created automatically. The student can join instantly from the app — no external link needed.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="external-fields"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Platform</label>
                              <select value={interviewForm.platform}
                                onChange={(e) => setInterviewForm(prev => ({ ...prev, platform: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                                <option value="Google Meet">Google Meet</option>
                                <option value="Zoom">Zoom</option>
                                <option value="Microsoft Teams">Microsoft Teams</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Meeting Link</label>
                              <input value={interviewForm.meetingLink}
                                onChange={(e) => setInterviewForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                                placeholder="https://meet.google.com/..."
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {interviewForm.interviewType === 'Offline' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                    <input value={interviewForm.location}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Office address or meeting room"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                  <textarea value={interviewForm.notes}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3} placeholder="Any instructions or preparation details..."
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => setShowInterviewModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={scheduleInterview}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20">
                  <Send className="w-4 h-4" /> Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Applicants;
