import { API_URL } from '../../config/api';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Eye, Heart, MessageCircle, Bookmark, Share2,
  Send, Loader2, Trash2, Edit3, Reply, ChevronDown
} from 'lucide-react';
import Avatar from './Avatar';
import axios from 'axios';
import toast from 'react-hot-toast';
import RichContentRenderer, { blogReadingTime } from '../blog/richContent';

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

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const BlogDetailsPage = () => {
  const location = useLocation();
  const { id } = useParams();
  const blogId = id || location.pathname.split('/')[3];
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [recommended, setRecommended] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchBlog();
    fetchComments();
    fetchRecommended();
    fetchCurrentUser();
  }, [blogId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const fetchBlog = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/blogs/${blogId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBlog(res.data);
      setIsLiked(res.data.isLiked);
      setIsBookmarked(res.data.isBookmarked);
      setLikeCount(res.data.likeCount);
    } catch (err) {
      toast.error('Failed to load blog');
      navigate('/dashboard/blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/blogs/${blogId}/comments`, { headers: { Authorization: `Bearer ${token}` } });
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  const fetchRecommended = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/blogs/${blogId}/recommended`, { headers: { Authorization: `Bearer ${token}` } });
      setRecommended(res.data);
    } catch (err) {
      console.error('Failed to fetch recommended', err);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/blogs/${blogId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/blogs/${blogId}/bookmark`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch (err) {
      toast.error('Failed to bookmark');
    }
  };

  const handleShare = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/blogs/${blogId}/share`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Link copied!');
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/blogs/${blogId}/comments`, {
        content: commentText.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => [{ ...res.data, replies: [] }, ...prev]);
      setCommentText('');
      setBlog(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev);
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/blogs/${blogId}/comments`, {
        content: replyText.trim(),
        parentComment: commentId
      }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => prev.map(c => {
        if (c._id === commentId) return { ...c, replies: [...(c.replies || []), res.data] };
        return c;
      }));
      setReplyText('');
      setReplyTo(null);
      setBlog(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev);
    } catch (err) {
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditComment = async (commentId, parentCommentId) => {
    if (!editText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API}/api/blogs/${blogId}/comments/${commentId}`, {
        content: editText.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (parentCommentId) {
        setComments(prev => prev.map(c => {
          if (c._id === parentCommentId) {
            return { ...c, replies: c.replies.map(r => r._id === commentId ? res.data : r) };
          }
          return c;
        }));
      } else {
        setComments(prev => prev.map(c => c._id === commentId ? { ...c, content: res.data.content } : c));
      }
      setEditingComment(null);
      setEditText('');
    } catch (err) {
      toast.error('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId, parentCommentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/blogs/${blogId}/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (parentCommentId) {
        setComments(prev => prev.map(c => {
          if (c._id === parentCommentId) {
            return { ...c, replies: c.replies.filter(r => r._id !== commentId) };
          }
          return c;
        }));
      } else {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
      setBlog(prev => prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) } : prev);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleCommentLike = async (commentId, parentCommentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/blogs/${blogId}/comments/${commentId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const updater = (c) => c._id === commentId ? { ...c, likeCount: res.data.likeCount, liked: res.data.liked } : c;
      if (parentCommentId) {
        setComments(prev => prev.map(c => c._id === parentCommentId ? { ...c, replies: c.replies.map(updater) } : c));
      } else {
        setComments(prev => prev.map(updater));
      }
    } catch (err) {
      console.error('Comment like failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      {/* Back Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard/blog')}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-purple-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </motion.button>

      {/* Cover Image */}
      {blog.coverImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl overflow-hidden shadow-xl"
        >
          <img src={blog.coverImage} alt={blog.title} className="w-full h-72 md:h-96 object-cover" />
        </motion.div>
      )}

      {/* Meta */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${CATEGORY_COLORS[blog.category] || 'bg-gray-100 text-gray-700'}`}>
            {blog.category}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Eye className="w-3 h-3" /> {blog.views} views
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{blog.title}</h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar src={blog.author?.profilePicture} alt={blog.author?.name} size={44} className="border-2 border-white shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{blog.author?.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGES[blog.authorRole]}`}>
                {blog.authorRole}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {blog.author?.department && <span>{blog.author.department}</span>}
              <span>{formatDate(blog.createdAt)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blogReadingTime(blog)}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag, i) => (
              <span key={i} className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">#{tag}</span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="bg-white/50 dark:bg-[#0B1220]/70 backdrop-blur-md rounded-2xl border border-white/50 dark:border-white/10 shadow-sm p-8 mb-8">
          <RichContentRenderer blog={blog} />
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3 mb-12 pb-8 border-b border-gray-100">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isLiked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {likeCount} Likes
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isBookmarked ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-amber-50 hover:text-amber-500'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} /> {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 text-gray-500 border border-gray-100 hover:bg-blue-50 hover:text-blue-500 transition-all"
          >
            <Share2 className="w-4 h-4" /> Share
          </motion.button>
        </div>

        {/* Comment Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" /> Comments ({blog.commentCount || 0})
          </h2>

          {/* Add Comment */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-5 mb-6">
            <div className="flex gap-3">
              <Avatar src={currentUser?.profilePicture} alt={currentUser?.name} size={36} className="border border-white shadow-sm shrink-0 mt-1" />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none resize-none"
                />
                <div className="flex justify-end mt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || submittingComment}
                    className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Post Comment
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUser={currentUser}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyText={replyText}
                setReplyText={setReplyText}
                submittingReply={submittingReply}
                handleReply={handleReply}
                editingComment={editingComment}
                setEditingComment={setEditingComment}
                editText={editText}
                setEditText={setEditText}
                handleEditComment={handleEditComment}
                handleDeleteComment={handleDeleteComment}
                handleCommentLike={handleCommentLike}
              />
            ))}
            {comments.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>

        {/* Recommended Blogs */}
        {recommended.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommended.map((rec) => (
                <motion.div
                  key={rec._id}
                  whileHover={{ y: -3 }}
                  onClick={() => { navigate(`/dashboard/blog/${rec._id}`); window.scrollTo(0, 0); }}
                  className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                >
                  {rec.coverImage && (
                    <div className="h-32 overflow-hidden">
                      <img src={rec.coverImage} alt={rec.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${CATEGORY_COLORS[rec.category] || 'bg-gray-100 text-gray-700'}`}>
                      {rec.category}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2">{rec.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{rec.author?.name}</span>
                      <span>&middot;</span>
                      <span>{formatDate(rec.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const CommentItem = ({
  comment, currentUser, replyTo, setReplyTo, replyText, setReplyText,
  submittingReply, handleReply, editingComment, setEditingComment,
  editText, setEditText, handleEditComment, handleDeleteComment, handleCommentLike
}) => {
  const isOwner = currentUser && comment.author?._id === currentUser._id;

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-5">
      <div className="flex gap-3">
        <Avatar src={comment.author?.profilePicture} alt={comment.author?.name} size={32} className="border border-white shadow-sm shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-900">{comment.author?.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${ROLE_BADGES[comment.authorRole]}`}>
              {comment.authorRole}
            </span>
            <span className="text-[11px] text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          {editingComment === comment._id ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEditComment(comment._id)} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold">Save</button>
                <button onClick={() => { setEditingComment(null); setEditText(''); }} className="px-3 py-1 text-gray-500 text-xs font-medium">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed mt-1">{comment.content}</p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => handleCommentLike(comment._id)}
              className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                comment.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
              }`}
            >
              <Heart className={`w-3 h-3 ${comment.liked ? 'fill-current' : ''}`} /> {comment.likeCount || 0}
            </button>
            <button
              onClick={() => { setReplyTo(replyTo === comment._id ? null : comment._id); setReplyText(''); }}
              className="text-[11px] font-medium text-gray-500 hover:text-purple-500 flex items-center gap-1 transition-colors"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => { setEditingComment(comment._id); setEditText(comment.content); }}
                  className="text-[11px] font-medium text-gray-500 hover:text-blue-500 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-[11px] font-medium text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </>
            )}
          </div>

          {/* Reply Input */}
          {replyTo === comment._id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleReply(comment._id); }}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReply(comment._id)}
                disabled={!replyText.trim() || submittingReply}
                className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-2 pl-3 border-l-2 border-purple-100 space-y-3">
              {comment.replies.map((reply) => {
                const isReplyOwner = currentUser && reply.author?._id === currentUser._id;
                return (
                  <div key={reply._id} className="flex gap-2">
                    <Avatar src={reply.author?.profilePicture} alt={reply.author?.name} size={24} className="border border-white shadow-sm shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-900">{reply.author?.name}</span>
                        <span className={`px-1 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider ${ROLE_BADGES[reply.authorRole]}`}>
                          {reply.authorRole}
                        </span>
                        <span className="text-[10px] text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      {editingComment === reply._id ? (
                        <div className="mt-1">
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-200 outline-none"
                          />
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleEditComment(reply._id, comment._id)} className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-semibold">Save</button>
                            <button onClick={() => { setEditingComment(null); setEditText(''); }} className="text-[10px] text-gray-500">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-700">{reply.content}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <button onClick={() => handleCommentLike(reply._id, comment._id)} className={`text-[10px] font-medium flex items-center gap-0.5 ${reply.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}>
                          <Heart className={`w-2.5 h-2.5 ${reply.liked ? 'fill-current' : ''}`} /> {reply.likeCount || 0}
                        </button>
                        {isReplyOwner && (
                          <>
                            <button onClick={() => { setEditingComment(reply._id); setEditText(reply.content); }} className="text-[10px] text-gray-500 hover:text-blue-500">Edit</button>
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

export default BlogDetailsPage;
