import { API_URL } from '../../config/api';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { BookOpen, FileText, Download, Calendar, ChevronRight, Search, SlidersHorizontal, Eye, X, Loader, ArrowUpDown, User } from 'lucide-react';
import Avatar from './Avatar';
import axios from 'axios';

const API = API_URL;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
  const [filterMeta, setFilterMeta] = useState({ departments: [], semesters: [], courses: [], weekOrTopics: [] });
  const [showFilters, setShowFilters] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

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
      const res = await axios.get(`${API}/api/notes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  }, [search, department, semester, course, weekOrTopic, sort]);

  const fetchFilterMeta = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API}/api/notes/filters/meta`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFilterMeta(res.data);
    } catch (err) {
      console.error("Failed to fetch filter meta", err);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchFilterMeta();
  }, [fetchFilterMeta]);

  useEffect(() => {
    const socket = io(API);
    socket.on('new_note_uploaded', () => {
      fetchNotes();
    });
    return () => socket.disconnect();
  }, [fetchNotes]);

  const handleDownload = async (note) => {
    try {
      setDownloadingId(note._id);
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/notes/${note._id}/download`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(note.pdfUrl, '_blank');
    } catch (err) {
      console.error("Download failed", err);
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
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/20">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Recommended Learning</h1>
          <p className="text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            Your centralized library of study notes shared by fellow students. Find materials for any course, department, or week — all in one place.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by note title, course, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition-all"
            />
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
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="All">All Departments</option>
                    {filterMeta.departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Semester</label>
                  <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="All">All Semesters</option>
                    {filterMeta.semesters.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Course</label>
                  <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="All">All Courses</option>
                    {filterMeta.courses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Week / Topic</label>
                  <select value={weekOrTopic} onChange={(e) => setWeekOrTopic(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="All">All Weeks</option>
                    {filterMeta.weekOrTopics.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="mt-3 flex justify-end">
                  <button onClick={clearFilters} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all filters
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
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No study notes found.</p>
          <p className="text-sm text-gray-500 mb-4">
            {search || activeFilterCount > 0 ? 'Try adjusting your search or filters.' : 'Be the first to upload study notes and help your peers!'}
          </p>
          {(search || activeFilterCount > 0) && (
            <button onClick={clearFilters} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{notes.length}</span> {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, index) => {
              const uploader = note.studentId;
              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  {/* Header gradient */}
                  <div className="h-32 relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600">
                    <div className="absolute inset-0 bg-black/10" />
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-indigo-700 shadow-sm flex items-center gap-1">
                        <FileText className="w-3 h-3" /> PDF
                      </span>
                      {note.department && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-blue-700 shadow-sm">
                          {note.department}
                        </span>
                      )}
                      {note.semester && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-emerald-700 shadow-sm">
                          {note.semester}
                        </span>
                      )}
                    </div>
                    {/* Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-sm drop-shadow-lg line-clamp-2 leading-snug">{note.title}</h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Course */}
                    {(note.course || note.subject) && (
                      <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide mb-1.5">
                        {note.course || note.subject}
                      </p>
                    )}

                    {/* Week/Topic */}
                    {note.weekOrTopic && (
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {note.weekOrTopic}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">{note.description}</p>

                    {/* Uploader & Date */}
                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar src={uploader?.profilePicture} alt={uploader?.name} size={20} className="border-2 border-white shadow-sm shrink-0" />
                        <span className="text-[11px] text-gray-500 truncate">{uploader?.name || 'Student'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatDate(note.createdAt)}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Eye className="w-3 h-3" /> {note.views || 0} views
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Download className="w-3 h-3" /> {note.downloads || 0} downloads
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/dashboard/learnings/${note._id}`)}
                        className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-indigo-600 transition-colors shadow-md flex items-center justify-center gap-1.5"
                      >
                        View Note <ChevronRight className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(note)}
                        disabled={downloadingId === note._id}
                        className="py-2.5 px-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100 flex items-center justify-center"
                      >
                        {downloadingId === note._id ? (
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default LearningsPage;
