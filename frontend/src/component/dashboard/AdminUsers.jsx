import { API_BASE } from '../../config/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Search, Trash2, ChevronLeft, ChevronRight, RefreshCw,
  AlertTriangle, Users, Filter,
} from 'lucide-react';

const API_URL = API_BASE;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const SectionHeading = ({ children, subtitle, delay = 0, right }) => (
  <motion.div variants={fadeUp} custom={delay} className="flex items-end justify-between flex-wrap gap-4">
    <div>
      <h1 className="text-[30px] font-[800] tracking-[-0.025em] leading-tight" style={{ color: '#1E293B' }}>{children}</h1>
      {subtitle && <p className="text-[16px] font-normal mt-2 leading-[1.6]" style={{ color: '#475569' }}>{subtitle}</p>}
    </div>
    {right}
  </motion.div>
);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const searchDebounceRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      if (roleFilter !== 'All') params.append('role', roleFilter);
      const res = await axios.get(`${API_URL}/admin/users?${params}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) { console.error('Failed to load users:', err); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchUsers();
    }, 350);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/admin/users/${deleteModal._id}`);
      setUsers(prev => prev.filter(u => u._id !== deleteModal._id));
      setTotal(prev => prev - 1);
      setDeleteModal(null);
    } catch (err) { console.error('Delete failed:', err); }
    finally { setDeleting(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) { console.error('Role update failed:', err); }
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
          subtitle={`${total} registered users`}
          delay={0}
          right={
            <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          }
        >
          User Management
        </SectionHeading>

        <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 shadow-sm transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer shadow-sm transition-all"
            >
              {['All', 'student', 'alumni', 'admin'].map(r => (
                <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u, i) => (
              <motion.div
                key={u._id}
                variants={fadeUp}
                custom={i}
                className="relative overflow-hidden rounded-2xl p-[1px]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.07]" />
                <div
                  className="relative rounded-[calc(1rem-1px)] px-6 py-4"
                  style={{
                    background: 'linear-gradient(165deg, rgba(11,17,32,0.97) 0%, rgba(15,27,45,0.95) 35%, rgba(17,29,51,0.96) 65%, rgba(13,22,37,0.98) 100%)',
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(1rem-1px)]">
                    <div className="absolute inset-0 opacity-[0.015]"
                      style={{
                        background: 'linear-gradient(115deg, transparent 25%, rgba(148,163,184,0.5) 45%, rgba(255,255,255,0.7) 50%, rgba(148,163,184,0.5) 55%, transparent 75%)',
                        backgroundSize: '250% 100%',
                        animation: 'shimmerSweep 8s ease-in-out infinite',
                      }} />
                  </div>
                  <div className="relative z-10 flex items-center gap-4">
                    {u.profilePicture ? (
                      <img src={u.profilePicture} alt="" className="w-11 h-11 rounded-xl object-cover border border-white/[0.08] shrink-0" />
                    ) : (
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        u.role === 'alumni'
                          ? 'bg-gradient-to-br from-purple-500/25 to-purple-600/15 text-purple-300 border border-purple-500/15'
                          : u.role === 'admin'
                            ? 'bg-gradient-to-br from-red-500/25 to-red-600/15 text-red-300 border border-red-500/15'
                            : 'bg-gradient-to-br from-blue-500/25 to-blue-600/15 text-blue-300 border border-blue-500/15'
                      }`}>
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{u.email}</p>
                      {u.department && <p className="text-[10px] text-slate-600 mt-0.5">{u.department}</p>}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                        u.role === 'alumni'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/10'
                          : u.role === 'admin'
                            ? 'bg-red-500/10 text-red-300 border border-red-500/10'
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/10'
                      }`}>{u.role}</span>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u.role === 'admin'}
                        className="appearance-none px-3 py-1.5 text-[11px] font-medium bg-white/[0.06] border border-white/[0.08] rounded-lg text-white outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-white/[0.08]"
                      >
                        <option value="student" className="bg-slate-800">Student</option>
                        <option value="alumni" className="bg-slate-800">Alumni</option>
                      </select>
                      <button
                        onClick={() => setDeleteModal(u)}
                        disabled={u.role === 'admin'}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-500">Page <span className="font-bold text-slate-800">{page}</span> of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

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
                    <h3 className="text-base font-bold text-white">Delete User</h3>
                    <p className="text-xs text-slate-400">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-5">
                  <span className="font-semibold text-white">{deleteModal.name}</span> ({deleteModal.email}) will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(null)} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete User</>}
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

export default AdminUsers;
