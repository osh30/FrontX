import { API_BASE } from '../../../config/api';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Bell, CheckCheck, Trash2, Search, X, FileText, Briefcase,
  Calendar, Award, AlertTriangle, Loader2, Clock, Inbox,
  Filter as FilterIcon
} from 'lucide-react';

const API_URL = API_BASE;

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'application', label: 'Applications' },
  { id: 'interview', label: 'Interviews' },
  { id: 'opportunity', label: 'Opportunities' },
  { id: 'offer', label: 'Offers' },
  { id: 'system', label: 'System' },
];

const NOTIFICATION_ICONS = {
  application: { icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600' },
  interview: { icon: Calendar, bg: 'bg-purple-50', color: 'text-purple-600' },
  opportunity: { icon: Briefcase, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  offer: { icon: Award, bg: 'bg-amber-50', color: 'text-amber-600' },
  system: { icon: Bell, bg: 'bg-gray-50', color: 'text-gray-600' },
  job: { icon: Briefcase, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  message: { icon: Bell, bg: 'bg-blue-50', color: 'text-blue-600' },
  mentor: { icon: Calendar, bg: 'bg-purple-50', color: 'text-purple-600' },
  mentorship: { icon: Award, bg: 'bg-amber-50', color: 'text-amber-600' },
};

const getNotifIcon = (type) => NOTIFICATION_ICONS[type] || { icon: Bell, bg: 'bg-gray-50', color: 'text-gray-600' };

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const RecruiterNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit: 20 };
      if (activeFilter !== 'all') params.filter = activeFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get(`${API_URL}/recruiter/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setNotifications(res.data.notifications || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [activeFilter, searchQuery, page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => { setPage(1); }, [activeFilter, searchQuery]);

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/recruiter/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/recruiter/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/recruiter/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
      setTotal(prev => prev - 1);
    } catch (err) { console.error(err); }
  };

  const deleteAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/recruiter/notifications/read-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNotifications();
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
            {total > 0 && <span className="text-gray-400"> &middot; {total} total</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          {notifications.some(n => n.isRead) && (
            <button onClick={deleteAllRead}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete read
            </button>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notifications..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {FILTER_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveFilter(tab.id)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {tab.label}
            {tab.id === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              {searchQuery ? <Search className="w-8 h-8 text-gray-300" /> : <Inbox className="w-8 h-8 text-gray-300" />}
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'No notifications match your search' : 'No notifications'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Try a different search term' : 'You\'re all caught up!'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((n, idx) => {
              const { icon: Icon, bg, color } = getNotifIcon(n.type);
              return (
                <motion.div key={n._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.02 }}
                  onClick={() => markAsRead(n._id, n.isRead)}
                  className={`group relative bg-white rounded-xl border p-4 flex items-start gap-3.5 cursor-pointer transition-all hover:shadow-sm ${
                    n.isRead ? 'border-gray-100' : 'border-blue-100 shadow-sm'
                  }`}>
                  {/* Unread indicator */}
                  {!n.isRead && (
                    <div className="absolute top-4 left-0 w-1 h-8 rounded-r-full bg-blue-500" />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 shrink-0 rounded-xl ${bg} flex items-center justify-center mt-0.5`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${n.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${n.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-medium capitalize px-1.5 py-0.5 rounded ${bg} ${color}`}>
                        {n.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-start mt-1">
                    {!n.isRead && (
                      <button onClick={(e) => { e.stopPropagation(); markAsRead(n._id, n.isRead); }}
                        className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Mark as read">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={(e) => deleteNotification(n._id, e)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all">
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  p === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all">
            Next
          </button>
        </div>
      )}

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { height: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default RecruiterNotifications;