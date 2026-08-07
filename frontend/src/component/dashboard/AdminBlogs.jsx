import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Heart, MessageCircle, Trash2, RefreshCw, Search, Filter,
  Plus, Pencil, Play, Pause, Star, Clock, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${status === 'draft' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
    {status === 'draft' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
    {status === 'draft' ? 'Draft' : 'Published'}
  </span>
);

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${color}`}
  >
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
    <div className="relative z-10 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-white leading-tight">{value}</p>
      </div>
    </div>
  </motion.div>
);

const AdminBlogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [counts, setCounts] = useState({ total: 0, published: 0, drafts: 0, featured: 0 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('all');

  const fetchBlogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/blogs/admin/all`, {
        headers: authHeaders(),
        params: { page: pageNum, limit: 12, search, category, status }
      });
      setBlogs(res.data.blogs || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
      setCategories(res.data.categories || []);
      setCounts(res.data.counts || { total: 0, published: 0, drafts: 0, featured: 0 });
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(1); }, [search, category, status]);

  const handleToggleFeatured = async (blog) => {
    try {
      const res = await axios.put(`${API_URL}/blogs/admin/${blog._id}`, { featured: !blog.featured }, { headers: authHeaders() });
      setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, featured: res.data.featured } : b));
      setCounts(prev => ({ ...prev, featured: prev.featured + (res.data.featured ? 1 : -1) }));
      toast.success(res.data.featured ? 'Marked as featured' : 'Removed from featured');
    } catch (err) {
      toast.error('Failed to update featured');
    }
  };

  const handleSetStatus = async (blog, nextStatus) => {
    try {
      await axios.put(`${API_URL}/blogs/admin/${blog._id}/status`, { status: nextStatus }, { headers: authHeaders() });
      setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, status: nextStatus, publishedAt: nextStatus === 'published' ? (b.publishedAt || new Date().toISOString()) : null } : b));
      setCounts(prev => ({
        ...prev,
        published: prev.published + (nextStatus === 'published' ? 1 : -1),
        drafts: prev.drafts + (nextStatus === 'draft' ? 1 : -1)
      }));
      toast.success(nextStatus === 'published' ? 'Blog published' : 'Blog moved to drafts');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog permanently? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/blogs/admin/${id}`, { headers: authHeaders() });
      toast.success('Blog deleted');
      fetchBlogs(page);
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] p-8 md:p-10"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Blog Management</h1>
            <p className="text-blue-200/80 text-sm md:text-base max-w-xl">
              Create, edit, and publish premium articles. Manage drafts, feature content, and control what the community reads.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/blogs/create')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl"
          >
            <Plus className="w-4 h-4" /> New Blog
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Articles" value={counts.total} color="from-[#1e293b] to-[#334155]" delay={0} />
        <StatCard icon={Play} label="Published" value={counts.published} color="from-emerald-600 to-teal-600" delay={0.05} />
        <StatCard icon={Pause} label="Drafts" value={counts.drafts} color="from-amber-500 to-orange-600" delay={0.1} />
        <StatCard icon={Star} label="Featured" value={counts.featured} color="from-violet-600 to-purple-600" delay={0.15} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, summary, or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 appearance-none bg-white cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <button
          onClick={() => fetchBlogs(1)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* List */}
      {loading && blogs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">No blogs found</p>
          <p className="text-gray-400 text-sm mt-1">No blogs match your current filters</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {blogs.map((blog, i) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="relative h-40 overflow-hidden">
                {blog.coverImage || blog.heroImage ? (
                  <img
                    src={blog.coverImage || blog.heroImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {blog.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={blog.status || 'published'} />
                </div>
                <button
                  onClick={() => handleToggleFeatured(blog)}
                  title={blog.featured ? 'Remove from featured' : 'Mark as featured'}
                  className={`absolute bottom-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${blog.featured ? 'bg-amber-400 text-amber-950' : 'bg-white/15 text-white hover:bg-amber-400 hover:text-amber-950'}`}
                >
                  <Star className={`w-4 h-4 ${blog.featured ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-violet-50 text-violet-600 rounded-full text-[10px] font-bold">{blog.category}</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Calendar className="w-3 h-3" /> {formatDate(blog.publishedAt || blog.createdAt)}</span>
                </div>
                <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-violet-600 transition-colors">{blog.title}</h3>
                {blog.subtitle && <p className="text-xs text-gray-500 line-clamp-1 mb-2">{blog.subtitle}</p>}
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1 leading-relaxed">{blog.summary}</p>

                <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                  <span className="flex items-center gap-1">{blog.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likeCount || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {blog.commentCount || 0}</span>
                  <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" /> {blog.readingTime}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400 truncate">by {blog.author?.name || 'Unknown'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)}
                      title="Edit"
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSetStatus(blog, blog.status === 'draft' ? 'published' : 'draft')}
                      title={blog.status === 'draft' ? 'Publish' : 'Unpublish'}
                      className={`p-2 rounded-lg transition-all ${blog.status === 'draft' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                    >
                      {blog.status === 'draft' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      title="Delete"
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchBlogs(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} of {pages}</span>
          <button
            onClick={() => fetchBlogs(page + 1)}
            disabled={page >= pages}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
