import { API_BASE, SOCKET_URL } from '../../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart } from 'lucide-react';
import Avatar from './Avatar';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

const CommunityFeedPreview = ({ setActiveTab }) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/community-posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecentPosts(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch community posts for preview", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentPosts();
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('new_post', fetchRecentPosts);
    socketRef.current.on('post_reaction_updated', fetchRecentPosts);
    socketRef.current.on('post_comment_added', fetchRecentPosts);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : recentPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white/40 rounded-2xl border border-dashed border-gray-200">
          No recent community posts to display.
        </div>
      ) : (
        recentPosts.map((post) => {
          const isAnonymous = post.isAnonymous;
          const authorName = isAnonymous ? 'Anonymous Student' : (post.originalAuthor?.name || 'Unknown User');
          const authorAvatar = !isAnonymous && post.originalAuthor?.profilePicture ? post.originalAuthor.profilePicture : null;

          return (
            <motion.div
              key={post._id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTab('community')}
              className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 cursor-pointer transition-all"
            >
              <div className="shrink-0">
                <Avatar src={authorAvatar} alt={authorName} size={40} className="border-2 border-white shadow-sm" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{authorName}</h4>
                  <span className="text-xs text-gray-500 shrink-0">• {formatTime(post.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mt-0.5 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 border-l border-gray-100 pl-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Heart className="w-4 h-4" />
                  {post.totalReactions || 0}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  {post.commentsCount || 0}
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default CommunityFeedPreview;
