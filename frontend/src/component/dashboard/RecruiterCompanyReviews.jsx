import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Star, Building2, ThumbsUp, MessageSquare, Search, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const FILTERS = [
  { label: 'All Reviews', value: 'all' },
  { label: '5 Stars', value: '5' },
  { label: '4 Stars', value: '4' },
  { label: '3 Stars', value: '3' },
  { label: '2 Stars', value: '2' },
  { label: '1 Star', value: '1' },
];

const SORTS = [
  { label: 'Latest', value: 'latest' },
  { label: 'Highest Rating', value: 'highest' },
  { label: 'Lowest Rating', value: 'lowest' },
];

const StarDisplay = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`${size} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
    ))}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, suffix = '', prefix = '' }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-3xl font-bold text-gray-900">{prefix}{value}{suffix}</p>
  </motion.div>
);

const ReviewerAvatar = ({ reviewer }) => {
  const initials = reviewer?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold">
      {initials}
    </div>
  );
};

const RecruiterCompanyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort };
      if (ratingFilter !== 'all') params.rating = ratingFilter;
      if (search.trim()) params.search = search.trim();

      const res = await axios.get(`${API_URL}/company-reviews/recruiter/reviews`, { headers: authHeaders(), params });
      setReviews(res.data.reviews || []);
      setSummary(res.data.summary || null);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load company reviews');
    } finally {
      setLoading(false);
    }
  }, [page, ratingFilter, sort, search]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  useEffect(() => { setPage(1); }, [ratingFilter, sort, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const recentCount = reviews.filter(r => {
    const d = new Date(r.createdAt);
    return (Date.now() - d) / (1000 * 60 * 60 * 24) <= 30;
  }).length;

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="h-48 bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] p-8 md:p-10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Company Reviews</h1>
          <p className="text-blue-200/80 text-sm md:text-base max-w-xl">
            View reviews submitted by students and alumni about your company
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Star} label="Average Rating" value={summary?.avgRating || 0} color="from-amber-500 to-orange-600" suffix="/5" />
        <StatCard icon={MessageSquare} label="Total Reviews" value={summary?.totalReviews || 0} color="from-blue-500 to-indigo-600" />
        <StatCard icon={ThumbsUp} label="Recommend %" value={summary?.recommendPercent || 0} color="from-emerald-500 to-teal-600" suffix="%" />
        <StatCard icon={Clock} label="Recent (30d)" value={recentCount} color="from-purple-500 to-pink-600" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setRatingFilter(f.value)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${ratingFilter === f.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..." 
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          {search && (
            <button type="button" onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {reviews.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No reviews found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || ratingFilter !== 'all' ? 'Try adjusting your filters' : 'Reviews submitted by students will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div key={review._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <ReviewerAvatar reviewer={review.reviewer} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{review.reviewer?.name || 'Anonymous'}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${review.reviewerRole === 'alumni' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                        {review.reviewerRole === 'alumni' ? 'Alumni' : 'Student'}
                      </span>
                      {review.isEdited && <span className="text-[11px] text-gray-400 font-medium">(Edited)</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {review.reviewer?.department || ''} {review.reviewer?.graduationYear ? `· ${review.reviewer.graduationYear}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <StarDisplay rating={review.overallRating} />
                  <span className="text-sm font-semibold text-gray-700">{review.overallRating}/5</span>
                </div>

                <h4 className="font-semibold text-gray-800 mb-1">{review.reviewTitle}</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.reviewDescription}</p>

                <div className="flex items-center gap-3 text-xs">
                  {review.wouldRecommend && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                      <ThumbsUp className="w-3 h-3" /> Would Recommend
                    </span>
                  )}
                  <span className="text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <p className="text-sm text-gray-500">Showing {reviews.length} of {total} reviews</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterCompanyReviews;
