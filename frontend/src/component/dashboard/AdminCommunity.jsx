import { API_BASE } from '../../config/api';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Search, Trash2, MessageCircle, ChevronDown, ChevronUp,
  Filter, AlertTriangle, Heart, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';

const API_URL = API_BASE;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const CATEGORIES = [
  'All', 'General Discussion', 'Career Guidance', 'Project Collaboration',
  'Study Resources', 'Alumni Network', 'Industry Insights', 'Q&A',
  'Events & Meetups', 'Internship Tips', 'Freelancing', 'Research',
];

const DarkGlassCard = ({ children, className = '', hoverEffect = false, delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    custom={delay}
    whileHover={hoverEffect ? { y: -2 } : undefined}
    className={`relative overflow-hidden rounded-2xl p-[1px] ${className}`}
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07]" />
    <div
      className="relative rounded-[calc(1rem-1px)] p-6 h-full"
      style={{
        background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(1rem-1px)]">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            background: 'linear-gradient(115deg, transparent 20%, rgba(148,163,184,0.5) 40%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 60%, transparent 80%)',
            backgroundSize: '250% 100%',
            animation: 'shimmerSweep 8s ease-in-out infinite',
          }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  </motion.div>
);

const SectionHeading = ({ children, subtitle, delay = 0, right }) => (
  <motion.div variants={fadeUp} custom={delay} className="flex items-end justify-between flex-wrap gap-4">
    <div>
      <h1 className="text-[30px] font-[800] tracking-[-0.025em] leading-tight" style={{ color: '#1E293B' }}>{children}</h1>
      {subtitle && <p className="text-[16px] font-normal mt-2 leading-[1.6]" style={{ color: '#475569' }}>{subtitle}</p>}
    </div>
    {right}
  </motion.div>
);

const AdminCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteCommentModal, setDeleteCommentModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      const res = await axios.get(`${API_URL}/admin/community-posts?${params}`);
      setPosts(res.data.posts);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDeletePost = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/admin/community-posts/${deleteModal._id}`);
      setPosts(prev => prev.filter(p => p._id !== deleteModal._id));
      setTotal(prev => prev - 1);
      setDeleteModal(null);
      if (expandedPost === deleteModal._id) setExpandedPost(null);
    } catch (err) { console.error('Delete failed:', err); }
    finally { setDeleting(false); }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentModal) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/admin/community-posts/${deleteCommentModal.postId}/comments/${deleteCommentModal.commentId}`);
      setPosts(prev => prev.map(p => {
        if (p._id === deleteCommentModal.postId) {
          return { ...p, comments: p.comments.filter(c => c._id !== deleteCommentModal.commentId), commentCount: p.commentCount - 1 };
        }
        return p;
      }));
      setDeleteCommentModal(null);
    } catch (err) { console.error('Delete comment failed:', err); }
    finally { setDeleting(false); }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-8">

        <SectionHeading
          subtitle={`${total} total posts · Manage content and comments`}
          delay={0}
          right={
            <button onClick={fetchPosts} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          }
        >
          Community Moderation
        </SectionHeading>

        {/* Filters */}
        <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts by content or title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="appearance-none pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer shadow-sm transition-all"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No posts found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <DarkGlassCard key={post._id} delay={i} hoverEffect>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {post.isAnonymous ? (
                        <div className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600/30 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">?</div>
                      ) : post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/[0.08] shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/25 to-indigo-500/15 border border-blue-500/15 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
                          {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate">{post.authorName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">{post.authorRole}</span>
                          {post.authorDepartment && <span className="text-[10px] text-slate-500">· {post.authorDepartment}</span>}
                          <span className="text-[10px] text-slate-500">· {formatTime(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-300 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg border border-white/[0.06] transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {post.commentCount}
                        {expandedPost === post._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => setDeleteModal(post)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-red-400 bg-red-500/[0.08] hover:bg-red-500/[0.15] rounded-lg border border-red-500/15 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {post.title && <h3 className="text-[14px] font-semibold text-white mt-3.5">{post.title}</h3>}
                  <p className="text-[13px] text-slate-300 mt-2.5 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="mt-3 rounded-xl max-h-48 object-cover border border-white/[0.06]" />
                  )}

                  <div className="flex items-center gap-2.5 mt-3.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/10 tracking-wider">
                      {post.category}
                    </span>
                    {post.tags?.map((tag, ti) => (
                      <span key={ti} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.05]">
                        #{tag}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {post.reactionCount}
                    </span>
                    {post.isAnonymous && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/10 font-medium">Anonymous</span>
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedPost === post._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Comments ({post.comments?.length || 0})
                          </p>
                          {!post.comments?.length ? (
                            <p className="text-xs text-slate-600 py-3 text-center">No comments on this post.</p>
                          ) : (
                            post.comments.map((comment) => (
                              <div key={comment._id} className="flex items-start gap-3 py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                                {comment.authorAvatar ? (
                                  <img src={comment.authorAvatar} alt="" className="w-7 h-7 rounded-lg object-cover border border-white/[0.06] shrink-0" />
                                ) : (
                                  <div className="w-7 h-7 rounded-lg bg-slate-700/50 border border-slate-600/30 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                                    {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[12px] font-semibold text-white">{comment.authorName}</p>
                                    <span className="text-[10px] text-slate-600">{formatTime(comment.createdAt)}</span>
                                    {comment.isAnonymous && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-medium">Anon</span>
                                    )}
                                  </div>
                                  <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">{comment.content}</p>
                                </div>
                                <button
                                  onClick={() => setDeleteCommentModal({ postId: post._id, commentId: comment._id, authorName: comment.authorName })}
                                  className="shrink-0 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </DarkGlassCard>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-500">
              Page <span className="font-bold text-slate-800">{page}</span> of {pages}
            </span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Post Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl p-[1px] overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/30 via-red-400/10 to-red-500/20" />
              <div className="relative rounded-[calc(1rem-1px)] p-6 bg-slate-900 border border-red-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Post</h3>
                    <p className="text-xs text-slate-400">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-1">
                  <span className="font-semibold text-white">{deleteModal.authorName}</span>'s post will be permanently removed along with all its comments and reactions.
                </p>
                <p className="text-xs text-slate-500 mb-5 line-clamp-2">"{deleteModal.content?.substring(0, 100)}..."</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(null)} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleDeletePost} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete Post</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Comment Modal */}
      <AnimatePresence>
        {deleteCommentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteCommentModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl p-[1px] overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/30 via-orange-400/10 to-orange-500/20" />
              <div className="relative rounded-[calc(1rem-1px)] p-6 bg-slate-900 border border-orange-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Comment</h3>
                    <p className="text-xs text-slate-400">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-5">
                  Comment by <span className="font-semibold text-white">{deleteCommentModal.authorName}</span> will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteCommentModal(null)} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleDeleteComment} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete Comment</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmerSweep {
          0%, 100% { background-position: -250% 0; }
          50% { background-position: 250% 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default AdminCommunity;
