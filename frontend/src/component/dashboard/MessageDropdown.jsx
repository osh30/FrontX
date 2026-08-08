import { API_BASE } from '../../config/api';
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import { MessageCircle } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return '1d';
  return date.toLocaleDateString();
};

export const MessageDropdown = ({ isOpen, onClose, onOpenFullChat }) => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conv) => {
    return conv.otherParticipant || conv.participants?.find(p => p._id !== user?.id) || conv.participants?.[0];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-14 w-80 sm:w-96 bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Messages</h3>
            <button onClick={() => { onClose(); onOpenFullChat(); }} className="text-xs text-purple-600 font-semibold hover:text-purple-700">Open full chat</button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No recent messages.</div>
            ) : (
              conversations.map(conv => {
                const otherUser = getOtherUser(conv);
                const isUnread = conv.lastMessage && conv.lastMessage.sender !== user?.id && !conv.lastMessage.readBy?.includes(user?.id);
                return (
                  <div 
                    key={conv._id} 
                    onClick={() => { onClose(); onOpenFullChat(); }}
                    className={`px-4 py-3 border-b border-gray-50 flex gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer ${isUnread ? 'bg-purple-50/30' : ''}`}
                  >
                    <Avatar src={otherUser?.profilePicture} alt={otherUser?.name} size={40} className="border-2 border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{otherUser?.name}</p>
                        <p className="text-xs text-gray-500">{conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}</p>
                      </div>
                      <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage?.text || "Started a conversation"}
                      </p>
                    </div>
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 text-center bg-gray-50/50">
            <button onClick={onClose} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Close</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
