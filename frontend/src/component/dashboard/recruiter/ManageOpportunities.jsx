import { API_BASE } from '../../../config/api';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Briefcase, Search, Filter, Trash2, Edit3, Eye, Clock, Users, X } from 'lucide-react';

const API_URL = API_BASE;

const ManageOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchOpportunities(); }, [statusFilter, page]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/recruiter/opportunities`, {
        params: { status: statusFilter, search, page, limit: 10 }
      });
      setOpportunities(res.data.opportunities);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  const toggleStatus = async (id, currentStatus) => {
    if (currentStatus === 'pending' || currentStatus === 'approved' || currentStatus === 'rejected') {
      alert('This opportunity is in the approval workflow. Status cannot be changed directly.');
      return;
    }
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await axios.put(`${API_URL}/recruiter/opportunities/${id}`, { status: newStatus });
      fetchOpportunities();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOpportunity = async (id) => {
    if (!confirm('Delete this opportunity?')) return;
    try {
      await axios.delete(`${API_URL}/recruiter/opportunities/${id}`);
      fetchOpportunities();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    active: 'bg-emerald-50 text-emerald-600',
    closed: 'bg-gray-100 text-gray-500',
    draft: 'bg-amber-50 text-amber-600',
    pending: 'bg-amber-50 text-amber-600',
    approved: 'bg-emerald-50 text-emerald-600',
    rejected: 'bg-red-50 text-red-600'
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900">Manage Opportunities</h2>
        <p className="text-sm text-gray-500 mt-1">View and manage all your posted opportunities.</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search opportunities..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </motion.div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No opportunities found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first opportunity to start hiring</p>
          </div>
        ) : (
          opportunities.map((opp, idx) => (
            <motion.div key={opp._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-900">{opp.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[opp.status] || statusColors.active}`}>
                      {opp.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">
                      {opp.opportunityType || opp.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{opp.description?.about || opp.description || ''}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {opp.location && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {opp.location}</span>}
                    {opp.applicationCount > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {opp.applicationCount} applicants</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(opp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {opp.status === 'active' || opp.status === 'closed' ? (
                    <button onClick={() => toggleStatus(opp._id, opp.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${opp.status === 'active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                      {opp.status === 'active' ? 'Close' : 'Reopen'}
                    </button>
                  ) : opp.status === 'pending' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-600">Awaiting Review</span>
                  ) : opp.status === 'approved' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600">Published</span>
                  ) : opp.status === 'rejected' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600">Rejected</span>
                  ) : null}
                  <button onClick={() => deleteOpportunity(opp._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOpportunities;
