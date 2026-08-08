import { API_BASE } from '../../../config/api';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Clock, CheckCircle, XCircle, AlertCircle, Eye, RefreshCw, Loader2,
  Briefcase, Building2, Calendar, FileText, Search
} from 'lucide-react';

const API_URL = API_BASE;

const STATUS_CONFIG = {
  pending: { icon: Clock, label: 'Pending Review', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  approved: { icon: CheckCircle, label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
};

const MyOpportunityRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { status: statusFilter };
      const { data } = await axios.get(`${API_URL}/recruiter/opportunity-requests`, {
        params, headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(data.opportunities || []);
    } catch (err) {
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const handleResubmit = async (opp) => {
    if (!window.confirm('Resubmit this opportunity for admin review?')) return;
    setResubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/recruiter/opportunities/${opp._id}/resubmit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Opportunity resubmitted for review');
      setSelected(null);
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resubmit', 'error');
    } finally {
      setResubmitting(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending Review' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="max-w-5xl space-y-8">
      {/* Toast */}
      {toast.show && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 'bg-red-50/90 border-red-200 text-red-700'
          }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </motion.div>
      )}

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#162a50] p-8 sm:p-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <FileText className="w-5 h-5 text-blue-300" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Opportunity Requests</h1>
          <p className="text-sm sm:text-base text-blue-200/70 mt-2 max-w-2xl leading-relaxed">
            Track the status of your submitted opportunities. View approval updates and feedback.
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {filters.map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              statusFilter === f.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No opportunity requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(opp => {
            const cfg = STATUS_CONFIG[opp.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <motion.div key={opp._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{opp.title}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.color} ${cfg.border} border shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{opp.companyName}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{opp.opportunityType}</span>
                      {opp.department && <span>{opp.department}</span>}
                      {opp.deadline && (
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Due {new Date(opp.deadline).toLocaleDateString()}</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Submitted {new Date(opp.submittedAt || opp.createdAt).toLocaleDateString()}</span>
                    </div>
                    {opp.status === 'rejected' && opp.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-600">{opp.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setSelected(selected?._id === opp._id ? null : opp)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    {opp.status === 'rejected' && (
                      <button onClick={() => handleResubmit(opp)} disabled={resubmitting}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50">
                        <RefreshCw className="w-4 h-4" />
                        Resubmit
                      </button>
                    )}
                    {opp.status === 'pending' && (
                      <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg">Awaiting Review</span>
                    )}
                    {opp.status === 'approved' && (
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg">Published</span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selected?._id === opp._id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-semibold text-gray-700">Location:</span> <span className="text-gray-500">{opp.location || 'Not specified'}</span></div>
                      <div><span className="font-semibold text-gray-700">Employment Mode:</span> <span className="text-gray-500">{opp.employmentMode || 'Not specified'}</span></div>
                      <div><span className="font-semibold text-gray-700">Vacancies:</span> <span className="text-gray-500">{opp.vacancies || 1}</span></div>
                      <div><span className="font-semibold text-gray-700">Application Method:</span> <span className="text-gray-500">Inside FrontX</span></div>
                      {opp.salary?.min > 0 || opp.salary?.max > 0 ? (
                        <div><span className="font-semibold text-gray-700">Salary:</span> <span className="text-gray-500">৳{opp.salary.min} - ৳{opp.salary.max}</span></div>
                      ) : null}
                      {opp.description?.about && (
                        <div className="sm:col-span-2">
                          <span className="font-semibold text-gray-700">About:</span>
                          <p className="text-gray-500 mt-1">{opp.description.about}</p>
                        </div>
                      )}
                    </div>
                    {opp.status === 'rejected' && (
                      <button onClick={() => handleResubmit(opp)} disabled={resubmitting}
                        className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {resubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Resubmit for Review
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOpportunityRequests;
