import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageCircle, Calendar, Users, FileText, CheckCircle, Award } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const getIconForType = (type) => {
  switch (type) {
    case 'collaboration': return { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' };
    case 'message': return { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-100' };
    case 'mentorship': return { icon: Award, color: 'text-amber-500', bg: 'bg-amber-100' };
    case 'mentor': return { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-100' };
    case 'resource': return { icon: FileText, color: 'text-green-500', bg: 'bg-green-100' };
    default: return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' };
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString();
};

export const NotificationDropdown = ({ isOpen, onClose, onUnreadCount }) => {
  const { user, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.isRead).length;
      if (onUnreadCount) onUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  }, [onUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        toast(newNotif.message, { icon: '🔔' });
        setNotifications(prev => {
          const unread = prev.filter(n => !n.isRead).length;
          if (onUnreadCount) onUnreadCount(unread);
          return prev;
        });
      };

      socket.on('notification:new', handleNewNotification);
      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket, onUnreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (onUnreadCount) onUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => {
        const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
        const unread = updated.filter(n => !n.isRead).length;
        if (onUnreadCount) onUnreadCount(unread);
        return updated;
      });
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-14 w-80 sm:w-96 bg-white border border-gray-200/60 rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-gray-900 text-[15px]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Mark all as read
              </button>
            )}
          </div>
          
          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-400 mt-3">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No notifications yet.</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map(notif => {
                const { icon: Icon, color, bg } = getIconForType(notif.type);
                return (
                  <div 
                    key={notif._id} 
                    onClick={() => {
                      markAsRead(notif._id, notif.isRead);
                      if (notif.type === 'mentor' && notif.relatedId) {
                        onClose();
                        navigate('/dashboard/sessions');
                      }
                    }}
                    className={`px-5 py-3.5 border-b border-gray-50 flex gap-3.5 hover:bg-gray-50 transition-all cursor-pointer group ${
                      !notif.isRead ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {notif.title && (
                        <p className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5">{notif.title}</p>
                      )}
                      <p className={`text-[13px] leading-snug ${!notif.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'} line-clamp-2`}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{formatTime(notif.createdAt)}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 ring-2 ring-blue-100"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex justify-center">
            <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
