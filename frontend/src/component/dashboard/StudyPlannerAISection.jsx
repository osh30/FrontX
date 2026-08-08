import { API_URL } from '../../config/api';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = API_URL;

const formatDate = (d) => {
  if (!d) return 'Unknown date';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const stripHtml = (str = '') => str.replace(/<[^>]*>/g, ' ');

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 ${className || ''}`} />
);

const SectionSkeleton = ({ variant }) => {
  if (variant === 'topics') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonBlock key={i} className="h-14" />)}
      </div>
    );
  }
  if (variant === 'books') {
    return (
      <div className="flex gap-5 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-[280px] shrink-0">
            <SkeletonBlock className="h-40 rounded-2xl" />
            <SkeletonBlock className="h-4 mt-3 w-3/4" />
            <SkeletonBlock className="h-4 mt-2 w-1/2" />
            <SkeletonBlock className="h-16 mt-3" />
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'videos') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <SkeletonBlock className="h-28 rounded-2xl" />
            <SkeletonBlock className="h-4 mt-3 w-3/4" />
            <SkeletonBlock className="h-4 mt-2 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => <SkeletonBlock key={i} className="h-24" />)}
    </div>
  );
};

const SectionError = ({ label }) => (
  <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
    <p className="text-sm font-semibold text-red-600">{label} could not be loaded.</p>
    <p className="text-xs text-red-400 mt-1">The rest of your AI resources are still available.</p>
  </div>
);

const SectionEmpty = ({ label }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-white/40 p-8 text-center">
    <p className="text-sm text-gray-500">No {label} available for this course yet.</p>
  </div>
);

const SectionCard = ({ title, subtitle, children }) => (
  <div className="mb-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg shadow-blue-900/5 overflow-hidden">
    <div className="p-5 md:p-6 border-b border-white/60 bg-gradient-to-r from-white/70 to-indigo-50/30">
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
    <div className="p-5 md:p-6">{children}</div>
  </div>
);

/* ───────────────── 1. IMPORTANT TOPICS ───────────────── */
const TopicsSection = ({ loading, topics, status }) => {
  const [open, setOpen] = useState(null);

  if (loading) return <SectionSkeleton variant="topics" />;
  if (!topics || topics.length === 0) {
    return status === 'rejected' ? <SectionError label="Important Topics" /> : <SectionEmpty label="important topics" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {topics.map((t, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="col-span-1"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className={`w-full text-left px-4 py-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
                isOpen
                  ? 'border-indigo-300 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-xl shadow-blue-900/20'
                  : 'border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                isOpen ? 'bg-white/15 text-amber-300 border border-white/10' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {i + 1}
              </span>
              <span className={`flex-1 text-sm font-semibold ${isOpen ? 'text-white' : 'text-gray-800'}`}>
                {t.topic}
              </span>
              <span className={`text-[10px] font-semibold shrink-0 ${isOpen ? 'text-amber-300' : 'text-gray-400'}`}>
                {isOpen ? 'Hide' : 'Details'}
              </span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-2xl bg-white border border-indigo-100 p-4 shadow-sm">
                    <p className="text-sm text-gray-600 leading-relaxed">{t.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ───────────────── 2. RECOMMENDED BOOKS ───────────────── */
const BookCard = ({ book }) => (
  <div className="w-[290px] shrink-0 snap-start bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <div className="relative h-44 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center p-4">
      {book.thumbnail && (
        <img src={book.thumbnail} alt={book.title} loading="lazy"
          className="h-full max-w-full object-contain rounded-lg shadow-lg drop-shadow-lg" />
      )}
      <span className="absolute top-3 right-3 px-2 py-1 bg-white/15 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 rounded-lg">
        BOOK
      </span>
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">{book.title}</h4>
      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{book.authors?.join(', ') || 'Unknown Author'}</p>
      <div className="flex items-center gap-1.5 mt-2">
        {book.averageRating ? (
          <>
            <span className="text-xs font-bold text-gray-800">{book.averageRating.toFixed(1)}</span>
            {book.ratingCount > 0 && <span className="text-[10px] text-gray-500">({book.ratingCount} ratings)</span>}
          </>
        ) : (
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">No rating</span>
        )}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3">{stripHtml(book.description) || 'No description available.'}</p>
      <div className="mt-auto pt-4 flex gap-2">
        {book.previewLink && (
          <a href={book.previewLink} target="_blank" rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-xl text-[11px] font-semibold text-center hover:bg-indigo-600 transition-colors shadow-sm">
            Preview
          </a>
        )}
        {book.infoLink && (
          <a href={book.infoLink} target="_blank" rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-semibold text-center hover:border-indigo-300 hover:text-indigo-700 transition-colors">
            Google Books
          </a>
        )}
      </div>
    </div>
  </div>
);

const BooksSection = ({ loading, books, status }) => {
  const scrollRef = useRef(null);

  const scrollBy = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 310, behavior: 'smooth' });
  };

  if (loading) return <SectionSkeleton variant="books" />;
  if (!books || books.length === 0) {
    return status === 'rejected' ? <SectionError label="Recommended Books" /> : <SectionEmpty label="recommended books" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">{books.length} books found</p>
        <div className="flex gap-2">
          <button onClick={() => scrollBy(-1)}
            className="px-3 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all text-[10px] font-semibold flex items-center justify-center">
            Prev
          </button>
          <button onClick={() => scrollBy(1)}
            className="px-3 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all text-[10px] font-semibold flex items-center justify-center">
            Next
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
        {books.map((b, i) => <BookCard key={b.id || i} book={b} />)}
      </div>
    </div>
  );
};

/* ───────────────── 3. RECOMMENDED YOUTUBE VIDEOS ───────────────── */
const VideosSection = ({ loading, videos, status }) => {
  if (loading) return <SectionSkeleton variant="videos" />;
  if (!videos || videos.length === 0) {
    return status === 'rejected' ? <SectionError label="Recommended Videos" /> : <SectionEmpty label="recommended videos" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((v, i) => (
        <motion.div
          key={v.videoId || i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <div className="relative aspect-video bg-gray-100">
            {v.thumbnail ? (
              <img src={v.thumbnail} alt={v.title} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]" />
            )}
            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
              VIDEO
            </span>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">{v.title}</h4>
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{v.channelTitle}</p>
            <p className="text-[11px] text-gray-500 mt-1">Published {formatDate(v.publishedAt)}</p>
            <a href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] text-white rounded-xl text-[11px] font-semibold text-center hover:from-red-600 hover:to-rose-600 transition-all shadow-md">
              Watch on YouTube
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* ───────────────── MAIN AI SECTION ───────────────── */
const StudyPlannerAISection = ({ course }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/api/study-planner/courses/${course._id}/ai-resources`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load AI resources');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [course._id]);

  const status = data?.sectionsStatus || {};

  return (
    <section className="mb-8">
      {/* Section hero */}
      <div className="relative overflow-hidden rounded-[24px] p-6 md:p-8 mb-6 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">AI Learning Resources</h2>
            <p className="text-blue-100/70 text-sm mt-0.5">Curated smart resources for {course.courseName}</p>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-blue-100 text-[11px] font-medium rounded-lg">
                Generating
              </span>
            )}
            {!loading && data?.source && (
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-blue-100 text-[11px] font-medium rounded-lg">
                {data.source === 'cache' ? 'Loaded from cache' : 'Freshly generated'}
              </span>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-8 text-center">
          <p className="font-semibold text-red-600 mb-1">Could not load AI Learning Resources</p>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      ) : (
        <>
          <SectionCard title="Important Topics" subtitle="Key interview & job question topics for this course">
            <TopicsSection loading={loading} topics={data?.topics} status={status.topics} />
          </SectionCard>

          <SectionCard title="Recommended Books" subtitle="Hand-picked textbooks and references from Google Books">
            <BooksSection loading={loading} books={data?.books} status={status.books} />
          </SectionCard>

          <SectionCard title="Recommended YouTube Videos" subtitle="High-quality video lessons to master this course">
            <VideosSection loading={loading} videos={data?.videos} status={status.videos} />
          </SectionCard>
        </>
      )}
    </section>
  );
};

export default StudyPlannerAISection;
