import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Search, Loader2, Clock, CheckCircle, XCircle, Eye,
  Briefcase, Building2, Calendar, User, MapPin, DollarSign,
  Check, X, AlertTriangle
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminOpportunityRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (search.trim()) params.search = search.trim();
      const { data } = await axios.get(`${API_URL}/admin/opportunity-requests`, {
        params, headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(data.opportunities || []);
    } catch (err) {
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this opportunity? It will be published immediately.')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/opportunity-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Opportunity approved and published successfully');
      setSelected(null);
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/opportunity-requests/${rejectModal._id}/reject`,
        { rejectionReason: rejectionReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Opportunity rejected');
      setRejectModal(null);
      setRejectionReason('');
      setSelected(null);
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200'
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Toast */}
        <AnimatePresence>
          {toast.show && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md ${
                toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 'bg-red-50/90 border-red-200 text-red-700'
              }`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="text-sm font-semibold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Opportunity Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage recruiter-submitted opportunities</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company name, or recruiter name..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </div>
          <button type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
            Search
          </button>
        </form>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No opportunity requests found</p>
            <p className="text-sm text-gray-400 mt-1">Recruiter submissions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(opp => (
              <motion.div key={opp._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {opp.companyLogo || opp.recruiter?.companyLogo ? (
                        <img src={opp.companyLogo || opp.recruiter.companyLogo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-7 h-7 text-blue-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{opp.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 w-fit ${statusBadge(opp.status)}`}>
                          {opp.status === 'pending' && <Clock className="w-3 h-3" />}
                          {opp.status === 'approved' && <Check className="w-3 h-3" />}
                          {opp.status === 'rejected' && <X className="w-3 h-3" />}
                          {opp.status.charAt(0).toUpperCase() + opp.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {opp.companyName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-gray-400" />
                          {opp.recruiter?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          {opp.opportunityType}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-gray-500">
                        {opp.department && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            {opp.department}
                          </span>
                        )}
                        {(opp.salary?.min > 0 || opp.salary?.max > 0) && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-emerald-600">৳</span>
                            {opp.salary.min.toLocaleString()} - {opp.salary.max.toLocaleString()}
                          </span>
                        )}
                        {opp.deadline && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Due {new Date(opp.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          Submitted {new Date(opp.submittedAt || opp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 mt-3 sm:mt-0">
                      <button onClick={() => setSelected(selected?._id === opp._id ? null : opp)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-navy-700 bg-navy-50 rounded-xl hover:bg-navy-100 transition-colors">
                        <Eye className="w-4 h-4" />View
                      </button>
                      <button onClick={() => handleApprove(opp._id)} disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50">
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve
                      </button>
                      <button onClick={() => setRejectModal(opp)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                        <X className="w-4 h-4" />Reject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selected?._id === opp._id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-gray-100">
                    <div className="p-6 bg-gray-50/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div><span className="font-semibold text-gray-700">Location:</span> <span className="text-gray-600">{opp.location || 'Not specified'}</span></div>
                        <div><span className="font-semibold text-gray-700">Employment Mode:</span> <span className="text-gray-600">{opp.employmentMode || 'Not specified'}</span></div>
                        <div><span className="font-semibold text-gray-700">Vacancies:</span> <span className="text-gray-600">{opp.vacancies || 1}</span></div>
                        <div><span className="font-semibold text-gray-700">Application Method:</span> <span className="text-gray-600">Inside FrontX</span></div>
                        {(opp.salary?.min > 0 || opp.salary?.max > 0) && (
                          <div><span className="font-semibold text-gray-700">Salary:</span> <span className="text-gray-600">৳{opp.salary.min.toLocaleString()} - ৳{opp.salary.max.toLocaleString()}</span></div>
                        )}
                      </div>
                      {opp.description?.about && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">About</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{opp.description.about}</p>
                        </div>
                      )}
                      {opp.skills?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {opp.skills.map(s => (
                              <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium ring-1 ring-blue-100">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {opp.status === 'rejected' && opp.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
                          <p className="text-sm text-red-600">{opp.rejectionReason}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-5">
                        <button onClick={() => handleApprove(opp._id)} disabled={actionLoading || opp.status === 'approved' || opp.status === 'rejected'}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Approve & Publish
                        </button>
                        <button onClick={() => setRejectModal(opp)} disabled={opp.status === 'approved' || opp.status === 'rejected'}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                          <X className="w-4 h-4" />Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        <AnimatePresence>
          {rejectModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Reject Opportunity</h3>
                      <p className="text-sm text-gray-500">&quot;{rejectModal.title}&quot;</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rejection Reason *</label>
                      <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4} placeholder="Provide feedback to the recruiter about why this opportunity is being rejected..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none transition-all" />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setRejectModal(null); setRejectionReason(''); }}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50">
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

export default AdminOpportunityRequests;
