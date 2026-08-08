import { API_BASE } from '../../config/api';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Star, Eye, EyeOff, Trash2, Search, Filter, AlertTriangle, MessageSquare, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = API_BASE;

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={`w-4 h-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
      />
    ))}
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = { visible: 'bg-emerald-50 text-emerald-700', hidden: 'bg-amber-50 text-amber-700', deleted: 'bg-red-50 text-red-700' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg[status] || cfg.visible}`}>
      {status}
    </span>
  );
};

const AdminCompanyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchReviews = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/company-reviews`, {
        headers: authHeaders(),
        params: { page: pageNum, limit: 20, status: filterStatus, search: searchQuery }
      });
      setReviews(res.data.reviews || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(1); }, []);
  useEffect(() => {
    fetchReviews(1);
  }, [filterStatus, searchQuery]);

  const handleHide = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/company-reviews/${id}/hide`, {}, { headers: authHeaders() });
      toast.success('Review hidden');
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: 'hidden' } : r));
    } catch (err) {
      toast.error('Failed to hide review');
    }
  };

  const handleRestore = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/company-reviews/${id}/restore`, {}, { headers: authHeaders() });
      toast.success('Review restored');
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: 'visible' } : r));
    } catch (err) {
      toast.error('Failed to restore review');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await axios.delete(`${API_URL}/admin/company-reviews/${id}`, { headers: authHeaders() });
      toast.success('Review deleted');
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: 'deleted' } : r));
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6 p-8">
        <div className="h-48 bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] p-8 md:p-10"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Review Moderation</h1>
            <p className="text-blue-200/80 text-sm md:text-base max-w-xl">
              Manage and moderate company reviews. Hide inappropriate content, restore reviews, or permanently delete them.
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-200/60 text-sm shrink-0">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">{total} total reviews</span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by company name or review text..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
          </div>

          {reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100 p-12 text-center"
            >
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No reviews found</p>
              <p className="text-gray-500 text-sm mt-1">No reviews match your current filters</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-gray-900">{review.companyName}</h3>
                              {review.opportunityTitle && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-semibold">
                                  {review.opportunityTitle}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              by {review.reviewerId?.name || 'Anonymous'} &middot; {review.reviewerId?.email}
                            </p>
                            {review.recruiterId && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Recruiter: {review.recruiterId.name} &middot; {review.recruiterId.companyName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <StarDisplay rating={review.overallRating} />
                          <span className="text-sm font-bold text-gray-700">{review.overallRating}/5</span>
                          {review.wouldRecommend !== undefined && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${review.wouldRecommend ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                              {review.wouldRecommend ? 'Recommends' : 'Does not recommend'}
                            </span>
                          )}
                        </div>
                        {review.reviewText && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {expandedId === review._id
                              ? review.reviewText
                              : review.reviewText.length > 100
                                ? review.reviewText.slice(0, 100) + '...'
                                : review.reviewText
                            }
                            {review.reviewText.length > 100 && (
                              <button
                                onClick={() => setExpandedId(expandedId === review._id ? null : review._id)}
                                className="ml-1 text-emerald-600 hover:text-emerald-700 font-semibold text-xs"
                              >
                                {expandedId === review._id ? 'Show less' : 'Read more'}
                              </button>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={review.status} />
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                      {review.status === 'visible' && (
                        <button
                          onClick={() => handleHide(review._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-[12px] font-semibold transition-all"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          Hide
                        </button>
                      )}
                      {review.status === 'hidden' && (
                        <button
                          onClick={() => handleRestore(review._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[12px] font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Restore
                        </button>
                      )}
                      {review.status !== 'deleted' && (
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-[12px] font-semibold transition-all ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                      {review.status === 'deleted' && (
                        <span className="flex items-center gap-1.5 px-3 py-2 text-gray-500 text-[12px] font-semibold ml-auto">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Permanently deleted
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => { if (page > 1) fetchReviews(page - 1); }}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 font-medium px-2">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => { if (page < pages) fetchReviews(page + 1); }}
                disabled={page >= pages}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
    </div>
  );
};

export default AdminCompanyReviews;
