import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark, ArrowLeft, Clock, Eye, Heart, MessageCircle, Loader2, BookOpen
} from 'lucide-react';
import Avatar from './Avatar';
import axios from 'axios';

const API = 'http://localhost:5000';

const CATEGORY_COLORS = {
  'Study Tips': 'bg-emerald-100 text-emerald-700',
  'Career': 'bg-blue-100 text-blue-700',
  'Internship': 'bg-orange-100 text-orange-700',
  'Research': 'bg-purple-100 text-purple-700',
  'Programming': 'bg-cyan-100 text-cyan-700',
  'AI': 'bg-violet-100 text-violet-700',
  'Scholarship': 'bg-amber-100 text-amber-700',
  'Productivity': 'bg-teal-100 text-teal-700',
  'University Life': 'bg-pink-100 text-pink-700',
  'Project Showcase': 'bg-indigo-100 text-indigo-700',
  'Success Story': 'bg-yellow-100 text-yellow-700',
  'Events': 'bg-rose-100 text-rose-700',
  'Technology': 'bg-sky-100 text-sky-700',
  'Others': 'bg-gray-100 text-gray-700'
};

const ROLE_BADGES = {
  admin: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
  alumni: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
  student: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const SavedBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedBlogs();
  }, []);

  const fetchSavedBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/blogs/saved`, { headers: { Authorization: `Bearer ${token}` } });
      setBlogs(res.data);
    } catch (err) {
      console.error('Failed to fetch saved blogs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard/blog')}
          className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Blogs</h1>
            <p className="text-sm text-gray-500">Articles you've bookmarked for later</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No saved blogs yet.</p>
          <p className="text-sm text-gray-500">Bookmark articles to read them later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/dashboard/blog/${blog._id}`)}
              className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col"
            >
              {blog.coverImage && (
                <div className="h-40 relative overflow-hidden">
                  <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm ${CATEGORY_COLORS[blog.category] || 'bg-gray-100 text-gray-700'}`}>
                      {blog.category}
                    </span>
                  </div>
                </div>
              )}

              {!blog.coverImage && (
                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500" />
              )}

              <div className="p-5 flex-1 flex flex-col">
                {!blog.coverImage && (
                  <span className={`self-start px-2.5 py-1 rounded-lg text-[10px] font-bold mb-3 ${CATEGORY_COLORS[blog.category] || 'bg-gray-100 text-gray-700'}`}>
                    {blog.category}
                  </span>
                )}

                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-1">{blog.summary}</p>

                <div className="flex items-center gap-2 mb-3 pt-3 border-t border-gray-50">
                  <Avatar src={blog.author?.profilePicture} alt={blog.author?.name} size={24} className="border border-white shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-gray-700 truncate">{blog.author?.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${ROLE_BADGES[blog.authorRole]}`}>
                        {blog.authorRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{formatDate(blog.createdAt)}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {blog.readingTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likeCount || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {blog.commentCount || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedBlogsPage;
