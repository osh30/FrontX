import { API_BASE } from '../../config/api';
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageCircle, Calendar, Users, FileText, CheckCircle, Award, Search, Trash2, Check, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const getIconForType = (type) => {
  switch (type) {
    case 'collaboration': return { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100/80 border-blue-200' };
    case 'message': return { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-100/80 border-purple-200' };
    case 'mentorship': return { icon: Award, color: 'text-amber-500', bg: 'bg-amber-100/80 border-amber-200' };
    case 'mentor': return { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-100/80 border-purple-200' };
    case 'resource': return { icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-100/80 border-emerald-200' };
    case 'system': return { icon: Bell, color: 'text-rose-500', bg: 'bg-rose-100/80 border-rose-200' };
    default: return { icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-100/80 border-indigo-200' };
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const NotificationsPage = ({ onUnreadCount }) => {
  const { user, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const updateUnread = useCallback((list) => {
    const unread = list.filter(n => !n.isRead).length;
    if (onUnreadCount) onUnreadCount(unread);
  }, [onUnreadCount]);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
      updateUnread(res.data || []);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  }, [updateUnread]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (newNotif) => {
        setNotifications(prev => {
          const updated = [newNotif, ...prev];
          updateUnread(updated);
          return updated;
        });
        toast(newNotif.message, { icon: '🔔' });
      };

      socket.on('notification:new', handleNewNotification);
      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket, updateUnread]);

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, isRead: true }));
        updateUnread(updated);
        return updated;
      });
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => {
        const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
        updateUnread(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const deleteNotif = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => {
        const updated = prev.filter(n => n._id !== id);
        updateUnread(updated);
        return updated;
      });
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification', error);
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filter === 'unread' && n.isRead) return false;
      if (filter === 'read' && !n.isRead) return false;
      if (search) {
        const q = search.toLowerCase();
        const titleMatch = (n.title || '').toLowerCase().includes(q);
        const msgMatch = (n.message || '').toLowerCase().includes(q);
        return titleMatch || msgMatch;
      }
      return true;
    });
  }, [notifications, filter, search]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-10 mb-8 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#1E3A8A] shadow-2xl shadow-indigo-900/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-200 text-xs font-bold rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-blue-100/70 text-sm max-w-lg">
              Stay updated with deadlines, mentorship sessions, opportunities, and community updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'read', label: `Read (${notifications.length - unreadCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-white text-purple-700 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-base font-bold text-gray-800">No notifications found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              {search || filter !== 'all' ? 'Try clearing your search query or switching filters.' : 'You have no notifications right now.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredNotifications.map(notif => {
                const { icon: Icon, color, bg } = getIconForType(notif.type);
                const isUnread = !notif.isRead;

                return (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={() => {
                      if (isUnread) markAsRead(notif._id);
                      if (notif.type === 'mentor' || notif.type === 'mentorship') {
                        navigate('/dashboard/sessions');
                      } else if (notif.type === 'system' && notif.relatedId) {
                        navigate(`/dashboard/planner?courseId=${notif.relatedId}`);
                      }
                    }}
                    className={`p-5 flex items-start gap-4 transition-all cursor-pointer group ${
                      isUnread
                        ? 'bg-purple-50/40 border-l-4 border-l-purple-600 hover:bg-purple-50/60'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${bg} shadow-sm`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'} truncate`}>
                            {notif.title || (notif.type ? notif.type.toUpperCase() : 'NOTIFICATION')}
                          </h4>
                          {isUnread && (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-gray-400 shrink-0 whitespace-nowrap">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <button
                          onClick={(e) => markAsRead(notif._id, e)}
                          title="Mark as read"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-100 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotif(notif._id, e)}
                        title="Delete notification"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
