import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Avatar from './Avatar';
import { io } from 'socket.io-client';
import {
  BookOpen, Download, Eye, Star, Share2, Bookmark, Filter, Search,
  Heart, ExternalLink,
  BookmarkCheck, Sparkles,
  GraduationCap, Calendar, BarChart3, ArrowUpRight
} from 'lucide-react';

const categories = ['All', 'Lecture Notes', 'Research Papers', 'Lab Manuals', 'Assignment', 'Project Report', 'Presentation Slides', 'Reference Book', 'Case Study', 'Journal Article', 'Thesis', 'Exam Preparation', 'Industry Report', 'Other'];

const fileTypes = ['PDF', 'DOCX', 'PPT', 'XLSX', 'ZIP', 'LINK'];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'most-downloaded', label: 'Most Downloaded' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'highest-rated', label: 'Highest Rated' }
];

const fileTypeColors = {
  PDF: 'bg-red-50 text-red-600 border-red-200',
  DOCX: 'bg-blue-50 text-blue-600 border-blue-200',
  PPT: 'bg-orange-50 text-orange-600 border-orange-200',
  XLSX: 'bg-green-50 text-green-600 border-green-200',
  ZIP: 'bg-purple-50 text-purple-600 border-purple-200',
  LINK: 'bg-cyan-50 text-cyan-600 border-cyan-200'
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCount = (n) => {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-5 animate-pulse">
      <div className="w-28 h-28 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource, onBookmark, onDownload, onShare, userId }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-100 transition-all duration-300 p-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/[0.02] group-hover:via-purple-500/[0.01] group-hover:to-purple-500/0 transition-all duration-500 pointer-events-none" />

      {resource.averageRating >= 4.5 && resource.ratingCount >= 3 && (
        <div className="absolute top-0 left-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl rounded-tl-2xl shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Top Rated
          </div>
        </div>
      )}

      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <Avatar src={resource.alumniId?.profilePicture} alt="Alumni" size={32} className="border border-gray-200 shrink-0" />
          {resource.fileType && (
            <div className={`absolute -bottom-1.5 -right-1.5 text-[9px] font-bold px-2 py-0.5 rounded-md border shadow-sm ${fileTypeColors[resource.fileType] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {resource.fileType}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{resource.category}</span>
            {resource.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
            {resource.tags?.length > 2 && <span className="text-[10px] text-gray-400">+{resource.tags.length - 2}</span>}
          </div>

          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-purple-700 transition-colors line-clamp-1">{resource.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{resource.description}</p>

          <div className="flex items-center gap-4 flex-wrap text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <Avatar src={""} alt="Alumni" size={32} className="border border-gray-200 shrink-0" />
              <span className="font-medium text-gray-600 truncate max-w-[120px]">{resource.alumniId?.name || 'Unknown'}</span>
            </div>
            {resource.alumniId?.department && (
              <div className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /><span className="truncate max-w-[100px]">{resource.alumniId.department}</span></div>
            )}
            <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(resource.createdAt)}</div>
            <div className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{formatCount(resource.downloads)}</div>
            <div className="flex items-center gap-1">
              <Star className={`w-3.5 h-3.5 ${resource.averageRating >= 4 ? 'text-amber-400' : 'text-gray-300'}`} />
              {resource.averageRating > 0 ? resource.averageRating.toFixed(1) : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/dashboard/resources/${resource._id}`, { state: { resource } })}
          className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
        >
          <ArrowUpRight className="w-4 h-4" /> View Details
        </motion.button>

        {resource.fileUrl && (
          <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
            href={resource.fileUrl} target="_blank" rel="noopener noreferrer"
            onClick={() => onDownload?.(resource._id)}
            className="flex-1 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-200 flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Preview
          </motion.a>
        )}

        {resource.uploadType === 'File' && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
            onClick={() => onDownload?.(resource._id)}
            className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download
          </motion.button>
        )}

        {resource.uploadType === 'ExternalLink' && resource.externalLink && (
          <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
            href={resource.externalLink} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-cyan-50 text-cyan-700 rounded-xl text-sm font-semibold hover:bg-cyan-100 transition-colors border border-cyan-200 flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" /> Open Link
          </motion.a>
        )}

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
          onClick={() => onBookmark?.(resource._id)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border flex items-center gap-1.5 ${resource.isBookmarked ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
        >
          <Bookmark className={`w-4 h-4 ${resource.isBookmarked ? 'fill-purple-600' : ''}`} />
        </motion.button>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
          onClick={() => onShare?.(resource._id)}
          className="px-4 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200 flex items-center gap-1.5"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function SectionRow({ title, icon: Icon, iconColor, resources, loading, onBookmark, onDownload, onShare, userId }) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (!resources?.length) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${iconColor || 'bg-purple-50'}`}>
          <Icon className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">{resources.length}</span>
      </div>
      <div className="space-y-3">
        {resources.map(resource => (
          <ResourceCard
            key={resource._id}
            resource={resource}
            onBookmark={onBookmark}
            onDownload={onDownload}
            onShare={onShare}
            userId={userId}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function PremiumResourceHubPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [continueReading, setContinueReading] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const API = 'http://localhost:5000/api/resources';

  const fetchSection = async (endpoint, setter) => {
    try {
      const { data } = await axios.get(`${API}${endpoint}`, { headers });
      setter(data.resources || data);
    } catch { setter([]); }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedFileType) params.set('fileType', selectedFileType);
      if (searchTerm) params.set('search', searchTerm);
      params.set('sort', sortBy);
      params.set('page', page);
      params.set('limit', '50');

      const { data } = await axios.get(`${API}?${params}`, { headers });
      setTotalCount(data.total || 0);

      await Promise.all([
        fetchSection('/continue-reading', setContinueReading),
        fetchSection('/recommended', setRecommended),
        fetchSection('/saved', setFavorites)
      ]);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socket.on('connect_error', () => {});
    socket.on('new_resource', () => fetchAll());
    socket.on('resource:updated', () => fetchAll());
    socket.on('resource:deleted', () => fetchAll());
    socket.on('resource_downloaded', () => fetchAll());
    socket.on('resource_bookmarked', () => fetchAll());
    socket.on('resource_rated', () => fetchAll());
    socket.on('resource_shared', () => fetchAll());
    return () => socket.disconnect();
  }, [selectedCategory, selectedFileType, searchTerm, sortBy, page]);

  const handleBookmark = async (id) => {
    try {
      await axios.put(`${API}/${id}/bookmark`, {}, { headers });
      fetchAll();
    } catch {}
  };

  const handleDownload = async (id) => {
    try {
      await axios.put(`${API}/${id}/download`, {}, { headers });
      fetchAll();
    } catch {}
  };

  const handleShare = async (id) => {
    try {
      await axios.post(`${API}/${id}/share`, {}, { headers });
      fetchAll();
    } catch {}
  };

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        {/* Hero Card */}
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#1a0a3e] p-8 md:p-12 shadow-2xl shadow-indigo-900/20 border border-white/[0.06]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-8 right-12 w-20 h-20 rounded-full bg-purple-500/10 blur-xl" />
            <motion.div animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-8 left-12 w-28 h-28 rounded-full bg-indigo-500/10 blur-xl" />
            <motion.div animate={{ x: [0, 20, 0], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-blue-400/10 blur-lg" />
            <div className="absolute top-6 right-8 opacity-[0.04]"><BookOpen className="w-32 h-32 text-white" /></div>
            <div className="absolute bottom-4 right-20 opacity-[0.03]"><GraduationCap className="w-24 h-24 text-white" /></div>
          </div>
          <div className="absolute top-4 right-4 w-32 h-32 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm" />
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col items-center text-center">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-white/[0.1] flex items-center justify-center mb-4 backdrop-blur-sm">
              <GraduationCap className="w-7 h-7 text-indigo-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Academic Resource Hub</h1>
            <p className="text-sm md:text-base text-white/60 max-w-xl">Discover, learn, and grow with premium academic resources.</p>
            <div className="flex items-center gap-3 mt-5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-xs font-medium text-white/70">{totalCount} resources</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search resources..." value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select value={selectedFileType} onChange={e => setSelectedFileType(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 appearance-none cursor-pointer">
              <option value="">All Types</option>
              {fileTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 appearance-none cursor-pointer">
              {sortOptions.map(so => <option key={so.value} value={so.value}>{so.label}</option>)}
            </select>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                {categories.map(cat => (
                  <motion.button key={cat} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedCategory(cat); setPage(1); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${selectedCategory === cat ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-200 hover:text-purple-600'}`}
                  >{cat}</motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="space-y-8">

          <SectionRow title="Continue Reading" icon={BookOpen} iconColor="bg-emerald-50"
            resources={continueReading} loading={loading}
            onBookmark={handleBookmark} onDownload={handleDownload} onShare={handleShare} userId={token} />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-50">
                <Heart className="w-4 h-4 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Recommended for You</h3>
              {recommended.length > 0 && (
                <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">{recommended.length}</span>
              )}
            </div>
            <div className="space-y-3">
              {recommended.map(resource => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  onBookmark={handleBookmark}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  userId={token}
                />
              ))}
            </div>
          </div>

          <SectionRow title="Your Favorites" icon={BookmarkCheck} iconColor="bg-purple-50"
            resources={favorites} loading={loading}
            onBookmark={handleBookmark} onDownload={handleDownload} onShare={handleShare} userId={token} />

          {!loading && !continueReading?.length && !recommended?.length && !favorites?.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/40 rounded-3xl border border-dashed border-gray-200"
            >
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-1">No resources yet</h3>
              <p className="text-sm text-gray-400">Resources will appear here once you start using the hub</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
