import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Search, PenTool, X, Clock, Heart, MessageCircle, Star, ChevronRight,
  ArrowUpDown, BookOpen, Loader2, ChevronDown
} from 'lucide-react';
import { API, CATEGORY_COLORS, ROLE_BADGES, formatDate } from '../component/blog/blogConfig';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const debounceRef = useRef(null);

  const fetchBlogs = useCallback(async (pageNum = 1, append = false) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      if (sort) params.set('sort', sort);
      params.set('page', pageNum);
      params.set('limit', '12');

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/api/blogs?${params.toString()}`, { headers });
      setBlogs(prev => append ? [...prev, ...res.data.blogs] : res.data.blogs);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
      if (res.data.categories) setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchBlogs(1), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchBlogs]);

  const featuredBlog = blogs.length > 0 && !search && category === 'All' ? blogs[0] : null;
  const gridBlogs = featuredBlog ? blogs.slice(1) : blogs;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1220]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] py-20 md:py-24 px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-blue-500 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-violet-200 text-xs font-semibold mb-6">
            <PenTool className="w-3.5 h-3.5" /> FrontX Blog
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-4">
            Knowledge that
            <span className="block bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">moves you forward</span>
          </h1>
          <p className="text-blue-100/80 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
            Career advice, research insights, study guides, and success stories written by the FrontX community.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles by title, tag, or topic..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-[#0d1526] border border-white/10 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-xl shadow-black/20"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            <button
              onClick={() => setCategory('All')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${category === 'All' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15'}`}
            >
              All
            </button>
            {categories.slice(0, 8).map(c => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? 'All' : c)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${category === c ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15'}`}
              >
                {c}
              </button>
            ))}
            {categories.length > 8 && (
              <div className="relative inline-flex">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 cursor-pointer focus:outline-none"
                >
                  <option value="">More...</option>
                  {categories.slice(8).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 border-0 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="most-liked">Most Liked</option>
              <option value="most-viewed">Most Viewed</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading && blogs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Featured */}
            <AnimatePresence>
              {featuredBlog && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-10"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Featured
                  </h2>
                  <Link
                    to={`/blog/${featuredBlog._id}`}
                    className="group block bg-white dark:bg-white/[0.04] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {(featuredBlog.heroImage || featuredBlog.coverImage) && (
                        <div className="lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
                          <img
                            src={featuredBlog.heroImage || featuredBlog.coverImage}
                            alt={featuredBlog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      )}
                      <div className={`p-8 flex flex-col justify-center ${(featuredBlog.heroImage || featuredBlog.coverImage) ? 'lg:w-1/2' : 'w-full'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-lg text-[11px] font-bold ${CATEGORY_COLORS[featuredBlog.category] || 'bg-gray-100 text-gray-700'}`}>
                            {featuredBlog.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-tight">
                          {featuredBlog.title}
                        </h3>
                        {featuredBlog.subtitle && <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">{featuredBlog.subtitle}</p>}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">{featuredBlog.summary}</p>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{featuredBlog.author?.name || 'FrontX'}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ROLE_BADGES[featuredBlog.authorRole] || 'bg-gray-100 text-gray-600'}`}>
                              {featuredBlog.authorRole || 'author'}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {featuredBlog.readingTime}
                          </span>
                        </div>
                        <span className="self-start inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
                          Read Article <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid */}
            {blogs.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-white/[0.03] rounded-3xl border border-gray-100 dark:border-white/10">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No articles found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try a different search or clear your filters.</p>
                <button
                  onClick={() => { setSearch(''); setCategory('All'); }}
                  className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridBlogs.map((blog, index) => (
                  <BlogCard key={blog._id} blog={blog} index={index} />
                ))}
              </div>
            )}

            {page < totalPages && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => { fetchBlogs(page + 1, true); setPage(p => p + 1); }}
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4" /> Load More
                </button>
              </div>
            )}

            <p className="text-center text-sm text-gray-400 mt-6">
              {blogs.length} of {total} articles
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const BlogCard = ({ blog, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/blog/${blog._id}`}
        className="group flex flex-col h-full bg-white dark:bg-white/[0.04] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl dark:hover:bg-white/[0.07] transition-all overflow-hidden"
      >
        <div className="h-44 relative overflow-hidden">
          {(blog.heroImage || blog.coverImage) ? (
            <img
              src={blog.heroImage || blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600/20 to-blue-600/20 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm ${CATEGORY_COLORS[blog.category] || 'bg-gray-100 text-gray-700'}`}>
              {blog.category}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug">
            {blog.title}
          </h3>
          {blog.subtitle && <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1 line-clamp-1">{blog.subtitle}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed flex-1">{blog.summary}</p>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-white/5">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate">{blog.author?.name || 'FrontX'}</p>
              <p className="text-[10px] text-gray-400">{formatDate(blog.publishedAt || blog.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] text-gray-400">
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {blog.readingTime}</span>
              <span className="flex items-center gap-0.5">{blog.views || 0}</span>
              <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {blog.likeCount || 0}</span>
              <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {blog.commentCount || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Blog;
