import { API_URL } from '../../config/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Search, SlidersHorizontal, ChevronDown, X, Clock,
  Heart, MessageCircle, Bookmark, ArrowUpDown, Tag, User,
  Loader2, BookOpen, Star, ChevronRight, Flame
} from 'lucide-react';
import Avatar from './Avatar';
import axios from 'axios';

const API = API_URL;

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

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [authorRole, setAuthorRole] = useState('All');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const fetchBlogs = useCallback(async (pageNum = 1, append = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      if (authorRole !== 'All') params.set('authorRole', authorRole);
      if (sort) params.set('sort', sort);
      params.set('page', pageNum);
      params.set('limit', '12');

      const res = await axios.get(`${API}/api/blogs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (append) {
        setBlogs(prev => [...prev, ...res.data.blogs]);
      } else {
        setBlogs(res.data.blogs);
      }
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
      if (res.data.categories) setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, authorRole, sort]);

  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBlogs(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchBlogs]);

  const handleLoadMore = () => {
    fetchBlogs(page + 1, true);
    setPage(p => p + 1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setAuthorRole('All');
    setSort('latest');
  };

  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const gridBlogs = blogs.length > 0 ? blogs.slice(1) : [];

  const activeFilterCount = [category !== 'All', authorRole !== 'All'].filter(Boolean).length;

  if (loading && blogs.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
          </div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/20">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Blog</h1>
          </div>
        </div>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 mb-8 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] shadow-2xl shadow-slate-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-transparent to-white/[0.03] animate-[shimmer_8s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Blog</h1>
            <p className="text-blue-100/80 max-w-xl leading-relaxed">
              Share knowledge, career experiences, research insights, and inspiring stories with the Frontx community. Help students and fellow alumni learn through your expertise.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard/blog/create')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0"
          >
            <PenTool className="w-4 h-4" /> Create Blog
          </motion.button>
        </div>
      </div>

      {/* Search, Filters, Sort */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, tags, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="All">All Authors</option>
              <option value="admin">Admin</option>
              <option value="alumni">Alumni</option>
              <option value="student">Student</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none appearance-none cursor-pointer min-w-[150px]"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="most-liked">Most Liked</option>
              <option value="most-viewed">Most Viewed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Featured Blog */}
      {featuredBlog && !search && category === 'All' && authorRole === 'All' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Featured Article
          </h2>
          <div
            onClick={() => navigate(`/dashboard/blog/${featuredBlog._id}`)}
            className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
          >
            <div className="flex flex-col lg:flex-row">
              {featuredBlog.coverImage && (
                <div className="lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
                  <img src={featuredBlog.coverImage} alt={featuredBlog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}
              <div className={`p-8 flex flex-col justify-center ${featuredBlog.coverImage ? 'lg:w-1/2' : 'w-full'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-[11px] font-bold ${CATEGORY_COLORS[featuredBlog.category] || 'bg-gray-100 text-gray-700'}`}>
                    {featuredBlog.category}
                  </span>
                  {featuredBlog.isPinned && (
                    <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors leading-tight">
                  {featuredBlog.title}
                </h2>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{featuredBlog.summary}</p>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={featuredBlog.author?.profilePicture} alt={featuredBlog.author?.name} size={32} className="border-2 border-white shadow-sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{featuredBlog.author?.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ROLE_BADGES[featuredBlog.authorRole]}`}>
                        {featuredBlog.authorRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>{formatDate(featuredBlog.createdAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredBlog.readingTime}</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className="self-start px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Read Article <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          Showing <span className="font-semibold text-gray-700">{blogs.length}</span> of {total} articles
        </p>
      )}

      {/* Blog Grid */}
      {blogs.length === 0 && !loading ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No blogs found.</p>
          <p className="text-sm text-gray-500 mb-4">
            {search || category !== 'All' || authorRole !== 'All'
              ? 'Try adjusting your search or filters.'
              : 'Be the first to share your knowledge with the community!'}
          </p>
          {(search || category !== 'All' || authorRole !== 'All') && (
            <button onClick={clearFilters} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {((search || category !== 'All' || authorRole !== 'All') ? blogs : gridBlogs).map((blog, index) => (
            <BlogCard key={blog._id} blog={blog} index={index} navigate={navigate} />
          ))}
        </div>
      )}

      {/* Load More */}
      {page < totalPages && (
        <div className="flex justify-center mt-10">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLoadMore}
            className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 hover:text-purple-700 transition-all flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4" /> Load More
          </motion.button>
        </div>
      )}

      {/* Floating Buttons */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard/blog/saved')}
        className="fixed bottom-24 right-8 z-40 px-5 py-3 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 hover:border-amber-300 hover:text-amber-600"
      >
        <Bookmark className="w-5 h-5" /> Saved
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard/blog/create')}
        className="fixed bottom-8 right-8 z-40 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
      >
        <PenTool className="w-5 h-5" /> Create Blog
      </motion.button>
    </div>
  );
};

const BlogCard = ({ blog, index, navigate }) => {
  const [isBookmarked, setIsBookmarked] = useState(blog.isBookmarked);
  const [isLiked, setIsLiked] = useState(blog.isLiked);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/blogs/${blog._id}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error('Bookmark failed', err);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/blogs/${blog._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLiked(res.data.liked);
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/dashboard/blog/${blog._id}`)}
      className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col"
    >
      {blog.coverImage && (
        <div className="h-44 relative overflow-hidden">
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
        <div className="h-3 relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500" />
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

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author */}
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

        {/* Stats */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /></span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {blog.commentCount || 0}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              isLiked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} /> Like
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBookmark}
            className={`p-2 rounded-xl text-xs transition-all ${
              isBookmarked ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-amber-50 hover:text-amber-500'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/blog/${blog._id}`); }}
            className="py-2 px-3 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-purple-600 transition-colors shadow-md"
          >
            Read
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogPage;
