import { API_BASE, SOCKET_URL } from '../../config/api';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Share2,
  Send, 
  Bookmark, CheckCircle, ShieldCheck, ThumbsUp, Heart, Lightbulb, Star, EyeOff,
  ArrowUp, Users, Trash2, MoreVertical, AlertTriangle,
  Briefcase, GraduationCap, Brain, Globe, Hash, MessageCircle,
  Award
} from 'lucide-react';
import Avatar from './Avatar';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const CATEGORIES = [
  "Career Advice", "Internship", "Research", "Academic Life",
  "University Experience", "Mental Pressure", "Success Story", "General Discussion"
];

const CATEGORY_ICONS = {
  'Career Advice': Briefcase,
  'Internship': Star,
  'Research': Brain,
  'Academic Life': GraduationCap,
  'University Experience': Globe,
  'Mental Pressure': Heart,
  'Success Story': Award,
  'General Discussion': MessageCircle
};

const REACTION_ICONS = {
  Like: { icon: ThumbsUp, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  Love: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  Support: { icon: Star, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  Insightful: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' }
};

const formatTimeAgo = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- POST CARD ---
const PostCard = ({ post, onUpdate, currentUserRole }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [isResolved, setIsResolved] = useState(post.resolvedStatus);
  const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || { Like: 0, Love: 0, Support: 0, Insightful: 0 });
  const [userReaction, setUserReaction] = useState(post.userReaction);
  const [totalReactions, setTotalReactions] = useState(post.totalReactions || 0);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community-posts/${post._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Post deleted successfully');
        onUpdate();
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleReact = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community-posts/${post._id}/react`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        const data = await res.json();
        const prevReaction = userReaction;
        const newReaction = data.userReaction;
        setUserReaction(newReaction);
        setReactionCounts(prev => {
          const updated = { ...prev };
          if (prevReaction) updated[prevReaction]--;
          if (newReaction) updated[newReaction]++;
          return updated;
        });
        if (!prevReaction && newReaction) setTotalReactions(t => t + 1);
        if (prevReaction && !newReaction) setTotalReactions(t => t - 1);
      }
    } catch (error) { console.error(error); }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community-posts/${post._id}/save`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      }
    } catch (error) { console.error(error); }
  };

  const handleResolve = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community-posts/${post._id}/resolve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setIsResolved(true);
    } catch (error) { console.error(error); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community-posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment, isAnonymous: isAnonymousComment })
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([...comments, comment]);
        setNewComment('');
      }
    } catch (error) { console.error(error); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/community?post=${post._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
    setShowSharePopup(false);
  };

  const renderAuthorInfo = (isAnon, authorRole, originalAuthor) => {
    if (isAnon) return { name: 'Anonymous Student', avatar: null, department: null };
    const rawDept = originalAuthor?.department;
    const cleanDept = (!rawDept || rawDept === 'EEE' || rawDept === 'CS' || rawDept === 'CSE' || rawDept === 'Computer Science')
      ? 'Educational Technology and Engineering'
      : rawDept;
    return {
      name: originalAuthor?.name || 'Unknown User',
      avatar: originalAuthor?.profilePicture,
      department: cleanDept
    };
  };

  const postAuthor = renderAuthorInfo(post.isAnonymous, post.authorRole, post.originalAuthor);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/[0.02] group-hover:via-purple-500/[0.01] group-hover:to-purple-500/0 transition-all duration-500 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-200/0 group-hover:via-purple-300/50 to-transparent transition-all duration-500" />

      {isResolved && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-[11px] font-bold text-green-700 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5" /> Resolved
        </div>
      )}

      <div className="p-5 md:p-6">
        <div className="flex items-start gap-3.5 mb-4">
          <Avatar src={postAuthor.avatar} alt={postAuthor.name} size={40} className="border border-gray-200" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-gray-900 text-sm">{postAuthor.name}</h4>
              {post.authorRole === 'alumni' && !post.isAnonymous && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 shadow-sm">
                  <ShieldCheck className="w-3 h-3" /> Alumni
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs mt-0.5 text-gray-500 flex-wrap">
              {postAuthor.department && <span className="font-medium">{postAuthor.department}</span>}
              {postAuthor.department && <span className="w-1 h-1 rounded-full bg-gray-300" />}
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/50">
                {post.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {post.isCreator && !isResolved && (
              <button onClick={handleResolve}
                className="text-[11px] font-semibold text-gray-500 hover:text-green-600 border border-gray-200 hover:border-green-300 px-2.5 py-1.5 rounded-lg transition-all bg-white hover:bg-green-50 shadow-sm"
              >
                Mark Resolved
              </button>
            )}
            {post.isCreator && (
              <div className="relative" ref={menuRef}>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-xl transition-all border text-gray-500 hover:text-gray-700 bg-white border-gray-200 hover:border-gray-300"
                  title="More actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 w-44 py-1.5 overflow-hidden"
                    >
                      <button onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Post
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={handleSave}
              className={`p-2 rounded-xl transition-all border ${isSaved ? 'text-blue-600 bg-blue-50 border-blue-200 shadow-sm' : 'text-gray-500 hover:text-blue-500 bg-white border-gray-200 hover:border-blue-200'}`}
              title="Save Post"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
            </motion.button>
          </div>
        </div>

        <p className="text-gray-800 text-sm md:text-base leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

        {post.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            {imgError ? (
              <div className="w-full h-48 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">Image unavailable</div>
            ) : (
              <img src={post.imageUrl} alt="" className="w-full max-h-96 object-cover" onError={() => setImgError(true)} />
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {Object.keys(REACTION_ICONS).map(type => {
              const RIcon = REACTION_ICONS[type].icon;
              const isActive = userReaction === type;
              const count = reactionCounts[type] || 0;
              if (count === 0 && type !== 'Like' && !isActive) return null;
              return (
                <motion.button key={type} whileTap={{ scale: 0.85 }}
                  onClick={() => handleReact(type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs font-semibold border ${
                    isActive
                      ? `${REACTION_ICONS[type].color} ${REACTION_ICONS[type].bg} ${REACTION_ICONS[type].border} shadow-sm`
                      : 'text-gray-500 hover:bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                >
                  <RIcon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                  {count > 0 && <span>{count}</span>}
                </motion.button>
              );
            })}
            <div className="relative">
              <motion.button whileTap={{ scale: 0.85 }}
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="p-1.5 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 text-xs"
              >
                +
              </motion.button>
              <AnimatePresence>
                {showReactionPicker && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full left-0 mb-2 flex bg-white shadow-xl rounded-xl border border-gray-100 p-1 gap-0.5 z-20"
                  >
                    {Object.keys(REACTION_ICONS).map(type => {
                      const RIcon = REACTION_ICONS[type].icon;
                      return (
                        <button key={type} onClick={() => { handleReact(type); setShowReactionPicker(false); }}
                          className={`p-2 rounded-lg hover:bg-gray-50 transition-colors ${REACTION_ICONS[type].color}`} title={type}
                        >
                          <RIcon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-all px-2.5 py-1.5 rounded-lg border ${
                showComments ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-500 hover:text-blue-500 border-transparent hover:border-blue-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length || post.commentsCount || 0}</span>
            </motion.button>
            <div className="relative">
              <motion.button whileTap={{ scale: 0.85 }}
                onClick={() => setShowSharePopup(!showSharePopup)}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-green-500 transition-all px-2.5 py-1.5 rounded-lg border border-transparent hover:border-green-200"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
              <AnimatePresence>
                {showSharePopup && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full right-0 mb-2 bg-white shadow-xl rounded-xl border border-gray-100 p-3 z-20 w-56"
                  >
                    <p className="text-xs font-semibold text-gray-700 mb-2">Share this post</p>
                    <button onClick={handleShare}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-all border border-gray-200"
                    >
                      <Share2 className="w-4 h-4 text-gray-500" />
                      Copy link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-gray-50">
            <div className="p-5 md:p-6 bg-gray-50/50">
              <div className="space-y-4 mb-5 max-h-72 overflow-y-auto scrollbar-hide pr-2">
                {comments.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">No comments yet. Be the first!</div>
                ) : (
                  comments.map((comment) => {
                    const cAuthor = renderAuthorInfo(comment.isAnonymous, comment.role, comment.originalAuthor);
                    return (
                      <div key={comment._id} className="flex gap-3">
                        <Avatar src={cAuthor.avatar} alt={cAuthor.name} size={24} className="border border-gray-200" />
                        <div className="flex-1 min-w-0">
                          <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">{cAuthor.name}</span>
                              {comment.role === 'alumni' && !comment.isAnonymous && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200">
                                  <ShieldCheck className="w-2.5 h-2.5" /> Alumni
                                </span>
                              )}
                              <span className="text-[10px] text-gray-500 ml-auto">{formatTimeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all pr-10"
                  />
                  {currentUserRole !== 'alumni' && (
                    <button type="button" onClick={() => setIsAnonymousComment(!isAnonymousComment)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${isAnonymousComment ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-600'}`}
                      title="Comment anonymously"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <motion.button type="submit" disabled={!newComment.trim()} whileTap={{ scale: 0.9 }}
                  className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete this post?</h2>
              <p className="text-gray-500 text-center text-sm mb-8">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- SKELETON ---
const PostCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 animate-pulse space-y-4">
    <div className="flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
    </div>
    <div className="h-40 bg-gray-100 rounded-xl" />
    <div className="flex gap-2">
      <div className="h-8 w-16 bg-gray-100 rounded-lg" />
      <div className="h-8 w-16 bg-gray-100 rounded-lg" />
      <div className="h-8 w-16 bg-gray-100 rounded-lg" />
    </div>
  </div>
);

// --- SIDEBAR ---


// --- MAIN COMMUNITY FEED ---
const CommunityFeed = () => {
  const navigate = useNavigate();
  const feedRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('student');
  const [showBackToTop, setShowBackToTop] = useState(false);



  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserRole(payload.role ? payload.role.toLowerCase() : 'student');
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600 || (feedRef.current?.scrollTop || 0) > 600);
    };
    const el = feedRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCurrentUserData(await res.json());
    } catch (error) { console.error("Failed to fetch user data", error); }
  };

  const fetchPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community-posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPosts(await res.json());
    } catch (error) { console.error(error); }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts().finally(() => setLoading(false));

    const token = localStorage.getItem('token');
    if (!token) return;
    let userId = null;
    try { userId = JSON.parse(atob(token.split('.')[1])).id; } catch (e) {}

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect_error', () => {});
    socket.on('connect', () => { if (userId) socket.emit('setup', { id: userId }); });
    socket.on('new_community_post', (newPost) => {
      setPosts(prev => prev.some(p => p._id === newPost._id) ? prev : [newPost, ...prev]);
    });
    socket.on('new_community_comment', ({ postId, comment }) => {
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const updatedComments = p.comments ? [...p.comments] : [];
          if (!updatedComments.some(c => c._id === comment._id)) updatedComments.push(comment);
          return { ...p, comments: updatedComments };
        }
        return p;
      }));
    });
    socket.on('community_post_updated', () => fetchPosts());
    socket.on('community_post_deleted', ({ postId }) => {
      setPosts(prev => prev.filter(p => p._id !== postId));
    });

    return () => socket.disconnect();
  }, [fetchPosts]);

  const filteredPosts = posts.filter(p => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Saved Discussions') return p.isSaved;
    return p.category === activeFilter;
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryList = ['All', 'Saved Discussions', ...CATEGORIES];

  return (
    <div className="w-full" ref={feedRef}>
      {/* Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#1a0a3e] shadow-2xl shadow-indigo-900/20 border border-white/[0.06]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ y: [0, -12, 0], opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-10 right-16 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl" />
          <motion.div animate={{ y: [0, 12, 0], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-10 left-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl" />
          <motion.div animate={{ x: [0, 16, 0], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-blue-400/10 blur-xl" />
          {/* Abstract illustration elements */}
          <div className="absolute top-8 right-10 opacity-[0.04]"><MessageCircle className="w-28 h-28 text-white" /></div>
          <div className="absolute bottom-6 right-16 opacity-[0.03]"><Users className="w-20 h-20 text-white" /></div>
          <div className="absolute top-12 left-12 opacity-[0.03]"><MessageSquare className="w-16 h-16 text-white" /></div>
          {/* Network nodes */}
          <div className="absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-white/20 shadow-lg shadow-purple-400/30" />
          <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 rounded-full bg-white/15 shadow-lg shadow-indigo-400/30" />
          <div className="absolute top-1/3 right-1/2 w-1 h-1 rounded-full bg-white/25 shadow-lg shadow-blue-400/30" />
        </div>
        <div className="absolute top-5 right-5 w-28 h-28 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm" />
        <div className="absolute bottom-5 left-5 w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-6 md:px-10 py-8 md:py-10">
          <div className="flex-1 text-center md:text-left">

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Community Hub</h1>
            <p className="text-sm md:text-base text-white/60 max-w-xl">Connect, collaborate, share ideas and grow together with your university community.</p>
          </div>

          <div className="shrink-0">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard/community/create-post')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Create Post
              </motion.button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 min-w-0 space-y-6">


          {/* Category Navigation */}
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categoryList.map(filter => {
                const CatIcon = CATEGORY_ICONS[filter] || (filter === 'All' ? Hash : filter === 'Saved Discussions' ? Bookmark : null);
                const isActive = activeFilter === filter;
                return (
                  <motion.button key={filter} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFilter(filter)}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md shadow-purple-500/20'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600 shadow-sm'
                    }`}
                  >
                    {CatIcon && <CatIcon className="w-3.5 h-3.5" />}
                    {filter === 'Saved Discussions' ? 'Saved' : filter}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Feed */}
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="space-y-5">
                <PostCardSkeleton /><PostCardSkeleton /><PostCardSkeleton />
              </div>
            ) : filteredPosts.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100/50 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-600 mb-1">No discussions yet</h3>
                <p className="text-sm text-gray-500 mb-6">Be the first to start a conversation.</p>
                <button onClick={() => navigate('/dashboard/community/create-post')}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Create Post
                </button>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {filteredPosts.map(post => (
                  <PostCard key={post._id} post={post} onUpdate={fetchPosts} currentUserRole={currentUserRole} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-white/20"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>


    </div>
  );
};

export default CommunityFeed;