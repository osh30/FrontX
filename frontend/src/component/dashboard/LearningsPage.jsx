import { API_URL } from '../../config/api';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  BookOpen, FileText, Download, Calendar, ChevronRight, Search,
  SlidersHorizontal, Eye, X, Loader, ArrowUpDown, User, Plus,
  Upload, Trash2, Edit, AlertTriangle, CheckCircle, ShieldCheck,
  Globe, Sparkles
} from 'lucide-react';
import Avatar from './Avatar';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = API_URL;

const DEPARTMENTS = [
  'Educational Technology and Engineering'
];

const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester'
];

const COURSES = [
  'STEM Education',
  'Blended Learning',
  'Web Development',
  'Python',
  'Computer Networking',
  'Cloud Computing'
];

const WEEKS = Array.from({ length: 14 }, (_, i) => `Week ${i + 1}`);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const LearningsPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');
  const [course, setCourse] = useState('All');
  const [weekOrTopic, setWeekOrTopic] = useState('All');
  const [sort, setSort] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'my'

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state for Upload / Edit
  const [formData, setFormData] = useState({
    title: '',
    department: 'Educational Technology and Engineering',
    semester: '1st Semester',
    course: 'STEM Education',
    weekOrTopic: 'Week 1',
    description: '',
    status: 'published',
    file: null
  });

  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const currentUserId = currentUser._id || currentUser.id;

  const fetchNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department !== 'All') params.append('department', department);
      if (semester !== 'All') params.append('semester', semester);
      if (course !== 'All') params.append('course', course);
      if (weekOrTopic !== 'All') params.append('weekOrTopic', weekOrTopic);
      if (sort) params.append('sort', sort);
      if (viewMode === 'my') params.append('myNotes', 'true');

      const res = await axios.get(`${API}/api/notes?${params.toString()}`, {
        headers: authHeaders()
      });
      setNotes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      toast.error('Failed to load study notes.');
    } finally {
      setLoading(false);
    }
  }, [search, department, semester, course, weekOrTopic, sort, viewMode]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    const socket = io(API);
    socket.on('new_note_uploaded', () => {
      fetchNotes();
    });
    return () => socket.disconnect();
  }, [fetchNotes]);

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      department: DEPARTMENTS[0],
      semester: SEMESTERS[0],
      course: COURSES[0],
      weekOrTopic: WEEKS[0],
      description: '',
      status: 'published',
      file: null
    });
    setShowUploadModal(true);
  };

  const handleOpenEditModal = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      department: note.department || DEPARTMENTS[0],
      semester: note.semester || SEMESTERS[0],
      course: note.course || COURSES[0],
      weekOrTopic: note.weekOrTopic || WEEKS[0],
      description: note.description || '',
      status: note.status || 'published',
      file: null
    });
    setShowUploadModal(true);
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error('Please enter a note title.');
    }
    if (!editingNote && !formData.file) {
      return toast.error('Please select a PDF file to upload.');
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('department', formData.department);
      data.append('semester', formData.semester);
      data.append('course', formData.course);
      data.append('weekOrTopic', formData.weekOrTopic);
      data.append('description', formData.description || '');
      data.append('status', formData.status);
      data.append('subject', formData.course);

      if (formData.file) {
        data.append('file', formData.file);
      }

      if (editingNote) {
        await axios.put(`${API}/api/notes/${editingNote._id}`, data, {
          headers: {
            ...authHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Study note updated successfully!');
      } else {
        await axios.post(`${API}/api/notes`, data, {
          headers: {
            ...authHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Study note uploaded successfully!');
      }

      setShowUploadModal(false);
      fetchNotes();
    } catch (err) {
      console.error('Error saving study note:', err);
      toast.error(err.response?.data?.message || 'Failed to save study note.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!deletingNote) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/notes/${deletingNote._id}`, {
        headers: authHeaders()
      });
      toast.success('Study note deleted successfully.');
      setNotes(prev => prev.filter(n => n._id !== deletingNote._id));
      setDeletingNote(null);
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.error(err.response?.data?.message || 'Failed to delete note.');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewNote = async (note) => {
    try {
      await axios.post(`${API}/api/notes/${note._id}/view`, {}, {
        headers: authHeaders()
      }).catch(() => {});
      window.open(note.pdfUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('View note error:', err);
    }
  };

  const handleDownload = async (note) => {
    try {
      setDownloadingId(note._id);
      await axios.post(`${API}/api/notes/${note._id}/download`, {}, {
        headers: authHeaders()
      }).catch(() => {});

      // Increment local download count for instant UI feedback
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, downloads: (n.downloads || 0) + 1 } : n));

      const link = document.createElement('a');
      link.href = note.pdfUrl;
      link.target = '_blank';
      link.download = `${note.title || 'study_note'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error('Failed to download note.');
    } finally {
      setDownloadingId(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('All');
    setSemester('All');
    setCourse('All');
    setWeekOrTopic('All');
    setSort('latest');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (department !== 'All') count++;
    if (semester !== 'All') count++;
    if (course !== 'All') count++;
    if (weekOrTopic !== 'All') count++;
    return count;
  }, [department, semester, course, weekOrTopic]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20 mx-auto md:mx-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-sm">
              Recommended Learning & Notes
            </h1>
            <p className="text-blue-100/80 max-w-2xl leading-relaxed text-sm sm:text-base">
              Centralized library of study notes shared by students. Browse materials by department, semester, course, and week — or upload your own.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setViewMode(prev => prev === 'all' ? 'my' : 'all')}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border ${
                viewMode === 'my'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
              }`}
            >
              <User className="w-4 h-4" />
              {viewMode === 'my' ? 'Showing My Notes' : 'My Notes'}
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Study Note
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by note title, course, subject, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition-all"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Library Notes
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'my' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              My Uploaded Notes
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none appearance-none cursor-pointer min-w-[150px]"
            >
              <option value="latest">Latest</option>
              <option value="downloads">Most Downloaded</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="All">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Semester</label>
                  <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="All">All Semesters</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Course</label>
                  <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="All">All Courses</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Week / Topic</label>
                  <select value={weekOrTopic} onChange={(e) => setWeekOrTopic(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="All">All Weeks</option>
                    {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="mt-3 flex justify-end">
                  <button onClick={clearFilters} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <BookOpen className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">No study notes found</p>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            {search || activeFilterCount > 0
              ? 'No notes match your active filters or search terms.'
              : 'Be the first student to share a useful study note with the FrontX community.'}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {search || activeFilterCount > 0 ? (
              <button onClick={clearFilters} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
                Clear all filters
              </button>
            ) : null}

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Study Note
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-800">{notes.length}</span> {notes.length === 1 ? 'note' : 'notes'}
              {viewMode === 'my' && ' (My Uploads)'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, index) => {
              const uploader = note.studentId || {};
              const isOwner = (uploader._id || uploader) === currentUserId;

              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Header gradient banner */}
                    <div className="h-32 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 p-4 flex flex-col justify-between">
                      <div className="absolute inset-0 bg-black/10" />

                      {/* Top tags */}
                      <div className="relative z-10 flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-indigo-700 shadow-sm flex items-center gap-1">
                          <FileText className="w-3 h-3 text-indigo-600" /> PDF
                        </span>

                        {note.semester && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 shadow-sm">
                            {note.semester}
                          </span>
                        )}

                        {note.status === 'unpublished' && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                            Draft / Unpublished
                          </span>
                        )}
                      </div>

                      {/* Note Title */}
                      <div className="relative z-10">
                        <h3 className="text-white font-bold text-base drop-shadow-md line-clamp-2 leading-snug">
                          {note.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      {/* Course */}
                      {(note.course || note.subject) && (
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                          {note.course || note.subject}
                        </p>
                      )}

                      {/* Department & Week Meta */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {note.department && (
                          <span className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 font-medium truncate max-w-[200px]">
                            {note.department}
                          </span>
                        )}
                        {note.weekOrTopic && (
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
                            {note.weekOrTopic}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {note.description && (
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                          {note.description}
                        </p>
                      )}

                      {/* Uploader & Date */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar src={uploader?.profilePicture} alt={uploader?.name} size={24} className="border-2 border-white shadow-sm shrink-0" />
                          <span className="text-xs font-semibold text-gray-700 truncate">
                            {uploader?.name || 'Student Author'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                          <Calendar className="w-3 h-3" />
                          {formatDate(note.createdAt)}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-gray-400" /> {note.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5 text-gray-400" /> {note.downloads || 0} downloads
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 pt-0 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewNote(note)}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Note
                      </button>

                      <button
                        onClick={() => handleDownload(note)}
                        disabled={downloadingId === note._id}
                        className="py-2.5 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all border border-blue-100 flex items-center justify-center gap-1"
                      >
                        {downloadingId === note._id ? (
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Owner Options (Edit & Delete) */}
                    {isOwner && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleOpenEditModal(note)}
                          className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3 h-3 text-gray-500" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingNote(note)}
                          className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold border border-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* UPLOAD / EDIT NOTE MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-xl w-full border border-gray-100 my-8"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingNote ? 'Edit Study Note' : 'Upload Study Note'}
                    </h2>
                    <p className="text-xs text-gray-500">Share your study note with fellow students</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitNote} className="space-y-4">
                {/* Note Title */}
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    Note Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Networking – OSI Reference Model"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Department & Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                    >
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Course & Week */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                    >
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">
                      Week / Topic <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.weekOrTopic}
                      onChange={(e) => setFormData({ ...formData, weekOrTopic: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                    >
                      {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Short Description</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what this study note covers..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                {/* Status Options */}
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Publish Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                  >
                    <option value="published">Published (Visible in public Learnings library)</option>
                    <option value="unpublished">Unpublished / Draft (Visible only to you)</option>
                  </select>
                </div>

                {/* PDF File Input */}
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    Note File (PDF) {!editingNote && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    required={!editingNote}
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] || null })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                  />
                  {editingNote && (
                    <p className="text-[11px] text-gray-400 mt-1">Leave empty to keep the existing PDF file.</p>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {submitting ? 'Saving...' : editingNote ? 'Save Changes' : 'Upload Note'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-100"
            >
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this study note?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                This note will be removed from the Learnings library. This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeletingNote(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteNote}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? 'Deleting...' : 'Delete Note'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningsPage;
