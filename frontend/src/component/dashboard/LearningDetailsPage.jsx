import { API_URL } from '../../config/api';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Calendar, User, Eye, BookOpen, Building2, GraduationCap, Clock, ExternalLink, Loader } from 'lucide-react';
import axios from 'axios';
import Avatar from './Avatar';

const API = API_URL;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const LearningDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchNote();
  }, [id]);

  useEffect(() => {
    if (note && !loading) {
      incrementViews();
    }
  }, [note, loading]);

  const fetchNote = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNote(res.data);
    } catch (err) {
      console.error("Failed to fetch note details", err);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/notes/${id}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNote(prev => ({ ...prev, views: (prev.views || 0) + 1 }));
    } catch (err) {
      console.error("Failed to track view", err);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/notes/${id}/download`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNote(prev => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
      window.open(note.pdfUrl, '_blank');
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Note not found.</p>
          <button onClick={() => navigate('/dashboard/learnings')} className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Learning
          </button>
        </div>
      </div>
    );
  }

  const uploader = note.studentId;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      {/* Back */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard/learnings')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Learning
      </motion.button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-500 to-blue-600 shadow-xl mb-8">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10 flex items-center gap-1">
              <FileText className="w-3 h-3" /> PDF Note
            </span>
            {note.department && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10">
                {note.department}
              </span>
            )}
            {note.semester && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10">
                {note.semester}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm mb-2">{note.title}</h1>
          {(note.course || note.subject) && (
            <p className="text-blue-100/80 text-sm font-medium">{note.course || note.subject}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{note.description}</p>
          </div>

          {/* Week / Topic */}
          {note.weekOrTopic && (
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Week / Topic</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100">
                <Clock className="w-3 h-3" /> {note.weekOrTopic}
              </span>
            </div>
          )}

          {/* Download Section */}
          {note.pdfUrl && (
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Access Note</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={note.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" /> Open in New Tab
                </motion.a>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-md disabled:opacity-50"
                >
                  {downloading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Uploader Info */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Uploaded By</h3>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={uploader?.profilePicture} alt={uploader?.name} size={40} className="border-2 border-white shadow-sm" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{uploader?.name || 'Student'}</p>
                {uploader?.department && (
                  <p className="text-[11px] text-gray-500">{uploader.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Type</p>
                  <p className="text-sm font-medium text-gray-900">Study Note (PDF)</p>
                </div>
              </div>
              {note.department && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Department</p>
                    <p className="text-sm font-medium text-gray-900">{note.department}</p>
                  </div>
                </div>
              )}
              {note.course && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Course</p>
                    <p className="text-sm font-medium text-gray-900">{note.course}</p>
                  </div>
                </div>
              )}
              {note.semester && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Semester</p>
                    <p className="text-sm font-medium text-gray-900">{note.semester}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Uploaded On</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(note.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4 text-gray-400" /> Views
                </span>
                <span className="text-sm font-bold text-gray-900">{note.views || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Download className="w-4 h-4 text-gray-400" /> Downloads
                </span>
                <span className="text-sm font-bold text-gray-900">{note.downloads || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningDetailsPage;
