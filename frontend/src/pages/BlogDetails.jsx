import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Clock, Eye, Heart, MessageCircle, Bookmark, Share2, Send,
  Loader2, Trash2, Edit3, Reply, ChevronDown, ListOrdered, LogIn
} from 'lucide-react';
import { API, CATEGORY_COLORS, ROLE_BADGES, formatDate, slugify } from '../component/blog/blogConfig';
import RichContentRenderer, { extractHeadings, blogReadingTime } from '../component/blog/richContent';

const TOKEN = () => localStorage.getItem('token');

const Avatar = ({ src, name, size = 40 }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return src ? (
    <img src={src} alt={name} className="rounded-full object-cover border-2 border-white dark:border-white/10 shadow-sm shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div
      className="rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white flex items-center justify-center font-bold border-2 border-white dark:border-white/10 shadow-sm shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
};

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const bodyRef = useRef(null);

  const token = TOKEN();

  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [blogRes, commentsRes, recRes] = await Promise.all([
          axios.get(`${API}/api/blogs/${id}`, { headers }),
          axios.get(`${API}/api/blogs/${id}/comments`, { headers }),
          axios.get(`${API}/api/blogs/${id}/recommended`, { headers })
        ]);
        const b = blogRes.data;
        setBlog(b);
        setIsLiked(!!b.isLiked);
        setIsBookmarked(!!b.isBookmarked);
        setLikeCount(b.likeCount || 0);
        setComments(commentsRes.data || []);
        setRecommended(recRes.data || []);
        if (token) {
          axios.get(`${API}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setCurrentUser(res.data))
            .catch(() => {});
        }
      } catch (err) {
        toast.error('Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, token]);

  const toc = useMemo(() => {
    if (Array.isArray(blog?.contentJson) && blog.contentJson.length) {
      return extractHeadings(blog.contentJson);
    }
    if (!blog?.sections) return [];
    return blog.sections
      .filter(s => s.type === 'heading' && s.heading && s.level >= 2)
      .map(s => ({ id: slugify(s.heading), text: s.heading, level: s.level }));
  }, [blog]);

  const scrollSpy = useCallback(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveHeading(entry.target.id);
        });
      },
      { rootMargin: '-25% 0px -70% 0px' }
    );
    toc.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  useEffect(() => {
    if (!loading && toc.length) return scrollSpy();
  }, [loading, toc, scrollSpy]);

  const requireAuth = () => {
    if (!token) {
      toast.error('Please log in to continue');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    try {
      const res = await axios.post(`${API}/api/blogs/${id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth()) return;
    try {
      const res = await axios.post(`${API}/api/blogs/${id}/bookmark`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch (err) {
      toast.error('Failed to bookmark');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      if (token) {
        axios.post(`${API}/api/blogs/${id}/share`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B1220] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B1220] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article not found</p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">This article may have been moved or removed.</p>
        <Link to="/blog" className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-xl text-sm font-semibold">
          Back to Blog
        </Link>
      </div>
    );
  }

  const heroSrc = blog.heroImage || blog.coverImage;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1220]">
      {/* Back bar */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        {heroSrc ? (
          <div className="relative rounded-3xl overflow-hidden">
            <img src={heroSrc} alt={blog.title} className="w-full h-64 md:h-[440px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 ${CATEGORY_COLORS[blog.category] || 'bg-gray-100 text-gray-700'}`}>
                {blog.category}
              </span>
              <h1 className="text-2xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">{blog.title}</h1>
              {blog.subtitle && <p className="text-base md:text-lg text-white/80 mt-3">{blog.subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="pt-6 md:pt-10">
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 ${CATEGORY_COLORS[blog.category] || 'bg-gray-100 text-gray-700'}`}>
              {blog.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">{blog.title}</h1>
            {blog.subtitle && <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mt-3">{blog.subtitle}</p>}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Avatar src={blog.author?.profilePicture} name={blog.author?.name} size={44} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{blog.author?.name || 'FrontX'}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ROLE_BADGES[blog.authorRole] || 'bg-gray-100 text-gray-600'}`}>
                  {blog.authorRole || 'author'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blogReadingTime(blog)}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views} views</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isLiked ? 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500'}`}>
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {likeCount}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleBookmark}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isBookmarked ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-gray-50 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-500'}`}>
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-500 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </motion.button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10">
        <article ref={bodyRef} className="min-w-0">
          {/* Mobile TOC */}
          {toc.length > 0 && (
            <div className="lg:hidden mb-8">
              <button
                onClick={() => setTocOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <span className="flex items-center gap-2"><ListOrdered className="w-4 h-4 text-violet-500" /> Table of Contents</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
              </button>
              {tocOpen && (
                <div className="mt-2 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4">
                  <TocList toc={toc} activeHeading={activeHeading} onSelect={() => setTocOpen(false)} />
                </div>
              )}
            </div>
          )}

          {/* Rich content (TipTap JSON → legacy sections → legacy HTML) */}
          <RichContentRenderer blog={blog} />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100 dark:border-white/10">
              {blog.tags.map((tag, i) => (
                <span key={i} className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg">#{tag}</span>
              ))}
            </div>
          )}

          {/* Author card */}
          <div className="mt-8 flex items-center gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/10">
            <Avatar src={blog.author?.profilePicture} name={blog.author?.name} size={56} />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Written by {blog.author?.name || 'FrontX'}</p>
              {blog.author?.role && (
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ROLE_BADGES[blog.authorRole] || 'bg-gray-100 text-gray-600'}`}>
                  {blog.authorRole}
                </span>
              )}
              {blog.author?.bio && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{blog.author.bio}</p>}
            </div>
          </div>

          {/* Comments */}
          <CommentsSection
            blogId={id}
            blog={blog}
            comments={comments}
            setComments={setComments}
            currentUser={currentUser}
            token={token}
          />
        </article>

        {/* Desktop TOC */}
        <aside className="hidden lg:block">
          {toc.length > 0 && (
            <div className="sticky top-8">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-violet-500" /> On this page
              </p>
              <nav className="bg-white dark:bg-white/[0.04] rounded-2xl border border-gray-100 dark:border-white/10 p-5 max-h-[70vh] overflow-y-auto">
                <TocList toc={toc} activeHeading={activeHeading} />
              </nav>
            </div>
          )}
        </aside>
      </div>

      {/* Related */}
      {recommended.length > 0 && (
        <div className="border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommended.map((rec, i) => (
                <Link
                  key={rec._id}
                  to={`/blog/${rec._id}`}
                  className="group bg-white dark:bg-white/[0.04] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all"
                >
                  {(rec.heroImage || rec.coverImage) && (
                    <div className="h-32 overflow-hidden">
                      <img src={rec.heroImage || rec.coverImage} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${CATEGORY_COLORS[rec.category] || 'bg-gray-100 text-gray-700'}`}>
                      {rec.category}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{rec.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{rec.author?.name || 'FrontX'}</span>
                      <span>&middot;</span>
                      <span>{formatDate(rec.publishedAt || rec.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TocList = ({ toc, activeHeading, onSelect }) => (
  <ul className="space-y-1">
    {toc.map(item => (
      <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
        <a
          href={`#${item.id}`}
          onClick={onSelect}
          className={`block px-3 py-1.5 rounded-lg text-[13px] leading-snug transition-all ${
            activeHeading === item.id
              ? 'bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 font-semibold'
              : 'text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400'
          }`}
        >
          {item.text}
        </a>
      </li>
    ))}
  </ul>
);

const CommentsSection = ({ blogId, blog, comments, setComments, currentUser, token }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const handleAddComment = async () => {
    if (!token) return toast.error('Please log in to comment');
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/blogs/${blogId}/comments`, { content: commentText.trim() }, { headers: authHeaders() });
      setComments(prev => [{ ...res.data, replies: [] }, ...prev]);
      setCommentText('');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!token) return toast.error('Please log in to reply');
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await axios.post(`${API}/api/blogs/${blogId}/comments`, { content: replyText.trim(), parentComment: commentId }, { headers: authHeaders() });
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, replies: [...(c.replies || []), res.data] } : c));
      setReplyText('');
      setReplyTo(null);
    } catch (err) {
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditComment = async (commentId, parentCommentId) => {
    if (!editText.trim()) return;
    try {
      const res = await axios.put(`${API}/api/blogs/${blogId}/comments/${commentId}`, { content: editText.trim() }, { headers: authHeaders() });
      if (parentCommentId) {
        setComments(prev => prev.map(c => c._id === parentCommentId ? { ...c, replies: c.replies.map(r => r._id === commentId ? res.data : r) } : c));
      } else {
        setComments(prev => prev.map(c => c._id === commentId ? res.data : c));
      }
      setEditingId(null);
      setEditText('');
    } catch (err) {
      toast.error('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId, parentCommentId) => {
    try {
      await axios.delete(`${API}/api/blogs/${blogId}/comments/${commentId}`, { headers: authHeaders() });
      if (parentCommentId) {
        setComments(prev => prev.map(c => c._id === parentCommentId ? { ...c, replies: c.replies.filter(r => r._id !== commentId) } : c));
      } else {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleCommentLike = async (commentId, parentCommentId) => {
    if (!token) return toast.error('Please log in to like');
    try {
      const res = await axios.post(`${API}/api/blogs/${blogId}/comments/${commentId}/like`, {}, { headers: authHeaders() });
      const updater = c => c._id === commentId ? { ...c, likeCount: res.data.likeCount, liked: res.data.liked } : c;
      if (parentCommentId) {
        setComments(prev => prev.map(c => c._id === parentCommentId ? { ...c, replies: c.replies.map(updater) } : c));
      } else {
        setComments(prev => prev.map(updater));
      }
    } catch (err) {
      toast.error('Failed to like comment');
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-gray-100 dark:border-white/10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-violet-500" /> Comments ({comments.length})
      </h2>

      {!token ? (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 mb-6">
          <LogIn className="w-5 h-5 text-violet-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <Link to="/login" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">Log in</Link> to join the conversation.
          </p>
        </div>
      ) : (
        <div className="flex gap-3 mb-6">
          <Avatar src={currentUser?.profilePicture} name={currentUser?.name} size={36} />
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || submitting}
                className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-xl text-sm font-semibold hover:bg-violet-600 dark:hover:bg-violet-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Post
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        )}
        {comments.map(comment => (
          <CommentItem
            key={comment._id}
            comment={comment}
            currentUser={currentUser}
            token={token}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyText={replyText}
            setReplyText={setReplyText}
            submittingReply={submittingReply}
            handleReply={handleReply}
            editingId={editingId}
            setEditingId={setEditingId}
            editText={editText}
            setEditText={setEditText}
            handleEditComment={handleEditComment}
            handleDeleteComment={handleDeleteComment}
            handleCommentLike={handleCommentLike}
          />
        ))}
      </div>
    </div>
  );
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const CommentItem = ({
  comment, currentUser, token, replyTo, setReplyTo, replyText, setReplyText,
  submittingReply, handleReply, editingId, setEditingId, editText, setEditText,
  handleEditComment, handleDeleteComment, handleCommentLike
}) => {
  const isOwner = currentUser && comment.author?._id === currentUser._id;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10">
      <div className="flex gap-3">
        <Avatar src={comment.author?.profilePicture} name={comment.author?.name} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-bold text-gray-900 dark:text-white">{comment.author?.name || 'User'}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${ROLE_BADGES[comment.authorRole] || 'bg-gray-100 text-gray-600'}`}>
              {comment.authorRole || 'member'}
            </span>
            <span className="text-[11px] text-gray-500">{timeAgo(comment.createdAt)}</span>
          </div>

          {editingId === comment._id ? (
            <div className="mt-2">
              <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={2}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" />
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEditComment(comment._id)} className="px-3 py-1 bg-violet-600 text-white rounded-lg text-xs font-semibold">Save</button>
                <button onClick={() => { setEditingId(null); setEditText(''); }} className="px-3 py-1 text-gray-500 text-xs font-medium">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-1">{comment.content}</p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => handleCommentLike(comment._id)}
              className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${comment.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}>
              <Heart className={`w-3 h-3 ${comment.liked ? 'fill-current' : ''}`} /> {comment.likeCount || 0}
            </button>
            {token && (
              <button onClick={() => { setReplyTo(replyTo === comment._id ? null : comment._id); setReplyText(''); }}
                className="text-[11px] font-medium text-gray-500 hover:text-violet-500 flex items-center gap-1 transition-colors">
                <Reply className="w-3 h-3" /> Reply
              </button>
            )}
            {isOwner && (
              <>
                <button onClick={() => { setEditingId(comment._id); setEditText(comment.content); }} className="text-[11px] font-medium text-gray-500 hover:text-blue-500 flex items-center gap-1 transition-colors">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDeleteComment(comment._id)} className="text-[11px] font-medium text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </>
            )}
          </div>

          {replyTo === comment._id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleReply(comment._id); }}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <button onClick={() => handleReply(comment._id)} disabled={!replyText.trim() || submittingReply}
                className="px-3 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-2 pl-3 border-l-2 border-violet-100 dark:border-violet-500/20 space-y-3">
              {comment.replies.map(reply => {
                const isReplyOwner = currentUser && reply.author?._id === currentUser._id;
                return (
                  <div key={reply._id} className="flex gap-2">
                    <Avatar src={reply.author?.profilePicture} name={reply.author?.name} size={24} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{reply.author?.name || 'User'}</span>
                        <span className={`px-1 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider ${ROLE_BADGES[reply.authorRole] || 'bg-gray-100 text-gray-600'}`}>
                          {reply.authorRole || 'member'}
                        </span>
                        <span className="text-[10px] text-gray-500">{timeAgo(reply.createdAt)}</span>
                      </div>
                      {editingId === reply._id ? (
                        <div className="mt-1">
                          <input value={editText} onChange={e => setEditText(e.target.value)}
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => handleEditComment(reply._id, comment._id)} className="px-2 py-0.5 bg-violet-600 text-white rounded text-[10px] font-semibold">Save</button>
                            <button onClick={() => { setEditingId(null); setEditText(''); }} className="text-[10px] text-gray-500">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-700 dark:text-gray-300">{reply.content}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <button onClick={() => handleCommentLike(reply._id, comment._id)} className={`text-[10px] font-medium flex items-center gap-0.5 ${reply.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}>
                          <Heart className={`w-2.5 h-2.5 ${reply.liked ? 'fill-current' : ''}`} /> {reply.likeCount || 0}
                        </button>
                        {isReplyOwner && (
                          <>
                            <button onClick={() => { setEditingId(reply._id); setEditText(reply.content); }} className="text-[10px] text-gray-500 hover:text-blue-500">Edit</button>
                            <button onClick={() => handleDeleteComment(reply._id, comment._id)} className="text-[10px] text-gray-500 hover:text-red-500">Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
