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

export const NotificationsPage = () => {
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
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        toast(newNotif.message, { icon: '🔔' });
      };

      socket.on('notification:new', handleNewNotification);
      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket]);

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
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
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 mt-1">Stay updated with your latest activities</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="px-4 py-2 bg-white border border-gray-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Bell className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {notifications.map(notif => {
                const { icon: Icon, color, bg } = getIconForType(notif.type);
                return (
                  <motion.div 
                    key={notif._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={() => {
                      markAsRead(notif._id, notif.isRead);
                      if (notif.type === 'mentor' && notif.relatedId) {
                        navigate('/dashboard/sessions');
                      }
                    }}
                    className={`p-5 flex gap-5 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-purple-50/30' : ''}`}
                  >
                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${bg} shadow-sm border border-white`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-base ${!notif.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                          {notif.title || (notif.type.charAt(0).toUpperCase() + notif.type.slice(1))}
                        </h4>
                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap ml-4">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="flex items-center justify-center shrink-0 w-8">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm animate-pulse"></div>
                      </div>
                    )}
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
